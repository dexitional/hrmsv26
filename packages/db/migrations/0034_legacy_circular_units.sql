-- The old HRMS matched circular units exactly, without their sub-units.
UPDATE circular SET cat_unit_children = 0 WHERE stage = 'ARCHIVED' AND published_by IS NULL;
