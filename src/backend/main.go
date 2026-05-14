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

	/* INITIALIZATION ------------------------------------------------------- */

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
	integrations.InitGoogleOAuth()
	integrations.InitCloudinary(cfg)

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
	if err != nil || (portNum < 1 || portNum > (1<<16)-1) {
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

	pgRepo := repository.NewPostgresRecipeRepo(repository.Pool)
	recipeHandler := handlers.NewRecipeHandler(pgRepo)

	/* ROUTES --------------------------------------------------------------- */

	// Users
	router.GET("/api/users", handlers.GetUsers)
	router.GET("/api/users/me", middleware.Authentication(), handlers.GetMe)
	router.GET("/api/users/avatar",
		middleware.Authentication(),
		handlers.UserAvatarSignature)
	router.GET("/api/users/search",
		middleware.Authentication(),
		handlers.SearchUser)
	router.GET("/api/users/:id", handlers.GetUserById)

	router.POST("/api/users", handlers.CreateUser)

	router.PUT("/api/users/me/heartbeat", // Heartbeat - update server state
		middleware.Authentication(),
		handlers.Heartbeat)
	router.PUT("/api/users/:id", middleware.Authentication(), handlers.UpdateUser)

	router.DELETE("/api/users/:id", middleware.Authentication(), handlers.DeleteUser)

	// Recipes
	router.GET("/api/recipes", recipeHandler.GetAllRecipes)
	router.GET("/api/recipes/image-signature",
		middleware.Authentication(),
		middleware.RequirePermission(authorization.PermCreateRecipe),
		recipeHandler.RecipeImageSignature)
	router.GET("/api/recipes/search", recipeHandler.SearchRecipes)
	router.GET("/api/recipes/:id", recipeHandler.GetRecipeById)

	router.POST("/api/recipes",
		middleware.Authentication(),
		middleware.RequirePermission(authorization.PermCreateRecipe),
		recipeHandler.CreateRecipe)

	router.PUT("/api/recipes/:id", middleware.Authentication(), recipeHandler.UpdateRecipe)

	router.DELETE("/api/recipes/:id", middleware.Authentication(), recipeHandler.DeleteRecipe)

	// Authentication
	router.GET("/api/auth/session", handlers.GetSession)
	router.GET("/api/auth/google/login", handlers.GoogleLogin)
	router.GET("/api/auth/google/callback", handlers.GoogleCallback)

	router.POST("/api/auth/login", handlers.LoginUser)
	router.POST("/api/auth/logout", middleware.Authentication(), handlers.LogoutUser)

	// Friendships
	router.GET("/api/friendships", middleware.Authentication(), handlers.GetFriendships)
	router.POST("/api/friendships", middleware.Authentication(), handlers.CreateFriendRequest)
	router.PATCH("/api/friendships/:id", middleware.Authentication(), handlers.AcceptFriendRequest)
	router.DELETE("/api/friendships/:id", middleware.Authentication(), handlers.DeleteFriendship)

	/*--------------Public API endpoints------------*/
	publicAPI := router.Group("/api/v1")
	publicAPI.Use(middleware.APIKeyAuthenticator())
	publicAPI.Use(middleware.RateLimiter(1, 5))
	{
		publicAPI.GET("/recipes", handlers.GetAllRecipes)
		publicAPI.GET("/recipes/:id", handlers.GetRecipeById)
		publicAPI.POST("/recipes", handlers.CreateRecipe)
		publicAPI.PUT("/recipes/:id", handlers.UpdateRecipe)
		publicAPI.DELETE("/recipes/:id", handlers.DeleteRecipe)
	}

	/* ---------------------------------------------------------------------- */

	if err := router.RunTLS(":8443", "/certs/backend.crt", "/certs/backend.key"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
