# Ghost Research

Research done by Ghost Code into new Microsoft open-source tech, plus a working page that
turns the findings into concrete changes for **Ghost Chat** ([ghostchat.tech/docs](https://ghostchat.tech/docs)).

Two halves:

1. **`Research.md`** — what Microsoft's BitNet (1-bit LLM inference on CPU) actually claims,
   what is downloadable today, and which claims are overreach.
2. **`Index.html`** — a self-contained page with no build step and no dependencies:
   * **Route** — decide whether one piece of work belongs on a local BitNet server or on
     Ghost Chat's cloud, with a reachability gate and a context-limit guard.
   * **Bench** — the monthly cost of all-cloud versus local routing, with the +20% provider
     markup and electricity in the same formula.
   * **Connect** — the exact base URL and model id to paste into Ghost Chat's
     Settings → Your own providers, plus a Test button.
   * **Improvements** — a ranked, weighted scorecard of what Ghost Chat should change, the
     same list written out in `IMPROVEMENTS.md`.

## Run it

No install. Open `Index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/Index.html
```

Everything is stored in `localStorage` under `ghost-local-v1` (routing log, bench inputs and
the improvement ticks). **Clear log** and **Clear improvements** remove it. Nothing is sent
anywhere except to the local base URL you type in Connect.

## Point it at a real local model (optional)

Run Microsoft's BitNet inference server on your own machine (see `Research.md` §2 and the
framework's README for the build steps), then in the page's **Connect** tab:

```text
Base URL: http://127.0.0.1:8080/v1
Model id: bitnet-b1.58-2b
```

Press **Test** — it calls `/v1/models`. No API key is needed for a local server, and the
page never stores one. If you want the same thing inside Ghost Chat, put that base URL and
model id into Settings → Your own providers.

## Check it

```bash
node tmp/check.mjs
```

A dependency-free harness that loads the page's own script with a small DOM stub and asserts
17 things: every `id` in the markup resolves, the unreachable-server gate sends zero requests,
a cloud-only task is never routed local, an oversized request is blocked, a saved log and the
improvement ticks survive a refresh, and pasted HTML is escaped. It prints `PASS` / `FAIL`
per assertion and a final `RESULT:` line.

`tmp/harness.js` and `tmp/refresh.js` are the earlier, narrower versions of the same idea.

## What is verified

- `node tmp/check.mjs` → **RESULT: PASS (46 ids, 0 failures)**.
- The page's local call is exercised against a **stub** server in the harness.

## What is not verified

- No real BitNet server was run for this repo; the local path has not been tested end to end
  against a live 1-bit model.
- The cost figures are a model with sample inputs, not a bill.
- No browser automation test exists here (this repo has no CI or workflow); the harness runs
  the page script in Node with a DOM stub, not in Chromium.

## Layout

| File | What it is |
|---|---|
| `Index.html` | The whole app: markup, styles and script in one file |
| `Research.md` | The cited research on BitNet and local inference |
| `IMPROVEMENTS.md` | Ranked, scored changes for Ghost Chat |
| `tmp/check.mjs` | Sandbox assertions over the page script |
| `LICENSE` | Repository licence |
