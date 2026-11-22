# Ghost Local research brief

Date checked: 2026-11-22.
Status: research for a planner, not a live local model inside Ghost Chat.

The source post is Microsoft’s public note that bitnet.cpp can run 1-bit language models, including a 100B-class model, on a CPU [22]. The official project is [microsoft/BitNet](https://github.com/microsoft/BitNet) [1]. This brief says what that means for Ghost Chat, what we should not claim, and what to build once the repository is connected.

## What the post is about

bitnet.cpp is Microsoft’s inference framework for 1.58-bit (ternary) models. Weights are trained as {-1, 0, +1}, not compressed after training [21]. The README says the kernels give fast, lossless inference on CPU and GPU, with NPU support still coming [12].

Numbers from the official README, not from the tweet:

- ARM CPU speedup: 1.37x to 5.07x. Energy use down 55.4% to 70.0% [12].
- x86 CPU speedup: 2.37x to 6.17x. Energy use down 71.9% to 82.2% [12].
- A 100B BitNet b1.58 model can run on one CPU at about human reading speed, 5 to 7 tokens per second [12]. That is a capability claim for a model of that size. It is not a model you can download and plug into Ghost Chat today.

The model that is actually released and usable is BitNet b1.58 2B4T: about 2 billion parameters, trained on 4 trillion tokens, context length 4096 [21]. Microsoft says it is for research and development, and does not recommend it for commercial or real-world use without more testing [21].

## What not to believe

- Do not treat the tweet’s “100B on a laptop” line as the model Ghost Chat would call. The shipped model is the 2B one [21].
- Do not expect the speed or energy gains if the model is loaded through the normal `transformers` library. Microsoft says those gains need bitnet.cpp [21].
- Do not put a local model in the path of code, research, money math, tools, or the strongest answer. The 2B model’s own card shows it trailing larger peers on several hard benchmarks, and its context is 4096 tokens [21].
- The OpenAI-compatible server is real in the build (`build/bin/llama-server`) but is not the documented path in the README. A March 2026 issue asks Microsoft to document it. A later comment reports the server dying with SIGBUS on one setup [13]. Treat the server as experimental until we run it ourselves.

## How this improves Ghost Chat

Ghost Chat already lets a person add any OpenAI-compatible provider in Settings → Your own providers (name, base URL, API key, model IDs) and pay that provider directly. A local bitnet.cpp server can be that provider, if the server stays up.

The useful product is a router, not a replacement:

| Kind of chat | Where it should go | Why |
| --- | --- | --- |
| Rewrite, summary, draft, quiz, label, private note | Local 2B, if the server answers | Short, low-stakes, and it keeps the text on the machine |
| Code, research, money math, pictures, tools, long context | Ghost Chat cloud | The 2B model is the wrong tool, and its context stops at 4096 [21] |
| Anything the person marks as needing the strongest answer | Cloud | Quality over the electricity saving |

The planner already built in `index.html` does this decision and shows the cloud cost avoided. It does not call a model. That is the right first version.

## Savings math, and what is assumed

The page’s bench is a planning number, not a meter reading.

Assumptions used in the page: 40 chats a day, 30 days, 800 input tokens and 400 output tokens, cloud price with the +20% already included, electricity at $0.16 per kWh. One earlier run of that math gave about $3.25 all-cloud versus $2.18 routed, about $1.08 saved. Re-run the page’s Recalculate button rather than treating that figure as a bill.

Microsoft’s energy cuts (55% to 82%) are for the inference kernels versus full precision [12]. They are not a promise that a Ghost Chat bill drops by that much. Most of a Ghost Chat bill is the cloud model, not the laptop’s watts.

## What to build in the repo, in order

1. Keep `index.html` as the planner. No API key in the page.
2. Add this brief as `RESEARCH.md` so the claims stay next to the code.
3. After the repo is connected, add a small health check: a button that calls `GET` on the local base URL and says reachable or not. Do not send the chat text until that check passes.
4. Only then try `llama-server` on a machine that has the model, and record whether `/v1/chat/completions` answers. If it dies the way issue 432 describes, stop and keep the planner [13].

## Connect steps

Create an empty public or private repository on GitHub under GhostChatDev. Suggested name: `ghost-local`. Do not add a README, license, or .gitignore there, so the first commit from here does not conflict.

Then in Ghost Code:

1. Open the Ghost Code sidebar.
2. Tap Connect with GitHub if it is not already connected as GhostChatDev.
3. Open the + menu.
4. Pick the new repository before the next message.
5. Say “commit the planner and the research.”

Until that repository is selected, nothing from this chat can be committed. A commit from here goes to a `ghost-code/` branch with a draft pull request. It does not touch main and it does not merge.

## Sources

1. microsoft/BitNet, official inference framework. https://github.com/microsoft/BitNet
2. bitnet.cpp README, speed, energy, and 100B CPU claim. https://github.com/microsoft/BitNet/blob/main/README.md
3. BitNet b1.58 2B4T model card. https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
4. OpenAI-compatible server is built but not documented; one report of the server dying. https://github.com/microsoft/BitNet/issues/432
5. The source post. https://x.com/simplifyinAI/status/2124160360538358208
