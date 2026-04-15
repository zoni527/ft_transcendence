package models

// Structs live here so both repository/ and handlers/ can import them.
// In Go, a type must start with a CAPITAL letter to be visible
// outside its package. That's why it's "User" not "user".

//  In Go, capitalization controls visibility:
// User (capital) → exported — accessible from other packages
// user (lowercase) → unexported — only usable inside the same package
// This applies to everything: structs, functions, variables, fields. That's why our struct fields are Id, Title, Email — if they were id, title, email, the JSON serializer (which lives in another package) couldn't access them.

import "time"

type User struct {
	Id            string    `json:"id"`
	Email         string    `json:"email"`
	Password_hash string    `json:"-"`
	Name          string    `json:"name"`
	Display_name  string    `json:"display_name"`
	Created_at    time.Time `json:"created_at"`
	Updated_at    time.Time `json:"updated_at"`
	Roles         []string  `json:"roles"`
}

type Recipe struct {
	Id            string    `json:"id"`
	Author_id     string    `json:"author_id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Prep_time_min int       `json:"prep_time_min"`
	Cook_time_min int       `json:"cook_time_min"`
	Servings      int       `json:"servings"`
	Difficulty    string    `json:"difficulty"`
	Cuisine       string    `json:"cuisine"`
	Meal_type     string    `json:"meal_type"`
	Image_url     string    `json:"image_url"`
	Calories      int       `json:"calories"`
	Protein_g     float64   `json:"protein_g"`
	Carbs_g       float64   `json:"carbs_g"`
	Fat_g         float64   `json:"fat_g"`
	Is_published  bool      `json:"is_published"`
	Created_at    time.Time `json:"created_at"`
	Updated_at    time.Time `json:"updated_at"`
}

type CreateUserRequest struct {
	Email 			string 		`json:"email" binding:"required,email"`
	Password 		string 		`json:"password" binding:"required,min=8"`
	Name			string		`json:"name"`
	Display_name	string		`json:"display_name" binding:"required,min=3,max=15"`
}

type CreateUserParams struct {
	Email 			string 		`json:"email"`
	Password_hashed	string 		`json:"-"`
	Name			string		`json:"name"`
	Display_name	string		`json:"display_name"`
}

