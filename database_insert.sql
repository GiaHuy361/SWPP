-- Insert dữ liệu thật cho hệ thống quản lý chương trình truyền thông phòng chống ma túy
-- Phù hợp với cấu trúc database và chủ đề e-learning

-- Insert into communication_programs
INSERT INTO communication_programs (program_id, average_rating, created_at, description, end_date, feedback_count,
    final_average_rating, interaction_count, participant_count, start_date, status, title, updated_at)
VALUES
(1, 4.2, '2025-01-15 08:00:00', 'Chương trình tuyên truyền nâng cao nhận thức về tác hại của ma túy trong cộng đồng. Bao gồm các hoạt động thảo luận, chia sẻ kinh nghiệm và video giáo dục về những tác động tiêu cực của ma túy đối với sức khỏe, gia đình và xã hội.', '2025-12-31 23:59:59', 32, 4.5, 156, 120, '2025-01-15 08:00:00', 'ACTIVE', 'Nói Không Với Ma Túy - Bảo Vệ Tương Lai', '2025-07-08 10:00:00'),

(2, 4.0, '2025-02-01 09:00:00', 'Chương trình giáo dục phòng chống tệ nạn xã hội dành cho học sinh, sinh viên. Tập trung vào việc nhận biết các loại ma túy mới, cách từ chối lời mời sử dụng và xây dựng lối sống tích cực, lành mạnh.', '2025-11-30 23:59:59', 28, 4.3, 94, 85, '2025-02-01 09:00:00', 'ACTIVE', 'Thanh Niên Khỏe Mạnh - Tương Lai Tươi Sáng', '2025-07-08 10:00:00'),

(3, 4.7, '2025-02-15 10:00:00', 'Hội thảo chuyên sâu về tác động của ma túy đối với não bộ và hệ thần kinh. Cung cấp kiến thức khoa học về cơ chế hoạt động của các chất gây nghiện và quá trình phục hồi sau cai nghiện.', '2025-10-15 23:59:59', 45, 4.8, 203, 67, '2025-02-15 10:00:00', 'ACTIVE', 'Khoa Học Về Ma Túy - Hiểu Để Tránh', '2025-07-08 10:00:00'),

(4, 3.8, '2025-03-01 08:30:00', 'Chương trình hỗ trợ gia đình có người thân nghiện ma túy. Chia sẻ kinh nghiệm, phương pháp can thiệp và cách thức hỗ trợ người nghiện trong quá trình cai nghiện và tái hòa nhập cộng đồng.', '2025-09-30 23:59:59', 38, 4.1, 127, 54, '2025-03-01 08:30:00', 'ACTIVE', 'Gia Đình Vững Mạnh - Vượt Qua Nghiện Hóa', '2025-07-08 10:00:00'),

(5, 4.3, '2025-03-15 14:00:00', 'Khóa học trực tuyến về pháp luật liên quan đến ma túy tại Việt Nam. Tìm hiểu về các quy định pháp lý, hình phạt và hậu quả pháp lý khi tàng trữ, sử dụng hoặc mua bán ma túy.', '2025-08-31 23:59:59', 22, 4.4, 78, 43, '2025-03-15 14:00:00', 'ACTIVE', 'Pháp Luật Về Ma Túy - Biết Để Tránh', '2025-07-08 10:00:00'),

(6, 3.9, '2025-04-01 09:30:00', 'Chương trình tập huấn cho cán bộ, giáo viên về kỹ năng tư vấn và can thiệp sớm đối với học sinh có nguy cơ tiếp xúc với ma túy. Bao gồm các kỹ năng giao tiếp và phương pháp giáo dục hiệu quả.', '2025-12-15 23:59:59', 31, 4.2, 89, 36, '2025-04-01 09:30:00', 'ACTIVE', 'Tập Huấn Tư Vấn Phòng Chống Ma Túy', '2025-07-08 10:00:00'),

(7, 4.5, '2025-04-15 15:00:00', 'Chiến dịch truyền thông trên mạng xã hội nhằm nâng cao nhận thức về tác hại của ma túy. Sử dụng các nội dung multimedia, video viral và câu chuyện thật để lan tỏa thông điệp tích cực.', '2025-07-31 23:59:59', 67, 4.6, 312, 189, '2025-04-15 15:00:00', 'ACTIVE', 'Mạng Xã Hội Sạch - Cuộc Sống Khỏe', '2025-07-08 10:00:00'),

(8, 3.6, '2025-05-01 11:00:00', 'Chương trình thể thao và hoạt động ngoại khóa nhằm tạo môi trường lành mạnh, giúp thanh niên tránh xa ma túy. Bao gồm các hoạt động thể thao, nghệ thuật và các câu lạc bộ tích cực.', '2025-06-30 23:59:59', 19, 3.8, 56, 34, '2025-05-01 11:00:00', 'COMPLETED', 'Thể Thao Thay Thế Ma Túy', '2025-07-08 10:00:00'),

(9, 4.1, '2025-05-15 13:30:00', 'Hội thảo về các phương pháp điều trị và phục hồi chức năng cho người nghiện ma túy. Giới thiệu các mô hình điều trị hiện đại và câu chuyện thành công trong việc cai nghiện.', '2025-11-15 23:59:59', 26, 4.3, 98, 41, '2025-05-15 13:30:00', 'ACTIVE', 'Phục Hồi Và Tái Hòa Nhập', '2025-07-08 10:00:00'),

(10, 4.4, '2025-06-01 16:00:00', 'Chương trình đào tạo kỹ năng sống cho trẻ em và thanh thiếu niên nhằm tăng cường khả năng chống chịu trước các tác nhân xấu. Tập trung vào việc xây dựng lòng tự trọng, kỹ năng ra quyết định và giao tiếp hiệu quả.', '2025-10-31 23:59:59', 35, 4.6, 145, 78, '2025-06-01 16:00:00', 'ACTIVE', 'Kỹ Năng Sống - Tự Bảo Vệ Mình', '2025-07-08 10:00:00');

-- Insert into feedbacks với nội dung thật về phòng chống ma túy
INSERT INTO feedbacks (feedback_id, comment, created_at, rating, program_id, user_id)
VALUES
(1, 'Chương trình rất bổ ích, giúp tôi hiểu rõ hơn về tác hại của ma túy. Những video và câu chuyện thật rất cảm động và thuyết phục.', '2025-03-20 10:30:00', 5, 1, 8),
(2, 'Nội dung hay nhưng cần thêm các hoạt động tương tác. Hy vọng sẽ có thêm các buổi thảo luận trực tiếp.', '2025-03-25 14:15:00', 4, 2, 8),
(3, 'Kiến thức khoa học về ma túy rất chuyên sâu. Đây là chương trình giáo dục tuyệt vời cho mọi độ tuổi.', '2025-04-10 09:45:00', 5, 3, 10),
(4, 'Chương trình giúp gia đình tôi vượt qua khó khăn. Cảm ơn những chia sẻ quý báu từ các chuyên gia.', '2025-04-22 16:20:00', 4, 4, 7),
(5, 'Thông tin pháp luật rất hữu ích. Mọi người nên biết về hậu quả pháp lý khi vi phạm luật ma túy.', '2025-05-05 11:30:00', 4, 5, 5),
(6, 'Khóa tập huấn bổ ích cho công việc giáo dục. Sẽ áp dụng những kỹ năng học được vào thực tế.', '2025-05-15 13:45:00', 4, 6, 3),
(7, 'Chiến dịch truyền thông sáng tạo và thu hút. Các video viral rất ấn tượng và dễ lan truyền.', '2025-06-01 08:25:00', 5, 7, 1),
(8, 'Hoạt động thể thao thay thế tốt. Tuy nhiên cần đa dạng hơn các môn thể thao để thu hút nhiều người tham gia.', '2025-06-10 15:10:00', 3, 8, 7),
(9, 'Hội thảo về điều trị rất chuyên nghiệp. Giúp tôi hiểu thêm về quá trình phục hồi của người nghiện.', '2025-06-25 12:00:00', 4, 9, 3),
(10, 'Chương trình kỹ năng sống thiết thực. Con em chúng ta cần được trang bị những kỹ năng này từ sớm.', '2025-07-05 17:30:00', 5, 10, 10),
(11, 'Tôi đánh giá cao nội dung chương trình. Cần nhân rộng ra nhiều địa phương hơn.', '2025-07-06 09:15:00', 5, 1, 2),
(12, 'Chương trình tạo động lực mạnh mẽ cho thanh niên. Cảm ơn ban tổ chức đã tạo ra môi trường học tập tích cực.', '2025-07-07 14:45:00', 4, 2, 4),
(13, 'Kiến thức khoa học được trình bày dễ hiểu. Phù hợp với mọi đối tượng từ học sinh đến phụ huynh.', '2025-07-08 11:20:00', 5, 3, 6),
(14, 'Chương trình hỗ trợ gia đình rất ý nghĩa. Giúp tôi biết cách đối phó khi có người thân gặp vấn đề.', '2025-07-08 16:00:00', 4, 4, 9),
(15, 'Nội dung pháp luật cần thiết cho mọi công dân. Hy vọng sẽ có thêm các tình huống thực tế.', '2025-07-08 18:30:00', 4, 5, 1);

-- Insert into communication_program_participants
INSERT INTO communication_program_participants (communication_program_program_id, user_id)
VALUES
-- Chương trình 1: Nói Không Với Ma Túy - Bảo Vệ Tương Lai
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
-- Chương trình 2: Thanh Niên Khỏe Mạnh - Tương Lai Tươi Sáng  
(2, 1), (2, 2), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
-- Chương trình 3: Khoa Học Về Ma Túy - Hiểu Để Tránh
(3, 1), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10),
-- Chương trình 4: Gia Đình Vững Mạnh - Vượt Qua Nghiện Hóa
(4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8), (4, 9),
-- Chương trình 5: Pháp Luật Về Ma Túy - Biết Để Tránh
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7),
-- Chương trình 6: Tập Huấn Tư Vấn Phòng Chống Ma Túy
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6),
-- Chương trình 7: Mạng Xã Hội Sạch - Cuộc Sống Khỏe
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7), (7, 8), (7, 9), (7, 10),
-- Chương trình 8: Thể Thao Thay Thế Ma Túy
(8, 2), (8, 4), (8, 6), (8, 7), (8, 8), (8, 9),
-- Chương trình 9: Phục Hồi Và Tái Hòa Nhập
(9, 1), (9, 3), (9, 4), (9, 5), (9, 6), (9, 7), (9, 8),
-- Chương trình 10: Kỹ Năng Sống - Tự Bảo Vệ Mình
(10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8), (10, 9), (10, 10);

-- Cập nhật lại participant_count cho chính xác
UPDATE communication_programs SET participant_count = 10 WHERE program_id = 1;
UPDATE communication_programs SET participant_count = 9 WHERE program_id = 2;
UPDATE communication_programs SET participant_count = 9 WHERE program_id = 3;
UPDATE communication_programs SET participant_count = 8 WHERE program_id = 4;
UPDATE communication_programs SET participant_count = 7 WHERE program_id = 5;
UPDATE communication_programs SET participant_count = 6 WHERE program_id = 6;
UPDATE communication_programs SET participant_count = 10 WHERE program_id = 7;
UPDATE communication_programs SET participant_count = 6 WHERE program_id = 8;
UPDATE communication_programs SET participant_count = 7 WHERE program_id = 9;
UPDATE communication_programs SET participant_count = 10 WHERE program_id = 10;

-- Cập nhật lại feedback_count cho chính xác
UPDATE communication_programs SET feedback_count = 2 WHERE program_id = 1;
UPDATE communication_programs SET feedback_count = 2 WHERE program_id = 2;
UPDATE communication_programs SET feedback_count = 2 WHERE program_id = 3;
UPDATE communication_programs SET feedback_count = 2 WHERE program_id = 4;
UPDATE communication_programs SET feedback_count = 2 WHERE program_id = 5;
UPDATE communication_programs SET feedback_count = 1 WHERE program_id = 6;
UPDATE communication_programs SET feedback_count = 1 WHERE program_id = 7;
UPDATE communication_programs SET feedback_count = 1 WHERE program_id = 8;
UPDATE communication_programs SET feedback_count = 1 WHERE program_id = 9;
UPDATE communication_programs SET feedback_count = 2 WHERE program_id = 10;
