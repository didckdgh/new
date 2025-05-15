# Dockerfile

FROM python:3.9-slim

WORKDIR /app

# 필요 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 코드 복사
COPY . .

# 정적 파일 디렉토리 설정
RUN mkdir -p /app/static && \
    mkdir -p /app/static/images && \
    mkdir -p /app/static/images/products && \
    mkdir -p /app/static/uploads && \
    cp -r static/* /app/static/ 2>/dev/null || true && \
    chmod -R 777 /app/static

# 시작 스크립트 생성
RUN echo '#!/bin/sh\n\
exec uvicorn app.main:app --host 0.0.0.0 --port 8080\n\
' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 8080

# 시작 스크립트 실행
CMD ["/app/start.sh"]


