-- Administrators can "switch access" into the staff portal as a staff member
-- (Admin → Staff → Switch Access); those sessions are logged as 'switch'.
ALTER TABLE hrms_staff_logins MODIFY method ENUM('google', 'code', 'admin', 'dev', 'switch') NOT NULL;
