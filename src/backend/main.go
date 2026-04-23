package main

import (
	"log"
	"time"

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

	handlers.LoadJWTSecret()
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Users
	router.GET("/api/users", handlers.GetUsers)
	router.GET("/api/users/:id", handlers.GetUserById)
	router.POST("/api/users", handlers.CreateUser)
	router.PUT("/api/users/:id", handlers.UpdateUser)     // not implemented yet
	router.PATCH("/api/users/:id", handlers.PatchUser)    // not implemented yet
	router.DELETE("/api/users/:id", handlers.DeleteUser)  // not implemented yet
	router.GET("/api/users/search", handlers.SearchUsers) // not implemented yet
	router.POST("/api/users/login", handlers.LoginUser)
	router.GET("/api/users/me", handlers.AuthMiddleware(), handlers.GetMe)

	// Recipes
	router.GET("/api/recipes", handlers.GetAllRecipes)
	router.GET("/api/recipes/:id", handlers.GetRecipeById)
	router.POST("/api/recipes", handlers.CreateRecipe)
	router.PUT("/api/recipes/:id", handlers.UpdateRecipe)             // not implemented yet
	router.PATCH("/api/recipes/:id", handlers.PatchRecipe)            // not implemented yet
	router.DELETE("/api/recipes/:id", handlers.DeleteRecipe)          // not implemented yet
	router.POST("/api/recipes/:id/image", handlers.UploadRecipeImage) // not implemented yet

	if err := router.Run("0.0.0.0:8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
