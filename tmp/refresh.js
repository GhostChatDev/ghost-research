// Refresh / tab-only storage verification for Index.html walkthrough.
// Verifies that the walkthrough keeps drafts in-tab only, never writes sensitive drafts to localStorage, and resets cleanly on a fresh page load.
const fs = require("fs");

const html = fs.readFileSync("Index.html", "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
const ids = [...html.matchAll(/id="([A-Za-z0-9_-]+)"/g)].map(m => m[1]);
const store = {};

function makeEl(id) {
  return {
    id,
    value: id === "draft" ? "Please shorten this invitation to our weekend book club." : id === "scenario" ? "busy" : "",
    textContent: "",
    innerHTML: "",
    className: "",
    style: {},
    disabled: false,
    checked: false,
    hidden: id === "consent" || id === "result",
    dataset: {},
    _attrs: {},
    _ls: {},
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return this._attrs[k]; },
    addEventListener(type, fn) { (this._ls[type] = this._ls[type] || []).push(fn); },
    dispatch(type, ev = {}) { (this._ls[type] || []).forEach(fn => fn(ev)); },
    click() { (this._ls.click || []).forEach(fn => fn({ preventDefault() {}, target: this })); },
    focus() {},
    scrollIntoView() {},
    removeAttribute() {}
  };
}

function boot() {
  global.localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; }
  };
  const els = {};
  ids.forEach(id => { els[id] = makeEl(id); });
  global.window = global;
  global.document = {
    getElementById(id) { return els[id] || null; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    addEventListener() {},
    createElement() { return makeEl("dyn"); },
    body: makeEl("body")
  };
  eval(script);
  return els;
}

const fail = [];
function expect(ok, label) {
  console.log((ok ? "PASS " : "FAIL ") + label);
  if (!ok) fail.push(label);
}

const first = boot();
first.draft.value = "Temporary in-tab draft before refresh.";
first.scenario.value = "offline";
first.simulate.click();
first.approve.click();

expect(first.result.hidden === false, "first session completes simulated switch");
expect(first.result.textContent.includes("Temporary in-tab draft before refresh."), "first session preserves draft in result");
expect(Object.keys(store).length === 0, "walkthrough writes nothing to localStorage");

const afterRefresh = boot();
expect(afterRefresh.draft.value === "Please shorten this invitation to our weekend book club.", "refresh resets draft to default demo text as promised by #storage notice");
expect(afterRefresh.consent.hidden === true && afterRefresh.result.hidden === true, "refresh resets consent and result panels");

if (fail.length) {
  console.log("REFRESH_CHECK: FAIL -> " + fail.join(" | "));
  process.exit(1);
} else {
  console.log("REFRESH_CHECK: PASS");
}
