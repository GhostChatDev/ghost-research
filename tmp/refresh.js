const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
const store = {};
function boot(label) {
  global.localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; }
  };
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
  els.task.value = "summarize";
  els.prompt.value = "Summarize the notes from Tuesday.";
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
  return els;
}
const first = boot("first");
first.routeBtn.click();
first.saveBtn.click();
const before = (store["ghost-local-v1"] || "");
console.log("saved before refresh:", before.indexOf("summarize") >= 0, "len", before.length);
const second = boot("refresh");
const log = (second.logList.innerHTML || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
console.log("log after refresh:", log.slice(0, 240));
console.log("REFRESH_KEEPS_SUMMARIZE:", log.indexOf("summarize") >= 0);
console.log("REFRESH_NOT_EMPTY:", log.indexOf("Nothing saved yet") < 0);
