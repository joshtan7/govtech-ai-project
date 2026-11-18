// Officer prototype. Two screens: inbox list and enquiry view.
// Reads ENQUIRIES and POLICIES from data/. No network calls. Nothing is sent.

const state = {
  view: "inbox",        // "inbox" or "enquiry"
  currentId: null,
  openedAt: 0,          // ms timestamp when the enquiry was opened
  policyId: null,       // policy page shown in the side panel
  highlight: null,      // passage id to highlight
  editing: false,
  // Per-enquiry result: { outcome, label, firstActionSec }
  results: {}
};

// Outcomes shown on the inbox and counted in the tally.
const OUTCOME_LABELS = {
  "approved-as-is": "Approved as is (not sent)",
  "approved-light": "Approved after light edit (not sent)",
  "rewritten": "Approved after heavy rewrite (not sent)",
  "handed-off": "Handed to officer (not sent)"
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

// ---------- Inbox ----------

function renderInbox() {
  const root = document.getElementById("app");
  root.textContent = "";

  root.append(renderTally());
  root.append(el("h2", "section-title", "Inbox · " + ENQUIRIES.length + " enquiries"));
  const list = el("ul", "inbox");

  ENQUIRIES.forEach(function (enq) {
    const row = el("li", "row");
    row.tabIndex = 0;
    row.setAttribute("role", "button");

    const main = el("div", "row-main");
    main.append(
      el("span", "row-id", enq.id),
      el("span", "row-subject", enq.subject),
      el("span", "row-meta", enq.sender + " · " + enq.received)
    );

    const side = el("div", "row-side");
    if (enq.hasImage) side.append(el("span", "tag tag-image", "Image (made up)"));
    side.append(el("span", "tag tag-" + enq.status, STATUS_LABELS[enq.status]));
    const result = state.results[enq.id];
    if (result) side.append(el("span", "tag tag-done", OUTCOME_LABELS[result.outcome]));

    row.append(main, side);
    row.addEventListener("click", function () { openEnquiry(enq.id); });
    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnquiry(enq.id); }
    });
    list.append(row);
  });

  root.append(list);
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

  const drafted = counts["approved-as-is"] + counts["approved-light"] + counts["rewritten"];
  const sentLight = counts["approved-as-is"] + counts["approved-light"];

  const cards = el("div", "stats");
  [
    { label: "Approved as is", value: String(counts["approved-as-is"]) },
    { label: "Light edit", value: String(counts["approved-light"]) },
    { label: "Heavy rewrite", value: String(counts["rewritten"]) },
    { label: "Handed off", value: String(counts["handed-off"]) },
    { label: "First action over 30s", value: String(slow) },
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

// ---------- Enquiry view ----------

function openEnquiry(id) {
  const enq = byId(ENQUIRIES, id);
  state.view = "enquiry";
  state.currentId = id;
  state.openedAt = Date.now();
  state.editing = false;
  state.highlight = null;
  state.policyId = enq.draft ? enq.draft[0].cite ? enq.draft[0].cite.policy : enq.draft[1].cite.policy
                             : enq.closest[0];
  render();
}

function backToInbox() {
  state.view = "inbox";
  state.currentId = null;
  render();
}

function secondsSinceOpen() {
  return Math.round((Date.now() - state.openedAt) / 1000);
}

function renderEnquiry() {
  const enq = byId(ENQUIRIES, state.currentId);
  const root = document.getElementById("app");
  root.textContent = "";

  const back = el("button", "btn btn-link", "← Back to inbox");
  back.addEventListener("click", backToInbox);
  root.append(back);

  const grid = el("div", "grid");
  const left = el("div", "col");
  const right = el("div", "col");

  // Enquiry card
  const card = el("section", "card");
  card.append(el("h2", null, enq.id + " · " + enq.subject));
  card.append(el("p", "row-meta", enq.sender + " · " + enq.received));
  card.append(el("p", null, enq.body));
  if (enq.hasImage) {
    card.append(el("div", "image-card", "Attached image (made up). The current tools cannot read this image, so an officer must open it."));
  }
  left.append(card);

  if (enq.draft) {
    left.append(renderDraft(enq));
  } else {
    left.append(renderHandoff(enq));
  }

  right.append(renderPolicyPanel());

  grid.append(left, right);
  root.append(grid);
}

// Draft with a citation after each line and the action buttons.
function renderDraft(enq) {
  const result = state.results[enq.id];
  const box = el("section", "card draft");
  box.append(el("h2", null, "Draft reply"));
  box.append(el("p", "watermark", "DRAFT · for officer review · not sent"));

  const lines = el("div", "draft-lines");
  enq.draft.forEach(function (line, i) {
    const wrap = el("p", "draft-line");
    const text = el("span", "draft-text" + (line.lowConf ? " low-conf" : ""), line.text);
    text.dataset.index = String(i);
    text.contentEditable = state.editing && !result ? "true" : "false";
    if (line.lowConf) text.title = "Lower confidence. Check this line against the cited passage.";
    wrap.append(text);

    if (line.cite) {
      const c = el("button", "cite", "[" + line.cite.policy + " " + line.cite.passage + "]");
      c.title = "Show the cited passage";
      c.addEventListener("click", function () {
        state.policyId = line.cite.policy;
        state.highlight = line.cite.passage;
        renderPolicyInto();
      });
      wrap.append(" ", c);
    }
    lines.append(wrap);
  });
  box.append(lines);

  if (enq.draft.some(function (l) { return l.lowConf; })) {
    box.append(el("p", "note", "Dotted underline = lower confidence. Check it against the cited passage."));
  }

  const actions = el("div", "actions");
  if (result) {
    actions.append(el("span", "tag tag-done", OUTCOME_LABELS[result.outcome]));
  } else {
    const approve = el("button", "btn btn-primary", "Approve (does not send)");
    approve.addEventListener("click", function () { approveDraft(enq); });

    // Edit switches the lines to editable in place, without redrawing, so typing is kept.
    const edit = el("button", "btn", "Edit");
    edit.addEventListener("click", function () {
      state.editing = true;
      document.querySelectorAll(".draft-text").forEach(function (n) {
        n.contentEditable = "true";
      });
      const first = document.querySelector(".draft-text");
      if (first) first.focus();
    });

    const restore = el("button", "btn", "Restore original");
    restore.addEventListener("click", function () {
      state.editing = false;
      render();
    });

    actions.append(approve, edit, restore);
  }
  box.append(actions);
  box.append(el("p", "note", "Approve only records your decision here. Nothing is sent and the case is not marked resolved."));
  return box;
}

// Cases with no draft: show why, the closest pages and a hand-off button.
function renderHandoff(enq) {
  const result = state.results[enq.id];
  const box = el("section", "card");
  box.append(el("h2", null, "No draft"));
  box.append(el("p", "handoff-note", enq.note));

  box.append(el("p", null, "Three closest policy pages:"));
  const ul = el("ul");
  enq.closest.forEach(function (pid) {
    const li = el("li");
    const b = el("button", "btn btn-link", pid + " · " + byId(POLICIES, pid).title);
    b.addEventListener("click", function () {
      state.policyId = pid;
      state.highlight = null;
      renderPolicyInto();
    });
    li.append(b);
    ul.append(li);
  });
  box.append(ul);

  const actions = el("div", "actions");
  if (result) {
    actions.append(el("span", "tag tag-done", OUTCOME_LABELS[result.outcome]));
  } else {
    const label = enq.status === "senior-officer" ? "Hand off to senior officer" : "I will take this one";
    const b = el("button", "btn btn-primary", label);
    b.addEventListener("click", function () {
      state.results[enq.id] = { outcome: "handed-off", firstActionSec: secondsSinceOpen() };
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
  const original = enq.draft.map(function (l) { return l.text; });
  const edited = currentDraftTexts();
  const sameText = original.join("\n") === edited.join("\n");
  let outcome;
  if (sameText) outcome = "approved-as-is";
  else if (changedShare(original, edited) > 0.5) outcome = "rewritten";
  else outcome = "approved-light";

  state.results[enq.id] = { outcome: outcome, firstActionSec: secondsSinceOpen() };
  state.editing = false;
  render();
}

// ---------- Policy side panel ----------

function renderPolicyPanel() {
  const box = el("section", "card policy-panel");
  box.id = "policy-panel";
  fillPolicy(box);
  return box;
}

function renderPolicyInto() {
  const box = document.getElementById("policy-panel");
  box.textContent = "";
  fillPolicy(box);
  const hit = box.querySelector(".passage.highlight");
  if (hit && hit.scrollIntoView) hit.scrollIntoView({ block: "nearest" });
}

function fillPolicy(box) {
  box.append(el("h2", null, "Policy page (made up)"));
  const policy = byId(POLICIES, state.policyId);
  box.append(el("p", "row-id", policy.id));
  box.append(el("h3", null, policy.title));
  policy.passages.forEach(function (p) {
    const cls = "passage" + (state.highlight === p.id ? " highlight" : "");
    const node = el("p", cls);
    node.append(el("span", "passage-id", p.id + " "), document.createTextNode(p.text));
    box.append(node);
  });
}

// ---------- Main ----------

function render() {
  if (state.view === "inbox") renderInbox();
  else renderEnquiry();
}

render();
