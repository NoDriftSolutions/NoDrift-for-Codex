const toast = document.querySelector(".toast");
let toastTimer;

function showPlaceholder(message) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

document.querySelectorAll("[data-placeholder]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showPlaceholder(button.getAttribute("data-placeholder"));
  });
});

document.querySelectorAll("[data-menu-toggle]").forEach((button) => {
  const header = button.closest(".site-header");
  if (!header) return;

  button.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-menu-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  header.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-menu-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
});

document.querySelectorAll("[data-evidence-carousel]").forEach((carousel) => {
  const section = carousel.closest(".evidence-timeline-section");
  const previous = section?.querySelector("[data-carousel-prev]");
  const next = section?.querySelector("[data-carousel-next]");
  const cards = carousel.querySelectorAll("[data-evidence-card]");

  function updateCarouselControls() {
    if (cards.length <= 1) {
      if (previous) previous.disabled = true;
      if (next) next.disabled = true;
      return;
    }

    const maximum = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    if (previous) previous.disabled = carousel.scrollLeft <= 2;
    if (next) next.disabled = carousel.scrollLeft >= maximum - 2;
  }

  function moveCarousel(direction) {
    carousel.scrollBy({
      left: direction * Math.max(280, carousel.clientWidth * 0.86),
      behavior: "smooth",
    });
  }

  previous?.addEventListener("click", () => moveCarousel(-1));
  next?.addEventListener("click", () => moveCarousel(1));
  carousel.addEventListener("scroll", updateCarouselControls, { passive: true });
  window.addEventListener("resize", updateCarouselControls);
  updateCarouselControls();
});

const currentProfile = document.querySelector("[data-current-profile]");
const profileNote = document.querySelector("[data-profile-note]");
const workflowSummary = document.querySelector("[data-workflow-summary]");
const communicationSummary = document.querySelector("[data-communication-summary]");
const tokenScore = document.querySelector("[data-token-estimate]");
const tokenLabel = document.querySelector("[data-token-label]");
const tokenMeter = document.querySelector("[data-token-meter]");
const rowSummaryCards = document.querySelectorAll("[data-row-summary]");

const profilePresets = {
  fast: {
    label: "Fast Work",
    note: "Shortest useful communication, light updates, brief explanation.",
    values: {
      "Work Leadership": "User Leads",
      "Question Handling": "Continue If Clear",
      "Communication Detail": "Direct Answer",
      "Language Level": "Plain Language",
      "Progress Updates": "Final Result Only",
      "Explanation Level": "Just Do The Work",
      "Evidence Status": "Critical Status Only",
    },
  },
  standard: {
    label: "Standard Work",
    note: "Clear default with visible approval boundaries.",
    values: {
      "Work Leadership": "Codex Leads With Approval",
      "Question Handling": "Group Questions",
      "Communication Detail": "Short Context",
      "Language Level": "Light Technical",
      "Progress Updates": "Milestone Updates",
      "Explanation Level": "Brief Notes",
      "Evidence Status": "Basic Status Labels",
    },
  },
  guided: {
    label: "Guided Work",
    note: "More explanation, visible progress, next-step guidance.",
    values: {
      "Work Leadership": "Codex Leads With Approval",
      "Question Handling": "One Question At A Time",
      "Communication Detail": "Fuller Context",
      "Language Level": "Technical When Useful",
      "Progress Updates": "Regular Updates",
      "Explanation Level": "Step By Step",
      "Evidence Status": "Detailed Source Labels",
    },
  },
  deep: {
    label: "Deep Support",
    note: "Highest explanation, visibility, and evidence status.",
    values: {
      "Work Leadership": "Approved Task Queue",
      "Question Handling": "Ask Before Major Steps",
      "Communication Detail": "Complete Explanation",
      "Language Level": "Full Technical",
      "Progress Updates": "Detailed Work Log",
      "Explanation Level": "Advanced Context",
      "Evidence Status": "Full Evidence Status",
    },
  },
};

let activeProfileKey = "standard";

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedButtonFor(groupName) {
  const group = document.querySelector(`[data-choice-group="${groupName}"]`);
  return group ? group.querySelector(".choice-button.is-selected") : null;
}

function setGroupChoice(groupName, choiceValue) {
  const group = document.querySelector(`[data-choice-group="${groupName}"]`);
  if (!group) return;
  group.querySelectorAll(".choice-button").forEach((button) => {
    button.classList.toggle("is-selected", button.getAttribute("data-choice") === choiceValue);
  });
}

function applyProfile(profileKey) {
  const preset = profilePresets[profileKey];
  if (!preset) return;
  activeProfileKey = profileKey;

  document.querySelectorAll("[data-profile]").forEach((button) => {
    button.classList.toggle("is-selected", button.getAttribute("data-profile") === profileKey);
  });

  Object.entries(preset.values).forEach(([groupName, choiceValue]) => {
    setGroupChoice(groupName, choiceValue);
  });

  updateProfileSummary();
}

function setCustomProfile() {
  activeProfileKey = "custom";
  document.querySelectorAll("[data-profile]").forEach((button) => button.classList.remove("is-selected"));
  updateProfileSummary();
}

function summaryKey(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function summarize(sectionName) {
  return Array.from(document.querySelectorAll(`[data-summary-section="${sectionName}"]`)).map((group) => {
    const selected = group.querySelector(".choice-button.is-selected");
    const label = group.getAttribute("data-choice-group");
    return {
      key: summaryKey(label),
      label,
      value: selected ? selected.getAttribute("data-choice") : "Not selected",
      score: selected ? Number.parseFloat(selected.getAttribute("data-token-score")) || null : null,
    };
  });
}

function renderSummary(target, rows) {
  if (!target) return;
  target.innerHTML = rows
    .map((row) => `<div><dt>${escapeHTML(row.label)}</dt><dd>${escapeHTML(row.value)}</dd></div>`)
    .join("");
}

function tokenLabelFor(average) {
  if (average <= 1.75) return "Lean";
  if (average <= 2.5) return "Efficient-balanced";
  if (average <= 3.25) return "Guided";
  return "High-support";
}

function tokenLevelFor(score) {
  if (score <= 1.75) return "Lean";
  if (score <= 2.5) return "Moderate";
  if (score <= 3.25) return "Strong";
  return "Intensive";
}

function formatScore(score) {
  return Number.isFinite(score) ? score.toFixed(1) : "0.0";
}

function updateTokenEstimate(rows) {
  const scoredRows = rows.filter((row) => row.score);
  if (!scoredRows.length) return;

  const average = scoredRows.reduce((total, row) => total + row.score, 0) / scoredRows.length;
  const rounded = Math.round(average * 10) / 10;
  const percent = (average / 4) * 100;

  if (tokenScore) tokenScore.textContent = formatScore(rounded);
  if (tokenLabel) tokenLabel.textContent = tokenLabelFor(average);
  if (tokenMeter) tokenMeter.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

function updateRowSummaries(rows) {
  rowSummaryCards.forEach((card) => {
    const row = rows.find((item) => item.key === card.getAttribute("data-row-summary"));
    if (!row) return;

    const score = row.score || 0;
    const percent = (score / 4) * 100;
    const value = card.querySelector("[data-row-value]");
    const scoreDisplay = card.querySelector("[data-row-score]");
    const label = card.querySelector("[data-row-label]");
    const meter = card.querySelector("[data-row-meter]");

    if (value) value.textContent = row.value;
    if (scoreDisplay) scoreDisplay.textContent = formatScore(score);
    if (label) label.textContent = tokenLevelFor(score);
    if (meter) meter.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  });
}

function updateProfileSummary() {
  if (currentProfile) {
    currentProfile.textContent =
      activeProfileKey === "custom" ? "Custom" : profilePresets[activeProfileKey]?.label || "Custom";
  }

  if (profileNote) {
    profileNote.textContent =
      activeProfileKey === "custom"
        ? "Custom profile. The settings below have been adjusted manually."
        : profilePresets[activeProfileKey]?.note || "";
  }

  const workflowRows = summarize("workflow");
  const communicationRows = summarize("communication");
  const scoredRows = [...workflowRows, ...communicationRows];
  renderSummary(workflowSummary, workflowRows);
  renderSummary(communicationSummary, communicationRows);
  updateRowSummaries(scoredRows);
  updateTokenEstimate(scoredRows);
}

document.querySelectorAll("[data-profile]").forEach((button) => {
  button.addEventListener("click", () => {
    applyProfile(button.getAttribute("data-profile"));
  });
});

document.querySelectorAll("[data-choice-group]").forEach((group) => {
  if (group.getAttribute("data-summary-section") === "profile") return;

  group.querySelectorAll(".choice-button").forEach((button) => {
    button.addEventListener("click", () => {
      group.querySelectorAll(".choice-button").forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      setCustomProfile();
    });
  });
});

updateProfileSummary();

(() => {
  const searchPages = [
    { title: "Home", url: "index.html" },
    { title: "Evidence", url: "audit-summary.html" },
    { title: "Customize", url: "customize.html" },
    { title: "Best Practices", url: "best-practices.html" },
    { title: "Troubleshooting", url: "troubleshooting.html" },
  ];

  const searchPresets = [
    {
      label: "User-friendly",
      options: [
        {
          key: "start",
          label: "How do I start?",
          query: "start setup buyer workspace guide customize",
          answerTitle: "How to start with NoDrift",
          answer:
            "After purchase, the buyer setup guide walks you through installation and first use. The public site does not publish the exact setup sequence or internal operating language.",
          links: [
            { page: "Home", title: "Overview", url: "index.html#top" },
            { page: "Customize", title: "Customize", url: "customize.html#workflow-settings-heading" },
          ],
        },
        {
          key: "files",
          label: "What files do I get?",
          query: "files package buyer private internal workspace",
          answerTitle: "What the workspace includes",
          answer:
            "The buyer package includes protected workspace materials for approvals, evidence, continuity, correction, setup, and examples. The exact file list is private internal information.",
          links: [
            { page: "Home", title: "Workspace Files", url: "index.html#included" },
            { page: "Evidence", title: "Paid Workspace", url: "audit-summary.html" },
          ],
        },
        {
          key: "customize",
          label: "How do I customize?",
          query: "customize communication profile token updates style",
          answerTitle: "How customization works",
          answer:
            "NoDrift lets the user choose communication style, detail level, progress visibility, and evidence labels without weakening buyer-only safeguards.",
          links: [
            { page: "Customize", title: "Workflow Settings", url: "customize.html#workflow-settings-heading" },
            { page: "Customize", title: "Communication Settings", url: "customize.html#communication-settings-heading" },
          ],
        },
        {
          key: "privacy",
          label: "What stays private?",
          query: "private internal protected buyer only public website",
          answerTitle: "What stays private",
          answer:
            "Private workspace records, exact setup wording, diagnostic checklists, correction records, and internal templates are buyer-only. The website explains the product without publishing the operating manual.",
          links: [
            { page: "Evidence", title: "Paid Workspace Includes", url: "audit-summary.html" },
            { page: "Troubleshooting", title: "Troubleshooting", url: "troubleshooting.html#start" },
          ],
        },
        {
          key: "payments",
          label: "How do payments work?",
          query: "payment price coming soon buy NoDrift Codex",
          answerTitle: "Current payment status",
          answer:
            "Payment is not active yet. NoDrift for Codex v1 has two US packages: Basic for US$120 and Extended for US$245.",
          links: [
            { page: "Home", title: "FAQ", url: "index.html#faq" },
            { page: "Home", title: "Overview", url: "index.html#top" },
          ],
        },
        {
          key: "what-is-nodrift",
          label: "What is NoDrift?",
          query: "what is NoDrift governed AI workspace Codex",
          answerTitle: "NoDrift in plain language",
          answer:
            "NoDrift is a governed workspace system for serious Codex work. It helps keep context, approvals, sources, evidence limits, and correction paths visible during long-running AI-assisted projects.",
          links: [
            { page: "Home", title: "Overview", url: "index.html#top" },
            { page: "Best Practices", title: "Beginner Practices", url: "best-practices.html#beginner-heading" },
          ],
        },
        {
          key: "who-is-it-for",
          label: "Who is it for?",
          query: "founders developers consultants agencies researchers operations teams",
          answerTitle: "Who NoDrift helps",
          answer:
            "NoDrift is for users and teams who use Codex for real work, especially when projects involve approvals, publishing, source material, client boundaries, or decisions that must survive beyond one chat.",
          links: [
            { page: "Home", title: "Who It Helps", url: "index.html#who" },
            { page: "Home", title: "FAQ", url: "index.html#faq" },
          ],
        },
        {
          key: "replace-codex",
          label: "Does it replace Codex?",
          query: "replace Codex extension wrapper reception layer",
          answerTitle: "NoDrift does not replace Codex",
          answer:
            "NoDrift does not replace Codex or change the AI model. It adds operating discipline around the workspace so the user and Codex work with clearer boundaries, records, and review habits.",
          links: [
            { page: "Evidence", title: "Reception Layer", url: "audit-summary.html" },
            { page: "Technical", title: "Technical Review", url: "technical-info.html" },
          ],
        },
        {
          key: "voice-images",
          label: "Can I use voice and images?",
          query: "voice screenshots images show screen verify tasks",
          answerTitle: "Use natural input, then verify",
          answer:
            "Yes. A NoDrift workflow can use voice, screenshots, pasted images, and careful review. The point is to give Codex better evidence and then verify what changed before trusting the result.",
          links: [
            { page: "Best Practices", title: "Beginner Practices", url: "best-practices.html#beginner-heading" },
            { page: "Home", title: "FAQ", url: "index.html#faq" },
          ],
        },
        {
          key: "public-safe",
          label: "What should not go public?",
          query: "do not publish private governance correction records file lists",
          answerTitle: "Keep private material private",
          answer:
            "Public pages can explain the product, problem, and safe evidence. They should not expose private workspace records, exact setup wording, diagnostic prompts, correction records, account details, or buyer-only operating material.",
          links: [
            { page: "Evidence", title: "Claim Boundary", url: "audit-summary.html" },
            { page: "Troubleshooting", title: "Public Boundary", url: "troubleshooting.html#triage-heading" },
          ],
        },
      ],
    },
    {
      label: "Troubleshooting",
      options: [
        {
          key: "troubleshooting",
          label: "Something went wrong",
          query: "troubleshooting wrong setup publishing private public",
          answerTitle: "Use buyer-guided troubleshooting",
          answer:
            "Troubleshooting happens inside the user's workspace. The buyer guide provides exact diagnostic wording and checklists; the public page only explains the support model.",
          links: [
            { page: "Troubleshooting", title: "Start Here", url: "troubleshooting.html#start" },
            { page: "Best Practices", title: "Best Practices", url: "best-practices.html#beginner-heading" },
          ],
        },
        {
          key: "private-public",
          label: "Private/public boundary",
          query: "private public publish upload github files",
          answerTitle: "Stop before publishing private material",
          answer:
            "Before publishing, uploading, pushing, sharing, or sending anything, separate public website files from private workspace records. Exact checklists are buyer-only.",
          links: [
            { page: "Troubleshooting", title: "Privacy", url: "troubleshooting.html#triage-heading" },
            { page: "Evidence", title: "Claim Boundary", url: "audit-summary.html" },
          ],
        },
        {
          key: "website-state",
          label: "Website state is unclear",
          query: "github pages local preview live website",
          answerTitle: "Separate preview, repository, and live site",
          answer:
            "Local preview, repository state, and live GitHub Pages are separate states. Buyer troubleshooting guidance explains how to check them safely.",
          links: [
            { page: "Troubleshooting", title: "Publishing", url: "troubleshooting.html#triage-heading" },
          ],
        },
        {
          key: "wrong-workspace",
          label: "Wrong workspace?",
          query: "wrong workspace folder path project files not found",
          answerTitle: "Confirm the active workspace first",
          answer:
            "If Codex seems to be working in the wrong folder, stop forward work and confirm the active workspace before editing. A wrong workspace can make correct actions happen in the wrong place.",
          links: [
            { page: "Troubleshooting", title: "Common Problems", url: "troubleshooting.html#triage-heading" },
          ],
        },
        {
          key: "setup-skipped",
          label: "Setup step was skipped",
          query: "setup skipped installation order customization first run",
          answerTitle: "Return to the setup order",
          answer:
            "If a setup step seems skipped, pause and verify the intended sequence before continuing. NoDrift is designed to make the workspace rules active before deeper project work begins.",
          links: [
            { page: "Troubleshooting", title: "Setup Problems", url: "troubleshooting.html#triage-heading" },
            { page: "Customize", title: "Customize", url: "customize.html#workflow-settings-heading" },
          ],
        },
        {
          key: "overclaims",
          label: "Codex overclaimed",
          query: "overclaim complete verified audited evidence too broad",
          answerTitle: "Narrow the claim to the evidence",
          answer:
            "If Codex says something is complete, verified, or ready, ask what evidence supports that exact claim. NoDrift separates checked work from plausible-sounding summary.",
          links: [
            { page: "Evidence", title: "Evidence Boundary", url: "audit-summary.html" },
            { page: "Best Practices", title: "Question Claims", url: "best-practices.html#beginner-heading" },
          ],
        },
        {
          key: "lost-context",
          label: "Context was lost",
          query: "lost context continuation handoff memory topic map",
          answerTitle: "Use continuity records",
          answer:
            "When context is missing or out of order, preserve the current objective, decisions, open questions, risks, files, and next actions before continuing. Do not reconstruct missing history from guesses.",
          links: [
            { page: "Home", title: "Continuity Records", url: "index.html#continuity-records" },
            { page: "Evidence", title: "Continuity", url: "audit-summary.html" },
          ],
        },
        {
          key: "approval-boundary",
          label: "When must Codex stop?",
          query: "approval save publish post push delete move external action",
          answerTitle: "Stop before consequential actions",
          answer:
            "Codex should stop before saving, publishing, pushing, deleting, moving, sending, configuring, or taking outside action unless the user gives explicit approval for that action point.",
          links: [
            { page: "Best Practices", title: "Approval Habits", url: "best-practices.html#advanced-heading" },
            { page: "Troubleshooting", title: "Boundary Problems", url: "troubleshooting.html#triage-heading" },
          ],
        },
        {
          key: "browser-preview",
          label: "Preview looks different",
          query: "browser preview cached local stale refresh pages not updated",
          answerTitle: "Check what you are actually viewing",
          answer:
            "A stale tab, local file, preview server, repository, and live site can all show different states. Verify the viewed URL and refresh path before assuming the website files are wrong.",
          links: [
            { page: "Troubleshooting", title: "Website State", url: "troubleshooting.html#triage-heading" },
          ],
        },
        {
          key: "private-files",
          label: "Private files appeared",
          query: "private files exposed public page correction records governance",
          answerTitle: "Treat exposure risk as a stop condition",
          answer:
            "If private filenames, correction records, account details, or buyer-only language appear in public material, stop and remove or rewrite that content before publishing anything.",
          links: [
            { page: "Troubleshooting", title: "Privacy Problems", url: "troubleshooting.html#triage-heading" },
            { page: "Evidence", title: "Public-Safe Evidence", url: "audit-summary.html" },
          ],
        },
      ],
    },
    {
      label: "Technical",
      options: [
        {
          key: "reception-layer",
          label: "Reception layer",
          query: "reception layer llm output verify accept record act",
          answerTitle: "What NoDrift adds",
          answer:
            "NoDrift does not change the model. It governs reception: what the work session accepts, verifies, records, corrects, rejects, or acts on after output arrives.",
          links: [
            { page: "Evidence", title: "Reception Layer", url: "audit-summary.html" },
            { page: "Home", title: "Does Not Control AI", url: "index.html#included" },
          ],
        },
        {
          key: "cross-platform",
          label: "Cross-platform use",
          query: "Codex Claude Code Claude ChatGPT Gemini DeepSeek",
          answerTitle: "How NoDrift adapts",
          answer:
            "NoDrift can adapt to different LLM workspaces when they support persistent instructions, project files, references, or repeatable workflow records. Exact adaptation details are private internal information.",
          links: [
            { page: "Evidence", title: "Across LLM Tools", url: "audit-summary.html" },
            { page: "Home", title: "Pipeline", url: "index.html#faq" },
          ],
        },
        {
          key: "evidence-boundary",
          label: "Evidence boundary",
          query: "evidence verified complete ready coverage public safe",
          answerTitle: "Evidence boundaries matter",
          answer:
            "NoDrift separates what was actually checked from what only sounds plausible. Broad readiness claims need evidence showing the real scope reviewed.",
          links: [
            { page: "Evidence", title: "Full Audit Summary", url: "audit-summary.html" },
            { page: "Best Practices", title: "Broad Claims", url: "best-practices.html#beginner-heading" },
          ],
        },
        {
          key: "source-discipline",
          label: "Source discipline",
          query: "source hierarchy files evidence verified references",
          answerTitle: "Sources must stay visible",
          answer:
            "NoDrift favors visible source hierarchy: what was read, what was searched, what was verified, and what remains unchecked. That reduces stale assumptions and unsupported conclusions.",
          links: [
            { page: "Evidence", title: "Evidence Records", url: "audit-summary.html" },
            { page: "Technical", title: "Technical Review", url: "technical-info.html" },
          ],
        },
        {
          key: "approval-gates",
          label: "Approval gates",
          query: "approval gates public external file changes user permission",
          answerTitle: "Approval gates separate capability from permission",
          answer:
            "NoDrift treats ability and approval as different things. Codex may be able to edit, publish, or push, but consequential action still needs explicit user approval.",
          links: [
            { page: "Best Practices", title: "Advanced Practices", url: "best-practices.html#advanced-heading" },
            { page: "Troubleshooting", title: "Approval Boundary", url: "troubleshooting.html#triage-heading" },
          ],
        },
        {
          key: "continuity-records",
          label: "Continuity records",
          query: "continuity records handoff topic map decisions open questions",
          answerTitle: "Continuity keeps long work navigable",
          answer:
            "Continuity records preserve objectives, decisions, open questions, files, risks, and next actions so a future Codex session does not have to guess what happened.",
          links: [
            { page: "Home", title: "Continuity Records", url: "index.html#continuity-records" },
            { page: "Evidence", title: "Continuity", url: "audit-summary.html" },
          ],
        },
        {
          key: "correction-loop",
          label: "Correction loop",
          query: "correction loop candidate error issue log fix verify",
          answerTitle: "Corrections become part of the system",
          answer:
            "NoDrift treats suspected mistakes as things to inspect, classify, correct, and verify. Public material can describe the loop without exposing private correction records.",
          links: [
            { page: "Home", title: "Correction Safeguards", url: "index.html#correction-safeguards" },
            { page: "Evidence", title: "Issue Log", url: "error-log.html" },
          ],
        },
        {
          key: "model-boundary",
          label: "Model boundary",
          query: "does not control model hallucination LLM output reception",
          answerTitle: "NoDrift governs the work around the model",
          answer:
            "NoDrift does not guarantee model behavior or eliminate all errors. It governs how work receives, checks, records, challenges, and acts on AI output.",
          links: [
            { page: "Evidence", title: "Reception Layer", url: "audit-summary.html" },
            { page: "Technical", title: "Technical Review", url: "technical-info.html" },
          ],
        },
        {
          key: "public-evidence",
          label: "Public evidence",
          query: "public safe evidence snapshot audit issue categories",
          answerTitle: "Public evidence is intentionally limited",
          answer:
            "Public evidence should show safe summaries, review boundaries, and issue categories without publishing private project memory, exact diagnostic prompts, or buyer-only files.",
          links: [
            { page: "Evidence", title: "Audit Summary", url: "audit-summary.html" },
            { page: "Evidence", title: "Issue Log", url: "error-log.html" },
          ],
        },
        {
          key: "future-tools",
          label: "Future tool editions",
          query: "future tools Claude Code Gemini ChatGPT editions adapt",
          answerTitle: "The method can expand beyond Codex",
          answer:
            "NoDrift begins with Codex, but the discipline can be adapted for other LLM/code-tool environments where instructions, references, approvals, and continuity records can be maintained.",
          links: [
            { page: "Evidence", title: "Across LLM Tools", url: "audit-summary.html" },
            { page: "Home", title: "FAQ", url: "index.html#faq" },
          ],
        },
      ],
    },
  ];

  const maximumInitialResults = 8;
  const maximumExpandedResults = 20;
  let searchIndexPromise;
  let searchIndex = [];
  let currentLimit = maximumInitialResults;
  let activePresetKey = "";
  let highlightedTarget;

  function normalizeSearchText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function slugifySearchText(value) {
    return normalizeSearchText(value).replace(/\s+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "section";
  }

  function cleanSearchText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function getSearchPreset(key) {
    return searchPresets.flatMap((group) => group.options).find((preset) => preset.key === key);
  }

  function makeSearchExcerpt(text, title) {
    const source = cleanSearchText(text.replace(title, " "));
    if (source.length <= 280) return source;
    const shortened = source.slice(0, 280);
    const sentenceEnd = Math.max(shortened.lastIndexOf(". "), shortened.lastIndexOf("? "), shortened.lastIndexOf("! "));
    if (sentenceEnd > 120) return `${shortened.slice(0, sentenceEnd + 1).trim()}...`;
    const wordEnd = shortened.lastIndexOf(" ");
    return `${shortened.slice(0, wordEnd > 120 ? wordEnd : 280).trim()}...`;
  }

  function stripSearchMarkup(node) {
    return cleanSearchText(node?.textContent || "");
  }

  function generatedHeadingId(heading, index) {
    return `search-${String(index + 1).padStart(2, "0")}-${slugifySearchText(stripSearchMarkup(heading))}`;
  }

  function addGeneratedSearchAnchors(root = document) {
    root.querySelectorAll("main h1, main h2, main h3, main h4").forEach((heading, index) => {
      if (!heading.id) heading.id = generatedHeadingId(heading, index);
    });
  }

  function highlightCurrentTarget() {
    if (!window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;
    if (highlightedTarget) highlightedTarget.classList.remove("search-target-highlight");
    highlightedTarget = target;
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
      target.classList.add("search-target-highlight");
      window.setTimeout(() => target.classList.remove("search-target-highlight"), 2600);
    });
  }

  function extractPageSearchEntries(html, page) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    addGeneratedSearchAnchors(doc);
    const main = doc.querySelector("main") || doc.body;
    const headings = [...main.querySelectorAll("h1, h2, h3, h4")];

    return headings
      .map((heading, index) => {
        const title = stripSearchMarkup(heading);
        if (!title || title.length < 3) return null;
        const container = heading.closest("article, section") || heading.parentElement || heading;
        const text = stripSearchMarkup(container);
        if (text.length < 45) return null;
        const id = heading.id || generatedHeadingId(heading, index);
        return {
          page: page.title,
          title,
          url: `${page.url}#${id}`,
          text,
          excerpt: makeSearchExcerpt(text, title),
        };
      })
      .filter(Boolean);
  }

  async function loadSearchIndex() {
    if (searchIndexPromise) return searchIndexPromise;
    searchIndexPromise = Promise.all(
      searchPages.map(async (page) => {
        try {
          const response = await fetch(page.url, { cache: "no-cache" });
          if (!response.ok) throw new Error(`Could not load ${page.url}`);
          return extractPageSearchEntries(await response.text(), page);
        } catch {
          const currentFile = window.location.pathname.split("/").pop() || "index.html";
          if (currentFile === page.url || (currentFile === "" && page.url === "index.html")) {
            return extractPageSearchEntries(document.documentElement.outerHTML, page);
          }
          return [];
        }
      })
    ).then((groups) => {
      searchIndex = groups.flat();
      return searchIndex;
    });
    return searchIndexPromise;
  }

  function scoreSearchEntry(entry, query) {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return 0;
    const tokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 1);
    const title = normalizeSearchText(entry.title);
    const body = normalizeSearchText(`${entry.page} ${entry.title} ${entry.text}`);
    let score = body.includes(normalizedQuery) ? 60 : 0;

    tokens.forEach((token) => {
      if (title.includes(token)) score += 12;
      if (body.includes(token)) score += 4;
    });

    const matchedTokens = tokens.filter((token) => body.includes(token)).length;
    if (tokens.length > 2 && matchedTokens < Math.ceil(tokens.length / 3)) return 0;
    return score;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function markSearchTerms(text, query) {
    const escaped = escapeHtml(text);
    const tokens = normalizeSearchText(query)
      .split(/\s+/)
      .filter((token) => token.length > 2)
      .slice(0, 6);
    if (!tokens.length) return escaped;
    return tokens.reduce((current, token) => {
      const expression = new RegExp(`(${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
      return current.replace(expression, "<mark>$1</mark>");
    }, escaped);
  }

  function buildSearchModal() {
    if (document.querySelector("[data-global-search-modal]")) return;

    const modal = document.createElement("div");
    modal.className = "global-search-modal";
    modal.setAttribute("data-global-search-modal", "");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "global-search-title");
    modal.innerHTML = `
      <div class="global-search-dialog">
        <div class="global-search-header">
          <div class="global-search-title-block">
            <h2 id="global-search-title">Search The Site</h2>
            <p class="global-search-categories">Preset categories: user-friendly, troubleshooting, technical.</p>
          </div>
          <button class="global-search-close" type="button" data-search-close aria-label="Close search">x</button>
        </div>
        <div class="global-search-body">
          <div class="global-search-controls">
            <input class="global-search-input" type="search" data-search-input placeholder="Search the site" autocomplete="off" />
            <select class="global-search-select" data-search-presets aria-label="Preset searches">
              <option value="">Preset searches</option>
            </select>
          </div>
          <p class="global-search-help" data-search-status>Preset questions show a direct answer first. Typed searches show matching sections.</p>
          <div class="global-search-results" data-search-results></div>
          <button class="global-search-more" type="button" data-search-more hidden>Show more results</button>
        </div>
      </div>
    `;

    const select = modal.querySelector("[data-search-presets]");
    searchPresets.forEach((group) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.label;
      group.options.forEach((preset) => {
        const option = document.createElement("option");
        option.value = preset.key;
        option.textContent = preset.label;
        optgroup.append(option);
      });
      select.append(optgroup);
    });

    document.body.append(modal);
  }

  function renderPresetAnswer(preset) {
    return `
      <article class="global-search-answer">
        <span>Direct answer</span>
        <h3>${escapeHtml(preset.answerTitle)}</h3>
        <p>${escapeHtml(preset.answer)}</p>
      </article>
    `;
  }

  function renderPresetLinks(preset) {
    if (!preset.links?.length) return "";
    return `
      <div class="global-search-guided-links" aria-label="Best supporting links">
        <h3>Best supporting links</h3>
        <div>
          ${preset.links
            .map(
              (link) => `
                <a class="global-search-guided-link" href="${escapeHtml(link.url)}">
                  <span>${escapeHtml(link.page)}</span>
                  <strong>${escapeHtml(link.title)}</strong>
                </a>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderSectionResults(entries, query) {
    return entries
      .map(
        (entry) => `
          <a class="global-search-result" href="${escapeHtml(entry.url)}">
            <span>${escapeHtml(entry.page)}</span>
            <strong>${markSearchTerms(entry.title, query)}</strong>
            <p>${markSearchTerms(entry.excerpt, query)}</p>
          </a>
        `
      )
      .join("");
  }

  function renderSearchResults(query) {
    const modal = document.querySelector("[data-global-search-modal]");
    if (!modal) return;
    const resultsElement = modal.querySelector("[data-search-results]");
    const status = modal.querySelector("[data-search-status]");
    const more = modal.querySelector("[data-search-more]");
    const preset = getSearchPreset(activePresetKey);
    const trimmed = query.trim();
    const effectiveQuery = preset?.query || trimmed;

    if (!trimmed && !preset) {
      resultsElement.innerHTML = `<p class="global-search-empty">Choose a preset or type a word to search the visible site pages.</p>`;
      status.textContent = "Preset questions show a direct answer first. Typed searches show matching sections.";
      more.hidden = true;
      return;
    }

    const ranked = searchIndex
      .map((entry) => ({ entry, score: scoreSearchEntry(entry, effectiveQuery) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.entry);

    if (preset) {
      const visible = ranked.slice(0, currentLimit === maximumExpandedResults ? 8 : 4);
      const related = visible.length
        ? `<h3 class="global-search-related-heading">Related matching sections</h3>${renderSectionResults(visible, effectiveQuery)}`
        : "";

      resultsElement.innerHTML = `${renderPresetAnswer(preset)}${renderPresetLinks(preset)}${related}`;
      status.textContent = `Showing a direct answer, ${preset.links?.length || 0} key link${
        preset.links?.length === 1 ? "" : "s"
      }${visible.length ? `, and ${visible.length} related section${visible.length === 1 ? "" : "s"}.` : "."}`;
      more.hidden = ranked.length <= visible.length || currentLimit >= maximumExpandedResults;
      return;
    }

    const visible = ranked.slice(0, currentLimit);
    status.textContent = ranked.length
      ? `${ranked.length} matching section${ranked.length === 1 ? "" : "s"} found. Showing ${visible.length}.`
      : "No matching sections found.";

    resultsElement.innerHTML = visible.length
      ? renderSectionResults(visible, trimmed)
      : `<p class="global-search-empty">No result found for "${escapeHtml(trimmed)}". Try a broader word or choose a preset.</p>`;

    more.hidden = ranked.length <= currentLimit || currentLimit >= maximumExpandedResults;
  }

  async function openGlobalSearch() {
    buildSearchModal();
    const modal = document.querySelector("[data-global-search-modal]");
    const input = modal.querySelector("[data-search-input]");
    const select = modal.querySelector("[data-search-presets]");
    const header = document.querySelector(".site-header");
    header?.classList.remove("is-menu-open");
    header?.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    await loadSearchIndex();
    currentLimit = maximumInitialResults;
    select.value = "";
    activePresetKey = "";
    renderSearchResults(input.value);
    input.focus();
  }

  function closeGlobalSearch() {
    const modal = document.querySelector("[data-global-search-modal]");
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function installGlobalSearch() {
    addGeneratedSearchAnchors();
    window.addEventListener("hashchange", highlightCurrentTarget);
    highlightCurrentTarget();

    const nav = document.querySelector(".nav-links");
    if (nav && !nav.querySelector("[data-search-open]")) {
      const button = document.createElement("button");
      button.className = "nav-search-button";
      button.type = "button";
      button.setAttribute("data-search-open", "");
      button.textContent = "Search";
      nav.append(button);
    }

    buildSearchModal();
    const modal = document.querySelector("[data-global-search-modal]");
    const input = modal.querySelector("[data-search-input]");
    const select = modal.querySelector("[data-search-presets]");
    const more = modal.querySelector("[data-search-more]");

    document.querySelectorAll("[data-search-open]").forEach((button) => {
      button.addEventListener("click", openGlobalSearch);
    });

    modal.querySelector("[data-search-close]").addEventListener("click", closeGlobalSearch);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeGlobalSearch();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeGlobalSearch();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openGlobalSearch();
      }
    });

    input.addEventListener("input", () => {
      currentLimit = maximumInitialResults;
      select.value = "";
      activePresetKey = "";
      renderSearchResults(input.value);
    });

    select.addEventListener("change", () => {
      currentLimit = maximumInitialResults;
      activePresetKey = select.value;
      const preset = getSearchPreset(activePresetKey);
      input.value = preset?.label || "";
      renderSearchResults(input.value);
      input.focus();
    });

    more.addEventListener("click", () => {
      currentLimit = maximumExpandedResults;
      renderSearchResults(input.value);
    });

    modal.addEventListener("click", (event) => {
      const link = event.target.closest(".global-search-result, .global-search-guided-link");
      if (!link) return;
      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      closeGlobalSearch();
      if (destination.pathname === current.pathname && destination.hash) {
        event.preventDefault();
        window.location.hash = destination.hash;
        highlightCurrentTarget();
      }
    });
  }

  installGlobalSearch();
})();
