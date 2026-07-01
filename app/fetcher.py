"""
페이지 요청 로직.

samsung.com은 일부 클라우드/데이터센터 IP를 "403 Host not in allowlist"로 차단하는 이슈가 있어,
직접 요청이 차단 상태 코드(403/999)로 실패하면 ScraperAPI(레지덴셜/로테이팅 프록시)를 통해
자동으로 재시도한다. SCRAPERAPI_KEY 환경변수가 없으면 프록시 재시도 없이 direct 결과를 그대로 반환한다.
"""
import os
import requests

SCRAPERAPI_KEY = os.environ.get("SCRAPERAPI_KEY", "")
SCRAPERAPI_ENDPOINT = "http://api.scraperapi.com"

# 데이터센터 IP 차단 시 흔히 나타나는 상태 코드
BLOCKED_STATUS_CODES = {403, 999}


def _fetch_direct(url: str, headers: dict, timeout: int) -> requests.Response:
    return requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)


def _fetch_via_proxy(url: str, timeout: int) -> requests.Response:
    params = {"api_key": SCRAPERAPI_KEY, "url": url}
    # 프록시 경유는 왕복 시간이 더 걸릴 수 있어 타임아웃을 여유 있게 둔다
    return requests.get(SCRAPERAPI_ENDPOINT, params=params, timeout=timeout + 30)


def fetch(url: str, headers: dict, timeout: int = 20):
    """
    (Response, "direct" | "proxy") 튜플을 반환한다.
    direct 요청이 차단/실패하고 SCRAPERAPI_KEY가 설정되어 있으면 proxy로 자동 재시도한다.
    """
    direct_error = None
    direct_resp = None
    try:
        direct_resp = _fetch_direct(url, headers, timeout)
        if direct_resp.status_code not in BLOCKED_STATUS_CODES:
            return direct_resp, "direct"
    except requests.RequestException as e:
        direct_error = e

    if SCRAPERAPI_KEY:
        proxy_resp = _fetch_via_proxy(url, timeout)
        return proxy_resp, "proxy"

    if direct_resp is not None:
        return direct_resp, "direct"
    raise direct_error
