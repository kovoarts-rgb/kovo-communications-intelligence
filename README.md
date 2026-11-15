# Kovo Communications Intelligence

An iPhone-only product prototype for consent-first, one-to-one calls opened in Safari, optional speaker-labeled notes, and private rule-based coaching prompts. This is not a hosted live AI service and cannot read audio from other call apps. See the [call coverage matrix](docs/call-coverage.md) and [design brief](docs/design-brief.md).

## Runnable prototype (November 2026)

Requires Node 20 or newer. No dependencies, API keys or paid services.

```sh
npm test
npm start
# http://localhost:8787
```

No Mac or desktop companion is required to use the app on iPhone. A hosted server is still required. For iPhone access, host behind HTTPS with a reverse proxy to port 8787. Set `PORT` if needed. The proxy must preserve Host and correctly set X-Forwarded-Proto. Do not expose plain HTTP for real calls. This is a prototype, not a hardened public multi-tenant deployment. Install the PWA from the browser's Add to Home Screen menu. Open the hosted HTTPS address in Safari, tap **Share > Add to Home Screen**, and enable **Open as Web App** if shown. This GitHub repository is source code, not the hosted calling app.

### What is implemented
- Two-member capability-link room; random independent member tokens. Invite is in URL fragment, removed on joining. In-memory HTTP-polling signaling expires after one idle hour. Server restart removes rooms.
- WebRTC audio and data channel. The host initiates negotiation. Microphone enabled only by pressing its button. Calls can run with notes disabled.
- Independent bilateral note consent, local revocation, peer revocation notification, polling enforcement. Missing heartbeat revokes the absent member's consent after five seconds. Revocation stops the optional recognition, but does not end the audio call or erase notes already shared.
- Typed local statements shared on encrypted peer data channel, with host/guest provenance. Optional browser-local speech recognition with separate processing disclosure. No automatic recognition or third-party API keys. Remote track transcription is **not implemented**; the other caller must separately enable their own recognition or type notes.
- Private deterministic coaching prompts, explicitly labeled rule-based demo. Not a language model. No automatic SMS, speaking, tool execution, saved transcripts or raw audio recordings. Transcript text is rendered with text nodes, never HTML.
- Responsive UI, PWA shell cache, manifest. API/session/transcript data are not cached by the service worker.

### Limitations and next steps
- No STUN/TURN service is configured. Same-network connectivity may work; cross-network calling is not reliable without an operator-configured relay. Do not advertise universal internet calling until tested with a relay and explicit operating budget.
- Not compatible with intercepting Phone, WhatsApp, FaceTime or Meet calls. Installing the app does not change this.
- SpeechRecognition is experimental and may send local microphone audio to the browser vendor. It is final-results only, English by default, with no remote-track extraction or guaranteed speaker separation. Headphones reduce remote speech leaking into the local microphone. Host/guest is provenance, not proof of who spoke.
- No reconnect/resume: after closing or ending a call, create a new room. Consent should be renewed for each session.
- No true AI model, diarization, summaries, partial transcript correction UI, export, recording or SMS yet. Rule prompts are limited and are not factual/legal/business advice.
- Consent is application-enforced, not protection against a malicious caller recording externally. Participants should agree before discussing sensitive information.
- Automated tests use synthetic input only. No real call, microphone, speech provider or physical iPhone has been tested. Two browser tabs verified room creation, joining, bilateral consent and revocation, and a synthetic coach prompt. They did not establish a media connection in the cloud-browser environment; audio calling remains unverified.

### Synthetic tests
`npm test` checks consent gating/revocation, rule prompts, duplicate replacement/overlap, authenticated room access, two-person limit, and rejection of transcript storage on signaling API. `node --check public/app.js` checks syntax. Real-world networking and microphone behavior are not established by these tests.
