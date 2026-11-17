"""송년회 RSVP 저장소 — Supabase(PostgREST)에 응답을 보관한다.

Render 무료 플랜은 디스크가 재시작 때 지워지므로 파일 대신 외부 DB를 쓴다.
환경변수: SUPABASE_URL, SUPABASE_SERVICE_KEY (service_role 키, 서버에서만 사용)
"""
import hashlib
import os
import time

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/rsvp")

TABLE = "rsvps"
MAX_ROWS = 300
ATTEND = {"yes", "maybe", "no"}


def _cfg():
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        raise HTTPException(503, "RSVP 저장소가 아직 설정되지 않았어요.")
    headers = {"apikey": key, "Content-Type": "application/json"}
    # 예전 service_role 키(JWT, eyJ...)는 Authorization 헤더도 필요하다.
    # 새 secret 키(sb_secret_...)는 JWT가 아니라서 apikey 헤더에만 넣는다.
    if key.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {key}"
    return f"{url}/rest/v1/{TABLE}", headers


def _hash(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


class RsvpData(BaseModel):
    attend: str = "yes"
    name: str = Field(..., min_length=1, max_length=20)
    nick: str = Field("", max_length=20)
    resolve: str = Field("", max_length=200)
    wedding: str = Field("", max_length=40)
    weddingNote: str = Field("", max_length=40)
    menus: list[str] = Field(default_factory=list, max_length=20)
    menuEtc: str = Field("", max_length=40)
    drinks: list[str] = Field(default_factory=list, max_length=20)
    drinkEtc: str = Field("", max_length=40)


class RsvpIn(BaseModel):
    id: str = Field(..., min_length=8, max_length=64, pattern=r"^[A-Za-z0-9-]+$")
    key: str = Field(..., min_length=16, max_length=128)
    data: RsvpData


@router.get("")
def list_rsvps():
    base, headers = _cfg()
    r = requests.get(
        base,
        headers=headers,
        params={"select": "id,data,updated_at", "order": "updated_at.asc", "limit": MAX_ROWS},
        timeout=10,
    )
    if not r.ok:
        raise HTTPException(502, "응답 목록을 불러오지 못했어요.")
    return {"rows": [{"id": row["id"], **row["data"]} for row in r.json()]}


@router.post("")
def save_rsvp(body: RsvpIn):
    base, headers = _cfg()
    data = body.data.model_dump()
    if data["attend"] not in ATTEND:
        data["attend"] = "yes"
    data["menus"] = [m[:40] for m in data["menus"]]
    data["drinks"] = [d[:40] for d in data["drinks"]]
    data["updatedAt"] = int(time.time() * 1000)

    # 이미 있는 응답이면, 처음 작성한 브라우저(같은 key)만 수정할 수 있다
    r = requests.get(
        base, headers=headers,
        params={"select": "key_hash", "id": f"eq.{body.id}"}, timeout=10,
    )
    if not r.ok:
        raise HTTPException(502, "저장에 실패했어요.")
    existing = r.json()
    if existing and existing[0]["key_hash"] != _hash(body.key):
        raise HTTPException(403, "다른 사람의 응답은 수정할 수 없어요.")

    r = requests.post(
        base,
        headers={**headers, "Prefer": "resolution=merge-duplicates,return=minimal"},
        json={"id": body.id, "key_hash": _hash(body.key), "data": data, "updated_at": "now()"},
        timeout=10,
    )
    if not r.ok:
        raise HTTPException(502, "저장에 실패했어요.")
    return {"ok": True}
