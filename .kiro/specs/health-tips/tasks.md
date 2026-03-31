# Kế hoạch Triển khai: Health Tips (Module C)

## Tổng quan

Triển khai module Health Tips theo kiến trúc phân tầng (data → service → controller → route) của project hiện tại. Sử dụng JavaScript ESM modules, Express router, và dữ liệu hardcode tiếng Việt. Các endpoint công khai, không yêu cầu xác thực.

## Tasks

- [x] 1. Tạo Data Store cho mẹo sức khỏe
  - [x] 1.1 Tạo file `backend-server/src/data/health-tips.data.js`
    - Export mảng `healthTips` chứa tối thiểu 15 mẹo sức khỏe bằng tiếng Việt
    - Mỗi tip có cấu trúc: `{ id, title, content, category, tags, source, relatedMetrics }`
    - Phân bố đều trên 6 danh mục: sleep, heart, nutrition, exercise, stress, general
    - Trường `tags` sử dụng giá trị tương thích với HealthMetric: heart_rate, steps, sleep_duration, stress_level, hrv, spo2
    - Trường `relatedMetrics` chỉ định các trường trong HealthMetric/HealthProfile
    - Export object `categoryNames` ánh xạ key danh mục sang tên tiếng Việt
    - _Yêu cầu: 1.1, 1.2, 1.3, 1.4, 6.2_

- [x] 2. Tạo Service xử lý logic nghiệp vụ
  - [x] 2.1 Tạo file `backend-server/src/services/health-tips.service.js`
    - Implement hàm `getAllTips({ category })` — lọc tips theo danh mục (nếu có)
    - Implement hàm `getRandomTips({ count, category })` — chọn ngẫu nhiên không trùng lặp
    - Implement hàm `getCategories()` — trả về danh sách danh mục kèm tên tiếng Việt và số lượng
    - Implement hàm `isValidCategory(category)` — kiểm tra danh mục hợp lệ
    - Import dữ liệu từ `health-tips.data.js`, tách biệt data access khỏi business logic
    - Khi `count` > số tips có sẵn, trả về toàn bộ tips có sẵn
    - _Yêu cầu: 2.1, 2.2, 2.3, 3.1, 3.3, 4.2, 5.1, 5.2, 6.1_

  - [x] 2.2 Viết unit test cho health-tips.service.js
    - Test `getAllTips()` trả về toàn bộ tips
    - Test `getAllTips({ category: "sleep" })` chỉ trả về tips thuộc danh mục sleep
    - Test `getRandomTips({ count: 3 })` trả về đúng 3 tips không trùng lặp
    - Test `getRandomTips({ count: 100 })` trả về toàn bộ tips khi count vượt quá
    - Test `getCategories()` trả về đủ 6 danh mục với count chính xác
    - Test `isValidCategory()` với danh mục hợp lệ và không hợp lệ
    - _Yêu cầu: 2.2, 2.3, 3.1, 3.3, 5.1, 5.2_

- [x] 3. Tạo Controller xử lý HTTP request/response
  - [x] 3.1 Tạo file `backend-server/src/controllers/health-tips.controller.js`
    - Implement `getAllHealthTips(req, res)` — xử lý GET `/api/v1/health-tips`
      - Hỗ trợ query param `category` để lọc
      - Validate category nếu được truyền, trả 400 nếu không hợp lệ kèm danh sách danh mục hợp lệ
      - Response format: `{ status: "success", count: <number>, data: [...] }`
    - Implement `getRandomHealthTips(req, res)` — xử lý GET `/api/v1/health-tips/random`
      - Hỗ trợ query params `count` (mặc định 1) và `category`
      - Validate `count` phải là số nguyên dương, trả 400 nếu không hợp lệ
      - Validate `category` nếu được truyền, trả 400 nếu không hợp lệ
      - Response format: `{ status: "success", data: [...] }`
    - Implement `getHealthTipCategories(req, res)` — xử lý GET `/api/v1/health-tips/categories`
      - Response format: `{ status: "success", data: [...] }`
    - Xử lý lỗi 500 với format `{ status: "error", message: <mô tả> }` nhất quán với controller hiện có
    - _Yêu cầu: 2.1, 2.2, 2.4, 2.5, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 7.1_

  - [x] 3.2 Viết unit test cho health-tips.controller.js
    - Test response format cho mỗi endpoint
    - Test validation lỗi 400 cho `count` không hợp lệ
    - Test validation lỗi 400 cho `category` không hợp lệ
    - Test xử lý lỗi 500
    - _Yêu cầu: 2.4, 2.5, 3.2, 7.1_

- [x] 4. Checkpoint - Đảm bảo data, service và controller hoạt động đúng
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 5. Tạo Route và tích hợp vào hệ thống
  - [x] 5.1 Tạo file `backend-server/src/routes/health-tips.routes.js`
    - Định nghĩa 3 routes: GET `/`, GET `/random`, GET `/categories`
    - Không sử dụng middleware `verifyToken` vì endpoint công khai
    - Import và sử dụng các controller functions
    - _Yêu cầu: 7.2_

  - [x] 5.2 Đăng ký route trong `backend-server/src/routes/index.js`
    - Import `healthTipsRoutes` từ `health-tips.routes.js`
    - Thêm `router.use('/health-tips', healthTipsRoutes)`
    - _Yêu cầu: 2.1, 4.1, 5.1_

  - [x] 5.3 Viết integration test cho các endpoint
    - Test GET `/api/v1/health-tips` trả về toàn bộ tips
    - Test GET `/api/v1/health-tips?category=sleep` lọc đúng danh mục
    - Test GET `/api/v1/health-tips/random` trả về 1 tip ngẫu nhiên
    - Test GET `/api/v1/health-tips/random?count=3&category=heart` kết hợp filter
    - Test GET `/api/v1/health-tips/categories` trả về danh sách danh mục
    - Test các trường hợp lỗi 400
    - _Yêu cầu: 2.1, 2.2, 2.4, 3.1, 3.2, 4.1, 5.1, 7.1, 7.2_

- [x] 6. Tạo Swagger documentation
  - [x] 6.1 Tạo file `backend-server/src/docs/health-tips.yaml`
    - Mô tả 3 endpoints với request/response schema
    - Bao gồm ví dụ response cho mỗi endpoint
    - Mô tả query parameters và error responses
    - _Yêu cầu: 2.5, 4.3_

- [x] 7. Checkpoint cuối - Đảm bảo toàn bộ module hoạt động
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

## Ghi chú

- Các task có dấu `*` là tùy chọn, có thể bỏ qua để triển khai MVP nhanh hơn
- Mỗi task tham chiếu đến yêu cầu cụ thể để đảm bảo truy xuất nguồn gốc
- Checkpoint giúp kiểm tra tiến độ tại các mốc quan trọng
- Tuân theo pattern hiện có của project: ESM modules, Express 5, response format `{ status, data }`
