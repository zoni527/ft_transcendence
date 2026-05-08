-- Seed data for testing
-- Runs automatically on first DB init (after 001_schema.sql)
--
-- Scale: 25 named users, 25 recipes (one per unique title), ~50 friendships.
-- Only named seed rows are inserted (no templated/generated bulk).

-- =====================
-- USERS
-- =====================

-- 25 named seed users with bcrypt-hashed passwords.
INSERT INTO "user" (email, password_hash, name, display_name) VALUES
    ('alice@test.com',   '$2a$10$8itNfZYoxGTax6bH88u1S.Y5Lb0FycCXLMFPR0Ws2NkQWM8hI83su', 'Alice Smith',   'alice'),
    ('bob@test.com',     '$2a$10$eOL1lNs3wsyncOqXHyofg.pZMH.R/6lqDcV0/prDyF38hI3OZ5D6O', 'Bob Jones',     'bobby'),
    ('charlie@test.com', '$2a$10$rHjQ4lhx4ADVZZFn7s09VeS5ACXRIpJT8uIJqHCHZuwIzO9Z3POny', 'Charlie Brown', 'charlie'),
    ('diana@test.com',   '$2a$10$97upNVAA7dZtvC5HldOA9ej6kqHSoqRGrjSfhKPEQikswTlUY.twa', 'Diana Prince',  'wonder_di'),
    ('eve@test.com',     '$2a$10$fQ75Z8j00RiA6me0/DshI.YvkEYGZlpx6PwqJ1Xmym5TuCOyNayry', 'Eve Taylor',    'evee'),
    ('kevin@test.com',   '$2a$10$K1v8n2m3b4v5c6x7z8l9k.J0h1g2f3d4s5a6p7o8i9u0y1t2r3e4W', 'Kevin Flynn',   'grid_runner'),
    ('laura@test.com',   '$2a$10$L0a9u8r7a6s5d4f3g2h1j.K0l9m8n7b6v5c4x3z2a1s0d9f8g7h6G', 'Laura Kinney',  'x23'),
    ('miles@test.com',   '$2a$10$M1i2l3e4s5p6o7i8u9y0t.R9e8w7q6z5x4c3v2b1n0m9a8s7d6f5U', 'Miles Morales', 'spider_m'),
    ('nina@test.com',    '$2a$10$N9i8n7a6s5d4f3g2h1j0k.L9m8n7b6v5c4x3z2a1s0d9f8g7h6P', 'Nina Williams', 'tekken_nina'),
    ('oscar@test.com',   '$2a$10$O9s8c7a6r5d4f3g2h1j0k.L1m2n3b4v5c6x7z8p9o0i1u2y3t4R', 'Oscar Isaac',   'p_dameron'),
    ('peter@test.com',   '$2a$10$P1e2t3e4r5p6a7r8k9e0r.S1t2a3r4k5i6n7d8u9s0t1r2i3e4S', 'Peter Parker',  'web_head'),
    ('quinn@test.com',   '$2a$10$Q1u2i3n4n5f6a7b8c9d0e.F1g2h3j4k5l6m7n8o9p0q1r2s3t4V', 'Quinn Fabray',  'q_fabray'),
    ('reed@test.com',    '$2a$10$R9e8e7d6r5i4c3h2a1r0d.S9t8a7r6k5l4m3n2o1p0q9r8s7t6F', 'Reed Richards', 'mister_f'),
    ('sarah@test.com',   '$2a$10$S1a2r3a4h5c6o7n8n9o0r.T1e2r3m4i5n6a7t8o9r0v1b2n3m4K', 'Sarah Connor',  'no_fate'),
    ('tony@test.com',    '$2a$10$T1o2n3y4s5t6a7r8k9p0o.I1r2o3n4m5a6n7b8v9c0x1z2l3k4S', 'Tony Stark',    'iron_man'),
    ('ursula@test.com',  '$2a$10$U1r2s3u4l5a6m7e8r9m0a.I1d2o3l4s5h6e7l8l9o0v1e2r3s4T', 'Ursula Main',   'sea_witch'),
    ('victor@test.com',  '$2a$10$V1i2c3t4o5r6d7o8o9m0s.L1a2t3v4e5r6i7a8n9k0i1n2g3h4D', 'Victor Doom',   'dr_doom'),
    ('wanda@test.com',   '$2a$10$W1a2n3d4a5m6a7x8i9m0o.S1c2a3r4l5e6t7w8i9t0c1h2l3y4X', 'Wanda Maximoff','scarlet_w'),
    ('xavier@test.com',  '$2a$10$X1a2v3i4e5r6p7r8o9f0e.S1s2o3r4h5e6l7l8y9w1e2e3l4s5C', 'Charles Xavier','prof_x'),
    ('yara@test.com',    '$2a$10$Y1a2r3a4f5l6o7r8e9s0t.B1r2a3z4i5l6i7a8n9k0n1i2g3h4W', 'Yara Flor',     'wonder_girl'),
    ('zane@test.com',    '$2a$10$Z1a2n3e4r5o6b7o8t9i0c.N1i2n3j4a5g6o7m8a9s0t1e2r3s4P', 'Zane Julien',   'titanium_z'),
    ('arthur@test.com',  '$2a$10$A1r2t3h4u5r6c7u8r9r0y.K1i2n3g4o5f6a7t8l9a1n2t3i4s5C', 'Arthur Curry',  'aquaman'),
    ('bruce@test.com',   '$2a$10$B1r2u3c4e5w6a7y8n9e0b.B1a2t3m4a5n6v7i8g9i1l2a3n4t5E', 'Bruce Wayne',   'dark_knight'),
    ('clark@test.com',   '$2a$10$C1l2a3r4k5k6e7n8t9s0u.P1e2r3m4a5n6o7f8s9t0e1e2l3v4S', 'Clark Kent',    'super_man'),
    ('wonder@test.com',  '$2a$10$D1i2a3n4a5p6r7i8n9c0e.T1h2e3m4y5s6c7i8r9a0q1u2e3e4N', 'Diana Prince',  'wonder_woman');

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
-- Explicit assignments for the privileged roles; everyone else defaults to 'user'.
--   1  admin     — alice
--   1  moderator — wonder_di
--   2  chef      — bobby, charlie
--   21 user      — all remaining named users
-- =====================

INSERT INTO user_role (user_id, role_id)
SELECT u.id, r.id
FROM "user" u, role r
WHERE (r.name = 'admin'     AND u.display_name = 'alice')
   OR (r.name = 'moderator' AND u.display_name = 'wonder_di')
   OR (r.name = 'chef'      AND u.display_name IN ('bobby', 'charlie'));

-- Everyone without an explicit role above falls back to 'user'.
INSERT INTO user_role (user_id, role_id)
SELECT u.id, r.id
FROM "user" u
CROSS JOIN role r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM user_role ur WHERE ur.user_id = u.id);

-- =====================
-- RECIPES (25 unique titles, one row each)
-- Authored only by users with admin or chef role.
-- Cuisines, meal types, difficulty rotate through small pools.
-- =====================
INSERT INTO recipe (author_id, title, description, preparation_time_min, servings,
                    difficulty, cuisine, meal_type, image_url, calories, protein_g, carbs_g, fat_g)
SELECT
    authors.id,
    (ARRAY[
        'Pasta Carbonara', 'Chicken Fried Rice', 'Garlic Tomato Bruschetta', 'Pesto Pasta Salad',
        'Traditional Miso Soup', 'Street-style Beef Tacos', 'Classic Caesar Salad', 'Creamy Mushroom Risotto',
        'Authentic Pad Thai', 'Vegetable Stir Fry', 'Spicy Tuna Roll', 'Margherita Pizza',
        'Beef Bourguignon', 'Chickpea Curry', 'Grilled Salmon with Asparagus', 'Greek Souvlaki',
        'Eggplant Parmesan', 'Quinoa Buddha Bowl', 'French Onion Soup', 'Lamb Rogan Josh',
        'BBQ Pulled Pork Sandwich', 'Caprese Skewers', 'Shakshuka', 'Butter Chicken', 'Falafel Wrap'
    ])[g],
    'A high-quality, ' || (ARRAY['delicious', 'quick', 'nutritious', 'family-friendly', 'gourmet'])[((g - 1) % 5) + 1] ||
    ' recipe for ' || (ARRAY['everyday cooking.', 'special occasions.', 'weekend meal prep.', 'busy weeknights.'])[((g - 1) % 4) + 1],
    15 + (g % 75),                                  -- 15..89 minutes
    1 + (g % 8),                                    -- 1..8 servings
    (ARRAY['easy', 'medium', 'hard'])[((g - 1) % 3) + 1],
    (ARRAY['Italian', 'Asian', 'Mexican', 'French', 'Indian', 'Greek', 'Middle Eastern', 'American', 'Thai', 'Japanese'])[((g - 1) % 10) + 1],
    (ARRAY['breakfast', 'lunch', 'dinner', 'snack', 'dessert'])[((g - 1) % 5) + 1],
    (ARRAY[
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539163/ko9mymntptndrupaw8ib.jpg',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539232/pkxfz0nto6t4kzfgys4q.jpg',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539266/dxssmqprpxhsgyxjupql.jpg',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539308/uof4c0bvl1kb6csvchdn.jpg',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539350/another_image_1.jpg',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777539400/another_image_2.jpg'
    ])[((g - 1) % 6) + 1],
    150 + (g * 13) % 850,                           -- 150..999 cal
    10 + (g % 50)::decimal,                         -- 10..59 g protein
    10 + (g % 100)::decimal,                        -- 10..109 g carbs
    2 + (g % 45)::decimal                           -- 2..46 g fat
FROM generate_series(1, 25) g
JOIN LATERAL (
    SELECT u.id
    FROM "user" u
    JOIN user_role ur ON ur.user_id = u.id
    JOIN role r       ON r.id = ur.role_id
    WHERE r.name IN ('admin', 'chef')
    ORDER BY u.id -- Consistent ordering
    OFFSET ((g - 1) % (SELECT COUNT(*) FROM user_role ur2 JOIN role r2 ON r2.id = ur2.role_id WHERE r2.name IN ('admin', 'chef'))) LIMIT 1
) AS authors ON TRUE;

-- =====================
-- FRIENDSHIPS
-- Five explicit pairs: 3 accepted, 2 pending so the UI can exercise both.
-- =====================

INSERT INTO friendship (requester_id, receiver_id, status)
SELECT u1.id, u2.id, v.status
FROM (VALUES
    ('alice',     'bobby',     'accepted'),
    ('alice',     'charlie',   'accepted'),
    ('bobby',     'wonder_di', 'pending'),
    ('charlie',   'evee',      'accepted'),
    ('wonder_di', 'evee',      'pending')
) AS v(requester, receiver, status)
JOIN "user" u1 ON u1.display_name = v.requester
JOIN "user" u2 ON u2.display_name = v.receiver;
