"""
SEO/AEO 검수 핵심 로직.
"""
import json
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

from .fetcher import fetch

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Schema.org에서 @id 참조로 연결되는 주요 프로퍼티 목록
ID_REF_PROPS = [
    "publisher", "author", "creator", "copyrightHolder",
    "mainEntity", "mainEntityOfPage", "isPartOf", "hasPart",
    "breadcrumb", "potentialAction", "target", "about",
    "subjectOf", "provider", "offeredBy", "brand",
    "itemListElement",  # BreadcrumbList 항목
    "parentOrganization", "memberOf",
]


def _check(check_id, label, status, value, detail, criteria):
    return {
        "id": check_id,
        "label": label,
        "status": status,  # "pass" | "warn" | "fail"
        "value": value,
        "detail": detail,
        "criteria": criteria,
    }


def _collect_ids(data: object, result: set):
    """JSON-LD 객체에서 선언된 모든 @id 값을 재귀적으로 수집."""
    if isinstance(data, dict):
        v = data.get("@id")
        if v and isinstance(v, str):
            result.add(v)
        for val in data.values():
            _collect_ids(val, result)
    elif isinstance(data, list):
        for item in data:
            _collect_ids(item, result)


def _find_broken_refs(data: object, declared_ids: set, path: str, broken: list):
    """@id 참조 프로퍼티가 선언된 @id를 가리키는지 검증."""
    if isinstance(data, dict):
        obj_type = data.get("@type", "")
        if isinstance(obj_type, list):
            obj_type = "/".join(obj_type)
        obj_id = data.get("@id", "")
        label = f"{obj_type or 'Object'}({obj_id[:40] if obj_id else '?'})"

        for prop in ID_REF_PROPS:
            val = data.get(prop)
            if val is None:
                continue
            # 단일 참조 객체: {"@id": "..."}
            if isinstance(val, dict) and list(val.keys()) == ["@id"]:
                ref = val["@id"]
                if ref and ref not in declared_ids:
                    broken.append(f"{label} → .{prop} 참조 @id 미선언: {ref[:60]}")
            # 배열 내 참조 객체
            elif isinstance(val, list):
                for i, item in enumerate(val):
                    if isinstance(item, dict) and list(item.keys()) == ["@id"]:
                        ref = item["@id"]
                        if ref and ref not in declared_ids:
                            broken.append(f"{label} → .{prop}[{i}] 참조 @id 미선언: {ref[:60]}")

        for val in data.values():
            if isinstance(val, (dict, list)):
                _find_broken_refs(val, declared_ids, path, broken)
    elif isinstance(data, list):
        for item in data:
            _find_broken_refs(item, declared_ids, path, broken)


def _audit_schema(schema_tags, canonical_href: str) -> dict:
    """
    Schema.org JSON-LD 검수:
    - 선언 존재 여부
    - @type 목록
    - @id 보유 여부 (주요 엔티티)
    - 페이지 간 @id 교차참조 정합성
    - WebPage @id ↔ canonical 일치 여부
    Returns dict with keys: status, value, detail, extra (list of sub-findings)
    """
    if not schema_tags:
        return {
            "status": "warn",
            "value": "(없음)",
            "detail": "JSON-LD 없음",
            "extra": [],
        }

    # 1. 모든 블록 파싱
    parsed_blocks = []
    parse_errors = 0
    for tag in schema_tags:
        try:
            data = json.loads(tag.string or "")
            parsed_blocks.append(data)
        except Exception:
            parse_errors += 1

    # 2. 선언된 @id 전체 수집
    all_declared_ids: set = set()
    for block in parsed_blocks:
        _collect_ids(block, all_declared_ids)

    # 3. @type 목록
    schema_types = []
    for block in parsed_blocks:
        if isinstance(block, dict):
            items = block.get("@graph", [block])
            for item in items:
                t = item.get("@type", "") if isinstance(item, dict) else ""
                if t:
                    schema_types.append(t if isinstance(t, str) else "/".join(t))

    # 4. @id 없는 주요 엔티티 탐지
    TOP_LEVEL_TYPES = {"WebPage", "WebSite", "Organization", "Product", "Article",
                       "NewsArticle", "BreadcrumbList", "FAQPage", "ItemPage", "LocalBusiness"}
    missing_ids = []
    for block in parsed_blocks:
        items = block.get("@graph", [block]) if isinstance(block, dict) else [block]
        for item in items:
            if not isinstance(item, dict):
                continue
            t = item.get("@type", "")
            if isinstance(t, list):
                t = t[0] if t else ""
            if t in TOP_LEVEL_TYPES and not item.get("@id"):
                missing_ids.append(t)

    # 5. 교차참조(@id 링크) 정합성 검사
    broken_refs = []
    for block in parsed_blocks:
        _find_broken_refs(block, all_declared_ids, "", broken_refs)

    # 6. WebPage @id ↔ canonical 비교
    webpage_id_mismatch = False
    webpage_id_val = None
    if canonical_href:
        for block in parsed_blocks:
            items = block.get("@graph", [block]) if isinstance(block, dict) else [block]
            for item in items:
                if not isinstance(item, dict):
                    continue
                t = item.get("@type", "")
                if isinstance(t, list):
                    t = t[0] if t else ""
                if t in ("WebPage", "ItemPage", "Article", "NewsArticle", "Product"):
                    wid = item.get("@id", "")
                    if wid:
                        webpage_id_val = wid
                        # trailing slash 무시 비교
                        if wid.rstrip("/") != canonical_href.rstrip("/"):
                            webpage_id_mismatch = True

    # 7. 종합 판정
    extra = []
    issues_count = 0

    if parse_errors:
        extra.append({"type": "warn", "msg": f"JSON-LD 파싱 실패 블록: {parse_errors}개"})
        issues_count += 1

    if missing_ids:
        extra.append({"type": "warn", "msg": f"@id 미선언 주요 타입: {', '.join(set(missing_ids))}"})
        issues_count += len(missing_ids)

    if broken_refs:
        for ref in broken_refs[:5]:  # 최대 5개만 표시
            extra.append({"type": "fail", "msg": f"교차참조 오류: {ref}"})
        if len(broken_refs) > 5:
            extra.append({"type": "fail", "msg": f"…외 {len(broken_refs) - 5}건 추가 교차참조 오류"})
        issues_count += len(broken_refs)

    if webpage_id_mismatch and webpage_id_val:
        extra.append({
            "type": "warn",
            "msg": f"WebPage @id({webpage_id_val[:60]}) ≠ canonical({canonical_href[:60]})"
        })
        issues_count += 1
    elif webpage_id_val and not webpage_id_mismatch:
        extra.append({"type": "pass", "msg": f"WebPage @id ↔ canonical 일치 확인"})

    if not extra:
        extra.append({"type": "pass", "msg": f"@id 교차참조 이상 없음 (선언 ID {len(all_declared_ids)}개)"})

    if issues_count == 0:
        status = "pass"
    elif broken_refs:
        status = "fail"
    else:
        status = "warn"

    type_str = ", ".join(schema_types[:6]) + ("…" if len(schema_types) > 6 else "") if schema_types else "있음(타입불명)"
    detail = f"{len(schema_tags)}블록 · ID선언 {len(all_declared_ids)}개"

    return {
        "status": status,
        "value": type_str,
        "detail": detail,
        "extra": extra,
    }


def audit_url(url: str) -> dict:
    result = {
        "url": url,
        "http_status": None,
        "accessible": False,
        "fetched_via": None,
        "overall_status": "fail",
        "issue_count": None,
        "issues": [],
        "checks": [],
        "error": None,
    }

    try:
        resp, via = fetch(url, HEADERS, timeout=20)
        result["fetched_via"] = via
        result["http_status"] = resp.status_code
        result["accessible"] = resp.status_code == 200

        if resp.status_code != 200:
            msg = f"HTTP {resp.status_code} 오류로 페이지에 접근할 수 없습니다."
            if resp.status_code in (403, 999) and via == "direct":
                msg += " IP 차단 가능성이 있습니다 — SCRAPERAPI_KEY 환경변수를 설정하면 프록시로 자동 재시도합니다."
            result["error"] = msg
            result["overall_status"] = "fail"
            return result

        soup = BeautifulSoup(resp.text, "html.parser")
        checks = []
        issues = []

        # ── 메타 타이틀 ──────────────────────────────────────
        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        title_len = len(title_text)
        if not title_text:
            checks.append(_check("meta_title", "메타 타이틀", "fail", "(없음)", "0자", "필수: title 태그가 존재해야 함"))
            issues.append("메타타이틀 없음")
        else:
            ok = 30 <= title_len <= 60
            checks.append(_check(
                "meta_title", "메타 타이틀", "pass" if ok else "warn",
                title_text, f"{title_len}자", "권장 30~60자",
            ))
            if not ok:
                issues.append(f"메타타이틀 길이 부적절({title_len}자)")

        # ── 메타 디스크립션 ──────────────────────────────────
        desc_tag = soup.find("meta", attrs={"name": "description"})
        desc_text = desc_tag.get("content", "").strip() if desc_tag else ""
        desc_len = len(desc_text)
        if not desc_text:
            checks.append(_check("meta_desc", "메타 디스크립션", "fail", "(없음)", "0자", "필수: meta description이 존재해야 함"))
            issues.append("메타디스크립션 없음")
        else:
            ok = 70 <= desc_len <= 160
            checks.append(_check(
                "meta_desc", "메타 디스크립션", "pass" if ok else "warn",
                desc_text, f"{desc_len}자", "권장 70~160자",
            ))
            if not ok:
                issues.append(f"메타디스크립션 길이 부적절({desc_len}자)")

        # ── H1 ───────────────────────────────────────────────
        h1s = soup.find_all("h1")
        h1_count = len(h1s)
        h1_text = h1s[0].get_text(strip=True)[:80] if h1s else "(없음)"
        if h1_count == 0:
            checks.append(_check("h1", "H1 태그", "fail", "(없음)", "0개", "정확히 1개 권장 (0개=실패, 2개 이상=경고)"))
            issues.append("H1 없음")
        elif h1_count > 1:
            checks.append(_check("h1", "H1 태그", "warn", h1_text, f"{h1_count}개", "정확히 1개 권장 (0개=실패, 2개 이상=경고)"))
            issues.append(f"H1 중복({h1_count}개)")
        else:
            checks.append(_check("h1", "H1 태그", "pass", h1_text, f"{h1_count}개", "정확히 1개 권장 (0개=실패, 2개 이상=경고)"))

        # ── H2 ───────────────────────────────────────────────
        h2_count = len(soup.find_all("h2"))
        if h2_count == 0:
            checks.append(_check("h2", "H2 태그", "warn", "(없음)", "0개", "콘텐츠 구조화를 위해 1개 이상 권장"))
            issues.append("H2 없음")
        else:
            checks.append(_check("h2", "H2 태그", "pass", f"{h2_count}개", f"{h2_count}개", "콘텐츠 구조화를 위해 1개 이상 권장"))

        # ── hreflang ─────────────────────────────────────────
        hreflang_tags = soup.find_all("link", rel="alternate")
        hreflang_count = len(hreflang_tags)
        path_segments = [s for s in urlparse(url).path.split("/") if s]
        country_hint = path_segments[0] if path_segments else ""
        self_ref = bool(country_hint) and any(country_hint in (t.get("href") or "") for t in hreflang_tags)
        if hreflang_count == 0:
            checks.append(_check("hreflang", "hreflang", "warn", "(없음)", "0개", "다국가 페이지의 경우 hreflang 및 자기참조(self-referencing) 필요"))
            issues.append("hreflang 없음")
        else:
            checks.append(_check(
                "hreflang", "hreflang", "pass" if self_ref else "warn",
                f"{hreflang_count}개", f"자기참조: {'O' if self_ref else '확인불가/X'}",
                "다국가 페이지의 경우 hreflang 및 자기참조(self-referencing) 필요",
            ))
            if not self_ref:
                issues.append("자기참조 hreflang 미확인")

        # ── canonical ────────────────────────────────────────
        canonical = soup.find("link", rel="canonical")
        canonical_href = canonical.get("href", "") if canonical else ""
        if not canonical_href:
            checks.append(_check("canonical", "Canonical", "fail", "(없음)", "-", "필수: canonical 태그가 존재해야 함"))
            issues.append("Canonical 없음")
        else:
            checks.append(_check("canonical", "Canonical", "pass", canonical_href, "-", "필수: canonical 태그가 존재해야 함"))

        # ── html lang ────────────────────────────────────────
        html_tag = soup.find("html")
        lang_attr = html_tag.get("lang", "") if html_tag else ""
        if not lang_attr:
            checks.append(_check("html_lang", "HTML lang 속성", "fail", "(없음)", "-", "필수: html 태그에 lang 속성 필요"))
            issues.append("HTML lang 속성 없음")
        else:
            checks.append(_check("html_lang", "HTML lang 속성", "pass", lang_attr, "-", "필수: html 태그에 lang 속성 필요"))

        # ── Open Graph ───────────────────────────────────────
        og_map = {
            "og:title": soup.find("meta", property="og:title"),
            "og:description": soup.find("meta", property="og:description"),
            "og:image": soup.find("meta", property="og:image"),
            "og:url": soup.find("meta", property="og:url"),
        }
        missing_og = [k for k, v in og_map.items() if not v]
        og_status = "pass" if not missing_og else ("warn" if len(missing_og) < 4 else "fail")
        checks.append(_check(
            "og_tags", "Open Graph 태그", og_status,
            f"{4 - len(missing_og)}/4 존재", ("누락: " + ", ".join(missing_og)) if missing_og else "모두 존재",
            "소셜 공유 최적화를 위해 og:title/description/image/url 4종 권장",
        ))
        if missing_og:
            issues.append(f"OG 태그 누락: {', '.join(missing_og)}")

        # ── Schema.org (JSON-LD) + @id 교차참조 ─────────────
        schema_tags = soup.find_all("script", type="application/ld+json")
        schema_result = _audit_schema(schema_tags, canonical_href)
        schema_check = _check(
            "schema",
            "구조화 데이터 (Schema.org)",
            schema_result["status"],
            schema_result["value"],
            schema_result["detail"],
            "권장: JSON-LD 구조화 데이터 + @id 교차참조 정합성",
        )
        schema_check["schema_extra"] = schema_result["extra"]
        checks.append(schema_check)

        if not schema_tags:
            issues.append("구조화데이터(Schema.org) 없음")
        elif schema_result["status"] == "fail":
            issues.append("Schema @id 교차참조 오류")
        elif schema_result["status"] == "warn":
            issues.append("Schema @id 경고")

        # ── robots / noindex ─────────────────────────────────
        robots_tag = soup.find("meta", attrs={"name": "robots"})
        robots_content = robots_tag.get("content", "") if robots_tag else ""
        is_noindex = "noindex" in robots_content.lower()
        checks.append(_check(
            "robots", "Robots / noindex", "fail" if is_noindex else "pass",
            robots_content or "없음(기본 index)", "noindex!" if is_noindex else "index",
            "noindex 설정 시 검색엔진 미노출 — 의도치 않은 noindex 여부 필수 확인",
        ))
        if is_noindex:
            issues.append("noindex 설정됨!")

        result["checks"] = checks
        result["issues"] = issues
        result["issue_count"] = len(issues)
        if len(issues) == 0:
            result["overall_status"] = "pass"
        elif len(issues) <= 2:
            result["overall_status"] = "warn"
        else:
            result["overall_status"] = "fail"

    except requests.Timeout:
        result["error"] = "요청 시간 초과 (timeout)"
        result["overall_status"] = "fail"
    except requests.RequestException as e:
        result["error"] = f"요청 오류: {str(e)[:150]}"
        result["overall_status"] = "fail"
    except Exception as e:
        result["error"] = f"알 수 없는 오류: {str(e)[:150]}"
        result["overall_status"] = "fail"

    return result
