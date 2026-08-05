-- seed.sql — starter tasks copied from the original single-file planner
-- Safe to run multiple times: only inserts when tables are empty.

INSERT INTO tasks (cat, title, owner, status)
SELECT 'vancouver', 'Book officiant / marriage commissioner', 'Both', 'todo'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE cat='vancouver');
INSERT INTO tasks (cat, title, owner, status) SELECT 'vancouver', 'Confirm 2 witnesses (both 19+)', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='vancouver') = 1;
INSERT INTO tasks (cat, title, owner, status) SELECT 'vancouver', 'Apply for BC marriage licence ($100, valid 90 days)', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='vancouver') = 2;
INSERT INTO tasks (cat, title, owner, status) SELECT 'vancouver', 'Book ceremony location', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='vancouver') = 3;
INSERT INTO tasks (cat, title, owner, status) SELECT 'vancouver', 'Buy rings for civil ceremony', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='vancouver') = 4;
INSERT INTO tasks (cat, title, owner, status) SELECT 'vancouver', 'After ceremony: order official BC certificate + apostille', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='vancouver') = 5;
INSERT INTO tasks (cat, title, owner, status) SELECT 'vancouver', 'Certified Spanish translation of certificate', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='vancouver') = 6;

INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Choose parish/church and confirm date availability', 'Both', 'todo' WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE cat='colombia');
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'First meeting with the priest to start the file', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 1;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Complete curso prematrimonial', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 2;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Request baptism certificates (both)', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 3;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Request confirmation certificates (both)', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 4;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Present apostilled + translated BC certificate to parish', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 5;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Choose padrinos/madrinas', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 6;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Book reception venue', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 7;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Book catering', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 8;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Book band/DJ', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 9;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Arrange flowers & decor', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 10;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Wedding dress', 'Paula', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 11;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Suit / formalwear for fiancé', 'Fiancé', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 12;
INSERT INTO tasks (cat, title, owner, status) SELECT 'colombia', 'Book photographer & videographer', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='colombia') = 13;

INSERT INTO tasks (cat, title, owner, status) SELECT 'shared', 'Set overall budget & who covers what', 'Both', 'todo' WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE cat='shared');
INSERT INTO tasks (cat, title, owner, status) SELECT 'shared', 'Decide which guests are invited to which ceremony', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='shared') = 1;
INSERT INTO tasks (cat, title, owner, status) SELECT 'shared', 'Choose & buy wedding rings', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='shared') = 2;
INSERT INTO tasks (cat, title, owner, status) SELECT 'shared', 'Plan honeymoon', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='shared') = 3;
INSERT INTO tasks (cat, title, owner, status) SELECT 'shared', 'Book flights between Vancouver and Colombia', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='shared') = 4;
INSERT INTO tasks (cat, title, owner, status) SELECT 'shared', 'Set up gift registry', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='shared') = 5;
INSERT INTO tasks (cat, title, owner, status) SELECT 'shared', 'Send save-the-dates for both events', 'Both', 'todo' WHERE (SELECT COUNT(*) FROM tasks WHERE cat='shared') = 6;

INSERT INTO palette (hex, name) SELECT '#1B2A3D', 'Ink navy' WHERE NOT EXISTS (SELECT 1 FROM palette);
INSERT INTO palette (hex, name) SELECT '#C89B3C', 'Warm gold' WHERE (SELECT COUNT(*) FROM palette) = 1;
INSERT INTO palette (hex, name) SELECT '#B5502F', 'Terracotta clay' WHERE (SELECT COUNT(*) FROM palette) = 2;
INSERT INTO palette (hex, name) SELECT '#4A7C7C', 'Pacific mist' WHERE (SELECT COUNT(*) FROM palette) = 3;
