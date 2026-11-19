-- Delivery figures per circular (and other entities) are read by kind + entity.
ALTER TABLE hrms_notifications ADD INDEX idx_hrms_notifications_entity (kind, entity_id, channel, status);
