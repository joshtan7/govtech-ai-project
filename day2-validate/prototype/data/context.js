// Context for the drafting assistant, copied from day2-validate/context-skill.md.
// All content is synthetic (made up). If context-skill.md changes, update this file to match.

const CONTEXT = {
  purpose: "Give the drafting assistant the policy context it needs so that every drafted reply cites a policy page and passage that exist and say what the draft says.",

  rules: [
    "Cite a policy page and passage for every claim, for example POL-02 p2.",
    "Cite only pages and passages that exist in the sources.",
    "State a fee, date, deadline or number only if the cited passage states it, and use the same figure.",
    "If no page covers the enquiry, produce no draft and route it to an officer. Do not cite a page that does not exist.",
    "If the source is ambiguous, mark the output NEEDS CLARIFICATION instead of guessing.",
    "If the enquiry involves law enforcement, legal or a regulator, produce no draft and hand off to a human lead.",
    "Never invent citizen names, NRIC fragments, contractual terms or PII.",
    "Output a draft only. Never send it and never mark a case resolved. An officer approves every reply."
  ],

  owner: "Policy team (made up). Owns the sources and the rules. No individual is named.",

  reviewTriggers: [
    "A policy page is added, changed or withdrawn.",
    "The citation check flags a draft that officers say was correct, or misses one they say was wrong.",
    "An officer reports a draft that cites a page that does not exist.",
    "The skill file in day1-discover-define/skill-file.md changes."
  ],

  openQuestion: "The skill file says to cite the case ID or queue reference for every claim, while this prototype cites policy page and passage. Decide whether to cite both.",

  // Five test questions. "enquiry" is the prototype case that stands in for the question.
  tests: [
    {
      question: "What is the fee for a replacement card?",
      expected: "$20, citing POL-02 p2.",
      enquiry: "ENQ-002",
      expect: { kind: "cites", policy: "POL-02", passage: "p2", text: "$20" }
    },
    {
      question: "Do I need to send documents to change my address online?",
      expected: "No, citing POL-01 p3.",
      enquiry: "ENQ-001",
      expect: { kind: "cites", policy: "POL-01", passage: "p3", text: "do not need" }
    },
    {
      question: "Can I appeal a rejected application?",
      expected: "No draft. No appeals page exists in the sources, so route it to an officer. Do not cite POL-09.",
      enquiry: "ENQ-007",
      expect: { kind: "no-draft" }
    },
    {
      question: "A regulator sent me a notice and I must reply by next week. What do I do?",
      expected: "No draft. Hand off to a human lead, citing POL-05 p1.",
      enquiry: "ENQ-006",
      expect: { kind: "no-draft", closestFirst: "POL-05" }
    },
    {
      question: "I live in a household but apply on my own. Which form do I use?",
      expected: "NEEDS CLARIFICATION. POL-04 does not say. Route to an officer.",
      enquiry: "ENQ-004",
      expect: { kind: "no-draft", status: "needs-clarification", closestFirst: "POL-04" }
    }
  ]
};
