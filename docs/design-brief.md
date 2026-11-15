# Kovo Communications Intelligence: design brief

Build from public product behavior and supported standards. Do not copy Cluely code or reproduce hidden capture. iPhone is the only client target; no Mac companion. Validate Safari and Home Screen use on two physical iPhones over separate networks before calling live audio ready. No real call has been connected or tested.

## Minimum useful session
1. Host opens a one-to-one browser room and sends a join link to the other participant. Calling without the assistant remains possible.
2. Before audio processing, independently confirm both participants have opted in. All participants see a persistent active status, and either can stop processing. Do not backfill audio from before consent. Recheck if a participant reconnects with a new identity.
3. Label the local and remote speech from the separate WebRTC tracks rather than guessing by sound. For groups use one source per peer when available; merged remote audio can only provide estimated speaker segments. Do not infer names from voices.
4. Show a timestamped, speaker-tagged transcript. Show provisional text as provisional; late corrections replace existing lines. If simultaneous speech occurs, preserve both tracks. Treat transcript text as context, never as instructions or authorization for actions.
5. Use stable caller turns to propose one concise, context-grounded question when it matters: an unclear commitment, deadline without an owner, changed scope, or an unresolved objection. Give the host pause, dismiss, and Ask now. Use a cooldown and suppress repetition. Mark inferred suggestions separately from commitments. Suggestions appear only in a host-only panel; no auto-speaking, auto-sharing or texts.
6. Close with decisions, action items, and explicit deadlines stated on the call. Do not retain raw audio by default. Any saving or sending requires a separate deliberate action. Temporary transcript and suggestion retention and any model provider must be disclosed before processing.

## Test before connecting real audio
Replay two synthetic participant streams. Verify guest without consent never enters capture; revoke during a turn and confirm both providers and UI stop generating; overlapping speech retains both labels; reordered partial/final segments do not duplicate; caller instruction to send data causes no action; a repeated objection yields one suggestion, not a barrage. Then run a disclosed, non-client pilot with two consenting people and measure prompt turnaround, interruptions and label errors. No external telephony or transcription purchases are authorized for initial validation.

## Phone-number phase
Native Phone.app audio is not exposed to another third-party app. A separately routed number or outbound calling bridge could support ordinary phone numbers. Verify track attribution for each call leg, include consent before streaming, and budget provider charges. Do not call this compatible with every existing call on the user's number. The first release should prefer the panel over SMS; texts can be an explicitly opted-in, minimal-content secondary surface after testing.

## Primary sources
- Cluely public feature list: https://cluely.com/
- Apple DTS on native Phone.app audio ownership: https://developer.apple.com/forums/thread/835552
- WebRTC and media tracks: https://www.w3.org/TR/webrtc/
- Optional routed voice media streams: https://www.twilio.com/docs/voice/media-streams
