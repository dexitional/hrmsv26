-- Leave applications: the emergency contact was INT(10) ZEROFILL, which cannot
-- hold "+233…" numbers; record when HR keyed an application in for a staff member.
ALTER TABLE leave_dump
  MODIFY COLUMN emergency_contact VARCHAR(20) DEFAULT NULL COMMENT 'Emergency contact Number',
  ADD COLUMN entered_by INT UNSIGNED NULL COMMENT 'HRMS user who entered the application on the staff member''s behalf',
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL;
