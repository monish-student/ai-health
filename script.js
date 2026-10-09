/* HealthCopilot AI demo. Data is saved only in this browser using localStorage. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const storageKey = "healthcopilot-demo-v1";
  const defaultState = { water: 0, mood: "", reflection: "", habits: {}, date: new Date().toDateString() };
  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!saved || saved.date !== new Date().toDateString()) return { ...defaultState, date: new Date().toDateString() };
      return { ...defaultState, ...saved };
    } catch (_) {
      return { ...defaultState, date: new Date().toDateString() };
    }
  }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch (_) { showToast("Browser storage is unavailable. Your changes may not be saved."); }
  }
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function render() {
    $("#waterCount").textContent = state.water;
    $("#waterProgress").style.width = `${Math.min(100, state.water / 8 * 100)}%`;
    $("#moodValue").textContent = state.mood || "Not set";
    $("#reflection").value = state.reflection || "";
    $$(".mood-option").forEach(button => button.classList.toggle("selected", button.dataset.mood === state.mood));
    $$("[data-habit]").forEach(input => { input.checked = Boolean(state.habits[input.dataset.habit]); });
    const done = Object.values(state.habits).filter(Boolean).length;
    $("#habitCount").textContent = `${done} of 4 completed`;
    $("#habitProgress").style.width = `${done / 4 * 100}%`;
  }

  const today = new Date();
  $("#todayDate").textContent = today.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  $("#addWater").addEventListener("click", () => {
    if (state.water >= 8) { showToast("You've reached your 8-glass tracking goal."); return; }
    state.water += 1;
    persist(); render();
    showToast("Water tracking updated.");
  });

  $$(".mood-option").forEach(button => button.addEventListener("click", () => {
    state.mood = button.dataset.mood;
    render();
  }));

  $("#saveCheckin").addEventListener("click", () => {
    if (!state.mood) { showToast("Choose a mood before saving your check-in."); return; }
    state.reflection = $("#reflection").value.trim();
    persist(); render();
    $("#checkinMessage").textContent = "Saved just now in this browser.";
    showToast("Your daily check-in has been saved.");
  });

  $$("[data-habit]").forEach(input => input.addEventListener("change", () => {
    state.habits[input.dataset.habit] = input.checked;
    persist(); render();
    showToast(input.checked ? "Habit marked complete." : "Habit updated.");
  }));

  const responses = [
    { words: ["sleep", "rest", "bed"], answer: "Try keeping a consistent sleep and wake time, creating a calm wind-down routine, and making your bedroom comfortable and quiet. Sleep needs vary by age and individual. If sleep problems persist, consider talking with a healthcare professional." },
    { words: ["water", "hydration", "drink"], answer: "Keep water accessible and drink regularly throughout the day. Fluid needs vary with activity, weather, diet, and health conditions, so use thirst and your clinician's guidance rather than treating a fixed number as right for everyone." },
    { words: ["stress", "anxious", "anxiety", "relax"], answer: "A short pause, slow comfortable breathing, gentle movement, or talking with someone you trust may help. If anxiety or stress feels overwhelming or continues to affect daily life, a qualified professional can help." },
    { words: ["exercise", "walk", "movement", "fitness"], answer: "Start with a manageable activity you enjoy, such as a short walk or gentle stretching, and increase gradually. Choose activity appropriate for your ability and seek medical advice if you have concerns about exercising safely." },
    { words: ["food", "diet", "eat", "nutrition", "meal"], answer: "A balanced eating pattern often includes a variety of vegetables and fruit, whole grains, protein sources, and enough fluids. Needs differ between people; a registered dietitian or healthcare professional can offer advice for your circumstances." }
  ];
  $("#askButton").addEventListener("click", () => {
    const question = $("#question").value.trim();
    const box = $("#answerBox");
    if (!question) { showToast("Type a wellness topic first."); $("#question").focus(); return; }
    const normalized = question.toLowerCase();
    const match = responses.find(item => item.words.some(word => normalized.includes(word)));
    box.textContent = match
      ? match.answer
      : "This demo doesn't have a connected AI service, so it can't answer that question directly. Try asking about sleep, hydration, stress, movement, or balanced meals. For personal medical concerns, contact a qualified healthcare professional.";
    box.hidden = false;
  });
  $("#question").addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); $("#askButton").click(); }
  });
  $("#menuButton").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $$(".nav-link").forEach(link => link.addEventListener("click", () => {
    $$(".nav-link").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    $("#sidebar").classList.remove("open");
  }));

  render();
})();
