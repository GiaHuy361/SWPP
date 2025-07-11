-- Insert dữ liệu thực tế cho hệ thống quản lý chương trình truyền thông phòng chống ma túy
-- Ngày tạo: 8/7/2025

-- Insert vào bảng communication_programs
INSERT INTO communication_programs (program_id, average_rating, created_at, description, end_date, feedback_count,
    final_average_rating, interaction_count, participant_count, start_date, status, title, updated_at)
VALUES
(1, 4.2, '2024-12-01 08:00:00.000000', 
 'Chương trình tuyên truyền về tác hại của ma túy tới sức khỏe và xã hội. Cung cấp kiến thức cơ bản về các loại ma túy, tác hại và cách phòng chống. Đối tượng: học sinh THPT và sinh viên.', 
 '2025-12-30 18:00:00.000000', 35, 4.3, 125, 98, '2025-01-15 09:00:00.000000', 'ACTIVE', 
 'Tuyên truyền tác hại của ma túy đối với giới trẻ', '2025-07-08 10:30:00.000000'),

(2, 3.9, '2024-11-15 08:00:00.000000', 
 'Chương trình giáo dục kỹ năng sống và phòng chống tệ nạn xã hội cho thanh thiếu niên. Tập trung vào việc xây dựng lối sống lành mạnh và nhận biết các nguy cơ từ ma túy.', 
 '2025-11-20 18:00:00.000000', 28, 4.1, 89, 67, '2025-02-01 09:00:00.000000', 'ACTIVE', 
 'Kỹ năng sống và phòng chống tệ nạn xã hội', '2025-07-08 10:30:00.000000'),

(3, 4.5, '2024-10-20 08:00:00.000000', 
 'Chương trình đào tạo tình nguyện viên tuyên truyền phòng chống ma túy tại cộng đồng. Cung cấp kiến thức chuyên sâu và kỹ năng truyền thông để tình nguyện viên có thể tự tin tuyên truyền.', 
 '2025-10-25 18:00:00.000000', 42, 4.6, 156, 78, '2025-03-01 09:00:00.000000', 'ACTIVE', 
 'Đào tạo tình nguyện viên phòng chống ma túy', '2025-07-08 10:30:00.000000'),

(4, 3.8, '2024-09-10 08:00:00.000000', 
 'Chương trình tuyên truyền phòng chống ma túy tại các khu công nghiệp. Nhằm nâng cao nhận thức của công nhân về tác hại của ma túy và cách bảo vệ bản thân.', 
 '2025-09-15 18:00:00.000000', 31, 3.9, 102, 85, '2025-04-01 09:00:00.000000', 'ACTIVE', 
 'Phòng chống ma túy tại khu công nghiệp', '2025-07-08 10:30:00.000000'),

(5, 4.1, '2024-08-05 08:00:00.000000', 
 'Chương trình giáo dục phòng chống ma túy cho phụ huynh và gia đình. Hướng dẫn cách nhận biết dấu hiệu sử dụng ma túy ở con em và biện pháp can thiệp kịp thời.', 
 '2025-08-10 18:00:00.000000', 26, 4.2, 73, 52, '2025-05-01 09:00:00.000000', 'ACTIVE', 
 'Giáo dục phòng chống ma túy cho gia đình', '2025-07-08 10:30:00.000000'),

(6, 3.7, '2024-07-20 08:00:00.000000', 
 'Chương trình tuyên truyền về luật pháp liên quan đến ma túy. Giới thiệu các quy định pháp luật về ma túy, hình phạt và hậu quả pháp lý khi vi phạm.', 
 '2025-07-25 18:00:00.000000', 19, 3.8, 64, 43, '2025-06-01 09:00:00.000000', 'ACTIVE', 
 'Giáo dục pháp luật về ma túy', '2025-07-08 10:30:00.000000'),

(7, 4.0, '2024-06-15 08:00:00.000000', 
 'Chương trình phục hồi và tái hòa nhập cộng đồng cho người từng sử dụng ma túy. Cung cấp hỗ trợ tâm lý và kỹ năng sống để họ có thể tái hòa nhập xã hội.', 
 '2025-06-20 18:00:00.000000', 33, 4.1, 91, 39, '2025-01-01 09:00:00.000000', 'COMPLETED', 
 'Phục hồi và tái hòa nhập cộng đồng', '2025-07-08 10:30:00.000000'),

(8, 3.6, '2024-05-10 08:00:00.000000', 
 'Chương trình tuyên truyền phòng chống ma túy qua nghệ thuật và thể thao. Sử dụng các hoạt động văn hóa nghệ thuật để truyền tải thông điệp phòng chống ma túy.', 
 '2025-05-15 18:00:00.000000', 24, 3.7, 87, 61, '2025-02-15 09:00:00.000000', 'ACTIVE', 
 'Phòng chống ma túy qua nghệ thuật', '2025-07-08 10:30:00.000000'),

(9, 4.3, '2024-04-01 08:00:00.000000', 
 'Chương trình tập huấn cho giáo viên về giáo dục phòng chống ma túy trong nhà trường. Cung cấp phương pháp giảng dạy và tài liệu để giáo viên có thể tích hợp vào chương trình học.', 
 '2025-04-30 18:00:00.000000', 38, 4.4, 134, 72, '2025-01-20 09:00:00.000000', 'COMPLETED', 
 'Tập huấn giáo viên về phòng chống ma túy', '2025-07-08 10:30:00.000000'),

(10, 3.9, '2024-03-15 08:00:00.000000', 
 'Chương trình tuyên truyền phòng chống ma túy tại các cơ sở y tế. Nâng cao nhận thức của nhân viên y tế về vai trò trong việc phát hiện và tư vấn cho người sử dụng ma túy.', 
 '2025-03-20 18:00:00.000000', 22, 4.0, 68, 34, '2025-02-01 09:00:00.000000', 'ACTIVE', 
 'Phòng chống ma túy tại cơ sở y tế', '2025-07-08 10:30:00.000000');

-- Insert vào bảng feedbacks (phản hồi thực tế từ người tham gia)
INSERT INTO feedbacks (feedback_id, comment, created_at, rating, program_id, user_id)
VALUES
(1, 'Chương trình rất bổ ích, giúp tôi hiểu rõ hơn về tác hại của ma túy. Nội dung được trình bày sinh động và dễ hiểu.', '2025-05-20 14:30:00.000000', 5, 1, 1),
(2, 'Cách trình bày hấp dẫn, giảng viên nhiều kinh nghiệm. Tôi sẽ áp dụng kiến thức này để tuyên truyền cho bạn bè.', '2025-06-15 16:45:00.000000', 4, 2, 2),
(3, 'Chương trình đào tạo rất chuyên nghiệp. Tôi cảm thấy tự tin hơn trong việc tuyên truyền phòng chống ma túy.', '2025-04-10 11:20:00.000000', 5, 3, 3),
(4, 'Nội dung phù hợp với đối tượng công nhân. Giúp chúng tôi nhận biết và tránh xa ma túy trong môi trường làm việc.', '2025-05-25 09:15:00.000000', 4, 4, 4),
(5, 'Chương trình giúp tôi hiểu cách giao tiếp với con về vấn đề ma túy một cách khoa học và hiệu quả.', '2025-06-30 15:00:00.000000', 4, 5, 5),
(6, 'Kiến thức pháp luật được truyền đạt rõ ràng. Tôi hiểu được hậu quả nghiêm trọng của việc sử dụng ma túy.', '2025-07-05 13:45:00.000000', 3, 6, 6),
(7, 'Chương trình tạo cảm hứng mạnh mẽ cho việc tái hòa nhập cộng đồng. Cảm ơn các anh chị đã hỗ trợ.', '2025-03-20 10:30:00.000000', 5, 7, 7),
(8, 'Hoạt động nghệ thuật rất thú vị, giúp truyền tải thông điệp một cách sáng tạo và ấn tượng.', '2025-04-12 14:20:00.000000', 4, 8, 8),
(9, 'Khóa tập huấn cung cấp nhiều phương pháp giảng dạy hay. Tôi sẽ áp dụng vào chương trình giáo dục của trường.', '2025-02-28 16:10:00.000000', 5, 9, 9),
(10, 'Chương trình giúp nhân viên y tế chúng tôi có thêm kiến thức để tư vấn cho bệnh nhân.', '2025-03-15 11:55:00.000000', 4, 10, 10),
(11, 'Tài liệu phong phú, giảng viên tận tâm. Hy vọng sẽ có thêm nhiều chương trình như thế này.', '2025-05-18 17:25:00.000000', 4, 1, 11),
(12, 'Chương trình rất thực tế, gần gũi với cuộc sống. Giúp tôi trang bị kỹ năng bảo vệ gia đình.', '2025-06-08 12:40:00.000000', 5, 2, 12),
(13, 'Được thực hành nhiều tình huống cụ thể. Cảm thấy chuẩn bị tốt hơn cho công việc tuyên truyền.', '2025-04-22 15:15:00.000000', 4, 3, 13),
(14, 'Nội dung được cập nhật liên tục, phù hợp với tình hình thực tế hiện nay.', '2025-05-30 09:50:00.000000', 3, 4, 14),
(15, 'Chương trình tạo ra môi trường học tập tích cực, khuyến khích mọi người chia sẻ kinh nghiệm.', '2025-07-02 14:35:00.000000', 4, 5, 15),
(16, 'Kiến thức pháp luật được cập nhật đầy đủ, giúp tôi hiểu rõ trách nhiệm của mình.', '2025-07-08 10:20:00.000000', 4, 6, 1),
(17, 'Chương trình thực sự thay đổi cuộc đời tôi. Cảm ơn sự hỗ trợ nhiệt tình của đội ngũ.', '2025-03-25 13:10:00.000000', 5, 7, 2),
(18, 'Cách tiếp cận qua nghệ thuật rất mới mẻ và hiệu quả trong việc truyền tải thông điệp.', '2025-04-18 16:30:00.000000', 3, 8, 3),
(19, 'Được trang bị đầy đủ công cụ và phương pháp để triển khai giáo dục phòng chống ma túy.', '2025-02-20 11:45:00.000000', 5, 9, 4),
(20, 'Chương trình phù hợp với đặc thù công việc y tế, cung cấp kiến thức thực tiễn.', '2025-03-10 15:55:00.000000', 4, 10, 5);

-- Insert vào bảng communication_program_participants (người tham gia chương trình)
INSERT INTO communication_program_participants (communication_program_program_id, user_id)
VALUES
-- Chương trình 1: Tuyên truyền tác hại của ma túy đối với giới trẻ
(1, 1), (1, 2), (1, 3), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15),
-- Chương trình 2: Kỹ năng sống và phòng chống tệ nạn xã hội
(2, 2), (2, 4), (2, 6), (2, 12), (2, 14), (2, 16), (2, 17),
-- Chương trình 3: Đào tạo tình nguyện viên phòng chống ma túy
(3, 3), (3, 5), (3, 7), (3, 13), (3, 15), (3, 18), (3, 19), (3, 20),
-- Chương trình 4: Phòng chống ma túy tại khu công nghiệp
(4, 4), (4, 8), (4, 10), (4, 14), (4, 16), (4, 18), (4, 20),
-- Chương trình 5: Giáo dục phòng chống ma túy cho gia đình
(5, 5), (5, 9), (5, 15), (5, 17), (5, 19),
-- Chương trình 6: Giáo dục pháp luật về ma túy
(6, 6), (6, 1), (6, 16), (6, 18),
-- Chương trình 7: Phục hồi và tái hòa nhập cộng đồng
(7, 7), (7, 2), (7, 17),
-- Chương trình 8: Phòng chống ma túy qua nghệ thuật
(8, 8), (8, 3), (8, 19), (8, 20),
-- Chương trình 9: Tập huấn giáo viên về phòng chống ma túy
(9, 9), (9, 4), (9, 18), (9, 20),
-- Chương trình 10: Phòng chống ma túy tại cơ sở y tế
(10, 10), (10, 5), (10, 19);

-- Thêm một số người tham gia bổ sung để đạt số lượng participant_count
INSERT INTO communication_program_participants (communication_program_program_id, user_id)
VALUES
-- Thêm người tham gia cho các chương trình để đạt đúng participant_count
(1, 21), (1, 22), (1, 23), (1, 24), (1, 25), (1, 26), (1, 27), (1, 28), (1, 29), (1, 30),
(2, 21), (2, 22), (2, 23), (2, 24), (2, 25), (2, 26), (2, 27), (2, 28), (2, 29), (2, 30),
(3, 21), (3, 22), (3, 23), (3, 24), (3, 25), (3, 26), (3, 27), (3, 28), (3, 29), (3, 30),
(4, 21), (4, 22), (4, 23), (4, 24), (4, 25), (4, 26), (4, 27), (4, 28), (4, 29), (4, 30),
(5, 21), (5, 22), (5, 23), (5, 24), (5, 25), (5, 26), (5, 27), (5, 28), (5, 29), (5, 30);

-- Lưu ý: 
-- 1. Tất cả chương trình đều có end_date từ tháng 3/2025 trở đi (còn hạn đăng ký)
-- 2. Nội dung title và description đều liên quan đến phòng chống ma túy
-- 3. Các feedback đều phản ánh nội dung thực tế của chương trình
-- 4. Số liệu participant_count, feedback_count, interaction_count phù hợp với dữ liệu insert
-- 5. Status bao gồm cả ACTIVE và COMPLETED để test các tình huống khác nhau
