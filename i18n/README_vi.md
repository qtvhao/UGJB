# Nền tảng UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**Nền tảng Quản lý Nhân sự và Phân tích Kỹ thuật Thống nhất** - Một nền tảng mô-đun tích hợp quản lý nhân sự với phân tích hiệu suất kỹ thuật trong một hệ thống mã nguồn mở duy nhất.

## Tổng quan

Nền tảng UGJB cho phép các tổ chức điều chỉnh quyết định về nhân tài với kết quả kỹ thuật thông qua thông tin chi tiết theo thời gian thực. Nó loại bỏ các giải pháp SaaS phân mảnh bằng cách kết hợp khả năng cấp doanh nghiệp với các mẫu tích hợp được tiêu chuẩn hóa và các thành phần có thể tái sử dụng, đồng thời giảm tổng chi phí sở hữu.

### Tính năng Chính

- **Quản lý Nhân sự Thống nhất** - Hồ sơ nhân viên, theo dõi kỹ năng, phân bổ FTE và trạng thái làm việc
- **Phân tích Kỹ thuật** - Chỉ số DORA, điểm chất lượng mã và chỉ báo độ tin cậy
- **Tích hợp với Công cụ Phát triển** - Jira, GitLab, Firebase Crashlytics, Prometheus
- **Bảng điều khiển Thời gian Thực** - Trực quan hóa KPI và báo cáo có thể tùy chỉnh
- **Kiểm soát Truy cập Dựa trên Vai trò** - Quyền chi tiết và bảo mật dữ liệu
- **Mã nguồn Mở và Mô-đun** - Kiến trúc có thể mở rộng, không phụ thuộc nhà cung cấp

## Bắt đầu Nhanh

### Yêu cầu

- Docker và Docker Compose
- Git

### Cài đặt

```bash
# Sao chép kho lưu trữ
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# Khởi động tất cả dịch vụ
docker-compose up -d

# Xác minh endpoint sức khỏe
curl http://localhost:8080/health
```

### Truy cập Nền tảng

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

## Kiến trúc

UGJB tuân theo kiến trúc dựa trên microservices với các bối cảnh giới hạn được định nghĩa rõ ràng:

- **Quản lý Nhân sự** - Đăng ký nhân viên và công cụ phân bổ
- **Phân tích Kỹ thuật** - Bộ thu thập chỉ số, công cụ KPI, bảng điều khiển thông tin chi tiết
- **Quản lý Mục tiêu** - Theo dõi mục tiêu và kết quả chính
- **Quản lý Dự án** - Điều phối sprint và gán nhiệm vụ
- **Tích hợp Hệ thống** - Đường ống dữ liệu và cổng API
- **Phúc lợi Nhân sự** - Dự đoán kiệt sức và giám sát phúc lợi

## Tại sao UGJB?

### Vấn đề được Giải quyết

1. **Phân mảnh Tích hợp** - Thống nhất dữ liệu từ Firebase, Prometheus, GitLab và Jira
2. **Phân lập Miền** - Kết nối quản lý kỹ năng nhân sự với KPI kỹ thuật
3. **Rào cản Chi phí** - ≤ $120k TCO 3 năm so với $200k+ SaaS doanh nghiệp
4. **Hạn chế Tùy chỉnh** - Quy trình làm việc có thể mở rộng duy trì ổn định nền tảng

### Chỉ số Thành công

| Chỉ số | Cơ sở | Mục tiêu |
|--------|-------|----------|
| TCO 3 năm | $201k-$246k | ≤ $120k |
| Phạm vi Tích hợp | 50% GitLab | 100% phạm vi |
| Thời gian đến Thông tin | 72+ giờ | ≤ 2 giờ |
| Thời gian Hoạt động Nền tảng | Chưa xác định | ≥ 99.9% |

## Sử dụng Cơ bản

### Quản lý Nhân viên

```bash
# Tạo hồ sơ nhân viên qua API
curl -X POST http://localhost:8080/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "role": "Lập trình viên Cấp cao",
    "department": "Kỹ thuật",
    "status": "active",
    "fte": 100
  }'
```

### Xem Chỉ số Kỹ thuật

Truy cập bảng điều khiển chỉ số kỹ thuật:
- Chỉ số DORA (tần suất triển khai, thời gian dẫn đầu)
- Điểm chất lượng mã
- Triển khai gần đây
- Đầu ra kỹ thuật của nhóm

### Cấu hình Tích hợp

Kết nối công cụ bên ngoài qua Web UI:
1. Điều hướng đến "Tích hợp"
2. Chọn loại công cụ (Jira, GitLab, Firebase, Prometheus)
3. Nhập endpoint API và xác thực
4. Đặt tần suất đồng bộ

## Giấy phép

Dự án này tuân theo giấy phép mã nguồn mở - xem tệp [LICENSE](LICENSE) để biết chi tiết.

## Đóng góp

Chúng tôi hoan nghênh đóng góp! Hãy thoải mái gửi Pull Request.

## Hỗ trợ

Để được hỗ trợ hoặc có câu hỏi, hãy mở một vấn đề trên [GitHub Issues](https://github.com/qtvhao/UGJB/issues).
