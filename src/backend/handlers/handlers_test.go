package handlers

import (
	"strings"
	"testing"

	"ft_transcendence/backend/models"
)

var goodTestRecipes = []models.Recipe{
	{
		Title:         "Max prep time",
		Description:   strings.Repeat("-", descriptionLenMin),
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Prep_time_min: prepTimeMax,
	},
	{
		Title:         "Max cook time",
		Description:   strings.Repeat("-", descriptionLenMin),
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Cook_time_min: cookTimeMax,
	},
	{
		Title:       "Max servings",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    servingsMax,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Max calories",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
		Calories:    caloriesMax,
	},
	{
		Title:       "Max protein",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
		Protein_g:   proteinMax,
	},
	{
		Title:       "Max carbs",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
		Carbs_g:     carbsMax,
	},
	{
		Title:       "Max fat",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
		Fat_g:       fatMax,
	},
	{
		Title:       strings.Repeat("-", titleLenMin),
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       strings.Repeat("-", titleLenMax),
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Max description length",
		Description: strings.Repeat("-", descriptionLenMax),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Max cuisine length",
		Description: strings.Repeat("-", descriptionLenMin),
		Cuisine:     strings.Repeat("-", cuisineLenMax),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Max image url length",
		Description: strings.Repeat("-", descriptionLenMin),
		Image_url:   strings.Repeat("-", imageUrlLenMax),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
}

var badTestRecipes = []models.Recipe{
	{
		Title:       "No servings",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    0,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:         "Prep time too big",
		Description:   strings.Repeat("-", descriptionLenMin),
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Prep_time_min: prepTimeMax + 1,
	},
	{
		Title:         "Negative prep time",
		Description:   strings.Repeat("-", descriptionLenMin),
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Prep_time_min: -1,
	},
	{
		Title:         "Cook time too big",
		Description:   strings.Repeat("-", descriptionLenMin),
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Cook_time_min: cookTimeMax + 1,
	},
	{
		Title:         "Negative cook time",
		Description:   strings.Repeat("-", descriptionLenMin),
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Cook_time_min: -1,
	},
	{
		Title:       "Too many servings",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    servingsMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative servings",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Too many calories",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Calories:    caloriesMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative calories",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Calories:    -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Too much protein",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Protein_g:   proteinMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative protein",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Protein_g:   -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Too much carbs",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Carbs_g:     carbsMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative carbs",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Carbs_g:     -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Too much fat",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Fat_g:       fatMax + 1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Negative fat",
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Fat_g:       -1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       strings.Repeat("-", titleLenMin-1),
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       strings.Repeat("-", titleLenMax+1),
		Description: strings.Repeat("-", descriptionLenMin),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Description too long",
		Description: strings.Repeat("-", descriptionLenMax+1),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Cuisine too long",
		Description: strings.Repeat("-", descriptionLenMin),
		Cuisine:     strings.Repeat("-", cuisineLenMax+1),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:       "Image url too long",
		Description: strings.Repeat("-", descriptionLenMin),
		Image_url:   strings.Repeat("-", imageUrlLenMax+1),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
}

var goodTitles = []string{
	"Hamburger",
	"abc",
	"Dal",
	"Smash burger",
	"SUPER TASTY RECIPE!",
	"This too, is a recipe 🍜",
	"🍣🍣🍣",
	"Over 9000",
	"Mom's spaghetti",
}

var badTitles = []string{
	"",
	"a",
	"ab",
	"This title is too long for a title, nobody has time to read all this text I must say",
}

func TestRecipeValidation(t *testing.T) {
	for _, v := range goodTestRecipes {
		if err := ValidateRecipeFields(&v); err != nil {
			t.Errorf(`ValidateRecipeFields(%#v) = %v, want %v`, v, err, nil)
		}
	}

	for _, v := range badTestRecipes {
		if err := ValidateRecipeFields(&v); err == nil {
			t.Errorf(`ValidateRecipeFields(%#v) = %v, expected error`, v, err)
		}
	}
}

func TestTitles(t *testing.T) {
	for _, v := range goodTitles {
		if err := IsValidTitle(v); err != nil {
			t.Errorf(`IsValidTitle(%#v) = %v, want %v`, v, err, nil)
		}
	}

	for _, v := range badTitles {
		if err := IsValidTitle(v); err == nil {
			t.Errorf(`IsValidTitle(%#v) = %v, expected error`, v, err)
		}
	}
}
