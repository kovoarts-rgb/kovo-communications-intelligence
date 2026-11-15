import Foundation
import Combine

struct DemoLine: Identifiable {
    let id = UUID()
    let speaker: String
    let text: String
}

@MainActor
final class DemoSession: ObservableObject {
    @Published private(set) var active = false
    @Published private(set) var lines: [DemoLine] = []
    @Published private(set) var suggestion: String?
    private var task: Task<Void, Never>?
    private var runID = UUID()

    func start(ownerConsent: Bool, guestConsent: Bool) {
        guard ownerConsent && guestConsent else { stop(); return }
        stop()
        active = true
        let id = UUID()
        runID = id
        task = Task { [weak self] in
            let script = [
                DemoLine(speaker: "Guest · fictional", text: "We need a first draft soon, but the budget is not final."),
                DemoLine(speaker: "You · fictional", text: "What would make that first draft useful?"),
                DemoLine(speaker: "Guest · fictional", text: "A clear outline and a list of information we still need.")
            ]
            for line in script {
                do { try await Task.sleep(for: .seconds(2)) } catch { return }
                guard !Task.isCancelled, let self, self.active, self.runID == id else { return }
                self.lines.append(line)
                self.suggestion = "Ask: ‘What date should we aim for, and who approves the outline?’"
            }
        }
    }
    func stop() {
        task?.cancel()
        task = nil
        runID = UUID()
        active = false
        lines = []
        suggestion = nil
    }
}

func normalizedPhone(_ raw: String) -> String? {
    let allowed = CharacterSet(charactersIn: "+0123456789 ()-.")
    guard raw.unicodeScalars.allSatisfy({ allowed.contains($0) }) else { return nil }
    let clean = raw.filter { "+0123456789".contains($0) }
    let digits = clean.filter { "0123456789".contains($0) }
    guard (3...15).contains(digits.count),
          clean.filter({ $0 == "+" }).count <= 1,
          !clean.contains("+") || clean.first == "+" else { return nil }
    return clean
}
