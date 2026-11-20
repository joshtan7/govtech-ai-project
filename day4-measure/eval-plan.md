# Eval plan: ServiceSG enquiry drafting agent

Scenario A · ServiceSG enquiry response

All numbers, cases and policy pages are made up (synthetic). Roles only, no names. Status: **Proposed**. Every owner, trigger, number and date below is a suggestion until the product owner and the policy team confirm it.

Built from `SCENARIO-PICK.md`, `day3-build/operating-model.md`, `day4-measure/eval-cases.md` and the baselines and stop line in `one-pager.md`. **Not found:** `day4-measure/human-rubric.md` and `day4-measure/eval-results.md` do not exist, so nothing here comes from them. No eval has been run on a live model yet, so there are no results to build on. Until a rubric exists, the weekly review uses the "must never happen" lists in `eval-cases.md`.

## Who owns what

Roles are the ones in `operating-model.md`. One owner per job. The others are consulted.

| Job | Owner (Proposed) | Consulted (Proposed) | Why this owner |
|---|---|---|---|
| Signs the pass bar | Product owner | Policy team (safety parts), pilot facilitator, engineer | The product owner already decides go-live. The policy team confirms the deal-breaker rules and the sources. The executive sponsor is told, not asked to sign, in line with open decision 15 in `ai-prd.md`. |
| Writes and refreshes the test cases | Pilot facilitator | Policy team (right answers and deal-breaker marks), enquiry officers, product owner approves additions | The engineer who builds the agent should not alone write the tests that judge it. The policy team knows what a correct answer is. |
| Runs the eval | Engineer runs the automated checks. Pilot facilitator runs the officer test. | Product owner | Only the engineer can run the agent and the citation check. The facilitator runs the officer test so results are combined across officers and teams. |
| Reviews a weekly sample | Enquiry officers, in rotation, not reviewing their own approvals. Pilot facilitator collates. | Policy team (reviews any miss against the sources) | The people who read replies every day spot a wrong line fastest. |

**Weekly sample (Proposed, made up).** A random 20 drafts, plus every stopped run, every run where the check flagged a line, and every planted error that was approved.

**Separation.** Whoever changes the agent does not approve their own change. The product owner approves it.

## When it runs

Four triggers. The same 14 cases in `eval-cases.md` are the base each time. Deal-breaker cases run first.

| Trigger | What runs (Proposed) | Who runs it | What blocks the next step |
|---|---|---|---|
| **Before go-live** | All 14 cases. The citation check self-test (3 of 3 made-up fakes flagged, 0 false alarms). The retrieval test on 50 made-up enquiries with a known right page. The officer test with planted errors: at least 20 officers in at least 2 teams, results per officer and combined (all from `one-pager.md`). | Engineer, then pilot facilitator | Any deal-breaker case fails, any fake reaches approval, or the context file does not match the prototype. The product owner signs the pass bar. |
| **Before every change** | All 14 cases and the citation check self-test. A change means anything to `CLAUDE.md`, the model or how it is called, a tool, a permission, `context.js`, or the retrieval. | Engineer | Any deal-breaker case fails. The product owner approves, not the person who made the change. |
| **Every week** | The weekly sample review. The 14 cases once more. The metrics below, per officer and combined. | Enquiry officers review, facilitator collates, engineer reruns the cases | A stop-line number is hit, or a deal-breaker case now fails. |
| **When policy changes** | Check the sources against the policy team's list. Rerun the cases for each changed page (table below). Update any right answer that changed. Log the change. | Policy team tells the facilitator. Engineer reruns. | A changed page with no log entry. `CLAUDE.md` already makes this a stop-everything condition. |

**Cases to rerun when a page changes.**

| Page | Cases to rerun |
|---|---|
| POL-01 Change of registered address | 1, 13 |
| POL-02 Replacement card | 2, 3, 8, 10, 11, 13, 14 |
| POL-03 Front desk opening hours | 4, 9 |
| POL-04 Choosing the right form | 5, 7 |
| POL-05 Regulator, legal and law enforcement | 10 |
| POL-06 Letters and notices | 6, 12, 13 |

## How I'll know it's working

| Item | Proposed |
|---|---|
| **Goal** | Residents get a correct first reply within one working day, because officers send a cited AI draft after a light edit. Taken from `one-pager.md`. |
| **Baseline** | 72% of enquiries within SLA. 3-day average first reply. 12 minutes per policy search. All made up. There is no live baseline for drafts yet, because no officer has used the prototype. The prototype self-test passes 3 of 3 made-up fakes, and 4 of 5 test questions pass today. |
| **Target** | 90% within SLA. First reply in 1 working day or less. Under 3 minutes per policy search. All made up and proposed in `one-pager.md`. |
| **Review date** | Day 30 after go-live. The calendar date is set at go-live, because go-live is not decided. |
| **Usage metric** | Draft use rate: of the enquiries where the agent wrote a draft, the share an officer sends as is or after a light edit. Target 7 in 10, per officer and combined, counted weekly. Not drafts written, which only counts the agent's output. |
| **Pattern to watch first** | Officers approving without reading. Look for approvals with almost no time on the draft, no edit, and a high approval share, above all on drafts with a flagged line or a planted error. This matters most because the officer alone is the check (open decision 15). |
| **Stop line** | Stop and rethink if any of these happens (all made up). 1. Any fake page or passage reaches approval. 2. Fewer than 5 in 10 drafts are sent as is or after a light edit. 3. The agent sends, or marks a case resolved, even once. 4. A deal-breaker case fails on a rerun and is not fixed before the next run. The first two come from `one-pager.md`. Items 3 and 4 are my additions. The product owner and pilot facilitator decide. The agent only reports the numbers. |

**Other numbers to track, from `one-pager.md`.** Planted errors approved (under 1 in 10). Time to first action (under 30 seconds). Citation check on fakes (3 of 3, 0 false alarms). Client SLA clock from arrival to approved reply.

## First 30 days

All days and counts are Proposed and made up. Day 1 is go-live.

| When | What | Owner | Output |
|---|---|---|---|
| **Before day 1** | Confirm the owners above. Add the rules that `eval-cases.md` shows are missing (open decisions 20 and 21 in `ai-prd.md`). Set the retry limit and the output and log paths. Run the full pre-go-live eval. Fix what fails. | Product owner, engineer, policy team | Signed pass bar, or a list of what failed |
| **Days 1 to 5** | Small group of officers on live enquiries, in at least 2 teams. Include planted errors. Facilitator reads the run log every day. | Pilot facilitator, enquiry officers | Daily note of stopped runs, flags and approvals |
| **Days 6 to 14** | Keep the group. First weekly sample review at the end of week 2. Rerun the 14 cases after any change. | Enquiry officers, engineer | First weekly review and any new cases |
| **Days 15 to 21** | Check the sources against the policy team's list. Look at the first pattern to watch. Add new cases from any miss. | Policy team, facilitator | Updated cases and a source check |
| **Days 22 to 29** | Collate per officer and combined. Compare with the baseline. Do not report a pass unless it holds across teams. | Pilot facilitator | The numbers in one table |
| **Day 30** | Review. Continue, pivot or stop, using the stop line. Tell the executive sponsor the result. | Product owner and pilot facilitator decide. Executive sponsor is told. | A written decision and the next 30 days |

**Open points.**
- Everything above is Proposed. The product owner and policy team need to confirm it.
- Whether the executive sponsor should sign the pass bar is not settled. I left them as told, in line with open decision 15.
- The sample size, the group size, the day-by-day split and stop-line items 3 and 4 are my numbers, not from your files.
- `human-rubric.md` and `eval-results.md` do not exist. When they do, the weekly review and the baseline should use them.
- The first-hour times and out-of-hours cover in `operating-model.md` are still blank, and a failed eval during the pilot would need them.
