-- Every SMS and email the HRMS sends (or simulates). dedupe_key makes each
-- notification go out at most once (e.g. "birthday:2026:sms:8436").
CREATE TABLE IF NOT EXISTS hrms_notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  kind VARCHAR(30) NOT NULL,
  channel ENUM('sms', 'email') NOT NULL,
  recipient VARCHAR(190) NOT NULL,
  recipient_name VARCHAR(190) NULL,
  staff_no INT NULL,
  nss_id INT NULL,
  entity_id INT NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'sent', 'simulated', 'failed', 'skipped') NOT NULL DEFAULT 'pending',
  provider VARCHAR(30) NULL,
  provider_ref VARCHAR(120) NULL,
  error VARCHAR(500) NULL,
  dedupe_key VARCHAR(190) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hrms_notifications_dedupe (dedupe_key),
  KEY idx_hrms_notifications_kind (kind, created_at),
  KEY idx_hrms_notifications_staff (staff_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
