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
	Id            string    `json:"id"           db:"id"`
	Email         string    `json:"email"        db:"email"`
	Password_hash string    `json:"-"            db:"password_hash"`
	Name          string    `json:"name"         db:"name"`
	Display_name  string    `json:"display_name" db:"display_name"`
	Avatar_url    string    `json:"avatar_url"   db:"avatar_url"`
	Created_at    time.Time `json:"created_at"   db:"created_at"`
	Updated_at    time.Time `json:"updated_at"   db:"updated_at"`
	Last_seen     time.Time `json:"last_seen"    db:"last_seen"`
	Is_online     bool      `json:"is_online"` // has no db: tag! it's computed in Go before sending JSON.
	Roles         []string  `json:"roles"        db:"roles"`
}

// Recipe is the write/request shape: what we persist and what clients send on
// POST/PUT. The author is identified by Author_id only — never trust an author
// object from a request body.
type Recipe struct {
	Id                   string    `json:"id"                   db:"id"`
	Author_id            string    `json:"author_id"            db:"author_id"`
	Title                string    `json:"title"                db:"title"`
	Description          string    `json:"description"          db:"description"`
	Preparation_time_min int       `json:"preparation_time_min" db:"preparation_time_min"`
	Servings             int       `json:"servings"             db:"servings"`
	Difficulty           string    `json:"difficulty"           db:"difficulty"`
	Cuisine              string    `json:"cuisine"              db:"cuisine"`
	Meal_type            string    `json:"meal_type"            db:"meal_type"`
	Image_url            string    `json:"image_url"            db:"image_url"`
	Calories             int       `json:"calories"             db:"calories"`
	Protein_g            float64   `json:"protein_g"            db:"protein_g"`
	Carbs_g              float64   `json:"carbs_g"              db:"carbs_g"`
	Fat_g                float64   `json:"fat_g"                db:"fat_g"`
	Created_at           time.Time `json:"created_at"           db:"created_at"`
	Updated_at           time.Time `json:"updated_at"           db:"updated_at"`
}

// RecipeAuthor is a denormalized snapshot of the author fields the recipe UI
// needs, joined in at read time so the frontend does not have to make a second
// request to /api/users/:id just to render a card.
type RecipeAuthor struct {
	Id           string `json:"id"`
	Display_name string `json:"display_name"`
	Avatar_url   string `json:"avatar_url"`
}

// RecipeResponse is the read shape returned by GET /api/recipes and
// GET /api/recipes/:id. It carries the author as a nested object instead of a
// raw author_id.
type RecipeResponse struct {
	Id                   string       `json:"id"`
	Author               RecipeAuthor `json:"author"`
	Title                string       `json:"title"`
	Description          string       `json:"description"`
	Preparation_time_min int          `json:"preparation_time_min"`
	Servings             int          `json:"servings"`
	Difficulty           string       `json:"difficulty"`
	Cuisine              string       `json:"cuisine"`
	Meal_type            string       `json:"meal_type"`
	Image_url            string       `json:"image_url"`
	Calories             int          `json:"calories"`
	Protein_g            float64      `json:"protein_g"`
	Carbs_g              float64      `json:"carbs_g"`
	Fat_g                float64      `json:"fat_g"`
	Created_at           time.Time    `json:"created_at"`
	Updated_at           time.Time    `json:"updated_at"`
}

type SearchRecipeFilters struct {
	Query      string `form:"q"`
	Page       int    `form:"page"`
	MealType   string `form:"meal_type"`
	Date       string `form:"date"`
	Difficulty string `form:"difficulty"`
	Cuisine    string `form:"cuisine"`
}

type SearchRecipeResponse struct {
	Id                   string `json:"id"`
	Title                string `json:"title"`
	Preparation_time_min int    `json:"preparation_time_min"`
	Image_url            string `json:"image_url"`
}

type CreateUserRequest struct {
	Email        string `json:"email"        binding:"required"`
	Password     string `json:"password"     binding:"required,min=8,max=20"`
	Name         string `json:"name"         binding:"omitempty,min=2,max=50"`
	Display_name string `json:"display_name" binding:"required,min=3,max=15"`
}

type CreateUserParams struct {
	Email           string `json:"email"`
	Password_hashed string `json:"-"`
	Name            string `json:"name"`
	Display_name    string `json:"display_name"`
}

type LoginUserRequest struct {
	Email    string `json:"email"    binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdateUserRequest struct {
	Email        *string  `json:"email,omitempty"        binding:"omitempty"`
	Name         *string  `json:"name,omitempty"         binding:"omitempty,min=2,max=50"`
	Password     *string  `json:"password,omitempty"     binding:"omitempty,min=8,max=20"`
	Display_name *string  `json:"display_name,omitempty" binding:"omitempty,min=3,max=15"`
	Avatar_url   *string  `json:"avatar_url,omitempty"   binding:"omitempty,url,max=255"`
	Roles        []string `json:"roles,omitempty"        binding:"omitempty,dive,required"`
}

type UpdateUserParams struct {
	Email           *string  `json:"email,omitempty"`
	Name            *string  `json:"name,omitempty"`
	Password_hashed *string  `json:"-"`
	Display_name    *string  `json:"display_name,omitempty"`
	Avatar_url      *string  `json:"avatar_url,omitempty"`
	Roles           []string `json:"roles,omitempty"`
}

type UserSearchResult struct {
	Id           string `json:"id"`
	Display_name string `json:"display_name"`
}
