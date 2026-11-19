"use strict";
/* GTA VI Trophy Guide & Tracker — all state is local. No network requests. */
const LS_KEY = "gta6-trophy-tracker-v1";
const KIND_LABELS = {story:"Story",side:"Side characters",collectible:"Collectibles",activity:"Activities",robbery:"Robberies",money:"Money",explore:"Explore",misc:"Misc"};
const GRADE_LABELS = {platinum:"Platinum",gold:"Gold",silver:"Silver",bronze:"Bronze"};

let TROPHIES = [];
let ROADMAP = null;
let earned = new Set();
let spoiler = false;

function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return;
    const ids = JSON.parse(raw);
    if(Array.isArray(ids)) earned = new Set(ids.filter(n=>Number.isInteger(n)));
  }catch(e){ /* corrupted state: start fresh */ }
}
function saveState(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify([...earned].sort((a,b)=>a-b))); }catch(e){}
}

function gradeChip(t){
  const cls = t.grade === "platinum" ? "plat-chip" : t.grade === "gold" ? "gold-chip" : t.grade === "silver" ? "silver-chip" : "";
  return `<span class="chip ${cls}">${GRADE_LABELS[t.grade]||t.grade}</span>`;
}
function kindChip(t){ return `<span class="chip">${KIND_LABELS[t.kind]||t.kind}</span>`; }
function hiddenChip(t){ return t.hidden ? `<span class="chip hidden-chip">Hidden</span>` : ""; }
function missableChip(t){ return t.missable ? `<span class="chip missable-chip">⚠ Missable</span>` : ""; }

function isSpoilerHidden(t){
  return spoiler && t.hidden && !earned.has(t.id);
}

function renderStats(){
  const total = TROPHIES.length;
  const n = earned.size;
  const pct = total ? Math.round(n/total*100) : 0;
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statEarned").textContent = n;
  document.getElementById("statPct").textContent = pct + "%";
  document.getElementById("progressBar").style.width = pct + "%";
}

function renderList(){
  const q = (document.getElementById("searchBox").value || "").trim().toLowerCase();
  const kind = document.getElementById("kindFilter").value;
  const grade = document.getElementById("gradeFilter").value;
  const status = document.getElementById("statusFilter").value;
  const list = document.getElementById("trophyList");
  let shown = 0;
  const html = TROPHIES.filter(t=>{
    if(q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    if(kind !== "all" && t.kind !== kind) return false;
    if(grade !== "all" && t.grade !== grade) return false;
    if(status === "earned" && !earned.has(t.id)) return false;
    if(status === "not" && earned.has(t.id)) return false;
    if(status === "missable" && !t.missable) return false;
    return true;
  }).map(t=>{
    shown++;
    const isEarned = earned.has(t.id);
    const hiddenSpoiler = isSpoilerHidden(t);
    const name = hiddenSpoiler ? "Hidden trophy — earn it to reveal" : esc(t.name);
    const desc = hiddenSpoiler ? "This story trophy is hidden in spoiler-safe mode." : esc(t.description);
    const guideLink = hiddenSpoiler ? "" : `<div class="trophy-guide-link">Read the guide →</div>`;
    const source = hiddenSpoiler ? "" : `<div class="trophy-source">Source: ${esc(t.source)}</div>`;
    return `<article class="trophy ${isEarned?"earned":""}" data-id="${t.id}" tabindex="0" role="button" aria-label="${esc(t.name)}">
      <input type="checkbox" class="trophy-check" data-id="${t.id}" ${isEarned?"checked":""} aria-label="Mark ${esc(t.name)} as earned">
      <div>
        <div class="trophy-name"><span class="grade-dot grade-${t.grade}"></span>${name}</div>
        <div class="trophy-desc">${desc}</div>
        <div class="trophy-meta">${gradeChip(t)}${kindChip(t)}${hiddenChip(t)}${missableChip(t)}</div>
        ${guideLink}${source}
      </div>
      <div></div>
    </article>`;
  }).join("");
  list.innerHTML = html || `<p class="count-line">No trophies match these filters.</p>`;
  document.getElementById("countLine").textContent =
    `Showing ${shown} of ${TROPHIES.length} trophies · ${earned.size} earned.`;
}

function esc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function openDetail(id){
  const t = TROPHIES.find(x=>x.id===id);
  if(!t) return;
  const body = document.getElementById("detailBody");
  const isEarned = earned.has(t.id);
  body.innerHTML = `
    <div class="trophy-meta">${gradeChip(t)}${kindChip(t)}${hiddenChip(t)}${missableChip(t)}</div>
    <h2>${esc(t.name)}</h2>
    <p class="trophy-desc">${esc(t.description)}</p>
    <h3>Guide</h3>
    <p class="guide-text">${esc(t.guide)}</p>
    <p class="source-line">Source: ${esc(t.source)}</p>
    <div class="earned-toggle"><button type="button" id="detailEarnedBtn" class="${isEarned?"on":""}">${isEarned?"✓ Earned — click to unmark":"Mark as earned"}</button></div>`;
  document.getElementById("detailPanel").classList.remove("hidden");
  document.getElementById("detailEarnedBtn").addEventListener("click", ()=>{
    toggleEarned(t.id);
    openDetail(t.id);
  });
}
function closeDetail(){ document.getElementById("detailPanel").classList.add("hidden"); }

function toggleEarned(id){
  if(earned.has(id)) earned.delete(id); else earned.add(id);
  saveState(); renderStats(); renderList();
}

function renderRoadmap(){
  if(!ROADMAP) return;
  document.getElementById("roadmapTitle").textContent = ROADMAP.title || "Road to the Platinum";
  document.getElementById("factGrid").innerHTML = (ROADMAP.facts||[]).map(f=>
    `<div class="fact"><span>${esc(f.label)}</span><strong>${esc(f.value)}</strong></div>`).join("");
  document.getElementById("missableList").innerHTML = (ROADMAP.missables||[]).map(m=>{
    const t = TROPHIES.find(x=>x.name===m.name);
    const link = t ? ` <a href="#" data-open="${t.id}">Open trophy →</a>` : "";
    return `<p><strong>${esc(m.name)}</strong> ${gradeChip({grade:m.grade})} — ${esc(m.body)}${link}</p>`;
  }).join("");
  document.getElementById("stepsList").innerHTML = (ROADMAP.steps||[]).map(s=>
    `<li><h3>${esc(s.title)}</h3><p class="hours">${esc(s.hours)}</p><p>${esc(s.body)}</p><p class="watch">${esc(s.watch)}</p></li>`).join("");
  document.getElementById("notesList").innerHTML = (ROADMAP.notes||[]).map(n=>`<li>${esc(n)}</li>`).join("");
}

function renderAbout(){
  const unknown = TROPHIES.filter(t=>t.guide.indexOf("No public guide yet") === 0);
  document.getElementById("unknownList").innerHTML = unknown.map(t=>
    `<li><strong>${esc(t.name)}</strong> — ${esc(t.description)} <em>(${esc(t.source)})</em></li>`).join("");
  const sources = ROADMAP ? ROADMAP.sources : [];
  document.getElementById("sourceList").innerHTML = sources.map(s=>`<li>${esc(s)}</li>`).join("");
}

function switchTab(name){
  document.querySelectorAll(".tab").forEach(b=>{
    const active = b.dataset.tab === name;
    b.classList.toggle("active", active);
    b.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".panel").forEach(p=>p.classList.add("hidden"));
  document.getElementById("tab-"+name).classList.remove("hidden");
  if(name === "roadmap") renderRoadmap();
  if(name === "about") renderAbout();
}

function exportProgress(){
  const blob = new Blob([JSON.stringify({app:"gta6-trophy-guide", version:1, earned:[...earned].sort((a,b)=>a-b)}, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gta6-trophy-progress.json";
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

function importProgress(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      const ids = Array.isArray(data) ? data : data.earned;
      if(!Array.isArray(ids)) throw new Error("bad file");
      const valid = new Set(TROPHIES.map(t=>t.id));
      earned = new Set(ids.filter(n=>Number.isInteger(n) && valid.has(n)));
      saveState(); renderStats(); renderList();
    }catch(e){ alert("That file could not be imported — it is not a valid progress export."); }
  };
  reader.readAsText(file);
}

async function init(){
  loadState();
  const [tRes, rRes] = await Promise.all([fetch("data/trophies.json"), fetch("data/roadmap.json")]);
  const tData = await tRes.json();
  ROADMAP = await rRes.json();
  TROPHIES = tData.trophies || [];
  renderStats(); renderList(); renderRoadmap(); renderAbout();

  document.getElementById("searchBox").addEventListener("input", renderList);
  document.getElementById("kindFilter").addEventListener("change", renderList);
  document.getElementById("gradeFilter").addEventListener("change", renderList);
  document.getElementById("statusFilter").addEventListener("change", renderList);

  document.getElementById("spoilerToggle").addEventListener("change", e=>{
    spoiler = e.target.checked; renderList();
  });

  document.getElementById("trophyList").addEventListener("click", e=>{
    const check = e.target.closest(".trophy-check");
    if(check){ toggleEarned(Number(check.dataset.id)); return; }
    const card = e.target.closest(".trophy");
    if(card) openDetail(Number(card.dataset.id));
  });
  document.getElementById("trophyList").addEventListener("keydown", e=>{
    if(e.key === "Enter" && e.target.classList.contains("trophy")){
      openDetail(Number(e.target.dataset.id));
    }
  });
  document.getElementById("detailClose").addEventListener("click", closeDetail);
  document.addEventListener("keydown", e=>{ if(e.key === "Escape") closeDetail(); });

  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click", ()=>switchTab(b.dataset.tab)));
  document.getElementById("missableBox").addEventListener("click", e=>{
    const a = e.target.closest("[data-open]");
    if(a){ e.preventDefault(); switchTab("tracker"); openDetail(Number(a.dataset.open)); }
  });

  document.getElementById("exportBtn").addEventListener("click", exportProgress);
  document.getElementById("importBtn").addEventListener("click", ()=>document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", e=>{
    if(e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  document.getElementById("resetBtn").addEventListener("click", ()=>{
    if(confirm("Clear all earned trophies? This cannot be undone.")){
      earned = new Set(); saveState(); renderStats(); renderList();
    }
  });
}
document.addEventListener("DOMContentLoaded", init);
