import { readFileSync } from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const scripts=[...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)]
 .filter(([,attrs,body])=>!/\\bsrc\\s*=/i.test(attrs)&&!/\\btype\\s*=\\s*["']application\\/json["']/i.test(attrs)&&body.trim());
if(!scripts.length)throw new Error("No inline scripts found.");
for(const [,attrs,body] of scripts)new Function(body);
console.log("Inline application scripts syntax: OK ("+scripts.length+")");
