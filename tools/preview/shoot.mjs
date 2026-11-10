// Capture 1440×900 screenshots of page sections with headless Chrome (macOS).
// usage: node tools/preview/shoot.mjs <url> <outDir> <section[:offset]>...
//   e.g. node tools/preview/shoot.mjs "http://localhost:5173/?theme=navy" out home products:330
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [, , url, outDir, ...sections] = process.argv;
mkdirSync(outDir, { recursive: true });
const CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9333;
const chrome = spawn(CH, [
  '--headless=new', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'zshoot-'))}`, '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) {
  await sleep(250);
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Page.navigate', { url });
await sleep(5000);

for (const s of sections) {
  const [name, offset = '0'] = s.split(':');
  if (name !== 'home') {
    await send('Runtime.evaluate', {
      expression: `(() => { const el = document.getElementById('${name}'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + ${Number(offset)}, behavior: 'instant' }); })()`,
    });
  }
  await sleep(name === 'home' ? 300 : 2600);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, `${name}${offset !== '0' ? '-' + offset : ''}.png`), Buffer.from(data, 'base64'));
  console.log('saved', name);
}
ws.close();
chrome.kill();
