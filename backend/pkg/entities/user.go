package entities

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password" json:"-"`
	Username  string             `bson:"username" json:"username"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// NewUser creates a new User instance with default values.
func NewUser(email, password, username string) *User {
	now := time.Now()
	return &User{
		ID:        primitive.NewObjectID(),
		Email:     email,
		Password:  password, // Should be hashed before saving
		Username:  username,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
