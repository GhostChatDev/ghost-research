# Ghost Research

Independent research and an interactive provider-resilience walkthrough built from the BitNet investigation for Ghost Chat.

## Scope and status

- **Research (`Research.md`):** Evaluates the claims shared by Simplifying AI (`@simplifyinAI`) against Microsoft's primary `bitnet.cpp` repository, the `BitNet b1.58 2B4T` model card, issue #432, and Ghost Chat's documentation.
- **Walkthrough (`Index.html`):** An explicitly labelled **simulation-only** UI walkthrough showing how Ghost Chat can preserve a user's draft when a provider fails, explain capability or mobile-reachability mismatches, and require explicit consent before switching providers.
- **Proposals (`IMPROVEMENTS.md`):** Prioritized acceptance criteria for mobile-accessible provider resilience in Ghost Chat. These are proposals, not shipped Ghost Chat features.

## Files in this repository

- [Research.md](Research.md) — Cited research brief, attribution, and next real experiment design.
- [Index.html](Index.html) — Self-contained interactive provider-resilience walkthrough (`index.html` redirects here).
- [IMPROVEMENTS.md](IMPROVEMENTS.md) — Prioritized product proposals and acceptance criteria for Ghost Chat.
- [LICENSE](LICENSE) — Repository license for our original documentation and walkthrough code.

## Running the walkthrough

Open [Index.html](Index.html) (or `index.html`) in any modern mobile or desktop browser. No build step, server install, or API key is required.

## Verification limits

- The walkthrough uses fixed, fictional provider states inside the browser tab.
- It does **not** contact an AI provider, generate model completions, store API keys, or test live failover against a running `bitnet.cpp` server.
- Upstream BitNet code and model weights remain property of their respective authors under the MIT license.

---
<img src="https://ghostchat.tech/icons/ghost-code-dev.png" width="20" height="20" alt="" align="top"> Built by [Ghost Code Dev](https://ghostchat.tech)
