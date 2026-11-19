-- Appraisals in the staff portal. The legacy sign-off columns hold fixed
-- words ("Employee Signed", "Supervisor Signed") and are still written for
-- the old readers; these columns record who signed and when.
--
-- staff_appraisal (Form A, one row per question, header repeated):
--   app_status 1 = completed by the supervisor, 2 = commented on and signed by the staff member.
-- staff_self_appraisal (Form B):
--   app_status 1 = submitted by the staff member, 2 = countersigned by the supervisor.
ALTER TABLE staff_appraisal
  ADD COLUMN supervisor_staff_no INT NULL AFTER supervisors_rank,
  ADD COLUMN sup_signed_at DATETIME NULL,
  ADD COLUMN emp_signed_at DATETIME NULL,
  ADD INDEX idx_staff_appraisal_year (staff_no, yr_onreview);

ALTER TABLE staff_self_appraisal
  ADD COLUMN supervisor_staff_no INT NULL AFTER supervisors_rank,
  ADD COLUMN sup_signed_at DATETIME NULL,
  ADD COLUMN emp_signed_at DATETIME NULL,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  ADD INDEX idx_self_appraisal_year (staff_no, yr_onreview);

-- The question bank was saved through a mis-set connection: "â€™" for "’".
UPDATE appraisal_question SET question = REPLACE(REPLACE(REPLACE(REPLACE(question, 'â€™', '’'), 'â€“', '–'), 'â€œ', '“'), 'â€\x9d', '”')
 WHERE question LIKE '%â€%';
