-- triggers_and_procs.sql
USE medicine_tracker;

DROP PROCEDURE IF EXISTS check_and_update_expiry;
DELIMITER $$
CREATE PROCEDURE check_and_update_expiry()
BEGIN
  UPDATE Medicine SET status='expired' WHERE expiry_date < CURRENT_DATE();
  UPDATE Medicine SET status='near-expiry' WHERE expiry_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY);
  UPDATE Medicine SET status='active' WHERE expiry_date > DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY);
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_after_update_quantity;
DELIMITER $$
CREATE TRIGGER trg_after_update_quantity
AFTER UPDATE ON Medicine
FOR EACH ROW
BEGIN
  IF NEW.quantity < NEW.reorder_level THEN
    INSERT INTO Refill (medicine_id, suggested_quantity, suggested_date, status)
    VALUES (NEW.medicine_id, (NEW.reorder_level - NEW.quantity), CURRENT_DATE(), 'open');
  END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS create_order_from_refill;
DELIMITER $$
CREATE PROCEDURE create_order_from_refill(IN refillId INT)
BEGIN
  DECLARE mid INT; DECLARE sug_qty INT; DECLARE supid INT;
  SELECT medicine_id, suggested_quantity INTO mid, sug_qty FROM Refill WHERE refill_id = refillId;
  SELECT supplier_id INTO supid FROM Medicine WHERE medicine_id = mid;
  INSERT INTO OrderTable (supplier_id, order_date, total_amount, status) VALUES (supid, CURRENT_DATE(), 0, 'placed');
  SET @oid = LAST_INSERT_ID();
  SELECT price INTO @unit_price FROM Medicine WHERE medicine_id = mid;
  INSERT INTO OrderDetail (order_id, medicine_id, unit_price, quantity, subtotal) VALUES (@oid, mid, @unit_price, sug_qty, @unit_price * sug_qty);
  UPDATE OrderTable SET total_amount = (SELECT SUM(subtotal) FROM OrderDetail WHERE order_id = @oid) WHERE order_id = @oid;
  UPDATE Refill SET status='ordered' WHERE refill_id = refillId;
END$$
DELIMITER ;
