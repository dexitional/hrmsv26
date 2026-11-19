-- A unit merged into another keeps its row (history still points at it) but
-- is deactivated and records the master unit it was folded into.
ALTER TABLE unit
  ADD COLUMN merged_into INT NULL,
  ADD COLUMN merged_at DATETIME NULL;
