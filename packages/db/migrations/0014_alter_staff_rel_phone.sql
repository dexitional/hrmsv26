-- Relatives' phone numbers were INT(10) ZEROFILL, which cannot hold "+233…"
-- numbers. Existing values keep their zero-filled text.
ALTER TABLE staff_rel
  MODIFY COLUMN phone VARCHAR(20) DEFAULT NULL COMMENT 'Contact of Relative',
  ADD KEY idx_staff_rel_staff (staff_no);
