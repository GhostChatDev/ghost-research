# Ghost Research: BitNet and provider resilience

Reviewed: 2026-11-22. Status: research and a **simulated walkthrough**, not a live Ghost Chat integration.

## Attribution and scope

The linked X post is by **Simplifying AI (@simplifyinAI)**, not Microsoft [5]. Microsoft's BitNet repository and model card are primary evidence for the technical claims [1][3]. The post is a discovery link, not an official Microsoft announcement.

Ghost Research is our independent research and interface prototype. We are not claiming authorship of BitNet or forking its inference engine. Upstream code and model licences still apply if we later distribute them.

## Findings

- bitnet.cpp is Microsoft's inference framework for native low-bit models [1]. BitNet b1.58 uses ternary weights; this is not a way to turn any existing cloud model into an equivalent tiny model [3].
- The README reports ARM CPU speedups of 1.37–5.07× and energy reductions of 55.4–70.0%, and x86 speedups of 2.37–6.17× and energy reductions of 71.9–82.2%, in its benchmark comparisons [2]. These are upstream results, not measurements from Ghost Chat.
- Its 100B CPU claim is not evidence that this repository includes a downloadable 100B model or that a phone can run one [2].
- The concrete model evaluated here is BitNet b1.58 2B4T: approximately two billion parameters, trained on four trillion tokens, with a stated 4,096-token context [3]. Other models need their own capability and context checks.
- The model card lists an **MIT licence** and describes research/development use and limitations [3]. Intended-use caution is not a research-only licence restriction.
- Issue 432 discusses HTTP serving and a user's reported failure [4]. An issue is not proof that every current build fails, or proof of a supported endpoint on our deployment. We have not run a BitNet server here.

## What would improve Ghost Chat

Ghost Chat already documents user-added OpenAI-compatible providers [6]. Adding another provider form alone is not a new product. The stronger opportunity is **provider resilience with explicit consent**: preserve an unsent draft, explain a failure, and offer a compatible alternative without silently changing privacy, tools, quality or spending.

Prioritize people using Ghost Chat on phones as well as computers. A phone's `127.0.0.1` refers to that phone, not a laptop. A cloud backend's loopback refers to that backend. An HTTPS page can also encounter browser restrictions when accessing an HTTP/LAN service. A reachable, authenticated endpoint and a verified request path are prerequisites—not setup details to assume away.

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for proposed acceptance criteria. These are proposals, not an audit proving those features are absent from Ghost Chat.

## What the software demonstrates

[Index.html](Index.html) is an explicitly labelled walkthrough using fixed fictional provider states. It illustrates failure → explanation → explicit alternative selection. It makes no model requests and cannot prove a real failover. There is no generated reply, saved-bill counter, invented measured latency, or checkbox claiming an improvement shipped.

The old savings planner and its monthly figures are retired. Kernel energy comparisons cannot establish a Ghost Chat saving; real evaluation needs matched tasks, quality checks, measured usage, current prices and measured device energy. Local inference is not cost-free.

## Next real experiment

1. Choose a supported machine, model revision and inference build; record hardware and versions.
2. Run the upstream installation procedure [1], not unverified copied commands. Record the actual exposed model identifier and server configuration.
3. Test authenticated model discovery and one completion through the same request path Ghost Chat would use. A successful discovery request alone does not prove generation works.
4. On phone and desktop, induce a provider failure, retain the draft and require consent before sending it to a different destination. Check tool/context compatibility and spending limits.
5. Record actual responses, errors and timing; test interruption and duplicate-send handling. Until then, call this a walkthrough, not working failover.

## Sources

[1] Microsoft, BitNet repository: https://github.com/microsoft/BitNet

[2] Microsoft, bitnet.cpp README and benchmark claims: https://github.com/microsoft/BitNet/blob/main/README.md

[3] Microsoft, BitNet b1.58 2B4T model card: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T

[4] BitNet issue 432, HTTP serving discussion (user reports, not a compatibility guarantee): https://github.com/microsoft/BitNet/issues/432

[5] Simplifying AI, source social post: https://x.com/simplifyinAI/status/2124160360538358208

[6] Ghost Chat, product documentation: https://ghostchat.tech/docs
