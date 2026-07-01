# SEO / AEO 검수 대시보드

samsung.com / apple.com 페이지의 메타타이틀·디스크립션, H1/H2, hreflang, canonical, lang 속성,
OG 태그, Schema.org, robots/noindex를 실시간으로 검수하는 웹 대시보드입니다.

## 구조

- **백엔드**: FastAPI (`app/`) — 기존 `samsung_seo_audit_auto.py`의 검수 로직을 이식
- **프론트엔드**: React (빌드 없이 ESM CDN + [htm](https://github.com/developit/htm)) + Tailwind CDN (`static/`)
- 백엔드 하나가 API(`/api/*`)와 정적 프론트엔드를 함께 서빙합니다.

## samsung.com IP 차단 우회

samsung.com은 일부 클라우드/데이터센터 IP를 `403 Host not in allowlist`로 차단합니다.
`app/fetcher.py`가 직접 요청이 403/999로 실패하면 [ScraperAPI](https://www.scraperapi.com)
(로테이팅/레지덴셜 프록시) 를 통해 자동으로 재시도합니다.

1. https://www.scraperapi.com 에서 무료 가입 (월 5,000 크레딧 무료 티어)
2. API 키 발급
3. 환경변수 `SCRAPERAPI_KEY`에 설정 (로컬은 `.env` 참고, Render는 대시보드에서 설정)

키가 없어도 앱은 정상 동작하며, samsung.com이 직접 요청을 차단할 경우에만 화면 상단에 경고 배너가 표시됩니다.

## 로컬 실행

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt

set SCRAPERAPI_KEY=your_key_here   # 선택사항 (PowerShell: $env:SCRAPERAPI_KEY="...")
uvicorn app.main:app --reload --port 8000
```

브라우저에서 http://localhost:8000 접속.

## Render 배포

1. 이 폴더를 GitHub 저장소에 push
2. Render 대시보드 → **New +** → **Blueprint** → 저장소 선택 (`render.yaml` 자동 인식)
3. 배포 후 **Environment**에서 `SCRAPERAPI_KEY` 값 입력
4. 배포 완료 시 발급되는 `https://seo-aeo-audit-dashboard.onrender.com` 형태의 URL로 누구나 접속 가능

무료 플랜은 일정 시간 미사용 시 슬립되며, 재접속 시 첫 요청이 몇 초 느릴 수 있습니다.

## 검수 기준

| 항목 | 기준 |
|---|---|
| 메타 타이틀 | 필수 존재, 권장 30~60자 |
| 메타 디스크립션 | 필수 존재, 권장 70~160자 |
| H1 | 정확히 1개 권장 (0개=실패, 2개 이상=경고) |
| H2 | 1개 이상 권장 |
| hreflang | 존재 + 자기참조(self-referencing) 권장 |
| Canonical | 필수 존재 |
| HTML lang | 필수 존재 |
| Open Graph | title/description/image/url 4종 권장 |
| Schema.org | JSON-LD 구조화 데이터 권장 (AEO 대응) |
| robots/noindex | 의도치 않은 noindex 여부 확인 |

종합 판정: 미흡 0개 = 정상 / 1~2개 = 경고 / 3개 이상 또는 접근 불가 = 실패
