-- Free-text title of the position (the legacy `post` enum is kept as the rank).
ALTER TABLE position
  ADD COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 NULL AFTER post,
  ADD COLUMN remark TEXT NULL,
  ADD COLUMN created_at TIMESTAMP NULL DEFAULT NULL,
  ADD KEY idx_position_staff (staff_no),
  ADD KEY idx_position_end (end_date);
