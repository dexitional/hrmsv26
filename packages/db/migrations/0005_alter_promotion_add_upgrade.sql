-- Elevation records: appointments, promotions and (new) upgrades, with the
-- date of the letter that conveyed them.
-- Legacy rows hold '' (the enum error value); treat them as unknown.
UPDATE promotion SET apply_type = NULL WHERE apply_type = '';

ALTER TABLE promotion
  MODIFY COLUMN apply_type ENUM('APPOINTMENT', 'PROMOTION', 'UPGRADE') DEFAULT NULL
    COMMENT 'Elevation type (APPOINTMENT, PROMOTION or UPGRADE)',
  ADD COLUMN letter_date DATE NULL AFTER confirm_date,
  ADD COLUMN remark TEXT NULL,
  ADD COLUMN created_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL,
  ADD KEY idx_promotion_staff (staff_no);
