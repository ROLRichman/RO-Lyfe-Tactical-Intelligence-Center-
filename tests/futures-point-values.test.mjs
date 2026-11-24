import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {test} from "node:test";
const source=readFileSync(new URL("../futures-point-values.js",import.meta.url),"utf8");
const context={window:{}};
vm.runInNewContext(source,context);
const get=context.window.ROLYFE_FUTURES_POINT_VALUES.specForSymbol;
test("normalizes continuous and dated futures symbols",()=>{
 assert.equal(get("CME_MINI:ES1!").pointValue,50);
 assert.equal(get("NQZ6").pointValue,20);
 assert.equal(get("YM1!").pointValue,5);
 assert.equal(get("RTYH27").pointValue,50);
 assert.equal(get("CL1!").pointValue,1000);
});
test("maps micro contracts to their own point and tick values",()=>{
 assert.equal(get("MES1!").pointValue,5);
 assert.equal(get("MNQ1!").pointValue,2);
 assert.equal(get("MYM1!").pointValue,.5);
 assert.equal(get("M2K1!").pointValue,5);
 assert.equal(get("MCL1!").pointValue,100);
 assert.equal(get("MCL1!").tickValue,1);
});
test("does not guess unsupported futures specifications",()=>{
 assert.equal(get("BTCUSDT"),null);
 assert.equal(get("ZB1!"),null);
});
