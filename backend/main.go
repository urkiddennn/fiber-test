package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"space/index/fiber/backend/api/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var collection *mongo.Collection

func main() {
	// Load environment variables
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Connect to MongoDB
	MONGODB_URI := os.Getenv("MONGO_URI")
	if MONGODB_URI == "" {
		log.Fatal("MONGO_URI not set in .env")
	}
	clientOptions := options.Client().ApplyURI(MONGODB_URI)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(context.Background())

	// Ping MongoDB to verify connection
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}
	fmt.Println("Connected to MongoDB Atlas")

	// Set up collection
	collection = client.Database("auth").Collection("users")

	// Create unique index on email
	indexModel := mongo.IndexModel{
		Keys:    bson.M{"email": 1},
		Options: options.Index().SetUnique(true),
	}
	_, err = collection.Indexes().CreateOne(context.Background(), indexModel)
	if err != nil {
		log.Fatal("Failed to create email index:", err)
	}
	fmt.Println("Connected successfully!")

	// Initialize Fiber
	app := fiber.New()

	// Setup routes

	handlers.SetupUserRoutes(app, collection)
	// Default route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Welcome to the Auth API"})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Fatal(app.Listen("0.0.0.0:" + port))
}
