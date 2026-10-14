/*
  Würth Christmas Calendar: parent-page helper for the eshop embed.
  Loaded by the FirstSpirit code section (see cms/firstspirit-embed.html).

  - Makes the calendar full width: breaks out of the capped CMS content column using
    documentElement.clientWidth. Not 100vw, which includes the scrollbar and causes
    sideways scroll (same approach as the MS1 page).
  - Sizes the iframe to the calendar's full height, so there's no inner scrollbar.
  - Tells the calendar which part of it is on screen, so the gift reveal, messages
    and confetti appear where the customer is looking.
  - Locks page scroll while the gift reveal is open, and scrolls to today's door.
*/
(function () {
  var box = document.getElementById("wurth-xmas");
  var frame = document.getElementById("wurth-xmas-frame");
  if (!box || !frame) return;
  var origin;
  try { origin = new URL(frame.src, location.href).origin; } catch (e) { return; }

  // Fallback for browsers without :has() (hides the breadcrumb on this page only)
  try { if (!(window.CSS && CSS.supports("selector(:has(*))"))) document.body.classList.add("wurth-xmas-host"); } catch (e) {}

  function setWidth() { box.style.setProperty("--wx-vw", document.documentElement.clientWidth + "px"); }

  function sendView() {
    var r = frame.getBoundingClientRect(), vh = window.innerHeight;
    var top = Math.max(0, -r.top);
    var height = Math.min(vh, r.bottom) - Math.max(0, r.top);
    if (!frame.contentWindow) return;
    try { frame.contentWindow.postMessage({ wurthXmas: 1, type: "view", top: top, height: Math.max(0, height) }, origin); } catch (e) {}
  }

  var queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(function () { queued = false; sendView(); });
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== origin || e.source !== frame.contentWindow) return;
    var d = e.data;
    if (!d || !d.wurthXmas) return;
    if (d.type === "height" && d.h > 0) { frame.style.height = d.h + "px"; queue(); }
    else if (d.type === "ready") { queue(); }
    else if (d.type === "lock") { document.documentElement.style.overflow = d.on ? "hidden" : ""; }
    else if (d.type === "scrollTo") {
      var r = frame.getBoundingClientRect();
      window.scrollTo({ top: window.pageYOffset + r.top + d.y - window.innerHeight / 2, behavior: "smooth" });
    }
  });

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", function () { setWidth(); queue(); });
  frame.addEventListener("load", queue);
  setWidth();
  queue();
})();
