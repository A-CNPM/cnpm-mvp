from fastapi import APIRouter, HTTPException, status, Query, Body
from controllers.forum_controller import ForumController
from schemas.forum import CreatePostRequest, UpdatePostRequest, CreateCommentRequest, PostSearchCriteria, ForumPost, ForumComment
from typing import List, Optional

router = APIRouter(prefix="/forum", tags=["forum"])
forum_controller = ForumController()

@router.post("/posts", response_model=dict)
def create_post(data: CreatePostRequest):
    """Tạo bài đăng mới"""
    result = forum_controller.create_post(data)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result

@router.get("/posts", response_model=List[dict])
def get_posts(
    keyword: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    author_id: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("latest")
):
    """Lấy danh sách bài đăng với tiêu chí tìm kiếm"""
    criteria = PostSearchCriteria(
        keyword=keyword,
        category=category,
        author_id=author_id,
        sort_by=sort_by
    )
    return forum_controller.get_posts(criteria)

@router.get("/posts/{post_id}", response_model=dict)
def get_post_detail(post_id: str):
    """Lấy chi tiết bài đăng"""
    post = forum_controller.get_post_detail(post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post

@router.put("/posts/{post_id}", response_model=dict)
def update_post(post_id: str, data: UpdatePostRequest, user_id: str = Body(..., embed=True)):
    """Cập nhật bài đăng"""
    result = forum_controller.update_post(post_id, data, user_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result

@router.delete("/posts/{post_id}", response_model=dict)
def delete_post(post_id: str, user_id: str = Query(...)):
    """Xóa bài đăng"""
    result = forum_controller.delete_post(post_id, user_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result

@router.post("/posts/{post_id}/like", response_model=dict)
def like_post(post_id: str, user_id: str = Body(..., embed=True)):
    """Like bài đăng"""
    result = forum_controller.like_post(post_id, user_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result

@router.post("/comments", response_model=dict)
def create_comment(data: CreateCommentRequest):
    """Tạo bình luận"""
    result = forum_controller.create_comment(data)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result

@router.get("/posts/{post_id}/comments", response_model=List[dict])
def get_comments(post_id: str):
    """Lấy danh sách bình luận của một post"""
    return forum_controller.get_comments(post_id)

@router.delete("/comments/{comment_id}", response_model=dict)
def delete_comment(comment_id: str, user_id: str = Query(...)):
    """Xóa bình luận"""
    result = forum_controller.delete_comment(comment_id, user_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message"))
    return result

@router.get("/categories", response_model=List[str])
def get_categories():
    """Lấy danh sách categories"""
    return forum_controller.get_categories()

