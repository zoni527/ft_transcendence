-- PostgreSQL doesn't have UUID generation built in by default.
-- This activates the uuid-ossp extension so we can use uuid_generate_v4()
-- as the default value for our primary key columns.
-- Runs once, standard for any PostgreSQL project using UUIDs.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USER MANAGEMENT
-- =====================

CREATE TABLE "user" (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR UNIQUE NOT NULL,
    password_hash   VARCHAR NOT NULL,
    name            VARCHAR,
    display_name    VARCHAR UNIQUE NOT NULL,
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE TABLE role (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR UNIQUE NOT NULL, -- admin, moderator, chef, user
    description     TEXT
);

CREATE TABLE permission (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR UNIQUE NOT NULL, -- create_recipe, delete_recipe, ban_user, etc.
    description     TEXT
);

CREATE TABLE user_role (
    user_id         UUID REFERENCES "user"(id) ON DELETE CASCADE,
    role_id         UUID REFERENCES role(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permission (
    role_id         UUID REFERENCES role(id) ON DELETE CASCADE,
    permission_id   UUID REFERENCES permission(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- =====================
-- RECIPE
-- =====================

CREATE TABLE recipe (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- TODO: GDPR — TOS should state that published recipes remain after account
    --       deletion with authorship anonymized (author_id set to NULL)
    author_id               UUID REFERENCES "user"(id) ON DELETE SET NULL,
    title                   VARCHAR NOT NULL,
    description             TEXT,
    prep_time_min           INT,
    cook_time_min           INT,
    servings                INT DEFAULT 4,
    difficulty              VARCHAR CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cuisine                 VARCHAR,
    meal_type               VARCHAR CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    image_url               VARCHAR,
    calories                INT,
    protein_g               DECIMAL,
    carbs_g                 DECIMAL,
    fat_g                   DECIMAL,
    is_published            BOOLEAN DEFAULT false,
    created_at              TIMESTAMP DEFAULT now(),
    updated_at              TIMESTAMP DEFAULT now()
);

-- TODO: consider adding created_at field to recipe_step
CREATE TABLE recipe_step (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id       UUID NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    step_number     INT NOT NULL,
    instruction     TEXT NOT NULL,
    media_url       VARCHAR,
    timer_seconds   INT,
    updated_at      TIMESTAMP DEFAULT now(),
    UNIQUE (recipe_id, step_number)
);

-- =====================
-- INGREDIENTS
-- =====================

CREATE TABLE ingredient_category (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR UNIQUE NOT NULL,
    description     TEXT,
    icon_url        VARCHAR
);

CREATE TABLE ingredient (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR UNIQUE NOT NULL,
    category_id     UUID REFERENCES ingredient_category(id) ON DELETE SET NULL,
    -- default_unit is a form pre-fill hint only; each recipe_ingredient has its own unit field
    default_unit    VARCHAR
);

CREATE TABLE recipe_ingredient (
    recipe_id       UUID REFERENCES recipe(id) ON DELETE CASCADE,
    ingredient_id   UUID REFERENCES ingredient(id) ON DELETE CASCADE,
    quantity        DECIMAL NOT NULL,
    unit            VARCHAR NOT NULL,
    sort_order      INT DEFAULT 0,
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- =====================
-- ENGAGEMENT
-- =====================

CREATE TABLE recipe_favourite (
    user_id         UUID REFERENCES "user"(id) ON DELETE CASCADE,
    recipe_id       UUID REFERENCES recipe(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT now(),
    PRIMARY KEY (user_id, recipe_id)
);
