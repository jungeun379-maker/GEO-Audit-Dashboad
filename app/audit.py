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

ID_REF_PROPS = [
    "publisher", "author", "creator", "copyrightHolder",
    "mainEntity", "mainEntityOfPage", "isPartOf", "hasPart",
    "breadcrumb", "potentialAction", "target", "about",
    "subjectOf", "provider", "offeredBy", "brand",
    "itemListElement", "parentOrganization", "memberOf",
]


def _check(check_id, label, status, value, detail, criteria):
    return {
        "id": check_id,
        "label": label,
        "status": status,
        "value": value,
        "detail": detail,
        "criteria": criteria,
    }


def _collect_ids(data, result):
    if isinstance(data, dict):
        v = data.get("@id")
        if v and isinstance(v, str):
            result.add(v)
        for val in data.values():
            _collect_ids(val, result)
    elif isinstance(data, list):
        for item in data:
            _collect_ids(item, result)


def _find_broken_refs(data, declared_ids, broken):
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
            if isinstance(val, dict) and list(val.keys()) == ["@id"]:
                ref = val["@id"]
                if ref and ref not in declared_ids:
                    broken.append(f"{label} → .{prop} 참조 @id 미선언: {ref[:60]}")
            elif isinstance(val, list):
                for i, item in enumerate(val):
                    if isinstance(item, dict) and list(item.keys()) == ["@id"]:
                        ref = item["@id"]
                        if ref and ref not in declared_ids:
                            broken.append(f"{label} → .{prop}[{i}] 참조 @id 미선언: {ref[:60]}")
        for val in data.values():
            if isinstance(val, (dict, list)):
                _find_broken_refs(val, declared_ids, broken)
    elif isinstance(data, list):
        for item in data:
            _find_broken_refs(item, declared_ids, broken)


def _audit_schema(schema_tags, canonical_href):
    if not schema_tags:
        return {
            "status": "warn", "value": "(없음)", "detail": "JSON-LD 없음",
            "extra": [], "entities": [], "failed_blocks": [],
        }

    parsed_blocks = []
    failed_blocks = []
    for tag in schema_tags:
        raw = (tag.string or "").strip()
        try:
            data = json.loads(raw)
            parsed_blocks.append(data)
        except Exception as e:
            failed_blocks.append({"raw": raw[:2000], "error": str(e)})

    all_declared_ids = set()
    for block in parsed_blocks:
        _collect_ids(block, all_declared_ids)

    # @type 목록 + 엔티티 목록
    schema_types = []
    entities = []
    TOP_LEVEL_TYPES = {
        "WebPage", "WebSite", "Organization", "Product", "Article",
        "NewsArticle", "BreadcrumbList", "FAQPage", "ItemPage", "LocalBusiness",
    }
    missing_ids = []

    for block in parsed_blocks:
        if not isinstance(block, dict):
            continue
        items = block.get("@graph", [block])
        for item in items:
            if not isinstance(item, dict):
                continue
            t = item.get("@type", "")
            if isinstance(t, list):
                t = "/".join(t)
            eid = item.get("@id", "")
            if t:
                schema_types.append(t)
                entities.append({"type": t, "id": eid})
            if t in TOP_LEVEL_TYPES and not eid:
                missing_ids.append(t)

    broken_refs = []
    for block in parsed_blocks:
        _find_broken_refs(block, all_declared_ids, broken_refs)

    # WebPage @id vs canonical
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
                        if wid.rstrip("/") != canonical_href.rstrip("/"):
                            webpage_id_mismatch = True

    extra = []
    issues_count = 0

    if failed_blocks:
        extra.append({"type": "warn", "msg": f"JSON-LD 파싱 실패 블록: {len(failed_blocks)}개"})
        issues_count += 1
    if missing_ids:
        extra.append({"type": "warn", "msg": f"@id 미선언 주요 타입: {', '.join(set(missing_ids))}"})
        issues_count += len(missing_ids)
    if broken_refs:
        for ref in broken_refs[:5]:
            extra.append({"type": "fail", "msg": f"교차참조 오류: {ref}"})
        if len(broken_refs) > 5:
            extra.append({"type": "fail", "msg": f"…외 {len(broken_refs) - 5}건 추가 교차참조 오류"})
        issues_count += len(broken_refs)
    if webpage_id_mismatch and webpage_id_val:
        extra.append({"type": "warn", "msg": f"WebPage @id({webpage_id_val[:60]}) ≠ canonical({canonical_href[:60]})"})
        issues_count += 1
    elif webpage_id_val and not webpage_id_mismatch:
        extra.append({"type": "pass", "msg": "WebPage @id ↔ canonical 일치 확인"})

    if not extra:
        extra.append({"type": "pass", "msg": f"@id 교차참조 이상 없음 (선언 ID {len(all_declared_ids)}개)"})

    status = "fail" if broken_refs else ("warn" if issues_count else "pass")
    type_str = (
        ", ".join(schema_types[:6]) + ("…" if len(schema_types) > 6 else "")
        if schema_types else "있음(타입불명)"
    )

    return {
        "status": status,
        "value": type_str,
        "detail": f"{len(schema_tags)}블록 · ID선언 {len(all_declared_ids)}개",
        "extra": extra,
        "entities": entities,
        "failed_blocks": failed_blocks,
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
                msg += " IP 차단 가능성 — SCRAPERAPI_KEY 환경변수를 설정하면 프록시로 자동 재시도합니다."
            result["error"] = msg
            return result

        soup = BeautifulSoup(resp.text, "html.parser")
        checks = []
        issues = []

        # ── 메타 타이틀 ──────────────────────────────────────
        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        title_len = len(title_text)
        if not title_text:
            c = _check("meta_title", "메타 타이틀", "fail", "(없음)", "0자", "필수: title 태그 존재, 권장 30~60자")
            issues.append("메타타이틀 없음")
        else:
            ok = 30 <= title_len <= 60
            c = _check("meta_title", "메타 타이틀", "pass" if ok else "warn",
                       title_text, f"{title_len}자", "권장 30~60자")
            if not ok:
                issues.append(f"메타타이틀 길이 부적절({title_len}자)")
        checks.append(c)

        # ── 메타 디스크립션 ──────────────────────────────────
        desc_tag = soup.find("meta", attrs={"name": "description"})
        desc_text = desc_tag.get("content", "").strip() if desc_tag else ""
        desc_len = len(desc_text)
        if not desc_text:
            c = _check("meta_desc", "메타 디스크립션", "fail", "(없음)", "0자", "필수: meta description 존재, 권장 70~160자")
            issues.append("메타디스크립션 없음")
        else:
            ok = 70 <= desc_len <= 160
            c = _check("meta_desc", "메타 디스크립션", "pass" if ok else "warn",
                       desc_text, f"{desc_len}자", "권장 70~160자")
            if not ok:
                issues.append(f"메타디스크립션 길이 부적절({desc_len}자)")
        checks.append(c)

        # ── H1 ───────────────────────────────────────────────
        h1s = soup.find_all("h1")
        h1_count = len(h1s)
        h1_texts = [h.get_text(strip=True)[:120] for h in h1s]
        h1_text = h1_texts[0] if h1_texts else "(없음)"
        if h1_count == 0:
            c = _check("h1", "H1 태그", "fail", "(없음)", "0개", "정확히 1개 권장")
            issues.append("H1 없음")
        elif h1_count > 1:
            c = _check("h1", "H1 태그", "warn", h1_text, f"{h1_count}개", "정확히 1개 권장")
            issues.append(f"H1 중복({h1_count}개)")
        else:
            c = _check("h1", "H1 태그", "pass", h1_text, f"{h1_count}개", "정확히 1개 권장")
        c["extra_data"] = {"texts": h1_texts}
        checks.append(c)

        # ── H2 ───────────────────────────────────────────────
        h2s_all = soup.find_all("h2")
        h2_count = len(h2s_all)
        h2_texts = [h.get_text(strip=True)[:120] for h in h2s_all[:20]]
        if h2_count == 0:
            c = _check("h2", "H2 태그", "warn", "(없음)", "0개", "1개 이상 권장 (콘텐츠 구조화)")
            issues.append("H2 없음")
        else:
            c = _check("h2", "H2 태그", "pass", f"{h2_count}개", f"{h2_count}개", "1개 이상 권장")
        c["extra_data"] = {"texts": h2_texts}
        checks.append(c)

        # ── hreflang ─────────────────────────────────────────
        hreflang_tags = soup.find_all("link", rel="alternate")
        hreflang_count = len(hreflang_tags)
        path_segments = [s for s in urlparse(url).path.split("/") if s]
        country_hint = path_segments[0] if path_segments else ""
        self_ref = bool(country_hint) and any(
            country_hint in (t.get("href") or "") for t in hreflang_tags
        )
        if hreflang_count == 0:
            c = _check("hreflang", "hreflang", "warn", "(없음)", "0개",
                       "다국가 페이지의 경우 hreflang 및 자기참조 필요")
            issues.append("hreflang 없음")
        else:
            c = _check("hreflang", "hreflang", "pass" if self_ref else "warn",
                       f"{hreflang_count}개", f"자기참조: {'O' if self_ref else '확인불가/X'}",
                       "다국가 페이지의 경우 hreflang 및 자기참조 필요")
            if not self_ref:
                issues.append("자기참조 hreflang 미확인")
        checks.append(c)

        # ── canonical ────────────────────────────────────────
        canonical = soup.find("link", rel="canonical")
        canonical_href = canonical.get("href", "") if canonical else ""
        if not canonical_href:
            c = _check("canonical", "Canonical", "fail", "(없음)", "-", "필수: canonical 태그 존재")
            issues.append("Canonical 없음")
        else:
            c = _check("canonical", "Canonical", "pass", canonical_href, "-", "필수: canonical 태그 존재")
        checks.append(c)

        # ── html lang ────────────────────────────────────────
        html_tag = soup.find("html")
        lang_attr = html_tag.get("lang", "") if html_tag else ""
        if not lang_attr:
            c = _check("html_lang", "HTML lang 속성", "fail", "(없음)", "-", "필수: html 태그에 lang 속성")
            issues.append("HTML lang 속성 없음")
        else:
            c = _check("html_lang", "HTML lang 속성", "pass", lang_attr, "-", "필수: html 태그에 lang 속성")
        checks.append(c)

        # ── Open Graph ───────────────────────────────────────
        og_map = {
            "og:title":       soup.find("meta", property="og:title"),
            "og:description": soup.find("meta", property="og:description"),
            "og:image":       soup.find("meta", property="og:image"),
            "og:url":         soup.find("meta", property="og:url"),
        }
        og_values = {k: (v.get("content", "") if v else "") for k, v in og_map.items()}
        missing_og = [k for k, v in og_map.items() if not v]
        og_status = "pass" if not missing_og else ("warn" if len(missing_og) < 4 else "fail")
        c = _check(
            "og_tags", "Open Graph 태그", og_status,
            f"{4 - len(missing_og)}/4 존재",
            ("누락: " + ", ".join(missing_og)) if missing_og else "모두 존재",
            "og:title / description / image / url 4종 권장",
        )
        c["extra_data"] = {"values": og_values}
        if missing_og:
            issues.append(f"OG 태그 누락: {', '.join(missing_og)}")
        checks.append(c)

        # ── Schema.org + @id 교차참조 ────────────────────────
        schema_tags = soup.find_all("script", type="application/ld+json")
        sr = _audit_schema(schema_tags, canonical_href)
        c = _check(
            "schema", "구조화 데이터 (Schema.org)", sr["status"],
            sr["value"], sr["detail"],
            "JSON-LD 구조화 데이터 + @id 교차참조 정합성",
        )
        c["schema_extra"] = sr["extra"]
        c["extra_data"] = {"entities": sr["entities"], "failed_blocks": sr["failed_blocks"]}
        if not schema_tags:
            issues.append("구조화데이터(Schema.org) 없음")
        elif sr["status"] == "fail":
            issues.append("Schema @id 교차참조 오류")
        elif sr["status"] == "warn":
            issues.append("Schema @id 경고")
        checks.append(c)

        # ── robots / noindex ─────────────────────────────────
        robots_tag = soup.find("meta", attrs={"name": "robots"})
        robots_content = robots_tag.get("content", "") if robots_tag else ""
        is_noindex = "noindex" in robots_content.lower()
        c = _check(
            "robots", "Robots / noindex", "fail" if is_noindex else "pass",
            robots_content or "없음(기본 index)", "noindex!" if is_noindex else "index",
            "noindex 설정 시 검색엔진 미노출 — 의도치 않은 설정 여부 필수 확인",
        )
        if is_noindex:
            issues.append("noindex 설정됨!")
        checks.append(c)

        result["checks"] = checks
        result["issues"] = issues
        result["issue_count"] = len(issues)
        result["overall_status"] = (
            "pass" if len(issues) == 0 else
            "warn" if len(issues) <= 2 else "fail"
        )

    except requests.Timeout:
        result["error"] = "요청 시간 초과 (timeout)"
    except re
