import React from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
const html = htm.bind(React.createElement);
const { useState, useEffect, useRef, useCallback } = React;

const SVG = {
  meta_title:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h10M7 14h6"/></svg>`,
  meta_desc:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  h1:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h1v12M4 12h8M13 6h1v12M19 6v12"/></svg>`,
  h2:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h1v12M4 12h7M12 6h1v12M17 11c0-1.1.9-2 2-2s2 .9 2 2c0 1-1 2-3 4h4"/></svg>`,
  hreflang:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  canonical:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  html_lang:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  og_tags:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  schema:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  robots:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  warn_tri:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  x_circle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  chevron_down:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevron_up:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  globe:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  zap:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  stop:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>`,
  info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  trophy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M6 3h12l-1 7a5 5 0 0 1-10 0z"/><path d="M5 3H3v4a3 3 0 0 0 3 3M19 3h2v4a3 3 0 0 1-3 3"/></svg>`,
  tag:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
};

function Icon({name,size=16}){
  return html`<span style=${{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,flexShrink:0}} dangerouslySetInnerHTML=${{__html:SVG[name]||SVG.info}}/>`;
}

const WHY={
  meta_title_fail:{why:"title 태그가 페이지에 존재하지 않습니다.",impact:"검색 결과에서 페이지 제목이 표시되지 않아 CTR이 크게 낮아집니다."},
  meta_title_warn:{why:"메타 타이틀 길이가 권장 범위(30~60자)를 벗어났습니다.",impact:"너무 짧으면 키워드 전달력 부족, 너무 길면 검색 결과에서 말줄임으로 잘립니다."},
  meta_desc_fail:{why:"meta description 태그가 페이지에 존재하지 않습니다.",impact:"검색 결과 스니펫이 자동 생성되어 원하는 메시지 전달이 불가능해집니다."},
  meta_desc_warn:{why:"메타 디스크립션 길이가 권장 범위(70~160자)를 벗어났습니다.",impact:"너무 짧으면 정보 전달 부족, 너무 길면 검색 결과에서 잘려 표시됩니다."},
  h1_fail:{why:"H1 태그가 페이지에 존재하지 않습니다.",impact:"검색엔진이 페이지의 주요 주제를 파악하기 어려워 SEO 순위에 부정적 영향을 미칩니다."},
  h1_warn:{why:"H1 태그가 2개 이상 존재합니다.",impact:"페이지 주제가 분산된 것으로 인식되어 SEO에 불리합니다."},
  h2_warn:{why:"H2 태그가 존재하지 않습니다.",impact:"콘텐츠 구조가 불명확해 검색엔진이 세부 내용을 파악하기 어렵습니다."},
  hreflang_warn:{why:"hreflang 태그가 없거나 자기참조가 확인되지 않습니다.",impact:"다국가 검색에서 잘못된 언어/국가 페이지가 노출될 수 있습니다."},
  canonical_fail:{why:"canonical 태그가 페이지에 존재하지 않습니다.",impact:"중복 URL이 별개 페이지로 인식되어 PageRank가 분산됩니다."},
  html_lang_fail:{why:"html 태그에 lang 속성이 없습니다.",impact:"검색엔진이 페이지 언어를 정확히 판단하지 못해 엉뚱한 국가 결과에 노출될 수 있습니다."},
  og_tags_warn:{why:"og:title/og:description/og:image/og:url 중 일부가 누락되었습니다.",impact:"SNS 공유 시 미리보기가 제대로 표시되지 않아 유입 트래픽이 감소합니다."},
  og_tags_fail:{why:"Open Graph 태그가 전혀 없습니다.",impact:"SNS 공유 시 미리보기가 생성되지 않아 소셜 채널 유입에 큰 손실이 발생합니다."},
  schema_fail:{why:"Schema.org @id 교차참조 오류 또는 구조화 데이터 누락입니다.",impact:"Rich Snippet 노출 기회를 잃고 AI 검색(AEO) 대응력이 크게 저하됩니다."},
  schema_warn:{why:"@id 미선언 또는 WebPage @id와 canonical 불일치 등 경고 항목이 있습니다.",impact:"구조화 데이터 신뢰도가 낮아져 Rich Snippet 노출 확률이 감소합니다."},
  robots_fail:{why:"meta robots 태그에 noindex가 설정되어 있습니다.",impact:"검색엔진이 이 페이지를 색인하지 않아 검색 결과에 전혀 노출되지 않습니다."},
};

const SL={pass:"정상",warn:"경고",fail:"실패"};
const CIMAP={meta_title:"meta_title",meta_desc:"meta_desc",h1:"h1",h2:"h2",hreflang:"hreflang",canonical:"canonical",html_lang:"html_lang",og_tags:"og_tags",schema:"schema",robots:"robots"};
const ALL_CHECKS=[{id:"meta_title",label:"메타 타이틀"},{id:"meta_desc",label:"메타 디스크립션"},{id:"h1",label:"H1 태그"},{id:"h2",label:"H2 태그"},{id:"hreflang",label:"hreflang"},{id:"canonical",label:"Canonical"},{id:"html_lang",label:"HTML lang"},{id:"og_tags",label:"Open Graph"},{id:"schema",label:"Schema.org"},{id:"robots",label:"Robots / noindex"}];

const GUIDE=[
  {s:"메타 태그",ic:"meta_title",rows:[["메타 타이틀","필수 존재, 권장 30~60자"],["메타 디스크립션","필수 존재, 권장 70~160자"]]},
  {s:"헤딩 구조",ic:"h1",rows:[["H1","정확히 1개 권장 (0개=실패, 2개 이상=경고)"],["H2","1개 이상 권장"]]},
  {s:"Canonical / lang",ic:"canonical",rows:[["Canonical","canonical 태그 필수 존재"],["HTML lang","html 태그에 lang 속성 필수"]]},
  {s:"Open Graph",ic:"og_tags",rows:[["OG 태그","og:title/og:description/og:image/og:url 4종 권장"]]},
  {s:"구조화 데이터",ic:"schema",rows:[["Schema.org","JSON-LD 구조화 데이터 권장"],["@id 보유","주요 엔티티에 @id 선언 필요"],["@id 교차참조","참조 프로퍼티가 선언된 @id를 가리켜야 함"],["WebPage @id ↔ canonical","일치해야 함"]]},
  {s:"크롤링 설정",ic:"robots",rows:[["robots/noindex","noindex 설정 시 검색엔진 미노출 — 즉시 확인 필요"]]},
];

const OC=[["정상 (pass)","미흡 항목 0개"],["경고 (warn)","미흡 항목 1~2개"],["실패 (fail)","페이지 접근 불가 또는 미흡 항목 3개 이상"]];

function extractLabel(url){try{const u=new URL(url);const s=u.pathname.split("/").filter(Boolean)[0];return s||u.hostname;}catch{return url;}}
async function auditOne(url){const r=await fetch("/api/audit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url})});if(!r.ok)throw new Error(`서버 오류 (HTTP ${r.status})`);return r.json();}
async function runPool(items,worker,conc,onEach){let idx=0;async function run(){while(idx<items.length){const i=idx++;try{onEach(items[i],await worker(items[i]),null);}catch(e){onEach(items[i],null,e.message||String(e));}}}await Promise.all(Array.from({length:Math.min(conc,items.length)},run));}
function toCSV(rows){const h=["국가/구분","URL","HTTP상태","종합판정","미흡항목수","미흡항목","수집경로"];const lines=[h.join(",")];for(const r of rows){const cells=[extractLabel(r.url),r.url,r.http_status??"",r.overall_status??"",r.issue_count??"",(r.issues||[]).join(" | "),r.fetched_via??""].map(c=>`"${String(c).replace(/"/g,'""')}"`);lines.push(cells.join(","));}return lines.join("\n");}
function downloadCSV(rows,fn){const csv="﻿"+toCSV(rows);const b=new Blob([csv],{type:"text/csv;charset=utf-8;"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=fn;a.click();URL.revokeObjectURL(a.href);}
function worstStatus(cs){const v=cs.filter(Boolean);if(v.some(c=>c.status==="fail"))return "fail";if(v.some(c=>c.status==="warn"))return "warn";if(!v.length)return null;return "pass";}

function Badge({status}){if(!status)return null;return html`<span class=${`badge badge-${status}`}><span class=${`badge-dot badge-dot-${status}`}></span>${SL[status]||status}</span>`;}

function WhyBox({checkId,status}){
  if(status!=="warn"&&status!=="fail")return null;
  const d=WHY[`${checkId}_${status}`];if(!d)return null;
  const f=status==="fail";
  return html`<div style=${{marginTop:10,padding:"11px 13px",background:f?"var(--red-bg)":"var(--amber-bg)",borderRadius:9,borderLeft:`3px solid ${f?"var(--red)":"var(--amber)"}`}}>
    <div style=${{fontSize:10,fontWeight:700,color:f?"var(--red-text)":"var(--amber-text)",marginBottom:3}}>원인</div>
    <p style=${{fontSize:12,lineHeight:1.6,margin:"0 0 8px"}}>${d.why}</p>
    <div style=${{fontSize:10,fontWeight:700,color:f?"var(--red-text)":"var(--amber-text)",marginBottom:3}}>영향</div>
    <p style=${{fontSize:12,lineHeight:1.6,margin:0}}>${d.impact}</p>
  </div>`;
}

function SecHeader({name,status}){return html`<div style=${{padding:"10px 16px",borderBottom:"0.5px solid var(--separator)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(20,40,160,0.03)"}}>
  <div style=${{display:"flex",alignItems:"center",gap:8}}>
    <div style=${{width:5,height:5,borderRadius:2,background:"var(--navy)",flexShrink:0}}></div>
    <span style=${{fontSize:11,fontWeight:700,color:"var(--navy)",letterSpacing:"0.05em"}}>${name.toUpperCase()}</span>
  </div>
  <${Badge} status=${status}/>
</div>`;}

function Header({tab,setTab}){return html`<header style=${{background:"linear-gradient(135deg,#1428A0 0%,#2B3FBB 100%)",color:"#fff",flexShrink:0}}>
  <div style=${{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <div style=${{display:"flex",alignItems:"center",gap:12}}>
      <div style=${{width:38,height:38,borderRadius:11,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><${Icon} name="zap" size=${20}/></div>
      <div>
        <div style=${{fontSize:10,letterSpacing:"0.1em",opacity:0.6,fontWeight:500}}>SEO / AEO AUDIT</div>
        <div style=${{fontSize:17,fontWeight:700,letterSpacing:"-0.02em"}}>검수 대시보드</div>
      </div>
    </div>
    <div class="segment-control" style=${{background:"rgba(255,255,255,0.15)"}}>
      ${[["single","단일 URL"],["bulk","일괄 검수"]].map(([k,l])=>html`<button key=${k} class=${`segment-btn${tab===k?" active":""}`} style=${{color:tab===k?"var(--navy)":"rgba(255,255,255,0.8)"}} onClick=${()=>setTab(k)}>${l}</button>`)}
    </div>
  </div>
</header>`;}

function ProxyBanner(){const[h,sH]=useState(null);useEffect(()=>{fetch("/api/health").then(r=>r.json()).then(sH).catch(()=>sH({proxy_configured:false}));},[]);if(!h||h.proxy_configured)return null;return html`<div style=${{background:"#FFFBEB",borderBottom:"0.5px solid #FDE68A",padding:"8px 20px",fontSize:12,color:"#92400E",flexShrink:0,display:"flex",alignItems:"center",gap:7}}><${Icon} name="warn_tri" size=${13}/>SCRAPERAPI_KEY 미설정 — samsung.com IP 차단 시 자동 우회가 되지 않을 수 있습니다.</div>`;}

function OverallBanner({result}){
  if(!result)return null;
  const st=result.overall_status;
  const cfg={pass:{bg:"var(--green-bg)",border:"var(--green)",text:"var(--green-text)",icon:"check"},warn:{bg:"var(--amber-bg)",border:"var(--amber)",text:"var(--amber-text)",icon:"warn_tri"},fail:{bg:"var(--red-bg)",border:"var(--red)",text:"var(--red-text)",icon:"x_circle"}}[st]||{bg:"var(--red-bg)",border:"var(--red)",text:"var(--red-text)",icon:"x_circle"};
  return html`<div style=${{margin:"12px",borderRadius:12,background:cfg.bg,borderLeft:`4px solid ${cfg.border}`,padding:"13px 14px"}}>
    <div style=${{fontSize:10,fontWeight:700,color:cfg.text,letterSpacing:"0.07em",marginBottom:6}}>종합판정</div>
    <div style=${{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
      <span style=${{color:cfg.text}}><${Icon} name=${cfg.icon} size=${20}/></span>
      <span style=${{fontSize:18,fontWeight:700,color:cfg.text}}>${SL[st]||st}</span>
      <span style=${{fontSize:12,color:"var(--text-tertiary)",marginLeft:"auto"}}>미흡 ${result.issue_count}건</span>
    </div>
    ${result.issues&&result.issues.length>0?html`<div style=${{display:"flex",flexWrap:"wrap",gap:4}}>${result.issues.map((x,i)=>html`<span key=${i} style=${{background:"rgba(255,255,255,0.65)",color:cfg.text,border:`1px solid ${cfg.border}`,borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:600}}>${x}</span>`)}</div>`:html`<div style=${{fontSize:11,color:"var(--green-text)",display:"flex",alignItems:"center",gap:4}}><${Icon} name="check" size=${12}/>모든 항목 정상</div>`}
  </div>`;
}

function ItemList({result}){
  if(!result||!result.checks)return null;
  const cm={};for(const c of result.checks)cm[c.id]=c;
  return html`<div style=${{padding:"4px 0"}}>
    <div style=${{padding:"6px 16px 4px",fontSize:10,fontWeight:700,color:"var(--text-tertiary)",letterSpacing:"0.06em"}}>항목별 결과</div>
    ${ALL_CHECKS.map(({id,label})=>{const c=cm[id];if(!c)return null;return html`<div key=${id} style=${{display:"flex",alignItems:"center",gap:10,padding:"7px 16px",borderTop:"0.5px solid var(--separator)"}}>
      <div class=${`check-icon check-icon-${c.status}`} style=${{width:26,height:26,borderRadius:7}}><${Icon} name=${CIMAP[id]||"info"} size=${14}/></div>
      <span style=${{flex:1,fontSize:12,color:"var(--text-primary)"}}>${label}</span>
      <${Badge} status=${c.status}/>
    </div>`;})}
  </div>`;
}

function CriteriaLegend(){
  const[open,sO]=useState(false);
  return html`<div style=${{borderTop:"0.5px solid var(--separator)",marginTop:"auto"}}>
    <button style=${{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,color:"var(--text-secondary)"}} onClick=${()=>sO(!open)}>
      <div style=${{display:"flex",alignItems:"center",gap:8}}><${Icon} name="info" size=${15}/>검수 기준 가이드</div>
      <${Icon} name=${open?"chevron_up":"chevron_down"} size=${16}/>
    </button>
    ${open&&html`<div style=${{padding:"0 12px 12px",display:"flex",flexDirection:"column",gap:8}}>
      ${GUIDE.map(g=>html`<div key=${g.s} style=${{background:"var(--bg)",borderRadius:10,padding:"10px 12px"}}>
        <div style=${{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
          <div style=${{width:24,height:24,borderRadius:7,background:"var(--navy-dim)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--navy)"}}><${Icon} name=${g.ic} size=${13}/></div>
          <span style=${{fontSize:12,fontWeight:600,color:"var(--navy)"}}>${g.s}</span>
        </div>
        <ul style=${{listStyle:"none",display:"flex",flexDirection:"column",gap:4}}>${g.rows.map(([lb,cr])=>html`<li key=${lb} style=${{fontSize:11,color:"var(--text-secondary)",lineHeight:1.5}}><span style=${{fontWeight:600,color:"var(--text-primary)"}}>${lb}</span><span style=${{color:"var(--text-tertiary)"}}> — </span>${cr}</li>`)}</ul>
      </div>`)}
      <div style=${{borderTop:"1.5px dashed var(--separator)",paddingTop:10}}>
        <div style=${{background:"linear-gradient(135deg,#1428A0 0%,#2B3FBB 100%)",borderRadius:12,padding:"14px 16px"}}>
          <div style=${{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style=${{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><${Icon} name="trophy" size=${16}/></div>
            <span style=${{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.7)"}}>종합판정 — 모든 항목을 반영한 최종 결과</span>
          </div>
          <div style=${{display:"flex",flexDirection:"column",gap:5}}>${OC.map(([lb,ds])=>html`<div key=${lb} style=${{background:"rgba(255,255,255,0.1)",borderRadius:8,padding:"7px 10px"}}><span style=${{fontSize:12,fontWeight:700,color:"#fff"}}>${lb}</span><span style=${{fontSize:11,color:"rgba(255,255,255,0.6)"}}> — ${ds}</span></div>`)}</div>
        </div>
      </div>
    </div>`}
  </div>`;
}

function EmptyState(){return html`<div style=${{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",minHeight:300,gap:12,color:"var(--text-tertiary)"}}>
  <${Icon} name="search" size=${40}/>
  <div style=${{textAlign:"center"}}><div style=${{fontSize:14,fontWeight:600,color:"var(--text-secondary)",marginBottom:4}}>검수 결과가 여기에 표시됩니다</div><div style=${{fontSize:12}}>왼쪽 입력창에 URL을 입력하고 검수하기를 눌러주세요</div></div>
</div>`;}

function MetaSection({tc,dc}){
  if(!tc&&!dc)return null;
  const st=worstStatus([tc,dc]);
  const Row=({c,cid,label})=>html`<div>
    <div style=${{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
      <div style=${{display:"flex",alignItems:"center",gap:7}}><div class=${`check-icon check-icon-${c.status}`}><${Icon} name=${cid} size=${15}/></div><span style=${{fontSize:13,fontWeight:600}}>${label}</span></div>
      <${Badge} status=${c.status}/>
    </div>
    <div style=${{background:"var(--bg)",borderRadius:10,padding:"11px 13px",fontSize:13,lineHeight:1.6,fontStyle:c.value==="(없음)"?"italic":"normal",color:c.value==="(없음)"?"var(--text-tertiary)":"var(--text-primary)"}}>${c.value}</div>
    <div style=${{marginTop:5,fontSize:11,color:"var(--text-tertiary)"}}>${c.detail} · ${c.criteria}</div>
    <${WhyBox} checkId=${cid} status=${c.status}/>
  </div>`;
  return html`<div class="card fade-in" style=${{marginBottom:12}}>
    <${SecHeader} name="메타 태그" status=${st}/>
    <div style=${{padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>
      ${tc&&html`<${Row} c=${tc} cid="meta_title" label="메타 타이틀"/>`}
      ${dc&&html`<div style=${{borderTop:"0.5px solid var(--separator)",paddingTop:14}}><${Row} c=${dc} cid="meta_desc" label="메타 디스크립션"/></div>`}
    </div>
  </div>`;
}

function HeadingSection({h1,h2}){
  if(!h1&&!h2)return null;
  const st=worstStatus([h1,h2]);
  const Texts=({texts,empty})=>{
    if(!texts||!texts.length)return html`<div style=${{fontSize:12,color:"var(--text-tertiary)",fontStyle:"italic"}}>${empty}</div>`;
    return texts.map((t,i)=>html`<div key=${i} style=${{display:"flex",gap:8,padding:"5px 0",borderTop:i>0?"0.5px solid var(--separator)":"none"}}><span style=${{fontSize:10,color:"var(--text-tertiary)",marginTop:3}}>•</span><span style=${{fontSize:12,lineHeight:1.5}}>${t}</span></div>`);
  };
  return html`<div class="card fade-in" style=${{marginBottom:12}}>
    <${SecHeader} name="헤딩 구조" status=${st}/>
    <div style=${{padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>
      ${h1&&html`<div>
        <div style=${{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style=${{display:"flex",alignItems:"center",gap:7}}><div class=${`check-icon check-icon-${h1.status}`}><${Icon} name="h1" size=${15}/></div><span style=${{fontSize:13,fontWeight:600}}>H1 태그</span><span style=${{fontSize:11,color:"var(--text-tertiary)"}}>${h1.detail}</span></div>
          <${Badge} status=${h1.status}/>
        </div>
        <div style=${{background:"var(--bg)",borderRadius:10,padding:"10px 13px"}}><${Texts} texts=${h1.extra_data?.texts||[]} empty="(없음)"/></div>
        <${WhyBox} checkId="h1" status=${h1.status}/>
      </div>`}
      ${h2&&html`<div style=${{borderTop:"0.5px solid var(--separator)",paddingTop:14}}>
        <div style=${{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style=${{display:"flex",alignItems:"center",gap:7}}><div class=${`check-icon check-icon-${h2.status}`}><${Icon} name="h2" size=${15}/></div><span style=${{fontSize:13,fontWeight:600}}>H2 태그</span><span style=${{fontSize:11,color:"var(--text-tertiary)"}}>${h2.detail}</span></div>
          <${Badge} status=${h2.status}/>
        </div>
        <div style=${{background:"var(--bg)",borderRadius:10,padding:"10px 13px",maxHeight:200,overflowY:"auto"}}><${Texts} texts=${h2.extra_data?.texts||[]} empty="(없음)"/></div>
        <${WhyBox} checkId="h2" status=${h2.status}/>
      </div>`}
    </div>
  </div>`;
}

function OGSection({c}){
  if(!c)return null;
  const vals=c.extra_data?.values||{};
  const fields=[["og:title","제목"],["og:description","설명"],["og:image","이미지 URL"],["og:url","페이지 URL"]];
  return html`<div class="card fade-in" style=${{marginBottom:12}}>
    <${SecHeader} name="Open Graph" status=${c.status}/>
    <div style=${{padding:"14px 16px"}}>
      <div style=${{display:"flex",flexDirection:"column",gap:10}}>
        ${fields.map(([k,lb])=>html`<div key=${k} style=${{background:"var(--bg)",borderRadius:10,padding:"10px 13px"}}>
          <div style=${{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <span style=${{fontSize:11,fontWeight:700,color:"var(--navy)"}}>${lb}</span>
            <span style=${{fontSize:10,color:"var(--text-tertiary)",fontFamily:"monospace"}}>${k}</span>
          </div>
          <div style=${{fontSize:12,lineHeight:1.6,wordBreak:"break-all",color:vals[k]?"var(--text-primary)":"var(--text-tertiary)",fontStyle:vals[k]?"normal":"italic"}}>${vals[k]||"미선언"}</div>
        </div>`)}
      </div>
      <${WhyBox} checkId="og_tags" status=${c.status}/>
    </div>
  </div>`;
}

function FailedBlock({block,index}){
  const[open,sO]=useState(false);
  return html`<div style=${{background:"var(--red-bg)",borderRadius:9,marginBottom:6,overflow:"hidden"}}>
    <button style=${{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}} onClick=${()=>sO(!open)}>
      <div style=${{display:"flex",alignItems:"center",gap:8}}>
        <span style=${{width:6,height:6,borderRadius:"50%",background:"var(--red)",flexShrink:0}}></span>
        <span style=${{fontSize:12,fontWeight:600,color:"var(--red-text)"}}>파싱 실패 블록 ${index+1}</span>
        <span style=${{fontSize:11,color:"var(--red-text)",opacity:0.7}}>${block.error}</span>
      </div>
      <${Icon} name=${open?"chevron_up":"chevron_down"} size=${14}/>
    </button>
    ${open&&html`<div style=${{padding:"0 12px 12px"}}>
      <pre style=${{fontSize:11,lineHeight:1.6,color:"var(--text-primary)",background:"rgba(255,255,255,0.7)",borderRadius:7,padding:"10px 12px",overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all",maxHeight:300,overflowY:"auto",margin:0,fontFamily:"monospace"}}>${block.raw}</pre>
    </div>`}
  </div>`;
}

function SchemaSection({c}){
  if(!c)return null;
  const ents=c.extra_data?.entities||[];
  const failed=c.extra_data?.failed_blocks||[];
  const refs=c.schema_extra||[];
  return html`<div class="card fade-in" style=${{marginBottom:12}}>
    <${SecHeader} name="구조화 데이터 (Schema.org)" status=${c.status}/>
    <div style=${{padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>
      <div>
        <div style=${{fontSize:11,fontWeight:700,color:"var(--text-tertiary)",marginBottom:8}}>선언된 스키마 (${ents.length}개)</div>
        ${!ents.length?html`<div style=${{fontSize:12,color:"var(--text-tertiary)",fontStyle:"italic"}}>JSON-LD 없음</div>`:ents.map((e,i)=>html`<div key=${i} style=${{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 12px",background:"var(--bg)",borderRadius:9,marginBottom:5}}>
          <div style=${{width:28,height:28,borderRadius:7,flexShrink:0,background:"var(--navy-dim)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--navy)"}}><${Icon} name="tag" size=${14}/></div>
          <div style=${{flex:1,minWidth:0}}>
            <div style=${{fontSize:13,fontWeight:600}}>${e.type||"(타입없음)"}</div>
            <div style=${{fontSize:11,color:"var(--text-tertiary)",wordBreak:"break-all",marginTop:2}}>
              <span style=${{fontWeight:600}}>@id</span>
              ${e.id?html`<span style=${{color:"var(--navy)",marginLeft:4}}>${e.id}</span>`:html`<span style=${{color:"var(--red-text)",marginLeft:4,fontStyle:"italic"}}>미선언</span>`}
            </div>
          </div>
        </div>`)}
      </div>

      ${failed.length>0&&html`<div style=${{borderTop:"0.5px solid var(--separator)",paddingTop:14}}>
        <div style=${{fontSize:11,fontWeight:700,color:"var(--red-text)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <${Icon} name="x_circle" size=${13}/>파싱 실패 블록 (${failed.length}개) — 클릭하면 원본 코드 확인
        </div>
        ${failed.map((b,i)=>html`<${FailedBlock} key=${i} block=${b} index=${i}/>`)}
      </div>`}

      <div style=${{borderTop:"0.5px solid var(--separator)",paddingTop:14}}>
        <div style=${{fontSize:11,fontWeight:700,color:"var(--text-tertiary)",marginBottom:8}}>@id 교차참조 검증</div>
        ${refs.map((item,i)=>html`<div key=${i} style=${{display:"flex",alignItems:"flex-start",gap:8,padding:"5px 0",borderTop:i>0?"0.5px solid var(--separator)":"none"}}>
          <span style=${{width:6,height:6,borderRadius:"50%",flexShrink:0,marginTop:5,background:item.type==="pass"?"var(--green)":item.type==="warn"?"var(--amber)":"var(--red)"}}></span>
          <span style=${{fontSize:12,lineHeight:1.5,color:item.type==="pass"?"var(--green-text)":item.type==="warn"?"var(--amber-text)":"var(--red-text)"}}>${item.msg}</span>
        </div>`)}
      </div>
      <${WhyBox} checkId="schema" status=${c.status}/>
    </div>
  </div>`;
}

function GenericSection({name,checks}){
  if(!checks||!checks.length)return null;
  const st=worstStatus(checks);
  return html`<div class="card fade-in" style=${{marginBottom:12}}>
    <${SecHeader} name=${name} status=${st}/>
    <div style=${{padding:"10px 0"}}>
      ${checks.map((c,i)=>c&&html`<div key=${c.id} style=${{padding:"10px 16px",borderTop:i>0?"0.5px solid var(--separator)":"none"}}>
        <div style=${{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div class=${`check-icon check-icon-${c.status}`}><${Icon} name=${CIMAP[c.id]||"info"} size=${15}/></div>
          <div style=${{flex:1}}>
            <div style=${{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <span style=${{fontSize:13,fontWeight:600}}>${c.label}</span>
              <${Badge} status=${c.status}/>
            </div>
            <div style=${{fontSize:12,color:"var(--text-secondary)",wordBreak:"break-all",marginTop:2}}>${c.value}</div>
            <div style=${{fontSize:11,color:"var(--text-tertiary)",marginTop:1}}>${c.detail}</div>
          </div>
        </div>
        <${WhyBox} checkId=${c.id} status=${c.status}/>
      </div>`)}
    </div>
  </div>`;
}

function DetailPanel({result}){
  if(!result)return html`<${EmptyState}/>`;
  if(result.error&&!result.checks?.length)return html`<div class="card fade-in" style=${{borderLeft:"4px solid var(--red)",background:"var(--red-bg)",padding:"18px"}}><div style=${{display:"flex",gap:10}}><${Icon} name="x_circle" size=${20}/><div><div style=${{fontWeight:600,marginBottom:4}}>${result.url}</div><div style=${{fontSize:13,color:"var(--red-text)"}}>${result.error}</div></div></div></div>`;
  const cm={};for(const c of(result.checks||[]))cm[c.id]=c;
  return html`<div class="fade-in">
    <${MetaSection} tc=${cm.meta_title} dc=${cm.meta_desc}/>
    <${HeadingSection} h1=${cm.h1} h2=${cm.h2}/>
    <${GenericSection} name="hreflang" checks=${[cm.hreflang].filter(Boolean)}/>
    <${GenericSection} name="Canonical / lang" checks=${[cm.canonical,cm.html_lang].filter(Boolean)}/>
    <${OGSection} c=${cm.og_tags}/>
    <${SchemaSection} c=${cm.schema}/>
    <${GenericSection} name="크롤링 설정" checks=${[cm.robots].filter(Boolean)}/>
  </div>`;
}

function SingleLayout(){
  const[url,sU]=useState("https://www.samsung.com/sec/smartphones/galaxy-z-fold7/");
  const[loading,sL]=useState(false);
  const[result,sR]=useState(null);
  const[error,sE]=useState(null);
  const submit=useCallback(async e=>{e.preventDefault();if(!url.trim())return;sL(true);sE(null);sR(null);try{sR(await auditOne(url.trim()));}catch(err){sE(err.message||String(err));}finally{sL(false);};},[url]);
  return html`<div class="app-body">
    <div class="left-panel">
      <div style=${{padding:"14px 12px 12px"}}>
        <form onSubmit=${submit} style=${{display:"flex",flexDirection:"column",gap:8}}>
          <div style=${{display:"flex",alignItems:"center",gap:8,background:"var(--bg)",borderRadius:11,padding:"0 12px"}}>
            <span style=${{color:"var(--text-tertiary)",flexShrink:0}}><${Icon} name="search" size=${15}/></span>
            <input class="input-field" style=${{background:"transparent",padding:"11px 0",fontSize:13}} type="text" placeholder="https://..." value=${url} onInput=${e=>sU(e.target.value)}/>
          </div>
          <button type="submit" disabled=${loading} class="btn-primary" style=${{justifyContent:"center"}}>
            ${loading?html`<span class="spinner spinner-sm"></span>`:html`<${Icon} name="zap" size=${14}/>`}
            ${loading?"검수 중…":"검수하기"}
          </button>
        </form>
        ${error&&html`<div style=${{marginTop:8,padding:"10px 12px",background:"var(--red-bg)",borderRadius:9,fontSize:12,color:"var(--red-text)"}}>${error}</div>`}
      </div>
      <${OverallBanner} result=${result}/>
      <${ItemList} result=${result}/>
      <${CriteriaLegend}/>
    </div>
    <div class="right-panel"><${DetailPanel} result=${result}/></div>
  </div>`;
}

function BulkRow({url,result,isExp,onToggle}){
  const r=result;
  return html`<div style=${{borderBottom:"0.5px solid var(--separator)"}}>
    <div style=${{display:"grid",gridTemplateColumns:"minmax(60px,90px) 1fr auto auto auto auto",gap:8,alignItems:"center",padding:"11px 16px"}}>
      <span style=${{fontSize:12,fontWeight:600,color:"var(--text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>${extractLabel(url)}</span>
      <span style=${{fontSize:11,color:"var(--text-tertiary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>${url}</span>
      <span style=${{fontSize:12,color:"var(--text-secondary)",whiteSpace:"nowrap"}}>${r?r.http_status??"-":html`<span class="spinner spinner-sm"></span>`}</span>
      <span>${r?html`<${Badge} status=${r.overall_status}/>`:null}</span>
      <span style=${{fontSize:12,color:"var(--text-secondary)"}}>${r?r.issue_count??"-":"-"}</span>
      <button style=${{background:"none",border:"none",cursor:"pointer",color:"var(--navy)",fontSize:12,fontWeight:600,padding:"3px 7px",borderRadius:7,display:r?"block":"none"}} onClick=${()=>r&&onToggle(url)}>${isExp?"닫기":"상세"}</button>
    </div>
    ${isExp&&r?html`<div style=${{padding:"0 12px 14px",background:"var(--bg)"}}><${DetailPanel} result=${r}/></div>`:null}
  </div>`;
}

function BulkLayout(){
  const[raw,sRaw]=useState("");
  const[tmpl,sTmpl]=useState("https://www.samsung.com/{cc}/smartphones/galaxy-z-fold7/");
  const[codes,sCodes]=useState([]);
  const[conc,sConc]=useState(4);
  const[running,sRunning]=useState(false);
  const[results,sResults]=useState({});
  const[order,sOrder]=useState([]);
  const[exp,sExp]=useState(null);
  const cancelRef=useRef(false);
  useEffect(()=>{fetch("/api/countries").then(r=>r.json()).then(d=>sCodes(d.codes||[]));},[]);
  const gen=()=>{if(!tmpl.includes("{cc}")){alert("템플릿에 {cc}를 포함해주세요.");return;}sRaw(codes.map(cc=>tmpl.replace("{cc}",cc)).join("\n"));};
  const urls=[...new Set(raw.split("\n").map(s=>s.trim()).filter(Boolean))];
  const start=async()=>{if(!urls.length)return;cancelRef.current=false;sRunning(true);sResults({});sOrder(urls);await runPool(urls,auditOne,Math.max(1,Math.min(8,conc)),(url,res,err)=>{if(cancelRef.current)return;sResults(p=>({...p,[url]:err?{url,error:err,overall_status:"fail"}:res}));});sRunning(false);};
  const stop=()=>{cancelRef.current=true;sRunning(false);};
  const done=order.filter(u=>results[u]).length;
  const sum=order.reduce((a,u)=>{const st=results[u]?.overall_status;if(st)a[st]=(a[st]||0)+1;return a;},{});
  return html`<div class="bulk-body">
    <div class="card" style=${{padding:16,marginBottom:14,display:"flex",flexDirection:"column",gap:14}}>
      <div>
        <div style=${{fontSize:12,fontWeight:600,color:"var(--text-secondary)",marginBottom:6,display:"flex",alignItems:"center",gap:6}}><${Icon} name="globe" size=${13}/>국가코드 템플릿 URL 생성 (${codes.length}개국)</div>
        <div style=${{display:"flex",gap:8}}><input class="input-field" style=${{flex:1}} value=${tmpl} onInput=${e=>sTmpl(e.target.value)}/><button class="btn-ghost" onClick=${gen} style=${{whiteSpace:"nowrap"}}>URL 생성</button></div>
      </div>
      <div>
        <div style=${{fontSize:12,fontWeight:600,color:"var(--text-secondary)",marginBottom:6}}>검수 URL 목록 (줄바꿈 구분) — ${urls.length}개</div>
        <textarea class="input-field" style=${{height:110,fontFamily:"monospace",fontSize:12,resize:"vertical"}} value=${raw} onInput=${e=>sRaw(e.target.value)} placeholder=${"https://www.samsung.com/sec/...\nhttps://www.apple.com/kr/..."}/>
      </div>
      <div style=${{display:"flex",flexWrap:"wrap",alignItems:"center",gap:10}}>
        <label style=${{fontSize:13,color:"var(--text-secondary)",display:"flex",alignItems:"center",gap:6}}>동시 처리<input type="number" min="1" max="8" value=${conc} onInput=${e=>sConc(Number(e.target.value)||1)} style=${{width:50,border:"1px solid var(--bg-2)",borderRadius:7,padding:"3px 8px",fontFamily:"inherit",fontSize:13}}/></label>
        ${!running?html`<button onClick=${start} disabled=${!urls.length} class="btn-primary"><${Icon} name="zap" size=${14}/>일괄 검수 (${urls.length}건)</button>`:html`<button onClick=${stop} class="btn-danger"><${Icon} name="stop" size=$
