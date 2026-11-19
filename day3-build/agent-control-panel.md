# Agent control panel: ServiceSG enquiry drafting agent

Scenario A · ServiceSG enquiry response

All data is made up. Status: **draft for the learner to review**. Every setting below is **Proposed**. Nothing is decided until the learner and the policy team confirm it.

## Permissions

One row per tool the agent uses, from `day3-build/CLAUDE.md`. Tiers: **read** (looks only), **draft** (makes text no one sees yet), **write** (changes a stored record), **send** (anything leaves the system). Settings: **auto** (agent acts), **confirm** (a person says yes first), **block** (agent cannot do it).

| Tool | Tier | Setting (Proposed) | What the stress runs showed |
|---|---|---|---|
| Read enquiry | read | auto | Run 4: an empty enquiry reads fine and is stopped by a rule, not by the tool. Nothing here needs a person. |
| Search policy library | read | auto | Run 6: two empty results stopped the run after one retry, so the setting depends on that retry limit. Run 5: a search for a page that is not in the library finds nothing and does not invent it. |
| Citation check | read | auto | Run 5: it would flag a line citing a page that does not exist. It is the second net, so skipping it stays blocked. It cannot see wrong words, so it never replaces the officer. |
| Write draft | draft | auto | Runs 4 to 6 wrote no draft, only a status note ("needs officer"). Nothing leaves the system and the officer sees it before anything happens. |
| Write log | write | auto | Every run ended in a log entry. No log means no run, so a failed write stops everything. Append only. |

No tool is in the **send** tier. Send is not a tool the agent has, so any request to send stays blocked (Run 3).

## What is not decided

These are yours and the policy team's to choose. I have not chosen them.

1. **Confirm or change every setting above.** All five are Proposed. You could set Write log to confirm, for example, but that would make a person approve every entry.
2. **The retry limit for Search policy library.** `CLAUDE.md` says retry once. Run 6 showed several empty lookups in a row probably mean a broken library, but nothing says how many in a row should stop everything.
3. **Where the output folder and the run log live.** `CLAUDE.md` names no paths. Write draft and Write log cannot be set until they exist.
4. **Whether a status note with no draft counts as Write draft.** Runs 4 to 6 saved "needs officer" with no draft. `CLAUDE.md` lists statuses only for the draft cases.
5. **Whether the citation check should ever be a person's call.** It is auto and cannot be skipped in this proposal. If it flags a line the agent cannot fix, the agent hands off.
6. **Named gaps from the stress runs.** `CLAUDE.md` has no rule for an empty enquiry or for an enquiry that cites a page not in the library. Both were read as hand-off. The policy team should confirm.

Decided by the learner:
- This per-tool table wins over the per-action table in `ai-prd.md` (see below).
- Write draft stays **auto**, with the officer alone as the check. No extra gate before a draft and no business owner sign-off, because an officer already verifies every draft and that is the current business process. Not yet confirmed with the business owner. See `ai-prd.md`, open decision 15.

Items 1 to 6 are otherwise still open.

## Which table wins

`day3-build/ai-prd.md` lists 20 actions with Proposed settings. This table is per tool. **If the two disagree, this per-tool table wins** (decided by the learner). The PRD has not been changed to match, so it may still show an older setting.
