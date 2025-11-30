# Fake database cho Forum
fake_forum_posts_db = {}
fake_forum_comments_db = {}

# Dữ liệu mẫu
sample_posts = [
    {
        "post_id": "POST001",
        "author_id": "t.nguyen",
        "author_name": "Nguyễn Văn T",
        "title": "Chia sẻ kinh nghiệm học Machine Learning",
        "content": "Xin chào các bạn! Mình muốn chia sẻ một số kinh nghiệm học Machine Learning mà mình đã tích lũy được...",
        "category": "Học thuật",
        "attachments": [
            {
                "file_id": "FILE001",
                "file_name": "ML_Resources.pdf",
                "file_url": "https://example.com/files/ML_Resources.pdf",
                "file_type": "pdf",
                "file_size": "2.5 MB"
            }
        ],
        "likes": 15,
        "views": 120,
        "comments_count": 8,
        "created_at": "2024-01-15T10:30:00",
        "updated_at": None,
        "is_pinned": False,
        "is_locked": False,
        "status": "active"
    },
    {
        "post_id": "POST002",
        "author_id": "a.nguyen",
        "author_name": "Nguyễn Văn A",
        "title": "Kỹ năng thuyết trình hiệu quả",
        "content": "Thuyết trình là một kỹ năng quan trọng trong học tập và công việc. Dưới đây là một số tips...",
        "category": "Kỹ năng mềm",
        "attachments": [],
        "likes": 23,
        "views": 200,
        "comments_count": 12,
        "created_at": "2024-01-14T14:20:00",
        "updated_at": None,
        "is_pinned": True,
        "is_locked": False,
        "status": "active"
    },
    {
        "post_id": "POST003",
        "author_id": "b.levan",
        "author_name": "Lê Văn B",
        "title": "Định hướng nghề nghiệp cho sinh viên CNPM",
        "content": "Các bạn sinh viên CNPM có nhiều hướng phát triển nghề nghiệp. Hãy cùng thảo luận...",
        "category": "Định hướng nghề nghiệp",
        "attachments": [],
        "likes": 30,
        "views": 350,
        "comments_count": 25,
        "created_at": "2024-01-13T09:15:00",
        "updated_at": None,
        "is_pinned": False,
        "is_locked": False,
        "status": "active"
    }
]

sample_comments = [
    {
        "comment_id": "CMT001",
        "post_id": "POST001",
        "author_id": "b.levan",
        "author_name": "Lê Văn B",
        "content": "Cảm ơn bạn đã chia sẻ! Tài liệu rất hữu ích.",
        "created_at": "2024-01-15T11:00:00",
        "updated_at": None,
        "likes": 5,
        "status": "active"
    },
    {
        "comment_id": "CMT002",
        "post_id": "POST001",
        "author_id": "c.tran",
        "author_name": "Trần Văn C",
        "content": "Mình cũng đang học ML, có thể trao đổi thêm không?",
        "created_at": "2024-01-15T11:30:00",
        "updated_at": None,
        "likes": 2,
        "status": "active"
    }
]

# Khởi tạo dữ liệu mẫu
for post in sample_posts:
    fake_forum_posts_db[post["post_id"]] = post

for comment in sample_comments:
    fake_forum_comments_db[comment["comment_id"]] = comment

