# Backend - Mentor/Mentee Platform

## 1. Cài đặt môi trường

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## 2. Chạy server

```bash
uvicorn main:app --reload
```

Server sẽ chạy tại: [http://localhost:8000](http://localhost:8000)

## 3. API Docs

Truy cập Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

## 4. Cấu trúc thư mục

- `main.py`: Khởi tạo FastAPI app, cấu hình router, CORS
- `controllers/`: Xử lý logic cho các module (auth, profile, session, searching)
- `routers/`: Định nghĩa các route cho API
- `services/`: Xử lý nghiệp vụ, truy xuất dữ liệu
- `data/`: Chứa dữ liệu mẫu (users, profiles, sessions, tutors)
- `schemas/`: Định nghĩa các schema (Pydantic)
- `core/`: Cấu hình bảo mật, JWT

## 5. Liên hệ

Nếu gặp lỗi hoặc cần hỗ trợ, liên hệ nhóm phát triển.

## Link Backend:
http://localhost:8000/docs