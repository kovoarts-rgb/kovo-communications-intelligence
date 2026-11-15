import SwiftUI
import Contacts
import ContactsUI

// The system picker returns only the property deliberately selected by the user.
// No CNContactStore enumeration, permission request, persistence, or upload.
struct ContactPicker: UIViewControllerRepresentable {
    var onSelect: (String, String) -> Void
    func makeCoordinator() -> Coordinator { Coordinator(onSelect: onSelect) }
    func makeUIViewController(context: Context) -> CNContactPickerViewController {
        let picker = CNContactPickerViewController()
        picker.delegate = context.coordinator
        picker.displayedPropertyKeys = [CNContactPhoneNumbersKey]
        picker.predicateForEnablingContact = NSPredicate(format: "phoneNumbers.@count > 0")
        picker.predicateForSelectionOfContact = NSPredicate(value: false)
        picker.predicateForSelectionOfProperty = NSPredicate(format: "key == %@", CNContactPhoneNumbersKey)
        return picker
    }
    func updateUIViewController(_ controller: CNContactPickerViewController, context: Context) {}
    final class Coordinator: NSObject, CNContactPickerDelegate {
        let onSelect: (String, String) -> Void
        init(onSelect: @escaping (String, String) -> Void) { self.onSelect = onSelect }
        func contactPicker(_ picker: CNContactPickerViewController, didSelect property: CNContactProperty) {
            guard let phone = property.value as? CNPhoneNumber else { return }
            let name = CNContactFormatter.string(from: property.contact, style: .fullName) ?? "Selected contact"
            onSelect(name, phone.stringValue)
        }
    }
}
