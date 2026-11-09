# Đưa Green Campus lên mạng và lấy đường dẫn truy cập

Có 3 mức, làm từ dễ đến đầy đủ. Mức 1 chỉ mất khoảng 5 phút, miễn phí, không cần GitHub hay Supabase.

## Mức 1 – Có link ngay bằng Netlify Drop (chỉ phần giao diện tĩnh)

1. **Giải nén** `green-campus-eco-challenge.zip`. Bạn sẽ có thư mục `green-campus` (bên trong có `index.html` ở ngay gốc).
2. Mở https://app.netlify.com/drop bằng Chrome hoặc Edge.
3. **Kéo cả thư mục `green-campus`** thả vào khung. Vài giây sau bạn có địa chỉ dạng `https://ten-ngau-nhien.netlify.app`.
4. **Đăng ký/đăng nhập Netlify để nhận (claim) site.** Nếu không, site tạo ẩn danh sẽ bị xóa sau khoảng 1 giờ.
5. Đổi tên cho dễ nhớ: Site configuration → Site details → *Change site name* (ví dụ `green-campus-hcma` thành `https://green-campus-hcma.netlify.app`).
6. **Cập nhật sau này:** sửa file, vào Deploys của site, kéo lại thư mục vào khung "drag and drop" để xuất bản bản mới.

Chạy được: giao diện, danh mục, tra cứu, hỏi đáp tra cứu, tìm Wikipedia, nút Google và Eco Challenge bản thử nghiệm. Các tính năng tài khoản/điểm/nhiệm vụ đồng bộ cần cấu hình Supabase theo Mức 3.

Chưa có: thống kê, nguồn tin tự cập nhật, phản hồi lưu máy chủ, trang quản trị. Kéo-thả không triển khai các hàm trong `netlify/functions`; muốn dùng chúng hãy làm Mức 3.

**Lưu ý về Eco Challenge ở Mức 1–2:** điểm, cây và tài khoản lưu **trong trình duyệt của từng người**. Mỗi người chơi có một bảng xếp hạng riêng trên máy mình, chưa có bảng xếp hạng chung và chưa nên dùng cho cuộc thi thật. Khu quản trị của trò chơi chưa yêu cầu đăng nhập.

## Mức 2 – Google Sheets (chỉ thử nghiệm, không dùng cho cuộc thi thật)

**Cảnh báo bảo mật:** Apps Script trong gói này chưa xác thực danh tính người gửi. Người biết URL Web App có thể giả mạo tên, gửi hoạt động/điểm và đọc dữ liệu theo tên. Không lưu dữ liệu cá nhân, không dùng điểm để xếp hạng chính thức và không coi đây là phương án an toàn cho triển khai công khai.



Làm theo `google-apps-script/HUONG-DAN.md`, rồi dán địa chỉ Web app vào `sheetUrl` trong `public-config.js` và kéo-thả lại thư mục lên Netlify.

## Mức 3 – Đầy đủ: GitHub + Netlify + Supabase (vẫn có gói miễn phí)

1. **Supabase:** tạo dự án tại https://supabase.com → SQL Editor → chạy `supabase/schema.sql`, sau đó chạy `supabase/eco-cloud-v2.sql` để bật đăng nhập, nhiệm vụ ảnh, điểm tài khoản, cây xanh và bảng xếp hạng chung. Tiếp theo chạy `supabase/eco-quiz-v1.sql` để tạo ngân hàng trắc nghiệm, tiến trình thích ứng và chấm điểm máy chủ.
2. Tạo tài khoản quản trị trong Authentication, lấy UUID và cấp quyền bằng `update public.profiles set role='admin' where id='UUID_TAI_KHOAN';`. Sau đó lấy **Project URL** và **anon public key** (Project Settings → API) và dán vào `public-config.js`:
   `supabaseUrl: 'https://xxxx.supabase.co'`, `supabaseAnonKey: '...'`. Khóa `anon` được phép để ở trình duyệt. **Khóa `service_role` thì tuyệt đối không.**
3. **GitHub:** tạo repository riêng tư, tải thư mục `green-campus` lên (nội dung nằm ở gốc repository).
4. **Netlify:** Add new site → Import an existing project → chọn repository. Build command để trống, Publish directory là `.`.
5. Site configuration → Environment variables, thêm:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = anon/publishable key (dùng để xác thực người dùng trong Netlify Functions)
   - `SUPABASE_SERVICE_ROLE_KEY` = khóa service_role (chỉ đặt ở đây)
   - `OPENAI_API_KEY` = khóa API OpenAI (chỉ cần nếu dùng chức năng AI sinh câu hỏi)
   - `OPENAI_MODEL` = (tùy chọn) mặc định `gpt-4.1-mini`
   - `GC_FEED_URLS` = (tùy chọn) các RSS/Atom HTTPS đã kiểm tra, ngăn cách bằng dấu phẩy
6. **Deploys → Trigger deploy → Clear cache and deploy site.** Biến môi trường chỉ có hiệu lực sau lần deploy mới.
7. Tạo tài khoản quản trị: Supabase → Authentication → Users → Add user. Lấy UUID rồi chạy câu lệnh cuối file `supabase/schema.sql` để cấp vai trò `admin`. Sau đó đăng nhập ở `/admin.html`.
8. **Kiểm tra:** mở `https://TEN-SITE.netlify.app/.netlify/functions/health`. Thấy `"ok": true` và `database: true` là đã nối được.

## Kiểm tra sau khi lên mạng (5 phút)

Mở link của bạn trên máy tính hoặc điện thoại có Internet và thử lần lượt:
1. Bấm một thẻ rác (ví dụ "Chai nhựa PET"): phải hiện trang chi tiết có các bước, mục "Cần tránh" và **ảnh thực tế** (ảnh hiện sau 1–3 giây).
2. Trong trang chi tiết, bấm một bài liên quan rồi bấm "Quay lại".
3. Gõ từ khóa vào ô tìm kiếm Internet: kết quả phải có ảnh nhỏ và nút "Xem ảnh & đọc chi tiết ngay tại đây".
4. Mục Hỏi đáp: gõ "vỏ trứng bỏ vào đâu" rồi bấm "Tra cứu".
5. Eco Challenge: tạo tài khoản, bắt đầu mùa giải ở tab Quản trị, làm một nhiệm vụ, vào tab Cây xanh để mua nước và tưới.
Nếu ảnh hoặc bài Wikipedia không hiện: kiểm tra Internet, tải lại bằng Ctrl+F5, hoặc thử mạng khác (một số mạng cơ quan chặn Wikimedia). Phần hướng dẫn biên soạn vẫn dùng được khi không có Internet.

## Gặp lỗi thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Trang trắng hoặc "Page not found" | Kéo nhầm thư mục. `index.html` phải nằm ngay trong thư mục được kéo. |
| Site biến mất sau 1 giờ | Chưa nhận (claim) site bằng tài khoản Netlify. |
| Đổi code nhưng web không đổi | Chưa deploy lại, hoặc cần xóa bộ nhớ đệm trình duyệt (Ctrl+F5). |
| Hàm `/.netlify/functions/...` báo 404 | Đang dùng kéo-thả. Chuyển sang Mức 3. |
| Đã thêm biến môi trường nhưng vẫn lỗi | Cần *Trigger deploy* lại. |
| Tìm kiếm Wikipedia báo lỗi | Do mạng hoặc trình duyệt chặn; dùng nút **Tìm trên Google**. |

Không gửi khóa `service_role` qua chat, không commit lên Git công khai, không đặt vào mã chạy ở trình duyệt.
