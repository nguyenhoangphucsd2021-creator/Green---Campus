# Green Campus – Quiz Engine v1

## Tính năng được bổ sung

- Trắc nghiệm 5 câu/lượt, chọn ngẫu nhiên từ ngân hàng câu hỏi đã duyệt.
- Bốn cấp độ: dễ, trung bình, khó, chuyên gia.
- Điều chỉnh cấp độ tự động: đạt ít nhất 4/5 câu đúng thì tăng một cấp; đúng không quá 1/5 thì giảm một cấp; các kết quả khác giữ cấp độ.
- Hạn chế lặp câu theo lịch sử 100 câu gần nhất của tài khoản (khi kho câu hỏi còn đủ).
- Chấm điểm tại Supabase RPC; trình duyệt không gửi số điểm. Mỗi lượt chỉ nộp được một lần.
- Câu hỏi AI được tạo từ bài viết Green Campus đã xuất bản có đường dẫn nguồn; câu mới ở trạng thái chờ duyệt và không được đưa vào lượt chơi trước khi duyệt.
- Quản trị viên/biên tập viên có thể tạo câu hỏi AI và duyệt/từ chối trong khu vực trò chơi.

## 1. Chạy SQL

Trong Supabase Dashboard mở **SQL Editor → New query**. Dán toàn bộ nội dung `supabase/eco-quiz-v1.sql` và nhấn **Run**.

Tệp này phải chạy sau `supabase/schema.sql` và `supabase/eco-cloud-v2.sql`. Tệp tạo bảng câu hỏi, tiến trình, lượt chơi, lịch sử câu đã gặp, hàm chấm điểm và 20 câu hỏi mẫu.

## 2. Cấu hình Netlify Environment variables

Trong Netlify mở **Site configuration → Environment variables**, thêm:

- `SUPABASE_URL`: Project URL trong Supabase.
- `SUPABASE_ANON_KEY`: Publishable/anon key của Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key của Supabase. Chỉ lưu trong Netlify, tuyệt đối không đưa vào `public-config.js`, Git hoặc ZIP công khai.
- `OPENAI_API_KEY`: API key của OpenAI, chỉ lưu trong Netlify.
- `OPENAI_MODEL`: tùy chọn, mặc định `gpt-4.1-mini`.

Giữ `supabaseUrl` và `supabaseAnonKey` trong `public-config.js` như trước; đó là cấu hình công khai dành cho trình duyệt. Không đưa hai khóa bí mật nêu trên vào frontend.

Sau khi thêm biến môi trường, triển khai lại Netlify để Functions nhận cấu hình mới.

## 3. Điều kiện để tạo câu hỏi AI

AI không tự quét toàn bộ Internet không giới hạn. Nó dùng nội dung đã được nhập vào Green Campus và **đã xuất bản**, có `source_url` và nguồn tham khảo. Nội dung này có thể được quản trị viên thu thập từ các website/tổ chức đáng tin cậy thông qua luồng nội dung hiện có, sau đó kiểm tra và xuất bản.

Tài khoản phải có vai trò `editor` hoặc `admin`. Tạo câu hỏi xong, câu hỏi nằm trong hàng chờ. Quản trị viên phải kiểm tra đáp án và mở đường dẫn nguồn rồi mới phê duyệt. Chỉ câu hỏi `approved` được dùng trong trò chơi.

## 4. Kiểm thử sau triển khai

1. Tạo/đăng nhập tài khoản người chơi.
2. Bắt đầu lượt trắc nghiệm, trả lời đủ 5 câu và nộp bài.
3. Kiểm tra điểm tài khoản tăng theo số câu đúng và độ khó.
4. Chơi thêm lượt để kiểm tra cấp độ thích ứng và hạn chế lặp.
5. Đăng nhập tài khoản `editor`/`admin`, tạo câu hỏi AI.
6. Duyệt một câu hỏi; đăng nhập người chơi và kiểm tra câu hỏi đã duyệt có thể xuất hiện.
7. Thử nộp lại cùng một session hoặc sửa điểm từ trình duyệt: máy chủ phải từ chối/không thay đổi điểm.

## Giới hạn và lưu ý

- 20 câu mẫu là dữ liệu khởi đầu; để giảm lặp lâu dài cần mở rộng ngân hàng và thường xuyên duyệt câu hỏi mới.
- Câu hỏi AI không được bảo đảm đúng chỉ vì AI tạo ra; quy trình duyệt của con người là bắt buộc.
- Nếu nội dung đã xuất bản chưa có `source_url`, chức năng tạo câu hỏi AI sẽ báo chưa đủ nguồn.
- Chưa thể xác nhận triển khai Supabase/Netlify thật khi chưa chạy migration và cấu hình biến môi trường trong tài khoản của chủ dự án.
