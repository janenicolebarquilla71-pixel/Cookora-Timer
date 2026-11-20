const display = document.getElementById("display");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");
const statusText = document.getElementById("timerStatus");
const toast = document.getElementById("toast");
let remaining = 600;
let initialDuration = 600;
let interval = null;
let running = false;
let history = [];
let audioContext = null;

function fillSelect(select, max, selected = 0) {
  for (let i = 0; i <= max; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = String(i).padStart(2, "0");
    if (i === selected) option.selected = true;
    select.appendChild(option);
  }
}
fillSelect(hours, 23, 0);
fillSelect(minutes, 59, 10);
fillSelect(seconds, 59, 0);

function formatTime(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}
function render() { display.textContent = formatTime(remaining); }
function setDuration(total, message = "Timer updated. Ready when you are!") {
  stopInterval();
  remaining = Math.max(0, total);
  initialDuration = remaining;
  render();
  statusText.textContent = message;
  document.querySelectorAll(".time-chip").forEach(btn => btn.classList.toggle("selected", Number(btn.dataset.minutes) * 60 === remaining));
}
function stopInterval() {
  if (interval) clearInterval(interval);
  interval = null;
  running = false;
}
function unlockAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();
  } catch (error) {
    audioContext = null;
  }
}
let alarmNodes = [];
let alarmTimeout = null;
function stopCompletionBeep() {
  alarmNodes.forEach(node => {
    try { node.stop(); } catch (error) { /* already stopped */ }
  });
  alarmNodes = [];
  if (alarmTimeout) clearTimeout(alarmTimeout);
  alarmTimeout = null;
  const stopButton = document.getElementById("stopAlarmBtn");
  if (stopButton) stopButton.hidden = true;
}
function playCompletionBeep() {
  if (!audioContext) return;
  stopCompletionBeep();
  try {
    if (audioContext.state === "suspended") audioContext.resume();
    const startAt = audioContext.currentTime + 0.05;
    const beepCount = 13;
    for (let i = 0; i < beepCount; i++) {
      const at = startAt + i * 0.62;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.18, at + 0.025);
      gain.gain.setValueAtTime(0.18, at + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.3);
      alarmNodes.push(oscillator);
    }
    const stopButton = document.getElementById("stopAlarmBtn");
    if (stopButton) stopButton.hidden = false;
    alarmTimeout = setTimeout(stopCompletionBeep, 8100);
  } catch (error) {
    console.warn("Timer sound could not play in this browser.", error);
    stopCompletionBeep();
  }
}
function startTimer() {
  if (running) return;
  if (remaining <= 0) remaining = initialDuration || 60;
  unlockAudio();
  running = true;
  statusText.textContent = "Timer is running. Happy cooking!";
  interval = setInterval(() => {
    remaining--;
    render();
    if (remaining <= 0) {
      stopInterval();
      statusText.textContent = "Time's up! Your dish is ready. ♡";
      showToast("⏰ Time's up! Check your cooking.");
      playCompletionBeep();
      addHistory(initialDuration);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Cookora Timer", { body: "Your cooking timer is finished!" });
      }
    }
  }, 1000);
}
function addHistory(duration) {
  history.unshift({duration, time: new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})});
  history = history.slice(0, 5);
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  document.getElementById("historyEmpty").hidden = true;
  history.forEach(item => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    const time = document.createElement("span");
    name.textContent = `Completed ${formatTime(item.duration)}`;
    time.textContent = item.time;
    li.append(name, time);
    list.appendChild(li);
  });
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2500);
}
document.getElementById("setTimerBtn").addEventListener("click", () => {
  const total = Number(hours.value) * 3600 + Number(minutes.value) * 60 + Number(seconds.value);
  if (!total) { showToast("Choose a time greater than zero."); return; }
  setDuration(total, "Custom timer set. Press Start when ready!");
});
document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", () => {
  if (!running) { statusText.textContent = "Timer is paused."; return; }
  stopInterval();
  statusText.textContent = "Timer paused. Take your time!";
});
document.getElementById("resetBtn").addEventListener("click", () => { stopCompletionBeep(); setDuration(initialDuration, "Timer reset and ready!"); });
document.getElementById("stopAlarmBtn").addEventListener("click", stopCompletionBeep);
document.querySelectorAll(".time-chip, .preset-card").forEach(btn => {
  btn.addEventListener("click", () => {
    const mins = Number(btn.dataset.minutes || 0);
    const secs = Number(btn.dataset.seconds || 0);
    setDuration(mins * 60 + secs, `${btn.textContent.trim().replace(/\s+/g, " ")} selected.`);
    if (btn.classList.contains("preset-card")) showToast(`${btn.querySelector("strong").textContent} preset selected!`);
  });
});
document.getElementById("filters").addEventListener("click", e => {
  const button = e.target.closest("[data-filter]");
  if (!button) return;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === button));
  const filter = button.dataset.filter;
  document.querySelectorAll(".recipe-card").forEach(card => card.hidden = filter !== "All" && card.dataset.category !== filter);
});

const recipes = {
  "Chicken Adobo": {
    time: "About 45 minutes",
    ingredients: ["½ kilo chicken", "¼ cup soy sauce", "¼ cup vinegar", "4 cloves garlic, crushed", "2 bay leaves", "½ tsp peppercorns", "1 cup water"],
    steps: ["Marinate chicken in soy sauce and garlic for at least 15 minutes.", "Put chicken and marinade in a pot. Add water, bay leaves, and pepper.", "Simmer until chicken is tender, around 25–30 minutes.", "Add vinegar. Let it boil without stirring for a few minutes, then simmer until the sauce tastes balanced."]
  },
  "Pork Sinigang": {
    time: "About 60 minutes",
    ingredients: ["½ kilo pork ribs or kasim", "1 tomato, quartered", "1 onion, sliced", "1 pack sinigang mix", "Radish and eggplant", "Kangkong or sitaw", "6 cups water"],
    steps: ["Boil pork with onion and tomato until the meat becomes tender. Add water as needed.", "Add radish and eggplant. Cook until almost tender.", "Stir in the sinigang mix and adjust the sourness to taste.", "Add kangkong or sitaw. Cook for 2–3 minutes, then serve hot."]
  },
  "Ginataang Sitaw at Kalabasa": {
    time: "About 30 minutes",
    ingredients: ["1 small kalabasa, cubed", "1 bundle sitaw, cut", "1 cup coconut milk (gata)", "2 cloves garlic", "1 small onion", "1 cup water", "Fish sauce or salt"],
    steps: ["Sauté garlic and onion in a little oil.", "Add kalabasa and water. Cover and cook until slightly tender.", "Pour in coconut milk and simmer gently.", "Add sitaw and season with fish sauce or salt. Cook until the vegetables are tender."]
  },
  "Ginisang Pechay": {
    time: "About 15 minutes",
    ingredients: ["2 bunches pechay, washed", "3 cloves garlic, chopped", "1 small onion, sliced", "1 tomato, sliced", "1 tbsp oyster sauce (optional)", "½ cup water", "Salt and pepper"],
    steps: ["Sauté garlic, onion, and tomato until fragrant and soft.", "Add the pechay stems and water. Cook for 2 minutes.", "Add the leaves and oyster sauce, if using.", "Season with salt and pepper. Cook just until the leaves wilt."]
  },
  "Ginisang Munggo": {
    time: "About 45 minutes",
    ingredients: ["1 cup munggo", "4 cups water", "3 cloves garlic", "1 small onion", "1 tomato", "Malunggay leaves", "Salt or fish sauce"],
    steps: ["Wash munggo, then boil in water until soft. Add more water if needed.", "In another pan, sauté garlic, onion, and tomato.", "Add the cooked munggo and its broth. Simmer for 5–10 minutes.", "Season to taste and add malunggay leaves. Cook until the leaves wilt."]
  },
  "Tortang Talong": {
    time: "About 25 minutes",
    ingredients: ["2 pieces eggplant", "2 eggs", "Salt and pepper", "Cooking oil"],
    steps: ["Boil or grill the eggplant until soft. Let it cool, then peel the skin.", "Flatten each eggplant with a fork while keeping the stem attached.", "Beat eggs with salt and pepper, then dip the eggplant in the mixture.", "Pan-fry until golden on both sides. Serve with rice and ketchup or suka."]
  },
  "Ginisang Sayote": {
    time: "About 20 minutes",
    ingredients: ["2 sayote, peeled and sliced", "100 g ground pork (optional)", "3 cloves garlic", "1 small onion", "1 tomato", "½ cup water", "Salt and pepper"],
    steps: ["Sauté garlic, onion, and tomato in a pan.", "Add ground pork, if using, and cook until no longer pink.", "Add sayote and water. Cover and simmer until tender but not mushy.", "Season with salt and pepper. Serve warm."]
  },
  "Fried Tilapia": {
    time: "About 25 minutes",
    ingredients: ["1 medium tilapia, cleaned", "½ tsp salt", "¼ tsp pepper", "1 tbsp calamansi juice (optional)", "Cooking oil"],
    steps: ["Pat the fish dry. Rub with salt, pepper, and calamansi juice.", "Heat enough oil in a pan over medium heat.", "Carefully fry the fish until golden and crisp on one side.", "Flip and cook the other side until fully cooked. Drain before serving."]
  }
};
function openRecipe(name) {
  const recipe = recipes[name];
  if (!recipe) return;
  document.getElementById("modalTitle").textContent = name;
  document.getElementById("modalTime").textContent = `◷ ${recipe.time}`;
  const ingredients = document.getElementById("modalIngredients");
  const steps = document.getElementById("modalSteps");
  ingredients.replaceChildren();
  steps.replaceChildren();
  recipe.ingredients.forEach(item => { const li = document.createElement("li"); li.textContent = item; ingredients.appendChild(li); });
  recipe.steps.forEach(item => { const li = document.createElement("li"); li.textContent = item; steps.appendChild(li); });
  document.getElementById("recipeModal").classList.add("open");
  document.getElementById("recipeModal").setAttribute("aria-hidden", "false");
}
document.getElementById("recipeGrid").addEventListener("click", e => {
  const button = e.target.closest("[data-recipe]");
  if (button) openRecipe(button.dataset.recipe);
});
function closeModal() {
  document.getElementById("recipeModal").classList.remove("open");
  document.getElementById("recipeModal").setAttribute("aria-hidden", "true");
}
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("modalDone").addEventListener("click", closeModal);
document.getElementById("recipeModal").addEventListener("click", e => { if (e.target.id === "recipeModal") closeModal(); });
document.getElementById("surpriseBtn").addEventListener("click", () => {
  const names = Object.keys(recipes);
  openRecipe(names[Math.floor(Math.random() * names.length)]);
});
document.getElementById("seeAll").addEventListener("click", () => {
  document.querySelector('[data-filter="All"]').click();
});
document.querySelectorAll("[data-nav]").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => item.classList.toggle("active", item === link));
  });
});
render();
