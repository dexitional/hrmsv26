-- "Summary of current year objectives" was VARCHAR(100), too short for a summary.
ALTER TABLE staff_appraisal MODIFY curr_year_obj TEXT NULL;
