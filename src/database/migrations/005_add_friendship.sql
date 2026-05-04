-- Friendship between two users.
-- Stored directionally (requester sent the request to receiver) so we can
-- show "X sent you a friend request" vs "you sent X a request" in the UI.
-- A friendship counts as mutual once status = 'accepted'.

CREATE TABLE friendship (
    requester_id    UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    receiver_id     UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status          VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    created_at      TIMESTAMP DEFAULT now(),
    PRIMARY KEY (requester_id, receiver_id),
    CHECK (requester_id <> receiver_id)
);
