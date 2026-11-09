# Green Campus — Báo cáo rà soát và thay đổi

## Phạm vi đã kiểm tra
- 37 mục trong ZIP; 27 tệp mã/tài liệu/cấu hình.
- Frontend HTML/CSS/JavaScript, admin, Eco Challenge, Netlify Functions, SQL Supabase, Google Apps Script và hướng dẫn triển khai.
- Không có `node_modules/`, `.git/` hoặc `.env` thật trong gói nguồn. Chỉ có `.env.example`.
- Không phát hiện khóa bí mật phổ biến (JWT/service-role/API key) được nhúng trực tiếp trong mã nguồn theo các mẫu quét tĩnh đã chạy.

## Thay đổi đã thực hiện

### 1. Supabase — chặn tự nâng quyền qua hồ sơ
Trong `supabase/schema.sql`:
- Gỡ chính sách cho phép editor cập nhật mọi hồ sơ.
- Thu hồi quyền UPDATE trên toàn bộ bảng `profiles` khỏi `PUBLIC`, `anon`, `authenticated`.
- Chỉ cấp quyền cập nhật cột `display_name` cho tài khoản đã đăng nhập.
- Chính sách RLS chỉ cho người dùng cập nhật hồ sơ của chính mình.
- Việc cấp/đổi vai trò `editor` hoặc `admin` phải thực hiện qua kênh quản trị tin cậy (ví dụ SQL Editor của Supabase), không qua trình duyệt.

Đây là sửa lỗi phân quyền quan trọng nhất được phát hiện.

### 2. Supabase — migration Eco Challenge an toàn hơn khi chạy lại
Trong `supabase/eco-challenge.sql`:
- Bổ sung `DROP POLICY IF EXISTS` trước khi tạo các policy, tránh lỗi trùng tên khi chạy lại migration.
- Giới hạn policy theo role `authenticated` cho các bảng liên quan.
- Thu hồi quyền gọi RPC duyệt hoạt động khỏi `PUBLIC`/`anon`, chỉ cấp cho `authenticated`; hàm vẫn tự kiểm tra quyền admin bên trong.
- Làm policy đọc cây có thể chạy lại an toàn.

### 3. Netlify Functions
- `feedback` và `track`: giới hạn kích thước body ở cả header và nội dung thực tế; từ chối payload quá lớn.
- `content`, `stats`, `health`: chỉ chấp nhận GET/HEAD.
- Không đưa thông tin lỗi nội bộ của Supabase ra phản hồi công khai.

### 4. Cảnh báo vận hành
- Bổ sung cảnh báo trong README, tài liệu triển khai, hướng dẫn Apps Script và đầu tệp `Code.gs`: Google Apps Script hiện không xác thực người gửi. Người biết URL có thể giả mạo tên/điểm và gửi hoạt động; chỉ dùng thử nghiệm, không dùng cho cuộc thi chính thức hoặc dữ liệu cá nhân.

## Kiểm tra đã chạy
- `node --check`: tất cả 15 tệp `.js`/`.mjs` đều hợp lệ cú pháp sau chỉnh sửa.
- `Code.gs`: kiểm tra cú pháp bằng cách kiểm tra bản sao dưới đuôi `.js`, hợp lệ.
- `package.json`: JSON đọc được, dependencies khai báo gồm `@supabase/supabase-js` và `fast-xml-parser`.
- HTML: các đường dẫn tài nguyên nội bộ được tham chiếu trực tiếp trong `index.html` và `admin.html` đều tồn tại.
- Quét khóa bí mật phổ biến: không phát hiện giá trị khóa/token thực trong mã. Không có `.env` thật trong ZIP.

## Những việc chưa thể xác nhận từ ZIP độc lập
- Chưa thể đăng nhập vào dự án Supabase thực tế, chạy migration trên database thật hoặc kiểm tra RLS bằng các tài khoản `anon`, `member`, `editor`, `admin`.
- Chưa thể xác nhận Netlify deploy, biến môi trường, scheduled functions hoặc hành vi runtime trên site đang hoạt động vì ZIP không chứa quyền truy cập/credentials (và không nên gửi secrets).
- Chưa thể kiểm thử luồng Google Apps Script trong tài khoản Google thật.
- Chưa chạy kiểm thử giao diện end-to-end trên trình duyệt thật; kiểm tra cú pháp không thay thế kiểm thử runtime.
- Eco Challenge bản localStorage vẫn là chế độ demo, không phải hệ thống điểm tin cậy. Phân hệ cloud hiện có nhiệm vụ ảnh, điểm tài khoản và cây xanh; không nên hiểu rằng toàn bộ chế độ thi đấu cục bộ đã được chuyển thành cloud.

## Hướng dẫn triển khai thay đổi
1. Sao lưu database Supabase trước khi chạy SQL.
2. Chạy lại `supabase/schema.sql` trước, sau đó `supabase/eco-cloud-v2.sql`, rồi `supabase/eco-challenge.sql` trong SQL Editor nếu dự án đang dùng đủ ba phân hệ.
3. Kiểm tra lại vai trò quản trị trong `public.profiles`; cấp `admin` bằng SQL Editor cho đúng UUID.
4. Deploy lại Netlify sau khi cập nhật mã nguồn.
5. Dùng hai tài khoản thử nghiệm riêng biệt để xác minh: member không thể đọc/sửa hồ sơ người khác hoặc đổi `role`; admin có thể dùng các chức năng quản trị được cấp.
6. Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào `public-config.js`, HTML, JavaScript frontend hoặc kho mã công khai.

**Lưu ý:** Các thay đổi là hardening dựa trên rà soát mã nguồn. Việc xác nhận bảo mật hoàn chỉnh cần chạy migration và kiểm thử trên chính Supabase/Netlify của dự án.
