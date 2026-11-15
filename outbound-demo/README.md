# Outbound live coaching demo

This standalone browser demo uses a prewritten negotiation scenario, and generates its prompts from scripted cues, not AI. No microphone, audio recording, account, contact data, analytics, telephony, or remote APIs. It is not yet part of the live Kovo website.

From this directory, run `python3 -m http.server 5173` and open `http://localhost:5173`. On an iPhone, serve the folder on a reachable HTTPS host. To test, run `node --test test.mjs`.

## Intended product
- Native iPhone contact picker and Kovo outbound dialer. Recipient can answer on a regular phone once a telephone network provider is configured.
- Use CallKit for iOS controls on Kovo-managed audio sessions, not passive access to calls in Apple's Phone app.
- Let unassisted calls work with capture off. Use a clear disclosure, affirmative consent, and immediate stop on withdrawal. In a routed call, keep audio outside the transcription path until the consent service permits both legs; fail closed if consent state is lost.
- Identify speakers by call leg where supported. Start with low-interruption prompts for unresolved objections, commitments, and deadlines. Keep those suggestions private to the host. Do not auto-message other people.
- Keep raw audio storage off by default. Do not use real calls, paid providers, or publish a build until the transport and data paths are reviewed and properly authorized.

Next milestone: reproduce the simulated flow on two iPhones, then choose a provider, verify caller ID and route restrictions, test consent and stop using explicitly approved test participants, and evaluate streaming latency before promising live coaching.
