# Ghost Research

A one-page planner that decides which Ghost Chat work can stay on a local BitNet server, and which should stay on Ghost Chat’s cloud.

Open `index.html` in a browser. No install. No API key. The page does not call a model.

## What is in this folder

- `index.html` — the planner. Route a chat, see the saving, copy the local provider settings.
- `RESEARCH.md` — the BitNet claims, what not to believe, and the order to build the rest.

## Local provider, if you run bitnet.cpp yourself

In Ghost Chat: Settings → Your own providers.

- Base URL: `http://127.0.0.1:8080/v1`
- Model ID: `bitnet-b1.58-2b`
- API key: any placeholder. Ghost Chat charges nothing for your own provider. Do not paste a real cloud key here.

The OpenAI-compatible server is compiled by bitnet.cpp but is not the documented path. See `RESEARCH.md` before relying on it.

## Demo data

The sample chats on the page are labeled demo. The savings figure is a plan, not a bill.
