package handlers

import (
	"context"
	"space/index/fiber/backend/pkg/entities"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// SetupUserRoutes sets up user-related routes
func SetupUserRoutes(app *fiber.App, collection *mongo.Collection) {
	app.Post("/register", registerHandler(collection))
	app.Post("/login", loginHandler(collection))
}

// registerHandler handles user registration
func registerHandler(collection *mongo.Collection) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			Username string `json:"username"`
		}

		if err := c.BodyParser(&input); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
		}

		// Validate input
		if input.Email == "" || input.Password == "" || input.Username == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "All fields are required"})
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
		}

		// Create user
		user := entities.NewUser(input.Email, string(hashedPassword), input.Username)
		_, err = collection.InsertOne(context.Background(), user)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email already exists"})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "User registered successfully",
			"user":    user,
		})
	}
}

// loginHandler handles user login and JWT generation
func loginHandler(collection *mongo.Collection) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.BodyParser(&input); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
		}

		// Find user by email
		var user entities.User
		err := collection.FindOne(context.Background(), bson.M{"email": input.Email}).Decode(&user)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
		}

		// Check password
		err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
		}

		// Generate JWT
		token, err := generateJWT(user.ID.Hex())
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
		}

		return c.JSON(fiber.Map{
			"message": "Login successful",
			"token":   token,
			"user":    user,
		})
	}
}

// generateJWT creates a JWT for the user
func generateJWT(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := []byte("your_jwt_secret") // Replace with a secure secret from .env
	return token.SignedString(secret)
}
