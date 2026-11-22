const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
const store = {};
global.localStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; }
};
global.navigator = { clipboard: { writeText: async (t) => { global.__clip = t; } } };
function makeEl(id) {
  return {
    id, value: "", textContent: "", innerHTML: "", className: "",
    style: {}, disabled: false, checked: false, hidden: false, dataset: {},
    _attrs: {}, _ls: {},
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } },
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return this._attrs[k]; },
    addEventListener(type, fn) { (this._ls[type] = this._ls[type] || []).push(fn); },
    click() { (this._ls.click || []).forEach((fn) => fn({ preventDefault() {}, target: this })); },
    focus() {}, scrollIntoView() {}, removeAttribute() {},
    appendChild() {}, removeChild() {},
    querySelector() { return makeEl(id + "-child"); },
    querySelectorAll() { return []; }
  };
}
const ids = ["liveDot","liveLabel","tab-plan","tab-bench","tab-connect","tab-research","panel-plan","task","prompt","inTok","outTok","tools","quality","routeBtn","tryBtn","saveBtn","decisionCard","decisionEmpty","decisionBody","chat","tryStatus","panel-bench","days","chats","kwh","benchBtn","benchStats","benchBody","logList","clearLog","panel-connect","runCmd","copyCmd","base","modelId","apiKey","pingBtn","copyProvider","pingStatus","providerCard","panel-research"];
const els = {};
ids.forEach((id) => { els[id] = makeEl(id); });
els.task.value = "rewrite";
els.prompt.value = "Shorten this paragraph about the school fair.";
els.inTok.value = "180";
els.outTok.value = "120";
els.days.value = "30";
els.chats.value = "40";
els.kwh.value = "0.16";
els.base.value = "http://127.0.0.1:8080/v1";
els.modelId.value = "bitnet-b1.58-2b";
const tabs = ["tab-plan", "tab-bench", "tab-connect", "tab-research"].map((id) => els[id]);
global.window = global;
global.document = {
  getElementById(id) { return els[id] || null; },
  querySelectorAll(sel) { return String(sel).indexOf("tab") >= 0 ? tabs : []; },
  querySelector() { return null; },
  addEventListener() {},
  createElement() { return makeEl("dyn"); },
  body: makeEl("body"),
  execCommand() { return false; }
};
eval(script);
function text(el) {
  return (el.innerHTML || el.textContent || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function dump(label) {
  console.log("== " + label + " ==");
  console.log("decision:", text(els.decisionBody).slice(0, 500));
  console.log("bench:", text(els.benchStats).slice(0, 320));
  console.log("log:", text(els.logList).slice(0, 320));
}
dump("init");
els.routeBtn.click();
dump("route rewrite");
els.saveBtn.click();
dump("saved");
const raw = store[Object.keys(store)[0]] || "";
console.log("PERSIST has rewrite:", raw.includes("rewrite"), "len", raw.length);
els.task.value = "code";
els.tools.checked = true;
els.quality.checked = true;
els.routeBtn.click();
dump("code+tools+quality");
els.task.value = "private";
els.tools.checked = false;
els.quality.checked = false;
els.routeBtn.click();
dump("private");
els.task.value = "research";
els.routeBtn.click();
dump("research");
els.days.value = "7";
els.chats.value = "10";
els.benchBtn.click();
dump("bench 7x10");
els.clearLog.click();
dump("cleared");
console.log("store after clear", JSON.stringify(store).slice(0, 220));
els.task.value = "rewrite";
els.prompt.value = "<img src=x onerror=alert(1)>";
els.routeBtn.click();
els.saveBtn.click();
const logHtml = els.logList.innerHTML || "";
console.log("XSS raw img tag present:", logHtml.indexOf("<img") >= 0);
console.log("XSS escaped entity present:", logHtml.indexOf("&#60;") >= 0);
console.log("DONE");
