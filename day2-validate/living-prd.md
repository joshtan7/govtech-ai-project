# Living PRD: ServiceSG enquiry drafting assistant

Scenario A · ServiceSG enquiry response

All data, numbers and quotes here are synthetic (made up). This PRD is extracted from the code in `day2-validate/prototype/`. Where the code and an older doc disagree, the code wins and the gap is noted.

Last extracted from: `app.js` (981 lines), `data/enquiries.js`, `data/policies.js`, `data/context.js`.

---

## 1. Product overview

**What it is.** A mock of an officer's enquiry inbox. An officer opens a resident enquiry and sees a pre-written first-reply draft. Each line cites a policy page and passage, shown right below the line.

**Who it is for.** ServiceSG officers working the shared enquiry inbox.

**What it does today (in code).**
- Shows a queue of 8 made-up enquiries with search, status filter (All, To do, Done), and a topic filter (`app.js:193`).
- Shows the open case and its draft on the right. Each cited line has a confidence badge and the cited passage highlighted (`app.js:605`, `policyBlock` at `app.js:559`).
- Lets the officer Approve, Edit in place, or Restore original (`app.js:667-688`).
- Runs a citation check on every cited line. Approve is blocked while a line fails (`app.js:718-754`).
- Gives cases with no draft a reason, three closest pages and a hand-off button (`app.js:762`).
- Shows a pilot tally and a Context and tests tab (`app.js:50`, `app.js:891`).

**What it is not.** No AI model is called. No network call is made. Nothing is sent and no case is marked resolved. State lives in memory and resets on refresh. Drafts are hand-written.

**Open the prototype:** open `day2-validate/prototype/index.html` in a browser. No install.

---

## 2. Problem and riskiest assumption

**Problem (from `day1-discover-define/opportunity.md`).** Officers search policy pages before they can reply, so first replies run well past the one-day target. Made-up evidence: 72% answered within SLA, 3 days average first reply, 12 minutes per policy search.

**Hypothesis.** Officers will send an AI-drafted first reply after a light edit when every draft cites the policy page it used.

**Riskiest assumption tested in this prototype (`build-log.md`).** The AI starts hallucinating and quoting policies or policy pages that do not exist.
- Risk type: technical.
- Kill switch: if the check cannot flag a made-up fake citation before an officer can approve it, stop and rethink.

**A second risk, not tested here (`opportunity.md`).** Value risk: officers trust a cited draft enough to edit it instead of starting over. The prototype only records this in the tally. No officer has used it.

**What the code actually tests.** The check logic, on three planted fakes (see section 4). It does not test whether a model would invent policy, because no model is called.

---

## 3. User flow and screen map

### Screens

| Screen | Where in code | What the officer sees |
|---|---|---|
| Cases tab | `renderWorkspace`, `app.js:179` | Pilot tally on top. Queue on the left, open case on the right. |
| Queue | `renderQueue`, `refreshQueue`, `app.js:193-293` | Search box, All/To do/Done chips, topic dropdown with counts, one row per case with tags (topic, status, confidence, Image, Citation check, Lookup failed, Retrying, Edited, outcome). |
| Case with draft | `renderDraft`, `app.js:605` | Watermark "DRAFT · for officer review · not sent", overall confidence, check banner, draft lines with citations, Approve, Edit, Restore original. |
| Case with no draft | `renderHandoff`, `app.js:762` | Why there is no draft, three closest policy pages, one hand-off button. |
| Lookup problem | `renderLookupProblem`, `app.js:489` | Draft hidden. Message, a text box whose contents are kept, Retry. After 2 failures, a hand-off button. |
| Context and tests tab | `renderContext`, `app.js:891` | Purpose, 5 test questions with pass or fail, sources, 8 rules, owner, review triggers, open question. |

### Main flow

1. Officer opens a case (click, or J and K keys). The first-open time is recorded (`app.js:144`).
2. The lookup runs. A normal lookup passes at once. If the facilitator control is on and the case mentions a fee, it fails (`app.js:429-443`).
3. If the lookup failed, the draft stays hidden. The officer can type their own text, retry, or after two failures hand off.
4. If the lookup is fine, the draft shows with the citation check already run.
5. Officer reads each line next to its highlighted passage, and may click Edit and change lines.
6. The check re-runs on every keystroke. If any line fails, Approve is disabled. The officer fixes the line, removes it, or (when a cited page does not exist) hands off.
7. Approve records an outcome: approved as is, light edit, or heavy rewrite. The queue marks the case done and offers the next open case.

### No-draft flow

An officer reads the reason and the closest pages, then clicks "I will take this one" or "Hand off to senior officer". The outcome is "handed off".

### The 8 made-up cases

| Case | Topic | Path |
|---|---|---|
| ENQ-001 | Address change | Clean draft |
| ENQ-002 | Replacement card | Clean draft. One line at 82% confidence, so dotted underline |
| ENQ-003 | Opening hours | Clean draft |
| ENQ-004 | Choosing a form | No draft, NEEDS CLARIFICATION |
| ENQ-005 | Letters (has image) | No draft, image unreadable |
| ENQ-006 | Regulator and legal | No draft, senior officer |
| ENQ-007 | none (shows as Other) | Draft cites POL-09, which does not exist (planted) |
| ENQ-008 | Replacement card | Draft states $200 against $20, and cites passage p7, which does not exist (planted) |

---

## 4. Success metrics

### Targets from earlier docs

| Metric | Target | Source |
|---|---|---|
| Drafts sent as is or after a light edit | 7 in 10 pass, below 5 in 10 fail (made up) | `opportunity.md`, tally card in `app.js:77` |
| Accept-as-is rate | 6 in 10 by end of pilot (made up) | `ai-ux-flow.md` |
| First action within 30 seconds | stuck over 30s is a kill-switch signal (made up) | `opportunity.md` |
| Check flags the planted fakes | all 3 flagged, 0 false alarms | `build-log.md` |

The two targets for "sent as is" disagree (7 in 10 against 6 in 10, and one includes light edits while the other does not). Decide which one the pilot uses.

### What the code measures

| Tally card | How it is computed | Caveat |
|---|---|---|
| Approved as is / Light edit / Heavy rewrite | `approveDraft`, `app.js:818`. Same text is as-is. More than half the words new (`changedShare`, `app.js:802`) is a heavy rewrite. Otherwise light. | The 50% line is a rough rule and unvalidated. |
| Handed off | Hand-off buttons. | Counts all hand-off routes together. |
| First action over 30s | `secondsSinceOpen` at the moment of Approve or hand-off. | Measures time to decision, not time to first action. Clicking Edit is not tracked. Time spent on other cases counts. |
| Check flags the fakes | `checkStats`, `app.js:411`. Self-test on load. | Currently 3 of 3, 0 false alarms, by construction. |
| Fakes fixed before approval | Cases with `hadProblem` set. | Also counts hand-offs on ENQ-007 (`app.js:695`), not only fixes. |
| Lookup attempts failed | Counter. | Only moves when the facilitator control is on. |
| Sent as is or after light edit | Light plus as-is, out of drafted. | The label says "sent" but nothing is sent. |

The tally resets on refresh, so it cannot collect pilot data on its own.

---

## 5. Technical reality

**Stack.** Plain HTML, CSS and JavaScript. No framework, no build, no tests, no dependencies. Four script tags load globals in order: `policies.js`, `enquiries.js`, `context.js`, `app.js`.

**State.** One `state` object in `app.js:4`. Holds the open case, edits, removed lines, lookup status, typed text, results and filters. Nothing persists.

**The citation check (`checkLine`, `app.js:375`).** The only logic that could carry into a real system. For each cited line:
1. The cited policy page must exist.
2. The cited passage must exist on that page.
3. Every number in the line must appear in the cited passage.

It runs live as the officer edits (`refreshDraftChecks`, `app.js:718`) and gates Approve in two places (button disabled, and `approveDraft` returns early).

**What the check cannot do.**
- Lines with `cite: null` are never checked, including lines an officer adds or rewrites.
- Words are not compared. "Closed on public holidays" where the page says open would pass.
- Numbers written as words ("two days") pass.
- It checks that a citation exists, not that it is relevant. Removing the fake POL-09 line from ENQ-007 leaves "Individual residents use Form A", a real citation that does not answer an appeal question.

**Fake data in the logic.**
- Confidence scores are hard-coded per line. The three planted fakes score 95, 95 and 93, so confidence does not predict them.
- `CONFIDENCE_THRESHOLD = 90` (`enquiries.js:23`) only drives the dotted underline. The rule "drafts start only at 90% overall" is not enforced in code. No-draft cases are set by hand.
- The Context tests (`runContextTest`, `app.js:839`) read the pre-written drafts and status fields. "4 of 5 pass" shows the data was written to match, not that an assistant behaves that way.
- Test scaffolding (`planted`, `forceFail`) sits inside the production paths.

**Sync debt.** `data/context.js` is a hand copy of `context-skill.md`. Policy pages in `policies.js` stand in for a real policy source.

**Other known code issues.**
- Approve works on an empty or blank draft.
- J and K keys still fire when a dropdown is focused.
- "Next open case" ignores the active filter, while Next and Previous respect it.
- `render()` can start timers through `ensureLookup`.
- The `app.js` header comment ("Two screens") is out of date.
- The README does not mention the topic filter, the lookup-failure simulation or the facilitator control.

---

## 6. Assumptions and risks

| # | Assumption or risk | Status | Evidence |
|---|---|---|---|
| 1 | A check can flag made-up citations before an officer approves | Holds on 3 planted cases | `checkStats`, 3 of 3 and 0 false alarms |
| 2 | A real model's errors look like the planted ones | Untested | No model is called |
| 3 | Officers read warnings and fix or remove flagged lines | Untested | No officer has used it |
| 4 | Officers edit a cited draft instead of rewriting it | Untested | Tally exists, no pilot data |
| 5 | Removing a flagged line leaves a safe reply | **Risk, likely false** | ENQ-007 leaves a real but irrelevant cited line |
| 6 | Uncited lines are low risk | **Risk** | Not checked, and an officer edit can add one |
| 7 | A wrong claim in words is rare | **Risk, known gap** | Admitted in `build-log.md` |
| 8 | Confidence signals which lines to distrust | **Risk, contradicted** | Planted fakes score 93 to 95% |
| 9 | Officers can read images | **Risk, known gap** | ENQ-005 is hand-off only. 1 in 5 enquiries have an image (made up) |
| 10 | Policy pages stay current | Open | Each page shows "last updated" and owner. No process to keep the library in sync |
| 11 | Cite policy page, or case ID, or both | Open question | `skill-file.md` says case ID, the prototype cites page and passage |
| 12 | The 30-second and 50%-new-words rules reflect real effort | Unvalidated | Rough rules in code |

---

## 7. In and out of scope

### In scope (built and working in the prototype)
- Queue with search, status filter, topic filter and keyboard navigation.
- Draft view with inline citations, highlighted passages, confidence badges and watermark.
- Citation check on page, passage and numbers, with Approve blocked and "Remove this line".
- Edit in place, Restore original, edits kept across cases.
- No-draft cases with reason, closest pages and hand-off.
- Lookup-failure handling: draft hidden, officer text kept, retry, hand-off.
- Pilot tally and Context and tests tab.

### Out of scope (deliberately not built)
- Any AI model or retrieval.
- Sending replies, marking cases resolved, or any network call.
- Reading images.
- Real policy content, real residents or any real data.
- Accounts, roles, audit log, persistence across refresh.
- Logging officer edits to a back end (`ai-ux-flow.md` step 4 describes it, the prototype does not do it).

### Not yet decided
- Which "sent as is" target the pilot uses.
- Whether to cite the case ID as well as the policy page.
- What happens to a draft after a hand-off.

---

## 8. Engineering recommendation

**Verdict.** Do not build the full product on this prototype. It validates an officer interface and one check, not an assistant. Build the next step as a small test with a real model and real officers, still on synthetic data.

**Keep.**
- The check-before-approve gate (`checkLine` and the Approve block).
- The no-draft and hand-off rules.
- The lookup-failure behaviour that keeps the officer's text.
- The edit-effort classification, once the threshold is validated.

**Fix before any pilot, in order.**
1. Replace the hand-written drafts with real model output and measure how often a cited line is not supported by its page. This is the real test of the riskiest assumption.
2. Check uncited lines and edited lines. At minimum, warn when an officer adds a claim with no citation.
3. After "Remove this line", re-check that the remaining draft still answers the enquiry, or force a hand-off.
4. Add one non-numeric check, for example a passage-text match, so a words-only misstatement can be caught.
5. Fix the metrics so each label matches what is measured: time to first action, fixes separate from hand-offs, and a rename for "sent".
6. Persist the tally and officer edits, so a pilot produces data.
7. Decide the single "sent as is" target and the citation format (open items in sections 4 and 6).

**Cleanup.** Split `app.js` into modules, separate test scaffolding from production paths, add automated tests for `checkLine` and `changedShare`, generate `context.js` from `context-skill.md`, and update the README and header comments.

**Next test.** Run 5 to 10 officers through the 8 cases plus fakes the check cannot catch. Record whether they fix, remove, or approve flagged lines, and whether they notice an uncaught error.

**Stop condition (from `build-log.md`).** If a real model produces fake citations the check cannot flag before approval, stop and rethink before building further.
