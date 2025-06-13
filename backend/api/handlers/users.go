package handlers

import (
	"context"
	"space/index/backend/pkg/entities" // Ensure this path is correct for your project
	"sync"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/mojocn/base64Captcha" // Make sure this is imported
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// In-memory store for CAPTCHA. Using DefaultMemStore is generally fine for development/testing,
// but for production, consider a more robust, distributed store (e.g., Redis).
var (
	captchaStore = base64Captcha.DefaultMemStore
	captchaMu    sync.Mutex // Mutex to protect access to captchaStore
)

// SetupUserRoutes sets up user-related routes for your Fiber app.
func SetupUserRoutes(app *fiber.App, collection *mongo.Collection) {
	app.Post("/register", registerHandler(collection))
	app.Post("/login", loginHandler(collection))
	app.Get("/captcha", captchaHandler())
}

// registerHandler handles user registration.
// It parses request body, hashes the password, and inserts a new user into MongoDB.
func registerHandler(collection *mongo.Collection) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			Username string `json:"username"`
		}

		// Parse the request body into the input struct.
		if err := c.BodyParser(&input); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
		}

		// Basic input validation to ensure all required fields are present.
		if input.Email == "" || input.Password == "" || input.Username == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "All fields are required"})
		}

		// Hash the user's password using bcrypt for security.
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
		}

		// Create a new user entity. Ensure entities.NewUser correctly creates an ID.
		user := entities.NewUser(input.Email, string(hashedPassword), input.Username)
		_, err = collection.InsertOne(context.Background(), user)
		if err != nil {
			// Check for duplicate email error (e.g., if email field has a unique index).
			// This is a common error type when inserting a document that violates a unique constraint.
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email already exists or other database error"})
		}

		// Return success response with user details.
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "User registered successfully",
			"user":    user,
		})
	}
}

// loginHandler handles user login and JWT generation.
// It validates credentials, CAPTCHA, and issues a JWT token upon successful login.
func loginHandler(collection *mongo.Collection) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var input struct {
			Email       string `json:"email"`
			Password    string `json:"password"`
			CaptchaID   string `json:"captcha_id"`
			CaptchaCode string `json:"captcha_code"`
		}

		// Parse the request body.
		if err := c.BodyParser(&input); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
		}

		// Validate CAPTCHA. Use a mutex to safely access the captchaStore.
		captchaMu.Lock()
		// The third argument 'true' means the CAPTCHA will be removed from the store after verification.
		if !captchaStore.Verify(input.CaptchaID, input.CaptchaCode, true) {
			captchaMu.Unlock() // Ensure mutex is unlocked before returning on error.
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid CAPTCHA"})
		}
		captchaMu.Unlock() // Unlock after successful CAPTCHA verification.

		// Find the user by email in MongoDB.
		var user entities.User
		err := collection.FindOne(context.Background(), bson.M{"email": input.Email}).Decode(&user)
		if err != nil {
			// If user not found or other database error.
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
		}

		// Compare the provided password with the hashed password stored in the database.
		err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
		if err != nil {
			// Passwords do not match.
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
		}

		// Generate a JSON Web Token (JWT) for the authenticated user.
		token, err := generateJWT(user.ID.Hex()) // user.ID.Hex() converts ObjectId to string.
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
		}

		// Return success response with token and user details.
		return c.JSON(fiber.Map{
			"message": "Login successful",
			"token":   token,
			"user":    user,
		})
	}
}

// captchaHandler generates a new CAPTCHA and returns its ID and base64 image.
// This function uses the 'base64Captcha' library's Driver and Engine pattern.
func captchaHandler() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Configure the digit captcha driver.
		// Params: height, width, length (number of digits), maxSkew (distortion), dotCount (noise).
		driver := base64Captcha.NewDriverDigit(80, 240, 6, 0.7, 80)

		// Create a new CAPTCHA engine with the chosen driver and the in-memory store.
		cEngine := base64Captcha.NewCaptcha(driver, captchaStore)

		// Generate the CAPTCHA. It returns the ID, the base64 encoded image string, and an error.
		captchaID, base64string, _, err := cEngine.Generate()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate CAPTCHA image"})
		}

		// Return the CAPTCHA ID and the base64 image string to the client.
		return c.JSON(fiber.Map{
			"captcha_id": captchaID,
			"captcha":    base64string,
		})
	}
}

// generateJWT creates a JWT for the given user ID.
// The token includes the user ID as 'sub' (subject) and an expiration time.
// IMPORTANT: Replace "your_jwt_secret" with a strong, securely stored secret (e.g., from environment variables).
func generateJWT(userID string) (string, error) {
	// Define the claims for the JWT.
	claims := jwt.MapClaims{
		"sub": userID,                                // Subject of the token (user ID).
		"exp": time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours (Unix timestamp).
	}

	// Create a new token with the HS256 signing method and the defined claims.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with your secret key.
	// For production, this secret should be loaded from environment variables or a configuration service.
	secret := []byte("your_jwt_secret") // <-- CHANGE THIS IN PRODUCTION!
	return token.SignedString(secret)
}
