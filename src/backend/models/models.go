package models

// Structs live here so both repository/ and handlers/ can import them.
// In Go, a type must start with a CAPITAL letter to be visible
// outside its package. That's why it's "User" not "user".

//  In Go, capitalization controls visibility:
// User (capital) → exported — accessible from other packages
// user (lowercase) → unexported — only usable inside the same package
// This applies to everything: structs, functions, variables, fields. That's why our struct fields are ID, Title, Email — if they were id, title, email, the JSON serializer (which lives in another package) couldn't access them.

import "time"

type User struct {
	ID           string    `json:"id"           db:"id"`
	Email        string    `json:"email"        db:"email"`
	PasswordHash string    `json:"-"            db:"password_hash"`
	Name         string    `json:"name"         db:"name"`
	DisplayName  string    `json:"display_name" db:"display_name"`
	AvatarURL    string    `json:"avatar_url"   db:"avatar_url"`
	CreatedAt    time.Time `json:"created_at"   db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"   db:"updated_at"`
	LastSeen     time.Time `json:"last_seen"    db:"last_seen"`
	IsOnline     bool      `json:"is_online"` // has no db: tag! it's computed in Go before sending JSON.
	Roles        []string  `json:"roles"        db:"roles"`
}

// Recipe is the write/request shape: what we persist and what clients send on
// POST/PUT. The author is identified by AuthorID only — never trust an author
// object from a request body.
type Recipe struct {
	ID                 string    `json:"id"                   db:"id"`
	AuthorID           string    `json:"author_id"            db:"author_id"`
	Title              string    `json:"title"                db:"title"`
	Description        string    `json:"description"          db:"description"`
	PreparationTimeMin int       `json:"preparation_time_min" db:"preparation_time_min"`
	Servings           int       `json:"servings"             db:"servings"`
	Difficulty         string    `json:"difficulty"           db:"difficulty"`
	Cuisine            string    `json:"cuisine"              db:"cuisine"`
	MealType           string    `json:"meal_type"            db:"meal_type"`
	ImageURL           string    `json:"image_url"            db:"image_url"`
	Calories           int       `json:"calories"             db:"calories"`
	ProteinGrams       float64   `json:"protein_g"            db:"protein_g"`
	CarbsGrams         float64   `json:"carbs_g"              db:"carbs_g"`
	FatGrams           float64   `json:"fat_g"                db:"fat_g"`
	CreatedAt          time.Time `json:"created_at"           db:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"           db:"updated_at"`
}

// RecipeAuthor is a denormalized snapshot of the author fields the recipe UI
// needs, joined in at read time so the frontend does not have to make a second
// request to /api/users/:id just to render a card.
type RecipeAuthor struct {
	ID          string `json:"id"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
}

// RecipeResponse is the read shape returned by GET /api/recipes and
// GET /api/recipes/:id. It carries the author as a nested object
type RecipeResponse struct {
	ID                 string       `json:"id"`
	Author             RecipeAuthor `json:"author"`
	Title              string       `json:"title"`
	Description        string       `json:"description"`
	PreparationTimeMin int          `json:"preparation_time_min"`
	Servings           int          `json:"servings"`
	Difficulty         string       `json:"difficulty"`
	Cuisine            string       `json:"cuisine"`
	MealType           string       `json:"meal_type"`
	ImageURL           string       `json:"image_url"`
	Calories           int          `json:"calories"`
	ProteinGrams       float64      `json:"protein_g"`
	CarbsGrams         float64      `json:"carbs_g"`
	FatGrams           float64      `json:"fat_g"`
	CreatedAt          time.Time    `json:"created_at"`
	UpdatedAt          time.Time    `json:"updated_at"`
}

type SearchRecipeFilters struct {
	Query      string `form:"q"`
	Page       int    `form:"page"`
	Difficulty string `form:"difficulty"`
	MealType   string `form:"meal_type"`
	Date       string `form:"date"`
}

type SearchRecipeResponse struct {
	ID                 string `json:"id"`
	Title              string `json:"title"`
	PreparationTimeMin int    `json:"preparation_time_min"`
	ImageURL           string `json:"image_url"`
}

type CreateUserRequest struct {
	Email       string `json:"email"        binding:"required,min=5,max=254"`
	Password    string `json:"password"     binding:"required,min=8,max=72"`
	Name        string `json:"name"         binding:"omitempty,min=2,max=50"`
	DisplayName string `json:"display_name" binding:"required,min=3,max=30"`
}

type CreateUserParams struct {
	Email          string `json:"email"`
	PasswordHashed string `json:"-"`
	Name           string `json:"name"`
	DisplayName    string `json:"display_name"`
}

type LoginUserRequest struct {
	Email    string `json:"email"    binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdateUserRequest struct {
	Email       *string  `json:"email,omitempty"        binding:"omitempty,min=5,max=254"`
	Name        *string  `json:"name,omitempty"         binding:"omitempty,min=2,max=50"`
	Password    *string  `json:"password,omitempty"     binding:"omitempty,min=8,max=72"`
	DisplayName *string  `json:"display_name,omitempty" binding:"omitempty,min=3,max=30"`
	AvatarURL   *string  `json:"avatar_url,omitempty"   binding:"omitempty,url,max=255"`
	Roles       []string `json:"roles,omitempty"        binding:"omitempty,dive,required"`
}

type UpdateUserParams struct {
	Email          *string  `json:"email,omitempty"`
	Name           *string  `json:"name,omitempty"`
	PasswordHashed *string  `json:"-"`
	DisplayName    *string  `json:"display_name,omitempty"`
	AvatarURL      *string  `json:"avatar_url,omitempty"`
	Roles          []string `json:"roles,omitempty"`
}

type UserSearchResult struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
}

// IsOnline is a pointer so it can be omitted from the JSON for pending rows
// (sent/incoming buckets) and only appear on accepted/friends.
type FriendshipListItem struct {
	Status      string    `json:"-"                    db:"status"`
	SentByMe    bool      `json:"-"                    db:"sent_by_me"`
	LastSeen    time.Time `json:"-"                    db:"last_seen"`
	ID          string    `json:"id"                   db:"id"`
	DisplayName string    `json:"display_name"         db:"display_name"`
	Name        string    `json:"name"                 db:"name"`
	IsOnline    *bool     `json:"is_online,omitempty"`
}

// this is the body of GET /api/friendships.
type FriendshipsResponse struct {
	Friends  []FriendshipListItem `json:"friends"`
	Sent     []FriendshipListItem `json:"sent"`
	Incoming []FriendshipListItem `json:"incoming"`
}

// Body of POST /api/friendships. The requester is taken from the JWT, so the
// client only sends the target user's id.
type CreateFriendRequestBody struct {
	ReceiverID string `json:"receiver_id" binding:"required"`
}

type GoogleUser struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Picture       string `json:"picture"`
}
