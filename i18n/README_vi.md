# Nền tảng UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> Nền tảng mã nguồn mở thống nhất quản lý nhân sự và phân tích kỹ thuật

## Vấn Đề

Các công ty công nghệ đang đối mặt với thách thức nghiêm trọng: **khoảng cách giữa hệ thống HR và công cụ kỹ thuật**.

- Nền tảng HR (BambooHR, Lattice) thiếu số liệu kỹ thuật (GitLab, số liệu DORA)
- Công cụ kỹ thuật (Swarmia, LinearB) không bao gồm chức năng HR (theo dõi kỹ năng, phân bổ FTE)
- Giải pháp SaaS doanh nghiệp đắt đỏ (hơn $200k trong 3 năm)
- Tích hợp tùy chỉnh tốn $25k-50k mỗi hệ thống

**Kết quả?** Quyết định nhân tài bị ngắt kết nối với kết quả kỹ thuật. Quản lý kỹ thuật không thể thấy năng lực đội ngũ, và đội HR không thể đo lường tác động của kỹ năng đến hiệu suất.

## Giải Pháp UGJB

UGJB (Nền tảng Thống nhất Lực lượng Lao động và Phân tích Kỹ thuật) tích hợp quản lý HR với phân tích kỹ thuật sâu trong một hệ thống mã nguồn mở duy nhất.

### Tính Năng Chính

**Quản Lý Nhân Viên**
- Hồ sơ nhân viên đầy đủ với kỹ năng, phân bổ FTE và trạng thái làm việc
- Kho kỹ năng với mức độ thành thạo và theo dõi nguồn
- Kiểm soát truy cập dựa trên vai trò (HR, trưởng nhóm kỹ thuật, cá nhân đóng góp)

**Phân Tích Kỹ Thuật**
- Số liệu DORA (tần suất triển khai, tỷ lệ thất bại thay đổi, MTTR)
- Tích hợp GitLab/GitHub (commit, PR, đánh giá mã)
- Tích hợp Jira (theo dõi vấn đề, số liệu sprint)
- Firebase Crashlytics (phân bổ sự cố)
- Prometheus (thời gian hoạt động hệ thống, khối lượng cảnh báo)

**Lập Kế Hoạch Lực Lượng Lao Động**
- Phân bổ giữa các dự án với xác thực FTE
- Trực quan hóa năng lực đội ngũ theo thời gian thực
- Phân tích tương quan kỹ năng-kết quả kỹ thuật

**Bảng Điều Khiển Tùy Chỉnh**
- Bảng điều khiển KPI có thể cấu hình cho các đối tượng khác nhau
- Tích hợp với DevLake, Monday.com, Lattice
- Làm mới theo thời gian thực và xu hướng lịch sử

![Quản Lý Nhân Viên](./screenshots/employees-page.png)

![Số Liệu Kỹ Thuật](./screenshots/engineering-metrics-page.png)

![Bảng Điều Khiển Tùy Chỉnh](./screenshots/custom-dashboards-page.png)

## Bắt Đầu Nhanh

### Yêu Cầu

- Docker và Docker Compose
- Git

### Cài Đặt

```bash
git clone https://github.com/qtvhao/UGJB.git
cd UGJB
docker-compose up -d
curl http://localhost:8080/health
```

### Truy Cập Nền Tảng

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080
- **Tài Liệu API**: http://localhost:8080/docs

## Tại Sao Chọn UGJB?

- **Không phí giấy phép người dùng**: Kiến trúc mô-đun mã nguồn mở
- **TCO 3 năm**: ≤$120k (so với $200k+ giải pháp SaaS)
- **Tích hợp tiêu chuẩn hóa**: Giảm 50% thời gian phát triển tùy chỉnh
- **Độ tin cậy doanh nghiệp**: SLA thời gian hoạt động 99,9%

## Giấy Phép

Giấy phép MIT - xem tệp [LICENSE](LICENSE) để biết chi tiết.

---

**Bắt đầu thu hẹp khoảng cách giữa HR và kỹ thuật hôm nay.** 🚀
