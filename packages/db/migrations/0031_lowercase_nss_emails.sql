-- National service emails are stored in lower case (the form already saves
-- them that way); legacy rows were often typed in capitals.
UPDATE nss SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL AND BINARY email <> BINARY LOWER(TRIM(email));
UPDATE nss SET emergency_email = LOWER(TRIM(emergency_email)) WHERE emergency_email IS NOT NULL AND BINARY emergency_email <> BINARY LOWER(TRIM(emergency_email));
