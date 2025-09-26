# Meme App

Ứng dụng tạo meme đơn giản, hỗ trợ chỉnh sửa chữ, thêm hiệu ứng, lưu và chia sẻ meme. Hoạt động tốt trên cả web và thiết bị di động (PWA hoặc Capacitor).

## Tính năng

- Chọn ảnh từ máy hoặc camera (trên mobile).
- Thêm nhiều dòng chữ, chỉnh vị trí, màu sắc, font, kích thước.
- Lưu meme về máy.
- Chia sẻ meme qua các nền tảng (hỗ trợ chia sẻ file trên mobile, chia sẻ link trên web).
- Giao diện tối ưu cho điện thoại.

## Cài đặt & chạy dự án

### 1. Yêu cầu

- Node.js >= 16
- npm hoặc yarn

### 2. Cài đặt

```bash
npm install
```

### 3. Chạy trên web (localhost)

```bash
npm start
```

Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### 4. Build PWA

```bash
npm run build
```

### 5. Chạy trên điện thoại (Capacitor)

- Cài đặt Capacitor:
  ```bash
  npm install @capacitor/core @capacitor/cli
  npx cap init
  ```
- Build web:
  ```bash
  npm run build
  ```
- Copy vào native:
  ```bash
  npx cap add android
  npx cap add ios
  npx cap copy
  npx cap open android
  npx cap open ios
  ```

## Cấu trúc dự án

```
meme-app/
├── src/
│   ├── App.tsx
│   └── ...
├── public/
├── package.json
└── README.md
```

## Đóng góp

Mọi ý kiến đóng góp hoặc báo lỗi xin gửi qua Issues hoặc Pull Request.
