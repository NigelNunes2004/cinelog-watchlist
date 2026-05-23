-- Run each section in Neon SQL Editor if needed.
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS checks.

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    hashed_password VARCHAR NOT NULL,
    display_name VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Refresh tokens table
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

-- 3. Add user_id to movies (skip if column already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'movies' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE movies ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Remove orphan movies, then enforce NOT NULL (only if column is still nullable)
DELETE FROM movies WHERE user_id IS NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'movies' AND column_name = 'user_id' AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE movies ALTER COLUMN user_id SET NOT NULL;
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'user_id NOT NULL skipped — column may already be constrained or table empty';
END $$;

CREATE INDEX IF NOT EXISTS ix_movies_user_id ON movies(user_id);
