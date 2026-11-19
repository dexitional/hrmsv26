-- Benefits offered with study leave (the legacy table was empty).
INSERT INTO study_benefit (title)
SELECT * FROM (
  SELECT 'Study leave with pay' UNION ALL SELECT 'Study leave with pay and additional packages'
  UNION ALL SELECT 'Study leave without pay' UNION ALL SELECT 'Tuition / fees support'
  UNION ALL SELECT 'Research grant' UNION ALL SELECT 'Book and research allowance'
) b WHERE NOT EXISTS (SELECT 1 FROM study_benefit);
