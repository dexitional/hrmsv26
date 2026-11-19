-- HR now edits intentions to study on staff members' behalf, and records
-- study leave and decisions; names and programmes can hold characters
-- Latin-1 cannot store (ɛ, ɔ…). Existing Latin-1 text converts without loss.
ALTER TABLE study_intention CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE tndstudy_activities CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE study_leave CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE study_request CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
