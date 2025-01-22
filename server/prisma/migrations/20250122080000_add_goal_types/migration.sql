-- Insert goal types
INSERT INTO "GoalType" (id, name, created_at, updated_at)
VALUES 
  ('goal_muscle_gain', '筋肥大', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('goal_weight_loss', '減量', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('goal_maintenance', '維持', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 