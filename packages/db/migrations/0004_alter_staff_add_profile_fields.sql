-- Structured emergency contact and a nationality picked from the country list.
-- The legacy free-text `emergency_contact` and `country` columns are kept.
ALTER TABLE staff
  ADD COLUMN nationality VARCHAR(80) CHARACTER SET utf8mb4 NULL AFTER country,
  ADD COLUMN emergency_name VARCHAR(150) CHARACTER SET utf8mb4 NULL AFTER emergency_contact,
  ADD COLUMN emergency_relation VARCHAR(80) CHARACTER SET utf8mb4 NULL AFTER emergency_name,
  ADD COLUMN emergency_phone VARCHAR(30) CHARACTER SET utf8mb4 NULL AFTER emergency_relation,
  ADD COLUMN emergency_address VARCHAR(300) CHARACTER SET utf8mb4 NULL AFTER emergency_phone;

UPDATE staff SET nationality = CASE UPPER(TRIM(country))
    WHEN 'GHANAIAN' THEN 'Ghana' WHEN 'NIGERIAN' THEN 'Nigeria' WHEN 'BURKINABE' THEN 'Burkina Faso'
    WHEN 'BENINOIS' THEN 'Benin' WHEN 'TOGOLESE' THEN 'Togo' WHEN 'UKRAINIAN' THEN 'Ukraine'
    WHEN 'CANADIAN' THEN 'Canada' WHEN 'NIGERIEN' THEN 'Niger' WHEN 'KENYAN' THEN 'Kenya'
    WHEN 'SIERRA LEONEAN' THEN 'Sierra Leone' WHEN 'CAMEROONIAN' THEN 'Cameroon' WHEN 'IVORIAN' THEN 'Côte d''Ivoire'
    WHEN 'AMERICAN' THEN 'United States' WHEN 'BRITISH' THEN 'United Kingdom' WHEN 'INDIAN' THEN 'India'
    WHEN 'CHINESE' THEN 'China' WHEN 'GERMAN' THEN 'Germany' WHEN 'LIBERIAN' THEN 'Liberia'
    WHEN 'GAMBIAN' THEN 'Gambia' WHEN 'ZIMBABWEAN' THEN 'Zimbabwe' WHEN 'SOUTH AFRICAN' THEN 'South Africa'
    ELSE NULLIF(TRIM(country), '') END
  WHERE nationality IS NULL;
