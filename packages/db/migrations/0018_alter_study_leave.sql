-- A granted study leave can come from an approved intention to study or a
-- study leave request, and is tracked until the staff member resumes.
ALTER TABLE study_leave
  ADD COLUMN intention_id INT NULL,
  ADD COLUMN request_id INT NULL,
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ON_LEAVE',
  ADD COLUMN remark TEXT NULL,
  ADD COLUMN created_at TIMESTAMP NULL DEFAULT NULL,
  ADD KEY idx_study_leave_staff (staff_no);
