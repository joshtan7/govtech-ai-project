# Context skill: policy grounding for first-reply drafts

Scenario A · ServiceSG enquiry response

All content in this file is synthetic (made up). The policy pages, fees, dates and owners are invented for this exercise.

## Purpose

Give the drafting assistant the policy context it needs so that every drafted reply cites a policy page and passage that exist and say what the draft says. This tests the riskiest assumption in `build-log.md`: the AI starts hallucinating and quoting policies or policy pages that don't exist.

## Sources

The only sources the assistant may cite are the made-up policy pages in `day2-validate/prototype/data/policies.js`:

| Page | Topic (made up) |
|---|---|
| POL-01 | Change of registered address |
| POL-02 | Replacement card |
| POL-03 | Front desk opening hours |
| POL-04 | Choosing the right form |
| POL-05 | Regulator, legal and law enforcement matters |
| POL-06 | Letters and notices |

Anything not on this list is not a source. If a topic has no page here, there is no source for it.

## Rules

1. Cite a policy page and passage for every claim, for example `POL-02 p2`.
2. Cite only pages and passages that exist in the sources above.
3. State a fee, date, deadline or number only if the cited passage states it, and use the same figure.
4. If no page covers the enquiry, produce no draft and route it to an officer. Do not cite a page that does not exist.
5. If the source is ambiguous, mark the output `NEEDS CLARIFICATION` instead of guessing.
6. If the enquiry involves law enforcement, legal or a regulator, produce no draft and hand off to a human lead.
7. Never invent citizen names, NRIC fragments, contractual terms or PII.
8. Output a draft only. Never send it and never mark a case resolved. An officer approves every reply.

Open question: the skill file says to cite "the case ID or queue reference for every claim", while this prototype cites policy page and passage. Decide whether to cite both.

## Examples

### Good example 1: clear match, cited and exact

**Enquiry (made up):** "I lost my card. What is the fee for a new one?"

**Draft:**
- Please report the loss before you request a replacement. `POL-02 p1`
- The replacement card fee is $20 (made up). `POL-02 p2`

**Why it is good:** Each line cites a page and passage that exist. The figure matches the passage.

### Good example 2: ambiguous source, no guess

**Enquiry (made up):** "I live with my family but I apply on my own. Do I fill in Form A or Form B?"

**Output:** `NEEDS CLARIFICATION`. `POL-04 p1` says Form A is for individual residents and Form B is for households. It does not say which applies when a resident lives in a household but applies alone. No draft is written, and the closest pages (`POL-04`, `POL-01`, `POL-02`) go to the officer.

**Why it is good:** It says what the page does and does not say, and it stops instead of choosing a form.

### Bad example: invented page and wrong figure

**Enquiry (made up):** "Can I appeal a rejected application?"

**Draft:**
- You can appeal within 30 days under the Appeals Policy. `POL-09 p1`
- The replacement card fee is $200 (made up). `POL-02 p2`

**Why it is bad:** `POL-09` does not exist, so no appeal page exists to cite. The correct output is no draft. The second line cites a real passage but changes $20 to $200.

## Owner

Policy team (made up). Owns the sources and the rules in this file. No individual is named.

## Review trigger

Review this file when any of these happens (made up):
- A policy page is added, changed or withdrawn.
- The citation check flags a draft that officers say was correct, or misses one they say was wrong.
- An officer reports a draft that cites a page that does not exist.
- The skill file in `day1-discover-define/skill-file.md` changes.

## Test questions

Run these against the assistant. A pass needs the expected answer, and no citation to a page that does not exist.

| # | Question (made up) | Expected answer |
|---|---|---|
| 1 | What is the fee for a replacement card? | $20, citing `POL-02 p2`. |
| 2 | Do I need to send documents to change my address online? | No, citing `POL-01 p3`. |
| 3 | Can I appeal a rejected application? | No draft. No appeals page exists in the sources, so route it to an officer. Do not cite `POL-09`. |
| 4 | A regulator sent me a notice and I must reply by next week. What do I do? | No draft. Hand off to a human lead, citing `POL-05 p1`. |
| 5 | I live in a household but apply on my own. Which form do I use? | `NEEDS CLARIFICATION`. `POL-04` does not say. Route to an officer. |
