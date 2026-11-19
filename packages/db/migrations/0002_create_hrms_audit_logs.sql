CREATE TABLE IF NOT EXISTS hrms_audit_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NULL,
  action VARCHAR(30) NOT NULL,
  entity VARCHAR(40) NOT NULL,
  entity_id INT NULL,
  summary VARCHAR(500) NOT NULL,
  ip VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_hrms_audit_entity (entity, entity_id),
  KEY idx_hrms_audit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
