import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scanner = readFileSync(new URL('../rtic-scanner.js/index.html', import.meta.url), 'utf8');
const translator = readFileSync(new URL('../rol-translator.js', import.meta.url), 'utf8');

test('main Tactical Center exposes the scanner directory in the existing sidebar', () => {
  assert.match(root, /id="rticScannerDirectory"/);
  assert.match(root, /RO-Lyfe-Live-Sports-Center\/\?embed=market-lab/);
  assert.match(root, /RO-Lyfe-Trading-Intelligence-Classroom\/live-chart-desk/);
  assert.match(root, /rolyfe-market-terminal/);
  assert.match(root, /ROlyfe-Trading-Calculator-Pro/);
  assert.match(root, /jumpToRTICScan\(\)/);
});

test('standalone RTIC scanner preserves controls and supports the Live Desk embed', () => {
  assert.match(scanner, /id="scanBtn"/);
  assert.match(scanner, /id="universe"/);
  assert.match(scanner, /id="rticScannerDirectory"/);
  assert.match(scanner, /rtic-embedded-desk/);
  assert.match(scanner, /rol-tactical-scanner-height/);
});

test('Tactical main stylesheet is validly placed inside the HTML head', () => {
  const htmlEnd = root.lastIndexOf('</html>');
  const styleEnd = root.lastIndexOf('</style>');
  assert.ok(htmlEnd > 0);
  assert.ok(styleEnd > 0 && styleEnd < htmlEnd, 'style block must close before the actual document close');
});

test("translator exposes all five shared RO'Lyfe languages", () => {
  assert.match(root, /src="rol-translator\.js"/);
  assert.match(scanner, /src="\.\.\/rol-translator\.js"/);
  for (const language of ["English", "Spanish", "French", "Haitian Creole", "Portuguese"]) {
    assert.ok(translator.includes(language), "missing " + language);
  }
  assert.match(translator, /action:"translate"/);
  assert.match(translator, /rolyfe-translate-language/);
});
