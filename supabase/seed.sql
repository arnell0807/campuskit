insert into equipment (id, name, category, serial_number, location, condition, status, notes) values
  ('eq-1', 'Canon EOS R50', 'Camera', 'CAM-1042', 'Media Lab', 'Excellent', 'checked-out', 'Includes 18–45mm lens'),
  ('eq-2', 'Sony A7 III', 'Camera', 'CAM-0887', 'Media Lab', 'Good', 'available', 'Two spare batteries in case'),
  ('eq-3', 'MacBook Pro 14', 'Laptop', 'LAP-2319', 'Tech Desk', 'Good', 'checked-out', 'M2 Pro, 16GB RAM'),
  ('eq-4', 'Dell Latitude 5440', 'Laptop', 'LAP-2441', 'Tech Desk', 'Excellent', 'available', ''),
  ('eq-5', 'Rode NT1 Microphone', 'Audio', 'AUD-0522', 'Recording Studio', 'Good', 'available', 'Shock mount included'),
  ('eq-6', 'Zoom H6 Recorder', 'Audio', 'AUD-0401', 'Media Lab', 'Fair', 'repair', 'Input 3 intermittently cuts out'),
  ('eq-7', 'BenQ Portable Projector', 'Projector', 'PRO-0318', 'Library Desk', 'Good', 'checked-out', 'HDMI adapter included'),
  ('eq-8', 'Manfrotto Tripod', 'Accessories', 'ACC-0981', 'Media Lab', 'Good', 'available', '');

insert into students (id, name, student_number, email, department, year) values
  ('stu-1', 'Maya Chen', 'S104825', 'maya.chen@campus.edu', 'Film & Media', '3'),
  ('stu-2', 'Noah Williams', 'S108332', 'noah.williams@campus.edu', 'Computer Science', '2'),
  ('stu-3', 'Amara Okafor', 'S101956', 'amara.okafor@campus.edu', 'Architecture', '4'),
  ('stu-4', 'Leo Martinez', 'S109141', 'leo.martinez@campus.edu', 'Music Technology', '1'),
  ('stu-5', 'Sofia Patel', 'S105773', 'sofia.patel@campus.edu', 'Journalism', '3');

-- Dates are relative to today so the data always looks current, no matter when you run this.
insert into checkouts (id, equipment_id, student_id, checkout_date, due_date, returned_date) values
  ('co-1', 'eq-1', 'stu-1', current_date - 3, current_date + 4, null),
  ('co-2', 'eq-3', 'stu-2', current_date - 8, current_date - 1, null),
  ('co-3', 'eq-7', 'stu-3', current_date - 1, current_date + 6, null),
  ('co-4', 'eq-5', 'stu-4', current_date - 18, current_date - 12, current_date - 13),
  ('co-5', 'eq-2', 'stu-5', current_date - 12, current_date - 6, current_date - 6);
