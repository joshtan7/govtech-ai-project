# Build log

Scenario A · ServiceSG enquiry response

All data in this file and in the prototype is synthetic (made up).

## Riskiest assumption

The AI starts hallucinating and quoting policies or policy pages that don't exist.

- **Risk type:** Technical. Can the system produce drafts whose citations are real and say what the draft says?
- **Kill switch:** If the check cannot flag a made-up fake citation before an officer can approve it, stop and rethink. A draft that cites a page, a passage or a figure that does not exist breaks the rule that every claim cites a source.
- **Success signal:** In the prototype test, the citation check flags all 3 made-up fakes (a policy page that does not exist, a passage that does not exist, and a wrong fee) with 0 false alarms on the clean lines. Approve stays blocked until every flagged line is fixed or removed. (made up)

## How the prototype tests it

The prototype is in `day2-validate/prototype/`. No AI model is called. The drafts are pre-written, and two of them carry deliberate fakes.

- **ENQ-007** cites `POL-09`, a policy page that does not exist (made up).
- **ENQ-008** states a replacement fee of $200 where the cited passage says $20, and cites passage `p7`, which does not exist on `POL-02` (made up).

For every cited line the page checks three things against the made-up policy library:

1. The cited policy page exists.
2. The cited passage exists on that page.
3. Every number in the line also appears in the cited passage.

When a check fails:

- The line shows a red warning that says what failed.
- The citation panel says "not in the policy library" instead of showing a page.
- The queue tags the case "Citation check".
- **Approve is blocked** until the officer fixes the line or removes it with "Remove this line".

The pilot tally at the top shows the self-test result on load (fakes flagged, false alarms) and how many fakes officers fixed before approving.

## What this does and does not show

It shows the check logic works on these made-up cases, and that approval is blocked while a problem remains.

It does not show:

- **Real model behaviour.** A real model may invent things in ways this check does not look for.
- **Wrong claims with matching numbers.** The check compares figures only. A line that misstates a rule in words, such as "closed on public holidays" when the page says open, is not caught.
- **Real officer behaviour.** No officer has used it yet. Whether officers notice and act on the warnings is still untested.

## Next steps

- Run the test with real officers and record whether they fix or remove flagged lines.
- Add fakes the check cannot catch, to learn how officers react when the AI is wrong and nothing warns them.
- Replace the pre-written drafts with model output and measure how often a cited line is not supported by its page.
