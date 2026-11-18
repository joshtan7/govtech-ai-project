# One Pager

Use case: [your chosen scenario (A, B, or C), written with synthetic data only]

## Problem and user
## Opportunity and evidence
## Experience and trust
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
## Agent role and guardrails
## Roles and operating model
## Strategy and roadmap

Strategy kernel

Diagnosis: Officers lose most of their time finding the right policy page (12 minutes per search, made up), not writing the reply. That search time pushes first replies to 3 days against a 1-day target.

Guiding policy: Draft for the officer, never replace them. Every draft cites the policy page it used, and an officer approves every reply.

Coherent actions:
1. Retrieve the matching policy passage for each enquiry and show its citation next to the draft.
2. Draft a first reply from that passage. Mark it 'NEEDS CLARIFICATION' if the source is ambiguous, and flag senior-officer cases.
3. Run a two-week pilot with a small group of officers. Measure how many drafts are sent after a light edit against the 7-in-10 target (made up).
## Metrics plan and stop line
## Evals and gates
## Decision: continue, pivot or stop
## Open issues
