# What this research says Ghost Chat should change

Ranked by payoff ÷ work, judged from `Research.md`. The same seven items are on the
**Improvements** tab of `Index.html` with the same weights, so ticking a row there and
reading this file is one list, not two.

Weights: **5** = cheap and removes a real failure, **3** = cheap but smaller win, **2** = bigger
job or smaller payoff. Total available score: **24**.

Status line: **0 of 7 shipped.** Nothing here is in Ghost Chat; this repository is a proposal
plus a page that demonstrates the routing decisions.

---

## 1. One-tap “check server” in Settings → Your own providers — weight 5

**Problem.** Ghost Chat accepts any OpenAI-compatible provider, but it only tells you the
server is broken when a reply fails. The BitNet build produces a `llama-server` binary that the
README never documents, and there is a public report of it dying with SIGBUS on one setup
[4].

**Change.** A button beside each own-provider entry that calls `GET <baseURL>/models` with the
stored key, shows reachable / wrong key / unreachable / timeout, and remembers the last result
with its timestamp.

**Why it is first.** It is a status check, not a feature. It turns "my reply vanished" into
"the server is down, here is the URL, press retry". The page's `Connect` tab already implements
exactly this call and the sandbox harness proves the gate refuses to send chat text when it
fails.

**Proof to look for.** With the server stopped, tapping Test says unreachable within one
timeout, and sending is blocked before any tokens are spent.

## 2. A local helper line for short work — weight 5

**Problem.** Rewrites, summaries, labels and quiz generation are short, low-stakes and
repetitive, and every one of them currently costs balance on a cloud model.

**Change.** Route only that narrow class of work to a local provider when one is configured,
and keep a visible switch. Never route code, research, money math, pictures, tool calls or a
long context to a 2B model — the shipped model's context is 4096 tokens and Microsoft labels
it research-only [16][21].

**Why.** This is the whole value of the BitNet finding: inference that costs electricity
instead of tokens, on work where a small model is enough. Microsoft's energy claim
(55.4%–82.2% less for the kernels) is about the kernels, not about a Ghost Chat bill [9];
the saving that is real is the per-token price going to zero.

**Risk.** Privacy framing must stay honest: a local reply never leaves the machine, but a
*cached* routing decision could. Store the routing rule, not the prompt.

## 3. A “runs on my computer” badge on each message — weight 3

**Problem.** People cannot tell, looking at a reply, whether it came from Ghost Coded or from a
2B model on their laptop. That is how a small model quietly gets trusted with research.

**Change.** A small badge on every message: the provider name, the model, and where it ran
(cloud / your device). Hovering shows the context window that was assumed.

**Why.** The 4096-token limit is the sharp edge in this whole idea, and a badge is the cheapest
way to keep that edge visible. The page's Route tab already produces the decision text;
the badge is the same string attached to a message instead of a table row.

## 4. Say in the model list what stays in the cloud — weight 3

**Problem.** The model picker lists names and prices. Nothing says that a local 2B entry
cannot do what Ghost Researcher or Ghost Finance do.

**Change.** Group local providers under “On your device” with a one-line note: *short text
only, 4096 tokens, not for research, code or money math.* Keep them out of the agent rows
(Ghost Researcher, Ghost Writer, Ghost Analyst, Ghost Finance, Ghost Tutor, Ghost Media,
Ghost Agent, Ghost Coded, Ghost Save, Ghost Fikra, Ghost Gamer).

**Why.** The BitNet model card shows the 2B model trailing larger peers on hard benchmarks
[21]. The cost of saying so in the picker is one label; the cost of not saying it is a person
trusting a labelling model with a financial calculation.

## 5. A private mode that names where the text went — weight 4

**Problem.** Ghost mode keeps a chat unsaved, which protects it from storage but not from
leaving the device. There is no mode that says plainly: nothing here is going to a cloud
provider.

**Change.** A “Local only” switch above the message box. Every model that is not a local
provider is disabled while it is on. Each reply carries the destination, and turning the
switch on shows the destination before the first message, not after.

**Why.** It reuses the badge from item 3 and the routing rule from item 2, so the marginal
work is small. It is the honest version of the privacy promise, and it cannot be faked by
caching.

**Hard requirement.** If no local provider is configured, the switch must say so and stay off
rather than silently doing nothing.

## 6. Local fallback when a cloud model is busy — weight 2

**Problem.** A busy queue means waiting. A short rewrite does not need the queue.

**Change.** After a timeout or a 429 on a *short, low-stakes* request, offer “answer this on
your device instead” and show the result with the local badge. Never do it silently, and never
for the tasks excluded in item 2.

**Why weight 2.** It adds a second failure path (the local server may also be down) and the
queue is usually short-lived. Useful, but it must not jump ahead of the badge and the picker
label, which prevent worse mistakes.

## 7. Show the energy saved, only after a real local call — weight 2

**Problem.** Energy numbers are easy to quote and easy to misread. Microsoft's 55.4%–82.2%
figure compares the ternary kernels to full-precision kernels on the same hardware [9]; it
says nothing about a Ghost Chat balance.

**Change.** After a completed local call, show tokens generated and an estimated watt-hours.
Label it as an estimate, with the method in one tap. Show nothing before a real call —
no projected monthly figure on the chat screen.

**Why weight 2.** It is the least consequential item and the most easily turned into a
marketing claim. Ship it last, and only with the method visible.

---

## What must **not** change

- **Do not replace a Ghost agent with a local model.** A 2B model is not Ghost Researcher,
  Ghost Writer, Ghost Analyst, Ghost Finance, Ghost Tutor or Ghost Coded [21].
- **Do not raise the context limit beyond 4096 for a local provider.** A silent overflow produces
  a confident wrong answer, which is worse than a refusal.
- **Do not use BitNet as memory compression.** 1-bit weights change every reply; a research
  teammate that drops detail is not trustworthy. If that experiment is worth running, it
  belongs in a Ghost Code session on its own branch, not in the product.
- **Do not put an API key in the page.** The page in this repo never stores one; a local server
  needs none.

## Ranking at a glance

| # | Change | Weight | Work | Blocks a real mistake? |
|---|---|---|---|---|
| 1 | Check server button | 5 | small | yes — failed sends |
| 2 | Local helper line for short work | 5 | medium | no — it saves money |
| 5 | Local-only mode | 4 | small | yes — privacy claim |
| 3 | Per-message origin badge | 3 | small | yes — wrong model trusted |
| 4 | Picker says what stays cloud | 3 | small | yes — wrong model trusted |
| 6 | Local fallback when busy | 2 | medium | no |
| 7 | Energy saved after a real call | 2 | small | no |

Order of work: **1 → 5 → 3 → 4 → 2 → 6 → 7**. The three cheap guards come first because they
cost the least and prevent the two failures that lose trust: a send to a dead server, and a
small model trusted with serious work.

## Sources

1. microsoft/BitNet, official inference framework — https://github.com/microsoft/BitNet
2. Ghost Chat, Docs, privacy and terms — https://ghostchat.tech/docs
4. OpenAI-compatible server built but undocumented; one report of the server dying —
   https://github.com/microsoft/BitNet/issues/432
9. bitnet.cpp README, speed and energy figures versus full precision —
   https://github.com/microsoft/BitNet/blob/main/README.md
16. BitNet b1.58 2B4T model card, 4096-token context, research-only licence —
   https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
19. BitNet b1.58 2B4T technical report — https://arxiv.org/abs/2504.12285
21. BitNet b1.58 2B4T, ternary weights and training note —
   https://huggingface.co/microsoft/bitnet-b1.58-2B-4T

Numbering follows `Research.md`, so [4], [16] and [21] mean the same thing in both files.