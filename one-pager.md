# One Pager

Use case: Scenario A · ServiceSG enquiry response. Synthetic data only.

## Problem and user

Users: ServiceSG enquiry officers working the shared enquiry inbox during office hours. They are busiest in the week after a policy change.

Problem: Officers search policy pages before they can reply, so first replies run well past the one-day target.

Goal: Residents get a correct first reply within one working day.

Constraints: An officer approves every reply. A wrong answer costs more than a slow one. Some enquiries include images the current tools cannot read.

## Opportunity and evidence

All quotes and metrics are made up.

- "I spend longer finding the right policy page than writing the reply." (made up)
- "When an enquiry has a photo, I open it and retype what it says." (made up)
Baselines and targets (all made up):

| Metric | Baseline | Target |
|---|---|---|
| Enquiries answered within SLA | 72% | 90% (proposed) |
| Average first reply | 3 days | 1 working day or less |
| Minutes per policy search | 12 | Under 3 (proposed) |
| Enquiries with an image | 1 in 5 | No target. Images are out of scope for now. |

Hypothesis: Officers will send an AI-drafted first reply after a light edit when every draft cites the policy page it used.

## Experience and trust

Moment: An officer opens an enquiry and sees a drafted first reply.

- The officer sees the draft, a citation on each cited line, the policy page open below it, and a confidence score. Buttons: Approve, Edit, Restore original.
- Approve records the decision only. Nothing is sent and no case is marked resolved.
- Below 90% confidence (made up), no draft is written. The enquiry goes to an officer with the closest policy pages.
- Trust gaps: black box (an inline citation on every claim), hallucination (a citation check that blocks Approve), control (restore original, edit in place).
- AI-UX readiness: Level 1 of 3 reached. We ship a validator the officer can check in under three seconds.

## Risks (market, technical, team)

One officer's result is not enough. Officers differ in speed, habits and trust in AI. Every test below uses many officers on the same set of made-up enquiries. We collate the results across all officers and report the spread, not one person's result. Numbers are made up.

**Market risk: officers do not use the drafts, or approve them without checking.**
Officers may rewrite every draft from scratch, or approve cited drafts without reading them. Either way the 7-in-10 target would not mean what we want.
How we will test it: run the prototype with 20 officers (made up). Each works the same 30 made-up enquiries. Include drafts with planted errors, so we can tell trust from rubber-stamping. Collate the share approved as is, after a light edit and after a heavy rewrite, plus the share of planted errors approved. Pass: 7 in 10 sent after a light edit and fewer than 1 in 10 planted errors approved. Fail: below 5 in 10 sent after a light edit. (made up)

**Technical risk: the AI cites policy pages or passages that do not exist, or states figures the page does not say.**
This is our riskiest assumption, from `day2-validate/build-log.md`. The current check compares page, passage and numbers only. It does not catch a wrong claim in words.
How we will test it: run 50 made-up enquiries, each with a known right policy page. Measure how often the right page is found first, and how often each cited line is supported by the page it cites. Include fakes the check cannot catch, such as a wrong claim in words, and count how many officers catch them. Pass: the check flags every fake it is built to catch with 0 false alarms, and officers catch most of the rest. Fail: any fake page or passage reaches approval. (made up)

**Team risk: our evidence comes from too few people, and the policy sources go stale.**
A small team will lean on whoever is easiest to test with, and one officer's view can mislead. The policy team (made up) owns the sources, so a changed page they did not tell us about makes drafts wrong.
How we will test it: collect results from at least 20 officers in at least 2 teams (made up), and show them per officer and combined. Do not report a pass unless the result holds across teams. Check the sources against the policy team's list before each test round, and log any page that changed. Pass: results agree across teams and no changed page goes unlogged. (made up)

## Build plan and handoff

Built: a prototype in `day2-validate/prototype/` with a case workspace, pre-written drafts, a citation check, a pilot tally and a Context and tests tab. No AI model is called.

Next:
1. Export each officer's session so results can be combined across many officers.
2. Add fakes the check cannot catch, such as a wrong claim in words.
3. Replace pre-written drafts with model output and measure how often a cited line is supported by its page.

Handoff: `context-skill.md` and `build-log.md` carry the rules and the test. The policy team owns the sources.

## Agent role and guardrails

Role: A drafting assistant for ServiceSG enquiry officers. It finds the right policy passage and drafts a first reply for officer review.

Guardrails:
- Cite a policy page and passage for every claim, and only pages that exist.
- State a figure only if the cited passage states it.
- If the source is ambiguous, mark the output NEEDS CLARIFICATION.
- If no page covers the enquiry, produce no draft.
- Never invent names, NRIC fragments, contractual terms or PII.
- Hand off to a human lead for law enforcement, legal or a regulator.
- Draft only. Never send a reply, and never mark a case resolved.

## Roles and operating model

Roles (Proposed, full detail in `day3-build/operating-model.md`):

- Product owner: decides scope, permissions, go-live, incidents and retirement.
- Engineer: chooses the model, retrieval and citation check, and how blocked actions are enforced.
- Enquiry officer: reviews, edits and approves every reply.
- Duty officer: sends anything citizen-facing. The assistant never sends. Acts first in an incident.
- Human lead: takes law enforcement, legal and regulator matters.
- Policy team (made up): owns the sources and the rules. Reviews them when a page changes and confirms the permission settings.
- Pilot facilitator: runs the test and collates results across officers.
- Executive sponsor (also the business owner): funds the work and owns the enquiry service. Is told about key calls, and first outside the team when something goes wrong. Not a decider.

Decision rights:

| Harness part | Who decides | Who is consulted | Who is told |
|---|---|---|---|
| Scope | Product owner | Policy team, enquiry officers, engineer | Duty officer, human lead, pilot facilitator, executive sponsor |
| Permissions | Product owner | Policy team, engineer | Enquiry officers, pilot facilitator |
| Vendor and model | Engineer | Product owner, policy team | Pilot facilitator, executive sponsor |
| Go-live | Product owner | Pilot facilitator, policy team, engineer, enquiry officers | Duty officer, human lead, executive sponsor |
| Incident | Product owner decides to switch the agent off and when to switch it back on. Duty officer acts first by stopping sending. Engineer may switch the agent off if the product owner can't be reached | Engineer, policy team | Executive sponsor (the business owner), told the same day by the product owner. Pilot facilitator, human lead |
| Retire | Product owner | Pilot facilitator, policy team, executive sponsor, engineer | Enquiry officers, duty officer, human lead |

If a wrong answer reaches a resident: the duty officer stops sending and tells the product owner. The product owner decides to switch the agent off and the engineer does it. The product owner tells the executive sponsor (the business owner) the same day. Times and out-of-hours cover are not set yet.

No role can let the assistant send a reply or mark a case resolved. People decide the stop line, not the assistant.

## Strategy and roadmap

Strategy kernel

Diagnosis: Officers lose most of their time finding the right policy page (12 minutes per search, made up), not writing the reply. That search time pushes first replies to 3 days against a 1-day target.

Guiding policy: Draft for the officer, never replace them. Every draft cites the policy page it used, and an officer approves every reply.

Coherent actions:
1. Retrieve the matching policy passage for each enquiry and show its citation next to the draft.
2. Draft a first reply from that passage. Mark it 'NEEDS CLARIFICATION' if the source is ambiguous, and flag senior-officer cases.
3. Run a two-week pilot with a small group of officers. Measure how many drafts are sent after a light edit against the 7-in-10 target (made up).

## Metrics plan and stop line

Measure across many officers, per officer and combined. All numbers are made up.

| Metric | Target | Stop line |
|---|---|---|
| Drafts sent as is or after a light edit | 7 in 10 | Below 5 in 10 |
| Planted errors approved | Under 1 in 10 | Any fake page or passage reaches approval |
| Citation check on made-up fakes | 3 of 3 flagged, 0 false alarms | Any fake not flagged |
| Time to first action | Under 30 seconds | Officers regularly stuck past 30 seconds |
| Client SLA clock, from arrival to approved reply | 1 working day or less | Not improving against the 3-day baseline |

The client SLA clock starts when the enquiry arrives, and is separate from the officer's time.

Baseline: 72% within SLA, 3-day average first reply (made up).

Stop line summary: fewer than 5 in 10 drafts sent after a light edit, or any fake page or passage reaching approval.

## Evals and gates

- Citation check self-test: flags 3 of 3 made-up fakes with 0 false alarms.
- Five test questions in `context-skill.md`. Today 4 of 5 pass and the fifth is caught by the check.
- Retrieval test: 50 made-up enquiries, each with a known right page.
- Gate before a pilot: no fake reaches approval, and the context file matches the prototype.
- Light vs heavy edit measures how much an officer changed the text, not whether it is right. We pair it with planted errors.

## Decision: continue, pivot or stop

Not decided yet. No officer has used the prototype.
- Continue if the pass criteria hold across officers and teams.
- Pivot if officers rewrite most drafts, or the AI's citations are unreliable.
- Stop if the stop line is hit.

## Open issues

- Should drafts cite the case ID as well as the policy page? The skill file says case ID.
- The check cannot catch a wrong claim in words.
- Where do the 3 days go? We need a breakdown of waiting versus handling time, in a later report view.
- Officers cannot yet flag a line themselves.
- Image enquiries are not handled.
- The policy library and all numbers are made up.
- `data/context.js` is a copy of `context-skill.md` and can drift.
- The chief executive sponsor's objection has not been answered.
