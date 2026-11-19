-- Sign-in accounts for the HR admin platform (HR officers and IT support).
-- Kept apart from the legacy `user` table, which the staff portal still uses.
CREATE TABLE IF NOT EXISTS hrms_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  role ENUM('administrator', 'hr_officer', 'it_support', 'viewer') NOT NULL DEFAULT 'hr_officer',
  staff_no INT NULL,
  password_hash VARCHAR(100) NULL,
  google_sub VARCHAR(100) NULL,
  avatar_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hrms_users_email (email),
  UNIQUE KEY uq_hrms_users_google (google_sub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
