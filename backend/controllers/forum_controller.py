from services.forum_service import ForumService
from schemas.forum import CreatePostRequest, UpdatePostRequest, CreateCommentRequest, PostSearchCriteria
from typing import List, Dict

class ForumController:
    def __init__(self):
        self.service = ForumService()
    
    def create_post(self, data: CreatePostRequest) -> Dict:
        """Tạo bài đăng mới"""
        return self.service.create_post(data)
    
    def get_posts(self, criteria: PostSearchCriteria) -> List[Dict]:
        """Lấy danh sách bài đăng"""
        return self.service.get_posts(criteria)
    
    def get_post_detail(self, post_id: str) -> Dict:
        """Lấy chi tiết bài đăng"""
        post = self.service.get_post_detail(post_id)
        if not post:
            return None
        return post
    
    def update_post(self, post_id: str, data: UpdatePostRequest, user_id: str) -> Dict:
        """Cập nhật bài đăng"""
        return self.service.update_post(post_id, data, user_id)
    
    def delete_post(self, post_id: str, user_id: str) -> Dict:
        """Xóa bài đăng"""
        return self.service.delete_post(post_id, user_id)
    
    def like_post(self, post_id: str, user_id: str) -> Dict:
        """Like bài đăng"""
        return self.service.like_post(post_id, user_id)
    
    def create_comment(self, data: CreateCommentRequest) -> Dict:
        """Tạo bình luận"""
        return self.service.create_comment(data)
    
    def get_comments(self, post_id: str) -> List[Dict]:
        """Lấy danh sách bình luận"""
        return self.service.get_comments(post_id)
    
    def delete_comment(self, comment_id: str, user_id: str) -> Dict:
        """Xóa bình luận"""
        return self.service.delete_comment(comment_id, user_id)
    
    def get_categories(self) -> List[str]:
        """Lấy danh sách categories"""
        return self.service.get_categories()

