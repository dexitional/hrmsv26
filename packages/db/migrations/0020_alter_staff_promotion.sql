-- Promotion / appointment applications: the HR processing step reached
-- (hr_variable id) and the promotion record created when the outcome is
-- effected.
ALTER TABLE staff_promotion
  ADD COLUMN hr_step VARCHAR(2) NULL,
  ADD COLUMN effected_promo_id INT NULL,
  ADD KEY idx_staff_promotion_staff (staff_no),
  ADD KEY idx_staff_promotion_status (promo_status);
