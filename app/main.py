from fastapi import FastAPI, Form, UploadFile, File, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from datetime import datetime,timedelta
from starlette.middleware.cors import CORSMiddleware
from urllib.parse import quote, unquote
import shutil
import os
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ 정적 파일은 /static 경로로 서빙
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ 템플릿 디렉토리
templates = Jinja2Templates(directory="templates")

# 사용자 데이터 저장용
user_data = []
trash_data = []

# ✅ index.html 라우팅
@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    message = request.cookies.get("message")
    if message:
        message = unquote(message)
    response = templates.TemplateResponse("index.html", {
        "request": request,
        "message": message
    })
    response.delete_cookie("message")  # 메시지 한 번만 보이도록 삭제
    return response



# ✅ cart.html 라우팅
@app.get("/cart", response_class=HTMLResponse)
async def read_cart(request: Request):
    return templates.TemplateResponse("cart.html", {"request": request})


@app.get("/form", response_class=HTMLResponse)
async def read_form(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})

# ✅ 사용자 정보 제출 처리
@app.post("/submit")
async def submit_user(
    name: str = Form(...),
    phone: str = Form(...),
    address: str = Form(...),
    photo: UploadFile = File(...)
):
    if not photo.filename:
        raise HTTPException(status_code=400, detail="사진이 업로드되지 않았습니다.")

    upload_dir = "static/uploads"
    try:
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, photo.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 저장 실패: {str(e)}")

    user_data.append({
        "name": name,
        "phone": phone,
        "address": address,
        "photo_path": f"uploads/{photo.filename}",
        "submitted_at": (datetime.now() + timedelta(hours=12)).strftime("%Y-%m-%d %H:%M:%S")
    })

    response = RedirectResponse("/", status_code=302)
    message = quote("정보가 성공적으로 입력되었습니다.")
    response.set_cookie("message", message)
    return response

# ✅ 관리자 페이지
@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    return templates.TemplateResponse("admin.html", {
        "request": request,
        "users": user_data,
        "trash_data": trash_data
    })


# ✅ 사용자 삭제
@app.post("/delete/{user_index}")
async def delete_user(user_index: int):
    try:
        deleted_user = user_data.pop(user_index)
        deleted_user["deleted_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        trash_data.append(deleted_user)
    except IndexError:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return RedirectResponse("/admin", status_code=302)


# ✅ 사용자 복원
@app.post("/restore/{trash_index}")
async def restore_user(trash_index: int):
    try:
        restored_user = trash_data.pop(trash_index)
        restored_user.pop("deleted_at", None)
        user_data.append(restored_user)
    except IndexError:
        raise HTTPException(status_code=404, detail="복원할 사용자를 찾을 수 없습니다.")
    return RedirectResponse("/admin", status_code=302)


# ✅ 휴지통 비우기
@app.post("/empty_trash")
async def empty_trash():
    trash_data.clear()
    return RedirectResponse("/admin", status_code=302)
