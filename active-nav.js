(function () {
  var current = window.location.pathname.split("/").pop() || "index.html";
  var sectionMap = {
    "overview.html": "overview.html",
    "packages.html": "packages.html",
    "correction-log.html": "correction-log.html",
    "technical-index.html": "technical-index.html",
    "portfolio-test-matrix.html": "technical-index.html"
  };

  var docsPath = window.location.pathname.indexOf("/docs/") !== -1;
  var activeHref = docsPath ? "docs/index.html" : sectionMap[current] || current;

  document.querySelectorAll(".navlinks a").forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var normalized = href.replace("../", "");

    if (
      normalized === activeHref ||
      (docsPath && (normalized.indexOf("docs/") === 0 || normalized.indexOf("index.html") === 0))
    ) {
      link.classList.add("active-page");
      link.setAttribute("aria-current", "page");
    }
  });
})();
