> **CẢNH BÁO BẢO MẬT – CHỈ DÙNG THỬ NGHIỆM:** Apps Script hiện chưa xác thực danh tính người gửi. Bất kỳ ai có URL `/exec` đều có thể giả mạo tên, gửi hoạt động/điểm và truy vấn dữ liệu theo tên. Không dùng cho cuộc thi chính thức, không nhập thông tin cá nhân và không dựa vào điểm trực tuyến để trao thưởng. Muốn triển khai thật, hãy dùng Supabase Auth + RLS và cơ chế ghi điểm phía máy chủ.

# Dùng Google Sheets làm "máy chủ" miễn phí (không cần Supabase, Netlify Functions, OpenAI)

Người chơi gửi hoạt động, điểm và câu hỏi lên thẳng một Google Sheet của bạn. Quản trị viên duyệt điểm ngay trong Sheet.

## Cài đặt (khoảng 10 phút, làm một lần)
1. Mở **sheets.new** (đăng nhập Google), tạo Sheet mới, đặt tên "Green Campus".
2. Menu **Extensions (Tiện ích mở rộng) → Apps Script**. Xóa code mẫu, dán toàn bộ `Code.gs`, bấm Save.
3. **Deploy → New deployment → loại Web app**. Đặt *Execute as*: **Me**, *Who has access*: **Anyone**. Bấm Deploy.
4. Google hỏi cấp quyền: chọn tài khoản của bạn → Advanced → Go to … (unsafe) → Allow. (Đây là script của chính bạn; quyền cần để ghi Sheet và lưu ảnh vào Drive.)
5. Sao chép **Web app URL** (kết thúc bằng `/exec`) và dán vào `public-config.js`:
   `sheetUrl: 'https://script.google.com/macros/s/…/exec'`
6. Tải lại Sheet; sẽ có menu **Eco Challenge**. Bấm **Bắt đầu mùa giải** để mở cuộc thi. Các tab HoatDong, BXH, CauHoi, CauHinh tự được tạo.
7. Kéo thư mục `green-campus` vào Netlify Drop để đưa lên mạng.

## Quản trị trong Sheet
- **Eco Challenge → Bắt đầu / Tạm dừng / Tiếp tục / Kết thúc**: điều khiển mùa giải cho mọi người chơi (đồng hồ 2 giờ dừng khi tạm dừng).
- Tab **HoatDong**: mỗi hoạt động là một dòng, ảnh minh chứng là link Drive. Chọn cột *Trạng thái* (Chờ duyệt / Đã duyệt / Từ chối / Thu hồi), nhập *Điểm* và *Nhận xét*. Điểm tự về tài khoản người chơi sau tối đa 1 phút. Sửa điểm hoặc thu hồi cũng làm ở đây.
- Tab **BXH**: điểm trực tuyến do thiết bị người chơi báo lên. Tab **CauHoi**: câu hỏi người dùng gửi, bạn ghi câu trả lời vào cột tra_loi.

## Giới hạn cần biết
- Không có đăng nhập thật: tên đăng nhập và PIN chỉ lưu trên từng thiết bị, ai biết đường dẫn script đều gửi được dữ liệu và xem được điểm theo tên. Điểm trực tuyến do thiết bị tự báo cáo nên có thể bị gian lận; điểm thực tiễn do bạn quyết định nên đáng tin hơn.
- Hai người ở hai thiết bị đặt trùng tên đăng nhập sẽ bị gộp điểm.
- Sửa Code.gs sau này: Deploy → Manage deployments → Edit → New version.
- Hạn mức Google Apps Script/Drive miễn phí có giới hạn theo ngày; phù hợp lớp, trường quy mô nhỏ.
