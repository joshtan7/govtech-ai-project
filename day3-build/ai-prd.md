# AI PRD: ServiceSG enquiry drafting agent

Scenario A · ServiceSG enquiry response

All data, numbers, quotes and policy pages here are synthetic (made up). Status: **draft for the learner to review**. Nothing here is decided. Every setting marked Proposed is a suggestion, and the Open decisions section lists what the learner and the policy team still choose.

## Sources used, and what was missing

- Read: `day2-validate/living-prd.md`, `day3-build/CLAUDE.md` (with the rule 6 change), `day3-build/agent-run-log.md`, `one-pager.md`, `day2-validate/context-skill.md`.
- **Not found:** `day2-validate/handoff-note.md` and `day3-build/agent-control-panel.md`. They do not exist in the repo. Nothing was invented to stand in for them. If they hold decisions, add those here.
- **`SCENARIO-PICK.md`** now says Scenario A, which matches every other file.
- `living-prd.md` is only on the open pull request #21 branch, not on `main`.

---

## Problem and user

**User.** ServiceSG enquiry officers working the shared enquiry inbox in office hours. They are busiest in the week after a policy change.

**Problem.** Officers search policy pages before they can reply. A search takes 12 minutes (made up), so the average first reply takes 3 days against a 1-working-day goal. 72% are answered within SLA (made up).

**Hypothesis.** Officers will send an AI-drafted first reply after a light edit when every draft cites the policy page it used.

**Riskiest assumption.** The AI cites policy pages or passages that do not exist, or states a figure the page does not say.

**Constraints.** An officer approves every reply. A wrong answer costs more than a slow one. Some enquiries carry images the tools cannot read (1 in 5, made up).

**What exists today.** A prototype with pre-written drafts and a citation check. No model is called and no officer has used it. See `living-prd.md` for what the code does and does not prove.

---

## Instructions

The agent reads one made-up enquiry at a time and does one of three things.

1. **Draft.** A policy page clearly covers it. Write a short reply with a citation after every claim.
2. **NEEDS CLARIFICATION.** The page is ambiguous. Write no draft. Say what the page does and does not say. List the three closest pages.
3. **Hand off.** No page covers it, or it involves law enforcement, legal or a regulator, or it has an image. Write no draft. List the reason and the three closest pages.

When unsure, choose 2 or 3. The hand-off note gives only the reason and the page ids. It answers no part of the enquiry (rule 6 as changed in `CLAUDE.md`).

The full instruction text is in `day3-build/CLAUDE.md`. This section does not repeat it. If the two differ, `CLAUDE.md` is what the agent follows, and this PRD should be updated.

---

## Tools

| Tool | What it does | Access | Source |
|---|---|---|---|
| Read enquiry | Reads one made-up enquiry | Read only | `CLAUDE.md` |
| Search policy library | Looks up pages POL-01 to POL-06 | Read only | `CLAUDE.md`, `policies.js` |
| Citation check | Page exists, passage exists, every number in the line is in the cited passage | Read only | `checkLine`, `app.js:375` |
| Write draft | Saves draft, status and citations to an output folder | Write, output folder only | `CLAUDE.md` |
| Write log | Appends one entry per enquiry | Append only | `CLAUDE.md` |

**What the check cannot do.** It does not compare words. It does not check uncited lines. It does not check a number written as a word. It does not check that a real citation answers the question. The agent and the officer still read each line against its passage.

**Not yet a tool.** Image reading, retrieval at scale, and any model call. These are engineering choices (see What engineering decides).

---

## Context and memory

**Sources the agent may cite.** Only these made-up pages. Anything else is not a source.

| Page | Topic (made up) |
|---|---|
| POL-01 | Change of registered address |
| POL-02 | Replacement card |
| POL-03 | Front desk opening hours |
| POL-04 | Choosing the right form |
| POL-05 | Regulator, legal and law enforcement matters |
| POL-06 | Letters and notices |

**Memory.**
- Within one enquiry: the enquiry, the passages read, the draft.
- Between enquiries: nothing. Each starts fresh.
- No learning from officer edits unless a person changes the rules or sources.
- Pages are read fresh each run. A remembered page may be out of date.

**Owner.** Policy team (made up). They own the sources and the rules. No individual is named.

**Drift risk.** `data/context.js` in the prototype is a hand copy of `context-skill.md`. They can differ.

---

## Permissions

Every action the agent takes is listed here. **Every setting is Proposed.** The learner decides, and the policy team confirms. Tiers: **read** (looks only), **draft** (makes text no one sees yet), **write** (changes a stored record), **send** (anything leaves the system). Settings: **auto** (agent acts), **confirm** (a person says yes first), **block** (agent cannot do it).

| # | Action | Tier | Setting (Proposed) | Why this setting is proposed |
|---|---|---|---|---|
| 1 | Read one enquiry | read | auto | Looks only. Made-up data. |
| 2 | Search the policy library | read | auto | Looks only. |
| 3 | Run the citation check on a draft line | read | auto | Looks only. It is a safety net, so skipping it is blocked (row 12). |
| 4 | Write a draft reply to the output folder | draft | auto | The officer sees it before anything happens. Nothing leaves. |
| 5 | Write a NEEDS CLARIFICATION note | draft | auto | Same as row 4. |
| 6 | Write a hand-off note (reason and page ids only) | draft | auto | Same as row 4. The content limit is a rule, not a setting. |
| 7 | Append one entry to the run log | write | auto | Append only. No log means no run. |
| 8 | Remove a flagged line from its own draft | write | confirm | It can leave a real but irrelevant citation. A person should see that it still answers the enquiry. |
| 9 | Reply to the officer in chat (answer, refusal) | draft | auto | No resident sees it. |
| 10 | Retry a failed policy lookup once | read | auto | Looks only. A second failure is a stop. |
| 11 | Send any reply to a resident or anyone | send | block | Rule 8. Only an officer approves, and the duty officer sends. |
| 12 | Skip or turn off the citation check | write | block | The check is part of how the agent works. |
| 13 | Mark a case resolved, closed or approved | write | block | Rule 8. Only an officer approves. |
| 14 | Make any network call | send | block | The prototype makes none. |
| 15 | Edit the policy library, the rules, `CLAUDE.md` or the prototype | write | block | The policy team owns these. |
| 16 | Write outside the output folder | write | block | Limits the damage of a mistake. |
| 17 | Delete or overwrite an earlier draft or log entry | write | block | The log must stay whole to be counted. |
| 18 | Read real records, credentials, tokens or `.env` files | read | block | Synthetic data only. |
| 19 | Read or interpret an image | read | block | The tools cannot read images. Hand off instead. |
| 20 | Invent a page, passage, fee, date, name or NRIC fragment | draft | block | Rules 2, 3 and 7. |

**Approve, Edit and Restore original are officer actions in the inbox, not agent actions.** They are not rows above.

---

## Human checkpoints

| When | Who | What they decide |
|---|---|---|
| Every draft | Enquiry officer | Approve, edit, restore original, or reject. No draft is final until an officer approves it. |
| NEEDS CLARIFICATION | Enquiry officer | Choose the answer, or ask the policy team. |
| No page covers it | Enquiry officer | Take the case. |
| Law enforcement, legal or regulator | Human lead | Take the case. |
| Anything citizen-facing | Duty officer | Send it. |
| Image enquiry | Enquiry officer | Open the image and handle the case. |
| A line removed by the agent (Permissions row 8, if set to confirm) | Enquiry officer | Check the draft still answers the enquiry. |
| A change to sources, rules or `CLAUDE.md` | Policy team | Review before the agent uses it. |
| The project stop line is hit | Learner and facilitator | Continue, pivot or stop. The agent only reports numbers. |

**Shown with every draft.** The cited page and passage next to each line, overall confidence, and any check warning. A flagged line stays flagged.

---

## Stop conditions

**Stop on this enquiry (hand off, no draft).**
- No page covers the enquiry.
- The source is ambiguous (NEEDS CLARIFICATION).
- Law enforcement, legal or regulator is mentioned.
- The enquiry has an image.
- Overall confidence is below 90% (made up).
- The policy lookup fails twice.
- The check flags a line that cannot be fixed with a real, supporting passage.
- After a line is removed, the draft no longer answers the enquiry.
- The enquiry looks like it holds real personal data.

**Stop everything (do not start the next enquiry).**
- The agent is about to send, mark resolved, or call out.
- A fake page or passage would reach the officer unflagged.
- The policy library is missing, empty, or changed with no log entry.
- The agent is asked to edit its own rules, sources or permissions.
- The run log cannot be written.
- A request conflicts with a rule.

**Project stop line (made up).** Any fake page or passage reaches approval, or fewer than 5 in 10 drafts are sent after a light edit. The agent cannot decide this. People do.

---

## Logs

One entry per enquiry, appended, never overwritten. Fields:

- Enquiry id and time.
- Outcome: `draft`, `needs-clarification`, `hand-off` or `stopped`.
- Why, in one plain sentence.
- Pages and passages cited, or the three closest pages.
- Citation check result and what the agent did about each flag.
- Overall confidence.
- Stop condition that fired.
- Officer decision when it comes back: as is, light edit, heavy rewrite, handed off.

Never log real names, NRIC fragments, credentials, or a resident's full message.

**Why.** The pilot combines results across at least 20 officers in at least 2 teams (made up), per officer and overall. Entries must add up.

**Sample.** `day3-build/agent-run-log.md` holds three walk-through runs and one rerun. They are not live runs. No model was called, and the citation check was applied by hand.

---

## Business rules

**From `context-skill.md` (the 8 rules).**
1. Cite a policy page and passage for every claim.
2. Cite only pages and passages that exist.
3. State a fee, date, deadline or number only if the cited passage states it, using the same figure.
4. If no page covers the enquiry, produce no draft and route it to an officer.
5. If the source is ambiguous, mark it NEEDS CLARIFICATION.
6. If it involves law enforcement, legal or a regulator, produce no draft and hand off to a human lead. The note gives only the reason and page ids.
7. Never invent names, NRIC fragments, contractual terms or PII.
8. Output a draft only. Never send it and never mark a case resolved.

**Numbers (all made up).**

| Item | Value | Source |
|---|---|---|
| Draft only at or above this confidence | 90% | `enquiries.js:23`, one-pager |
| Heavy rewrite | More than half the words are new | `app.js:802`, rough rule |
| Slow first action | Over 30 seconds | one-pager |
| Pass | 7 in 10 sent as is or after a light edit | one-pager |
| Stop | Below 5 in 10, or any fake page or passage approved | one-pager |
| Planted errors approved | Under 1 in 10 | one-pager |
| SLA | 1 working day or less, from arrival to approved reply | one-pager |

---

## What engineering decides

These are for the engineer. This PRD does not choose them.

- Which model, and how it is called.
- How the agent finds the right page (retrieval design).
- How confidence is produced. The prototype hard-codes it, and the planted fakes scored 93 to 95%.
- How the citation check is built and tested, and whether it gains a words check or an uncited-line check.
- How images are read, if ever.
- Where the draft, the log and the tally are stored, and how they survive a refresh.
- How the output folder is enforced, and how blocked actions are blocked in code.
- How a person approves, and how the officer's edits are measured. The prototype's timer measures time to decision, not time to first action.
- How the policy library stays current and who tells the agent a page changed.
- How the agent is tested, including a live test of each run in `agent-run-log.md`.
- How `context.js` stays in sync with `context-skill.md`.

---

## Open decisions

Only decision 15 is decided. The rest are open. The Recommendation column is a **Proposed** view from review, not a decision. Each decision needs a named owner. I have no recommendation for 13 because the objection is not written down.

| # | Decision | Why it matters | Recommendation (Proposed) | Who decides |
|---|---|---|---|---|
| 1 | Confirm or change every setting in Permissions. | The whole table is Proposed. | Keep all five tools as proposed (all auto). Write draft is covered by decision 15. The policy team confirms. | Learner, policy team |
| 2 | Should the agent remove a flagged line itself (row 8), or only flag it? | A removed line can leave a real but irrelevant citation. | Flag only. If a line cannot be fixed, hand off the whole draft. This changes a stop condition in `CLAUDE.md`. | Learner |
| 3 | Cite policy page and passage only, or the case ID as well? | `skill-file.md` says case ID, the prototype uses page and passage. | Page and passage only, because the check can verify them against the library. Keep the case ID in the log. | Policy team |
| 4 | A mixed enquiry (a covered question plus a regulator or police mention): is "hand off, no answer at all" right? | I read rule 6 that way. It was not confirmed. | Yes. POL-05 p1 says do not draft a reply, and a wrong answer costs more than a slow one. | Policy team |
| 5 | What to do with a claimed police or regulator caller who asks a resident for card details. | It could be a scam. The agent flags nothing. | Add one fixed line to the hand-off note, such as "caller asked the resident for details, possible scam". It answers nothing, so it does not break rule 6. Medium confidence. | Policy team |
| 6 | How is confidence produced, and is 90% the right line? | The planted fakes scored 93 to 95%. | Do not treat 90% as a safety gate. Keep it as a hint and calibrate it on the 50 test enquiries. | Learner, engineering |
| 7 | Which "sent as is" target: 7 in 10 (one-pager) or 6 in 10 (`ai-ux-flow.md`)? One counts light edits, the other does not. | The pilot needs one pass line. | 7 in 10, and drop 6 in 10. The hypothesis, metrics plan and stop line all count light edits. `ai-ux-flow.md` was not read for this. | Learner |
| 8 | Is "more than half the words are new" the right line for a heavy rewrite? | Rough and unvalidated. | Keep it for the pilot. The facilitator compares it with officers' own judgement on a sample. | Learner, facilitator |
| 9 | Where do the output folder and the run log live? `CLAUDE.md` names no paths. | The agent cannot write until it has one. | A folder in the repo for drafts, and keep `agent-run-log.md` as the log. Engineering confirms. | Learner, engineering |
| 10 | Who reads the log weekly, and what do they do with a missed fake? | Missed fakes should reach the policy team. | The facilitator reads it. Any missed fake goes to the policy team the same week. | Facilitator, policy team |
| 11 | After "Remove this line", how do we know the draft still answers the question? | The check does not look at relevance. | Goes away if decision 2 is flag only. | Learner, engineering |
| 12 | Are images in scope later? | 1 in 5 enquiries have one (made up). Out of scope now. | Out of scope for now. Revisit after the pilot. | Learner |
| 13 | How does the learner reply to the chief executive sponsor's objection? | Still unanswered in `one-pager.md`. | None. The objection is not written down. | Learner |
| 14 | Do `handoff-note.md` and `agent-control-panel.md` need to exist? | This PRD was drafted without them. `agent-control-panel.md` now exists. | `agent-control-panel.md` exists. Skip `handoff-note.md`, because the note format is in rule 6 of `CLAUDE.md`. | Learner |
| 15 | **Decided by the learner:** Write draft stays auto, and the officer alone is the check. No extra gate before a draft is written and no business owner sign-off. | Raised on review as the business owner. The only gate before a draft is written is 90% confidence, and the planted fakes scored 93 to 95%. The citation check cannot see a wrong claim in words. Whether officers approve without reading is not measured yet. The learner's reason: an officer already verifies every draft, so this follows the current business process. This holds unless the business process requires the business owner, which the learner does not think it does. **Not yet confirmed with the business owner.** The pilot still measures planted errors approved (under 1 in 10), and the stop line stands. | Decided. | Learner (decided) |
| 16 | How many empty policy lookups in a row mean the library is broken and everything stops? | `CLAUDE.md` says retry once for one enquiry only. Stress run 6. | Stop everything after 3 in a row. This number is a guess. | Learner |
| 17 | Does saving a "needs officer" note with no draft count as Write draft, or is it its own tool? | Stress runs 4 to 6 all saved a note with no draft. | Its own tool, "Write status note" (draft, auto). | Learner |
| 18 | An empty enquiry: confirm hand-off with no draft? | `CLAUDE.md` has no rule for it. Stress run 4. | Confirm hand-off. | Policy team |
| 19 | An enquiry that cites a page not in the library: confirm hand-off? | `CLAUDE.md` has no rule for it. Stress run 5. The library may be stale. | Confirm hand-off, with a note to the policy team to check the page. | Policy team |
