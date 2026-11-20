-- Relative codes are renumbered (spouses, children, parents, then others) when
-- a family changes, and once for every family (npm run db:renumber-relatives).
-- Every code that moves is kept here, so an old code can still be traced.
CREATE TABLE IF NOT EXISTS hrms_relative_code_history (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  relative_id INT NOT NULL,
  staff_no INT NOT NULL,
  old_code VARCHAR(20) NULL,
  new_code VARCHAR(20) NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'app',
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_relcode_old (old_code),
  KEY ix_relcode_staff (staff_no),
  KEY ix_relcode_relative (relative_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
