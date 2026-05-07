package main

import (
	"log"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/config"
	"ft_transcendence/backend/handlers"
	"ft_transcendence/backend/integrations"
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

	go authorization.TokenCleanupLoop()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("config load failed:", err)
	}
	authorization.InitJWTSecret(cfg.JWTSecret)
	integrations.InitCloudinary(cfg)

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Users
	router.GET("/api/users", handlers.GetUsers)
	router.GET("/api/users/:id", handlers.GetUserById)
	router.POST("/api/users", handlers.CreateUser)
	router.PUT("/api/users/:id", authorization.AuthMiddleware(), handlers.UpdateUser)
	router.GET("/api/users/avatar",
		authorization.AuthMiddleware(),
		handlers.UserAvatarSignature)
	router.DELETE("/api/users/:id", handlers.DeleteUser)  // not implemented yet
	router.GET("/api/users/search", handlers.SearchUsers) // not implemented yet
	router.POST("/api/users/login", handlers.LoginUser)
	router.GET("/api/users/session", handlers.GetSession)
	router.POST("/api/users/logout", authorization.AuthMiddleware(), handlers.LogoutUser)
	router.GET("/api/users/me", authorization.AuthMiddleware(), handlers.GetMe)

	// Recipes
	router.GET("/api/recipes", handlers.GetAllRecipes)
	router.GET("/api/recipes/:id", handlers.GetRecipeById)
	router.POST("/api/recipes",
		authorization.AuthMiddleware(),
		authorization.RequirePermission(authorization.PermCreateRecipe),
		handlers.CreateRecipe)
	router.GET("/api/recipes/image-signature",
		authorization.AuthMiddleware(),
		authorization.RequirePermission(authorization.PermCreateRecipe),
		handlers.RecipeImageSignature)
	router.PUT("/api/recipes/:id",
		authorization.AuthMiddleware(),
		handlers.UpdateRecipe)
	router.DELETE("/api/recipes/:id",
		authorization.AuthMiddleware(),
		handlers.DeleteRecipe)
	router.POST("/api/recipes/:id/image", handlers.UploadRecipeImage) // not implemented yet

	if err := router.Run("0.0.0.0:8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
