# Kovo Communications Intelligence: iPhone pilot source

A native SwiftUI shell, not a shipping app or functioning call intelligence service.

## Included
- Minimal white/navy iPhone layout.
- System one-off Contacts picker. No broad address-book authorization, enumeration, upload, or persistence.
- Manual number entry; deliberate Call button and confirmation before handing a sanitized `tel:` URL to Phone. The operating system controls its own subsequent confirmation/UI. Normal calls are never transcribed or monitored by this app.
- Separately labeled fictional Assist simulation. Two explicitly simulated permissions are required. Cancellation, revocation, navigation away, or app backgrounding stops pending updates and clears transcript/prompts.
- All examples are scripted locally. No microphone, recording, backend, provider, credentials, analytics, or paid services.

## Build prerequisites
Generate the project using XcodeGen (`xcodegen generate` in this directory), then open the generated Xcode project in Xcode, choose your signing team and an iPhone simulator. XcodeGen and Xcode must already be installed through an approved setup; neither was installed by this work. iOS 17+ target. The build tools run on a development Mac, but the product is iPhone-only; there is no Mac client.

This source was authored in Linux without Swift/Xcode and has **not been compiled, installed, or tested on an iPhone**. No real phone call was placed. Verify in Xcode before treating it as runnable.

## Safe review checklist
1. Inspect simulation in an iPhone simulator without selecting real contacts or dialing.
2. Start remains disabled until both demo permissions are on.
3. Turn either permission off during the two-second script delay; output must clear and no late message may appear.
4. Background and reopen; permission switches are reset and no simulation remains.
5. Cancel the normal-call confirmation; no URL should be opened.
6. Actual contact/dial checks require the owner's separate test direction; do not call a real person merely to test.

## Explicit limitations
No CallKit, VoIP transport, real transcription, speaker recognition, live LLM, or authentication. It cannot tap into Phone, FaceTime, WhatsApp, or other apps' audio. A real assisted-call product needs an authorized calling path, truthful consent/recording notices, provider and retention decisions, and device testing. The demo toggles are not evidence of real participants' consent. Contact selection does not identify transcript speakers. Do not market this source as an operational assistant.
