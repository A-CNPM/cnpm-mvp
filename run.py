import subprocess

# Đường dẫn đầy đủ tới npm.cmd (thường nằm trong thư mục Node.js)
npm_path = "C:/Program Files/nodejs/npm.cmd"

# Chạy backend
backend = subprocess.Popen(["uvicorn", "main:app", "--reload"], cwd="backend")

# Chạy frontend
frontend = subprocess.Popen([npm_path, "run", "dev"], cwd="frontend")

# Đợi cả hai process
frontend.wait()
backend.wait()