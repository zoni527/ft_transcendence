package main

import (
	"log"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/config"
	"ft_transcendence/backend/handlers"
	"ft_transcendence/backend/integrations"
	"ft_transcendence/backend/middleware"
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
	router.PUT("/api/users/:id", middleware.Authentication(), handlers.UpdateUser)
	router.GET("/api/users/avatar",
		middleware.Authentication(),
		handlers.UserAvatarSignature)
	router.DELETE("/api/users/:id", handlers.DeleteUser) // not implemented yet
	router.GET("/api/users/search",
		middleware.Authentication(),
		handlers.SearchUser)
	router.POST("/api/users/login", handlers.LoginUser)
	router.GET("/api/users/session", handlers.GetSession)
	router.POST("/api/users/logout", middleware.Authentication(), handlers.LogoutUser)
	router.GET("/api/users/me", middleware.Authentication(), handlers.GetMe)

	//heartbeat - update server state
	router.PUT("/api/users/me/heartbeat",
		middleware.Authentication(),
		handlers.Heartbeat)

	// Recipes
	router.GET("/api/recipes", handlers.GetAllRecipes)
	router.GET("/api/recipes/:id", handlers.GetRecipeById)
	router.POST("/api/recipes",
		middleware.Authentication(),
		middleware.RequirePermission(authorization.PermCreateRecipe),
		handlers.CreateRecipe)
	router.GET("/api/recipes/image-signature",
		middleware.Authentication(),
		middleware.RequirePermission(authorization.PermCreateRecipe),
		handlers.RecipeImageSignature)
	router.PUT("/api/recipes/:id",
		middleware.Authentication(),
		handlers.UpdateRecipe)
	router.DELETE("/api/recipes/:id",
		middleware.Authentication(),
		handlers.DeleteRecipe)
	router.POST("/api/recipes/:id/image", handlers.UploadRecipeImage) // not implemented yet

	if err := router.Run("0.0.0.0:8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
