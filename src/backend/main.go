package main

import (
	"fmt"
	"os"
	"strconv"

	"ft_transcendence/backend/handlers"
	"ft_transcendence/backend/repository"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("ft_transcendence")

	err := repository.ConnectPool()
	if err != nil {
		fmt.Println("Database connection failed:", err)
		return
	}
	defer repository.ClosePool()

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
	router.Use(cors.Default())

	// Users
	router.GET("/api/users", handlers.GetUsers)
	router.GET("/api/users/:id", handlers.GetUserById)
	router.POST("/api/users", handlers.CreateUser)
	router.PATCH("/api/users", handlers.UpdateUser)

	// Recipes
	router.GET("/api/recipes", handlers.GetAllRecipes)
	router.GET("/api/recipes/:id", handlers.GetRecipeById)
	router.POST("/api/recipes", handlers.CreateRecipe)

	if err := router.Run("0.0.0.0:" + strconv.Itoa(port)); err != nil {
		fmt.Println(err)
		return
	}
}
