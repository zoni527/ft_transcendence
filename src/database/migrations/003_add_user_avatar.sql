-- Add avatar_url column to user table
-- Required by User Management module (avatars) and recipe detail page
-- (shows author portrait next to "Recipe by")
--
-- Defaulted to a Cloudinary-hosted placeholder so the column is never NULL —
-- new users get the default until they upload their own via the profile edit
-- flow.

ALTER TABLE "user"
    ADD COLUMN avatar_url VARCHAR NOT NULL
    DEFAULT 'https://res.cloudinary.com/dhuk7trpf/image/upload/v1777876738/j4n3sxf5c2qo8h3zam9l.jpg';
