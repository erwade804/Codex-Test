import paramiko
import os


# ==== CONFIG ====
PI_HOST = "webuildpibetter"   # <-- Change to your Pi IP
PI_USER = "pi"
PI_PASSWORD = "pass"  # <-- Change if you changed it

REMOTE_PATH = "/home/pi/barcode_project/data/packages.csv"
LOCAL_PATH = os.path.join(os.path.expanduser("~"), "C:/Users/ewade/Desktop/Code/CodexTest/Codex-Test/src/data", "packages.csv")

# =================

def download_csv():
    try:
        print("Connecting to Pi...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(PI_HOST, username=PI_USER, password=PI_PASSWORD)

        sftp = ssh.open_sftp()
        print("Downloading file...")
        sftp.get(REMOTE_PATH, LOCAL_PATH)

        sftp.close()
        ssh.close()

        print("Download complete.")
        print(f"Saved to: {LOCAL_PATH}")

    except Exception as e:
        print("Error:", e)

download_csv()
