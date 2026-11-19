-- Staff portal: staff and heads sign in to their own section.
--
-- One-time sign-in codes, sent by SMS and email to the contact details on the
-- staff record (an alternative to Google sign-in with the UCC email). Only a
-- hash of the code is stored.
CREATE TABLE IF NOT EXISTS hrms_staff_codes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  staff_no INT NOT NULL,
  code_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_staff_codes_staff (staff_no, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Portal sign-ins (staff number, how, when), for the activity log.
CREATE TABLE IF NOT EXISTS hrms_staff_logins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  staff_no INT NOT NULL,
  method ENUM('google', 'code', 'admin', 'dev') NOT NULL,
  ip VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_staff_logins_staff (staff_no, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support services (IT helpdesk, Eduroam & Wi-Fi, XPay, counselling, HR
-- enquiries) are requests in the legacy staff_request table.
ALTER TABLE staff_request
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE staff_request
  ADD COLUMN category ENUM('IT', 'EDUROAM', 'XPAY', 'COUNSELLING', 'HR') NOT NULL DEFAULT 'HR' AFTER staff_no,
  ADD COLUMN attachment_name VARCHAR(255) NULL AFTER attachment,
  ADD COLUMN response TEXT NULL,
  ADD COLUMN responded_by INT NULL COMMENT 'hrms_users.id',
  ADD COLUMN responded_at DATETIME NULL,
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  ADD INDEX idx_staff_request_staff (staff_no, created_at),
  ADD INDEX idx_staff_request_queue (category, status);
-- status (legacy VARCHAR): OPEN → IN_PROGRESS → RESOLVED, or CLOSED by the staff member.
