HƯỚNG DẪN CHẠY TEST APP (DÀNH CHO TEAM)

1. Cập nhật mã SHA-1 (Để dùng Google Login)
Vì chúng ta đã dùng chung file debug.keystore mình đã up lên Git, mn không cần tạo mã SHA-1 mới. Tuy nhiên, anh em cần lưu ý:

Gỡ app cũ: Nếu máy đã cài bản app trước đó, hãy xóa hẳn đi rồi mới chạy bản mới để tránh xung đột chữ ký (Keystore).

Keystore mặc định: Đảm bảo file mobile-app/android/app/debug.keystore đã tồn tại sau khi git pull.

2. Cấu hình địa chỉ IP (Để kết nối Server)
Hiện tại mình đang chạy Server tại máy cá nhân. Để app trên máy mn gọi được API, anh em cần chỉnh lại IP trong code:

Mở file: api.ts (mobile-app\config)

Sửa dòng BASE_URL thành IP hiện tại của mình:

TypeScript
const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.31.197:3000';

hoặc tạo file .env ở folder mobile  
# mobile-app/.env
EXPO_PUBLIC_API_URL=http://192.168.31.197:3000

Lưu ý: Điện thoại/Máy ảo của anh em và máy tính của mình phải bắt chung một mạng Wi-Fi.

3. Cài đặt và Khởi chạy

Bash
# 1. Cài đặt thư viện (nếu có thay đổi)
npm install

# 2. Xóa cache và khởi động Expo
npx expo start -c
4. Các lỗi thường gặp (Troubleshooting)
Lỗi "Network request failed":

Kiểm tra xem đã đổi đúng IP chưa.

Kiểm tra xem đã bắt chung Wi-Fi chưa.

Đảm bảo file google-services.json đã có trong thư mục android/app/.

Gỡ app ra cài lại.