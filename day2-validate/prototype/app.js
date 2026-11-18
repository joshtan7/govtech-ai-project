// Screen 1: the inbox list. Reads ENQUIRIES from data/enquiries.js.
// Nothing is sent anywhere. No network calls.

function renderInbox() {
  const list = document.getElementById("inbox-list");
  list.textContent = "";

  ENQUIRIES.forEach(function (enq) {
    const row = document.createElement("li");
    row.className = "row";

    const main = document.createElement("div");
    main.className = "row-main";

    const id = document.createElement("span");
    id.className = "row-id";
    id.textContent = enq.id;

    const subject = document.createElement("span");
    subject.className = "row-subject";
    subject.textContent = enq.subject;

    const meta = document.createElement("span");
    meta.className = "row-meta";
    meta.textContent = enq.sender + " · " + enq.received;

    main.append(id, subject, meta);

    const side = document.createElement("div");
    side.className = "row-side";

    if (enq.hasImage) {
      const img = document.createElement("span");
      img.className = "tag tag-image";
      img.textContent = "Image (made up)";
      side.append(img);
    }

    const status = document.createElement("span");
    status.className = "tag tag-" + enq.status;
    status.textContent = STATUS_LABELS[enq.status];
    side.append(status);

    row.append(main, side);
    list.append(row);
  });

  document.getElementById("count").textContent =
    ENQUIRIES.length + " enquiries";
}

renderInbox();
