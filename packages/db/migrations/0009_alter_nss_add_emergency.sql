ALTER TABLE nss
  MODIFY COLUMN mobile VARCHAR(20) DEFAULT NULL,
  ADD COLUMN emergency_address VARCHAR(300) NULL AFTER emergency_contact,
  ADD COLUMN emergency_phone VARCHAR(30) NULL AFTER emergency_address,
  ADD COLUMN emergency_email VARCHAR(190) NULL AFTER emergency_phone,
  ADD KEY idx_nss_no (nss_no);
