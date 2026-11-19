-- Circulars: DHR notices sent to the university community by SMS, email and
-- the staff portal. The legacy `circular` table is kept (its targeting
-- columns keep their meaning) and gains a publishing workflow.
--
--   stage          DRAFT → PUBLISHED → ARCHIVED (legacy rows are ARCHIVED).
--                  `status` mirrors it for the legacy readers: 1 = published.
--   send_email /   channels besides SMS (`send_sms` is the legacy flag).
--   send_portal
--   cat_unit_children  include the sub-units of the chosen units.
ALTER TABLE circular
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE circular
  ADD COLUMN stage ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT' AFTER status,
  ADD COLUMN send_email TINYINT NOT NULL DEFAULT 1 AFTER send_sms,
  ADD COLUMN send_portal TINYINT NOT NULL DEFAULT 1 AFTER send_email,
  ADD COLUMN cat_unit_children TINYINT NOT NULL DEFAULT 1 AFTER cat_unit_status,
  ADD COLUMN attachment_name VARCHAR(255) NULL AFTER attachment,
  ADD COLUMN recipient_count INT NULL,
  ADD COLUMN published_at DATETIME NULL,
  ADD COLUMN published_by INT NULL COMMENT 'hrms_users.id',
  ADD COLUMN archived_at DATETIME NULL,
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  ADD INDEX idx_circular_stage (stage, published_at);

-- Everything sent from the old system is history.
UPDATE circular SET stage = 'ARCHIVED', published_at = created_at, archived_at = created_at, send_email = 0, send_portal = 0;

-- Who a circular went to, and the staff-portal notification created for them.
-- SMS and email delivery for each person is logged in hrms_notifications
-- (kind 'circular', key circular:<id>:<staff_no>:<channel>).
CREATE TABLE IF NOT EXISTS hrms_circular_recipients (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  circular_id INT UNSIGNED NOT NULL,
  staff_no INT NOT NULL,
  notification_id INT NULL COMMENT 'legacy notification.id (staff portal)',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_circular_staff (circular_id, staff_no),
  KEY idx_recipient_staff (staff_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff-portal notifications are read per staff member, newest first.
ALTER TABLE notification ADD INDEX idx_notification_staff (staff_no, datetime);
