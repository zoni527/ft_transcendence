-- Seed data for testing
-- This file runs automatically on first DB init (after 001_initial_schema.sql)

-- =====================
-- USERS
-- =====================

INSERT INTO "user" (email, password_hash, name, display_name) VALUES
    ('alice@test.com', 'hash001', 'Alice Smith', 'alice'),
    ('bob@test.com', 'hash002', 'Bob Jones', 'bobby'),
    ('charlie@test.com', 'hash003', 'Charlie Brown', 'charlie'),
    ('diana@test.com', 'hash004', 'Diana Prince', 'wonder_di'),
    ('eve@test.com', 'hash005', 'Eve Taylor', 'evee');

-- =====================
-- ROLES & PERMISSIONS
-- =====================

INSERT INTO role (name, description) VALUES
    ('admin',     'Full access — manage users, recipes, roles, and site settings'),
    ('moderator', 'Can review, edit, and delete recipes and comments'),
    ('chef',      'Can create and publish recipes'),
    ('user',      'Default role — can browse, favorite, and comment');

INSERT INTO permission (name, description) VALUES
    ('create_recipe',  'Create new recipes'),
    ('edit_recipe',    'Edit any recipe'),
    ('delete_recipe',  'Delete any recipe'),
    ('publish_recipe', 'Publish/unpublish recipes'),
    ('manage_users',   'View, edit, and delete user accounts'),
    ('manage_roles',   'Assign and remove roles'),
    ('ban_user',       'Ban a user from the platform'),
    ('moderate_content', 'Review and moderate user content');

-- admin gets all permissions
INSERT INTO role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM role r, permission p WHERE r.name = 'admin';

-- moderator permissions
INSERT INTO role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM role r, permission p
    WHERE r.name = 'moderator' AND p.name IN ('edit_recipe', 'delete_recipe', 'publish_recipe', 'moderate_content');

-- chef permissions
INSERT INTO role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM role r, permission p
    WHERE r.name = 'chef' AND p.name IN ('create_recipe', 'publish_recipe');

-- user permissions
INSERT INTO role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM role r, permission p
    WHERE r.name = 'user' AND p.name IN ('create_recipe');

-- Assign roles to seed users
INSERT INTO user_role (user_id, role_id) VALUES
    ((SELECT id FROM "user" WHERE email = 'alice@test.com'),   (SELECT id FROM role WHERE name = 'admin')),
    ((SELECT id FROM "user" WHERE email = 'bob@test.com'),     (SELECT id FROM role WHERE name = 'chef')),
    ((SELECT id FROM "user" WHERE email = 'charlie@test.com'), (SELECT id FROM role WHERE name = 'chef')),
    ((SELECT id FROM "user" WHERE email = 'diana@test.com'),   (SELECT id FROM role WHERE name = 'moderator')),
    ((SELECT id FROM "user" WHERE email = 'eve@test.com'),     (SELECT id FROM role WHERE name = 'user'));

-- =====================
-- INGREDIENT CATEGORIES
-- =====================

INSERT INTO ingredient_category (name, description) VALUES
    ('Dairy', 'Milk, cheese, butter, cream'),
    ('Meat', 'Beef, chicken, pork, lamb'),
    ('Vegetables', 'Fresh and frozen vegetables'),
    ('Grains', 'Pasta, rice, bread, flour'),
    ('Spices', 'Herbs, seasonings, and spices');

-- =====================
-- INGREDIENTS
-- =====================

INSERT INTO ingredient (name, category_id, default_unit) VALUES
    ('Spaghetti',       (SELECT id FROM ingredient_category WHERE name = 'Grains'),     'g'),
    ('Eggs',            (SELECT id FROM ingredient_category WHERE name = 'Dairy'),      'pieces'),
    ('Parmesan',        (SELECT id FROM ingredient_category WHERE name = 'Dairy'),      'g'),
    ('Pancetta',        (SELECT id FROM ingredient_category WHERE name = 'Meat'),       'g'),
    ('Black Pepper',    (SELECT id FROM ingredient_category WHERE name = 'Spices'),     'tsp'),
    ('Chicken Breast',  (SELECT id FROM ingredient_category WHERE name = 'Meat'),       'g'),
    ('Rice',            (SELECT id FROM ingredient_category WHERE name = 'Grains'),     'g'),
    ('Soy Sauce',       (SELECT id FROM ingredient_category WHERE name = 'Spices'),     'tbsp'),
    ('Garlic',          (SELECT id FROM ingredient_category WHERE name = 'Vegetables'), 'cloves'),
    ('Onion',           (SELECT id FROM ingredient_category WHERE name = 'Vegetables'), 'pieces'),
    ('Tomato',          (SELECT id FROM ingredient_category WHERE name = 'Vegetables'), 'pieces'),
    ('Olive Oil',       (SELECT id FROM ingredient_category WHERE name = 'Spices'),     'tbsp');

-- =====================
-- RECIPES
-- =====================

INSERT INTO recipe (author_id, title, description, prep_time_min, cook_time_min, servings, difficulty, cuisine, meal_type, calories, protein_g, carbs_g, fat_g, is_published) VALUES
    ((SELECT id FROM "user" WHERE email = 'alice@test.com'),
     'Pasta Carbonara', 'Classic Roman pasta with eggs, cheese, and pancetta', 10, 20, 4, 'medium', 'Italian', 'dinner', 550, 25.0, 60.0, 22.0, true),
    ((SELECT id FROM "user" WHERE email = 'bob@test.com'),
     'Chicken Fried Rice', 'Quick and easy weeknight fried rice', 15, 15, 2, 'easy', 'Asian', 'dinner', 450, 30.0, 55.0, 12.0, true),
    ((SELECT id FROM "user" WHERE email = 'charlie@test.com'),
     'Garlic Tomato Bruschetta', 'Simple Italian appetizer with fresh tomatoes', 15, 5, 4, 'easy', 'Italian', 'snack', 180, 4.0, 22.0, 8.0, true),
    ((SELECT id FROM "user" WHERE email = 'alice@test.com'),
     'Draft Pasta Salad', 'Work in progress recipe', 20, 10, 6, 'easy', 'Italian', 'lunch', 300, 10.0, 40.0, 12.0, false);

-- =====================
-- RECIPE STEPS
-- =====================

-- Pasta Carbonara steps
INSERT INTO recipe_step (recipe_id, step_number, instruction, timer_seconds) VALUES
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), 1, 'Bring a large pot of salted water to a boil and cook spaghetti according to package directions', 600),
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), 2, 'While pasta cooks, fry pancetta in a pan until crispy', 480),
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), 3, 'Beat eggs with grated parmesan and black pepper in a bowl', NULL),
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), 4, 'Drain pasta, toss with pancetta, then stir in the egg mixture off heat', NULL);

-- Chicken Fried Rice steps
INSERT INTO recipe_step (recipe_id, step_number, instruction, timer_seconds) VALUES
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), 1, 'Dice chicken breast into small cubes and season with soy sauce', NULL),
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), 2, 'Stir-fry chicken in a hot wok until golden', 300),
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), 3, 'Add garlic and onion, cook until fragrant', 120),
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), 4, 'Add cold rice and soy sauce, stir-fry until heated through', 300);

-- Bruschetta steps
INSERT INTO recipe_step (recipe_id, step_number, instruction, timer_seconds) VALUES
    ((SELECT id FROM recipe WHERE title = 'Garlic Tomato Bruschetta'), 1, 'Dice tomatoes and mix with minced garlic, olive oil, and salt', NULL),
    ((SELECT id FROM recipe WHERE title = 'Garlic Tomato Bruschetta'), 2, 'Toast bread slices until golden', 180),
    ((SELECT id FROM recipe WHERE title = 'Garlic Tomato Bruschetta'), 3, 'Top toast with tomato mixture and serve immediately', NULL);

-- =====================
-- RECIPE INGREDIENTS
-- =====================

-- Pasta Carbonara ingredients
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit, sort_order) VALUES
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), (SELECT id FROM ingredient WHERE name = 'Spaghetti'),    400, 'g', 1),
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), (SELECT id FROM ingredient WHERE name = 'Eggs'),         4,   'pieces', 2),
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), (SELECT id FROM ingredient WHERE name = 'Parmesan'),     100, 'g', 3),
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), (SELECT id FROM ingredient WHERE name = 'Pancetta'),     150, 'g', 4),
    ((SELECT id FROM recipe WHERE title = 'Pasta Carbonara'), (SELECT id FROM ingredient WHERE name = 'Black Pepper'), 2,   'tsp', 5);

-- Chicken Fried Rice ingredients
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit, sort_order) VALUES
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), (SELECT id FROM ingredient WHERE name = 'Chicken Breast'), 300, 'g', 1),
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), (SELECT id FROM ingredient WHERE name = 'Rice'),           400, 'g', 2),
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), (SELECT id FROM ingredient WHERE name = 'Soy Sauce'),      3,   'tbsp', 3),
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), (SELECT id FROM ingredient WHERE name = 'Garlic'),          3,   'cloves', 4),
    ((SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'), (SELECT id FROM ingredient WHERE name = 'Onion'),           1,   'pieces', 5);

-- Bruschetta ingredients
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit, sort_order) VALUES
    ((SELECT id FROM recipe WHERE title = 'Garlic Tomato Bruschetta'), (SELECT id FROM ingredient WHERE name = 'Tomato'),    4,   'pieces', 1),
    ((SELECT id FROM recipe WHERE title = 'Garlic Tomato Bruschetta'), (SELECT id FROM ingredient WHERE name = 'Garlic'),    2,   'cloves', 2),
    ((SELECT id FROM recipe WHERE title = 'Garlic Tomato Bruschetta'), (SELECT id FROM ingredient WHERE name = 'Olive Oil'), 2,   'tbsp', 3);

-- =====================
-- FAVORITES
-- =====================

INSERT INTO recipe_favorite (user_id, recipe_id) VALUES
    ((SELECT id FROM "user" WHERE email = 'bob@test.com'),    (SELECT id FROM recipe WHERE title = 'Pasta Carbonara')),
    ((SELECT id FROM "user" WHERE email = 'diana@test.com'),  (SELECT id FROM recipe WHERE title = 'Pasta Carbonara')),
    ((SELECT id FROM "user" WHERE email = 'eve@test.com'),    (SELECT id FROM recipe WHERE title = 'Pasta Carbonara')),
    ((SELECT id FROM "user" WHERE email = 'alice@test.com'),  (SELECT id FROM recipe WHERE title = 'Chicken Fried Rice')),
    ((SELECT id FROM "user" WHERE email = 'diana@test.com'),  (SELECT id FROM recipe WHERE title = 'Chicken Fried Rice'));
