-- Insert exercise categories
INSERT INTO "ExerciseCategory" (id, name, display_order, created_at, updated_at)
VALUES
  ('cat_leg', 'Leg', 1, NOW(), NOW()),
  ('cat_chest', 'Chest', 2, NOW(), NOW()),
  ('cat_back', 'Back', 3, NOW(), NOW()),
  ('cat_shoulder', 'Shoulder', 4, NOW(), NOW()),
  ('cat_arms', 'Arms', 5, NOW(), NOW()),
  ('cat_core', 'Core', 6, NOW(), NOW());

-- Insert exercises
INSERT INTO "Exercise" (id, category_id, name, description, created_at, updated_at)
VALUES
  ('ex_back_squat', 'cat_leg', 'Back Squat', 'A compound exercise that primarily targets the quadriceps, hamstrings, and glutes.', NOW(), NOW()),
  ('ex_deadlift', 'cat_leg', 'Conventional Deadlift', 'A compound exercise that targets the posterior chain, including the back, glutes, and hamstrings.', NOW(), NOW()),
  ('ex_front_squat', 'cat_leg', 'Front Squat', 'A squat variation that emphasizes the quadriceps and core stability.', NOW(), NOW()),
  ('ex_leg_press', 'cat_leg', 'Leg Press', 'A machine exercise that targets the quadriceps, hamstrings, and glutes.', NOW(), NOW()),
  ('ex_leg_curl', 'cat_leg', 'Leg Curl', 'An isolation exercise that targets the hamstrings.', NOW(), NOW()),
  ('ex_leg_extension', 'cat_leg', 'Leg Extension', 'An isolation exercise that targets the quadriceps.', NOW(), NOW()),
  ('ex_lunge', 'cat_leg', 'Dumbbell Lunge', 'A unilateral exercise that targets the legs and improves balance.', NOW(), NOW()),
  ('ex_sumo_deadlift', 'cat_leg', 'Sumo Deadlift', 'A deadlift variation that emphasizes the inner thighs and quadriceps.', NOW(), NOW()),
  ('ex_calf_raise', 'cat_leg', 'Standing Calf Raise', 'An isolation exercise that targets the calves.', NOW(), NOW()),
  
  ('ex_bench_press', 'cat_chest', 'Bench Press', 'A compound exercise that primarily targets the chest, shoulders, and triceps.', NOW(), NOW()),
  ('ex_incline_press', 'cat_chest', 'Incline Press', 'A bench press variation that emphasizes the upper chest.', NOW(), NOW()),
  ('ex_dips', 'cat_chest', 'Chest Dips', 'A bodyweight exercise that targets the chest, shoulders, and triceps.', NOW(), NOW()),
  
  ('ex_pullup', 'cat_back', 'Pull-up', 'A compound bodyweight exercise that targets the back and biceps.', NOW(), NOW()),
  ('ex_row', 'cat_back', 'Barbell Row', 'A compound exercise that targets the back and biceps.', NOW(), NOW()),
  ('ex_lat_pulldown', 'cat_back', 'Lat Pulldown', 'A machine exercise that mimics the pull-up movement.', NOW(), NOW()),
  
  ('ex_overhead_press', 'cat_shoulder', 'Overhead Press', 'A compound exercise that targets the shoulders and triceps.', NOW(), NOW()),
  ('ex_lateral_raise', 'cat_shoulder', 'Lateral Raise', 'An isolation exercise that targets the lateral deltoids.', NOW(), NOW()),
  
  ('ex_bicep_curl', 'cat_arms', 'Bicep Curl', 'An isolation exercise that targets the biceps.', NOW(), NOW()),
  ('ex_tricep_extension', 'cat_arms', 'Tricep Extension', 'An isolation exercise that targets the triceps.', NOW(), NOW()),
  
  ('ex_plank', 'cat_core', 'Plank', 'An isometric exercise that targets the core muscles.', NOW(), NOW()),
  ('ex_crunch', 'cat_core', 'Crunch', 'An isolation exercise that targets the abdominal muscles.', NOW(), NOW()); 