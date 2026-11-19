-- Text typed in the staff portal (appraisals, promotion applications and
-- comments) can hold characters Latin-1 cannot store (’, ɛ, ɔ…). Existing
-- Latin-1 text converts without loss.
ALTER TABLE staff_appraisal CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE staff_self_appraisal CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE staff_promotion CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE promo_activities CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
