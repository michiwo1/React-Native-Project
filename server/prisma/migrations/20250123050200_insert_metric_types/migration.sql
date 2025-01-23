-- Insert metric types with CUID-compatible IDs
INSERT INTO "MetricType" (id, name, unit, created_at, updated_at) VALUES
('clrqw0g0h000108l45wj7d1jx', 'weight', 'kg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clrqw0g0h000208l45k8f2m9y', 'height', 'cm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clrqw0g0h000308l4592h3n0z', 'body_fat', '%', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clrqw0g0h000408l45p4j4o1a', 'muscle_mass', 'kg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clrqw0g0h000508l45r6k5p2b', 'bmi', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clrqw0g0h000608l45t8l6q3c', 'calories', 'kcal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clrqw0g0h000708l45v0m7r4d', 'protein', 'g', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clrqw0g0h000808l45x2n8s5e', 'carbs', 'g', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clrqw0g0h000908l45z4o9t6f', 'fat', 'g', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 