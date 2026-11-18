// Officer prototype. Two screens: inbox list and enquiry view.
// Reads ENQUIRIES and POLICIES from data/. No network calls. Nothing is sent.

const state = {
  currentId: null,
  openedAt: {},         // enquiry id -> ms timestamp of the first time it was opened
  edits: {},            // enquiry id -> edited draft lines (kept when you switch cases)
  editing: {},          // enquiry id -> true while its lines are editable
  removed: {},          // enquiry id -> { lineIndex: true } for lines the officer removed
  filter: "all",        // "all", "todo" or "done"
  query: "",
  // Per-enquiry result: { outcome, firstActionSec }
  results: {}
};

// Outcomes shown on the inbox and counted in the tally.
const OUTCOME_LABELS = {
  "approved-as-is": "Approved as is (not sent)",
  "approved-light": "Approved after light edit (not sent)",
  "rewritten": "Approved after heavy rewrite (not sent)",
  "handed-off": "Handed to officer (not sent)"
};

const OUTCOME_SHORT = {
  "approved-as-is": "Approved",
  "approved-light": "Approved (edited)",
  "rewritten": "Approved (rewritten)",
  "handed-off": "Handed off"
};

function byId(list, id) {
  return list.find(function (x) { return x.id === id; });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---------- Tally (for the facilitator) ----------

function renderTally() {
  const box = el("section", "tally");
  box.append(el("h2", "section-title", "Pilot tally"));

  const counts = { "approved-as-is": 0, "approved-light": 0, "rewritten": 0, "handed-off": 0 };
  let slow = 0;
  Object.keys(state.results).forEach(function (id) {
    const r = state.results[id];
    counts[r.outcome] += 1;
    if (r.firstActionSec > 30) slow += 1;
  });

  const fixed = Object.keys(state.results).filter(function (id) { return state.results[id].hadProblem; }).length;
  const drafted = counts["approved-as-is"] + counts["approved-light"] + counts["rewritten"];
  const sentLight = counts["approved-as-is"] + counts["approved-light"];

  const cards = el("div", "stats");
  [
    { label: "Approved as is", value: String(counts["approved-as-is"]) },
    { label: "Light edit", value: String(counts["approved-light"]) },
    { label: "Heavy rewrite", value: String(counts["rewritten"]) },
    { label: "Handed off", value: String(counts["handed-off"]) },
    { label: "First action over 30s", value: String(slow) },
    { label: "Check flags the made-up fakes", value: checkStats().caught + " of " + checkStats().planted, sub: "Self-test on load. Success: all" },
    { label: "False alarms on clean lines", value: String(checkStats().falseAlarms), sub: "Self-test on load. Success: 0" },
    { label: "Fakes fixed before approval", value: String(fixed), sub: "This session" },
    {
      label: "Sent as is or after light edit",
      value: drafted === 0 ? "n/a" : sentLight + " of " + drafted,
      sub: "Target 7 in 10 (made up)",
      wide: true
    }
  ].forEach(function (s) {
    const card = el("div", "stat" + (s.wide ? " stat-wide" : ""));
    card.append(el("span", "stat-value", s.value), el("span", "stat-label", s.label));
    if (s.sub) card.append(el("span", "stat-sub", s.sub));
    cards.append(card);
  });
  box.append(cards);
  box.append(el("p", "note", "This session only, made up. Refreshing resets it. Nothing is uploaded."));
  return box;
}

// ---------- Case workspace: queue on the left, open case on the right ----------

function isDone(id) { return !!state.results[id]; }

function visibleEnquiries() {
  const q = state.query.trim().toLowerCase();
  return ENQUIRIES.filter(function (e) {
    if (state.filter === "todo" && isDone(e.id)) return false;
    if (state.filter === "done" && !isDone(e.id)) return false;
    if (!q) return true;
    return (e.id + " " + e.subject + " " + e.sender).toLowerCase().indexOf(q) !== -1;
  });
}

function selectCase(id) {
  state.currentId = id;
  if (!state.openedAt[id]) state.openedAt[id] = Date.now();
  render();
  const main = document.getElementById("case-main");
  if (main && main.scrollIntoView && window.innerWidth <= 860) main.scrollIntoView({ block: "start" });
}

function moveCase(step) {
  const list = visibleEnquiries();
  if (list.length === 0) return;
  const i = list.findIndex(function (e) { return e.id === state.currentId; });
  const next = i === -1 ? (step > 0 ? 0 : list.length - 1) : (i + step + list.length) % list.length;
  selectCase(list[next].id);
}

// Next case that has not been actioned yet, starting after the current one.
function nextOpenCase() {
  const start = ENQUIRIES.findIndex(function (e) { return e.id === state.currentId; });
  for (let n = 1; n <= ENQUIRIES.length; n++) {
    const e = ENQUIRIES[(start + n) % ENQUIRIES.length];
    if (!isDone(e.id)) return e;
  }
  return null;
}

function secondsSinceOpen(id) {
  return Math.round((Date.now() - state.openedAt[id]) / 1000);
}

function hasEdits(id) {
  const enq = byId(ENQUIRIES, id);
  const edited = state.edits[id];
  if (!enq.draft || !edited) return false;
  return enq.draft.some(function (l, i) { return l.text !== edited[i]; });
}

function renderWorkspace() {
  const root = document.getElementById("app");
  root.textContent = "";
  root.append(renderTally());

  const layout = el("div", "workspace");
  layout.append(renderQueue(), renderCase());
  root.append(layout);
  refreshQueue();
}

// ----- Queue -----

function renderQueue() {
  const aside = el("aside", "queue");

  const search = el("input", "search");
  search.type = "search";
  search.placeholder = "Search cases";
  search.value = state.query;
  search.setAttribute("aria-label", "Search cases");
  search.addEventListener("input", function () {
    state.query = search.value;
    refreshQueue();
  });
  aside.append(search);

  const chips = el("div", "chips");
  chips.id = "queue-chips";
  aside.append(chips);

  const list = el("ul", "queue-list");
  list.id = "queue-list";
  aside.append(list);

  aside.append(el("p", "note kbd", "Keys: J next case · K previous case"));
  return aside;
}

function refreshQueue() {
  const chips = document.getElementById("queue-chips");
  const list = document.getElementById("queue-list");
  if (!chips || !list) return;

  const done = ENQUIRIES.filter(function (e) { return isDone(e.id); }).length;
  chips.textContent = "";
  [
    ["all", "All " + ENQUIRIES.length],
    ["todo", "To do " + (ENQUIRIES.length - done)],
    ["done", "Done " + done]
  ].forEach(function (f) {
    const b = el("button", "chip" + (state.filter === f[0] ? " chip-on" : ""), f[1]);
    b.addEventListener("click", function () { state.filter = f[0]; refreshQueue(); });
    chips.append(b);
  });

  list.textContent = "";
  const items = visibleEnquiries();
  if (items.length === 0) list.append(el("li", "queue-empty", "No cases match."));

  items.forEach(function (enq) {
    const li = el("li", "q-item" + (enq.id === state.currentId ? " q-active" : "") + (isDone(enq.id) ? " q-done" : ""));
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    if (enq.id === state.currentId) li.setAttribute("aria-current", "true");

    const top = el("div", "q-top");
    top.append(el("span", "row-id", enq.id), el("span", "q-time", enq.received));
    li.append(top);
    li.append(el("span", "q-subject", enq.subject));

    const tags = el("div", "q-tags");
    tags.append(el("span", "tag tag-" + enq.status, STATUS_LABELS[enq.status]));
    if (enq.draft) tags.append(confBadge(draftConfidence(enq)));
    if (enq.hasImage) tags.append(el("span", "tag tag-image", "Image"));
    if (enquiryHasUnresolvedProblem(enq) && !isDone(enq.id)) tags.append(el("span", "tag tag-check", "Citation check"));
    if (hasEdits(enq.id) && !isDone(enq.id)) tags.append(el("span", "tag tag-edited", "Edited"));
    if (isDone(enq.id)) tags.append(el("span", "tag tag-done", "✓ " + OUTCOME_SHORT[state.results[enq.id].outcome]));
    li.append(tags);

    li.addEventListener("click", function () { selectCase(enq.id); });
    li.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectCase(enq.id); }
    });
    list.append(li);
  });
}

// ----- Open case -----

function renderCase() {
  const main = el("div", "case-main");
  main.id = "case-main";

  if (!state.currentId) {
    const empty = el("div", "card empty");
    empty.append(el("h2", null, "Select a case"));
    empty.append(el("p", null, "Pick a case from the queue to review its draft. You can switch cases at any time. Your edits are kept."));
    const first = nextOpenCase();
    if (first) {
      const b = el("button", "btn btn-primary", "Start with " + first.id);
      b.addEventListener("click", function () { selectCase(first.id); });
      empty.append(b);
    }
    main.append(empty);
    return main;
  }

  const enq = byId(ENQUIRIES, state.currentId);
  const list = visibleEnquiries();
  const pos = list.findIndex(function (e) { return e.id === enq.id; });

  // Case bar: where you are, and previous / next.
  const bar = el("div", "case-bar");
  bar.append(el("span", "case-pos", pos === -1 ? enq.id : "Case " + (pos + 1) + " of " + list.length));
  const nav = el("div", "case-nav");
  const prev = el("button", "btn btn-small", "← Previous");
  prev.addEventListener("click", function () { moveCase(-1); });
  const next = el("button", "btn btn-small", "Next →");
  next.addEventListener("click", function () { moveCase(1); });
  nav.append(prev, next);
  bar.append(nav);
  main.append(bar);

  const card = el("section", "card");
  card.append(el("h2", null, enq.id + " · " + enq.subject));
  card.append(el("p", "row-meta", enq.sender + " · " + enq.received));
  card.append(el("p", null, enq.body));
  if (enq.hasImage) {
    card.append(el("div", "image-card", "Attached image (made up). The current tools cannot read this image, so an officer must open it."));
  }
  main.append(card);

  main.append(enq.draft ? renderDraft(enq) : renderHandoff(enq));
  return main;
}

// Shown after a decision so the officer can keep moving.
function nextCaseButton() {
  const n = nextOpenCase();
  if (!n) return el("span", "note", "All cases are done.");
  const b = el("button", "btn", "Next open case: " + n.id + " →");
  b.addEventListener("click", function () { selectCase(n.id); });
  return b;
}

// Keyboard: J and K move between cases, unless the officer is typing.
document.addEventListener("keydown", function (e) {
  const t = e.target;
  if (t && (t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "j" || e.key === "J") moveCase(1);
  if (e.key === "k" || e.key === "K") moveCase(-1);
});

// ---------- Citation check (tests the "AI invents policy" risk) ----------

// Checks one cited line against the policy library. Returns a list of problems.
// 1. The policy page must exist. 2. The passage must exist on that page.
// 3. Every number in the line must appear in the cited passage (catches a wrong fee or deadline).
function numbersIn(text) {
  return (text.match(/\d+(?:\.\d+)?/g) || []);
}

function checkLine(line, text) {
  if (!line.cite) return [];
  const policy = byId(POLICIES, line.cite.policy);
  if (!policy) return ["Policy page " + line.cite.policy + " is not in the policy library."];
  const passage = byId(policy.passages, line.cite.passage);
  if (!passage) return ["Passage " + line.cite.passage + " does not exist on " + line.cite.policy + "."];
  const known = numbersIn(passage.text);
  const bad = numbersIn(text).filter(function (n) { return known.indexOf(n) === -1; });
  if (bad.length > 0) return ["The line says " + bad.join(", ") + ", which the cited passage does not say."];
  return [];
}

function isTestCase(id) {
  const enq = byId(ENQUIRIES, id);
  return !!(enq && enq.draft && enq.draft.some(function (l) { return l.planted; }));
}

function enquiryHasUnresolvedProblem(enq) {
  if (!enq.draft) return false;
  const texts = state.edits[enq.id] || enq.draft.map(function (l) { return l.text; });
  return enq.draft.some(function (l, i) { return !isRemoved(enq.id, i) && checkLine(l, texts[i]).length > 0; });
}

function isRemoved(id, i) {
  return !!(state.removed[id] && state.removed[id][i]);
}

function enquiryHasProblem(enq) {
  return !!enq.draft && enq.draft.some(function (l) { return checkLine(l, l.text).length > 0; });
}

// Facilitator numbers for the test: how many planted fakes the check caught, and false alarms.
function checkStats() {
  let planted = 0, caught = 0, falseAlarms = 0;
  ENQUIRIES.forEach(function (enq) {
    (enq.draft || []).forEach(function (l) {
      const flagged = checkLine(l, l.text).length > 0;
      if (l.planted) { planted += 1; if (flagged) caught += 1; }
      else if (flagged) falseAlarms += 1;
    });
  });
  return { planted: planted, caught: caught, falseAlarms: falseAlarms };
}

// ---------- Confidence and inline policy details ----------

function confLevel(score) {
  if (score >= CONFIDENCE_THRESHOLD) return "high";
  if (score >= 80) return "medium";
  return "low";
}

// Overall draft confidence = average of the cited lines (made up scores).
function draftConfidence(enq) {
  const scores = enq.draft.filter(function (l) { return l.cite; }).map(function (l) { return l.confidence; });
  return Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
}

function confBadge(score, prefix) {
  const level = confLevel(score);
  const word = level === "high" ? "High" : level === "medium" ? "Medium" : "Low";
  return el("span", "conf conf-" + level, (prefix || "") + word + " · " + score + "%");
}

// Policy details, open by default, right below the cited line.
// Shows the page header and the cited passage. "Show all passages" reveals the rest of the page.
function policyBlock(policyId, highlightId) {
  const policy = byId(POLICIES, policyId);
  if (!policy) {
    const missing = el("div", "policy-inline policy-missing");
    missing.append(el("p", "policy-missing-title", policyId + " · not in the policy library"));
    missing.append(el("p", "policy-meta", "The draft cites a page that does not exist (made-up library). Do not rely on this line."));
    return missing;
  }
  const box = el("div", "policy-inline");
  const head = el("div", "policy-head");
  head.append(el("span", "policy-id", policy.id), el("span", "policy-title", policy.title));
  box.append(head);
  box.append(el("p", "policy-meta", "Last updated " + policy.updated + " · Owner: " + policy.owner));

  if (highlightId && !byId(policy.passages, highlightId)) {
    box.append(el("p", "policy-missing-title", "Cited passage " + highlightId + " does not exist on this page."));
  }
  const others = [];
  policy.passages.forEach(function (p) {
    const cited = highlightId === p.id;
    const node = el("p", "passage" + (cited ? " highlight" : ""));
    node.append(el("span", "passage-id", p.id + (cited ? " · cited" : "") + " "), document.createTextNode(p.text));
    if (highlightId && !cited && byId(policy.passages, highlightId)) { node.hidden = true; others.push(node); }
    box.append(node);
  });

  if (others.length > 0) {
    const more = el("button", "btn btn-link btn-tiny", "Show all " + policy.passages.length + " passages");
    more.addEventListener("click", function () {
      const show = others[0].hidden;
      others.forEach(function (n) { n.hidden = !show; });
      more.textContent = show ? "Show cited passage only" : "Show all " + policy.passages.length + " passages";
    });
    box.append(more);
  }
  return box;
}

// Collapse or expand the policy block under a line. Does not redraw, so edits are kept.
function togglePolicy(button, block) {
  block.hidden = !block.hidden;
  button.textContent = button.dataset.label + (block.hidden ? " ▸" : " ▾");
  button.title = block.hidden ? "Show the policy details" : "Hide the policy details";
}

// Draft with a citation after each line and the action buttons.
function renderDraft(enq) {
  const result = state.results[enq.id];
  const editedLines = state.edits[enq.id];
  const editing = !!state.editing[enq.id] && !result;
  const box = el("section", "card draft");
  box.append(el("h2", null, "Draft reply"));
  const top = el("div", "draft-top");
  top.append(el("p", "watermark", "DRAFT · for officer review · not sent"));
  top.append(confBadge(draftConfidence(enq), "Draft confidence: "));
  box.append(top);

  const banner = el("div", "check-banner");
  banner.id = "check-banner";
  box.append(banner);

  const lines = el("div", "draft-lines");
  enq.draft.forEach(function (line, i) {
    const flagged = line.cite && line.confidence < CONFIDENCE_THRESHOLD;
    const wrap = el("div", "draft-block");
    if (isRemoved(enq.id, i)) wrap.hidden = true;
    const row = el("p", "draft-line");
    const shown = editedLines ? editedLines[i] : line.text;
    const text = el("span", "draft-text" + (flagged ? " low-conf" : ""), shown);
    text.dataset.index = String(i);
    text.contentEditable = editing ? "true" : "false";
    text.addEventListener("input", function () { saveEdits(enq); refreshDraftChecks(enq); refreshQueue(); });
    row.append(text);

    const problem = el("div", "line-problem");
    problem.dataset.index = String(i);
    wrap.dataset.index = String(i);
    if (line.cite) {
      const label = line.cite.policy + " " + line.cite.passage;
      const c = el("button", "cite", label + " ▾");
      c.dataset.label = label;
      row.append(" ", c, " ", confBadge(line.confidence));
      wrap.append(row, problem);
      const block = policyBlock(line.cite.policy, line.cite.passage);   // expanded by default
      wrap.append(block);
      c.addEventListener("click", function () { togglePolicy(c, block); });
      c.title = "Hide the policy details";
    } else {
      wrap.append(row);
    }
    lines.append(wrap);
  });
  box.append(lines);

  if (enq.draft.some(function (l) { return l.cite && l.confidence < CONFIDENCE_THRESHOLD; })) {
    box.append(el("p", "note", "Dotted underline = confidence below " + CONFIDENCE_THRESHOLD + "% (made up). Check that line against its cited passage."));
  }

  const actions = el("div", "actions");
  if (result) {
    actions.append(el("span", "tag tag-done", OUTCOME_LABELS[result.outcome]), nextCaseButton());
  } else {
    const approve = el("button", "btn btn-primary", "Approve (does not send)");
    approve.id = "approve-btn";
    approve.addEventListener("click", function () { approveDraft(enq); });

    // Edit switches the lines to editable in place, without redrawing, so typing is kept.
    const edit = el("button", "btn", "Edit");
    edit.addEventListener("click", function () {
      state.editing[enq.id] = true;
      document.querySelectorAll(".draft-text").forEach(function (n) { n.contentEditable = "true"; });
      const first = document.querySelector(".draft-text");
      if (first) first.focus();
    });

    const restore = el("button", "btn", "Restore original");
    restore.addEventListener("click", function () {
      delete state.edits[enq.id];
      delete state.removed[enq.id];
      state.editing[enq.id] = false;
      render();
    });

    actions.append(approve, edit, restore);
  }
  box.append(actions);
  box.append(el("p", "note", "Approve only records your decision here. Nothing is sent and the case is not marked resolved. Switching cases keeps your edits."));
  return box;
}

// Current text of each line: what is on screen if the draft is open, else saved edits, else the original.
function linesNow(enq) {
  const nodes = document.querySelectorAll(".draft-text");
  if (state.currentId === enq.id && nodes.length === enq.draft.length) {
    return Array.prototype.map.call(nodes, function (n) { return n.textContent.trim(); });
  }
  return state.edits[enq.id] || enq.draft.map(function (l) { return l.text; });
}

// Re-run the citation check on the lines as they stand. Shows a warning under each bad line.
// Approve is blocked until every flagged line is fixed or removed, so a fake citation cannot be approved by accident.
function refreshDraftChecks(enq) {
  const texts = linesNow(enq);
  let total = 0;
  const slots = document.querySelectorAll(".line-problem");
  slots.forEach(function (slot) {
    const i = Number(slot.dataset.index);
    const problems = isRemoved(enq.id, i) ? [] : checkLine(enq.draft[i], texts[i]);
    slot.textContent = "";
    slot.className = "line-problem" + (problems.length ? " line-problem-on" : "");
    problems.forEach(function (p) { slot.append(el("p", "line-problem-text", "⚠ Citation check failed: " + p)); });
    if (problems.length && !state.results[enq.id]) {
      const rm = el("button", "btn btn-small", "Remove this line");
      rm.addEventListener("click", function () {
        state.removed[enq.id] = state.removed[enq.id] || {};
        state.removed[enq.id][i] = true;
        saveEdits(enq);
        render();
      });
      slot.append(rm);
    }
    total += problems.length;
  });

  const banner = document.getElementById("check-banner");
  if (banner) {
    banner.textContent = "";
    banner.className = "check-banner " + (total ? "check-bad" : "check-ok");
    banner.append(document.createTextNode(total
      ? "Citation check: " + total + " problem" + (total === 1 ? "" : "s") + " found. Fix or remove the flagged line" + (total === 1 ? "" : "s") + " before approving."
      : "Citation check: every cited policy page, passage and number matches the policy library."));
  }
  const approve = document.getElementById("approve-btn");
  if (approve) {
    approve.disabled = total > 0;
    approve.title = total ? "Fix the flagged lines first" : "";
  }
}

// Remember the lines as typed, so switching cases does not lose them.
function saveEdits(enq) {
  state.edits[enq.id] = currentDraftTexts();
}

// Cases with no draft: show why, the closest pages and a hand-off button.
function renderHandoff(enq) {
  const result = state.results[enq.id];
  const box = el("section", "card");
  box.append(el("h2", null, "No draft"));
  box.append(el("p", "handoff-note", enq.note));

  box.append(el("p", null, "Three closest policy pages:"));
  const ul = el("ul", "closest");
  enq.closest.forEach(function (pid) {
    const li = el("li");
    li.append(policyBlock(pid, null));   // expanded by default
    ul.append(li);
  });
  box.append(ul);

  const actions = el("div", "actions");
  if (result) {
    actions.append(el("span", "tag tag-done", OUTCOME_LABELS[result.outcome]), nextCaseButton());
  } else {
    const label = enq.status === "senior-officer" ? "Hand off to senior officer" : "I will take this one";
    const b = el("button", "btn btn-primary", label);
    b.addEventListener("click", function () {
      state.results[enq.id] = { outcome: "handed-off", firstActionSec: secondsSinceOpen(enq.id) };
      render();
    });
    actions.append(b);
  }
  box.append(actions);
  box.append(el("p", "note", "This records your choice here only. Nothing is sent."));
  return box;
}

// ---------- Approve and classify the edit ----------

function currentDraftTexts() {
  const nodes = document.querySelectorAll(".draft-text");
  return Array.prototype.map.call(nodes, function (n) { return n.textContent.trim(); });
}

// Share of words in the new text that were not in the original draft.
function changedShare(original, edited) {
  const pool = {};
  original.join(" ").split(/\s+/).forEach(function (w) {
    const k = w.toLowerCase();
    pool[k] = (pool[k] || 0) + 1;
  });
  const words = edited.join(" ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;
  let changed = 0;
  words.forEach(function (w) {
    const k = w.toLowerCase();
    if (pool[k] > 0) pool[k] -= 1; else changed += 1;
  });
  return changed / words.length;
}

function approveDraft(enq) {
  const stillBad = linesNow(enq).some(function (t, i) { return !isRemoved(enq.id, i) && checkLine(enq.draft[i], t).length > 0; });
  if (stillBad) return;   // blocked: a flagged citation is still in the draft
  const keep = enq.draft.map(function (l, i) { return !isRemoved(enq.id, i); });
  const original = enq.draft.map(function (l) { return l.text; }).filter(function (t, i) { return keep[i]; });
  const edited = currentDraftTexts().filter(function (t, i) { return keep[i]; });
  const sameText = original.join("\n") === edited.join("\n");
  let outcome;
  if (sameText) outcome = "approved-as-is";
  else if (changedShare(original, edited) > 0.5) outcome = "rewritten";
  else outcome = "approved-light";

  state.results[enq.id] = { outcome: outcome, firstActionSec: secondsSinceOpen(enq.id), hadProblem: enquiryHasProblem(enq) };
  state.editing[enq.id] = false;
  render();
}

// ---------- Main ----------

function render() {
  renderWorkspace();
  const enq = state.currentId ? byId(ENQUIRIES, state.currentId) : null;
  if (enq && enq.draft && !state.results[enq.id]) refreshDraftChecks(enq);
}

render();
