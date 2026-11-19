-- Scheduled jobs (daily 07:00 GMT; NSS on 1 November). A scheduled run is
-- recorded once per period so it never repeats; manual runs are logged too.
CREATE TABLE IF NOT EXISTS hrms_job_runs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  job VARCHAR(40) NOT NULL,
  period VARCHAR(20) NOT NULL,
  trigger_type ENUM('schedule', 'manual') NOT NULL,
  triggered_by INT UNSIGNED NULL,
  started_at DATETIME NOT NULL,
  finished_at DATETIME NULL,
  summary TEXT NULL,
  error VARCHAR(500) NULL,
  PRIMARY KEY (id),
  KEY idx_hrms_job_runs_job (job, period, trigger_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
