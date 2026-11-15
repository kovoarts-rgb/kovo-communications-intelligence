import SwiftUI

struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var demo = DemoSession()
    @State private var phone = ""
    @State private var name = ""
    @State private var picker = false
    @State private var confirmCall = false
    @State private var pendingNumber = ""
    @State private var error: String?
    @State private var ownerConsent = false
    @State private var guestConsent = false
    private let navy = Color(red: 0.05, green: 0.12, blue: 0.23)

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 26) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("KOVO").font(.caption.weight(.bold)).tracking(4)
                        Text("Communications\nIntelligence").font(.largeTitle.weight(.semibold))
                        Text("A clearer conversation.").foregroundStyle(.secondary)
                    }
                    VStack(alignment: .leading, spacing: 16) {
                        Label("Normal phone call", systemImage: "phone")
                            .font(.title3.weight(.semibold))
                        Text("Calls open in your iPhone’s Phone app. This prototype does not listen, record, or provide assistance during those calls.")
                            .font(.subheadline).foregroundStyle(.secondary)
                        Button("Choose one contact", systemImage: "person.crop.circle.badge.plus") { picker = true }
                        if !name.isEmpty { Text(name).font(.subheadline.weight(.medium)) }
                        TextField("Or enter a phone number", text: $phone)
                            .keyboardType(.phonePad).textContentType(.telephoneNumber)
                            .padding().background(.white, in: RoundedRectangle(cornerRadius: 14))
                        Button {
                            guard let number = normalizedPhone(phone) else { return }
                            pendingNumber = number
                            confirmCall = true
                        } label: {
                            Text("Call normally").frame(maxWidth: .infinity).padding(6)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(normalizedPhone(phone) == nil || demo.active)
                        Text("Only the number you choose is passed to Phone when you confirm. Nothing is uploaded or saved by this app.")
                            .font(.caption).foregroundStyle(.secondary)
                    }.padding(22).background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 24))

                    VStack(alignment: .leading, spacing: 16) {
                        Text("SIMULATED ASSIST").font(.caption.weight(.bold)).tracking(2)
                        Text("Try the live-coaching experience").font(.title2.weight(.semibold))
                        Text("Fictional speakers. Scripted suggestions. No call, microphone, recording, or AI service. These switches simulate each person’s permission; they cannot grant permission for a real person.")
                            .font(.subheadline).foregroundStyle(.secondary)
                        Toggle("Your permission · demo", isOn: $ownerConsent)
                        Toggle("Guest’s permission · demo", isOn: $guestConsent)
                        if demo.active {
                            Button("Stop and clear simulation", role: .destructive) { endDemo() }
                        } else {
                            Button("Start fictional conversation") {
                                demo.start(ownerConsent: ownerConsent, guestConsent: guestConsent)
                            }.buttonStyle(.borderedProminent)
                                .disabled(!ownerConsent || !guestConsent)
                        }
                        ForEach(demo.lines) { line in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(line.speaker).font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                                Text(line.text)
                            }.frame(maxWidth: .infinity, alignment: .leading)
                                .padding(16).background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 16))
                        }
                        if let suggestion = demo.suggestion {
                            VStack(alignment: .leading, spacing: 8) {
                                Label("Private prompt · scripted demo", systemImage: "sparkles").font(.caption.weight(.semibold))
                                Text(suggestion)
                            }.padding(18).frame(maxWidth: .infinity, alignment: .leading)
                                .foregroundStyle(.white).background(navy, in: RoundedRectangle(cornerRadius: 20))
                        }
                    }
                    Text("Revoking either demo permission immediately stops and clears the simulation. Leaving the app does the same.")
                        .font(.caption).foregroundStyle(.secondary)
                }.padding(24)
            }.background(.white).foregroundStyle(navy).tint(navy)
                .toolbar {
                    ToolbarItemGroup(placement: .keyboard) {
                        Spacer()
                        Button("Done") { UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil) }
                    }
                }
        }
        .sheet(isPresented: $picker) {
            ContactPicker { selectedName, selectedPhone in
                name = selectedName; phone = selectedPhone; picker = false
            }
        }
        .alert("Open Phone and call?", isPresented: $confirmCall) {
            Button("Cancel", role: .cancel) { pendingNumber = "" }
            Button("Continue to Phone") {
                guard let number = normalizedPhone(pendingNumber),
                      let url = URL(string: "tel:\(number)") else { return }
                UIApplication.shared.open(url, options: [:]) { success in
                    if !success { Task { @MainActor in error = "Phone could not open on this device." } }
                }
                pendingNumber = ""
            }
        } message: { Text("\(pendingNumber)\nThis is a normal call, without AI assistance or recording. Carrier charges may apply.") }
        .alert("Unable to open Phone", isPresented: Binding(get: { error != nil }, set: { if !$0 { error = nil } })) {
            Button("OK") { error = nil }
        } message: { Text(error ?? "") }
        .onChange(of: ownerConsent) { _, consent in if !consent { demo.stop() } }
        .onChange(of: guestConsent) { _, consent in if !consent { demo.stop() } }
        .onChange(of: scenePhase) { _, phase in if phase != .active { endDemo() } }
        .onDisappear { endDemo() }
    }

    private func endDemo() {
        demo.stop()
        ownerConsent = false
        guestConsent = false
    }
}
