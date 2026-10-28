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
 let requestId=0,lastScannedBars=[],lastScanSymbol="",lastScanInterval="1d",lastScanAsOf="";
 const defaultOscillatorSettings={macdFast:12,macdSlow:26,macdSignal:9,stochPeriod:14,stochSmooth:3};
 let activeOscillatorSettings={...defaultOscillatorSettings};
 try{const saved=JSON.parse(localStorage.getItem("rolyfeOscillatorSettings")||"null");if(saved&&typeof saved==="object")activeOscillatorSettings={...activeOscillatorSettings,...saved};}catch(e){}
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
 function wmaSeries(values,period){const out=Array(values.length).fill(NaN);if(!Number.isInteger(period)||period<1||values.length<period)return out;const divisor=period*(period+1)/2;for(let i=period-1;i<values.length;i++){let sum=0,valid=true;for(let j=0;j<period;j++){const v=values[i-period+1+j];if(!Number.isFinite(v)){valid=false;break;}sum+=v*(j+1);}if(valid)out[i]=sum/divisor;}return out;}
 function hmaSeries(values,period){const p=Math.max(2,Math.floor(Number(period)||31)),half=Math.max(1,Math.floor(p/2)),root=Math.max(1,Math.floor(Math.sqrt(p))),wh=wmaSeries(values,half),wf=wmaSeries(values,p),diff=values.map((_,i)=>Number.isFinite(wh[i])&&Number.isFinite(wf[i])?2*wh[i]-wf[i]:NaN);return wmaSeries(diff,root);}
 function scanBars(bars){
   const closes=bars.map(b=>b.close),volumes=bars.map(b=>Math.max(0,b.volume||0)),last=bars[bars.length-1],prev=bars[bars.length-2],length=bars.length;
   const e5=emaSeries(closes,5).at(-1),e10=emaSeries(closes,10).at(-1),e20=emaSeries(closes,20).at(-1),e50=emaSeries(closes,50).at(-1),s20=sma(closes,20),e200=emaSeries(closes,200).at(-1);
   const hmaPeriod=Math.max(31,Math.min(32,Math.floor(Number(byId("tacticalHmaPeriod")?.value)||31))),hmas=hmaSeries(closes,hmaPeriod),hma=hmas.at(-1),prevHma=hmas.at(-2);
   const pbLength=Math.max(2,Math.min(300,Math.floor(Number(byId("tacticalPbLength")?.value)||50))),pbMultiplier=Math.max(.1,Math.min(10,Number(byId("tacticalPbMultiplier")?.value)||1.5));
   const pbBuyEma=Math.max(1,Math.min(100,Math.floor(Number(byId("tacticalPbBuyEma")?.value)||1))),pbSellEma=Math.max(2,Math.min(300,Math.floor(Number(byId("tacticalPbSellEma")?.value)||13)));
   const pbVolUpRaw=byId("tacticalPbVolUp")?.value,pbVolDownRaw=byId("tacticalPbVolDown")?.value,pbVolUp=Math.max(0,Math.min(1000,Number(pbVolUpRaw===""||pbVolUpRaw===undefined?100:pbVolUpRaw))),pbVolDown=Math.max(0,Math.min(1000,Number(pbVolDownRaw===""||pbVolDownRaw===undefined?100:pbVolDownRaw)));
   const pbSpreadRaw=byId("tacticalPbSpread")?.value,pbSpreadLimit=Math.max(0,Math.min(10,Number(pbSpreadRaw===""||pbSpreadRaw===undefined?.09:pbSpreadRaw)),pbShowLabel=byId("tacticalPbShowLabel")?.checked!==false,pbMoveTo=byId("tacticalPbMoveTo")?.value||"UP";
   const oscillatorData=calculateOscillatorSeries(bars);
   const macd=oscillatorData.latest.macd,signal=oscillatorData.latest.signal;
   const st={k:oscillatorData.latest.stochK??NaN,d:oscillatorData.latest.stochD??NaN};
   const rv=rsi(closes),cv=cci(bars),seg=bars.slice(-20);
   const low20=Math.min(...seg.map(b=>b.low)),high20=Math.max(...seg.map(b=>b.high)),range=high20-low20,pos=range?(last.close-low20)/range:.5;
   const volWindow=volumes.slice(Math.max(0,length-21),length-1),avgVol=volWindow.length?volWindow.reduce((x,y)=>x+y,0)/volWindow.length:NaN;
   const rvol=avgVol>0?last.volume/avgVol:NaN;
   const dollarVol=sma(bars.slice(-20).map(b=>b.close*Math.max(0,b.volume||0)),Math.min(20,length));
   const mean=sma(closes,20),std=closes.length>=20?Math.sqrt(closes.slice(-20).reduce((s,x)=>s+Math.pow(x-mean,2),0)/20):NaN;
   const trueRanges=bars.map((b,i)=>{const p=i>0?bars[i-1].close:b.close;return Math.max(b.high-b.low,Math.abs(b.high-p),Math.abs(b.low-p));});
   const atrPeriod=14;
   let atr=NaN;
   if(trueRanges.length>=atrPeriod){
     atr=trueRanges.slice(0,atrPeriod).reduce((a,b)=>a+b,0)/atrPeriod;
     for(let i=atrPeriod;i<trueRanges.length;i++)atr=((atr*(atrPeriod-1))+trueRanges[i])/atrPeriod;
   }
   const squeeze=Number.isFinite(std)&&Number.isFinite(atr)?std*2<atr*1.5:false,momentum=Number.isFinite(mean)?last.close-mean:NaN;
   const roundDown=(v,step)=>{if(!Number.isFinite(v)||step<=0)return NaN;const d=step<1?(step===.1?1:2):0;return Number((Math.floor((v+1e-7)/step)*step).toFixed(d));};
   const roundUp=(v,step)=>{if(!Number.isFinite(v)||step<=0)return NaN;const d=step<1?(step===.1?1:2):0;return Number((Math.ceil((v-1e-7)/step)*step).toFixed(d));};
   const stopFor=(multiplier)=>({long:last.close-multiplier*atr,short:last.close+multiplier*atr});
   const lowStop=stopFor(1),mediumStop=stopFor(1.5),highStop=stopFor(2);
   const ePbAnchor=emaSeries(closes,pbLength).at(-1),ePbBuy=emaSeries(closes,pbBuyEma).at(-1),ePbSell=emaSeries(closes,pbSellEma).at(-1);
   const volChangePct=prev&&prev.volume>0?((last.volume-prev.volume)/prev.volume)*100:NaN;
   const nearPullback=Number.isFinite(atr)&&atr>0&&Number.isFinite(ePbAnchor)&&Math.abs(last.close-ePbAnchor)<=pbMultiplier*atr;
   const bullPullback=nearPullback&&last.close>=ePbAnchor&&last.close>ePbSell&&last.close>prev.close;
   const bearPullback=nearPullback&&last.close<=ePbAnchor&&last.close<ePbSell&&last.close<prev.close;
   const bullVolumeOk=Number.isFinite(volChangePct)&&volChangePct>=pbVolUp,bearVolumeOk=Number.isFinite(volChangePct)&&volChangePct<=-pbVolDown;
   const pullbackVote=!Number.isFinite(atr)||!Number.isFinite(ePbAnchor)?null:bullPullback&&bullVolumeOk?1:bearPullback&&bearVolumeOk?-1:0;
   const hmaVote=!Number.isFinite(hma)||!Number.isFinite(prevHma)?null:last.close>hma&&hma>prevHma?1:last.close<hma&&hma<prevHma?-1:0;
   const ppsUp=Number.isFinite(hma)&&Number.isFinite(prevHma)&&last.close>hma&&prev.close<=prevHma,ppsDown=Number.isFinite(hma)&&Number.isFinite(prevHma)&&last.close<hma&&prev.close>=prevHma;
   const ppsVote=!Number.isFinite(hma)||!Number.isFinite(prevHma)?null:ppsUp?1:ppsDown?-1:0;
   const hmaValue=Number.isFinite(hma)?"Close "+(last.close>=hma?"above":"below")+" HMA("+hmaPeriod+") "+money(hma)+" • slope "+(hma>prevHma?"rising":hma<prevHma?"falling":"flat"):"Need more valid bars for HMA("+hmaPeriod+")");
   const ppsValue=ppsVote===null?"Need more valid bars for HMA crossing":ppsUp?"⬆ UP ARROW · local HMA-cross heuristic":ppsDown?"⬇ DOWN ARROW · local HMA-cross heuristic":"No fresh crossover · WAIT";
   const pbValue=bullPullback?"Bullish pullback zone"+(bullVolumeOk?" · volume +"+fmt(volChangePct,1)+"% confirms":" · volume gate not met"):(bearPullback?"Bearish pullback zone"+(bearVolumeOk?" · volume "+fmt(volChangePct,1)+"% confirms":" · volume gate not met"):"No aligned pullback setup · WAIT");
   const pbDisplay=pbShowLabel?pbValue:((pullbackVote===1||pullbackVote===-1)?"PULLBACK WATCH":"WAIT");
   const spreadNote="Spread limit "+pbSpreadLimit.toFixed(2)+" • arrow placement "+pbMoveTo+" • quote spread unavailable from OHLCV";

   const atrSetup={lastClose:last.close,atr,period:atrPeriod,multiplier:1.5,
    lowLong:lowStop.long,lowShort:lowStop.short,mediumLong:mediumStop.long,mediumShort:mediumStop.short,highLong:highStop.long,highShort:highStop.short,
    lowLong01:roundDown(lowStop.long,.01),lowShort01:roundUp(lowStop.short,.01),
    mediumLong01:roundDown(mediumStop.long,.01),mediumShort01:roundUp(mediumStop.short,.01),
    highLong01:roundDown(highStop.long,.01),highShort01:roundUp(highStop.short,.01),
    longStop:mediumStop.long,shortStop:mediumStop.short,
    longStop10:roundDown(mediumStop.long,.1),shortStop10:roundUp(mediumStop.short,.1),
    longStop1:roundDown(mediumStop.long,1),shortStop1:roundUp(mediumStop.short,1),
    longStop10s:roundDown(mediumStop.long,10),shortStop10s:roundUp(mediumStop.short,10),
    longStop01:roundDown(mediumStop.long,.01),shortStop01:roundUp(mediumStop.short,.01),
    timestamp:last.time};
   const trendVote=Number.isFinite(e200)?(last.close>e200?1:last.close<e200?-1:0):null;
   const ema50Vote=Number.isFinite(e50)?(last.close>e50?1:last.close<e50?-1:0):null;
   const sma20Vote=Number.isFinite(s20)?(last.close>s20?1:last.close<s20?-1:0):null;
   const macdReady=Number.isFinite(macd)&&Number.isFinite(signal);
   const tests=[
    {name:"EMA 200 — Major Trend",value:Number.isFinite(e200)?(last.close>=e200?"Close above EMA200":"Close below EMA200"):"Need 200 bars",vote:trendVote},
    {name:"EMA 50 — Trend Filter",value:Number.isFinite(e50)?(last.close>=e50?"Close above EMA50":"Close below EMA50"):"Need 50 bars",vote:ema50Vote},
    {name:"EMA 5/10/20 Alignment",value:[e5,e10,e20].every(Number.isFinite)?(e5>e10&&e10>e20?"Bull stack":e5<e10&&e10<e20?"Bear stack":"Mixed EMA stack"):"Need 20 bars",vote:[e5,e10,e20].every(Number.isFinite)?(e5>e10&&e10>e20?1:e5<e10&&e10<e20?-1:0):null},
    {name:"MACD 12/26/9",value:macdReady?(macd>signal?"MACD above signal":"MACD below signal"):"Building MACD",vote:macdReady?(macd>signal&&macd>0?1:macd<signal&&macd<0?-1:0):null},
    {name:"RSI 14",value:Number.isFinite(rv)?fmt(rv,1):"Unavailable",vote:Number.isFinite(rv)?(rv>=52&&rv<70?1:rv<=48&&rv>30?-1:0):null},
    {name:"Stochastic 14",value:Number.isFinite(st.k)?"%K "+fmt(st.k,1)+" / %D "+fmt(st.d,1):"Unavailable",vote:Number.isFinite(st.k)&&Number.isFinite(st.d)?(st.k>st.d&&st.k<80?1:st.k<st.d&&st.k>20?-1:0):null},
    {name:"CCI 20",value:Number.isFinite(cv)?fmt(cv,1):"Unavailable",vote:Number.isFinite(cv)?(cv>100?1:cv< -100?-1:0):null},
    {name:"Squeeze / Momentum Proxy",value:(squeeze?"Squeeze proxy ON":"Squeeze proxy OFF")+" • momentum "+(momentum>=0?"positive":"negative"),vote:Number.isFinite(momentum)?(momentum>0?1:momentum<0?-1:0):null},
    {name:"Volume / RVOL",value:Number.isFinite(rvol)?"RVOL "+fmt(rvol,2)+"x":"Volume unavailable",vote:Number.isFinite(rvol)&&rvol>=1.2?(last.close>prev.close?1:last.close<prev.close?-1:0):0},
    {name:"20-Bar Support / Resistance",value:money(low20)+" — "+money(high20),vote:pos>=.75?1:pos<=.25?-1:0},
    {name:"ATR 14 — Stop Planner",value:Number.isFinite(atr)?"ATR "+money(atr)+" • 1.5× stop "+money(mediumStop.long):"Need 14 bars for ATR",vote:null,atrSetup},
    {name:"Hull Moving Average (HMA "+hmaPeriod+")",value:hmaValue,vote:hmaVote,nonScoring:true},
    {name:"PPS-style Up / Down Arrows",value:ppsValue,vote:ppsVote,nonScoring:true},
    {name:"Pullback Setup — RL Settings Proxy",value:pbDisplay+" • "+spreadNote,vote:pullbackVote,nonScoring:true}
   ];
   const active=tests.filter(t=>t.vote!==null&&!t.nonScoring),sum=active.reduce((s,t)=>s+t.vote,0),score=active.length?Math.round(50+50*sum/active.length):50;
   const liquidity=dollarVol>=25000000?10:dollarVol>=5000000?8:dollarVol>=1000000?6:dollarVol>=500000?4:dollarVol>=100000?2:0;
   return {last,score,available:active.length,tests,dollarVol,rvol,e50,s20,e200,atrSetup,liquidity,hmaPeriod,hma,prevHma,pullback:{length:pbLength,multiplier:pbMultiplier,buyEma:pbBuyEma,sellEma:pbSellEma,volChangePct,volUp:pbVolUp,volDown:pbVolDown,spreadLimit:pbSpreadLimit,moveTo:pbMoveTo},oscillatorPoints:oscillatorData.points,oscillatorLatest:oscillatorData.latest};
 }
 function renderQuote(items){
   const out=byId("rticQuoteOutput");if(!out)return;
   out.style.display="grid";out.style.visibility="visible";out.style.minHeight="48px";
   out.innerHTML=items.map(x=>'<div class="rtic-data-metric"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>').join("");
 }
 function miniVisual(test,bars){
   const W=320,H=92,L=8,R=8,T=8,B=17,innerW=W-L-R,innerH=H-T-B;
   const closes=bars.map(b=>b.close),last=bars[bars.length-1];
   const line=(values,color,dash="",sharedScale=null)=>{
     const valid=values.map((v,i)=>({v,i})).filter(p=>Number.isFinite(p.v));
     if(valid.length<2)return "";
     const scale=(Array.isArray(sharedScale)?sharedScale:valid.map(p=>p.v)).filter(Number.isFinite);
     const min=Math.min(...scale),max=Math.max(...scale),range=max-min||1;
     const pts=valid.map(p=>(L+p.i/(values.length-1)*innerW).toFixed(1)+","+(T+innerH-(p.v-min)/range*innerH).toFixed(1)).join(" ");
     return '<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>';
   };
   const safe=arr=>arr.map(v=>Number.isFinite(v)?v:null);
   const recentBars=bars.slice(-48),recentCloses=closes.slice(-48);
   let drawing="",caption="Recent historical bars • illustrative scale";
   const name=test.name;
   if(name.indexOf("ATR 14")>=0){
     const trs=bars.map((b,i)=>{const p=i>0?bars[i-1].close:b.close;return Math.max(b.high-b.low,Math.abs(b.high-p),Math.abs(b.low-p));}).slice(-48);
     const max=Math.max(0.000001,...trs);
     drawing=trs.map((v,i)=>'<rect x="'+(L+i/(trs.length-1)*innerW).toFixed(1)+'" y="'+(T+innerH*(1-v/max)).toFixed(1)+'" width="4" height="'+(innerH*v/max).toFixed(1)+'" fill="'+(i===trs.length-1?"#ffd54f":"#4b8062")+'" rx="1"/>').join("");
     caption="True range bars • ATR(14) is the average of the latest 14 true ranges";
   }else if(name.indexOf("EMA 5/10/20 Alignment")>=0){
     const base=bars.slice(-48),c=base.map(b=>b.close);
     const e5=emaSeries(closes,5).slice(-48),e10=emaSeries(closes,10).slice(-48),e20=emaSeries(closes,20).slice(-48);
     const shared=c.concat(e5,e10,e20);
     drawing=line(c,"#eaf4ee","",shared)+line(e5,"#00e676","",shared)+line(e10,"#4da3ff","",shared)+line(e20,"#ffd54f","",shared);
     caption="Close (white) • EMA 5 (green) • EMA 10 (blue) • EMA 20 (yellow)";
   }else if(name.indexOf("EMA 200")>=0||name.indexOf("EMA 50")>=0||name.indexOf("SMA 20")>=0){
     const k=name.indexOf("EMA 200")>=0?200:name.indexOf("EMA 50")>=0?50:20;
     const base=bars.slice(-48),c=base.map(b=>b.close);
     let avg;
     if(k===200||k===50)avg=emaSeries(closes,k).slice(-48);
     else avg=closes.map((v,i)=>i>=19?closes.slice(i-19,i+1).reduce((a,b)=>a+b,0)/20:NaN).slice(-48);
     const shared=c.concat(avg);
     drawing=line(c,"#eaf4ee","",shared);
     if(k===200||k===50)drawing+=line(avg,"#00e676","5 3",shared);
     if(k===20)drawing+=line(avg,"#ffd54f","2 3",shared);
     caption=k===200?"Close (white) vs EMA 200 (green)":k===50?"Close (white) vs EMA 50 (green)":"Close (white) vs SMA 20 (yellow)";
   }else if(name.indexOf("MACD")>=0){
     const o=calculateOscillatorSeries(bars),pts=o.points.slice(-48),m=pts.map(p=>p.macd),sig=pts.map(p=>p.signal),hist=pts.map(p=>p.histogram);
     drawing='<line x1="8" y1="45" x2="312" y2="45" stroke="#718078" stroke-dasharray="3 4"/>';
     const valid=hist.filter(Number.isFinite),max=Math.max(0.000001,...valid.map(v=>Math.abs(v)));
     drawing+=hist.map((v,i)=>Number.isFinite(v)?'<line x1="'+(L+i/(hist.length-1)*innerW).toFixed(1)+'" y1="45" x2="'+(L+i/(hist.length-1)*innerW).toFixed(1)+'" y2="'+(45-v/max*28).toFixed(1)+'" stroke="'+(v>=0?"#00e676":"#ff5c5c")+'" stroke-width="2"/>':"").join("");
     const shared=m.concat(sig);
     drawing+=line(m,"#4da3ff","",shared)+line(sig,"#ffd54f","4 3",shared);caption="MACD line (blue), signal (yellow), histogram (green/red)";
   }else if(name.indexOf("RSI")>=0){
     const vals=[];for(let i=0;i<closes.length;i++)vals.push(i<14?NaN:rsi(closes.slice(0,i+1)));
     const v=vals.slice(-48);drawing='<rect x="8" y="'+(T+innerH*(1-.7))+'" width="304" height="'+(innerH*.4)+'" fill="rgba(255,213,79,.08)"/><line x1="8" y1="'+(T+innerH*.3)+'" x2="312" y2="'+(T+innerH*.3)+'" stroke="#ffd54f" stroke-dasharray="3 3"/><line x1="8" y1="'+(T+innerH*.7)+'" x2="312" y2="'+(T+innerH*.7)+'" stroke="#ffd54f" stroke-dasharray="3 3"/>';
     const points=v.map((x,i)=>Number.isFinite(x)?(L+i/(v.length-1)*innerW).toFixed(1)+","+(T+innerH*(1-x/100)).toFixed(1):null).filter(Boolean).join(" ");
     drawing+='<polyline points="'+points+'" fill="none" stroke="#4da3ff" stroke-width="2"/>';caption="RSI 14 • 70 overbought reference, 30 oversold reference";
   }else if(name.indexOf("Stochastic")>=0){
     const st=stochasticSeries(bars,14,3),k=st.k.slice(-48),d=st.d.slice(-48);
     drawing='<line x1="8" y1="'+(T+innerH*.2)+'" x2="312" y2="'+(T+innerH*.2)+'" stroke="#ffd54f" stroke-dasharray="3 3"/><line x1="8" y1="'+(T+innerH*.8)+'" x2="312" y2="'+(T+innerH*.8)+'" stroke="#ffd54f" stroke-dasharray="3 3"/>';
     const pts=(arr,col)=>{const p=arr.map((v,i)=>Number.isFinite(v)?(L+i/(arr.length-1)*innerW).toFixed(1)+","+(T+innerH*(1-v/100)).toFixed(1):null).filter(Boolean).join(" ");return p?'<polyline points="'+p+'" fill="none" stroke="'+col+'" stroke-width="2"/>':""};
     drawing+=pts(k,"#4da3ff")+pts(d,"#00e676");caption="Stochastic %K (blue), %D (green), 80/20 reference zones";
   }else if(name.indexOf("CCI")>=0){
     const vals=[];for(let i=0;i<bars.length;i++)vals.push(i<19?NaN:cci(bars.slice(0,i+1)));
     const v=vals.slice(-48),min=-200,max=200;
     drawing='<line x1="8" y1="'+(T+innerH*(1-100/400))+'" x2="312" y2="'+(T+innerH*(1-100/400))+'" stroke="#ffd54f" stroke-dasharray="3 3"/><line x1="8" y1="'+(T+innerH*(1-(-100+200)/400))+'" x2="312" y2="'+(T+innerH*(1-(-100+200)/400))+'" stroke="#ffd54f" stroke-dasharray="3 3"/>';
     const p=v.map((x,i)=>Number.isFinite(x)?(L+i/(v.length-1)*innerW).toFixed(1)+","+(T+innerH*(1-(Math.max(min,Math.min(max,x))-min)/(max-min))).toFixed(1):null).filter(Boolean).join(" ");
     drawing+='<polyline points="'+p+'" fill="none" stroke="#4da3ff" stroke-width="2"/>';caption="CCI 20 • +100 / −100 reference levels; display clipped at ±200";
   }else if(name.indexOf("Squeeze")>=0){
     const mean=closes.slice(-20).reduce((a,b)=>a+b,0)/Math.min(20,closes.length),momentum=last.close-mean;
     const bars20=bars.slice(-32);drawing='<line x1="8" y1="46" x2="312" y2="46" stroke="#718078" stroke-dasharray="3 4"/>';
     const momentumValues=bars20.map((b,i)=>{const upto=closes.slice(0,closes.length-bars20.length+i+1);return b.close-(upto.slice(-20).reduce((a,x)=>a+x,0)/Math.min(20,upto.length));});
     const max=Math.max(1e-8,...momentumValues.map(v=>Math.abs(v)));
     drawing+=momentumValues.map((v,i)=>'<line x1="'+(L+i/(momentumValues.length-1)*innerW).toFixed(1)+'" y1="46" x2="'+(L+i/(momentumValues.length-1)*innerW).toFixed(1)+'" y2="'+(46-v/max*30).toFixed(1)+'" stroke="'+(v>=0?"#00e676":"#ff5c5c")+'" stroke-width="4"/>').join("");
     caption="Close minus 20-bar mean • lightweight momentum proxy, not TTM Squeeze";
   }else if(name.indexOf("Volume")>=0){
     const v=recentBars.map(b=>Math.max(0,b.volume||0)),max=Math.max(1,...v);
     drawing=v.map((x,i)=>'<rect x="'+(L+i/(v.length-1)*innerW).toFixed(1)+'" y="'+(T+innerH*(1-x/max)).toFixed(1)+'" width="3" height="'+(innerH*x/max).toFixed(1)+'" fill="'+(i===v.length-1?"#00e676":"#4b8062")+'" rx="1"/>').join("");
     caption="Volume per bar • latest bar highlighted; not options-chain liquidity";
   }else{
     const seg=bars.slice(-20),lo=Math.min(...seg.map(b=>b.low)),hi=Math.max(...seg.map(b=>b.high)),span=hi-lo||1;
     const y=v=>T+innerH*(1-(v-lo)/span);
     drawing='<rect x="8" y="'+y(hi)+'" width="304" height="'+(y(lo)-y(hi))+'" fill="rgba(77,163,255,.08)"/><line x1="8" y1="'+y(hi)+'" x2="312" y2="'+y(hi)+'" stroke="#ff5c5c" stroke-dasharray="4 3"/><line x1="8" y1="'+y(lo)+'" x2="312" y2="'+y(lo)+'" stroke="#00e676" stroke-dasharray="4 3"/>';
     const cs=seg.map(b=>b.close),p=cs.map((v,i)=>(L+i/(cs.length-1)*innerW).toFixed(1)+","+y(v).toFixed(1)).join(" ");
     drawing+='<polyline points="'+p+'" fill="none" stroke="#eaf4ee" stroke-width="2"/>';caption="20-bar range • resistance (red), support (green), closes (white)";
   }
   return '<div class="rtic-mini-visual"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(name)+' indicator visual" preserveAspectRatio="none">'+drawing+'</svg><div class="rtic-mini-caption">'+esc(caption)+'</div></div>';
 }
 function renderScan(scan,bars,interval){
   const out=byId("rticScanOutput");if(!out)return;
   out.style.display="block";out.style.visibility="visible";out.style.minHeight="80px";
   const color=scan.score>=65?"bullish":scan.score<=35?"bearish":"neutral";
   const bias=scan.score>=65?"BULLISH BIAS":scan.score<=35?"BEARISH BIAS":"MIXED / NEUTRAL";
   out.innerHTML='<div class="rtic-data-metrics">'+
    '<div class="rtic-data-metric rtic-scan-score"><span>RO’LYFE RTIC SCORE</span><strong class="'+color+'">'+scan.score+'/100</strong><span class="small-muted">'+bias+' • '+scan.available+'/10 directional categories available</span></div>'+
    '<div class="rtic-data-metric"><span>LIQUIDITY PROXY</span><strong>'+scan.liquidity+'/10</strong><span class="small-muted">Avg. dollar volume '+money(scan.dollarVol)+'</span></div>'+
    '<div class="rtic-data-metric"><span>RVOL</span><strong>'+(Number.isFinite(scan.rvol)?fmt(scan.rvol,2)+"x":"—")+'</strong><span class="small-muted">Versus prior bars</span></div>'+
    '<div class="rtic-data-metric"><span>BAR COVERAGE</span><strong>'+bars.length+'</strong><span class="small-muted">'+esc(interval)+' bars returned</span></div>'+
    '<div class="rtic-data-metric"><span>EMA 50 / SMA 20</span><strong>'+[scan.e50,scan.s20].map(v=>money(v)).join(" / ")+'</strong></div>'+
    '<div class="rtic-data-metric"><span>EMA 200 / ATR 14</span><strong>'+[scan.e200,scan.atrSetup?.atr].map(v=>money(v)).join(" / ")+'</strong></div></div>'+
    '<div class="rtic-scan-list">'+scan.tests.map(t=>{const c=t.vote===1?"bullish":t.vote===-1?"bearish":"neutral";const label=t.atrSetup?"🛡️ RISK TOOL":t.vote===1?"⬆️ BULLISH":t.vote===-1?"⬇️ BEARISH":t.vote===null?"⏸️ UNAVAILABLE":"➡️ NEUTRAL";const n=t.name.toLowerCase();let explain="This category summarizes the current historical-bar evidence. Neutral or unavailable means the evidence is mixed or insufficient; check the chart and other context.";if(n.indexOf("ema 200")>=0)explain="Major trend filter: compares the latest close with the 200-period exponential moving average. Above it is a bullish directional clue; below it is bearish. The line’s slope and timeframe also matter.";else if(n.indexOf("ema 50")>=0)explain="Trend filter: compares the latest close with EMA 50. It helps show intermediate trend context and can disagree with EMA 200 during transitions.";else if(n.indexOf("sma 20")>=0)explain="Short-term trend check: compares the latest close with the 20-period simple moving average. Price above SMA20 can support short-term strength; below it can signal weakness. Combine with EMA50 and EMA200 rather than treating a cross alone as a trade signal.";else if(n.indexOf("alignment")>=0)explain="Checks the order of EMA 5, EMA 10, and EMA 20. A bear stack means the shorter averages sit below the longer ones; a bull stack is the reverse.";else if(n.indexOf("macd")>=0)explain="MACD 12/26/9 compares the fast and slow exponential averages and a signal line. MACD below its signal is bearish momentum context; above is bullish context. It can lag price.";else if(n.indexOf("rsi")>=0)explain="RSI 14 measures recent momentum on a 0–100 scale. Readings near or below 30 are commonly called oversold and above 70 overbought, but neither is a standalone buy/sell signal.";else if(n.indexOf("stochastic")>=0)explain="Stochastic compares the latest close with its recent high–low range. %K and %D near 20 or 80 indicate lower or upper zones; a zone alone does not determine direction.";else if(n.indexOf("cci")>=0)explain="CCI 20 measures how far price is from its recent statistical average. Positive readings can indicate upside momentum; strongly negative readings can indicate downside momentum, but it can stay extreme in a trend.";else if(n.indexOf("squeeze")>=0)explain="A lightweight volatility/momentum proxy, not an exact TradingView TTM Squeeze replication. OFF means this proxy did not detect its squeeze condition; negative momentum points downward.";else if(n.indexOf("volume")>=0||n.indexOf("rvol")>=0)explain="Relative volume compares current bar volume with a recent baseline. Higher activity can confirm a move; low activity can mean weaker participation. It is not options-chain liquidity.";else if(n.indexOf("support")>=0||n.indexOf("resistance")>=0)explain="Uses the recent 20-bar low and high as a support/resistance range. The bearish/bullish label reflects the latest close’s position versus that range, not a guaranteed bounce or breakout.";else if(n.indexOf("hull moving average")>=0)explain="Hull Moving Average is a weighted-average trend filter designed to reduce lag. Period defaults to 31 and can be changed to 32. The arrow color is contextual; HMA is excluded from the original RTIC equal-weight score.";else if(n.indexOf("pps-style")>=0)explain="A local up/down marker based on a confirmed close crossing the selected HMA reference. This is not the proprietary Thinkorswim PPS study and should not be treated as an exact PPS reproduction.";else if(n.indexOf("pullback setup")>=0)explain="A transparent proxy uses a 50-period EMA anchor, 1.5× ATR proximity, buy EMA 1, sell EMA 13, and the configured volume-change gate. The 0.09 spread limit cannot be verified from historical OHLCV without current bid/ask data. Confirm higher-timeframe trend, candle direction, and invalidation manually.";const signalMeaning=t.atrSetup?"Volatility-based stop estimate; this risk tool is excluded from the directional score.":t.vote===null?"Not enough valid data for a directional reading.":t.vote===1?"This reading currently supports an upward directional bias.":t.vote===-1?"This reading currently supports a downward directional bias.":"This reading is neutral or mixed under the RTIC rules; it is not a standalone directional confirmation.";const risk=t.atrSetup;const riskHtml=risk?'<div class="rtic-atr-card"><div class="rtic-atr-price-row"><span>LAST RETURNED BAR CLOSE</span><strong class="rtic-atr-last-close">'+money(risk.lastClose)+'</strong></div><button type="button" class="rtic-atr-guide-btn" onclick="showRticAtrGuide()">ⓘ Explain low / medium / high stop strategies</button><div class="rtic-atr-grid"><div><span>ATR(14) • '+esc(interval)+'</span><strong>'+money(risk.atr)+'</strong></div><div><span>LOW • 1.0× ATR distance</span><strong>'+money(risk.atr)+'</strong><small>Closer stop; more likely to be hit</small></div><div><span>LOW LONG / SHORT</span><strong>'+money(risk.lowLong01)+' / '+money(risk.lowShort01)+'</strong><small>1.0× ATR • round down / up</small></div><div><span>MEDIUM • 1.5× ATR distance</span><strong>'+money(risk.atr*1.5)+'</strong><small>Balanced starting reference</small></div><div><span>MEDIUM LONG / SHORT</span><strong>'+money(risk.mediumLong01)+' / '+money(risk.mediumShort01)+'</strong><small>1.5× ATR • round down / up</small></div><div><span>HIGH • 2.0× ATR distance</span><strong>'+money(risk.atr*2)+'</strong><small>Wider stop; larger risk per share</small></div><div><span>HIGH LONG / SHORT</span><strong>'+money(risk.highLong01)+' / '+money(risk.highShort01)+'</strong><small>2.0× ATR • round down / up</small></div><div><span>MEDIUM LONG • $0.10 / $1 / $10</span><strong>'+money(risk.longStop10)+' / '+money(risk.longStop1)+' / '+money(risk.longStop10s)+'</strong></div><div><span>MEDIUM SHORT • $0.10 / $1 / $10</span><strong>'+money(risk.shortStop10)+' / '+money(risk.shortStop1)+' / '+money(risk.shortStop10s)+'</strong></div></div><p class="small-muted">Formula: long stop = latest returned close − (ATR multiple × ATR14); short stop = latest returned close + (ATR multiple × ATR14). Low/medium/high are volatility distances, not risk ratings. Long stops round down and short stops round up to the selected increment. The $0.10, $1 and $10 levels are alternate price-rounding views, not recommendations to place a stop at a round number. Confirm the latest bar is fully closed; use 1D candles for daily swing setups. ATR is not a guaranteed fill or personalized instruction.</p></div>':'';return '<details class="rtic-scan-dropdown"><summary class="rtic-scan-row"><div><strong>'+esc(t.name)+'</strong><div class="small-muted">'+esc(t.value)+'</div><span class="rtic-expand-hint">＋ Tap to understand this reading</span></div><span class="rtic-vote '+c+'">'+label+'</span></summary><div class="rtic-scan-explain"><div class="rtic-scan-current"><strong>Current interpretation: '+label+'</strong><p>'+esc(signalMeaning)+'</p></div>'+(risk?riskHtml:'<strong>How to read it</strong><p>'+esc(explain)+'</p>')+miniVisual(t,bars)+'<p class="small-muted">Calculated from the loaded '+esc(interval)+' historical bars. Use as context, not as a trade instruction.</p></div></details>';}).join("")+'</div>'+
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
       lastScannedBars=bars;lastScanSymbol=symbol;lastScanInterval=interval;lastScanAsOf=time;
       const scan=scanBars(bars);renderScan(scan,bars,interval);
       window.dispatchEvent(new CustomEvent("rolyfe:rtic-scan",{detail:{symbol,interval,scan}}));
       window.dispatchEvent(new CustomEvent("rolyfe:oscillators",{detail:{symbol,interval,asOf:time,...calculateOscillatorSeries(bars,activeOscillatorSettings)}}));
       status(names[provider]+" responded for "+(data.symbol||symbol)+". "+bars.length+" usable OHLCV bars • "+time+". Quote, RTIC scan, and MACD/Stochastic panels updated. Verify session, freshness, and plan entitlement before use.","good");
       const results=byId("rticScanOutput");if(results&&typeof results.scrollIntoView==="function")results.scrollIntoView({behavior:"smooth",block:"start"});
     }else{
       byId("rticScanOutput").innerHTML='<div class="rtic-data-status warn">Quote received. Select “Tickerbot — Historical Bars + RTIC Scan” to run the 10-category technical scan.</div>';
       status(names[provider]+" responded for "+(data.symbol||symbol)+". This response does not confirm an exchange-real-time feed; refresh cadence depends on provider plan.","good");
     }
   }catch(e){if(id!==requestId)return;byId("rticScanOutput").innerHTML="";status(e?.message||"Market-data request failed. Check provider configuration and data entitlement.","bad");}
   finally{if(id===requestId&&button){button.disabled=false;button.textContent="📡 PULL SECURE MARKET DATA";}}
 }
 function recalculateScan(){
   if(!lastScannedBars.length||!lastScanSymbol){status("Change the HMA/pullback settings, then run Pull Secure Market Data once. The scanner needs valid historical candles before it can recalculate.","warn");return;}
   const scan=scanBars(lastScannedBars);
   renderScan(scan,lastScannedBars,lastScanInterval);
   window.dispatchEvent(new CustomEvent("rolyfe:rtic-scan",{detail:{symbol:lastScanSymbol,interval:lastScanInterval,scan,recalculated:true,asOf:lastScanAsOf}}));
   status("HMA / pullback settings recalculated locally from "+lastScannedBars.length+" previously returned "+lastScanInterval+" bars for "+lastScanSymbol+". No new provider request was made.","good");
 }
 function setSymbol(value){
   const b=byId("rticDataSymbol");if(!b)return;
   const next=String(value||"").trim().toUpperCase();if(!next)return;
   if(b.value.trim().toUpperCase()!==next){
     b.value=next;byId("rticQuoteOutput")&&(byId("rticQuoteOutput").innerHTML="");byId("rticScanOutput")&&(byId("rticScanOutput").innerHTML="");
     lastScannedBars=[];lastScanSymbol=next;lastScanAsOf="";
     window.dispatchEvent(new CustomEvent("rolyfe:oscillators",{detail:{symbol:next,interval:lastScanInterval,points:[],settings:activeOscillatorSettings,cleared:true}}));
     status("Symbol changed to "+next+". Pull Secure Market Data to fetch a fresh quote or scan.","warn");
   }
 }
 function usePlannerSymbol(){const a=byId("symbol");if(a)setSymbol(a.value);}
 function setOscillatorSettings(){
   const settings={
     macdFast:byId("rticMacdFast")?.value,
     macdSlow:byId("rticMacdSlow")?.value,
     macdSignal:byId("rticMacdSignal")?.value,
     stochPeriod:byId("rticStochPeriod")?.value,
     stochSmooth:byId("rticStochSmooth")?.value
   };
   const fast=intSetting(settings.macdFast,12,2,50);
   let slow=intSetting(settings.macdSlow,26,3,100);if(slow<=fast)slow=Math.min(100,fast+1);
   activeOscillatorSettings={macdFast:fast,macdSlow:slow,macdSignal:intSetting(settings.macdSignal,9,2,50),stochPeriod:intSetting(settings.stochPeriod,14,2,50),stochSmooth:intSetting(settings.stochSmooth,3,1,20)};
   try{localStorage.setItem("rolyfeOscillatorSettings",JSON.stringify(activeOscillatorSettings));}catch(e){}
   const map={macdFast:"rticMacdFast",macdSlow:"rticMacdSlow",macdSignal:"rticMacdSignal",stochPeriod:"rticStochPeriod",stochSmooth:"rticStochSmooth"};
   Object.entries(activeOscillatorSettings).forEach(([key,value])=>{const el=byId(map[key]);if(el)el.value=value;});
   if(!lastScannedBars.length){status("Oscillator settings saved on this device. Pull Secure Market Data to calculate the panels.","warn");return;}
   const result=calculateOscillatorSeries(lastScannedBars,activeOscillatorSettings);
   window.dispatchEvent(new CustomEvent("rolyfe:oscillators",{detail:{symbol:lastScanSymbol,interval:lastScanInterval,asOf:lastScanAsOf,...result,customSettings:true}}));
 }
 Object.entries(activeOscillatorSettings).forEach(([key,value])=>{const map={macdFast:"rticMacdFast",macdSlow:"rticMacdSlow",macdSignal:"rticMacdSignal",stochPeriod:"rticStochPeriod",stochSmooth:"rticStochSmooth"};const el=byId(map[key]);if(el)el.value=value;});
 window.ROLYFEData={refresh:refresh,recalculateScan:recalculateScan,usePlannerSymbol:usePlannerSymbol,setSymbol:setSymbol,checkConfig:checkConfig,setOscillatorSettings:setOscillatorSettings};
 if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){usePlannerSymbol();checkConfig();});}else{usePlannerSymbol();checkConfig();}
})();