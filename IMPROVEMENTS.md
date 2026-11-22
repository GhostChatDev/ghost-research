# Proposed Ghost Chat improvements: provider resilience

Reviewed: 2026-11-22.
Status: **proposals only (0 shipped)**. None of these changes are claimed to be deployed in Ghost Chat, and this document is not an audit proving a feature is absent from Ghost Chat's production codebase.

These proposals come from the findings in [Research.md](Research.md) and are illustrated as an interactive concept in [Index.html](Index.html).

---

## Why the focus changed from a local savings calculator

The earlier planner scored a local 1-bit model routing table for a ~$1/month theoretical saving. As noted in [Research.md](Research.md):

1. **Audience mismatch:** running `bitnet.cpp` requires compiling and keeping a local server running on a computer [1], whereas many Ghost Chat users are on phones where `127.0.0.1` points to the phone itself.
2. **Real operational risk:** when a gateway or selected provider fails or times out, the immediate user pain is losing an unsent draft or having a request silently retried with different privacy, tool support, context limits, or cost.

The priority is therefore **mobile-accessible provider resilience with explicit consent**.

---

## Prioritized proposals

### 1. Preserve the draft across any provider or gateway failure (Priority 1)

- **Problem:** When a provider returns an error, times out, or drops mid-request, losing the composer text forces the user to rewrite their prompt.
- **Proposed change:** Keep the exact draft in the message box until a completion succeeds or the user explicitly clears it. If a request status is ambiguous (for example, a connection drop after submission), tell the user the completion status is unknown before offering a retry so they do not accidentally double-spend.
- **Acceptance criteria:** Inducing a network error, 429, or 5xx on mobile (390px) and desktop (1440px) leaves the draft intact and editable in place.

### 2. Explicit consent card before switching providers (Priority 1)

- **Problem:** Silently falling back from a user's chosen provider to another provider can change who receives the text, whether tools work, the context limit, and the price charged to the user's balance.
- **Proposed change:** When the selected provider is unreachable or busy, show a clear recovery card naming:
  - what failed,
  - the proposed alternative provider and model,
  - whether price, privacy destination, context window, or tool support differ,
  - a single action to approve the switch for this message only.
- **Acceptance criteria:** No fallback request is sent until the user taps approve. Editing the draft or changing the scenario invalidates any prior approval.

### 3. Block incompatible switches when tools, vision, or long context are required (Priority 2)

- **Problem:** A small model such as BitNet b1.58 2B4T has a 4,096-token context window and is a text model [3]. Routing a Ghost Researcher, Ghost Finance, or long-context coding prompt to an incompatible fallback produces broken or truncated results.
- **Proposed change:** Check capability requirements (web search, code execution, image input, context length) before offering an alternative provider. If an alternative lacks required capabilities, explain why it is blocked rather than offering a broken switch.
- **Acceptance criteria:** Requests requiring tools or exceeding the target model's context window cannot be switched to an incompatible provider.

### 4. Reachability and origin check in Settings → Your own providers (Priority 2)

- **Problem:** Ghost Chat supports user-configured OpenAI-compatible providers [6], and `bitnet.cpp` builds upon `llama.cpp` where HTTP serving has user-reported rough edges [4]. On a phone, entering `http://127.0.0.1:8080/v1` points to the phone, and browser mixed-content or CORS rules can block LAN HTTP endpoints from an HTTPS app.
- **Proposed change:** Add a "Test connection" action in Settings → Your own providers that tests the exact request path the chat will use (browser-direct vs. server-proxied), reports reachability and authentication status, and warns immediately when a loopback URL is entered on a mobile device.
- **Acceptance criteria:** Testing an unreachable or loopback URL from a phone explains the device/network mismatch before the user starts a chat.

### 5. Per-reply provider and model provenance badge (Priority 3)

- **Problem:** When a user tests multiple providers or approves a fallback switch, they need to know which provider and model actually produced each reply.
- **Proposed change:** Record and display the actual provider and model ID on the completed message, alongside any real token usage and cost reported by that provider.
- **Acceptance criteria:** Every completed reply after an approved switch displays the provider that answered.

---

## What we explicitly retired

- **No projected monthly kWh or dollar savings widget:** Upstream BitNet kernel energy reductions (55.4%–82.2% vs. full precision on the same CPU [2]) do not measure Ghost Chat billing savings.
- **No silent local routing of agent tasks:** Ghost Researcher, Ghost Finance, Ghost Coded, and other specialist agents rely on tool use and stronger models.
- **No unauthenticated LAN exposure advice:** Never advise users to bind an unauthenticated local inference server to `0.0.0.0` on an untrusted network just to reach it from a phone.

---

## Sources

- [1] Microsoft, BitNet repository: https://github.com/microsoft/BitNet
- [2] Microsoft, `bitnet.cpp` README and benchmark claims: https://github.com/microsoft/BitNet/blob/main/README.md
- [3] Microsoft, BitNet b1.58 2B4T model card (MIT licence, 4,096-token context, intended-use notes): https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
- [4] BitNet issue #432, HTTP serving discussion: https://github.com/microsoft/BitNet/issues/432
- [5] Simplifying AI (`@simplifyinAI`), source X post: https://x.com/simplifyinAI/status/2124160360538358208
- [6] Ghost Chat documentation (`Your providers`): https://ghostchat.tech/docs
