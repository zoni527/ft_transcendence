package main

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"ft_transcendence/backend/repository"
	"ft_transcendence/backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
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
	router.POST("/api/users", handlers.PostUser)
	router.PATCH("/api/users", handlers.PatchUser)

	// Recipes
	router.GET("/api/recipes", handlers.GetAllRecipes)
	router.GET("/api/recipes/:id", handlers.GetRecipeById)
	router.POST("/api/recipes", handlers.PostRecipe)

	if err := router.Run("0.0.0.0:" + strconv.Itoa(port)); err != nil {
		fmt.Println(err)
		return
	}
}
