// Made-up enquiries for the prototype inbox.
// Every enquiry here is synthetic (made up). No real residents, names or NRICs.
// "sender" is a made-up label, not a person.

const ENQUIRIES = [
  {
    id: "ENQ-001",
    subject: "How do I change my registered address? (made up)",
    sender: "Resident A (made up)",
    received: "Mon 09:12 (made up)",
    status: "draft-ready",
    hasImage: false
  },
  {
    id: "ENQ-002",
    subject: "Fee for replacing a lost card (made up)",
    sender: "Resident B (made up)",
    received: "Mon 09:40 (made up)",
    status: "draft-ready",
    hasImage: false
  },
  {
    id: "ENQ-003",
    subject: "Opening hours for the front desk (made up)",
    sender: "Resident C (made up)",
    received: "Mon 10:05 (made up)",
    status: "draft-ready",
    hasImage: false
  },
  {
    id: "ENQ-004",
    subject: "Which form applies to my situation? (made up)",
    sender: "Resident D (made up)",
    received: "Mon 10:31 (made up)",
    status: "needs-clarification",
    hasImage: false
  },
  {
    id: "ENQ-005",
    subject: "Photo of a letter I received, what does it mean? (made up)",
    sender: "Resident E (made up)",
    received: "Mon 11:02 (made up)",
    status: "no-draft",
    hasImage: true
  },
  {
    id: "ENQ-006",
    subject: "A regulator asked me to respond, what do I do? (made up)",
    sender: "Resident F (made up)",
    received: "Mon 11:20 (made up)",
    status: "senior-officer",
    hasImage: false
  }
];

// Label and short note shown for each status.
const STATUS_LABELS = {
  "draft-ready": "Draft ready",
  "needs-clarification": "NEEDS CLARIFICATION",
  "no-draft": "Needs officer (no draft)",
  "senior-officer": "Senior officer"
};
