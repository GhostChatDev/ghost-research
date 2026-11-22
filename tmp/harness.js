// CLI walkthrough harness for Index.html: exercises busy, offline, and tools failure scenarios.
const fs = require("fs");

const html = fs.readFileSync("Index.html", "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
const ids = [...html.matchAll(/id="([A-Za-z0-9_-]+)"/g)].map(m => m[1]);

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

function dump(label) {
  console.log("== " + label + " ==");
  console.log("status:", els.status.textContent);
  console.log("consent visible:", !els.consent.hidden, "| result visible:", !els.result.hidden);
  if (!els.result.hidden) console.log("result:", els.result.textContent.replace(/\s+/g, " ").trim());
}

dump("init");
els.simulate.click();
dump("busy simulated");
els.approve.click();
dump("busy approved");

els.scenario.value = "offline";
els.scenario.dispatch("change");
els.simulate.click();
dump("offline simulated");

els.scenario.value = "tools";
els.scenario.dispatch("change");
els.simulate.click();
dump("tools blocked");

els.reset.click();
dump("reset");
console.log("DONE");
