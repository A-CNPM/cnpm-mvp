from fastapi import FastAPI
from routers.auth_router import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from routers.profile_router import router as profile_router
from routers.session_router import router as session_router
from routers.searching_router import router as searching_router
from routers.tutor_registration_router import router as tutor_registration_router
from routers.review_router import router as review_router
from routers.available_slot_router import router as available_slot_router
from routers.chatbot_router import router as chatbot_router
from routers.notification_router import router as notification_router
from routers.material_router import router as material_router
from routers.forum_router import router as forum_router
from routers.tutor_profile_router import router as tutor_profile_router
from routers.progress_tracking_router import router as progress_tracking_router
from routers.admin_router import router as admin_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Đúng với port frontend của bạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(session_router)
app.include_router(searching_router)
app.include_router(tutor_registration_router)
app.include_router(review_router)
app.include_router(available_slot_router)
app.include_router(chatbot_router)
app.include_router(notification_router)
app.include_router(material_router)
app.include_router(forum_router)
app.include_router(tutor_profile_router)
app.include_router(progress_tracking_router)
app.include_router(admin_router)

if __name__ == "__main__":
    import uvicorn
    import os
    # Tắt reload để tăng performance (chỉ bật khi development)
    reload = os.getenv("RELOAD", "False").lower() == "true"  # Mặc định tắt reload
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=reload, log_level="info")