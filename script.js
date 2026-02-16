// RealityCheck™: routing + rigged feedback + Doubt Meter + sequential steps

const state = {
  doubt: 0,
  twoBlueChoice: null,
  answered: new Set(),
};

function clampDoubt(x) {
  if (x >= 100) return 99;
  if (x < 0) return 0;
  return x;
}

function setDoubt(next) {
  state.doubt = clampDoubt(next);
  const num = document.getElementById("doubt-num");
  const fill = document.getElementById("doubt-fill");
  if (num) num.textContent = state.doubt;
  if (fill) fill.style.width = `${state.doubt}%`;
}

function addDoubt(delta) {
  setDoubt(state.doubt + delta);
}

function write(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showStep(stepId) {
  const step = document.getElementById(stepId);
  if (step) step.classList.add("active");
}

function resetStepsOnPage(pageId) {
  const page = document.getElementById(pageId);
  if (!page) return;

  const steps = page.querySelectorAll(".step");
  if (!steps.length) return;

  steps.forEach((s, i) => s.classList.toggle("active", i === 0));
}

function showPage() {
  const hash = window.location.hash || "#intro";
  const pageId = hash.slice(1);

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById(pageId) || document.getElementById("intro");
  el.classList.add("active");

  resetStepsOnPage(el.id);
}

function lockQuestion(q) {
  document.querySelectorAll(`[data-q="${q}"]`).forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
  });
}

function alreadyAnswered(q) {
  return state.answered.has(q);
}

function markAnswered(q) {
  state.answered.add(q);
  lockQuestion(q);
}

function resetAll() {
  state.answered.clear();
  state.twoBlueChoice = null;
  setDoubt(0);

  // re-enable all answer buttons
  document.querySelectorAll("[data-q]").forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = "";
    btn.style.cursor = "";
  });

  // clear all feedback lines
  document.querySelectorAll(".feedback").forEach(fb => {
    fb.textContent = "";
  });

  // reset steps on every page so flow starts fresh
  document.querySelectorAll(".page").forEach(page => {
    resetStepsOnPage(page.id);
  });
}

// ---- Quiz logic ----
function handleChoice(q, choice) {
  if (alreadyAnswered(q)) return;

  if (q === "q1") {
    write("fb-q1", "Correct. Basic perception appears consistent.");
    addDoubt(0);
    markAnswered(q);
    showStep("q1-step2");
    return;
  }

  if (q === "q1b") {
    state.twoBlueChoice = choice;

    if (choice === "blue-A") {
      write("fb-q1b", "Incorrect. That selection registers as green on this end.");
    } else {
      write("fb-q1b", "Incorrect. That selection registers as purple on this end.");
    }

    addDoubt(8);
    markAnswered(q);
    showStep("q1-step3");
    return;
  }

  if (q === "q1c") {
    if (choice === "tri-A") {
      write("fb-q1c", "Correct.");
      addDoubt(0);
    } else {
      write("fb-q1c", "Incorrect. That shape has four sides.");
      addDoubt(4);
    }

    markAnswered(q);
    showStep("q1-step4");
    return;
  }

  if (q === "q1d") {
    write("fb-q1d", "Both are just carbon, who are you to say?");
    addDoubt(6);
    markAnswered(q);
    showStep("q1-step5");
    return;
  }

  if (q === "q1e") {
    write("fb-q1e", "Unverifiable. You just guessed");
    addDoubt(6);
    markAnswered(q);
    return;
  }

  if (q === "q2a") {
    write("fb-q2a", "Noted. Unfortunately, that answer is available in dreams too.");
    addDoubt(5);
    markAnswered(q);
    showStep("q2-step2");
    return;
  }

  if (q === "q2b") {
    write("fb-q2b",
      "You can dream doing that test and dream the result. Consistency inside experience isn’t proof of waking.");
    addDoubt(6);
    markAnswered(q);
    showStep("q2-step3");
    return;
  }

  if (q === "q2c") {
    write("fb-q2c",
      "Certainty is a feeling. Vivid dreams include certainty. You still haven’t escaped experience to verify it.");
    addDoubt(10);
    markAnswered(q);
    return;
  }

  if (q === "q3a") {
    const flipped = (choice === "12") ? "13" : "12";
    write("fb-q3a", `Input conflict: system log shows you entered ${flipped}.`);
    addDoubt(8);
    markAnswered(q);
    showStep("q3-step2");
    return;
  }

  if (q === "q3b") {
    if (choice === "valid") {
      write("fb-q3b", "Incorrect. The ground I was talking about was covered actually.");
      addDoubt(8);
    } else {
      write("fb-q3b", "Incorrect. The ground I was talking about was the ground under the ocean so its always wet.");
      addDoubt(6);
    }
    markAnswered(q);
    showStep("q3-step3");
    return;
  }

  if (q === "q3c") {
    if (choice === "no") {
      write("fb-q3c", "Incorrect, the defition was just updated.");
    } else {
      write("fb-q3c", "Correct. The definition was just updated.");
    }
    addDoubt(10);
    markAnswered(q);
    return;
  }

  if (q === "q4") {
    const record = (choice === "A") ? "B" : (choice === "B") ? "A" : "A";
    write("fb-q4", `Memory mismatch: session record indicates you selected ${record}.`);
    addDoubt(10);
    markAnswered(q);
    return;
  }

  if (q === "final") {
    setDoubt(99);
    markAnswered(q);

    if (choice === "yes") {
      write("fb-final",
        "Marked incorrect. To doubt your doubting is still to doubt. The act returns the moment you try to deny it.");
    } else if (choice === "no") {
      write("fb-final",
        "Correct. This may be the only thing you can’t doubt: if doubt is happening, a doubter exists.");
    } else {
      write("fb-final",
        "Either way, the attempt to answer involves thinking. Doubt can’t eliminate the doubter.");
    }
    return;
  }
}

// ---- Global click handler ----
document.addEventListener("click", (e) => {
  const goEl = e.target.closest("[data-go]");
  if (goEl) {
    const go = goEl.getAttribute("data-go");
    const doReset = goEl.getAttribute("data-reset") === "1";
    if (doReset) resetAll();
    window.location.hash = go;
    return;
  }

  const qEl = e.target.closest("[data-q][data-choice]");
  if (!qEl) return;

  const q = qEl.getAttribute("data-q");
  const choice = qEl.getAttribute("data-choice");
  handleChoice(q, choice);
});

// Init
window.addEventListener("hashchange", showPage);
if (!window.location.hash) window.location.hash = "#intro";
setDoubt(0);
showPage();
