package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"ft_transcendence/backend/authorization"
	"ft_transcendence/backend/errorhandling"
	"ft_transcendence/backend/models"
	"ft_transcendence/backend/services"
)

type PublicRecipeHandler struct {
	svc services.RecipeService
}

func NewPublicRecipeHandler(svc services.RecipeService) *PublicRecipeHandler {
	return &PublicRecipeHandler{svc: svc}
}

func (h *PublicRecipeHandler) GetAllRecipes(c *gin.Context) {
	recipes, err := h.svc.ListPublicRecipes(c.Request.Context())
	if err != nil {
		errorhandling.Respond(c, "GetAllRecipes", err)
		return
	}
	c.JSON(http.StatusOK, recipes)
}

func (h *PublicRecipeHandler) GetRecipeByID(c *gin.Context) {
	functionName := "GetRecipeByID"
	id := c.Param("id")
	if !authorization.IsValidUUID(id) {
		errorhandling.Respond(c, functionName, errorhandling.NotFoundRecipe())
		return
	}
	recipe, err := h.svc.GetPublicRecipe(c.Request.Context(), id)
	if err != nil {
		errorhandling.Respond(c, functionName, err)
		return
	}
	c.JSON(http.StatusOK, recipe)
}

func (h *PublicRecipeHandler) CreateRecipe(c *gin.Context) {
	functionName := "CreateRecipe"
	var r models.Recipe
	if err := c.ShouldBindJSON(&r); err != nil {
		err := errorhandling.BadRequest(errorhandling.RecipeBindingError, "invalid input data")
		errorhandling.Respond(c, functionName, err)
		return
	}

	id := c.GetString("userID")
	if !authorization.IsValidUUID(id) {
		errorhandling.Respond(c, functionName, errorhandling.UnauthorizedUser())
		return
	}
	r.AuthorID = id
	if err := validateRecipeFields(&r); err != nil {
		err := errorhandling.BadRequest(errorhandling.RecipeBadField, err.Error())
		errorhandling.Respond(c, functionName, err)
		return
	}
	recipeID, err := h.svc.CreateRecipe(c.Request.Context(), r.AuthorID, r)
	if err != nil {
		errorhandling.Respond(c, functionName, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": recipeID})
}

func (h *PublicRecipeHandler) UpdateRecipe(c *gin.Context) {
	functionName := "UpdateRecipe"
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		errorhandling.Respond(c, functionName, errorhandling.UnauthorizedUser())
		return
	}
	recipeID := c.Param("id")
	if !authorization.IsValidUUID(recipeID) {
		errorhandling.Respond(c, functionName, errorhandling.NotFoundRecipe())
		return
	}
	var r models.Recipe
	if err := c.ShouldBindJSON(&r); err != nil {
		err := errorhandling.BadRequest(errorhandling.RecipeBindingError, "invalid input data")
		errorhandling.Respond(c, functionName, err)
		return
	}
	if err := validateRecipeFields(&r); err != nil {
		err := errorhandling.BadRequest(errorhandling.RecipeDataInvalid, err.Error())
		errorhandling.Respond(c, functionName, err)
		return
	}
	err := h.svc.UpdateRecipe(c.Request.Context(), userID, recipeID, r)
	if err != nil {
		if errors.Is(err, services.ErrForbidden) {
			err := errorhandling.Forbidden(errorhandling.RecipeCantEdit, "forbidden")
			errorhandling.Respond(c, functionName, err)
			return
		}
		errorhandling.Respond(c, "handlers.UpdateRecipe", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": recipeID})
}

func (h *PublicRecipeHandler) DeleteRecipe(c *gin.Context) {
	functionName := "DeleteRecipe"
	userID := c.GetString("userID")
	if !authorization.IsValidUUID(userID) {
		errorhandling.Respond(c, functionName, errorhandling.UnauthorizedUser())
		return
	}
	recipeID := c.Param("id")
	if !authorization.IsValidUUID(recipeID) {
		errorhandling.Respond(c, functionName, errorhandling.NotFoundRecipe())
		return
	}
	if err := h.svc.DeleteRecipe(c.Request.Context(), userID, recipeID); err != nil {
		if errors.Is(err, services.ErrForbidden) {
			err := errorhandling.Forbidden(errorhandling.RecipeCantDelete, "forbidden")
			errorhandling.Respond(c, functionName, err)
			return
		}
		errorhandling.Respond(c, "handlers.DeleteRecipe", err)
		return
	}
	c.Status(http.StatusNoContent)
}
