ALTER TABLE transfer
  ADD COLUMN created_at TIMESTAMP NULL DEFAULT NULL,
  ADD KEY idx_transfer_staff (staff_no);
