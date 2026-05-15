package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"unicode"

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

	// Port from environment
	nginxPort := os.Getenv("NGINX_PORT_EXTERNAL")
	for _, d := range nginxPort {
		if !unicode.IsDigit(d) {
			log.Fatal("Bad nginx port:", nginxPort)
		}
	}
	if nginxPort == "" {
		nginxPort = "8443"
	}
	portNum, err := strconv.Atoi(nginxPort)
	if err != nil || (portNum < 1 || portNum > 1<<16-1) {
		log.Fatal("Bad nginx port:", nginxPort)
	}

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			fmt.Sprintf("https://localhost:%v", nginxPort),
			fmt.Sprintf("https://127.0.0.1:%v", nginxPort),
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
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

	// Friendships
	router.GET("/api/friendships", middleware.Authentication(), handlers.GetFriendships)
	router.POST("/api/friendships", middleware.Authentication(), handlers.CreateFriendRequest)
	router.PATCH("/api/friendships/:id", middleware.Authentication(), handlers.AcceptFriendRequest)

	if err := router.RunTLS(":8443", "/certs/backend.crt", "/certs/backend.key"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
