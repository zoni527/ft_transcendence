// -------------------------------------------------------------------------- //

package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// -------------------------------------------------------------------------- //
// Structs

type user struct {
	Id            string `json:"id"`
	Email         string `json:"email"`
	Password_hash string `json:"-"`
	Name          string `json:"name"`
	Display_name  string `json:"display_name"`
	Created_at    time.Time `json:"created_at"`
}

type recipe struct {
	Id            string `json:"id"`
	Author_id     string `json:"author_id"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	Prep_time_min int    `json:"prep_time_min"`
	Cook_time_min int    `json:"cook_time_min"`
	Servings      int    `json:"servings"`
	Difficulty    string `json:"difficulty"`
	Cuisine       string `json:"cuisine"`
	Meal_type     string `json:"meal_type"`
	Image_url     string `json:"image_url"`
	Calories      int    `json:"calories"`
	Protein_g     float64 `json:"protein_g"`
	Carbs_g       float64 `json:"carbs_g"`
	Fat_g         float64 `json:"fat_g"`
	Is_published  bool   `json:"is_published"`
	Created_at    string `json:"created_at"`
	Updated_at    string `json:"updated_at"`
}

// -------------------------------------------------------------------------- //

func main() {
	fmt.Println("ft_transcendence")

	// Connect to PostgreSQL - Lily' testing
	err := ConnectDB()
	if err != nil {
		fmt.Println("Database connection failed:", err)
		return
	}
	defer CloseDB()
	///connnect db ends here

	port := 8080
	argc := len(os.Args)
	switch {
	case argc >= 2:
		port, err = strconv.Atoi(os.Args[1])
	default:
	}
	if err != nil {
		fmt.Println(err)
		return
	}

	router := gin.Default()
	router.Use(cors.Default()) // All origins allowed by default

	router.GET("/api/users", getUsers)
	router.GET("/api/users/:id", getUserById)
	router.GET("/api/recipes", getRecipes)
	router.GET("/api/recipes/:id", getRecipeById)

	router.POST("/api/users", postUsers)
	router.POST("/api/recipes", postRecipes)

	router.PATCH("/api/users", patchUsers)

	if err := router.Run("0.0.0.0:" + strconv.Itoa(port)); err != nil {
		fmt.Println(err)
		return
	}
}

// -------------------------------------------------------------------------- //
// GET

// ---- All
// Calling: GetAllUsers() from db.go
func getUsers(c *gin.Context) {
	users, err := GetAllUsers()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, users)
}

func getRecipes(c *gin.Context) {
	// TODO: replace with GetAllRecipes() from db.go
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

// ---- By Id

func getUserById(c *gin.Context) {
	id := c.Param("id")

	user, err := GetUserById(id)
	if err == pgx.ErrNoRows {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	}
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, user)
}

func getRecipeById(c *gin.Context) {
	// TODO: replace with GetRecipeById() from db.go
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

// -------------------------------------------------------------------------- //
// POST

func postUsers(c *gin.Context) {
	// TODO: replace with CreateUser() from db.go
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

func postRecipes(c *gin.Context) {
	// TODO: replace with CreateRecipe() from db.go
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

// -------------------------------------------------------------------------- //
// PATCH

func patchUsers(c *gin.Context) {
	// TODO: replace with UpdateUser() from db.go
	c.IndentedJSON(http.StatusOK, gin.H{"message": "not implemented yet"})
}

// -------------------------------------------------------------------------- //
