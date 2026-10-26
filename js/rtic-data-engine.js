/* RO'Lyfe Secure Market Data + RTIC scanner.
   Provider credentials stay in Supabase Edge Function secrets. */
(() => {
 "use strict";
 const SUPABASE_URL="https://ykmdyfbklvuoseqdjnxy.supabase.co";
 const SUPABASE_PUBLISHABLE_KEY="sb_publishable_FaJPNdtRsZTemxpbp98F2g_U9ngkFaG";
 const FUNCTION_ROOT=SUPABASE_URL+"/functions/v1/";
 const byId=id=>document.getElementById(id);
 const n=v=>Number.isFinite(Number(v))?Number(v):NaN;
 const fmt=(v,d=2)=>Number.isFinite(v)?v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}):"—";
 const money=v=>Number.isFinite(v)?"$"+fmt(v,2):"—";
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const names={tickerbot:"Tickerbot",finnhub:"Finnhub",alphavantage:"Alpha Vantage",coingecko:"CoinGecko"};
 let requestId=0,lastScannedBars=[],lastScanSymbol="",lastScanInterval="1d";
 async function callData(path,params={}) {
   const url=new URL(FUNCTION_ROOT+path);
   Object.keys(params).forEach(k=>url.searchParams.set(k,String(params[k])));
   const response=await fetch(url.toString(),{method:"GET",headers:{"apikey":SUPABASE_PUBLISHABLE_KEY,"Accept":"application/json"}});
   let body={};try{body=await response.json();}catch(e){}
   if(!response.ok)throw new Error(body.error||("Market-data service returned HTTP "+response.status+"."));
   return body;
 }
 function status(message,kind) {
   const el=byId("rticDataStatus");if(!el)return;
   el.className="rtic-data-status"+(kind?" "+kind:"");el.textContent=message;
 }
 function renderConfig(data) {
   const el=byId("rticProviderStatus");if(!el)return;
   const values=[["Tickerbot",data.secrets?.tickerbotConfigured],["Finnhub",data.secrets?.finnhubConfigured],["Alpha Vantage",data.secrets?.alphaVantageConfigured],["CoinGecko",data.secrets?.coinGeckoConfigured]];
   el.innerHTML=values.map(x=>'<div class="rtic-provider">'+x[0]+'<strong>'+(x[1]===true?"Key configured":x[1]===false?"Needs server secret":"Status unknown")+"</strong></div>").join("");
 }
 async function checkConfig() {
   try{renderConfig(await callData("market-data-status"));}
   catch(e){const el=byId("rticProviderStatus");if(el)el.innerHTML='<div class="rtic-provider">Data service<strong>Configuration check unavailable</strong></div>';}
 }
 function toBars(raw) {
   if(!Array.isArray(raw))return [];
   const bars=raw.map(b=>{
     const get=(...keys)=>{for(const k of keys)if(b?.[k]!==undefined&&b?.[k]!==null)return b[k];return NaN;};
     let time=get("t","time","timestamp","date","datetime");
     if(typeof time==="string"&&!/^\d{10,13}$/.test(time)){const p=Date.parse(time);time=Number.isFinite(p)?Math.floor(p/1000):NaN;}
     else if(Number.isFinite(Number(time))){time=Number(time);if(time>1e12)time=Math.floor(time/1000);}
     return {time:n(time),open:n(get("o","open")),high:n(get("h","high")),low:n(get("l","low")),close:n(get("c","close")),volume:n(get("v","volume"))};
   }).filter(b=>[b.open,b.high,b.low,b.close].every(Number.isFinite)&&b.close>0&&b.high>=b.low);
   bars.sort((a,b)=>(a.time||0)-(b.time||0));
   const out=[];bars.forEach(b=>{if(out.length&&b.time&&out[out.length-1].time===b.time)out[out.length-1]=b;else out.push(b);});return out;
 }
 function sma(a,k){if(a.length<k)return NaN;return a.slice(-k).reduce((x,y)=>x+y,0)/k;}
 function emaSeries(a,k){
   const out=Array(a.length).fill(NaN);if(a.length<k)return out;
   let v=a.slice(0,k).reduce((x,y)=>x+y,0)/k;out[k-1]=v;const f=2/(k+1);
   for(let i=k;i<a.length;i++){v=a[i]*f+v*(1-f);out[i]=v;}return out;
 }
 function rsi(a,k=14){
   if(a.length<k+1)return NaN;let g=0,l=0;
   for(let i=a.length-k;i<a.length;i++){const d=a[i]-a[i-1];if(d>0)g+=d;else l-=d;}
   g/=k;l/=k;if(l===0)return g===0?50:100;return 100-100/(1+g/l);
 }
 function cci(bars,k=20){
   if(bars.length<k)return NaN;const a=bars.slice(-k).map(b=>(b.high+b.low+b.close)/3);
   const m=a.reduce((x,y)=>x+y,0)/k,d=a.reduce((x,y)=>x+Math.abs(y-m),0)/k;
   return d?(a[a.length-1]-m)/(.015*d):0;
 }
 function stochasticSeries(bars,k=14,dPeriod=3){
   const kValues=Array(bars.length).fill(NaN),dValues=Array(bars.length).fill(NaN);
   for(let end=k-1;end<bars.length;end++){
     const seg=bars.slice(end-k+1,end+1),hi=Math.max(...seg.map(b=>b.high)),lo=Math.min(...seg.map(b=>b.low));
     kValues[end]=hi===lo?50:100*(bars[end].close-lo)/(hi-lo);
     if(end>=k-1+dPeriod-1){
       const recent=kValues.slice(end-dPeriod+1,end+1);
       if(recent.every(Number.isFinite))dValues[end]=recent.reduce((sum,v)=>sum+v,0)/dPeriod;
     }
   }
   return {k:kValues,d:dValues};
 }
 function stochastic(bars,k=14){
   const series=stochasticSeries(bars,k,3);
   return {k:series.k.at(-1)??NaN,d:series.d.at(-1)??NaN};
 }
 function intSetting(value,fallback,min,max){
   const parsed=Number(value);
   return Number.isFinite(parsed)?Math.max(min,Math.min(max,Math.round(parsed))):fallback;
 }
 function calculateOscillatorSeries(bars,settings={}){
   const macdFast=intSetting(settings.macdFast,12,2,50);
   const macdSlowRaw=intSetting(settings.macdSlow,26,3,100);
   const macdSlow=macdSlowRaw>macdFast?macdSlowRaw:Math.min(100,macdFast+1);
   const macdSignalPeriod=intSetting(settings.macdSignal,9,2,50);
   const stochPeriod=intSetting(settings.stochPeriod,14,2,50);
   const stochSmooth=intSetting(settings.stochSmooth,3,1,20);
   const closes=bars.map(b=>b.close),length=bars.length;
   const fast=emaSeries(closes,macdFast),slow=emaSeries(closes,macdSlow);
   const macdLine=closes.map((_,i)=>Number.isFinite(fast[i])&&Number.isFinite(slow[i])?fast[i]-slow[i]:NaN);
   const validMacd=macdLine.filter(Number.isFinite),signalValues=emaSeries(validMacd,macdSignalPeriod),signalLine=Array(length).fill(NaN);
   let index=0;
   for(let i=0;i<length;i++){if(Number.isFinite(macdLine[i])){signalLine[i]=signalValues[index]??NaN;index++;}}
   const histogram=macdLine.map((v,i)=>Number.isFinite(v)&&Number.isFinite(signalLine[i])?v-signalLine[i]:NaN);
   const stoch=stochasticSeries(bars,stochPeriod,stochSmooth);
   const plotStart=Math.max(0,length-120);
   const points=bars.slice(plotStart).map((bar,j)=>{
     const i=plotStart+j,asValue=v=>Number.isFinite(v)?Number(v.toFixed(6)):null;
     return {time:bar.time,close:bar.close,macd:asValue(macdLine[i]),signal:asValue(signalLine[i]),histogram:asValue(histogram[i]),stochK:asValue(stoch.k[i]),stochD:asValue(stoch.d[i])};
   });
   const latest=points.length?points[points.length-1]:{};
   return {
     points,
     latest:{macd:latest.macd,signal:latest.signal,histogram:latest.histogram,stochK:latest.stochK,stochD:latest.stochD},
     settings:{macdFast,macdSlow,macdSignal:macdSignalPeriod,stochPeriod,stochSmooth}
   };
 }
 function scanBars(bars){
   const closes=bars.map(b=>b.close),volumes=bars.map(b=>Math.max(0,b.volume||0)),last=bars[bars.length-1],prev=bars[bars.length-2],length=bars.length;
   const e5=emaSeries(closes,5).at(-1),e10=emaSeries(closes,10).at(-1),e20=emaSeries(closes,20).at(-1),e50=emaSeries(closes,50).at(-1),e200=emaSeries(closes,200).at(-1);
   const oscillatorData=calculateOscillatorSeries(bars);
   const macd=oscillatorData.latest.macd,signal=oscillatorData.latest.signal;
   const st={k:oscillatorData.latest.stochK??NaN,d:oscillatorData.latest.stochD??NaN};
   const rv=rsi(closes),cv=cci(bars),seg=bars.slice(-20);
   const low20=Math.min(...seg.map(b=>b.low)),high20=Math.max(...seg.map(b=>b.high)),range=high20-low20,pos=range?(last.close-low20)/range:.5;
   const volWindow=volumes.slice(Math.max(0,length-21),length-1),avgVol=volWindow.length?volWindow.reduce((x,y)=>x+y,0)/volWindow.length:NaN;
   const rvol=avgVol>0?last.volume/avgVol:NaN;
   const dollarVol=sma(bars.slice(-20).map(b=>b.close*Math.max(0,b.volume||0)),Math.min(20,length));
   const mean=sma(closes,20),std=closes.length>=20?Math.sqrt(closes.slice(-20).reduce((s,x)=>s+Math.pow(x-mean,2),0)/20):NaN;
   const recent=bars.slice(-20),atr=recent.reduce((s,b,i)=>{const p=bars[Math.max(0,length-20+i-1)]?.close??b.close;return s+Math.max(b.high-b.low,Math.abs(b.high-p),Math.abs(b.low-p));},0)/Math.max(1,recent.length);
   const squeeze=Number.isFinite(std)&&Number.isFinite(atr)?std*2<atr*1.5:false,momentum=Number.isFinite(mean)?last.close-mean:NaN;
   const trendVote=Number.isFinite(e200)?(last.close>e200?1:last.close<e200?-1:0):null;
   const vote50=Number.isFinite(e50)?(last.close>e50?1:last.close<e50?-1:0):null;
   const aligned=[e5,e10,e20].every(Number.isFinite),macdReady=Number.isFinite(macd)&&Number.isFinite(signal);
   const tests=[
    {name:"EMA 200 — Major Trend",value:Number.isFinite(e200)?(last.close>=e200?"Close above EMA200":"Close below EMA200"):"Need 200 bars",vote:trendVote},
    {name:"EMA 50 — Trend Filter",value:Number.isFinite(e50)?(last.close>=e50?"Close above EMA50":"Close below EMA50"):"Need 50 bars",vote:vote50},
    {name:"EMA 5/10/20 Alignment",value:aligned?(e5>e10&&e10>e20?"Bull stack":e5<e10&&e10<e20?"Bear stack":"Mixed stack"):"Building EMAs",vote:aligned?(e5>e10&&e10>e20?1:e5<e10&&e10<e20?-1:0):null},
    {name:"MACD 12/26/9",value:macdReady?(macd>signal?"MACD above signal":"MACD below signal"):"Building MACD",vote:macdReady?(macd>signal&&macd>0?1:macd<signal&&macd<0?-1:0):null},
    {name:"RSI 14",value:Number.isFinite(rv)?fmt(rv,1):"Unavailable",vote:Number.isFinite(rv)?(rv>=52&&rv<70?1:rv<=48&&rv>30?-1:0):null},
    {name:"Stochastic 14",value:Number.isFinite(st.k)?"%K "+fmt(st.k,1)+" / %D "+fmt(st.d,1):"Unavailable",vote:Number.isFinite(st.k)&&Number.isFinite(st.d)?(st.k>st.d&&st.k<80?1:st.k<st.d&&st.k>20?-1:0):null},
    {name:"CCI 20",value:Number.isFinite(cv)?fmt(cv,1):"Unavailable",vote:Number.isFinite(cv)?(cv>100?1:cv< -100?-1:0):null},
    {name:"Squeeze / Momentum Proxy",value:(squeeze?"Squeeze proxy ON":"Squeeze proxy OFF")+" • momentum "+(momentum>=0?"positive":"negative"),vote:Number.isFinite(momentum)?(momentum>0?1:momentum<0?-1:0):null},
    {name:"Volume / RVOL",value:Number.isFinite(rvol)?"RVOL "+fmt(rvol,2)+"x":"Volume unavailable",vote:Number.isFinite(rvol)&&rvol>=1.2?(last.close>prev.close?1:last.close<prev.close?-1:0):0},
    {name:"20-Bar Support / Resistance",value:money(low20)+" — "+money(high20),vote:pos>=.75?1:pos<=.25?-1:0}
   ];
   const active=tests.filter(t=>t.vote!==null),sum=active.reduce((s,t)=>s+t.vote,0),score=active.length?Math.round(50+50*sum/active.length):50;
   const liquidity=dollarVol>=25000000?10:dollarVol>=5000000?8:dollarVol>=1000000?6:dollarVol>=500000?4:dollarVol>=100000?2:0;
   return {last,score,available:active.length,tests,dollarVol,rvol,e5,e10,e20,e50,e200,liquidity,oscillatorPoints:oscillatorData.points,oscillatorLatest:oscillatorData.latest};
 }
 function renderQuote(items){
   const out=byId("rticQuoteOutput");if(!out)return;
   out.style.display="grid";out.style.visibility="visible";out.style.minHeight="48px";
   out.innerHTML=items.map(x=>'<div class="rtic-data-metric"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>').join("");
 }
 function renderScan(scan,bars,interval){
   const out=byId("rticScanOutput");if(!out)return;
   out.style.display="block";out.style.visibility="visible";out.style.minHeight="80px";
   const color=scan.score>=65?"bullish":scan.score<=35?"bearish":"neutral";
   const bias=scan.score>=65?"BULLISH BIAS":scan.score<=35?"BEARISH BIAS":"MIXED / NEUTRAL";
   out.innerHTML='<div class="rtic-data-metrics">'+
    '<div class="rtic-data-metric rtic-scan-score"><span>RO’LYFE RTIC SCORE</span><strong class="'+color+'">'+scan.score+'/100</strong><span class="small-muted">'+bias+' • '+scan.available+'/10 categories available</span></div>'+
    '<div class="rtic-data-metric"><span>LIQUIDITY PROXY</span><strong>'+scan.liquidity+'/10</strong><span class="small-muted">Avg. dollar volume '+money(scan.dollarVol)+'</span></div>'+
    '<div class="rtic-data-metric"><span>RVOL</span><strong>'+(Number.isFinite(scan.rvol)?fmt(scan.rvol,2)+"x":"—")+'</strong><span class="small-muted">Versus prior bars</span></div>'+
    '<div class="rtic-data-metric"><span>BAR COVERAGE</span><strong>'+bars.length+'</strong><span class="small-muted">'+esc(interval)+' bars returned</span></div>'+
    '<div class="rtic-data-metric"><span>EMA 5 / 10 / 20</span><strong>'+[scan.e5,scan.e10,scan.e20].map(v=>money(v)).join(" / ")+'</strong></div>'+
    '<div class="rtic-data-metric"><span>EMA 50 / 200</span><strong>'+[scan.e50,scan.e200].map(v=>money(v)).join(" / ")+'</strong></div></div>'+
    '<div class="rtic-scan-list">'+scan.tests.map(t=>{const c=t.vote===1?"bullish":t.vote===-1?"bearish":"neutral";const label=t.vote===1?"⬆️ BULLISH":t.vote===-1?"⬇️ BEARISH":t.vote===null?"⏸️ UNAVAILABLE":"➡️ NEUTRAL";return '<div class="rtic-scan-row"><div><strong>'+esc(t.name)+'</strong><div class="small-muted">'+esc(t.value)+'</div></div><span class="rtic-vote '+c+'">'+label+'</span></div>';}).join("")+'</div>'+
    '<div class="callout" style="margin-top:10px"><strong>RTIC methodology:</strong> the score is a transparent equal-weight directional summary of available historical-bar indicators, not a probability of success or an instruction to trade. The squeeze metric is a lightweight volatility proxy, not a platform-identical TTM Squeeze.</div>';
 }
 async function refresh(){
   const id=++requestId,button=byId("rticFetchButton"),provider=byId("rticDataProvider")?.value||"tickerbot",symbol=(byId("rticDataSymbol")?.value||"").trim().toUpperCase(),interval=byId("rticDataInterval")?.value||"1d",limit=Number(byId("rticDataLimit")?.value||300);
   if(!/^(X:)?[A-Z0-9.^_-]{1,20}$/.test(symbol)){status("Enter a valid ticker symbol, for example NVDA or SPY.","warn");return;}
   if(provider==="coingecko"&&["BTC","ETH","SOL","XRP","LINK","HYPE","AVAX","DOGE"].indexOf(symbol)<0){status("CoinGecko supports BTC, ETH, SOL, XRP, LINK, HYPE, AVAX, and DOGE in this connector.","warn");return;}
   if(button){button.disabled=true;button.textContent="⏳ REQUESTING PROVIDER DATA…";}
   status("Requesting "+names[provider]+" data for "+symbol+"…");
   try{
     const data=provider==="tickerbot"?await callData("market-data",{provider,symbol,interval,limit}):await callData("market-data",{provider,symbol});
     if(id!==requestId)return;
     // Never display a provider response under the wrong requested ticker.
     const normalizeSymbol=v=>String(v||"").trim().toUpperCase().replace(/^.*:/,"").replace(/(USDT|USD)$/ ,"");
     const returnedSymbol=normalizeSymbol(data.symbol||symbol),requestedSymbol=normalizeSymbol(symbol);
     if(returnedSymbol!==requestedSymbol){
       byId("rticQuoteOutput").innerHTML="";byId("rticScanOutput").innerHTML="";
       throw new Error("Symbol mismatch: requested "+symbol+" but provider returned "+(data.symbol||"an unnamed symbol")+". Results cleared; check the provider or try Tickerbot.");
     }
     const time=data.asOf?String(data.asOf):data.timestamp?new Date(Number(data.timestamp)*1000).toLocaleString():data.lastUpdatedAt?new Date(Number(data.lastUpdatedAt)*1000).toLocaleString():new Date().toLocaleString();
     let price=n(data.price??data.bars?.[data.bars.length-1]?.c??data.bars?.[data.bars.length-1]?.close);
     const change=n(data.changePercent??data.changePercent24h),changeText=Number.isFinite(change)?(change>0?"+":"")+fmt(change,2)+"%":"—";
     renderQuote([["SYMBOL",data.symbol||symbol],["LAST PRICE",Number.isFinite(price)?fmt(price,price<1?6:2):"—"],["CHANGE",changeText],["PROVIDER",names[provider]],["DATA TIMESTAMP",time],["STATUS",data.dataStatus==="provider_response"?"Provider responded":"Received"]]);
     if(provider==="tickerbot"){
       const bars=toBars(data.bars);
       if(bars.length<25)throw new Error("Only "+bars.length+" usable historical bars returned; at least 25 are needed for a scan.");
       lastScannedBars=bars;lastScanSymbol=symbol;lastScanInterval=interval;
       const scan=scanBars(bars);renderScan(scan,bars,interval);
       window.dispatchEvent(new CustomEvent("rolyfe:rtic-scan",{detail:{symbol,interval,scan}}));
       window.dispatchEvent(new CustomEvent("rolyfe:oscillators",{detail:{symbol,interval,...calculateOscillatorSeries(bars)}}));
       status(names[provider]+" responded for "+(data.symbol||symbol)+". "+bars.length+" usable OHLCV bars • "+time+". Quote and RTIC scan rendered below. Verify session, freshness, and plan entitlement before use.","good");
       const results=byId("rticScanOutput");if(results)results.scrollIntoView({behavior:"smooth",block:"nearest"});
     }else{
       byId("rticScanOutput").innerHTML='<div class="rtic-data-status warn">Quote received. Select “Tickerbot — Historical Bars + RTIC Scan” to run the 10-category technical scan.</div>';
       status(names[provider]+" responded for "+(data.symbol||symbol)+". This response does not confirm an exchange-real-time feed; refresh cadence depends on provider plan.","good");
     }
   }catch(e){if(id!==requestId)return;byId("rticScanOutput").innerHTML="";status(e?.message||"Market-data request failed. Check provider configuration and data entitlement.","bad");}
   finally{if(id===requestId&&button){button.disabled=false;button.textContent="📡 PULL SECURE MARKET DATA";}}
 }
 function setSymbol(value){
   const b=byId("rticDataSymbol");if(!b)return;
   const next=String(value||"").trim().toUpperCase();if(!next)return;
   if(b.value.trim().toUpperCase()!==next){
     b.value=next;byId("rticQuoteOutput")&&(byId("rticQuoteOutput").innerHTML="");byId("rticScanOutput")&&(byId("rticScanOutput").innerHTML="");
     status("Symbol changed to "+next+". Pull Secure Market Data to fetch a fresh quote or scan.","warn");
   }
 }
 function usePlannerSymbol(){const a=byId("symbol");if(a)setSymbol(a.value);}
 function setOscillatorSettings(){
   if(!lastScannedBars.length){status("Run a Tickerbot historical-bar scan first to populate MACD and Stochastic panels.","warn");return;}
   const settings={
     macdFast:byId("rticMacdFast")?.value,
     macdSlow:byId("rticMacdSlow")?.value,
     macdSignal:byId("rticMacdSignal")?.value,
     stochPeriod:byId("rticStochPeriod")?.value,
     stochSmooth:byId("rticStochSmooth")?.value
   };
   const result=calculateOscillatorSeries(lastScannedBars,settings);
   window.dispatchEvent(new CustomEvent("rolyfe:oscillators",{detail:{symbol:lastScanSymbol,interval:lastScanInterval,...result,customSettings:true}}));
 }
 window.ROLYFEData={refresh:refresh,usePlannerSymbol:usePlannerSymbol,setSymbol:setSymbol,checkConfig:checkConfig,setOscillatorSettings:setOscillatorSettings};
 if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){usePlannerSymbol();checkConfig();});}else{usePlannerSymbol();checkConfig();}
})();