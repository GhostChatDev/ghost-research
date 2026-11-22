# IMPROVEMENTS.md — what Ghost Research says Ghost Chat should change

Ranked by (payoff ÷ work). Every claim that needs proof points at a source in `Research.md`.
Weighted score in the app = payoff × 3 + confidence × 2 − effort. Max 24.

| # | Improvement | Payoff | Confidence | Effort | Score |
|---|---|---|---|---|---|
| 1 | Local model option in Settings → Your providers | 3 | 3 | 2 | 13 |
| 2 | Route cheap chats to the local model automatically | 3 | 2 | 3 | 12 |
| 3 | Show the cost of a chat before it sends | 2 | 3 | 1 | 11 |
| 4 | Reachability gate in front of every local send | 2 | 3 | 1 | 11 |
| 5 | Move 2.4B local chat model, 100B not yet | 2 | 3 | 2 | 10 |
| 6 | Context-limit guard with a clear fallback | 2 | 3 | 1 | 9 |
| 7 | Publish a local-first privacy note | 2 | 2 | 1 | 7 |

The numbers above are the same ones the app draws in its "What to improve" scorecard
(`Index.html`), so the doc and the app cannot drift apart.

---

## 1. A local model option that Ghost Chat itself offers

Ghost Chat already lets a person add any OpenAI-compatible provider (Settings → Your own
providers). BitNet exposes a server that speaks that shape, so a local 1-bit model can be
plugged in today with no new Ghost Chat code:

```
base URL: http://127.0.0.1:8080/v1
model id: bitnet-b1.58-2b
```

What to add instead of a wiki page: a **"Local (on your computer)" card** in that same
Settings screen that (a) fills the base URL and model id in, (b) has a **Test** button that
calls `/v1/models` and reports reachable / not reachable, and (c) stores nothing secret. That
turns a documentation paragraph into one tap.

Why it matters: the cost of these chats leaves the balance entirely, and the text never
leaves the machine. The app's bench shows about **$1.08 saved in a month** at 40 chats/day
with the sample token counts — a modelling estimate, not a measurement.

Source: model card and server notes in `Research.md` §2; Ghost Chat's provider feature is
described in the Ghost Chat docs.

## 2. Automatic routing instead of a manual choice

A local 2B model is good at rewriting, summarising, drafting, quizzes and labels. It is not
good at long reasoning, code review, or anything that needs tools or the web. Ghost Chat
already knows which agent and which mode a message used — that is enough to decide.

Rule the app implements and Ghost Chat can copy:

- **Local:** rewrite, summarise, draft, quiz, label, private note (no tools, no web).
- **Cloud:** code, research, money maths, images, anything with tools, anything that needs
  the strongest answer.

The app's own gate refuses to send a cloud-only task to the local server even when the
server is up (assertion "cloud-only task never goes local" passes), so a wrong routing rule
can't silently hand work to a model that will do it badly.

## 3. Show the cost before sending

Ghost Chat shows the price of a task after it ran. Before the first token is spent, a person
should see the estimate. The app's bench formula is deliberately boring and inspectable:

```
cloud = (in + out) / 1e6 × price × 1.2     // +20% provider markup
local = (in + out) / 1e6 × joules × kwh    // electricity only
```

Showing that line above the send button costs one UI element and changes behaviour more than
any model upgrade: people route the cheap work themselves once they can see it.

## 4. A reachability gate in front of every local send

The most common real failure is not a bad model — it is a person who thinks the server is
running. A local provider that is set but unreachable must **block** the send with a plain
sentence and a link to Connect, never silently fall back to the cloud (that silently spends
money on the exact work the person moved away to save).

The app asserts this: with the server down, zero POSTs leave the page and the status reads
"Server not reachable at … Open Connect and check it, then try again."

## 5. Set honest expectations: 2.4B today, 100B later

BitNet b1.58 2B4T is a real, downloadable 2B model with a technical report behind it. The
headline "100B parameters on a CPU" comes from the framework's own claims about the
architecture, not from a model most people can download and run on a laptop today. Ghost
Chat should say the first thing in its local card and treat the second as roadmap. Overclaiming
here is the fastest way to lose trust when the 2B model answers a hard question badly.

Source: `Research.md` §1 and §3 (framework README vs. released model).

## 6. A context-limit guard with a clear fallback

Local models have small context windows. A long chat should be **cut clearly**, not truncated
mid-sentence: the app blocks at `in + out > 4096` tokens and says "Send it to Ghost Chat
instead, or shorten it." The same guard belongs in Ghost Chat's provider path, because the
failure mode otherwise looks like the model is broken.

## 7. Publish a local-first privacy note

Ghost Chat's docs explain what is stored and what leaves the machine. A single paragraph —
"if you point a provider at `127.0.0.1`, that text never leaves your computer; Ghost Chat
still stores the chat on the server unless Ghost mode is on" — closes the biggest trust gap
for the people this feature is for. Be exact: a local provider does not make the chat private
by itself; Ghost mode is what does that.

---

## What this research does **not** prove

- No live BitNet server was run for this repo. The app's local call is exercised in the
  sandbox against a stub, not a real 1-bit model.
- The dollar figures are a model, not a bill: they assume the sample token counts, one
  electricity price and the cloud rate written in the page.
- No claim is made about reply quality of a 2B model versus Ghost Chat's cloud models; that
  needs a side-by-side evaluation that has not been run.