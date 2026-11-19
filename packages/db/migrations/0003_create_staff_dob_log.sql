-- Every change to a staff member's date of birth, for audit.
CREATE TABLE IF NOT EXISTS staff_dob_log (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  staff_no INT NOT NULL,
  old_dob DATE NULL,
  new_dob DATE NOT NULL,
  reason TEXT NOT NULL,
  evidence_url VARCHAR(500) NULL,
  changed_by INT UNSIGNED NULL,
  changed_by_name VARCHAR(150) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_dob_log_staff (staff_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
