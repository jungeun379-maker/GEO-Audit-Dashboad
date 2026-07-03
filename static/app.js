import React from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";

const html = htm.bind(React.createElement);
const { useState, useEffect, useRef, useCallback } = React;

// ────────────────────────────────────────────────────────────────
// 아이콘 SVG (인라인)
// ────────────────────────────────────────────────────────────────
const ICONS = {
  meta_title: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h10M7 14h6"/></svg>`,
  meta_desc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  h1: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h1v12M4 12h8M13 6h1v12M19 6v12"/></svg>`,
  h2: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h1v12M4 12h7M12 6h1v12M17 11c0-1.1.9-2 2-2s2 .9 2 2c0 1-1 2-3 4h4"/></svg>`,
  hreflang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  canonical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  html_lang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  og_tags: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  schema: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  robots: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  warn_tri: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  x_circle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  chevron_down: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevron_up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

function Icon({ name, size = 16, style = "" }) {
  const svg = ICONS[name] || ICONS.info;
  return html`<span
    style=${{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0, ...(style ? {} : {}) }}
    dangerouslySetInnerHTML=${{ __html: svg }}
  />`;
}

// ────────────────────────────────────────────────────────────────
// 상수 / 유틸
// ────────────────────────────────────────────────────────────────

const STATUS_ICON = { pass: "check", warn: "warn_tri", fail: "x_circle" };
const STATUS_LABEL = { pass: "정상", warn: "경고", fail: "실패" };

const CHECK_ICON_MAP = {
  meta_title: "meta_title", meta_desc: "meta_desc",
  h1: "h1", h2: "h2",
  hreflang: "hreflang",
  canonical: "canonical", html_lang: "html_lang",
  og_tags: "og_tags",
  schema: "schema",
  robots: "robots",
};

const SECTION_MAP = {
  meta_title: "메타 태그", meta_desc: "메타 태그",
  h1: "헤딩 구조", h2: "헤딩 구조",
  hreflang: "hreflang",
  canonical: "Canonical / lang", html_lang: "Canonical / lang",
  og_tags: "Open Graph",
  schema: "구조화 데이터",
  robots: "크롤링 설정",
};

const SECTION_ORDER = ["메타 태그", "헤딩 구조", "hreflang", "Canonical / lang", "Open Graph", "구조화 데이터", "크롤링 설정"];

const CRITERIA_GUIDE = [
  { section: "메타 태그", icon: "meta_title", rows: [
    ["메타 타이틀", "필수 존재, 권장 30~60자"],
    ["메타 디스크립션", "필수 존재, 권장 70~160자"],
  ]},
  { section: "헤딩 구조", icon: "h1", rows: [
    ["H1", "정확히 1개 권장 (0개=실패, 2개 이상=경고)"],
    ["H2", "1개 이상 권장 (콘텐츠 구조화)"],
  ]},
  { section: "hreflang", icon: "hreflang", rows: [
    ["hreflang", "다국가 페이지의 경우 hreflang 태그 및 자기참조(self-referencing) 필요"],
  ]},
  { section: "Canonical / lang", icon: "canonical", rows: [
    ["Canonical", "canonical 태그 필수 존재"],
    ["HTML lang", "html 태그에 lang 속성 필수"],
  ]},
  { section: "Open Graph", icon: "og_tags", rows: [
    ["OG 태그", "og:title / og:description / og:image / og:url 4종 모두 권장"],
  ]},
  { section: "구조화 데이터", icon: "schema", rows: [
    ["Schema.org 선언", "JSON-LD 구조화 데이터 권장 (rich snippet / AEO 대응)"],
    ["@id 보유 여부", "WebPage, Organization 등 주요 엔티티에 @id 선언 필요"],
    ["@id 교차참조", "publisher, author 등 참조 프로퍼티가 페이지 내 선언된 @id를 가리켜야 함"],
    ["WebPage @id ↔ canonical", "WebPage의 @id 값이 canonical URL과 일치해야 함"],
  ]},
  { section: "크롤링 설정", icon: "robots", rows: [
    ["robots/noindex", "noindex 설정 시 검색엔진 미노출 — 의도치 않은 설정 여부 필수 확인"],
  ]},
  { section: "종합 판정", icon: "info", rows: [
    ["정상(pass)", "미흡 항목 0개"],
    ["경고(warn)", "미흡 항목 1~2개"],
    ["실패(fail)", "페이지 접근 불가 또는 미흡 항목 3개 이상"],
  ]},
];

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
      try { onEach(items[i], await worker(items[i]), null); }
      catch (e) { onEach(items[i], null, e.message || String(e)); }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runner));
}

function toCSV(rows) {
  const header = ["국가/구분", "URL", "HTTP상태", "종합판정", "미흡항목수", "미흡항목", "수집경로"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const cells = [
      extractLabel(r.url), r.url, r.http_status ?? "",
      r.overall_status ?? "", r.issue_count ?? "",
      (r.issues || []).join(" | "), r.fetched_via ?? "",
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

function StatusBadge({ status, size = "sm" }) {
  const cls = `badge badge-${status || "fail"}`;
  const dotCls = `badge-dot badge-dot-${status || "fail"}`;
  const label = STATUS_LABEL[status] || status || "-";
  return html`
    <span class=${cls}>
      <span class=${dotCls}></span>
      ${label}
    </span>
  `;
}

function CheckIcon({ status, checkId }) {
  const iconName = CHECK_ICON_MAP[checkId] || "info";
  const cls = `check-icon check-icon-${status}`;
  return html`
    <div class=${cls}>
      <${Icon} name=${iconName} size=${18} />
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// 헤더
// ────────────────────────────────────────────────────────────────

function Header() {
  return html`
    <header style=${{
      background: "linear-gradient(135deg, #1428A0 0%, #2B3FBB 100%)",
      color: "#fff",
      padding: "0",
    }}>
      <div style=${{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 28px" }}>
        <div style=${{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style=${{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <${Icon} name="zap" size=${24} />
          </div>
          <div>
            <div style=${{ fontSize: 11, letterSpacing: "0.1em", opacity: 0.7, fontWeight: 500, marginBottom: 2 }}>
              SEO / AEO AUDIT
            </div>
            <h1 style=${{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              검수 대시보드
            </h1>
          </div>
        </div>
        <p style=${{ marginTop: 12, fontSize: 13, opacity: 0.65, letterSpacing: "-0.01em", lineHeight: 1.5 }}>
          메타태그 · H태그 · hreflang · canonical · OG · Schema @id 교차참조 · robots
        </p>
      </div>
    </header>
  `;
}

// ────────────────────────────────────────────────────────────────
// 프록시 배너
// ────────────────────────────────────────────────────────────────

function ProxyBanner() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then(setHealth)
      .catch(() => setHealth({ proxy_configured: false, error: true }));
  }, []);
  if (!health || health.proxy_configured) return null;
  return html`
    <div style=${{
      background: "#FFFBEB", borderBottom: "0.5px solid #FDE68A",
      padding: "10px 20px", fontSize: 13, color: "#92400E",
    }}>
      <div style=${{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 8 }}>
        <${Icon} name="warn_tri" size=${15} />
        <span>SCRAPERAPI_KEY 미설정 — samsung.com IP 차단 시 자동 우회가 되지 않을 수 있습니다.</span>
      </div>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// 검수 기준 가이드
// ────────────────────────────────────────────────────────────────

function CriteriaLegend() {
  const [open, setOpen] = useState(false);
  return html`
    <div class="card" style=${{ marginTop: 8 }}>
      <button
        style=${{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 18px", background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "var(--text-primary)",
        }}
        onClick=${() => setOpen(!open)}
      >
        <div style=${{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style=${{
            width: 32, height: 32, borderRadius: 9, background: "var(--navy-dim)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy)",
          }}>
            <${Icon} name="info" size=${17} />
          </div>
          <span>검수 기준 가이드</span>
        </div>
        <span style=${{ color: "var(--text-tertiary)" }}>
          <${Icon} name=${open ? "chevron_up" : "chevron_down"} size=${18} />
        </span>
      </button>

      ${open && html`
        <div style=${{ padding: "0 18px 18px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
          ${CRITERIA_GUIDE.map((g) => html`
            <div key=${g.section} style=${{
              background: "var(--bg)", borderRadius: 14, padding: "14px 14px",
            }}>
              <div style=${{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style=${{
                  width: 28, height: 28, borderRadius: 8, background: "var(--navy-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--navy)",
                }}>
                  <${Icon} name=${g.icon} size=${15} />
                </div>
                <span style=${{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>${g.section}</span>
              </div>
              <ul style=${{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                ${g.rows.map(([label, criteria]) => html`
                  <li key=${label} style=${{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    <span style=${{ fontWeight: 600, color: "var(--text-primary)" }}>${label}</span>
                    <span style=${{ color: "var(--text-tertiary)" }}> — </span>${criteria}
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
// 결과 카드
// ────────────────────────────────────────────────────────────────

function SchemaExtra({ extra }) {
  if (!extra || extra.length === 0) return null;
  return html`
    <div style=${{ marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--separator)" }}>
      <div style=${{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 6, letterSpacing: "0.05em" }}>
        @ID 교차참조 상세
      </div>
      ${extra.map((item, i) => html`
        <div key=${i} class="schema-extra-item">
          <span class="schema-extra-dot" style=${{
            background: item.type === "pass" ? "var(--green)" : item.type === "warn" ? "var(--amber)" : "var(--red)"
          }}></span>
          <span style=${{ fontSize: 12, color: item.type === "pass" ? "var(--green-text)" : item.type === "warn" ? "var(--amber-text)" : "var(--red-text)" }}>
            ${item.msg}
          </span>
        </div>
      `)}
    </div>
  `;
}

function CheckRow({ check, isLast }) {
  const [open, setOpen] = useState(false);
  const hasExtra = check.id === "schema" && check.schema_extra && check.schema_extra.length > 0;

  return html`
    <div>
      <div
        class="check-row${!isLast ? " row-divider" : ""}"
        style=${{ cursor: hasExtra ? "pointer" : "default" }}
        onClick=${hasExtra ? () => setOpen(!open) : undefined}
      >
        <${CheckIcon} status=${check.status} checkId=${check.id} />
        <div style=${{ flex: 1, minWidth: 0 }}>
          <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style=${{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>${check.label}</span>
            <div style=${{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              ${hasExtra ? html`<span style=${{ color: "var(--text-tertiary)" }}><${Icon} name=${open ? "chevron_up" : "chevron_down"} size=${14} /></span>` : null}
              <${StatusBadge} status=${check.status} />
            </div>
          </div>
          <div style=${{ marginTop: 3, fontSize: 13, color: "var(--text-secondary)", wordBreak: "break-all" }}>
            ${check.value}
          </div>
          <div style=${{ marginTop: 2, fontSize: 11, color: "var(--text-tertiary)" }}>
            ${check.detail}
          </div>
          ${hasExtra && open ? html`<${SchemaExtra} extra=${check.schema_extra} />` : null}
        </div>
      </div>
    </div>
  `;
}

function ResultCard({ result }) {
  if (!result) return null;
  if (result.error && !result.checks?.length) {
    return html`
      <div class="card fade-in" style=${{ border: "1px solid #FECACA" }}>
        <div style=${{ padding: "18px 18px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style=${{ color: "var(--red)", marginTop: 2 }}><${Icon} name="x_circle" size=${22} /></div>
          <div>
            <div style=${{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>
              ${result.url}
            </div>
            <div style=${{ fontSize: 13, color: "var(--red-text)" }}>${result.error}</div>
            ${result.http_status ? html`<div style=${{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>HTTP ${result.http_status}</div>` : null}
          </div>
        </div>
      </div>
    `;
  }

  // 섹션별 그룹핑
  const sections = {};
  for (const c of result.checks) {
    const s = SECTION_MAP[c.id] || "기타";
    (sections[s] = sections[s] || []).push(c);
  }
  const orderedSections = SECTION_ORDER.filter((s) => sections[s]).map((s) => [s, sections[s]]);

  const issueCount = result.issue_count || 0;

  return html`
    <div class="fade-in" style=${{ display: "flex", flexDirection: "column", gap: 10 }}>
      <!-- 요약 카드 -->
      <div class="card" style=${{ overflow: "visible" }}>
        <div style=${{ padding: "16px 18px 14px" }}>
          <div style=${{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style=${{ minWidth: 0 }}>
              <div style=${{
                fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
                wordBreak: "break-all", lineHeight: 1.4,
              }}>${result.url}</div>
              <div style=${{ marginTop: 4, fontSize: 12, color: "var(--text-tertiary)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span>HTTP ${result.http_status}</span>
                <span>${result.fetched_via === "proxy" ? "🔀 프록시" : "→ 직접요청"}</span>
                <span>미흡 ${issueCount}건</span>
              </div>
            </div>
            <${StatusBadge} status=${result.overall_status} />
          </div>

          ${issueCount > 0 ? html`
            <div style=${{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              ${result.issues.map((iss, i) => html`
                <span key=${i} style=${{
                  background: "var(--red-bg)", color: "var(--red-text)",
                  borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 600,
                }}>${iss}</span>
              `)}
            </div>
          ` : html`
            <div style=${{ marginTop: 10, fontSize: 12, color: "var(--green-text)", display: "flex", alignItems: "center", gap: 5 }}>
              <${Icon} name="check" size=${13} /> 모든 항목 정상
            </div>
          `}
        </div>
      </div>

      <!-- 섹션별 체크 목록 -->
      ${orderedSections.map(([section, checks]) => html`
        <div key=${section} class="card">
          <div style=${{
            padding: "10px 18px 10px",
            borderBottom: "0.5px solid var(--separator)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style=${{
              width: 6, height: 6, borderRadius: 2, background: "var(--navy)", flexShrink: 0,
            }}></div>
            <span style=${{ fontSize: 12, fontWeight: 700, color: "var(--navy)", letterSpacing: "0.04em" }}>
              ${section.toUpperCase()}
            </span>
          </div>
          ${checks.map((c, i) => html`
            <${CheckRow} key=${c.id} check=${c} isLast=${i === checks.length - 1} />
          `)}
        </div>
      `)}
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// 단일 URL 검수
// ────────────────────────────────────────────────────────────────

function SingleAuditPanel() {
  const [url, setUrl] = useState("https://www.samsung.com/sec/smartphones/galaxy-z-fold7/");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = useCallback(async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try { setResult(await auditOne(url.trim())); }
    catch (err) { setError(err.message || String(err)); }
    finally { setLoading(false); }
  }, [url]);

  return html`
    <div style=${{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div class="card">
        <form onSubmit=${submit} style=${{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style=${{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg)", borderRadius: 13, padding: "0 14px" }}>
            <span style=${{ color: "var(--text-tertiary)", flexShrink: 0 }}><${Icon} name="search" size=${16} /></span>
            <input
              class="input-field"
              style=${{ background: "transparent", padding: "13px 0" }}
              type="text"
              placeholder="https://www.samsung.com/sec/..."
              value=${url}
              onInput=${(e) => setUrl(e.target.value)}
            />
          </div>
          <button type="submit" disabled=${loading} class="btn-primary" style=${{ alignSelf: "stretch", justifyContent: "center" }}>
            ${loading ? html`<span class="spinner spinner-sm"></span>` : html`<${Icon} name="zap" size=${15} />`}
            ${loading ? "검수 중…" : "검수하기"}
          </button>
        </form>
      </div>

      ${error && html`
        <div class="card" style=${{ padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start", borderLeft: "3px solid var(--red)" }}>
          <${Icon} name="x_circle" size=${16} />
          <span style=${{ fontSize: 13, color: "var(--red-text)" }}>오류: ${error}</span>
        </div>
      `}

      <${ResultCard} result=${result} />
    </div>
  `;
}

// ────────────────────────────────────────────────────────────────
// 일괄 검수
// ────────────────────────────────────────────────────────────────

function BulkRow({ url, result, isExpanded, onToggle }) {
  const r = result;
  const pending = !r;
  return html`
    <div style=${{ borderBottom: "0.5px solid var(--separator)" }}>
      <div style=${{
        display: "grid",
        gridTemplateColumns: "minmax(60px,90px) 1fr auto auto auto auto",
        gap: 8, alignItems: "center", padding: "12px 16px",
      }}>
        <span style=${{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          ${extractLabel(url)}
        </span>
        <span style=${{ fontSize: 11, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          ${url}
        </span>
        <span style=${{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
          ${r ? r.http_status ?? "-" : html`<span class="spinner spinner-sm"></span>`}
        </span>
        <span>${r ? html`<${StatusBadge} status=${r.overall_status} />` : null}</span>
        <span style=${{ fontSize: 12, color: "var(--text-secondary)", textAlign: "right" }}>
          ${r ? (r.issue_count ?? "-") : "-"}
        </span>
        <button
          style=${{
            background: "none", border: "none", cursor: "pointer", color: "var(--navy)",
            fontSize: 12, fontWeight: 600, padding: "4px 8px", borderRadius: 8,
            display: r ? "block" : "none",
          }}
          onClick=${() => r && onToggle(url)}
        >${isExpanded ? "닫기" : "상세"}</button>
      </div>
      ${isExpanded && r ? html`
        <div style=${{ padding: "0 16px 16px" }}>
          <${ResultCard} result=${r} />
        </div>
      ` : null}
    </div>
  `;
}

function BulkAuditPanel() {
  const [rawUrls, setRawUrls] = useState("");
  const [template, setTemplate] = useState("https://www.samsung.com/{cc}/smartphones/galaxy-z-fold7/");
  const [countryCodes, setCountryCodes] = useState([]);
  const [concurrency, setConcurrency] = useState(4);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({});
  const [order, setOrder] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    fetch("/api/countries").then((r) => r.json()).then((d) => setCountryCodes(d.codes || []));
  }, []);

  const generateFromTemplate = () => {
    if (!template.includes("{cc}")) {
      alert("템플릿에 {cc} 자리표시자를 포함해주세요.");
      return;
    }
    setRawUrls(countryCodes.map((cc) => template.replace("{cc}", cc)).join("\n"));
  };

  const uniqueUrls = [...new Set(rawUrls.split("\n").map((s) => s.trim()).filter(Boolean))];

  const start = async () => {
    if (uniqueUrls.length === 0) return;
    cancelRef.current = false;
    setRunning(true); setResults({}); setOrder(uniqueUrls);
    await runPool(uniqueUrls, auditOne, Math.max(1, Math.min(8, concurrency)), (url, res, err) => {
      if (cancelRef.current) return;
      setResults((prev) => ({ ...prev, [url]: err ? { url, error: err, overall_status: "fail" } : res }));
    });
    setRunning(false);
  };

  const stop = () => { cancelRef.current = true; setRunning(false); };

  const doneCount = order.filter((u) => results[u]).length;
  const summary = order.reduce((acc, u) => {
    const st = results[u]?.overall_status;
    if (st) acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const toggleExpanded = (url) => setExpanded((e) => e === url ? null : url);

  return html`
    <div style=${{ display: "flex", flexDirection: "column", gap: 14 }}>
      <!-- 입력 패널 -->
      <div class="card" style=${{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <!-- 템플릿 -->
        <div>
          <div style=${{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <${Icon} name="globe" size=${13} /> 국가코드 템플릿 URL 생성 (${countryCodes.length}개국)
          </div>
          <div style=${{ display: "flex", gap: 8 }}>
            <input class="input-field" style=${{ flex: 1 }} value=${template} onInput=${(e) => setTemplate(e.target.value)} />
            <button class="btn-ghost" onClick=${generateFromTemplate} style=${{ whiteSpace: "nowrap" }}>
              URL 생성
            </button>
          </div>
        </div>

        <!-- URL 목록 -->
        <div>
          <div style=${{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            검수 URL 목록 (줄바꿈으로 구분) — ${uniqueUrls.length}개
          </div>
          <textarea
            class="input-field"
            style=${{ height: 120, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
            value=${rawUrls}
            onInput=${(e) => setRawUrls(e.target.value)}
            placeholder=${"https://www.samsung.com/sec/...\nhttps://www.apple.com/kr/..."}
          />
        </div>

        <!-- 컨트롤 -->
        <div style=${{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <label style=${{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
            동시 처리
            <input
              type="number" min="1" max="8" value=${concurrency}
              onInput=${(e) => setConcurrency(Number(e.target.value) || 1)}
              style=${{ width: 52, border: "1px solid var(--bg-2)", borderRadius: 8, padding: "4px 8px", fontFamily: "inherit", fontSize: 13 }}
            />
          </label>
          ${!running
            ? html`<button onClick=${start} disabled=${uniqueUrls.length === 0} class="btn-primary">
                <${Icon} name="zap" size=${15} /> 일괄 검수 (${uniqueUrls.length}건)
              </button>`
            : html`<button onClick=${stop} class="btn-danger">
                <${Icon} name="stop" size=${15} /> 중지
              </button>`
          }
          ${order.length > 0 && html`
            <button class="btn-ghost" onClick=${() => downloadCSV(order.map((u) => results[u]).filter(Boolean), "seo_audit.csv")}>
              <${Icon} name="download" size=${14} /> CSV
            </button>
          `}
        </div>

        <!-- 진행률 -->
        ${order.length > 0 && html`
          <div>
            <div class="progress-track">
              <div class="progress-fill" style=${{ width: `${(doneCount / order.length) * 100}%` }}></div>
            </div>
            <div style=${{ marginTop: 6, fontSize: 12, color: "var(--text-secondary)", display: "flex", gap: 12 }}>
              <span>${doneCount} / ${order.length} 완료</span>
              <span style=${{ color: "var(--green-text)" }}>정상 ${summary.pass || 0}</span>
              <span style=${{ color: "var(--amber-text)" }}>경고 ${summary.warn || 0}</span>
              <span style=${{ color: "var(--red-text)" }}>실패 ${summary.fail || 0}</span>
            </div>
          </div>
        `}
      </div>

      <!-- 결과 목록 -->
      ${order.length > 0 && html`
        <div class="card" style=${{ overflow: "hidden" }}>
          <div style=${{
            display: "grid",
            gridTemplateColumns: "minmax(60px,90px) 1fr auto auto auto auto",
            gap: 8, padding: "10px 16px",
            borderBottom: "0.5px solid var(--separator)",
          }}>
            ${["국가", "URL", "HTTP", "판정", "미흡", ""].map((h, i) => html`
              <span key=${i} style=${{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>${h}</span>
            `)}
          </div>
          ${order.map((u) => html`
            <${BulkRow}
              key=${u}
              url=${u}
              result=${results[u]}
              isExpanded=${expanded === u}
              onToggle=${toggleExpanded}
            />
          `)}
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
    <div style=${{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <${Header} />
      <${ProxyBanner} />

      <main style=${{ maxWidth: 760, width: "100%", margin: "0 auto", padding: "20px 16px 60px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <!-- 탭 세그먼트 컨트롤 -->
        <div style=${{ display: "flex", justifyContent: "center" }}>
          <div class="segment-control">
            ${[["single", "단일 URL"], ["bulk", "일괄 검수"]].map(([key, label]) => html`
              <button
                key=${key}
                class=${`segment-btn${tab === key ? " active" : ""}`}
                onClick=${() => setTab(key)}
              >${label}</button>
            `)}
          </div>
        </div>

        ${tab === "single" ? html`<${SingleAuditPanel} />` : html`<${BulkAuditPanel} />`}

        <${CriteriaLegend} />
      </main>

      <footer style=${{
        textAlign: "center", fontSize: 12, color: "var(--text-tertiary)",
        padding: "20px 16px", borderTop: "0.5px solid var(--separator)",
      }}>
        SEO / AEO Audit Dashboard · Samsung.com IP 차단 시 ScraperAPI 프록시로 자동 재시도
      </footer>
    </div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
