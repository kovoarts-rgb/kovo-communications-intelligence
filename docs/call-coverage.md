# Call coverage: what we can support

Kovo Communications Intelligence is meant to offer private suggestions during a call, with participants told that their speech is being processed and able to opt out. The first build is for calls joined through this app, not for eavesdropping on audio from other apps.

| Call type | Proposed approach | Status |
| --- | --- | --- |
| Kovo call link on iPhone or desktop | WebRTC in an HTTPS browser session. Label each peer's words by call role; speech-to-text is a separate capability from the audio connection. | First implementation. Test real devices and network traversal before broad use. |
| Regular phone number or incoming cellular call | Route the call through a number/service we control, disclose processing, and keep the two call legs separate. | Future. Not an overlay on iPhone Phone.app. Providers can charge for the number, minutes and transcription. |
| Personal WhatsApp or FaceTime on iPhone | No verified integration exposes another iPhone app's live call audio to Kovo Communications Intelligence. | Unsupported in the prototype. |
| Google Meet | Use its own live assistant where eligible, or test a clearly disclosed desktop companion for supported call configurations. | No live Meet integration. Google closed its Meet Media API preview to new signups and says the endpoints shut down January 15, 2027. |
| Calls on a Mac | Test macOS's user-approved app audio and separate microphone capture with each specific calling app. System settings, app behavior and OS version matter. | Research only. No compatibility or recording is claimed. |

A Home Screen install does not grant access to native call audio. For calls where a compatible, consented integration is unavailable, the app cannot analyze the conversation live. Real coverage testing must separately verify source attribution for both voices, connection loss, echo, overlapping speech, and revocation.

## Primary technical references

- [Apple DTS: the app controlling a call owns access to its audio](https://developer.apple.com/forums/thread/835552)
- [W3C WebRTC](https://www.w3.org/TR/webrtc/)
- [Apple: separate system audio and microphone streams on Mac](https://developer.apple.com/videos/play/wwdc2024/10088/)
- [Google Meet developer updates](https://developers.google.com/workspace/meet/release-notes)
- [Google's own Ask Gemini feature on iPhone](https://support.google.com/meet/answer/16024610?co=GENIE.Platform%3DiOS&hl=en)
- [Example of a routed call audio service](https://www.twilio.com/docs/voice/media-streams)
