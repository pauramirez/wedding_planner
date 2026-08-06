-- 0005_rsvp_tokens.sql — per-guest RSVP tokens for QR check-ins.
-- Each guest gets a random 128-bit hex token; guests use their unique link
-- to submit an RSVP without seeing the rest of the planner.

ALTER TABLE guests ADD COLUMN rsvp_token TEXT;
UPDATE guests SET rsvp_token = lower(hex(randomblob(16))) WHERE rsvp_token IS NULL;
CREATE UNIQUE INDEX idx_guests_rsvp_token ON guests(rsvp_token);
