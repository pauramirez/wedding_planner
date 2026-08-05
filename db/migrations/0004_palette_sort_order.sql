-- 0004_palette_sort_order.sql — allow drag-to-reorder in the palette panel.
-- Existing rows are backfilled with their id as sort_order so current order is preserved.

ALTER TABLE palette ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
UPDATE palette SET sort_order = id;
CREATE INDEX idx_palette_sort_order ON palette(sort_order);
