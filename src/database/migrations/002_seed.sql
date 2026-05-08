-- Seed data for testing
-- Runs automatically on first DB init (after 001_schema.sql)
--
-- Scale: 100 users, 100 recipes, ~200 friendships, ~300+ favourites.
-- Generated rows use generate_series so volume can be tweaked from a single
-- spot. The five named users (alice/bob/charlie/diana/eve) are kept as the
-- first rows so existing tests and docs stay valid.

-- =====================
-- USERS
-- =====================

-- Five named seed users with bcrypt-hashed passwords (kept for tests/docs).
INSERT INTO "user" (email, password_hash, name, display_name) VALUES
    ('alice@test.com',   '$2a$10$8itNfZYoxGTax6bH88u1S.Y5Lb0FycCXLMFPR0Ws2NkQWM8hI83su', 'Alice Smith',   'alice'),
    ('bob@test.com',     '$2a$10$eOL1lNs3wsyncOqXHyofg.pZMH.R/6lqDcV0/prDyF38hI3OZ5D6O', 'Bob Jones',     'bobby'),
    ('charlie@test.com', '$2a$10$rHjQ4lhx4ADVZZFn7s09VeS5ACXRIpJT8uIJqHCHZuwIzO9Z3POny', 'Charlie Brown', 'charlie'),
    ('diana@test.com',   '$2a$10$97upNVAA7dZtvC5HldOA9ej6kqHSoqRGrjSfhKPEQikswTlUY.twa', 'Diana Prince',  'wonder_di'),
    ('eve@test.com',     '$2a$10$fQ75Z8j00RiA6me0/DshI.YvkEYGZlpx6PwqJ1Xmym5TuCOyNayry', 'Eve Taylor',    'evee');

-- 95 generated users (user_006 through user_100) sharing the same five
-- bcrypt hashes round-robin. Plaintext passwords are the same as the named
-- users above; this is seed data, not a security boundary.
INSERT INTO "user" (email, password_hash, name, display_name)
SELECT
    'user' || LPAD(g::text, 3, '0') || '@test.com',
    (ARRAY[
        '$2a$10$8itNfZYoxGTax6bH88u1S.Y5Lb0FycCXLMFPR0Ws2NkQWM8hI83su',
        '$2a$10$eOL1lNs3wsyncOqXHyofg.pZMH.R/6lqDcV0/prDyF38hI3OZ5D6O',
        '$2a$10$rHjQ4lhx4ADVZZFn7s09VeS5ACXRIpJT8uIJqHCHZuwIzO9Z3POny',
        '$2a$10$97upNVAA7dZtvC5HldOA9ej6kqHSoqRGrjSfhKPEQikswTlUY.twa',
        '$2a$10$fQ75Z8j00RiA6me0/DshI.YvkEYGZlpx6PwqJ1Xmym5TuCOyNayry'
    ])[((g - 1) % 5) + 1],
    'Test User ' || g,
    'user_' || LPAD(g::text, 3, '0')
FROM generate_series(6, 100) g;

-- =====================
-- ROLES & PERMISSIONS
-- =====================

INSERT INTO role (name, description) VALUES
    ('admin',     'Full access — manage users, recipes, roles, and site settings'),
    ('moderator', 'Can review, edit, and delete recipes'),
    ('chef',      'Can create recipes'),
    ('user',      'Default role — can browse and favourite');

INSERT INTO permission (name, description) VALUES
    ('create_recipe',    'Create new recipes'),
    ('edit_recipe',      'Edit any recipe'),
    ('delete_recipe',    'Delete any recipe'),
    ('manage_users',     'View, edit, and delete user accounts'),
    ('manage_roles',     'Assign and remove roles'),
    ('moderate_content', 'Review and moderate user content');

-- admin: all permissions
INSERT INTO role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM role r, permission p WHERE r.name = 'admin';

-- moderator: edit/delete/moderate
INSERT INTO role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM role r, permission p
    WHERE r.name = 'moderator' AND p.name IN ('edit_recipe', 'delete_recipe', 'moderate_content');

-- chef: create only (chefs edit/delete their own via authorship check in handler)
INSERT INTO role_permission (role_id, permission_id)
    SELECT r.id, p.id FROM role r, permission p
    WHERE r.name = 'chef' AND p.name IN ('create_recipe');

-- =====================
-- USER ROLES
-- Distribution across 100 users:
--   1  admin     — alice
--   3  moderator — diana, user_006, user_007
--   20 chef      — bobby, charlie, user_008..user_025
--   76 user      — eve, user_026..user_100
-- =====================

INSERT INTO user_role (user_id, role_id)
SELECT u.id, r.id
FROM "user" u, role r
WHERE (
        (r.name = 'admin'     AND u.display_name = 'alice')
     OR (r.name = 'moderator' AND u.display_name IN ('wonder_di', 'user_006', 'user_007'))
     OR (r.name = 'chef'      AND (u.display_name IN ('bobby', 'charlie')
                                   OR u.display_name BETWEEN 'user_008' AND 'user_025'))
     OR (r.name = 'user'      AND (u.display_name = 'evee'
                                   OR u.display_name BETWEEN 'user_026' AND 'user_100'))
      );

-- =====================
-- RECIPES (100 rows)
-- Authored only by users with admin or chef role.
-- Titles, cuisines, meal types, difficulty rotate through small pools.
-- =====================

INSERT INTO recipe (author_id, title, description, preparation_time_min, servings,
                    difficulty, cuisine, meal_type, image_url, calories, protein_g, carbs_g, fat_g)
SELECT
    authors.id,
    (ARRAY[
        'Pasta Carbonara',
        'Chicken Fried Rice',
        'Garlic Tomato Bruschetta',
        'Pasta Salad',
        'Miso Soup',
        'Beef Tacos',
        'Caesar Salad',
        'Mushroom Risotto',
        'Pad Thai',
        'Vegetable Stir Fry'
    ])[((g - 1) % 10) + 1] || ' #' || g,
    'Auto-generated seed recipe ' || g || ' for testing pagination and search.',
    10 + (g % 50),                                  -- 10..59 minutes
    1 + (g % 6),                                    -- 1..6 servings
    (ARRAY['easy', 'medium', 'hard'])[((g - 1) % 3) + 1],
    (ARRAY['Italian', 'Asian', 'Mexican', 'French', 'Indian'])[((g - 1) % 5) + 1],
    (ARRAY['breakfast', 'lunch', 'dinner', 'snack'])[((g - 1) % 4) + 1],
    (ARRAY[
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539163/ko9mymntptndrupaw8ib.jpg',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539232/pkxfz0nto6t4kzfgys4q.jpg',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539266/dxssmqprpxhsgyxjupql.jpg',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539308/uof4c0bvl1kb6csvchdn.jpg'
    ])[((g - 1) % 4) + 1],
    200 + (g * 7) % 500,                            -- 200..699 cal
    5 + (g % 40)::decimal,                          -- 5..44 g protein
    20 + (g % 60)::decimal,                         -- 20..79 g carbs
    3 + (g % 30)::decimal                           -- 3..32 g fat
FROM generate_series(1, 100) g
JOIN LATERAL (
    SELECT u.id
    FROM "user" u
    JOIN user_role ur ON ur.user_id = u.id
    JOIN role r       ON r.id = ur.role_id
    WHERE r.name IN ('admin', 'chef')
    ORDER BY u.display_name
    OFFSET ((g - 1) % 21) LIMIT 1
) AS authors ON TRUE;

-- =====================
-- FAVOURITES
-- Each user favourites 4 recipes (deterministic offsets); a few collisions
-- get skipped, leaving roughly 380+ rows.
-- =====================

WITH numbered_users AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY display_name) AS rn FROM "user"
), numbered_recipes AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY title) AS rn FROM recipe
)
INSERT INTO recipe_favourite (user_id, recipe_id)
SELECT u.id, r.id
FROM numbered_users u
CROSS JOIN LATERAL (VALUES (1), (2), (3), (4)) AS o(step)
JOIN numbered_recipes r ON r.rn = ((u.rn * 7 + o.step * 13) % 100) + 1
ON CONFLICT DO NOTHING;

-- =====================
-- FRIENDSHIPS
-- Each user sends a request to the next 2 users in the ring (circular),
-- yielding exactly 200 directional rows. ~25% pending, ~75% accepted so the
-- UI can exercise both states.
-- =====================

WITH numbered_users AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY display_name) AS rn FROM "user"
)
INSERT INTO friendship (requester_id, receiver_id, status)
SELECT
    u1.id,
    u2.id,
    CASE WHEN ((u1.rn + o.step) % 4) = 0 THEN 'pending' ELSE 'accepted' END
FROM numbered_users u1
CROSS JOIN LATERAL (VALUES (1), (2)) AS o(step)
JOIN numbered_users u2 ON u2.rn = ((u1.rn - 1 + o.step) % 100) + 1
WHERE u1.id <> u2.id;
