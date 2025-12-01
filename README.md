# BTL CNPM HK251 - HCMUT_TSS

## 1. Giới thiệu

Hệ thống hỗ trợ kết nối giữa sinh viên (mentee) và gia sư (tutor) tại Đại học Bách Khoa. Gồm 2 phần:
- Backend: FastAPI (Python)
- Frontend: React (Vite)

Nhóm thực hiện: A+ CNPM


## 2. Cài đặt & Chạy dự án

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
Truy cập API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
npm run dev
```
Truy cập giao diện: [http://localhost:5173](http://localhost:5173)

## 3. Cấu trúc thư mục

```
backend/
    main.py
    controllers/      # Xử lý logic (auth, profile, session, searching)
    routers/          # Định nghĩa các API endpoint
    services/         # Business logic
    data/             # Dữ liệu mẫu (users, profiles, sessions, tutors)
    schemas/          # Định nghĩa kiểu dữ liệu
frontend/
    src/
        pages/        # Các trang giao diện (Login, FindTutor, Meeting, ...)
        components/   # Các component dùng chung
        api/          # Gọi API backend
```

## 4. Tính năng chính

- Đăng nhập với vai trò Mentee/Tutor
- Xem, tìm kiếm, đăng ký session học
- Quản lý profile cá nhân
- API docs tự động với Swagger

