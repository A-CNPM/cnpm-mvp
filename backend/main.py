from fastapi import FastAPI
from routers.auth_router import router as auth_router
from routers.profile_router import router as profile_router


app = FastAPI()
app.include_router(auth_router)
app.include_router(profile_router)

if __name__ == "__main__":
	import uvicorn
	uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
