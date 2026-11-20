-- A 4-digit PIN each staff member sets to unlock their payslips in the staff
-- portal (as the old XPay portal had). Stored as a bcrypt hash; after five
-- wrong tries the PIN is locked for 15 minutes. HR can reset a forgotten PIN.
CREATE TABLE hrms_payslip_pins (
  staff_no         INT UNSIGNED NOT NULL,
  pin_hash         VARCHAR(100) NOT NULL,
  failed_attempts  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until     DATETIME NULL,
  set_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (staff_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
