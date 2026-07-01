import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .audit import audit_url
from .countries import COUNTRY_CODES

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Samsung/Apple SEO·AEO Audit Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuditRequest(BaseModel):
    url: str


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "proxy_configured": bool(os.environ.get("SCRAPERAPI_KEY")),
    }


@app.get("/api/countries")
def get_countries():
    return {"codes": COUNTRY_CODES}


@app.post("/api/audit")
def run_audit(req: AuditRequest):
    return audit_url(req.url.strip())


# API 라우트 다음에 마운트해야 /api/* 가 정적 파일 핸들러에 가로채이지 않는다
app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
