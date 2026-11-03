/* RO'Lyfe global page-language switcher: localizes interface copy and preserves live data. */
(() => {
  "use strict";
  if (window.__ROL_PAGE_LANGUAGE__) return;
  window.__ROL_PAGE_LANGUAGE__ = true;
  const API = "https://ykmdyfbklvuoseqdjnxy.supabase.co/functions/v1/rol-page-translate";
  const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ5a21keWZia2x2b3NlcWRqbnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3ODk5OTQsImV4cCI6MjEwODM2NTk5NH0._YEZj2GSnPcLGXmwgj98V_JzXdJIhTmOFoAH9BSia2I";
  const PREF = "rolyfe-translate-language";
  const CACHE_KEY = "rolyfe-page-language-cache-v1";
  const LANGS = [["English","English","en"],["Spanish","Español","es"],["French","Français","fr"],["Haitian Creole","Kreyòl Ayisyen","ht"],["Portuguese","Português","pt"]];
  const SKIP = "script,style,noscript,template,svg,canvas,pre,code,kbd,samp,textarea,select,option,[contenteditable='true'],[data-no-translate],[translate='no'],[data-rol-language-ui],.tradingview-widget-container,.tv-widget,.chart-container,.chart-canvas,.ticker,.symbol,.quote-value,.market-price,.watchlist-symbol,[data-symbol],[data-price],[data-market-data],[data-live-value]";
  const ATTRS = ["placeholder","title","aria-label"];
  const textRecords = new Map(), attrRecords = new Map(), cache = new Map();
  const ownChanges = new WeakSet();
  let active = "English", generation = 0, observer = null, queued = [], queueTimer = null;
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    Object.entries(saved).slice(-600).forEach(([k,v]) => { if(typeof v==="string")cache.set(k,v); });
  } catch (_) {}
  const keyFor = (language,text) => language + "\u0000" + text;
  const isData = value => {
    const s = String(value || "").trim();
    return !s || /^[\s$€£¥+\-−()\d.,:%/]+$/.test(s) || (/^[A-Z0-9.$:/_!+-]{1,16}$/.test(s) && /[0-9.$:/_!+-]/.test(s));
  };
  const skipped = el => !el || !!el.closest(SKIP);

  function textCandidate(node) {
    if(!node || node.nodeType!==Node.TEXT_NODE || skipped(node.parentElement))return null;
    const current=node.nodeValue || "";
    let rec=textRecords.get(node);
    if(!rec){rec={original:current,last:null};textRecords.set(node,rec);}
    else if(rec.last!==null && current!==rec.last){rec.original=current;rec.last=null;}
    else if(rec.last===null && current!==rec.original)rec.original=current;
    if(rec.last!==null)return null;
    const m=rec.original.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if(!m || m[2].length<2 || m[2].length>1200 || isData(m[2]))return null;
    return {source:m[2],apply:value=>{
      const translated=m[1]+value+m[3];rec.last=translated;
      if(node.nodeValue!==translated){ownChanges.add(node);node.nodeValue=translated;}
    }};
  }
  function attrCandidates(el) {
    const out=[];
    if(!el || el.nodeType!==Node.ELEMENT_NODE || skipped(el))return out;
    let map=attrRecords.get(el);if(!map){map=new Map();attrRecords.set(el,map);}
    for(const name of ATTRS){
      const value=el.getAttribute(name);if(value===null || value.length>1200 || isData(value))continue;
      let rec=map.get(name);
      if(!rec){rec={original:value,last:null};map.set(name,rec);}
      else if(rec.last!==null && value!==rec.last){rec.original=value;rec.last=null;}
      else if(rec.last===null && value!==rec.original)rec.original=value;
      if(rec.last!==null || rec.original.length<2)continue;
      out.push({source:rec.original,apply:translated=>{rec.last=translated;el.setAttribute(name,translated);}});
    }
    return out;
  }
  function collect(root) {
    const out=[];if(!root)return out;
    if(root.nodeType===Node.TEXT_NODE){const item=textCandidate(root);if(item)out.push(item);return out;}
    if(root.nodeType!==Node.ELEMENT_NODE && root.nodeType!==Node.DOCUMENT_NODE)return out;
    if(root.nodeType===Node.ELEMENT_NODE)out.push(...attrCandidates(root));
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(node.nodeType===Node.TEXT_NODE){const item=textCandidate(node);if(item)out.push(item);}
      else if(node.nodeType===Node.ELEMENT_NODE)out.push(...attrCandidates(node));
    }
    return out;
  }
  function restore() {
    for(const [node,rec] of textRecords){
      if(!node.isConnected){textRecords.delete(node);continue;}
      if(rec.last!==null){
        if(node.nodeValue===rec.last){ownChanges.add(node);node.nodeValue=rec.original;}
        else rec.original=node.nodeValue || "";
      }
      rec.last=null;
    }
    for(const [el,map] of attrRecords){
      if(!el.isConnected){attrRecords.delete(el);continue;}
      for(const [name,rec] of map){
        if(rec.last!==null){
          if(el.getAttribute(name)===rec.last)el.setAttribute(name,rec.original);
          else rec.original=el.getAttribute(name) || "";
        }
        rec.last=null;
      }
    }
  }
  function saveCache(){try{localStorage.setItem(CACHE_KEY,JSON.stringify(Object.fromEntries(Array.from(cache.entries()).slice(-600))));}catch(_){}}
  function makeBatches(items){
    const result=[];let batch=[],size=0;
    for(const item of items){
      if(batch.length && (batch.length>=35 || size+item.source.length>4400)){result.push(batch);batch=[];size=0;}
      batch.push(item);size+=item.source.length;
    }
    if(batch.length)result.push(batch);return result;
  }
  async function requestBatch(language,items){
    const response=await fetch(API,{method:"POST",headers:{apikey:ANON,Authorization:"Bearer "+ANON,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({language,segments:items.map(x=>x.source)}),cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      if(response.status===429)throw new Error("Translation capacity reached. Please retry shortly.");
      if(response.status===503)throw new Error("The translation AI key is not configured in the RO’Lyfe backend.");
      throw new Error(data.error || "Page translation service is temporarily unavailable.");
    }
    if(!Array.isArray(data.translations) || data.translations.length!==items.length || data.translations.some(x=>typeof x!=="string" || !x.trim()))throw new Error("The translation service returned an incomplete batch.");
    return data.translations;
  }
  async function translateItems(items,language,version,status){
    const resolved=new Map(),missing=[];
    for(const item of items){const key=keyFor(language,item.source);if(cache.has(key))resolved.set(item,cache.get(key));else missing.push(item);}
    const batches=makeBatches(missing);let next=0,done=0;
    async function worker(){
      while(next<batches.length){
        const batch=batches[next++],translations=await requestBatch(language,batch);
        if(version!==generation)return;
        batch.forEach((item,i)=>{const value=translations[i].trim();resolved.set(item,value);cache.set(keyFor(language,item.source),value);});
        done++;if(status)status.textContent="Translating page… "+done+" / "+batches.length+" batches";
      }
    }
    await Promise.all(Array.from({length:Math.min(3,Math.max(1,batches.length))},worker));
    if(version!==generation)return false;
    saveCache();items.forEach(item=>{const value=resolved.get(item);if(typeof value==="string")item.apply(value);});
    return true;
  }
  function createControl(){
    if(document.getElementById("rol-page-language-control"))return;
    const style=document.createElement("style");style.id="rol-page-language-style";
    style.textContent=".rol-page-language-control{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;width:fit-content;max-width:100%;margin:8px 0;padding:7px 9px;border:1px solid rgba(75,190,139,.48);border-radius:10px;background:rgba(5,19,14,.88);color:inherit;font:700 12px/1.3 system-ui,Arial,sans-serif;position:relative;z-index:30}.rol-page-language-control label{display:flex;align-items:center;gap:7px;white-space:nowrap}.rol-page-language-control select{max-width:min(190px,52vw);min-width:120px;padding:7px 9px;border:1px solid #39785a;border-radius:8px;background:#07140e;color:#effff5;font:700 12px system-ui,Arial,sans-serif}.rol-page-language-status{display:block;flex-basis:100%;max-width:100%;color:#9fcab1;font:500 10px/1.35 system-ui,Arial,sans-serif;text-align:right}@media(max-width:560px){.rol-page-language-control{width:100%;justify-content:space-between;margin:8px 0}.rol-page-language-control label{width:100%;justify-content:space-between}.rol-page-language-control select{flex:1;max-width:65%}.rol-page-language-status{text-align:left}}";
    document.head.appendChild(style);
    const wrap=document.createElement("div");wrap.className="rol-page-language-control";wrap.id="rol-page-language-control";wrap.dataset.rolLanguageUi="true";wrap.setAttribute("data-no-translate","true");
    const label=document.createElement("label");label.append("🌐 Page language");
    const select=document.createElement("select");select.id="rolPageLanguageSelect";select.setAttribute("aria-label","Select page language");
    LANGS.forEach(([value,native])=>{const option=document.createElement("option");option.value=value;option.textContent=native;select.appendChild(option);});
    label.appendChild(select);
    const status=document.createElement("span");status.id="rolPageLanguageStatus";status.className="rol-page-language-status";status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.textContent="English · Original interface";
    wrap.append(label,status);
    const header=document.querySelector("header.app-header,header.topbar,header,.app-header,.topbar,[role='banner']");
    if(header && header.parentNode)header.insertAdjacentElement("afterend",wrap);else(document.body || document.documentElement).insertBefore(wrap,(document.body || document.documentElement).firstChild);
  }
  async function setLanguage(language,status){
    if(!LANGS.some(x=>x[0]===language))language="English";
    active=language;document.documentElement.lang=LANGS.find(x=>x[0]===language)[2];
    const version=++generation;restore();
    if(language==="English"){if(status)status.textContent="English · Original interface";return;}
    if(status)status.textContent="Preparing page translation…";
    try{
      const items=collect(document.body || document.documentElement);
      if(!items.length){if(status)status.textContent="No translatable interface text found.";return;}
      const okay=await translateItems(items,language,version,status);
      if(okay && version===generation && status)status.textContent="Page translated into "+language+" · "+items.length+" text items";
    }catch(error){
      if(version===generation){restore();if(status)status.textContent=error.message || "Translation unavailable. Original text restored.";}
    }
  }
  function watchPage(status){
    if(!document.body || observer)return;
    observer=new MutationObserver(mutations=>{
      if(active==="English")return;
      const roots=[];
      mutations.forEach(m=>{
        if(m.type==="characterData"){
          const node=m.target;if(ownChanges.has(node)){ownChanges.delete(node);return;}
          const rec=textRecords.get(node);if(rec && rec.last!==null && node.nodeValue===rec.last)return;
          if(rec){rec.original=node.nodeValue || "";rec.last=null;}roots.push(node);
        }else if(m.type==="attributes"){
          const el=m.target,name=m.attributeName,map=attrRecords.get(el),rec=map && map.get(name);
          if(rec && rec.last!==null && el.getAttribute(name)===rec.last)return;
          if(rec){rec.original=el.getAttribute(name) || "";rec.last=null;}roots.push(el);
        }else m.addedNodes.forEach(node=>{if(node.nodeType===Node.ELEMENT_NODE || node.nodeType===Node.TEXT_NODE)roots.push(node);});
      });
      if(!roots.length)return;queued.push(...roots);if(queueTimer)clearTimeout(queueTimer);
      queueTimer=setTimeout(async()=>{
        const batchRoots=queued.splice(0);queueTimer=null;if(active==="English")return;
        const version=generation,items=[];batchRoots.forEach(root=>items.push(...collect(root)));
        const unique=Array.from(new Set(items));if(!unique.length)return;
        try{await translateItems(unique,active,version,status);if(version===generation && status)status.textContent="Page language: "+active+" · Dynamic interface updated";}
        catch(_){if(version===generation && status)status.textContent="Some new interface text could not be translated.";}
      },350);
    });
    observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  }
  function start(){
    createControl();const select=document.getElementById("rolPageLanguageSelect"),status=document.getElementById("rolPageLanguageStatus");if(!select || !status)return;
    let saved="English";try{const value=localStorage.getItem(PREF);if(LANGS.some(x=>x[0]===value))saved=value;}catch(_){}
    select.value=saved;select.addEventListener("change",()=>{const language=select.value;try{localStorage.setItem(PREF,language);}catch(_){}setLanguage(language,status);});
    window.addEventListener("storage",event=>{if(event.key!==PREF || !LANGS.some(x=>x[0]===event.newValue))return;select.value=event.newValue;setLanguage(event.newValue,status);});
    watchPage(status);if(saved!=="English")setTimeout(()=>setLanguage(saved,status),450);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();