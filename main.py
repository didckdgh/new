from fastapi import FastAPI, Form, UploadFile, File, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from datetime import datetime
import shutil
import os
import base64

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

user_data = []
trash_data = []

# 사용자 정보를 저장하고 메시지를 세션에 전달
@app.get("/", response_class=HTMLResponse)
async def form_page(request: Request):
    message = request.cookies.get("message")  # 메시지 가져오기
    response = templates.TemplateResponse("form.html", {"request": request, "message": message})
    
    # 메시지를 쿠키에서 삭제하여 한 번만 표시되도록 함
    if message:
        response.delete_cookie("message")
    
    return response


@app.post("/submit")
async def submit_user(name: str = Form(...), phone: str = Form(...), address: str = Form(...), photo: UploadFile = File(...)):
    os.makedirs("static/uploads", exist_ok=True)
    
    # 파일 저장 경로를 파일 이름까지 포함한 전체 경로로 지정
    file_path = os.path.join("static", "uploads", photo.filename)
    
    # 실제 파일에 쓰기
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    user_data.append({
        "name": name,
        "phone": phone,
        "address": address,
        "photo_path": f"uploads/{photo.filename}",  # 경로 포함 파일 저장
        "submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # ⏱️ 시간 기록
    })
    
    # 메시지를 base64로 인코딩하여 쿠키에 저장
    encoded_message = base64.b64encode("정보가 성공적으로 입력되었습니다.".encode('utf-8')).decode('utf-8')
    
    # 제출 완료 후 메시지를 쿠키에 설정하고 폼 페이지로 리디렉션
    response = RedirectResponse("/", status_code=302)
    response.set_cookie("message", encoded_message)  # 인코딩된 메시지 저장
    
    return response


@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    return templates.TemplateResponse("admin.html", {
        "request": request,
        "users": user_data,
        "trash_data": trash_data  # 휴지통 추가
    })


@app.post("/delete/{user_index}")
async def delete_user(user_index: int):
    try:
        deleted_user = user_data.pop(user_index)
        deleted_user["deleted_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # 삭제 시간 기록
        trash_data.append(deleted_user)
    except IndexError:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return RedirectResponse("/admin", status_code=302)


@app.post("/restore/{trash_index}")
async def restore_user(trash_index: int):
    try:
        restored_user = trash_data.pop(trash_index)
        restored_user.pop("deleted_at", None)  # 삭제 시간 제거
        user_data.append(restored_user)  # 복원
    except IndexError:
        raise HTTPException(status_code=404, detail="복원할 사용자를 찾을 수 없습니다.")
    return RedirectResponse("/admin", status_code=302)


@app.post("/empty_trash")
async def empty_trash():
    trash_data.clear()  # 휴지통 비우기
    return RedirectResponse("/admin", status_code=302)
