from datetime import datetime

# Mock data cho học liệu từ HCMUT_LIBRARY
# Trong thực tế, dữ liệu này sẽ được đồng bộ từ HCMUT_LIBRARY
fake_materials_db = {
    "MAT001": {
        "material_id": "MAT001",
        "title": "Tài liệu học tập Python cơ bản",
        "description": "Tài liệu tổng hợp về Python cơ bản, bao gồm cú pháp, biến, hàm, và các cấu trúc dữ liệu cơ bản.",
        "type": "Document",
        "category": "Lập trình",
        "subject": "Python",
        "file_url": "https://example.com/materials/python-basics.pdf",
        "file_size": "2.5 MB",
        "file_format": "PDF",
        "uploaded_by": "a.nguyen",
        "uploaded_at": "2024-01-10T10:30:00",
        "library_id": "LIB001",  # ID từ HCMUT_LIBRARY
        "access_level": "Public",
        "download_count": 45,
        "tags": ["Python", "Lập trình", "Cơ bản"]
    },
    "MAT002": {
        "material_id": "MAT002",
        "title": "Video bài giảng về Database Design",
        "description": "Video bài giảng chi tiết về thiết kế cơ sở dữ liệu, các mô hình dữ liệu và best practices.",
        "type": "Video",
        "category": "Cơ sở dữ liệu",
        "subject": "Database",
        "file_url": "https://example.com/materials/database-design.mp4",
        "file_size": "150 MB",
        "file_format": "MP4",
        "uploaded_by": "b.nguyen",
        "uploaded_at": "2024-01-12T14:20:00",
        "library_id": "LIB002",
        "access_level": "Public",
        "download_count": 32,
        "tags": ["Database", "SQL", "Design"]
    },
    "MAT003": {
        "material_id": "MAT003",
        "title": "Slide bài giảng về Machine Learning",
        "description": "Bộ slide bài giảng về Machine Learning, bao gồm các thuật toán cơ bản và ứng dụng thực tế.",
        "type": "Document",
        "category": "Trí tuệ nhân tạo",
        "subject": "Machine Learning",
        "file_url": "https://example.com/materials/ml-slides.pdf",
        "file_size": "5.8 MB",
        "file_format": "PDF",
        "uploaded_by": "a.nguyen",
        "uploaded_at": "2024-01-15T09:15:00",
        "library_id": "LIB003",
        "access_level": "Public",
        "download_count": 78,
        "tags": ["Machine Learning", "AI", "Algorithms"]
    },
    "MAT004": {
        "material_id": "MAT004",
        "title": "Bài tập thực hành về Web Development",
        "description": "Tập hợp các bài tập thực hành về phát triển web, bao gồm HTML, CSS, JavaScript và React.",
        "type": "Document",
        "category": "Phát triển web",
        "subject": "Web Development",
        "file_url": "https://example.com/materials/web-exercises.zip",
        "file_size": "12.3 MB",
        "file_format": "ZIP",
        "uploaded_by": "b.nguyen",
        "uploaded_at": "2024-01-18T16:45:00",
        "library_id": "LIB004",
        "access_level": "Public",
        "download_count": 56,
        "tags": ["Web", "HTML", "CSS", "JavaScript", "React"]
    },
    "MAT005": {
        "material_id": "MAT005",
        "title": "Tài liệu về Network Security",
        "description": "Tài liệu chuyên sâu về bảo mật mạng, các kỹ thuật tấn công và phòng thủ.",
        "type": "Document",
        "category": "An ninh mạng",
        "subject": "Network Security",
        "file_url": "https://example.com/materials/network-security.pdf",
        "file_size": "8.2 MB",
        "file_format": "PDF",
        "uploaded_by": "a.nguyen",
        "uploaded_at": "2024-01-20T11:30:00",
        "library_id": "LIB005",
        "access_level": "Restricted",
        "download_count": 23,
        "tags": ["Security", "Network", "Cybersecurity"]
    },
    "MAT006": {
        "material_id": "MAT006",
        "title": "Code examples về Data Structures",
        "description": "Bộ sưu tập các ví dụ code về cấu trúc dữ liệu trong Python và Java.",
        "type": "Code",
        "category": "Cấu trúc dữ liệu",
        "subject": "Data Structures",
        "file_url": "https://example.com/materials/data-structures.zip",
        "file_size": "3.7 MB",
        "file_format": "ZIP",
        "uploaded_by": "b.nguyen",
        "uploaded_at": "2024-01-22T13:20:00",
        "library_id": "LIB006",
        "access_level": "Public",
        "download_count": 67,
        "tags": ["Data Structures", "Algorithms", "Python", "Java"]
    }
}

# Mapping học liệu với sessions (học liệu được chia sẻ trong các buổi tư vấn)
# Học liệu được liên kết với các session từ HCMUT_LIBRARY
# Mỗi session có thể có nhiều học liệu từ thư viện
session_materials_mapping = {
    "S001": ["MAT001", "MAT003"],  # Session S001 có học liệu MAT001 và MAT003
    "S002": ["MAT002", "MAT004"],
    "S003": ["MAT001", "MAT006"],  # Web Development với React
    "S004": ["MAT005"],  # An ninh mạng
    "S005": ["MAT001", "MAT002"],
    "S006": ["MAT003", "MAT004"],
    "S007": ["MAT005", "MAT006"],
    "S008": ["MAT001"],
    "S009": ["MAT002", "MAT003"],
    "S010": ["MAT004", "MAT005"],
    "S011": ["MAT001", "MAT006"],
    "S012": ["MAT002", "MAT005"],
    "S013": ["MAT003", "MAT004"]
}

