from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import shutil
import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from AllTypes import process_file  # Ensure this file is in your project

app = FastAPI()

# Enable CORS for frontend URLs including your Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.103:3000",  # Add your LAN IP if needed
        "https://documentanalyzer-beta.vercel.app",  # Your Vercel frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def root():
    return {
        "message": "FastAPI PDF Analyzer API is running. Use POST /upload or /test-upload to send files."
    }

@app.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    if file:
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "detail": "Upload successful!"
        }
    return {"error": "No file received"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process this uploaded file
        file_result = process_file(file_location)

        # Clean up
        os.remove(file_location)

        return JSONResponse(content=file_result)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
