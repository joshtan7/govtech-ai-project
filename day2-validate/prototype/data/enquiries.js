// Made-up enquiries and pre-written drafts for the prototype.
// Every enquiry here is synthetic (made up). No real residents, names or NRICs.
// Drafts are pre-written. No AI model is called.
//
// draft: lines of the reply. cite = { policy, passage } or null (greeting/closing only).
// confidence: made-up score (0 to 100) for a cited line. Below CONFIDENCE_THRESHOLD is flagged.
// closest: the three closest policy pages, shown when there is no draft.

// Drafts start only at or above this overall confidence (made up).
const CONFIDENCE_THRESHOLD = 90;

const ENQUIRIES = [
  {
    id: "ENQ-001",
    subject: "How do I change my registered address? (made up)",
    sender: "Resident A (made up)",
    received: "Mon 09:12 (made up)",
    status: "draft-ready",
    hasImage: false,
    body: "Hi, I have moved house. How do I update my address with you, and do I need to send any documents? (made up)",
    draft: [
      { text: "Thank you for your enquiry about changing your registered address.", cite: null },
      { text: "You can update your registered address online through the Resident Portal.", cite: { policy: "POL-01", passage: "p1" }, confidence: 97 },
      { text: "The change takes effect on the next working day after you submit it.", cite: { policy: "POL-01", passage: "p2" }, confidence: 95 },
      { text: "You do not need to upload supporting documents for an online change.", cite: { policy: "POL-01", passage: "p3" }, confidence: 93 }
    ]
  },
  {
    id: "ENQ-002",
    subject: "Fee for replacing a lost card (made up)",
    sender: "Resident B (made up)",
    received: "Mon 09:40 (made up)",
    status: "draft-ready",
    hasImage: false,
    body: "I lost my card. What is the fee for a new one and how long will it take? (made up)",
    draft: [
      { text: "Thank you for your enquiry about replacing a lost card.", cite: null },
      { text: "Please report the loss before you request a replacement.", cite: { policy: "POL-02", passage: "p1" }, confidence: 96 },
      { text: "The replacement card fee is $20 (made up).", cite: { policy: "POL-02", passage: "p2" }, confidence: 98 },
      { text: "Replacement cards are usually posted within 7 working days (made up).", cite: { policy: "POL-02", passage: "p3" }, confidence: 82 }
    ]
  },
  {
    id: "ENQ-003",
    subject: "Opening hours for the front desk (made up)",
    sender: "Resident C (made up)",
    received: "Mon 10:05 (made up)",
    status: "draft-ready",
    hasImage: false,
    body: "What time is the front desk open? Is it open on public holidays? (made up)",
    draft: [
      { text: "Thank you for your enquiry about front desk hours.", cite: null },
      { text: "Front desks are open Monday to Friday, 9am to 5pm (made up).", cite: { policy: "POL-03", passage: "p1" }, confidence: 99 },
      { text: "Front desks are closed on public holidays.", cite: { policy: "POL-03", passage: "p2" }, confidence: 94 }
    ]
  },
  {
    id: "ENQ-004",
    subject: "Which form applies to my situation? (made up)",
    sender: "Resident D (made up)",
    received: "Mon 10:31 (made up)",
    status: "needs-clarification",
    hasImage: false,
    body: "I live with my family but I apply on my own. Do I fill in Form A or Form B? (made up)",
    note: "The policy page does not say which form applies when a resident lives in a household but applies alone. No draft was written.",
    closest: ["POL-04", "POL-01", "POL-02"]
  },
  {
    id: "ENQ-005",
    subject: "Photo of a letter I received, what does it mean? (made up)",
    sender: "Resident E (made up)",
    received: "Mon 11:02 (made up)",
    status: "no-draft",
    hasImage: true,
    body: "I got this letter and I do not understand it. Photo attached. (made up)",
    note: "Confidence is below the threshold, so no draft was written. The attached image cannot be read by the current tools.",
    closest: ["POL-06", "POL-04", "POL-01"]
  },
  {
    id: "ENQ-006",
    subject: "A regulator asked me to respond, what do I do? (made up)",
    sender: "Resident F (made up)",
    received: "Mon 11:20 (made up)",
    status: "senior-officer",
    hasImage: false,
    body: "A regulator sent me a notice and I need to reply by next week. What should I do? (made up)",
    note: "This enquiry mentions a regulator. Policy says it goes to a human lead. No draft was written.",
    closest: ["POL-05", "POL-06", "POL-04"]
  }
];

// Label shown for each status.
const STATUS_LABELS = {
  "draft-ready": "Draft ready",
  "needs-clarification": "NEEDS CLARIFICATION",
  "no-draft": "Needs officer (no draft)",
  "senior-officer": "Senior officer"
};
