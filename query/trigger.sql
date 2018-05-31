
DROP TRIGGER IF EXISTS Schedules_BI01_TG;
DROP TRIGGER IF EXISTS Schedules_BI02_TG;

DELIMITER $$

CREATE TRIGGER Schedules_BI01_TG BEFORE INSERT ON Schedules
FOR EACH ROW
BEGIN
    IF (NEW.user_id IS NULL AND NEW.group_id IS NULL) OR (NEW.user_id IS NOT NULL AND NEW.group_id IS NOT NULL) THEN
        SIGNAL SQLSTATE '12345'
            SET MESSAGE_TEXT = 'One and only one of Schedules.user_id and Schedules.group_id is NULL.';
    END IF;
END$$

CREATE TRIGGER Schedules_BI02_TG BEFORE INSERT ON Schedules
FOR EACH ROW
BEGIN
    IF NEW.start_time > NEW.end_time THEN
        SIGNAL SQLSTATE '12345'
            SET MESSAGE_TEXT = 'Start time should be earlier than end time.';
    END IF;
END$$

DELIMITER ;
