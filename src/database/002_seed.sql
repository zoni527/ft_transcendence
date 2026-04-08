-- Seed data for testing
-- This file runs automatically on first DB init (after 001_initial_schema.sql)

INSERT INTO "user" (email, password_hash, name, display_name) VALUES
    ('alice@test.com', 'hash001', 'Alice Smith', 'alice'),
    ('bob@test.com', 'hash002', 'Bob Jones', 'bobby'),
    ('charlie@test.com', 'hash003', 'Charlie Brown', 'charlie'),
    ('diana@test.com', 'hash004', 'Diana Prince', 'wonder_di'),
    ('eve@test.com', 'hash005', 'Eve Taylor', 'evee');
