# Hướng dẫn chạy hệ thống crawl dữ liệu tự động và thủ công

## 1. Cài đặt các package cần thiết

```bash
npm install
npm install node-cron selenium-webdriver csv-writer
```

## 2. Cấu hình biến môi trường
- Tạo file `.env` trong thư mục `BE` (nếu chưa có):
```

```

## 3. Chạy server backend (Express/API)
```bash
npm start
```
- Server chỉ chạy API, không tự crawl dữ liệu.

## 4. Crawl dữ liệu thủ công (qua API hoặc nút FE)
- FE gọi API `/api/crawl` để trigger crawl thủ công.
- BE sẽ nhận request và chạy hàm crawl, lưu dữ liệu vào database và file CSV.

## 5. Crawl dữ liệu tự động theo lịch
- File tự động: `crawlers/autoProductCrawl.js`
- Script này sẽ tự động crawl mỗi ngày lúc 2h sáng.

### Chạy tự động bằng pm2 (khuyên dùng cho server)
```bash
npm install -g pm2
pm2 start crawlers/autoProductCrawl.js --name auto-crawl
```
- Kiểm tra trạng thái: `pm2 list`
- Dừng: `pm2 stop auto-crawl`
- Khởi động lại: `pm2 restart auto-crawl`

### Chạy tự động bằng lệnh node (chỉ khi terminal luôn mở)
```bash
node crawlers/autoProductCrawl.js
```

## 6. Lưu ý
- Không nên để script crawl chạy trực tiếp trong file server (app.js/server.js).
- Nên tách biệt script crawl và server để dễ bảo trì, quản lý.
- Có thể chỉnh sửa lịch crawl trong file `autoProductCrawl.js` theo ý muốn.

---
Nếu có thắc mắc, hãy xem lại các file mẫu hoặc liên hệ người phát triển.


--------------------------------- Quy tắc commit ----------------------------
Tuân theo chuẩn commit rõ ràng:

| Prefix      | Ý nghĩa                                      	   |
|-------------|----------------------------------------------	   |
| `ADD:`      | Thêm mới file, tính năng                     	   |
| `UPDATE:`   | Cập nhật logic, dữ liệu hoặc cấu trúc        	   |
| `FIX:`      | Sửa lỗi                                            |
| `REMOVE:`   | Xoá file hoặc đoạn code không cần thiết            |
| `STYLE:`    | Format code, chỉnh sửa style không ảnh hưởng logic |
| `REFACTOR:` | Cải tiến cấu trúc code, không thay đổi hành vi     |
| `DOC:`      | Cập nhật tài liệu, comment                         |

**Ví dụ:**
```bash
git commit -m "ADD: user model and registration controller"
git commit -m "STYLE: format server.js with Prettie
