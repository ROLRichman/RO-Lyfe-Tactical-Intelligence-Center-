// Contract point/tick values checked against CME Group equity-index and Micro WTI specifications.
// https://www.cmegroup.com/articles/faqs/frequently-asked-questions-micro-e-mini-equity-index-futures.html
// https://www.cmegroup.com/education/articles-and-reports/micro-wti-crude-oil-futures-faq
(function(global){
  const specs={
    ES:{product:"ES",pointValue:50,tickSize:.25,tickValue:12.5},
    MES:{product:"ES",pointValue:5,tickSize:.25,tickValue:1.25},
    NQ:{product:"NQ",pointValue:20,tickSize:.25,tickValue:5},
    MNQ:{product:"NQ",pointValue:2,tickSize:.25,tickValue:.5},
    YM:{product:"YM",pointValue:5,tickSize:1,tickValue:5},
    MYM:{product:"YM",pointValue:.5,tickSize:1,tickValue:.5},
    RTY:{product:"RTY",pointValue:50,tickSize:.1,tickValue:5},
    M2K:{product:"RTY",pointValue:5,tickSize:.1,tickValue:.5},
    CL:{product:"CL",pointValue:1000,tickSize:.01,tickValue:10},
    MCL:{product:"CL",pointValue:100,tickSize:.01,tickValue:1}
  };
  function normalize(value){
    let symbol=String(value||"").trim().toUpperCase().split(":").pop();
    symbol=symbol.replace(/1!$/,"").replace(/!$/,"");
    return symbol;
  }
  function specForSymbol(value){
    const symbol=normalize(value);
    for(const root of Object.keys(specs).sort((a,b)=>b.length-a.length)){
      if(symbol===root||new RegExp("^"+root+"[FGHJKMNQUVXZ]\\d{1,4}$").test(symbol))return Object.freeze({...specs[root],contractRoot:root,sourceSymbol:symbol});
    }
    return null;
  }
  global.ROLYFE_FUTURES_POINT_VALUES=Object.freeze({specForSymbol,normalize});
})(window);
