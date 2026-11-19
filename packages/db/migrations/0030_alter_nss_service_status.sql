-- National service status. The yearly job (1 November) marks personnel whose
-- service has ended as COMPLETED and thanks them by SMS. Personnel whose
-- service ended before this column existed are marked completed silently.
ALTER TABLE nss
  ADD COLUMN service_status ENUM('SERVING', 'COMPLETED') NOT NULL DEFAULT 'SERVING' AFTER end_date,
  ADD COLUMN completed_at DATETIME NULL AFTER service_status;
UPDATE nss SET service_status = 'COMPLETED' WHERE end_date IS NOT NULL AND end_date < CURDATE();
