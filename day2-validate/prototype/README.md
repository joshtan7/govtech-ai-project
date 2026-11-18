# Prototype: ServiceSG enquiry inbox (officer's view)

Scenario A · ServiceSG enquiry response.

All enquiries, drafts and policy pages in this prototype are made up. No real residents, names, NRICs or policy pages.

## What it does

An officer opens the inbox and works through 6 made-up enquiries.

- **Inbox:** each enquiry has a status tag. After you act on one, its outcome shows on the row.
- **Enquiry view:** the enquiry, then the draft below it.
- **Drafts:** pre-written, with a citation after every claim. Every cited line shows a made-up confidence score, and the draft shows an overall confidence. Click a citation to open the policy page right below that line, with the cited passage highlighted, plus when it was last updated and who owns it. Lines below 90% (made up) have a dotted underline.
- **Approve, Edit, Restore original:** Approve only records the decision. Edit changes the lines in place. Restore original puts the draft back.
- **No draft cases:** shows why, the three closest policy pages, and a hand-off button.
- **Pilot tally:** at the top of the inbox. It counts drafts approved as is, after a light edit, and after a heavy rewrite, plus enquiries where the first action took over 30 seconds.

An edit counts as a heavy rewrite when more than half the words are new. This is a rough rule for the prototype.

## How to open it

Open `index.html` in a web browser. No server and no install.

## Files

- `index.html`: the page.
- `style.css`: how it looks.
- `app.js`: the screens and the tally.
- `data/enquiries.js`: the made-up enquiries and pre-written drafts.
- `data/policies.js`: the made-up policy pages.

## Nothing is sent

No AI model is called. The page makes no network calls, sends nothing, and never marks a case resolved. The tally stays in the page and resets on refresh.
