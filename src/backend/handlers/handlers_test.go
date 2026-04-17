package handlers

import (
	"strings"
	"testing"

	"ft_transcendence/backend/models"
)

var goodTestRecipes = []models.Recipe{
	{
		Title:         "Max prep time",
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Prep_time_min: PREP_TIME_MAX,
	},
	{
		Title:         "Max cook time",
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Cook_time_min: COOK_TIME_MAX,
	},
	{
		Title:      "Max servings",
		Servings:   SERVINGS_MAX,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      "Max calories",
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
		Calories:   CALORIES_MAX,
	},
	{
		Title:      "Max protein",
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
		Protein_g:  PROTEIN_MAX,
	},
	{
		Title:      "Max carbs",
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
		Carbs_g:    CARBS_MAX,
	},
	{
		Title:      "Max fat",
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
		Fat_g:      FAT_MAX,
	},
	{
		Title:      strings.Repeat("-", TITLE_LEN_MIN),
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      strings.Repeat("-", TITLE_LEN_MAX),
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:       "Max description length",
		Description: strings.Repeat("-", DESCRIPTION_LEN_MAX),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:      "Max cuisine length",
		Cuisine:    strings.Repeat(" ", CUISINE_LEN_MAX),
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      "Max image url length",
		Image_url:  strings.Repeat("-", IMAGE_URL_LEN_MAX),
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
}

var badTestRecipes = []models.Recipe{
	{
		Title:      "No servings",
		Servings:   0,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:         "Prep time too big",
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Prep_time_min: PREP_TIME_MAX + 1,
	},
	{
		Title:         "Negative prep time",
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Prep_time_min: -1,
	},
	{
		Title:         "Cook time too big",
		Servings:      1,
		Difficulty:    "easy",
		Meal_type:     "snack",
		Cook_time_min: COOK_TIME_MAX + 1,
	},
	{
		Title:      "Too many servings",
		Servings:   SERVINGS_MAX + 1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      "Too many calories",
		Calories:   CALORIES_MAX + 1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      "Too much protein",
		Protein_g:  PROTEIN_MAX + 1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      "Too much carbs",
		Carbs_g:    CARBS_MAX + 1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      "Too much fat",
		Fat_g:      FAT_MAX + 1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      "Too much fat",
		Fat_g:      FAT_MAX + 1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      strings.Repeat("-", TITLE_LEN_MIN-1),
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      strings.Repeat("-", TITLE_LEN_MAX+1),
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:       "Description too long",
		Description: strings.Repeat("-", DESCRIPTION_LEN_MAX+1),
		Servings:    1,
		Difficulty:  "easy",
		Meal_type:   "snack",
	},
	{
		Title:      "Cuisine too long",
		Cuisine:    strings.Repeat(" ", CUISINE_LEN_MAX+1),
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
	},
	{
		Title:      "Image url too long",
		Image_url:  strings.Repeat("-", IMAGE_URL_LEN_MAX+1),
		Servings:   1,
		Difficulty: "easy",
		Meal_type:  "snack",
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
		if err := IsValidTitle(&v); err != nil {
			t.Errorf(`IsValidTitle(%#v) = %v, want %v`, v, err, nil)
		}
	}

	for _, v := range badTitles {
		if err := IsValidTitle(&v); err == nil {
			t.Errorf(`IsValidTitle(%#v) = %v, expected error`, v, err)
		}
	}
}
