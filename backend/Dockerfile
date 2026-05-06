# Backend image for Railway — FastAPI + Motor
# Static assets (~679MB under static/) are served from Cloudflare R2 via
# STATIC_BASE_URL; they are NOT copied into this image. See .dockerignore.

FROM python:3.12-slim

# System deps:
#   - tesseract-ocr: Cam17/18/19 audioscript OCR fallback (services use pytesseract)
#   - poppler-utils: pdf2image dependency
#   - ffmpeg: pydub transcode (imageio-ffmpeg ships a bundled copy too, but apt
#     ffmpeg is more reliable in container env)
#   - libsndfile1: audio loaders some deps require
RUN apt-get update && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        poppler-utils \
        ffmpeg \
        libsndfile1 \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first for better layer caching
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy app code (static/ excluded via .dockerignore)
COPY . .

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

EXPOSE 8000

# Railway sets $PORT automatically; bind 0.0.0.0
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
