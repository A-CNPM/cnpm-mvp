from typing import Optional, Dict, List
from data.forum import fake_forum_posts_db, fake_forum_comments_db
from data.profiles import fake_profiles_db
from schemas.forum import CreatePostRequest, UpdatePostRequest, CreateCommentRequest, PostSearchCriteria
import uuid
from datetime import datetime

class ForumService:
    
    def create_post(self, data: CreatePostRequest) -> Dict:
        """Tạo bài đăng mới"""
        # Kiểm tra author có tồn tại không
        author_profile = fake_profiles_db.get(data.author_id)
        if not author_profile:
            return {"success": False, "message": "Author not found"}
        
        # Kiểm tra category hợp lệ
        valid_categories = ["Học thuật", "Kỹ năng mềm", "Định hướng nghề nghiệp"]
        if data.category not in valid_categories:
            return {"success": False, "message": f"Category phải là một trong: {', '.join(valid_categories)}"}
        
        # Tạo post_id mới
        post_id = f"POST{str(uuid.uuid4())[:8].upper()}"
        
        # Tạo bài đăng
        post = {
            "post_id": post_id,
            "author_id": data.author_id,
            "author_name": author_profile.get("full_name", data.author_id),
            "title": data.title,
            "content": data.content,
            "category": data.category,
            "attachments": data.attachments,
            "likes": 0,
            "views": 0,
            "comments_count": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": None,
            "is_pinned": False,
            "is_locked": False,
            "status": "active"
        }
        
        fake_forum_posts_db[post_id] = post
        return {"success": True, "message": "Tạo bài đăng thành công", "post": post}
    
    def get_posts(self, criteria: PostSearchCriteria) -> List[Dict]:
        """Lấy danh sách bài đăng với tiêu chí tìm kiếm"""
        posts = list(fake_forum_posts_db.values())
        
        # Lọc theo keyword
        if criteria.keyword:
            keyword_lower = criteria.keyword.lower()
            posts = [p for p in posts if 
                    keyword_lower in p.get("title", "").lower() or 
                    keyword_lower in p.get("content", "").lower()]
        
        # Lọc theo category
        if criteria.category:
            posts = [p for p in posts if p.get("category") == criteria.category]
        
        # Lọc theo author
        if criteria.author_id:
            posts = [p for p in posts if p.get("author_id") == criteria.author_id]
        
        # Chỉ lấy posts active
        posts = [p for p in posts if p.get("status") == "active"]
        
        # Sắp xếp theo tiêu chí (không bao gồm pinned)
        if criteria.sort_by == "latest":
            posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        elif criteria.sort_by == "popular":
            posts.sort(key=lambda x: x.get("likes", 0), reverse=True)
        elif criteria.sort_by == "most_commented":
            posts.sort(key=lambda x: x.get("comments_count", 0), reverse=True)
        
        # Sắp xếp pinned posts lên đầu (pinned posts luôn ở đầu, sau đó sắp xếp theo tiêu chí đã chọn)
        # Tách pinned và non-pinned
        pinned_posts = [p for p in posts if p.get("is_pinned", False)]
        non_pinned_posts = [p for p in posts if not p.get("is_pinned", False)]
        
        # Sắp xếp lại non-pinned theo tiêu chí
        if criteria.sort_by == "latest":
            non_pinned_posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        elif criteria.sort_by == "popular":
            non_pinned_posts.sort(key=lambda x: x.get("likes", 0), reverse=True)
        elif criteria.sort_by == "most_commented":
            non_pinned_posts.sort(key=lambda x: x.get("comments_count", 0), reverse=True)
        
        # Sắp xếp pinned posts theo tiêu chí tương tự
        if criteria.sort_by == "latest":
            pinned_posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        elif criteria.sort_by == "popular":
            pinned_posts.sort(key=lambda x: x.get("likes", 0), reverse=True)
        elif criteria.sort_by == "most_commented":
            pinned_posts.sort(key=lambda x: x.get("comments_count", 0), reverse=True)
        
        # Ghép lại: pinned trước, non-pinned sau
        posts = pinned_posts + non_pinned_posts
        
        return posts
    
    def get_post_detail(self, post_id: str) -> Optional[Dict]:
        """Lấy chi tiết bài đăng"""
        post = fake_forum_posts_db.get(post_id)
        if not post or post.get("status") != "active":
            return None
        
        # Tăng số lượt xem
        post["views"] = post.get("views", 0) + 1
        fake_forum_posts_db[post_id] = post
        
        return post
    
    def update_post(self, post_id: str, data: UpdatePostRequest, user_id: str) -> Dict:
        """Cập nhật bài đăng"""
        post = fake_forum_posts_db.get(post_id)
        if not post:
            return {"success": False, "message": "Post not found"}
        
        # Kiểm tra quyền (chỉ author mới được sửa)
        if post.get("author_id") != user_id:
            return {"success": False, "message": "Bạn không có quyền chỉnh sửa bài đăng này"}
        
        # Cập nhật
        if data.title:
            post["title"] = data.title
        if data.content:
            post["content"] = data.content
        if data.category:
            valid_categories = ["Học thuật", "Kỹ năng mềm", "Định hướng nghề nghiệp"]
            if data.category not in valid_categories:
                return {"success": False, "message": f"Category phải là một trong: {', '.join(valid_categories)}"}
            post["category"] = data.category
        
        post["updated_at"] = datetime.now().isoformat()
        fake_forum_posts_db[post_id] = post
        
        return {"success": True, "message": "Cập nhật bài đăng thành công", "post": post}
    
    def delete_post(self, post_id: str, user_id: str) -> Dict:
        """Xóa bài đăng (soft delete)"""
        post = fake_forum_posts_db.get(post_id)
        if not post:
            return {"success": False, "message": "Post not found"}
        
        # Kiểm tra quyền (chỉ author mới được xóa)
        if post.get("author_id") != user_id:
            return {"success": False, "message": "Bạn không có quyền xóa bài đăng này"}
        
        post["status"] = "deleted"
        fake_forum_posts_db[post_id] = post
        
        return {"success": True, "message": "Xóa bài đăng thành công"}
    
    def like_post(self, post_id: str, user_id: str) -> Dict:
        """Like/Unlike bài đăng"""
        post = fake_forum_posts_db.get(post_id)
        if not post:
            return {"success": False, "message": "Post not found"}
        
        # TODO: Lưu trữ danh sách users đã like để tránh like nhiều lần
        post["likes"] = post.get("likes", 0) + 1
        fake_forum_posts_db[post_id] = post
        
        return {"success": True, "message": "Đã like bài đăng", "likes": post["likes"]}
    
    def create_comment(self, data: CreateCommentRequest) -> Dict:
        """Tạo bình luận"""
        # Kiểm tra post có tồn tại không
        post = fake_forum_posts_db.get(data.post_id)
        if not post or post.get("status") != "active":
            return {"success": False, "message": "Post not found"}
        
        # Kiểm tra post có bị khóa không
        if post.get("is_locked"):
            return {"success": False, "message": "Bài đăng đã bị khóa, không thể bình luận"}
        
        # Kiểm tra author có tồn tại không
        author_profile = fake_profiles_db.get(data.author_id)
        if not author_profile:
            return {"success": False, "message": "Author not found"}
        
        # Tạo comment_id mới
        comment_id = f"CMT{str(uuid.uuid4())[:8].upper()}"
        
        # Tạo bình luận
        comment = {
            "comment_id": comment_id,
            "post_id": data.post_id,
            "author_id": data.author_id,
            "author_name": author_profile.get("full_name", data.author_id),
            "content": data.content,
            "created_at": datetime.now().isoformat(),
            "updated_at": None,
            "likes": 0,
            "status": "active"
        }
        
        fake_forum_comments_db[comment_id] = comment
        
        # Tăng số lượng bình luận của post
        post["comments_count"] = post.get("comments_count", 0) + 1
        fake_forum_posts_db[data.post_id] = post
        
        return {"success": True, "message": "Tạo bình luận thành công", "comment": comment}
    
    def get_comments(self, post_id: str) -> List[Dict]:
        """Lấy danh sách bình luận của một post"""
        comments = [c for c in fake_forum_comments_db.values() 
                   if c.get("post_id") == post_id and c.get("status") == "active"]
        comments.sort(key=lambda x: x.get("created_at", ""))
        return comments
    
    def delete_comment(self, comment_id: str, user_id: str) -> Dict:
        """Xóa bình luận"""
        comment = fake_forum_comments_db.get(comment_id)
        if not comment:
            return {"success": False, "message": "Comment not found"}
        
        # Kiểm tra quyền
        if comment.get("author_id") != user_id:
            return {"success": False, "message": "Bạn không có quyền xóa bình luận này"}
        
        comment["status"] = "deleted"
        fake_forum_comments_db[comment_id] = comment
        
        # Giảm số lượng bình luận của post
        post = fake_forum_posts_db.get(comment.get("post_id"))
        if post:
            post["comments_count"] = max(0, post.get("comments_count", 0) - 1)
            fake_forum_posts_db[comment.get("post_id")] = post
        
        return {"success": True, "message": "Xóa bình luận thành công"}
    
    def get_categories(self) -> List[str]:
        """Lấy danh sách categories"""
        return ["Học thuật", "Kỹ năng mềm", "Định hướng nghề nghiệp"]

