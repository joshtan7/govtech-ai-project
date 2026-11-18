# Prompt chain

**Scenario:** A · ServiceSG enquiry response
**Prototype today:** Shows the ServiceSG enquiry inbox with made-up enquiries and a drafted first reply for each one.

All data is synthetic and labelled as made up.

## 1. Expand

**Prompt:** Let the officer filter the inbox by policy topic, and show the topic on each enquiry.

**Business rules:**
- Topics come from a fixed made-up list of 6.
- An enquiry can have one topic only.

**Edge cases:**
- An enquiry that matches no topic goes under Other.
- The filter shows a count of 0 without breaking.

**Result:**

What worked:
- A dropdown filters the queue by topic. It lists All topics, the 6 made-up topics and Other, with a count after each name.
- Each enquiry shows its topic: a tag in the queue and "Topic: …" on the open case.
- One topic per enquiry. The appeal enquiry (ENQ-007) matches no topic, so it goes under Other.
- A topic with no cases shows (0) and the message "No cases match this topic (0)". The page keeps working.
- The filter combines with the status chips, the search box and the J and K keys. J and K stay inside the filtered list.

What broke:
- Nothing broke in 18 checks. These ran in a simulated page, not a real browser.
- The counts change with the status chips and the search. Under "Done" they count only done cases. This may surprise an officer who expects fixed totals.
- I chose to put the appeal under Other instead of giving it a topic. That is a judgement call.

## 2. Behavior

**Prompt:** Handle a failed policy lookup: show a clear message, keep the officer’s draft, and offer a retry.

**Forced failure:** Make the policy lookup return nothing for every enquiry about fees.

**Business rules:**
- Never show a draft that cites no policy page.
- Never lose text the officer typed.

**Edge cases:**
- The lookup fails twice in a row.
- The officer edits the draft while the retry runs.

**Result:**

What worked:
- The forced failure is a checkbox under the tally. It makes the lookup return nothing for ENQ-002 and ENQ-008, the two enquiries that mention a fee. The other six are unaffected.
- On failure the AI draft is hidden and a red banner explains that no policy page came back. No draft, citation or Approve button shows until a lookup succeeds.
- The officer's typed text is saved on every keystroke. It survived a failed retry, switching cases and a recovered lookup.
- Retry is disabled while a retry runs, so it cannot be clicked twice.
- After two failures in a row the banner says so and offers a hand-off to an officer. It is not offered after one.
- Text typed during a retry was still there when the retry failed, and the cursor stayed in the box.
- The queue tags the case "Lookup failed", and the tally counts failed attempts.

What broke:
- One check failed on the first run: "typed text is still shown beside the draft" after recovery. The text was kept. My check looked for it in the page text, but it sits in a text box. I fixed the check, not the app.
- Not tested for real: the retry delay is a made-up 0.6 seconds, not a real network call, and all checks ran in a simulated page.
- "Fee enquiry" is detected by the word "fee" in the subject or text. It is rough and only for the test control.
- The hand-off appears only after two failures. That is my reading of the edge case.

## 3. Refine

**Prompt:** Make labels, spacing and button names consistent on the reply screen.

**Business rules:**
- Do not change how drafts are generated or approved.

**Edge cases:**
- Long enquiries still fit on a laptop screen.

**Result:** _fill in after you run it: what worked, what broke._
