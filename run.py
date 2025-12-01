import subprocess
import sys
import os
import signal

# Đường dẫn đầy đủ tới npm.cmd (thường nằm trong thư mục Node.js)
# Có thể thử các đường dẫn phổ biến
npm_paths = [
    "C:/Program Files/nodejs/npm.cmd",
    "npm.cmd",
    "npm"
]

npm_path = None
for path in npm_paths:
    try:
        # Kiểm tra xem npm có tồn tại không
        result = subprocess.run([path, "--version"], capture_output=True, timeout=5)
        if result.returncode == 0:
            npm_path = path
            break
    except:
        continue

if not npm_path:
    print("❌ Không tìm thấy npm. Vui lòng cài đặt Node.js.")
    sys.exit(1)

print("✅ Đã tìm thấy npm tại:", npm_path)

# Chạy backend
print("\n🚀 Đang khởi động backend server...")
backend = subprocess.Popen(
    [sys.executable, "main.py"],
    cwd="backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

# Đợi một chút để backend khởi động
import time
time.sleep(2)

# Chạy frontend
print("🚀 Đang khởi động frontend server...")
frontend = subprocess.Popen(
    [npm_path, "run", "dev"],
    cwd="frontend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

print("\n✅ Cả hai server đã được khởi động!")
print("📝 Backend: http://localhost:8000")
print("📝 Frontend: http://localhost:5173")
print("\n⚠️  Nhấn Ctrl+C để dừng cả hai server\n")

def signal_handler(sig, frame):
    print("\n\n🛑 Đang dừng servers...")
    frontend.terminate()
    backend.terminate()
    frontend.wait()
    backend.wait()
    print("✅ Đã dừng tất cả servers.")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

try:
    # Đợi cả hai process
    frontend.wait()
    backend.wait()
except KeyboardInterrupt:
    signal_handler(None, None)