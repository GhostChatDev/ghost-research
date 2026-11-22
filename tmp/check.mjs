// Sandbox check for Index.html: ids, gate, context guard, persistence, XSS.
import fs from "fs";
const html = fs.readFileSync("Index.html", "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
const ids = [...html.matchAll(/id="([a-zA-Z0-9_-]+)"/g)].map(m => m[1]);
const tabIds = [...html.matchAll(/id="(tab-[a-z]+)"/g)].map(m => m[1]);
let store = {};
let fetchMode = "fail";
let calls = [];

function mk(id) {
  return {
    id, value: "", textContent: "", innerHTML: "", className: "", style: {}, disabled: false,
    checked: false, hidden: false, dataset: {}, _attrs: {}, _ls: {},
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; },
    addEventListener(t, fn) { (this._ls[t] = this._ls[t] || []).push(fn); },
    dispatch(t, ev) { (this._ls[t] || []).forEach(fn => fn(ev)); },
    click() { (this._ls.click || []).forEach(fn => fn({ preventDefault() {}, target: this })); },
    focus() {}, scrollIntoView() {}, removeAttribute() {},
    parentNode: { insertBefore() {}, appendChild() {} },
    appendChild(c) { (this.children = this.children || []).push(c); return c; },
    insertBefore(c) { (this.children = this.children || []).push(c); return c; },
    removeChild() {}, remove() {},
    querySelector() { return mk("child"); }, querySelectorAll() { return []; }
  };
}

function boot() {
  globalThis.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
  try { Object.defineProperty(globalThis, "navigator", { value: { clipboard: { writeText: async t => { globalThis.__clip = t; } } }, configurable: true }); } catch (e) { /* Node already provides navigator */ }
  const els = {};
  ids.forEach(id => { els[id] = mk(id); });
  const tabs = tabIds.map(id => els[id]);
  globalThis.window = globalThis;
  globalThis.document = {
    getElementById: id => els[id] || null,
    querySelectorAll: s => (String(s).includes("tab") ? tabs : []),
    querySelector: () => null, addEventListener() {},
    createElement: () => mk("dyn"), body: mk("body"), execCommand: () => false
  };
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url: String(url), method: opts.method || "GET", body: opts.body || null });
    if (fetchMode === "fail") throw new Error("offline");
    if (String(url).endsWith("/models")) return { ok: true, status: 200, json: async () => ({ data: [{ id: "bitnet-b1.58-2b" }] }) };
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "local reply" } }] }) };
  };
  globalThis.AbortController = class { constructor() { this.signal = {}; } abort() {} };
  (0, eval)(script);
  return els;
}

const text = el => (el.innerHTML || el.textContent || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const log = (...a) => console.log(...a);
const fail = [];
const expect = (ok, label) => { log((ok ? "PASS " : "FAIL ") + label); if (!ok) fail.push(label); };

let els = boot();
els.task.value = "rewrite";
els.prompt.value = "Shorten this line about the school fair.";
els.inTok.value = "180"; els.outTok.value = "120";
els.days.value = "30"; els.chats.value = "40"; els.kwh.value = "0.16";
els.base.value = "http://127.0.0.1:8080/v1"; els.modelId.value = "bitnet-b1.58-2b";

const rows = (els.impBody.innerHTML.match(/<tr>/g) || []).length;
expect(rows >= 6, "IMP scorecard rows rendered: " + rows);
expect(!/undefined|null/.test(els.impBody.innerHTML + els.impStats.textContent), "IMP scorecard has no undefined/empty values");
expect(!/undefined|null/.test(els.benchStats.textContent + els.benchBody.innerHTML), "bench has no undefined/empty values");
const stats0 = text(els.impStats);
expect(/[0-9]/.test(stats0), "IMP stats show numbers: " + stats0);

els.impBody.dispatch("change", { target: { getAttribute: k => (k === "data-imp" ? "helper" : null) } });
els.impBody.dispatch("change", { target: { getAttribute: k => (k === "data-imp" ? "ping" : null) } });
const stats2 = text(els.impStats);
expect(stats2 !== stats0, "ticking an improvement changes the totals: " + stats2);

els.tryBtn.click();
await new Promise(r => setTimeout(r, 40));
expect(!calls.some(c => c.method === "POST"), "gate: no chat text sent while the server is unreachable");
expect(/off|unreach|no response|blocked|not reach/i.test(els.tryStatus.textContent), "gate: says why it blocked: " + els.tryStatus.textContent);

fetchMode = "up"; calls = [];
els.task.value = "code";
els.tryBtn.click();
await new Promise(r => setTimeout(r, 40));
expect(!calls.some(c => c.method === "POST"), "cloud-only task never goes local: " + els.tryStatus.textContent);

els.task.value = "summarize";
els.tryBtn.click();
await new Promise(r => setTimeout(r, 40));
const posts = calls.filter(c => c.method === "POST").length;
expect(posts === 1, "local task sends exactly one request: " + posts);
expect(/local reply|received|ok/i.test(els.tryStatus.textContent), "local reply shown: " + els.tryStatus.textContent);

calls = [];
els.inTok.value = "5000"; els.outTok.value = "500";
els.tryBtn.click();
await new Promise(r => setTimeout(r, 40));
expect(!calls.some(c => c.method === "POST"), "context guard blocks an oversized request: " + els.tryStatus.textContent);

els.inTok.value = "180"; els.outTok.value = "120";
els.saveBtn.click();
els.days.value = "7"; els.chats.value = "10"; els.benchBtn.click();
expect(/[0-9]/.test(text(els.benchStats)), "bench recomputes: " + text(els.benchStats));

const raw = store["ghost-local-v1"] || "";
expect(raw.includes('"helper":true'), "ticked improvements saved to localStorage");

els = boot();
expect(els.logList.innerHTML.includes("summarize"), "saved log survives a refresh");
expect(/[0-9]/.test(text(els.impStats)) && text(els.impStats) !== stats0, "improvement ticks survive a refresh: " + text(els.impStats));

els.task.value = "rewrite";
els.prompt.value = "<img src=x onerror=alert(1)>";
els.saveBtn.click();
xs: {
  const h = els.logList.innerHTML;
  if (h.includes("&#60;") && !h.includes("<img")) { log("PASS XSS escaped"); } else { log("FAIL XSS escaped"); fail.push("XSS escaped"); }
}

els.clearImp.click();
expect(!(store["ghost-local-v1"] || "").includes('"helper":true'), "clear improvements works");
els.clearLog.click();
expect(/nothing saved|no entries|empty/i.test(els.logList.innerHTML), "clear log works: " + text(els.logList));

log("ids found:", ids.length, "| ids present:", ids.filter(i => els[i]).length);
log(fail.length ? "RESULT: FAIL -> " + fail.join(" | ") : "RESULT: PASS (" + ids.length + " ids, 0 failures)");