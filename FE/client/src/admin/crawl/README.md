# 🕷️ Product Crawler Web Interface

Giao diện web để điều khiển và giám sát crawler sản phẩm thay vì sử dụng lệnh terminal.

## 🚀 Tính năng

- **Điều khiển Crawler**: Bắt đầu/dừng crawler từ giao diện web
- **Giám sát Real-time**: Theo dõi trạng thái, tiến độ và log hoạt động
- **Quản lý Danh mục**: Xem danh sách các danh mục sản phẩm
- **Giao diện Responsive**: Hoạt động tốt trên mọi thiết bị
- **API RESTful**: Backend Express.js với các endpoint đầy đủ

## 📁 Cấu trúc thư mục

```
crawl/
├── crawl.css          # Styles cho giao diện
├── page.jsx           # React component chính
├── package.json       # Dependencies cho frontend
└── README.md          # Hướng dẫn sử dụng

crawl.route.js         # Backend Express.js routes
productCrawl.js        # Logic crawler gốc
```

## 🛠️ Cài đặt

### 1. Cài đặt dependencies cho backend

```bash
npm install express cors body-parser mongoose selenium-webdriver
```

### 2. Cài đặt dependencies cho frontend

```bash
cd crawl
npm install
```

### 3. Cấu hình MongoDB

Tạo file `.env` trong thư mục gốc:

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=5000
```

## 🚀 Chạy ứng dụng

### 1. Khởi động backend

```bash
# Từ thư mục gốc
node server.js
```

### 2. Khởi động frontend

```bash
# Từ thư mục crawl
npm start
```

### 3. Truy cập giao diện

Mở trình duyệt và truy cập: `http://localhost:3000`

## 🔌 API Endpoints

### Crawler Control
- `POST /api/crawl/start` - Bắt đầu crawler
- `POST /api/crawl/stop` - Dừng crawler
- `GET /api/crawl/status` - Lấy trạng thái crawler
- `GET /api/crawl/logs` - Lấy log hoạt động

### Categories & Products
- `GET /api/crawl/categories` - Lấy danh sách danh mục
- `GET /api/crawl/products/count` - Lấy số lượng sản phẩm

### Health Check
- `GET /api/crawl/health` - Kiểm tra trạng thái API

## 🎮 Sử dụng giao diện

### 1. **Bắt đầu Crawler**
- Nhấn nút "🚀 Bắt đầu Crawl"
- Hệ thống sẽ khởi động crawler và hiển thị trạng thái

### 2. **Giám sát tiến độ**
- Theo dõi thanh tiến độ
- Xem thời gian chạy và số sản phẩm đã xử lý
- Kiểm tra danh mục đang được crawl

### 3. **Dừng Crawler**
- Nhấn nút "⏹️ Dừng Crawl" để dừng quá trình
- Hệ thống sẽ dừng an toàn và lưu trạng thái

### 4. **Xem log**
- Kiểm tra log hoạt động trong phần "📝 Log hoạt động"
- Theo dõi các thông báo lỗi nếu có

## 🔧 Tùy chỉnh

### Thay đổi cấu hình crawler

Chỉnh sửa file `productCrawl.js`:
- Thay đổi danh mục sản phẩm
- Điều chỉnh thời gian delay
- Thêm logic xử lý tùy chỉnh

### Tùy chỉnh giao diện

Chỉnh sửa file `crawl.css`:
- Thay đổi màu sắc và theme
- Điều chỉnh layout và responsive
- Thêm animations và effects

## 🐛 Xử lý lỗi

### Lỗi thường gặp

1. **MongoDB connection failed**
   - Kiểm tra MongoDB service đã chạy chưa
   - Kiểm tra connection string trong `.env`

2. **Chrome driver error**
   - Cài đặt Chrome browser
   - Cài đặt chromedriver phù hợp với phiên bản Chrome

3. **Port already in use**
   - Thay đổi PORT trong file `.env`
   - Kiểm tra process đang sử dụng port

### Debug mode

Thêm logging chi tiết trong `crawl.route.js`:

```javascript
console.log('Debug info:', { crawlerStatus, timestamp: new Date() });
```

## 📱 Responsive Design

Giao diện được thiết kế responsive và hoạt động tốt trên:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔒 Bảo mật

- API endpoints có thể được bảo vệ bằng authentication
- CORS được cấu hình cho development
- Input validation cho các API calls

## 🚀 Deployment

### Production build

```bash
cd crawl
npm run build
```

### Docker (tùy chọn)

Tạo `Dockerfile` để containerize ứng dụng:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console logs
2. Xem MongoDB connection
3. Kiểm tra Chrome driver
4. Xem network requests trong DevTools

## 🔄 Cập nhật

Để cập nhật crawler:
1. Backup dữ liệu hiện tại
2. Cập nhật `productCrawl.js`
3. Restart backend service
4. Kiểm tra hoạt động

---

**Lưu ý**: Crawler sử dụng Selenium WebDriver, đảm bảo Chrome browser đã được cài đặt trên server.
