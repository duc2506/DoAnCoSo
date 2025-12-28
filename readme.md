# To-Do List Application

Ứng dụng quản lý công việc cá nhân được xây dựng trên nền tảng Spring Boot và kiến trúc RESTful API, hỗ trợ xác thực người dùng và quản lý danh mục thông minh.

## 🚀 Tính năng chính

- **Xác thực & Bảo mật:**
  - Đăng ký và đăng nhập tài khoản.
  - Bảo mật hệ thống bằng **JWT (JSON Web Token)**.
  - Mã hóa mật khẩu người dùng bằng BCrypt.
- **Quản lý công việc (Todo):**
  - Thêm, sửa, xóa công việc.
  - Đánh dấu hoàn thành nhanh bằng checkbox.
  - Thiết lập mức độ ưu tiên: Cao (High), Trung bình (Medium), Thấp (Low).
  - Quản lý hạn hoàn thành (Due date).
- **Quản lý danh mục (Category):**
  - Tạo danh mục riêng với màu sắc nhận diện.
  - Phân loại công việc vào một hoặc nhiều danh mục.
- **Bộ lọc & Tìm kiếm:**
  - Tìm kiếm công việc theo tiêu đề hoặc mô tả.
  - Lọc nhanh theo trạng thái: Tất cả, Chưa hoàn thành, Đã hoàn thành.
  - Lọc theo Danh mục và Mức độ ưu tiên.

## 🛠 Công nghệ sử dụng

- **Backend:** - Java 17, Spring Boot 3.4.3
  - Spring Security, JWT (io.jsonwebtoken)
  - Spring Data JPA, Hibernate
  - Validation API, Lombok
- **Database:** MySQL 8.0
- **Frontend:** - HTML5, CSS3 (Bootstrap 5, FontAwesome)
  - JavaScript (Fetch API)

## 📋 Cấu trúc thư mục tiêu biểu

- `src/main/java/com/example/todo/model`: Chứa các thực thể (User, Todo, Category).
- `src/main/java/com/example/todo/repository`: Các interface giao tiếp với DB.
- `src/main/java/com/example/todo/service`: Chứa logic nghiệp vụ của ứng dụng.
- `src/main/java/com/example/todo/controller`: Các REST Endpoints.
- `src/main/java/com/example/todo/security`: Cấu hình bảo mật và xử lý Token.
- `src/main/resources/static`: Chứa giao diện người dùng (HTML, CSS, JS).

## ⚙️ Cài đặt và Chạy ứng dụng

### 1. Yêu cầu hệ thống

- JDK 17 trở lên.
- MySQL Server.
- Maven (hoặc dùng `mvnw` đi kèm).

### 2. Cấu hình Database

Tạo một cơ sở dữ liệu có tên là `todo` trong MySQL. Sau đó chỉnh sửa file `src/main/resources/application.properties` nếu cần (User/Pass của MySQL):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/todo
spring.datasource.username=your_username
spring.datasource.password=your_password
```

# Chạy ứng dụng hệ thống

Mở terminal tại thư mục gốc và chạy lệnh: ./mvnw spring-boot:run
Sau khi ứng dụng khởi chạy thành công, truy cập vào: http://localhost:8080

## API Endpoints chính

POST /api/auth/register: Đăng ký tài khoản.
POST /api/auth/login: Đăng nhập lấy Token.
GET /api/todos: Lấy danh sách công việc của người dùng hiện tại.
POST /api/todos: Tạo công việc mới.
PATCH /api/todos/{id}/toggle: Thay đổi trạng thái hoàn thành.
GET /api/categories: Quản lý danh mục cá nhân
