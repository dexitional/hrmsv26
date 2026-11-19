-- Disciplinary actions: fix the legacy "WARNINIG" spelling and record when
-- entries are created.
UPDATE disciplinary SET action_type = 'WARNING' WHERE action_type = 'WARNINIG';
ALTER TABLE disciplinary
  ADD COLUMN created_at TIMESTAMP NULL DEFAULT NULL,
  ADD KEY idx_disciplinary_staff (staff_no);
