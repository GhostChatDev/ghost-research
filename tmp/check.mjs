// Sandbox check for index.html: walkthrough scenarios, draft preservation, explicit consent, invalidation, reset, and no-network guarantee.
import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
const ids = [...html.matchAll(/id="([a-zA-Z0-9_-]+)"/g)].map(m => m[1]);

let calls = [];

function mk(id) {
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
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; },
    addEventListener(t, fn) { (this._ls[t] = this._ls[t] || []).push(fn); },
    dispatch(t, ev = {}) { (this._ls[t] || []).forEach(fn => fn(ev)); },
    click() { (this._ls.click || []).forEach(fn => fn({ preventDefault() {}, target: this })); },
    focus() { this._focused = true; },
    scrollIntoView() {},
    removeAttribute() {}
  };
}

function boot() {
  const els = {};
  ids.forEach(id => { els[id] = mk(id); });
  globalThis.window = globalThis;
  globalThis.document = {
    getElementById: id => els[id] || null,
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener() {},
    createElement: () => mk("dyn"),
    body: mk("body")
  };
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url: String(url), method: opts.method || "GET" });
    throw new Error("Unexpected network request from simulation-only walkthrough");
  };
  (0, eval)(script);
  return els;
}

const log = (...a) => console.log(...a);
const fail = [];
const expect = (ok, label) => { log((ok ? "PASS " : "FAIL ") + label); if (!ok) fail.push(label); };

const els = boot();

// 1. Required walkthrough elements exist
["draft", "scenario", "simulate", "reset", "status", "consent", "approve", "result"].forEach(id => {
  expect(Boolean(els[id]), "walkthrough element present: #" + id);
});

// 2. Empty draft guard
els.draft.value = "   ";
els.simulate.click();
expect(els.consent.hidden === true, "empty draft does not open consent prompt");
expect(/Add a demo draft first/i.test(els.status.textContent), "empty draft explains why nothing ran: " + els.status.textContent);

// 3. Busy scenario preserves draft and requires explicit consent before switching
const sampleDraft = "Draft for weekend book club at 4pm.";
els.draft.value = sampleDraft;
els.scenario.value = "busy";
els.simulate.click();
expect(els.draft.value === sampleDraft, "busy failure preserves the draft text");
expect(els.consent.hidden === false, "busy failure reveals explicit consent prompt");
expect(els.result.hidden === true, "busy failure does not switch before consent");
expect(/busy provider/i.test(els.status.textContent), "busy failure explains state: " + els.status.textContent);

// 4. Editing draft after failure invalidates stale consent until re-simulated
els.draft.value = sampleDraft + " Bring a book.";
els.draft.dispatch("input");
expect(els.consent.hidden === true, "editing draft invalidates prior consent box");
els.approve.click();
expect(els.result.hidden === true, "approve click does nothing when draft was edited after simulation");

// 5. Re-simulating and approving records explicit switch with the exact preserved draft
els.simulate.click();
expect(els.consent.hidden === false, "re-simulating busy shows consent again");
els.approve.click();
expect(els.result.hidden === false, "approving switch reveals simulated result");
expect(els.consent.hidden === true, "approving switch hides consent prompt");
expect(els.result.textContent.includes(els.draft.value), "approved switch preserves and displays exact latest draft");
expect(/SIMULATED SWITCH APPROVED/i.test(els.result.textContent), "approved switch clearly marks simulation only");

// 6. Offline phone-to-laptop scenario warns about mobile reachability and requires consent
els.scenario.value = "offline";
els.scenario.dispatch("change");
expect(els.result.hidden === true, "changing scenario clears previous result");
els.simulate.click();
expect(els.consent.hidden === false, "offline scenario offers explicit alternative consent");
expect(/phone session/i.test(els.status.textContent), "offline scenario explains phone reachability limit: " + els.status.textContent);

// 7. Tools mismatch scenario blocks switching outright
els.scenario.value = "tools";
els.scenario.dispatch("change");
els.simulate.click();
expect(els.consent.hidden === true, "tools mismatch blocks switching and hides consent");
expect(els.result.hidden === true, "tools mismatch produces no switch result");
expect(/capability mismatch|blocked/i.test(els.status.textContent), "tools mismatch explains why switching is blocked: " + els.status.textContent);
expect(els.draft.value.includes("Bring a book."), "tools mismatch keeps the user draft intact");

// 8. Reset restores initial walkthrough state
els.reset.click();
expect(els.scenario.value === "busy", "reset restores default scenario");
expect(els.consent.hidden === true && els.result.hidden === true, "reset hides consent and result");
expect(/Please shorten this invitation/i.test(els.draft.value), "reset restores default demo draft");

// 9. No network calls made
expect(calls.length === 0, "simulation makes zero network requests");

log("ids found:", ids.length);
if (fail.length) {
  log("RESULT: FAIL -> " + fail.join(" | "));
  process.exit(1);
} else {
  log("RESULT: PASS (" + ids.length + " ids, 0 failures)");
}
