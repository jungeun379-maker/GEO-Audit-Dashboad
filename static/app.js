import React from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
import { SVG,WHY,SL,CIMAP,ALL_CHECKS,GUIDE,OC,INTRO_ITEMS } from "./app-data.js";
const html = htm.bind(React.createElement);
const { useState, useEffect, useRef, useCallback } = React;

function Icon({name,size=16}){
  return html`<span style=${{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,flexShrink:0}} dangerouslySetInnerHTML=${{__html:SVG[name]||SVG.info}}/>`;
}

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

function IntroPanel(){
  return html`<div class="fade-in" style=${{padding:"4px 0 20px"}}>
    <div style=${{background:"linear-gradient(135deg,#1428A0 0%,#2B3FBB 100%)",borderRadius:16,padding:"28px 28px 24px",marginBottom:20,color:"#fff"}}>
      <div style=${{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <div style=${{width:44,height:44,borderRadius:13,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}><${Icon} name="zap" size=${22}/></div>
        <div>
          <div style=${{fontSize:10,letterSpacing:"0.12em",opacity:0.65,fontWeight:500,marginBottom:2}}>SAMSUNG SEO · AEO</div>
          <div style=${{fontSize:20,fontWeight:700,letterSpacing:"-0.02em"}}>페이지 품질 검수 도구</div>
        </div>
      </div>
      <p style=${{fontSize:13,lineHeight:1.75,color:"rgba(255,255,255,0.82)",margin:0}}>삼성닷컴 제품 페이지의 <strong style=${{color:"#fff"}}>검색엔진 최적화(SEO)</strong>와 <strong style=${{color:"#fff"}}>AI 검색 대응(AEO)</strong> 현황을 자동 분석합니다. URL을 입력하면 10개 항목을 일괄 점검하고 개선 방향을 제시합니다.</p>
      <div style=${{marginTop:16,display:"flex",gap:8,flexWrap:"wrap"}}>
        ${[["10개 항목 자동 점검","check"],["오류 원인 및 영향 분석","info"],["JSON-LD 파싱 오류 감지","tool"],["다국가 일괄 검수 지원","globe"]].map(([t,ic])=>html`
          <div key=${t} style=${{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.12)",borderRadius:99,padding:"5px 12px"}}>
            <${Icon} name=${ic} size=${12}/><span style=${{fontSize:11,fontWeight:600}}>${t}</span>
          </div>
        `)}
      </div>
    </div>
    <div style=${{marginBottom:10,fontSize:11,fontWeight:700,color:"var(--text-tertiary)",letterSpacing:"0.06em",padding:"0 2px"}}>검수 항목 안내</div>
    <div style=${{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      ${INTRO_ITEMS.map(item=>html`
        <div key=${item.id} class="card" style=${{padding:"14px 14px 12px"}}>
          <div style=${{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style=${{width:28,height:28,borderRadius:8,background:"var(--navy-dim)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--navy)",flexShrink:0}}>
              <${Icon} name=${CIMAP[item.id]||"info"} size=${14}/>
            </div>
            <div>
              <div style=${{fontSize:12,fontWeight:700,color:"var(--navy)"}}>${item.label}</div>
              <div style=${{fontSize:10,color:"var(--text-tertiary)"}}>${item.criteria}</div>
            </div>
          </div>
          <p style=${{fontSize:11,lineHeight:1.65,color:"var(--text-secondary)",margin:0}}>${item.desc}</p>
        </div>
      `)}
    </div>
  </div>`;
}

function ParseFailurePanel({blocks}){
  if(!blocks||!blocks.length)return null;
  const[openIdx,sOpen]=useState(null);
  return html`<div style=${{margin:"0 12px 8px",borderRadius:12,overflow:"hidden",border:"1.5px solid var(--red)",background:"var(--red-bg)"}}>
    <div style=${{padding:"10px 13px 8px",borderBottom:"1px solid rgba(255,59,48,0.15)"}}>
      <div style=${{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
        <${Icon} name="x_circle" size=${15}/>
        <span style=${{fontSize:12,fontWeight:700,color:"var(--red-text)"}}>JSON-LD 파싱 오류 (${blocks.length}건)</span>
      </div>
      <p style=${{fontSize:11,color:"var(--red-text)",opacity:0.8,margin:0,lineHeight:1.5}}>구조화 데이터 코드에 문법 오류가 있습니다. 담당자 확인 후 즉시 수정이 필요합니다.</p>
    </div>
    ${blocks.map((b,i)=>html`
      <div key=${i} style=${{borderTop:i>0?"1px solid rgba(255,59,48,0.12)":"none"}}>
        <button style=${{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 13px",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}} onClick=${()=>sOpen(openIdx===i?null:i)}>
          <div style=${{flex:1,minWidth:0}}>
            <div style=${{fontSize:11,fontWeight:700,color:"var(--red-text)",marginBottom:2}}>블록 ${i+1} — ${b.error_type}</div>
            ${b.location&&html`<div style=${{fontSize:10,color:"var(--red-text)",opacity:0.7}}>${b.location}</div>`}
          </div>
          <${Icon} name=${openIdx===i?"chevron_up":"chevron_down"} size=${14}/>
        </button>
        ${openIdx===i&&html`<div style=${{padding:"0 13px 12px",display:"flex",flexDirection:"column",gap:10}}>
          <div style=${{fontSize:11,lineHeight:1.6,color:"var(--red-text)",background:"rgba(255,59,48,0.06)",borderRadius:7,padding:"8px 10px"}}>${b.fix_desc}</div>
          ${(b.fix_before||b.fix_after)&&html`<div>
            <div style=${{fontSize:10,fontWeight:700,color:"var(--text-tertiary)",marginBottom:5,letterSpacing:"0.05em"}}>수정 전 → 수정 후</div>
            ${b.fix_before&&html`<div style=${{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4}}>
              <span style=${{fontSize:10,fontWeight:700,color:"var(--red-text)",flexShrink:0,marginTop:1}}>전</span>
              <code style=${{fontSize:10,lineHeight:1.6,color:"var(--red-text)",background:"rgba(255,59,48,0.08)",borderRadius:5,padding:"3px 7px",wordBreak:"break-all",flex:1}}>${b.fix_before}</code>
            </div>`}
            ${b.fix_after&&html`<div style=${{display:"flex",alignItems:"flex-start",gap:6}}>
              <span style=${{fontSize:10,fontWeight:700,color:"var(--green-text)",flexShrink:0,marginTop:1}}>후</span>
              <code style=${{fontSize:10,lineHeight:1.6,color:"var(--green-text)",background:"rgba(52,199,89,0.08)",borderRadius:5,padding:"3px 7px",wordBreak:"break-all",flex:1}}>${b.fix_after}</code>
            </div>`}
          </div>`}
          ${b.context&&html`<div>
            <div style=${{fontSize:10,fontWeight:700,color:"var(--text-tertiary)",marginBottom:5,letterSpacing:"0.05em"}}>오류 위치 (▶ 표시 줄)</div>
            <pre style=${{fontSize:10,lineHeight:1.6,color:"var(--text-primary)",background:"rgba(255,255,255,0.7)",borderRadius:7,padding:"8px 10px",overflowX:"auto",whiteSpace:"pre-wrap",wordBreak:"break-all",maxHeight:160,overflowY:"auto",margin:0,fontFamily:"monospace"}}>${b.context}</pre>
          </div>`}
        </div>`}
      </div>
    `)}
  </div>`;
}

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
      ${failed.length>0&&html`<div style=${{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"var(--red-bg)",borderRadius:9}}>
        <${Icon} name="x_circle" size=${14}/>
        <span style=${{fontSize:12,color:"var(--red-text)",fontWeight:600}}>파싱 실패 ${failed.length}건 — 좌측 패널에서 수정 방법 확인</span>
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
  if(!result)return html`<${IntroPanel}/>`;
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

function getFailedBlocks(result){
  if(!result||!result.checks)return [];
  const sc=result.checks.find(c=>c.id==="schema");
  return sc?.extra_data?.failed_blocks||[];
}

function SingleLayout(){
  const[url,sU]=useState("https://www.samsung.com/sg/smartphones/galaxy-s26-ultra/");
  const[loading,sL]=useState(false);
  const[result,sR]=useState(null);
  const[error,sE]=useState(null);
  const submit=useCallback(async e=>{e.preventDefault();if(!url.trim())return;sL(true);sE(null);sR(null);try{sR(await auditOne(url.trim()));}catch(err){sE(err.message||String(err));}finally{sL(false);};},[url]);
  const failed=getFailedBlocks(result);
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
      <${ParseFailurePanel} blocks=${failed}/>
      <${OverallBanner} result=${result}/>
      <${ItemList} result=${result}/>
      <${CriteriaLegend}/>
    </div>
    <div class="right-panel"><${DetailPanel} result=${result}/></div>
  </div>`;
}

function BulkRow({url,result,isExp,onToggle}){
  const r=result;
  const failed=r?(r.checks?.find(c=>c.id==="schema")?.extra_data?.failed_blocks||[]):[];
  return html`<div style=${{borderBottom:"0.5px solid var(--separator)"}}>
    <div style=${{display:"grid",gridTemplateColumns:"minmax(60px,90px) 1fr auto auto auto auto",gap:8,alignItems:"center",padding:"11px 16px"}}>
      <span style=${{fontSize:12,fontWeight:600,color:"var(--text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>${extractLabel(url)}</span>
      <span style=${{fontSize:11,color:"var(--text-tertiary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>${url}</span>
      <span style=${{fontSize:12,color:"var(--text-secondary)",whiteSpace:"nowrap"}}>${r?r.http_status??"-":html`<span class="spinner spinner-sm"></span>`}</span>
      <span>${r?html`<${Badge} status=${r.overall_status}/>`:null}</span>
      <span style=${{fontSize:12,color:"var(--text-secondary)"}}>${r?r.issue_count??"-":"-"}</span>
      <button style=${{background:"none",border:"none",cursor:"pointer",color:"var(--navy)",fontSize:12,fontWeight:600,padding:"3px 7px",borderRadius:7,display:r?"block":"none"}} onClick=${()=>r&&onToggle(url)}>${isExp?"닫기":"상세"}</button>
    </div>
    ${isExp&&r?html`<div style=${{padding:"0 12px 14px",background:"var(--bg)"}}>
      <${ParseFailurePanel} blocks=${failed}/>
      <${DetailPanel} result=${r}/>
    </div>`:null}
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
        ${!running?html`<button onClick=${start} disabled=${!urls.length} class="btn-primary"><${Icon} name="zap" size=${14}/>일괄 검수 (${urls.length}건)</button>`:html`<button onClick=${stop} class="btn-danger"><${Icon} name="stop" size=${14}/>중지</button>`}
        ${order.length>0&&html`<button class="btn-ghost" onClick=${()=>downloadCSV(order.map(u=>results[u]).filter(Boolean),"seo_audit.csv")}><${Icon} name="download" size=${13}/>CSV</button>`}
      </div>
      ${order.length>0&&html`<div>
        <div class="progress-track"><div class="progress-fill" style=${{width:`${(done/order.length)*100}%`}}></div></div>
        <div style=${{marginTop:6,fontSize:12,color:"var(--text-secondary)",display:"flex",gap:12}}>
          <span>${done} / ${order.length} 완료</span>
          <span style=${{color:"var(--green-text)"}}>정상 ${sum.pass||0}</span>
          <span style=${{color:"var(--amber-text)"}}>경고 ${sum.warn||0}</span>
          <span style=${{color:"var(--red-text)"}}>실패 ${sum.fail||0}</span>
        </div>
      </div>`}
    </div>
    ${order.length>0&&html`<div class="card" style=${{overflow:"hidden"}}>
      <div style=${{display:"grid",gridTemplateColumns:"minmax(60px,90px) 1fr auto auto auto auto",gap:8,padding:"9px 16px",borderBottom:"0.5px solid var(--separator)"}}>
        ${["국가","URL","HTTP","판정","미흡",""].map((h,i)=>html`<span key=${i} style=${{fontSize:11,fontWeight:700,color:"var(--text-tertiary)",letterSpacing:"0.05em"}}>${h}</span>`)}
      </div>
      ${order.map(u=>html`<${BulkRow} key=${u} url=${u} result=${results[u]} isExp=${exp===u} onToggle=${v=>sExp(e=>e===v?null:v)}/>`)}
    </div>`}
  </div>`;
}

function App(){
  const[tab,sTab]=useState("single");
  return html`<div class="app-shell">
    <${Header} tab=${tab} setTab=${sTab}/>
    <${ProxyBanner}/>
    <div style=${{display:tab==="single"?"contents":"none"}}><${SingleLayout}/></div>
    <div style=${{display:tab==="bulk"?"contents":"none"}}><${BulkLayout}/></div>
  </div>`;
}

createRoot(document.getElementById("root")).render(html`<${App}/>`);
