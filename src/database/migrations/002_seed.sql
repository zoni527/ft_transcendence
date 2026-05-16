-- Seed data for testing
-- Runs automatically on first DB init (after 001_schema.sql)
--
-- Scale: 25 named users, 25 recipes (one per unique title), 49 friendships.
-- Only named seed rows are inserted (no templated/generated bulk).

-- =====================
-- USERS
-- =====================

-- 25 named seed users with bcrypt-hashed passwords.
INSERT INTO "user" (email, password_hash, name, display_name) VALUES
    ('alice@test.com',   '$2a$10$8itNfZYoxGTax6bH88u1S.Y5Lb0FycCXLMFPR0Ws2NkQWM8hI83su', 'Alice Smith',    'alice'),
    ('bob@test.com',     '$2a$10$eOL1lNs3wsyncOqXHyofg.pZMH.R/6lqDcV0/prDyF38hI3OZ5D6O', 'Bob Jones',      'bobby'),
    ('charlie@test.com', '$2a$10$rHjQ4lhx4ADVZZFn7s09VeS5ACXRIpJT8uIJqHCHZuwIzO9Z3POny', 'Charlie Brown',  'charlie'),
    ('diana@test.com',   '$2a$10$97upNVAA7dZtvC5HldOA9ej6kqHSoqRGrjSfhKPEQikswTlUY.twa', 'Diana Prince',   'wonder_di'),
    ('eve@test.com',     '$2a$10$fQ75Z8j00RiA6me0/DshI.YvkEYGZlpx6PwqJ1Xmym5TuCOyNayry', 'Eve Taylor',     'evee'),
    ('kevin@test.com',   '$2a$10$K1v8n2m3b4v5c6x7z8l9k.J0h1g2f3d4s5a6p7o8i9u0y1t2r3e4W', 'Kevin Flynn',    'grid_runner'),
    ('laura@test.com',   '$2a$10$L0a9u8r7a6s5d4f3g2h1j.K0l9m8n7b6v5c4x3z2a1s0d9f8g7h6G', 'Laura Kinney',   'x23'),
    ('miles@test.com',   '$2a$10$M1i2l3e4s5p6o7i8u9y0t.R9e8w7q6z5x4c3v2b1n0m9a8s7d6f5U', 'Miles Morales',  'spider_m'),
    ('nina@test.com',    '$2a$10$N9i8n7a6s5d4f3g2h1j0k.L9m8n7b6v5c4x3z2a1s0d9f8g7h6P',   'Nina Williams',  'tekken_nina'),
    ('oscar@test.com',   '$2a$10$O9s8c7a6r5d4f3g2h1j0k.L1m2n3b4v5c6x7z8p9o0i1u2y3t4R',   'Oscar Isaac',    'p_dameron'),
    ('peter@test.com',   '$2a$10$P1e2t3e4r5p6a7r8k9e0r.S1t2a3r4k5i6n7d8u9s0t1r2i3e4S',   'Peter Parker',   'web_head'),
    ('quinn@test.com',   '$2a$10$Q1u2i3n4n5f6a7b8c9d0e.F1g2h3j4k5l6m7n8o9p0q1r2s3t4V',   'Quinn Fabray',   'q_fabray'),
    ('reed@test.com',    '$2a$10$R9e8e7d6r5i4c3h2a1r0d.S9t8a7r6k5l4m3n2o1p0q9r8s7t6F',   'Reed Richards',  'mister_f'),
    ('sarah@test.com',   '$2a$10$S1a2r3a4h5c6o7n8n9o0r.T1e2r3m4i5n6a7t8o9r0v1b2n3m4K',   'Sarah Connor',   'no_fate'),
    ('tony@test.com',    '$2a$10$T1o2n3y4s5t6a7r8k9p0o.I1r2o3n4m5a6n7b8v9c0x1z2l3k4S',   'Tony Stark',     'iron_man'),
    ('ursula@test.com',  '$2a$10$U1r2s3u4l5a6m7e8r9m0a.I1d2o3l4s5h6e7l8l9o0v1e2r3s4T',   'Ursula Main',    'sea_witch'),
    ('victor@test.com',  '$2a$10$V1i2c3t4o5r6d7o8o9m0s.L1a2t3v4e5r6i7a8n9k0i1n2g3h4D',   'Victor Doom',    'dr_doom'),
    ('wanda@test.com',   '$2a$10$W1a2n3d4a5m6a7x8i9m0o.S1c2a3r4l5e6t7w8i9t0c1h2l3y4X',   'Wanda Maximoff', 'scarlet_w'),
    ('xavier@test.com',  '$2a$10$X1a2v3i4e5r6p7r8o9f0e.S1s2o3r4h5e6l7l8y9w1e2e3l4s5C',   'Charles Xavier', 'prof_x'),
    ('yara@test.com',    '$2a$10$Y1a2r3a4f5l6o7r8e9s0t.B1r2a3z4i5l6i7a8n9k0n1i2g3h4W',   'Yara Flor',      'wonder_girl'),
    ('zane@test.com',    '$2a$10$Z1a2n3e4r5o6b7o8t9i0c.N1i2n3j4a5g6o7m8a9s0t1e2r3s4P',   'Zane Julien',    'titanium_z'),
    ('arthur@test.com',  '$2a$10$A1r2t3h4u5r6c7u8r9r0y.K1i2n3g4o5f6a7t8l9a1n2t3i4s5C',   'Arthur Curry',   'aquaman'),
    ('bruce@test.com',   '$2a$10$B1r2u3c4e5w6a7y8n9e0b.B1a2t3m4a5n6v7i8g9i1l2a3n4t5E',   'Bruce Wayne',    'dark_knight'),
    ('clark@test.com',   '$2a$10$C1l2a3r4k5k6e7n8t9s0u.P1e2r3m4a5n6o7f8s9t0e1e2l3v4S',   'Clark Kent',     'super_man'),
    ('wonder@test.com',  '$2a$10$D1i2a3n4a5p6r7i8n9c0e.T1h2e3m4y5s6c7i8r9a0q1u2e3e4N',   'Diana Prince',   'wonder_woman');

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
-- Authored by users with admin or chef role: alice, bobby, charlie.
-- Each title is paired with a hand-picked Cloudinary image.
-- The description column holds cooking steps as "Step N:" lines separated
-- by newlines (frontend renames the UI label to "How to cook"). Strings use
-- the E'...' escape syntax so \n is interpreted as a real newline.
-- =====================
-- created_at / updated_at are randomized across the last 60 / 30 days so the
-- sort-by-newest and sort-by-oldest filters return a meaningful order on
-- seeded data instead of a tie. updated_at is always >= created_at.
INSERT INTO recipe (author_id, title, description, preparation_time_min, servings,
                    difficulty, cuisine, meal_type, image_url, calories, protein_g, carbs_g, fat_g,
                    created_at, updated_at)
SELECT
    u.id,
    r.title, r.description, r.prep_time, r.servings, r.difficulty,
    r.cuisine, r.meal_type, r.image_url,
    r.calories, r.protein_g, r.carbs_g, r.fat_g,
    r.created_at,
    r.created_at + (random() * (now() - r.created_at)) AS updated_at
FROM (
    SELECT *, now() - (random() * interval '60 days') AS created_at
    FROM (VALUES
    (
        'alice', 'Pasta Carbonara',
        E'Step 1: Bring a large pot of well-salted water to the boil and cook spaghetti until al dente.\nStep 2: While the pasta cooks, render diced pancetta in a dry pan over medium heat until crisp, then take the pan off the heat.\nStep 3: Whisk egg yolks in a bowl with finely grated pecorino and plenty of cracked black pepper.\nStep 4: Drain the pasta, reserving a cup of the starchy cooking water.\nStep 5: Toss the hot pasta into the pancetta pan, then off the heat add the egg mixture and a splash of pasta water.\nStep 6: Stir quickly so the eggs turn glossy rather than scrambled, and serve immediately with extra pecorino on top.',
        25, 4, 'medium', 'Italian', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Pasta_Carbonara.jpg',
        600, 25.0, 60.0, 28.0
    ),
    (
        'bobby', 'Chicken Fried Rice',
        E'Step 1: Use day-old jasmine rice and break up any clumps before you start.\nStep 2: Heat a wok until smoking, then sear bite-sized chicken in oil until just cooked through and set aside.\nStep 3: Add a touch more oil and scramble two beaten eggs, breaking them into curds.\nStep 4: Toss in chopped scallion whites and the rice, pressing it against the wok so it picks up colour.\nStep 5: Return the chicken, splash in soy sauce and a drop of sesame oil.\nStep 6: Finish with green scallion tops just before plating.',
        20, 4, 'easy', 'Asian', 'lunch',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Chicken_Fried_Rice.jpg',
        550, 28.0, 72.0, 14.0
    ),
    (
        'charlie', 'Garlic Tomato Bruschetta',
        E'Step 1: Slice a sourdough loaf on the diagonal.\nStep 2: Toast the slices over a hot grill or under the broiler until charred at the edges.\nStep 3: While still warm, rub each slice firmly with a halved garlic clove so the bread grabs the flavour.\nStep 4: Dice ripe tomatoes and season them with salt, a drizzle of good olive oil, and torn basil.\nStep 5: Let the tomatoes sit for a few minutes to release their juices.\nStep 6: Spoon the tomato over the toast just before serving so the bread stays crisp.',
        15, 6, 'easy', 'Italian', 'snack',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Garlic_Tomato_Bruschetta.jpg',
        240, 7.0, 35.0, 8.0
    ),
    (
        'alice', 'Pesto Pasta Salad',
        E'Step 1: Boil fusilli in salted water until just tender.\nStep 2: Drain and run cold water over the pasta to stop the cooking.\nStep 3: Make a quick pesto by blitzing basil leaves, toasted pine nuts, garlic, parmesan, and olive oil to a coarse paste.\nStep 4: Toss the cooled pasta with the pesto until every spiral is coated.\nStep 5: Fold in halved cherry tomatoes and a final scatter of pine nuts.\nStep 6: Chill briefly before serving so the flavours settle.',
        20, 4, 'easy', 'Italian', 'lunch',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Pesto_Pasta_Salad.jpg',
        510, 14.0, 68.0, 22.0
    ),
    (
        'bobby', 'Traditional Miso Soup',
        E'Step 1: Make a quick dashi by simmering kombu in cold water and removing it before the water boils.\nStep 2: Add a handful of bonito flakes and steep for a couple of minutes before straining.\nStep 3: Cube silken tofu and rehydrate dried wakame in cold water until it unfurls.\nStep 4: Bring the dashi back to a gentle heat, never a rolling boil.\nStep 5: Dissolve miso paste through a fine sieve directly into the pot.\nStep 6: Add the tofu and wakame, finish with sliced spring onion, and serve right away.',
        15, 4, 'easy', 'Japanese', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Traditional_Miso_Soup.jpg',
        150, 9.0, 12.0, 6.0
    ),
    (
        'charlie', 'Street-style Beef Tacos',
        E'Step 1: Marinate skirt steak with lime juice, garlic, smoked paprika, cumin, and a splash of orange juice for at least twenty minutes.\nStep 2: Sear the steak hot and fast in a cast iron pan, two minutes a side.\nStep 3: Rest the steak before slicing thinly against the grain.\nStep 4: Char corn tortillas directly on the flame until soft and lightly blistered.\nStep 5: Pile each tortilla with steak, finely diced white onion, plenty of chopped cilantro, and a squeeze of lime.\nStep 6: Serve with salsa verde on the side.',
        35, 4, 'medium', 'Mexican', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Street-style_Beef_Tacos.jpg',
        470, 30.0, 35.0, 22.0
    ),
    (
        'alice', 'Classic Caesar Salad',
        E'Step 1: Tear romaine into bite-sized pieces and chill while you build the dressing.\nStep 2: Mash anchovy fillets with garlic, then whisk in egg yolk, dijon, lemon juice, and worcestershire.\nStep 3: Slowly stream in olive oil, whisking constantly, until the dressing is creamy.\nStep 4: Toss day-old bread cubes with oil and garlic, then bake until golden and crunchy for the croutons.\nStep 5: Coat the romaine in the dressing and top with shaved parmesan and the warm croutons.\nStep 6: Grind black pepper over the top just before serving.',
        20, 4, 'easy', 'American', 'lunch',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Classic_Caesar_Salad.jpg',
        360, 10.0, 18.0, 28.0
    ),
    (
        'bobby', 'Creamy Mushroom Risotto',
        E'Step 1: Warm vegetable or chicken stock and keep it on a low simmer beside the pan.\nStep 2: Saute mixed mushrooms in butter until deeply browned and set them aside.\nStep 3: In the same pan, soften finely chopped shallot, then toast arborio rice until the edges turn translucent.\nStep 4: Deglaze with white wine and let it cook off entirely.\nStep 5: Add the warm stock a ladleful at a time, stirring until each addition is absorbed.\nStep 6: After about twenty minutes, when the rice is creamy but still al dente, stir in the mushrooms, butter, and grated parmesan.\nStep 7: Rest for two minutes before serving.',
        45, 4, 'hard', 'Italian', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Creamy_Mushroom_Risotto.jpg',
        560, 14.0, 78.0, 18.0
    ),
    (
        'charlie', 'Authentic Pad Thai',
        E'Step 1: Soak flat rice noodles in warm water until pliable but not soft.\nStep 2: Make a sauce of tamarind paste, palm sugar, fish sauce, and a touch of chili.\nStep 3: Heat a wok over high flame and sear shrimp briefly.\nStep 4: Push the shrimp aside and scramble an egg in the same pan.\nStep 5: Add the drained noodles and the sauce, tossing constantly so the noodles absorb the liquid without breaking.\nStep 6: Fold in bean sprouts, garlic chives, and crushed peanuts at the very end so they keep their crunch.\nStep 7: Serve with lime wedges.',
        30, 4, 'medium', 'Thai', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Pad_Thai.jpg',
        600, 24.0, 82.0, 18.0
    ),
    (
        'alice', 'Vegetable Stir Fry',
        E'Step 1: Cut all your vegetables before lighting the burner: broccoli florets, sliced bell pepper, carrot batons, and snap peas.\nStep 2: Heat oil in a wok until it shimmers.\nStep 3: Add ginger and garlic for just a few seconds before they catch.\nStep 4: Add the firmer vegetables first and toss for a minute, then the softer ones.\nStep 5: Splash in soy sauce, a touch of rice vinegar, and a drizzle of sesame oil right at the end.\nStep 6: Plate while the vegetables are still vivid and slightly crisp.',
        20, 4, 'easy', 'Asian', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Vegetable_stir_fry.jpg',
        310, 9.0, 46.0, 9.0
    ),
    (
        'bobby', 'Spicy Tuna Roll',
        E'Step 1: Cook short-grain sushi rice and season it with a mix of rice vinegar, sugar, and salt while it is still warm.\nStep 2: Fan the rice to cool it to body temperature.\nStep 3: Dice sashimi-grade tuna and fold it gently with sriracha, kewpie mayo, and a touch of sesame oil.\nStep 4: Lay a sheet of nori on a bamboo mat and spread a thin even layer of rice across it.\nStep 5: Arrange the tuna mixture in a line near the edge, then roll firmly with the mat, sealing the seam with a little water.\nStep 6: Slice with a wet sharp knife into eight pieces.\nStep 7: Finish with toasted sesame and serve with soy and pickled ginger.',
        40, 2, 'hard', 'Japanese', 'lunch',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Spicy_Tuna_Roll.jpg',
        410, 21.0, 58.0, 10.0
    ),
    (
        'charlie', 'Margherita Pizza',
        E'Step 1: Mix flour, water, salt, and a pinch of yeast and knead until elastic.\nStep 2: Let the dough rise slowly for several hours until doubled.\nStep 3: Stretch a portion by hand on a floured surface, never with a rolling pin, until thin in the centre with a thicker rim.\nStep 4: Top with crushed San Marzano tomatoes, torn fior di latte, a drizzle of olive oil, and a few fresh basil leaves.\nStep 5: Bake on a preheated stone or steel at the highest oven temperature you can manage until the crust is blistered and the cheese bubbles.\nStep 6: Tear extra basil over the top once it comes out.',
        60, 4, 'medium', 'Italian', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Margherita_Pizza.jpg',
        740, 28.0, 92.0, 26.0
    ),
    (
        'alice', 'Beef Bourguignon',
        E'Step 1: Cube chuck and pat it very dry, then brown in batches in a heavy Dutch oven so the pieces sear rather than steam.\nStep 2: Render lardons until crisp and set aside, then soften pearl onions in the same fat.\nStep 3: Return the beef and bacon to the pot and dust with flour.\nStep 4: Pour over a full bottle of red Burgundy along with beef stock, thyme, bay, and a head of halved garlic.\nStep 5: Cover and braise low and slow until the beef is fork-tender.\nStep 6: Saute button mushrooms separately and stir them in at the end so they keep their shape and bite.',
        180, 6, 'hard', 'French', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Beef_Bourguignon.jpg',
        720, 42.0, 18.0, 38.0
    ),
    (
        'bobby', 'Chickpea Curry',
        E'Step 1: Bloom cumin seeds, mustard seeds, and curry leaves in hot oil until fragrant.\nStep 2: Add finely chopped onion and cook slowly until deep golden.\nStep 3: Stir in grated ginger, garlic, and a green chili.\nStep 4: Toast turmeric, coriander, and garam masala for thirty seconds before adding chopped tomato.\nStep 5: Let the masala break down into a thick sauce.\nStep 6: Tip in cooked chickpeas and coconut milk, season generously, and simmer for fifteen minutes until the sauce clings.\nStep 7: Finish with chopped coriander and a squeeze of lemon.',
        30, 4, 'easy', 'Indian', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Chickpea_Curry.jpg',
        450, 14.0, 56.0, 18.0
    ),
    (
        'charlie', 'Grilled Salmon with Asparagus',
        E'Step 1: Pat salmon fillets very dry and season the skin side with salt, since dry skin gives you crispness.\nStep 2: Heat a heavy pan with a thin film of oil until just smoking.\nStep 3: Lay the fillets in skin-side down and press gently for the first minute.\nStep 4: Cook most of the way through on the skin side, then flip for just thirty seconds.\nStep 5: While the salmon rests, toss trimmed asparagus in the same pan with butter and a clove of crushed garlic, charring it lightly.\nStep 6: Plate the salmon over the asparagus and finish both with lemon and flaky salt.',
        25, 2, 'medium', 'American', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Grilled_Salmon_with_Asparagus.jpg',
        520, 38.0, 10.0, 32.0
    ),
    (
        'alice', 'Greek Souvlaki',
        E'Step 1: Cube lamb shoulder and marinate it in yogurt, olive oil, lemon juice, oregano, garlic, and plenty of black pepper for at least an hour.\nStep 2: Thread the cubes onto skewers without crowding so the heat reaches every side.\nStep 3: Grill over high heat, turning every couple of minutes, until charred outside and just rosy within.\nStep 4: Warm pita bread directly over the flame so it puffs.\nStep 5: Make tzatziki by stirring grated cucumber, garlic, dill, and lemon into thick yogurt.\nStep 6: Serve the skewers tucked into pita with tomato and tzatziki.',
        35, 4, 'medium', 'Greek', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Greek_Souvlaki.jpg',
        520, 32.0, 38.0, 24.0
    ),
    (
        'bobby', 'Eggplant Parmesan',
        E'Step 1: Slice eggplant into rounds, salt them, and let them weep in a colander for thirty minutes.\nStep 2: Pat the rounds dry, then dredge each in flour, beaten egg, and seasoned breadcrumbs.\nStep 3: Shallow-fry in olive oil until golden on both sides.\nStep 4: Make a quick tomato sauce with garlic, olive oil, crushed tomatoes, and basil.\nStep 5: Layer the fried eggplant with sauce, torn mozzarella, and grated parmesan in a baking dish, repeating until you run out.\nStep 6: Bake until the cheese is bubbling and the top is browned.\nStep 7: Rest for ten minutes before cutting.',
        60, 4, 'medium', 'Italian', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Eggplant_Parmesan.jpg',
        560, 20.0, 46.0, 30.0
    ),
    (
        'charlie', 'Quinoa Buddha Bowl',
        E'Step 1: Rinse quinoa thoroughly to remove its bitter coating.\nStep 2: Simmer the quinoa in lightly salted water until the grains uncoil.\nStep 3: Toss cubed sweet potato, broccoli florets, and chickpeas with olive oil and spices, then roast on a hot tray until caramelised at the edges.\nStep 4: Whisk tahini with lemon juice, a small clove of garlic, and just enough water to make a pourable sauce.\nStep 5: Build each bowl with a base of quinoa, a section of each roasted vegetable, sliced avocado, and a generous drizzle of the tahini.\nStep 6: Top with toasted seeds for crunch.',
        25, 2, 'easy', 'American', 'lunch',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Quinoa_Buddha_Bowl.jpg',
        480, 16.0, 62.0, 18.0
    ),
    (
        'alice', 'French Onion Soup',
        E'Step 1: Slice many more onions than you think you need, since they cook down dramatically.\nStep 2: Melt butter in a heavy pot, add the onions with a pinch of salt, and cook on low for at least forty-five minutes, stirring occasionally, until they collapse into a sweet jammy mass.\nStep 3: Deglaze with dry sherry or white wine.\nStep 4: Pour in beef stock, thyme, and a bay leaf and simmer for another twenty minutes.\nStep 5: Ladle into oven-safe bowls and float a slice of toasted baguette on top.\nStep 6: Blanket with grated gruyere and grill until the cheese is bubbling and bronzed.',
        75, 4, 'medium', 'French', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/French_Onion_Soup.jpg',
        420, 16.0, 38.0, 22.0
    ),
    (
        'bobby', 'Lamb Rogan Josh',
        E'Step 1: Brown cubed lamb shoulder in ghee in batches and set aside.\nStep 2: In the same pot, fry whole spices like cardamom, cloves, cinnamon, and bay.\nStep 3: Add finely sliced onion and cook to deep brown.\nStep 4: Stir in ginger-garlic paste, Kashmiri chili powder for colour, and ground coriander, fennel, and cumin.\nStep 5: Whisk in plain yogurt a spoonful at a time so it does not split.\nStep 6: Return the lamb with a splash of water, cover, and cook on a low heat for at least an hour and a half until the meat falls apart and the gravy turns deep red and glossy.',
        90, 6, 'hard', 'Indian', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Lamb_Rogan_Josh.jpg',
        660, 40.0, 16.0, 42.0
    ),
    (
        'charlie', 'BBQ Pulled Pork Sandwich',
        E'Step 1: Rub pork shoulder generously with a mix of brown sugar, paprika, salt, garlic, and cayenne, then leave it overnight if you can.\nStep 2: Smoke or roast low and slow at around 110C until the internal temperature reaches the high 90s and a fork twists freely in the meat.\nStep 3: Rest the pork, then shred with two forks.\nStep 4: Toss the shredded pork with a tangy tomato-vinegar BBQ sauce.\nStep 5: Make a quick slaw with shredded cabbage, carrot, and a sharp mayo dressing.\nStep 6: Pile the pork onto toasted brioche buns and crown with the slaw before closing the lid.',
        240, 6, 'hard', 'American', 'lunch',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/BBQ_Pulled_Pork_Sandwich.jpg',
        720, 36.0, 56.0, 32.0
    ),
    (
        'alice', 'Caprese Skewers',
        E'Step 1: Halve cherry tomatoes and pat them dry.\nStep 2: Drain mini mozzarella balls and toss with a little olive oil, salt, and pepper.\nStep 3: Thread a tomato half, a basil leaf, and a mozzarella ball onto small wooden skewers, repeating once or twice depending on length.\nStep 4: Reduce balsamic vinegar in a small pan over low heat until it coats the back of a spoon, then let it cool.\nStep 5: Arrange the skewers on a platter.\nStep 6: Drizzle with the balsamic glaze and a final whisper of olive oil right before serving.',
        15, 6, 'easy', 'Italian', 'snack',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Caprese_Skewers.jpg',
        210, 9.0, 8.0, 14.0
    ),
    (
        'bobby', 'Shakshuka',
        E'Step 1: Soften finely chopped onion and red pepper in olive oil in a wide pan until sweet.\nStep 2: Add crushed garlic, sweet paprika, cumin, and a pinch of chili and toast briefly.\nStep 3: Pour in a tin of plum tomatoes, crushing them with the back of a spoon.\nStep 4: Simmer until thickened and rich.\nStep 5: Make small wells in the sauce and crack an egg into each.\nStep 6: Cover the pan and cook gently until the whites are set but the yolks still wobble.\nStep 7: Crumble feta over the top, finish with chopped parsley, and serve straight from the pan with crusty bread.',
        30, 4, 'easy', 'Middle Eastern', 'breakfast',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Shakshuka.jpg',
        400, 18.0, 24.0, 24.0
    ),
    (
        'charlie', 'Butter Chicken',
        E'Step 1: Marinate cubed chicken thigh in yogurt, ginger-garlic paste, lemon, and tandoori spices for at least an hour.\nStep 2: Char the chicken under a hot broiler until the edges blacken.\nStep 3: Meanwhile, simmer a sauce of tomato puree, ginger, garlic, and a knob of butter until it darkens and thickens.\nStep 4: Blend the sauce until completely smooth, then return to the pan with cream, a generous spoon of butter, and a pinch of dried fenugreek leaves crushed between your palms.\nStep 5: Slide the broiled chicken into the sauce and simmer for ten minutes so the flavours marry.\nStep 6: Finish with a swirl of cream.',
        45, 4, 'medium', 'Indian', 'dinner',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Butter_Chicken.jpg',
        620, 34.0, 22.0, 38.0
    ),
    (
        'alice', 'Falafel Wrap',
        E'Step 1: Soak dried chickpeas overnight, never use canned.\nStep 2: Drain and blitz them with onion, garlic, parsley, cilantro, cumin, and coriander to a coarse paste.\nStep 3: Rest the mix briefly, then shape into small patties.\nStep 4: Shallow-fry the patties in hot oil until deeply golden and crisp.\nStep 5: Warm pita pockets and spread the inside generously with hummus.\nStep 6: Stuff with the falafel, sliced cucumber and tomato, pickled turnip, and a few crisp lettuce leaves.\nStep 7: Drizzle with tahini sauce loosened with lemon and water before wrapping tightly to eat.',
        35, 2, 'medium', 'Middle Eastern', 'lunch',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/recipe-seed/Falafel_Wrap.jpg',
        520, 16.0, 68.0, 22.0
    ),
    (
        'alice', 'Classic Tiramisu',
        E'Step 1: Whisk egg yolks and sugar together until pale and thick, then fold in mascarpone until smooth.\nStep 2: In a separate bowl, whip heavy cream to soft peaks and gently fold into the mascarpone mixture.\nStep 3: Combine strong espresso with a splash of dark rum or amaretto in a shallow dish.\nStep 4: Briefly dip ladyfingers into the coffee—just enough to soak but not disintegrate—and layer them in the base of a dish.\nStep 5: Spread half the cream over the biscuits, then repeat with a second layer of soaked ladyfingers and the remaining cream.\nStep 6: Dust heavily with high-quality cocoa powder and chill for at least six hours to set.',
        25, 6, 'medium', 'Italian', 'dessert',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1778871260/recipe-seed/624338969_18106717054740715_5661273212455204253_n.webp',
        450, 8.0, 42.0, 28.0
    ),
    (
        'bobby', 'Chocolate Lava Cake',
        E'Step 1: Melt dark chocolate and butter together in a double boiler until glossy.\nStep 2: Whisk eggs, egg yolks, and sugar until thickened and light in color.\nStep 3: Fold the melted chocolate into the egg mixture, then sift in a small amount of flour and a pinch of salt.\nStep 4: Grease individual ramekins and dust with cocoa powder so the cakes release easily.\nStep 5: Divide the batter among the ramekins and bake at 200°C for exactly twelve minutes until the sides are firm but the center wobbles.\nStep 6: Let rest for one minute, then invert onto plates and serve immediately with vanilla bean ice cream.',
        20, 4, 'medium', 'French', 'dessert',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1778440701/recipe-seed/lava-cake.webp',
        580, 7.0, 48.0, 38.0
    ),
    (
        'charlie', 'Berry Pavlova',
        E'Step 1: Whisk egg whites with a pinch of salt until stiff peaks form.\nStep 2: Add caster sugar one tablespoon at a time, whisking constantly until the meringue is thick, glossy, and no longer feels gritty.\nStep 3: Fold in a teaspoon of cornstarch and white vinegar to ensure a marshmallowy center.\nStep 4: Spoon the meringue onto a lined tray in a large circle and bake at 120°C for ninety minutes until the shell is crisp.\nStep 5: Let the meringue cool completely inside the oven with the door slightly ajar to prevent cracking.\nStep 6: Top with billows of whipped cream and a mountain of fresh raspberries, strawberries, and passionfruit pulp.',
        110, 8, 'hard', 'Australian', 'dessert',
        'https://res.cloudinary.com/dhuk7trpf/image/upload/v1778440764/recipe-seed/berry-pavlova.webp',
        310, 4.0, 52.0, 10.0
    )
    ) AS v(author_dn, title, description, prep_time, servings, difficulty,
           cuisine, meal_type, image_url, calories, protein_g, carbs_g, fat_g)
) AS r
JOIN "user" u ON u.display_name = r.author_dn;

-- =====================
-- FRIENDSHIPS
-- 49 pairs across all 25 seeded users: 32 accepted, 17 pending.
-- alice has multiple accepted friends plus both outgoing and incoming pending
-- requests so the dashboard exercises every bucket of GET /api/friendships.
-- =====================

INSERT INTO friendship (requester_id, receiver_id, status)
SELECT u1.id, u2.id, v.status
FROM (VALUES
    -- Alice (admin): rich friend graph with sent + incoming pending
    ('alice',       'bobby',        'accepted'),
    ('alice',       'charlie',      'accepted'),
    ('alice',       'wonder_di',    'accepted'),
    ('alice',       'iron_man',     'accepted'),
    ('alice',       'super_man',    'accepted'),
    ('spider_m',    'alice',        'accepted'),
    ('web_head',    'alice',        'accepted'),
    ('alice',       'evee',         'pending'),
    ('alice',       'grid_runner',  'pending'),
    ('alice',       'wonder_woman', 'pending'),
    ('prof_x',      'alice',        'pending'),
    ('dark_knight', 'alice',        'pending'),

    -- Bobby (chef)
    ('bobby',       'charlie',      'accepted'),
    ('bobby',       'x23',          'accepted'),
    ('bobby',       'iron_man',     'accepted'),
    ('bobby',       'tekken_nina',  'accepted'),
    ('bobby',       'wonder_di',    'pending'),
    ('super_man',   'bobby',        'pending'),

    -- Charlie (chef)
    ('charlie',     'evee',         'accepted'),
    ('charlie',     'spider_m',     'accepted'),
    ('iron_man',    'charlie',      'accepted'),
    ('charlie',     'wonder_di',    'pending'),

    -- Diana Prince / wonder_di (moderator)
    ('wonder_di',   'x23',          'accepted'),
    ('wonder_di',   'aquaman',      'accepted'),
    ('prof_x',      'wonder_di',    'accepted'),
    ('wonder_di',   'evee',         'pending'),
    ('scarlet_w',   'wonder_di',    'pending'),

    -- Evee
    ('evee',        'spider_m',     'accepted'),
    ('evee',        'p_dameron',    'accepted'),
    ('iron_man',    'evee',         'pending'),
    ('evee',        'no_fate',      'pending'),

    -- Wider network so every seeded user has at least one friendship
    ('grid_runner', 'x23',          'accepted'),
    ('spider_m',    'web_head',     'accepted'),
    ('p_dameron',   'tekken_nina',  'accepted'),
    ('mister_f',    'no_fate',      'accepted'),
    ('mister_f',    'prof_x',       'accepted'),
    ('dr_doom',     'sea_witch',    'accepted'),
    ('prof_x',      'wonder_girl',  'accepted'),
    ('titanium_z',  'wonder_girl',  'accepted'),
    ('aquaman',     'dark_knight',  'accepted'),
    ('dark_knight', 'super_man',    'accepted'),
    ('super_man',   'wonder_woman', 'accepted'),
    ('wonder_girl', 'wonder_woman', 'accepted'),
    ('no_fate',     'q_fabray',     'accepted'),
    ('p_dameron',   'q_fabray',     'pending'),
    ('iron_man',    'dr_doom',      'pending'),
    ('dr_doom',     'scarlet_w',    'pending'),
    ('aquaman',     'titanium_z',   'pending'),
    ('spider_m',    'wonder_girl',  'pending')
) AS v(requester, receiver, status)
JOIN "user" u1 ON u1.display_name = v.requester
JOIN "user" u2 ON u2.display_name = v.receiver;
