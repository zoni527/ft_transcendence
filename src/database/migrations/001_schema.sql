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
    avatar_url      VARCHAR NOT NULL DEFAULT 'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777887730/f06qpjbotv8rahtc287u.png',
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now(),
    last_seen       TIMESTAMP DEFAULT now()
);


CREATE TABLE role (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR UNIQUE NOT NULL, -- admin, moderator, chef, user
    description     TEXT
);

CREATE TABLE permission (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR UNIQUE NOT NULL, -- create_recipe, delete_recipe, manage_roles, etc.
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

CREATE TABLE token_blacklist (
    token_hash         VARCHAR(64) PRIMARY KEY CHECK (char_length(token_hash) = 64),
    expiration_date    TIMESTAMP NOT NULL
);

CREATE INDEX idx_token_blacklist_expiration_date
     ON token_blacklist (expiration_date);

-- =====================
-- RECIPE
-- =====================

CREATE TABLE recipe (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- TODO: GDPR — TOS should state that recipes remain after account
    --       deletion with authorship anonymized (author_id set to NULL)
    author_id               UUID CONSTRAINT fk_author_id REFERENCES "user"(id) ON DELETE SET NULL,
    title                   VARCHAR NOT NULL,
    description             TEXT,
    preparation_time_min    INT,
    servings                INT DEFAULT 4,
    difficulty              VARCHAR NOT NULL CONSTRAINT recipe_difficulty_allowed_values
                                CHECK (difficulty IN ('easy', 'medium', 'hard')),
    cuisine                 VARCHAR,
    meal_type               VARCHAR NOT NULL CONSTRAINT recipe_meal_type_allowed_values
                                CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert')),
    image_url               VARCHAR,
    calories                INT,
    protein_g               DECIMAL,
    carbs_g                 DECIMAL,
    fat_g                   DECIMAL,
    created_at              TIMESTAMP DEFAULT now(),
    updated_at              TIMESTAMP DEFAULT now()
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

-- =====================
-- FRIENDSHIP
-- =====================

-- Stored directionally so the frontend can show
-- "X sent you a request" vs "you sent X a request".
-- Mutual once status = 'accepted'.
CREATE TABLE friendship (
    requester_id    UUID REFERENCES "user"(id) ON DELETE CASCADE,
    receiver_id     UUID REFERENCES "user"(id) ON DELETE CASCADE,
    status          VARCHAR NOT NULL DEFAULT 'pending'
                        CONSTRAINT friendship_status_allowed_values
                        CHECK (status IN ('pending', 'accepted')),
    created_at      TIMESTAMP DEFAULT now(),
    PRIMARY KEY (requester_id, receiver_id),
    CONSTRAINT friendship_no_self CHECK (requester_id <> receiver_id)
);

