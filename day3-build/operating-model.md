# Operating model: ServiceSG enquiry drafting agent

Scenario A · ServiceSG enquiry response

All data, numbers and policy pages are made up. Roles only, no names. Status: **Proposed**. Nothing here is decided until the product owner and the policy team confirm it.

This file says who makes each call about the agent. It is built from `one-pager.md`, `day3-build/ai-prd.md` and `day3-build/CLAUDE.md`.

**Not found:** `day3-build/agent-control-panel.md` does not exist, so nothing here comes from it. **`SCENARIO-PICK.md` is blank.** Every other file says Scenario A, so this file uses A.

## Decision rights

One decider per row. Consulted people give input before the call. Told people hear after it.

| Harness part | Who decides | Who is consulted | Who is told |
|---|---|---|---|
| Scope: which enquiries the agent handles, and which it hands off (for example images, law enforcement, legal, regulator) | Product owner | Policy team, enquiry officers, engineer | Duty officer, human lead, pilot facilitator, executive sponsor |
| Permissions: what the agent may read, write and send. Every setting in `ai-prd.md` is Proposed until this is done | Product owner | Policy team (confirms), engineer | Enquiry officers, pilot facilitator |
| Vendor and model: which model, how it is called, how retrieval and confidence work | Engineer | Product owner, policy team | Pilot facilitator, executive sponsor |
| Go-live: the move from prototype to a pilot with real officers | Product owner | Pilot facilitator, policy team, engineer, enquiry officers | Duty officer, human lead, executive sponsor |
| Incident: a stop-everything condition, such as a fake page reaching an officer unflagged, or the agent trying to send. The agent stops itself. This row is who acts, who switches off and who resumes | Product owner decides to switch the agent off and when to switch it back on. The duty officer acts first by stopping sending. The engineer may switch the agent off if the product owner can't be reached | Engineer, policy team | Executive sponsor (the business owner), told the same day by the product owner. Pilot facilitator, human lead |
| Retire: switching the agent off for good, or when the stop line is hit | Product owner | Pilot facilitator, policy team, executive sponsor, engineer | Enquiry officers, duty officer, human lead |

## Incident: first hour

Proposed. Made-up case: at 08:00 on Monday a wrong answer reaches a resident. The agent never sends, so first find out which of two things happened. Either an officer approved a wrong draft and the duty officer sent it, or the agent sent it itself. The second is a stop-everything breach.

| Step | Who | What they do |
|---|---|---|
| 1. Act first | Duty officer (or whoever is on duty when it is seen) | Stop sending anything citizen-facing from the agent. Note the enquiry id and the time. Tell the product owner at once. Do not wait to understand the cause. |
| 2. Switch the agent off | Product owner decides. Engineer does it. | Turn the agent off and keep the run log as it is. If the product owner cannot be reached, the duty officer keeps sending paused and the engineer may switch the agent off. The product owner is told straight after. |
| 3. Tell the business owner (the executive sponsor) | Product owner | Tell them the same day, before anyone else outside the team. Say what was sent, to how many residents, that the agent is off, and what happens next. |
| 4. Correct the resident | Enquiry officer writes the correction. Duty officer sends it. | Write a correction from the right policy page. If the matter touches law enforcement, legal or a regulator, the human lead takes it. |
| 5. Find the cause | Engineer and pilot facilitator, with the policy team | Read the run log. Check whether a fake got past the citation check, an officer approved without reading, or a policy page had changed. |
| 6. Switch back on | Product owner | Only after the cause is fixed and the policy team has confirmed the sources. The go-live gate applies again. |

Still missing, and needs a person to fill in: contact route for each role, how quickly each step must happen, and a rota for who is on duty out of hours.

## Limits on these rights

- No role can let the agent send a reply or mark a case resolved. An enquiry officer approves every reply and the duty officer sends it (rule 8 in `CLAUDE.md`).
- The agent cannot edit its own rules, sources or permissions. Changes to sources or rules need policy team review before the agent uses them.
- The vendor and model call is the engineer's, but the agent makes no network call today. Any model that needs one also needs a permissions change, which is the product owner's call.
- Go-live gate: no fake reaches approval, and the context file matches the prototype.
- The stop line is decided by people, not the agent. Any fake page or passage reaching approval, or fewer than 5 in 10 drafts sent after a light edit, means the product owner and pilot facilitator decide to continue, pivot or stop (numbers made up).

## Roles

- **Product owner:** the builder of this project. Decides scope, permissions, go-live, incident response and retirement. Answers the executive sponsor.
- **Engineer:** chooses the model, retrieval, citation check and how blocked actions are enforced in code.
- **Policy team (made up):** owns the policy sources and the rules. Reviews them when a page changes and confirms the permission settings.
- **Enquiry officer:** reviews, edits and approves every reply. Opens image enquiries and takes cases the agent hands off.
- **Duty officer:** sends anything citizen-facing. The agent never sends.
- **Human lead:** takes law enforcement, legal and regulator matters.
- **Pilot facilitator:** runs the test, reads the run log weekly and collates results across officers.
- **Executive sponsor (also the business owner):** funds and backs the work, owns the ServiceSG enquiry service the agent sits in, and answers for what residents receive. Is told about key calls and is not a decider here. Is told first outside the team when something goes wrong. Their objection in `one-pager.md` is still unanswered.

## Open points

- Everything above is Proposed. The product owner and policy team need to confirm it.
- Who answers the executive sponsor's objection is not settled.
- The first-hour times and the out-of-hours cover in the incident section are blank.
- `agent-control-panel.md` may need to exist. If it holds decisions, add them here.
