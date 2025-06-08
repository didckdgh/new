from fastapi import FastAPI, Form, UploadFile, File, Request, HTTPException, Cookie
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from datetime import datetime, timedelta
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from urllib.parse import quote, unquote
import shutil
import os
import base64
from typing import Optional, List, Dict
import json 
import aiofiles
import pytz
from functools import lru_cache

# KST 시간대 설정
KST = pytz.timezone('Asia/Seoul')

# 캐시 TTL 설정 (5초)
CACHE_TTL = 5

# HTTPS 리다이렉션 미들웨어
class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if not request.url.path.startswith('/static/'):
            response.headers["Content-Security-Policy"] = "upgrade-insecure-requests"
        return response

app = FastAPI()

# HTTPS 리다이렉션 미들웨어 추가
app.add_middleware(HTTPSRedirectMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 디렉토리 설정
STATIC_DIR = "static"
UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")
IMAGES_DIR = os.path.join(STATIC_DIR, "images")
PRODUCTS_DIR = os.path.join(IMAGES_DIR, "products")

# 정적 파일 디렉토리 생성
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(PRODUCTS_DIR, exist_ok=True)

# 정적 파일 서빙 설정
app.mount("/static", StaticFiles(directory=STATIC_DIR, html=True), name="static")

# 템플릿 디렉토리 설정
templates = Jinja2Templates(directory="templates")

# 사용자 데이터 저장용
pending_orders = []  # 승인 전 주문
in_delivery_orders = []  # 배송 중 주문
completed_orders = []  # 배송 완료 주문
trash_data = []  # 휴지통
cancelled_orders = []  # 취소된 주문

# 주문 데이터 캐싱
@lru_cache(maxsize=1)
def get_cached_orders() -> Dict[str, List]:
    return {
        "pending": pending_orders,
        "in_delivery": in_delivery_orders,
        "completed": completed_orders,
        "cancelled": cancelled_orders,
        "trash": trash_data
    }

# 캐시 무효화 함수
def invalidate_cache():
    get_cached_orders.cache_clear()

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
    cart: str = Form(...),
    device_id: str = Form(...),
    payment_image: UploadFile = File(...)
):
    print(f"[주문 제출] 이름: {name}, 전화번호: {phone}, 기기 ID: {device_id}")  # 로깅 추가

    if not payment_image.filename:
        raise HTTPException(status_code=400, detail="사진이 업로드되지 않았습니다.")

    try:
        # 파일 저장
        file_path = os.path.join(UPLOADS_DIR, payment_image.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(payment_image.file, buffer)
        print(f"[파일 저장] 경로: {file_path}")  # 로깅 추가
    except Exception as e:
        print(f"[파일 저장 실패] {str(e)}")  # 로깅 추가
        raise HTTPException(status_code=500, detail=f"파일 저장 실패: {str(e)}")

    try:
        # 장바구니 데이터 파싱
        cart_items = json.loads(cart)
        if not isinstance(cart_items, list) or len(cart_items) == 0:
            raise ValueError("장바구니가 비어있거나 올바른 형식이 아닙니다.")
        print(f"[장바구니] 상품 수: {len(cart_items)}")  # 로깅 추가
    except json.JSONDecodeError:
        print("[장바구니 파싱 실패] JSON 형식 오류")  # 로깅 추가
        raise HTTPException(status_code=400, detail="장바구니 데이터가 올바른 JSON 형식이 아닙니다.")
    except Exception as e:
        print(f"[장바구니 처리 실패] {str(e)}")  # 로깅 추가
        raise HTTPException(status_code=400, detail=f"장바구니 데이터 처리 실패: {str(e)}")

    # 총 금액 계산
    total_amount = sum(item.get('totalPrice', 0) for item in cart_items)

    # KST 시간으로 현재 시간 설정
    now = datetime.now(KST)

    # 주문 데이터 생성
    order_data = {
        "id": str(now.timestamp()),
        "name": name,
        "phone": phone,
        "address": address,
        "photo_path": f"uploads/{payment_image.filename}",
        "submitted_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        "cart_items": cart_items,
        "total_amount": total_amount,
        "status": "상품준비중",
        "device_id": device_id
    }

    # 주문 추가
    pending_orders.append(order_data)
    print(f"[주문 추가] ID: {order_data['id']}, 총 금액: {total_amount}, 기기 ID: {device_id}")  # 로깅 추가

    # 캐시 무효화
    invalidate_cache()
    print("[캐시 무효화] 완료")  # 로깅 추가

    # 응답 생성
    response = RedirectResponse(url="/orders", status_code=302)
    message = quote("주문이 성공적으로 접수되었습니다.")
    response.set_cookie(key="message", value=message)
    response.set_cookie(key="user_phone", value=phone, max_age=30*24*60*60)
    
    return response

# ✅ 관리자 페이지 API
@app.get("/api/admin/orders")
async def get_admin_orders():
    print("[관리자 주문 조회] API 호출")  # 로깅 추가
    orders_data = get_cached_orders()
    print(f"[관리자 주문 조회] 승인 전: {len(orders_data['pending'])}, 배송 중: {len(orders_data['in_delivery'])}, 완료: {len(orders_data['completed'])}")  # 로깅 추가
    return JSONResponse(content=orders_data)

ADMIN_PASSWORD = "admin123"  # 실제 운영시 환경변수로!

@app.post("/admin-auth")
async def verify_admin_password(password: str = Form(...)):
    if password == ADMIN_PASSWORD:
        response = JSONResponse({"success": True})
        response.set_cookie(key="admin_auth_cookie", value="1", httponly=True, max_age=60*60)
        return response
    return JSONResponse({"success": False, "error": "비밀번호가 올바르지 않습니다."}, status_code=401)

@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request, admin_auth_cookie: str = Cookie(None)):
    is_locked = admin_auth_cookie != "1"
    return templates.TemplateResponse("admin.html", {
        "request": request,
        "pending_orders": pending_orders,
        "in_delivery_orders": in_delivery_orders,
        "completed_orders": completed_orders,
        "trash_data": trash_data,
        "cancelled_orders": cancelled_orders,
        "admin_locked": is_locked
    })

# ✅ 주문 승인 (승인 전 -> 배송 중)
@app.post("/approve/{order_index}")
async def approve_order(order_index: int):
    try:
        order = pending_orders.pop(order_index)
        order["approved_at"] = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
        in_delivery_orders.append(order)
        invalidate_cache()
        return RedirectResponse("/admin", status_code=302)
    except IndexError:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")

# ✅ 배송 완료 처리 (배송 중 -> 배송 완료)
@app.post("/complete/{order_index}")
async def complete_order(order_index: int):
    try:
        order = in_delivery_orders.pop(order_index)
        order["completed_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        completed_orders.append(order)
        return RedirectResponse("/admin", status_code=302)
    except IndexError:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")

# ✅ 주문 삭제 (각 카테고리별)
@app.post("/delete_order/{category}/{order_index}")
async def delete_order(category: str, order_index: int):
    try:
        if category == "pending":
            order_list = pending_orders
        elif category == "in_delivery":
            order_list = in_delivery_orders
        elif category == "completed":
            order_list = completed_orders
        else:
            raise HTTPException(status_code=400, detail="잘못된 카테고리입니다.")
        
        # order_id로 주문 찾기
        order_to_delete = None
        for i, order in enumerate(order_list):
            if i == order_index:
                order_to_delete = order
                break
        
        if order_to_delete:
            order_list.remove(order_to_delete)
            order_to_delete["deleted_at"] = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
            order_to_delete["status"] = "주문취소" if category == "pending" else "삭제됨"
            if category == "pending":
                cancelled_orders.append(order_to_delete)
            else:
                trash_data.append(order_to_delete)
        else:
            raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"주문 삭제 실패: {str(e)}")
    
    return RedirectResponse("/admin", status_code=302)

# ✅ 휴지통에서 복원
@app.post("/restore/{trash_index}")
async def restore_order(trash_index: int):
    try:
        order = trash_data.pop(trash_index)
        # 삭제 시간 정보 제거
        order.pop("deleted_at", None)
        # 주문의 현재 상태에 따라 적절한 리스트에 추가
        if "completed_at" in order:
            completed_orders.append(order)
        elif "approved_at" in order:
            in_delivery_orders.append(order)
        else:
            pending_orders.append(order)
    except IndexError:
        raise HTTPException(status_code=404, detail="복원할 주문을 찾을 수 없습니다.")
    return RedirectResponse("/admin", status_code=302)

# ✅ 휴지통 비우기
@app.post("/empty_trash")
async def empty_trash():
    trash_data.clear()
    return RedirectResponse("/admin", status_code=302)

# ✅ detail.html 라우팅
@app.get("/detail", response_class=HTMLResponse)
async def read_detail(request: Request):
    return templates.TemplateResponse("detail.html", {"request": request})

# ✅ form.html 라우팅
@app.get("/form.html", response_class=HTMLResponse)
async def read_form_html(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})

# ✅ 주문 내역 조회
@app.get("/orders", response_class=HTMLResponse)
async def view_orders(request: Request):
    # 모든 주문 내역을 가져옵니다
    all_orders = []
    for order_list, status in [
        (pending_orders, "상품준비중"),
        (in_delivery_orders, "배송중"),
        (completed_orders, "배송완료")
    ]:
        for order in order_list:
            order_copy = dict(order)
            order_copy["status"] = status
            all_orders.append(order_copy)
    all_orders.sort(key=lambda x: x["submitted_at"], reverse=True)
    message = request.cookies.get("message")
    if message:
        message = unquote(message)
    response = templates.TemplateResponse("orders.html", {
        "request": request,
        "orders": all_orders,
        "message": message
    })
    response.delete_cookie("message")
    return response

# ✅ 사용자 주문 삭제
@app.post("/delete_user_order/{category}/{order_index}")
async def delete_user_order(category: str, order_index: int):
    try:
        # 모든 주문 목록을 가져와서 정렬
        all_orders = []
        for order in pending_orders:
            order_copy = dict(order)
            order_copy["status"] = "상품준비중"
            order_copy["source_list"] = pending_orders
            all_orders.append(order_copy)
        
        for order in in_delivery_orders:
            order_copy = dict(order)
            order_copy["status"] = "배송중"
            order_copy["source_list"] = in_delivery_orders
            all_orders.append(order_copy)
        
        for order in completed_orders:
            order_copy = dict(order)
            order_copy["status"] = "배송완료"
            order_copy["source_list"] = completed_orders
            all_orders.append(order_copy)
        
        # 주문 시간 기준으로 정렬
        all_orders.sort(key=lambda x: x["submitted_at"], reverse=True)
        
        if 0 <= order_index < len(all_orders):
            order_to_delete = all_orders[order_index]
            source_list = order_to_delete["source_list"]
            
            # 상품준비중 상태일 때만 취소 가능
            if order_to_delete["status"] != "상품준비중":
                raise HTTPException(status_code=400, detail="상품 준비중인 주문만 취소할 수 있습니다.")
            
            # 원본 리스트에서 주문 찾아서 처리
            for i, order in enumerate(source_list):
                if order["id"] == order_to_delete["id"]:
                    deleted_order = source_list.pop(i)
                    deleted_order["deleted_at"] = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
                    deleted_order["status"] = "주문취소"
                    cancelled_orders.append(deleted_order)
                    break
        else:
            raise HTTPException(status_code=404, detail="주문을 찾을 수 없습니다.")
        
        # 주문 상태 변경 후 캐시 무효화
        invalidate_cache()
        
        return RedirectResponse("/orders", status_code=302)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"주문 처리 실패: {str(e)}")

# ✅ 주문 내역 조회 API
@app.get("/api/orders")
async def get_orders():
    print("[주문 내역 조회] API 호출")  # 로깅 추가
    # 모든 주문 내역을 가져옵니다
    all_orders = []
    
    # 한 번의 반복으로 모든 주문을 처리
    for order_list, status in [
        (pending_orders, "상품준비중"),
        (in_delivery_orders, "배송중"),
        (completed_orders, "배송완료")
    ]:
        for order in order_list:
            order_copy = dict(order)
            order_copy["status"] = status
            all_orders.append(order_copy)
    
    # 정렬 최적화 (최신 주문이 위로 오도록)
    all_orders.sort(key=lambda x: x["submitted_at"], reverse=True)
    
    print(f"[주문 내역 조회] 총 {len(all_orders)}개의 주문")  # 로깅 추가
    for order in all_orders:
        print(f"[주문] ID: {order['id']}, 상태: {order['status']}, 이름: {order['name']}")  # 로깅 추가
    
    return JSONResponse(content=all_orders)
