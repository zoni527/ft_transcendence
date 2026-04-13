package main

import (
	"log"

	"ft_transcendence/backend/handlers"
	"ft_transcendence/backend/repository"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("ft_transcendence")

	err := repository.ConnectPool()
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	defer repository.ClosePool()

	router := gin.Default()
	router.Use(cors.Default())

	// Users
	router.GET("/api/users", handlers.GetUsers)
	router.GET("/api/users/:id", handlers.GetUserById)
	router.POST("/api/users", handlers.CreateUser)
	router.PATCH("/api/users/:id", handlers.UpdateUser)

	// Recipes
	router.GET("/api/recipes", handlers.GetAllRecipes)
	router.GET("/api/recipes/:id", handlers.GetRecipeById)
	router.POST("/api/recipes", handlers.CreateRecipe)

	if err := router.Run("0.0.0.0:8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
