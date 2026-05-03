-- Add avatar_url column to user table
-- Required by User Management module (avatars) and recipe detail page
-- (shows author portrait next to "Recipe by")

ALTER TABLE "user" ADD COLUMN avatar_url VARCHAR;
