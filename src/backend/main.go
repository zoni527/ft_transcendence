// -------------------------------------------------------------------------- //

package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// -------------------------------------------------------------------------- //
// Structs

type user struct {
	Id            string `json:"id"`
	Email         string `json:"email"`
	Password_hash string `json:"password_hash"`
	Name          string `json:"name"`
	Display_name  string `json:"display_name"`
	Created_at    string `json:"created_at"`
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
// Utility functions

// Not used currently, hardcoded IDs for now, would have to be called through main
// (in reality this would be the backends job).
func getIdGenerator() func() uint64 {
	id := uint64(0)
	f := func() uint64 {
		ret := id
		id++
		return ret
	}
	return f
}

// -------------------------------------------------------------------------- //
// Data placeholders, will be fetched from the backend later.

var users = []user{
	{Id: "0", Email: "Margin0@gmail.com", Password_hash: "000", Name: "Marvin0", Display_name: "marV0", Created_at: "now"},
	{Id: "1", Email: "Margin1@gmail.com", Password_hash: "001", Name: "Marvin1", Display_name: "marV1", Created_at: "now"},
	{Id: "2", Email: "Margin2@gmail.com", Password_hash: "002", Name: "Marvin2", Display_name: "marV2", Created_at: "now"},
	{Id: "3", Email: "Margin3@gmail.com", Password_hash: "003", Name: "Marvin3", Display_name: "marV3", Created_at: "now"},
	{Id: "4", Email: "Margin4@gmail.com", Password_hash: "004", Name: "Marvin4", Display_name: "marV4", Created_at: "now"},
	{Id: "5", Email: "Margin5@gmail.com", Password_hash: "005", Name: "Marvin5", Display_name: "marV5", Created_at: "now"},
	{Id: "6", Email: "Margin6@gmail.com", Password_hash: "006", Name: "Marvin6", Display_name: "marV6", Created_at: "now"},
	{Id: "7", Email: "Margin7@gmail.com", Password_hash: "007", Name: "Marvin7", Display_name: "marV7", Created_at: "now"},
	{Id: "8", Email: "Margin8@gmail.com", Password_hash: "008", Name: "Marvin8", Display_name: "marV8", Created_at: "now"},
	{Id: "9", Email: "Margin9@gmail.com", Password_hash: "009", Name: "Marvin9", Display_name: "marV9", Created_at: "now"},
}

var recipes = []recipe{
	{Id: "0", Title: "Recipe0", Description: "Description0"},
	{Id: "1", Title: "Recipe1", Description: "Description1"},
	{Id: "2", Title: "Recipe2", Description: "Description2"},
	{Id: "3", Title: "Recipe3", Description: "Description3"},
	{Id: "4", Title: "Recipe4", Description: "Description4"},
	{Id: "5", Title: "Recipe5", Description: "Description5"},
	{Id: "6", Title: "Recipe6", Description: "Description6"},
	{Id: "7", Title: "Recipe7", Description: "Description7"},
	{Id: "8", Title: "Recipe8", Description: "Description8"},
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
	c.IndentedJSON(http.StatusOK, recipes)
}

// ---- By Id

func getUserById(c *gin.Context) {
	id := c.Param("id")

	for _, u := range users {
		if u.Id == id {
			c.IndentedJSON(http.StatusOK, u)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "user not found"})
}

func getRecipeById(c *gin.Context) {
	id := c.Param("id")

	for _, u := range recipes {
		if u.Id == id {
			c.IndentedJSON(http.StatusOK, u)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "recipe not found"})
}

// -------------------------------------------------------------------------- //
// POST

func postUsers(c *gin.Context) {
	var newUser user

	// Construct user object from received JSON
	if err := c.BindJSON(&newUser); err != nil {
		fmt.Println(err)
		return
	}

	// Field validation
	if newUser.Email == "" ||
		newUser.Name == "" ||
		newUser.Display_name == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"reason":  "empty required field",
		})
		return
	}

	newUser.Id = strconv.Itoa(len(users))       // Id forming
	users = append(users, newUser)              // Adding new user to DB
	c.IndentedJSON(http.StatusCreated, newUser) // Response
}

func postRecipes(c *gin.Context) {
	var newRecipe recipe

	// Construct recipe object from received JSON
	if err := c.BindJSON(&newRecipe); err != nil {
		fmt.Println(err)
		return
	}

	// Field validation
	if newRecipe.Title == "" ||
		newRecipe.Description == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{
			"message": "bad request",
			"reason":  "empty required field",
		})
		return
	}

	newRecipe.Id = strconv.Itoa(len(recipes))     // Id forming
	recipes = append(recipes, newRecipe)          // Adding new recipe to DB
	c.IndentedJSON(http.StatusCreated, newRecipe) // Response
}

// -------------------------------------------------------------------------- //
// PATCH

func patchUsers(c *gin.Context) {
	id := c.Param("id")
	var mod *user

	for _, u := range users {
		if u.Id == id {
			mod = &u
		}
	}

	if mod == nil {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	}

	params := c.Request.URL.Query()
	for k, v := range params {
		switch k {
		case "email":
			mod.Email = v[0]
		case "name":
			mod.Name = v[0]
		case "display_name":
			mod.Display_name = v[0]
		}
	}

	c.IndentedJSON(http.StatusOK, mod)
}

// -------------------------------------------------------------------------- //
