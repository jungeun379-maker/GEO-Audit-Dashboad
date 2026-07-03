import React from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";

const html = htm.bind(React.createElement);
const { useState, useEffect, useRef, useCallback } = React;

// ────────────────────────────────────────────────────────────────
// 상수 / 유틸
// ────────────────────────────────────────────────────────────────

const STATUS_META = {
  pass: { label: "정상", chip: "bg-emerald-100 text-emerald-700 border-emerald-300", dot: "bg-emerald-500" },
  warn: { label: "경고", chip: "bg-amber-100 text-amber-700 border-amber-300", dot: "bg-amber-500" },
  fail: { label: "실패", chip: "bg-rose-100 text-rose-700 border-rose-300", dot: "bg-rose-500" },
};

const SECTION_MAP = {
  meta_title: "메타태그", meta_desc: "메타태그",
  h1: "H태그 구조", h2: "H태그 구조",
  hreflang: "hreflang",
  canonical: "Canonical / lang", html_lang: "Canonical / lang",
  og_tags: "Open Graph",
  schema: "구조화 데이터",
  robots: "크롤링 (robots)",
};

const CRITERIA_GUIDE = [
  { section: "메타태그", rows: [
    ["메타 타이틀", "필수 존재, 권장 길이 30~60자"],
    ["메타 디스크립션", "필수 존재, 권장 길이 70~160자"],
  ]},
  { section: "H태그 구조", rows: [
    ["H1", "정확히 1개 권장 (0개=실패, 2개 이상=경고)"],
    ["H2", "1개 이상 권장 (콘텐츠 구조화)"],
  ]},
  { section: "hreflang", rows: [
    ["hreflang", "다국가 페이지의 경우 hreflang 태그 및 자기참조(self-referencing) 필요"],
  ]},
  { section: "Canonical / lang", rows: [
    ["Canonical", "canonical 태그 필수 존재"],
    ["HTML lang", "html 태그에 lang 속성 필수"],
  ]},
  { section: "Open Graph", rows: [
    ["OG 태그", "og:title / og:description / og:image / og:url 4종 모두 권장"],
  ]},
  { section: "구조화 데이터", rows: [
    ["Schema.org", "JSON-LD 구조화 데이터 권장 (rich snippet / AEO 대응)"],
  ]},
  { section: "크롤링 (robots)", rows: [
    ["robots/noindex", "noindex 설정 시 검색엔진 미노출 — 의도치 않은 설정 여부 필수 확인"],
  ]},
  { section: "종합 판정", rows: [
    ["정상(pass)", "미흡 항목 0개"],
    ["경고(warn)", "미흡 항목 1~2개"],
    ["실패(fail)", "페이지 접근 불가 또는 미흡 항목 3개 이상"],
  ]},
];

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function extractLabel(url) {
  try {
    const u = new URL(url);
    const seg = u.pathname.split("/").filter(Boolean)[0];
    return seg || u.hostname;
  } catch {
    return url;
  }
}

async function auditOne(url) {
  const res = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`서버 오류 (HTTP ${res.status})`);
  return res.json();
}

async function runPool(items, worker, concurrency, onEach) {
  let idx = 0;
  async function runner() {
    while (idx < items.length) {
      const i = idx++;
      const item = items[i];
      try {
        const result = await worker(item);
        onEach(item, result, null);
      } catch (e) {
        onEach(item, null, e.message || String(e));
      }
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, runner);
  await Promise.all(runners);
}

function toCSV(rows) {
  const header = ["국가/구분", "URL", "HTTP상태", "종합판정", "미흡항목수", "미흡항목", "수집경로"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const cells = [
      extractLabel(r.url),
      r.url,
      r.http_status ?? "",
      r.overall_status ?? "",
      r.issue_count ?? "",
      (r.issues || []).join(" | "),
      r.fetched_via ?? "",
    ].map((c) => `"${String(c).replace(/"/g, '""')}"`);
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}

function downloadCSV(rows, filename) {
  const csv = "﻿" + toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ────────────────────────────────────────────────────────────────
// 공통 UI 조각
// ────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status || "-", chip: "bg-slate-100 text-slate-600 border-slate-300", dot: "bg-slate-400" };
  return html`
    <span class=${classNames("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", meta.chip)}>
      <span class=${classNames("w-1.5 h-1.5 rounded-full", meta.dot)}></span>
      ${meta.label}
    </span>
  `;
}

function Header() {
  return html`
    <header class="bg-navy-500 text-white">
      <div class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <p class="text-navy-100 text-xs tracking-widest font-medium">SEO / AEO AUDIT</p>
          <h1 class="text-2xl font-bold mt-1">검수 대시보드</h1>
          <p class="text-navy-100 text-sm mt-1">samsung.com · apple.com 메타/구조/hreflang/Schema 검수</p>
        </div>
        <div class="hidden sm:flex flex-col items-end text-navy-100 text-xs gap-1">
          <span>메타타이틀·디스크립션 · H1/H2 · hreflang · canonical</span>
          <span>lang 속성 · OG 태그 · Schema.org · robots/noindex</span>
        </div>
      </div>
    </header>
  `;
}

function ProxyBanner() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => setHealth({ proxy_configured: false, error: true }));
  }, []);
  if (!health || health.proxy_configured) return null;
  return html`
    <div class="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
      <div class="max-w-6xl mx-auto px-6 py-2.5">
        ⚠️ SCRAPERAPI_KEY가 설정되지 않았습니다. samsung.com이 서버 IP를 차단(403)하는 경우 자동 우회가 되지 않을 수 있습니다.
        Render 환경변수에 <code class="bg-amber-100 px-1 rounded">SCRAPERAPI_KEY</code>를 설정해주세요.
      </div>
    </div>
  `;
}

function CriteriaLegend() {
  const [open, setOpen] = useState(false);
  return html`
    <div class="border border-navy-200 rounded-xl bg-white overflow-hidden">
      <button
        class="w-full flex items-center justify-between px-5 py-3 text-navy-700 font-semibold text-sm hover:bg-navy-50"
        onClick=${() => setOpen(!open)}
      >
        <span>📋 검수 기준 안내 (스테이지별 판정 기준)</span>
        <span class="text-navy-400">${open ? "숨기기 ▲" : "펼치기 ▼"}</span>
      </button>
      ${open && html`
        <div class="px-5 pb-5 grid sm:grid-cols-2 gap-4">
          ${CRITERIA_GUIDE.map((g) => html`
            <div key=${g.section} class="border border-navy-100 rounded-lg p-3 bg-navy-50/50">
              <p class="text-navy-600 font-semibold text-xs mb-2">${g.section}</p>
              <ul class="space-y-1">
                ${g.rows.map(([label, criteria]) => html`
                  <li key=${label} class="text-xs text-navy-800">
                    <span class="font-medium">${label}</span>
                    <span class="text-navy-500"> — ${criteria}</span>
                  </li>
                `)}
              </ul>
            </div>
          `)}
        </div>
      `}
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// 결과 상세 카드
// ────────────────────────────────────────────────────────────────

function ResultCard({ result }) {
  if (!result) return null;
  if (result.error && !result.checks?.length) {
    return html`
      <div class="fade-in border border-rose-200 bg-rose-50 rounded-xl p-5">
        <div class="flex items-center gap-2 mb-2">
          <${StatusBadge} status="fail" />
          <span class="text-sm text-navy-700 font-medium">${result.url}</span>
        </div>
        <p class="text-rose-700 text-sm">${result.error}</p>
        ${result.http_status ? html`<p class="text-rose-500 text-xs mt-1">HTTP 상태: ${result.http_status}</p>` : null}
      </div>
    `;
  }

  const sections = {};
  for (const c of result.checks) {
    const s = SECTION_MAP[c.id] || "기타";
    (sections[s] = sections[s] || []).push(c);
  }

  return html`
    <div class="fade-in border border-navy-200 bg-white rounded-xl overflow-hidden">
      <div class="px-5 py-4 bg-navy-50 flex flex-wrap items-center justify-between gap-2 border-b border-navy-100">
        <div class="min-w-0">
          <p class="text-navy-900 font-semibold truncate max-w-xl">${result.url}</p>
          <p class="text-navy-500 text-xs mt-0.5">
            HTTP ${result.http_status} · 수집경로: ${result.fetched_via === "proxy" ? "프록시(ScraperAPI)" : "직접요청"} · 미흡 항목 ${result.issue_count}개
          </p>
        </div>
        <${StatusBadge} status=${result.overall_status} />
      </div>
      <div class="p-5 grid sm:grid-cols-2 gap-4">
        ${Object.entries(sections).map(([section, checks]) => html`
          <div key=${section} class="border border-navy-100 rounded-lg overflow-hidden">
            <p class="bg-navy-500 text-white text-xs font-semibold px-3 py-1.5">${section}</p>
            <table class="w-full text-xs">
              <tbody>
                ${checks.map((c) => html`
                  <tr key=${c.id} class="border-t border-navy-100 align-top">
                    <td class="px-3 py-2 font-medium text-navy-700 w-24 whitespace-nowrap">${c.label}</td>
                    <td class="px-3 py-2 text-navy-800 break-all">${String(c.value)}</td>
                    <td class="px-3 py-2 w-16"><${StatusBadge} status=${c.status} /></td>
                    <td class="px-3 py-2 text-navy-400 w-40">${c.criteria}</td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        `)}
      </div>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// 단일 URL 검수 탭
// ────────────────────────────────────────────────────────────────

function SingleAuditPanel() {
  const [url, setUrl] = useState("https://www.samsung.com/sec/smartphones/galaxy-z-fold7/");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await auditOne(url.trim());
      setResult(r);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [url]);

  return html`
    <div class="space-y-5">
      <form onSubmit=${submit} class="bg-white border border-navy-200 rounded-xl p-5 flex flex-col sm:flex-row gap-3">
        <input
          class="flex-1 border border-navy-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
          type="text"
          placeholder="https://www.samsung.com/sec/... 또는 https://www.apple.com/kr/..."
          value=${url}
          onInput=${(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          disabled=${loading}
          class="bg-navy-500 hover:bg-navy-600 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2"
        >
          ${loading ? html`<span class="spinner"></span>` : null}
          ${loading ? "검수 중..." : "검수하기"}
        </button>
      </form>

      ${error && html`
        <div class="border border-rose-200 bg-rose-50 text-rose-700 text-sm rounded-xl p-4">
          오류: ${error}
        </div>
      `}

      <${ResultCard} result=${result} />
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// 일괄(Bulk) 검수 탭
// ────────────────────────────────────────────────────────────────

function BulkAuditPanel() {
  const [rawUrls, setRawUrls] = useState("");
  const [template, setTemplate] = useState("https://www.samsung.com/{cc}/smartphones/galaxy-z-fold7/");
  const [countryCodes, setCountryCodes] = useState([]);
  const [concurrency, setConcurrency] = useState(4);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({}); // url -> result | {error}
  const [order, setOrder] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    fetch("/api/countries").then((r) => r.json()).then((d) => setCountryCodes(d.codes || []));
  }, []);

  const generateFromTemplate = () => {
    if (!template.includes("{cc}")) {
      alert("템플릿에 {cc} 자리표시자를 포함해주세요. 예: https://www.samsung.com/{cc}/smartphones/galaxy-z-fold7/");
      return;
    }
    const urls = countryCodes.map((cc) => template.replace("{cc}", cc));
    setRawUrls(urls.join("\n"));
  };

  const parsedUrls = rawUrls
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const uniqueUrls = [...new Set(parsedUrls)];

  const start = async () => {
    if (uniqueUrls.length === 0) return;
    cancelRef.current = false;
    setRunning(true);
    setResults({});
    setOrder(uniqueUrls);
    await runPool(uniqueUrls, auditOne, Math.max(1, Math.min(8, concurrency)), (url, res, err) => {
      if (cancelRef.current) return;
      setResults((prev) => ({
        ...prev,
        [url]: err ? { url, error: err, overall_status: "fail" } : res,
      }));
    });
    setRunning(false);
  };

  const stop = () => {
    cancelRef.current = true;
    setRunning(false);
  };

  const doneCount = order.filter((u) => results[u]).length;
  const summary = order.reduce(
    (acc, u) => {
      const st = results[u]?.overall_status;
      if (st) acc[st] = (acc[st] || 0) + 1;
      return acc;
    },
    {}
  );

  return html`
    <div class="space-y-5">
      <div class="bg-white border border-navy-200 rounded-xl p-5 space-y-4">
        <div>
          <label class="text-xs font-semibold text-navy-600">국가코드 템플릿으로 URL 일괄 생성 (91개국)</label>
          <div class="flex flex-col sm:flex-row gap-2 mt-1.5">
            <input
              class="flex-1 border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
              value=${template}
              onInput=${(e) => setTemplate(e.target.value)}
            />
            <button
              class="border border-navy-300 text-navy-600 hover:bg-navy-50 text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
              onClick=${generateFromTemplate}
            >
              ${countryCodes.length}개국 URL 생성
            </button>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold text-navy-600">검수할 URL 목록 (줄바꿈으로 구분, 직접 붙여넣기 가능)</label>
          <textarea
            class="w-full mt-1.5 border border-navy-200 rounded-lg px-3 py-2 text-xs font-mono h-40 focus:outline-none focus:ring-2 focus:ring-navy-400"
            value=${rawUrls}
            onInput=${(e) => setRawUrls(e.target.value)}
            placeholder="https://www.samsung.com/sec/...&#10;https://www.apple.com/kr/..."
          />
          <p class="text-navy-400 text-xs mt-1">${uniqueUrls.length}개 URL 입력됨</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <label class="text-xs text-navy-600 flex items-center gap-2">
            동시 처리 수
            <input
              type="number" min="1" max="8" value=${concurrency}
              onInput=${(e) => setConcurrency(Number(e.target.value) || 1)}
              class="w-16 border border-navy-200 rounded px-2 py-1 text-xs"
            />
          </label>
          ${!running
            ? html`<button
                onClick=${start}
                disabled=${uniqueUrls.length === 0}
                class="bg-navy-500 hover:bg-navy-600 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2 rounded-lg"
              >일괄 검수 시작 (${uniqueUrls.length}건)</button>`
            : html`<button
                onClick=${stop}
                class="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-6 py-2 rounded-lg"
              >중지</button>`
          }
          ${order.length > 0 && html`
            <button
              onClick=${() => downloadCSV(order.map((u) => results[u]).filter(Boolean), "seo_audit_results.csv")}
              class="border border-navy-300 text-navy-600 hover:bg-navy-50 text-sm font-semibold px-4 py-2 rounded-lg"
            >CSV 내보내기</button>
          `}
        </div>

        ${order.length > 0 && html`
          <div class="space-y-1.5">
            <div class="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
              <div class="h-full bg-navy-500 transition-all" style=${{ width: `${(doneCount / order.length) * 100}%` }}></div>
            </div>
            <p class="text-xs text-navy-500">
              ${doneCount} / ${order.length} 완료
              · 정상 ${summary.pass || 0} · 경고 ${summary.warn || 0} · 실패 ${summary.fail || 0}
            </p>
          </div>
        `}
      </div>

      ${order.length > 0 && html`
        <div class="bg-white border border-navy-200 rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-navy-500 text-white text-xs">
                <th class="px-4 py-2.5 text-left">국가/구분</th>
                <th class="px-4 py-2.5 text-left">URL</th>
                <th class="px-4 py-2.5 text-center">HTTP</th>
                <th class="px-4 py-2.5 text-center">판정</th>
                <th class="px-4 py-2.5 text-center">미흡</th>
                <th class="px-4 py-2.5 text-left">수집경로</th>
                <th class="px-4 py-2.5 text-center"></th>
              </tr>
            </thead>
            <tbody>
              ${order.map((u) => {
                const r = results[u];
                return html`
                  <tr key=${u} class="border-t border-navy-100 hover:bg-navy-50/50">
                    <td class="px-4 py-2 font-medium text-navy-700 whitespace-nowrap">${extractLabel(u)}</td>
                    <td class="px-4 py-2 text-navy-500 max-w-xs truncate">${u}</td>
                    <td class="px-4 py-2 text-center text-navy-600">${r ? (r.http_status ?? "-") : html`<span class="spinner inline-block"></span>`}</td>
                    <td class="px-4 py-2 text-center">${r ? html`<${StatusBadge} status=${r.overall_status} />` : "-"}</td>
                    <td class="px-4 py-2 text-center text-navy-600">${r ? (r.issue_count ?? "-") : "-"}</td>
                    <td class="px-4 py-2 text-navy-400 text-xs">${r ? (r.fetched_via === "proxy" ? "프록시" : r.fetched_via === "direct" ? "직접" : "-") : "-"}</td>
                    <td class="px-4 py-2 text-center">
                      ${r && html`
                        <button
                          class="text-navy-500 hover:text-navy-700 text-xs underline"
                          onClick=${() => setExpanded(expanded === u ? null : u)}
                        >${expanded === u ? "닫기" : "상세"}</button>
                      `}
                    </td>
                  </tr>
                  ${expanded === u && r && html`
                    <tr key=${u + "-detail"}>
                      <td colspan="7" class="p-4 bg-navy-50/40">
                        <${ResultCard} result=${r} />
                      </td>
                    </tr>
                  `}
                `;
              })}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// App root
// ────────────────────────────────────────────────────────────────

function App() {
  const [tab, setTab] = useState("single");
  return html`
    <div>
      <${Header} />
      <${ProxyBanner} />
      <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div class="flex gap-2 border-b border-navy-200">
          ${[
            ["single", "단일 URL 검수"],
            ["bulk", "일괄(Bulk) 검수"],
          ].map(([key, label]) => html`
            <button
              key=${key}
              onClick=${() => setTab(key)}
              class=${classNames(
                "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px",
                tab === key ? "border-navy-500 text-navy-700" : "border-transparent text-navy-400 hover:text-navy-600"
              )}
            >${label}</button>
          `)}
        </div>

        ${tab === "single" ? html`<${SingleAuditPanel} />` : html`<${BulkAuditPanel} />`}

        <${CriteriaLegend} />
      </main>
      <footer class="text-center text-navy-400 text-xs py-8">
        SEO / AEO Audit Dashboard · samsung.com IP 차단 시 ScraperAPI 프록시로 자동 재시도
      </footer>
    </div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
