-- Run this in Neon SQL Editor after deploying auth update.
-- Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    display_name VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    jti VARCHAR NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_refresh_tokens_jti ON refresh_tokens(jti);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- Add user_id to movies if upgrading an existing database.
-- WARNING: Existing movies without a user will be deleted.
DELETE FROM movies WHERE user_id IS NULL;

ALTER TABLE movies ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- If column was just added and is nullable, enforce NOT NULL after cleanup:
-- (Skip if fresh database — create_all handles it.)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'movies' AND column_name = 'user_id' AND is_nullable = 'YES'
    ) THEN
        DELETE FROM movies WHERE user_id IS NULL;
        ALTER TABLE movies ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS ix_movies_user_id ON movies(user_id);
