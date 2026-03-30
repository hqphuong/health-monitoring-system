# Tài liệu Yêu cầu - Health Tips (Module C)

## Giới thiệu

Module C cung cấp chức năng hiển thị các mẹo sức khỏe ngẫu nhiên cho người dùng trong hệ thống HealthGuard. Dữ liệu mẹo sức khỏe được hardcode ban đầu, nhưng cấu trúc dữ liệu được thiết kế mở rộng để sau này có thể tích hợp với các module khác (HealthMetric, HealthProfile) hoặc API bên ngoài. Module hoạt động độc lập, không phụ thuộc vào trạng thái đăng nhập của người dùng ở mức cơ bản, nhưng hỗ trợ cá nhân hóa khi có thông tin người dùng.

## Thuật ngữ

- **Health_Tips_Service**: Service xử lý logic lấy và lọc mẹo sức khỏe
- **Health_Tips_Controller**: Controller xử lý HTTP request/response cho API mẹo sức khỏe
- **Health_Tip**: Một đối tượng mẹo sức khỏe chứa nội dung, danh mục, thẻ tag và metadata
- **Category**: Danh mục phân loại mẹo sức khỏe (VD: sleep, heart, nutrition, exercise, stress, general)
- **Tag**: Thẻ gắn liên kết mẹo sức khỏe với các chỉ số sức khỏe cụ thể (VD: hrv, heart_rate, spo2, steps, sleep_duration)
- **Tips_Data_Store**: Nguồn dữ liệu hardcode chứa danh sách mẹo sức khỏe

## Yêu cầu

### Yêu cầu 1: Cấu trúc dữ liệu mẹo sức khỏe

**User Story:** Là một nhà phát triển, tôi muốn có cấu trúc dữ liệu mẹo sức khỏe rõ ràng và mở rộng, để sau này có thể tích hợp với các module hoặc API khác.

#### Tiêu chí chấp nhận

1. THE Health_Tip SHALL chứa các trường: id (string), title (string), content (string), category (string), tags (mảng string), source (string tùy chọn), và relatedMetrics (mảng string tùy chọn)
2. THE Tips_Data_Store SHALL chứa tối thiểu 15 mẹo sức khỏe hardcode bằng tiếng Việt, phân bố đều trên các danh mục: sleep, heart, nutrition, exercise, stress, general
3. THE Health_Tip SHALL sử dụng trường tags để liên kết với các chỉ số sức khỏe trong bảng HealthMetric (heart_rate, steps, sleep_duration, stress_level, hrv, spo2)
4. THE Health_Tip SHALL sử dụng trường relatedMetrics để chỉ định các trường dữ liệu trong HealthMetric hoặc HealthProfile mà mẹo sức khỏe liên quan đến

### Yêu cầu 2: API lấy mẹo sức khỏe ngẫu nhiên

**User Story:** Là một người dùng, tôi muốn nhận được mẹo sức khỏe ngẫu nhiên mỗi khi truy cập, để có thêm kiến thức chăm sóc sức khỏe.

#### Tiêu chí chấp nhận

1. WHEN người dùng gửi GET request đến endpoint `/api/v1/health-tips/random`, THE Health_Tips_Controller SHALL trả về một mẹo sức khỏe ngẫu nhiên từ Tips_Data_Store
2. WHEN người dùng gửi GET request với query parameter `count` (VD: `/api/v1/health-tips/random?count=3`), THE Health_Tips_Controller SHALL trả về số lượng mẹo sức khỏe ngẫu nhiên tương ứng, không trùng lặp
3. IF giá trị `count` lớn hơn tổng số mẹo sức khỏe có sẵn, THEN THE Health_Tips_Controller SHALL trả về toàn bộ mẹo sức khỏe có sẵn
4. IF giá trị `count` không phải số nguyên dương hợp lệ, THEN THE Health_Tips_Controller SHALL trả về mã lỗi 400 kèm thông báo mô tả lỗi
5. THE Health_Tips_Controller SHALL trả về response theo định dạng `{ status: "success", data: [...] }` nhất quán với các API hiện có trong hệ thống

### Yêu cầu 3: Lọc mẹo sức khỏe theo danh mục

**User Story:** Là một người dùng, tôi muốn xem mẹo sức khỏe theo chủ đề cụ thể, để tập trung vào lĩnh vực sức khỏe tôi quan tâm.

#### Tiêu chí chấp nhận

1. WHEN người dùng gửi GET request đến `/api/v1/health-tips/random` với query parameter `category` (VD: `?category=sleep`), THE Health_Tips_Service SHALL lọc và chỉ trả về mẹo sức khỏe thuộc danh mục được chỉ định
2. IF danh mục được truyền vào không tồn tại trong danh sách danh mục hợp lệ, THEN THE Health_Tips_Controller SHALL trả về mã lỗi 400 kèm danh sách các danh mục hợp lệ
3. WHEN cả `category` và `count` được truyền vào cùng lúc, THE Health_Tips_Service SHALL lọc theo danh mục trước, sau đó chọn ngẫu nhiên theo số lượng yêu cầu

### Yêu cầu 4: API lấy danh sách tất cả mẹo sức khỏe

**User Story:** Là một nhà phát triển, tôi muốn có API lấy toàn bộ danh sách mẹo sức khỏe, để phục vụ cho việc hiển thị và quản lý trên giao diện.

#### Tiêu chí chấp nhận

1. WHEN người dùng gửi GET request đến `/api/v1/health-tips`, THE Health_Tips_Controller SHALL trả về toàn bộ danh sách mẹo sức khỏe
2. WHEN query parameter `category` được truyền vào endpoint `/api/v1/health-tips`, THE Health_Tips_Service SHALL lọc và trả về mẹo sức khỏe thuộc danh mục được chỉ định
3. THE Health_Tips_Controller SHALL trả về response kèm tổng số lượng mẹo sức khỏe theo định dạng `{ status: "success", count: <number>, data: [...] }`

### Yêu cầu 5: API lấy danh sách danh mục

**User Story:** Là một nhà phát triển frontend, tôi muốn lấy danh sách các danh mục mẹo sức khỏe, để hiển thị bộ lọc trên giao diện.

#### Tiêu chí chấp nhận

1. WHEN người dùng gửi GET request đến `/api/v1/health-tips/categories`, THE Health_Tips_Controller SHALL trả về danh sách tất cả danh mục có sẵn
2. THE Health_Tips_Controller SHALL trả về mỗi danh mục kèm tên hiển thị tiếng Việt và số lượng mẹo sức khỏe trong danh mục đó

### Yêu cầu 6: Khả năng mở rộng và tích hợp

**User Story:** Là một nhà phát triển, tôi muốn module mẹo sức khỏe có cấu trúc dễ mở rộng, để sau này có thể tích hợp với dữ liệu thực từ HealthMetric hoặc API bên ngoài.

#### Tiêu chí chấp nhận

1. THE Health_Tips_Service SHALL tách biệt logic lấy dữ liệu (data access) khỏi logic xử lý (business logic), để sau này có thể thay thế nguồn dữ liệu hardcode bằng database hoặc API bên ngoài mà không thay đổi controller
2. THE Tips_Data_Store SHALL export dữ liệu dưới dạng module ES riêng biệt, cho phép thay thế hoặc mở rộng nguồn dữ liệu độc lập
3. THE Health_Tip SHALL sử dụng cấu trúc tags và relatedMetrics tương thích với tên trường trong bảng HealthMetric và HealthProfile của Prisma schema hiện tại

### Yêu cầu 7: Xử lý lỗi và tính ổn định

**User Story:** Là một người dùng, tôi muốn API luôn trả về phản hồi rõ ràng, để ứng dụng hoạt động ổn định.

#### Tiêu chí chấp nhận

1. IF một lỗi không mong muốn xảy ra trong quá trình xử lý, THEN THE Health_Tips_Controller SHALL trả về mã lỗi 500 kèm thông báo `{ status: "error", message: <mô tả lỗi> }` nhất quán với các controller hiện có
2. THE Health_Tips_Controller SHALL không yêu cầu xác thực (authentication) cho các endpoint mẹo sức khỏe, vì đây là thông tin công khai
