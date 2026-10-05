import { World } from "./world.js";
import { areas } from "./content.js";
const canvas = document.querySelector("#world"),
  panel = document.querySelector("#panel"),
  interact = document.querySelector("#interact");
let returnFocus = null;
const world = new World(canvas, (id) => {
  interact.hidden = !id;
  if (id) {
    interact.querySelector("span").textContent = `Enter ${areas[id].name}`;
    document.querySelector("#world-status").textContent =
      areas[id].name + " · Press E to enter";
  } else document.querySelector("#world-status").textContent = "";
});
function openArea(id) {
  const area = areas[id];
  if (!area) return;
  returnFocus = document.activeElement;
  world.active = false;
  world.keys.clear();
  document.querySelector("#panel-kicker").textContent =
    `${area.number} / ${area.subtitle}`;
  const source = document.querySelector(`#${area.sectionId} .section-body`);
  const body = source.cloneNode(true);
  // Cloned dialog content must not duplicate document IDs.
  body
    .querySelectorAll("[id]")
    .forEach((element) => element.removeAttribute("id"));
  const title = document.createElement("h2");
  title.id = "panel-title";
  title.textContent = area.name;
  document.querySelector("#panel-content").replaceChildren(title, body);
  panel.showModal();
  panel.scrollTop = 0;
  document.querySelector("#close-panel").focus();
}
function closeArea() {
  panel.close();
}
panel.addEventListener("close", () => {
  world.active = true;
  world.keys.clear();
  returnFocus?.focus();
});
panel.addEventListener("click", (e) => {
  if (e.target === panel) {
    const b = panel.getBoundingClientRect();
    if (
      e.clientX < b.left ||
      e.clientX > b.right ||
      e.clientY < b.top ||
      e.clientY > b.bottom
    )
      closeArea();
  }
});
document.querySelector("#close-panel").addEventListener("click", closeArea);
document.querySelector("#return-world").addEventListener("click", closeArea);
document
  .querySelectorAll("[data-area]")
  .forEach((b) => b.addEventListener("click", () => openArea(b.dataset.area)));
interact.addEventListener("click", () => openArea(world.near));
const movement = {
  w: "up",
  ArrowUp: "up",
  a: "left",
  ArrowLeft: "left",
  s: "down",
  ArrowDown: "down",
  d: "right",
  ArrowRight: "right",
};
window.addEventListener("keydown", (e) => {
  if (panel.open || e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const focused = document.activeElement;
  if (focused !== canvas && focused !== document.body) return;
  if (movement[key]) {
    e.preventDefault();
    world.keys.add(movement[key]);
  }
  if ((key === "e" || key === "Enter") && world.near) {
    e.preventDefault();
    openArea(world.near);
  }
});
window.addEventListener("keyup", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  world.keys.delete(movement[key]);
});
window.addEventListener("blur", () => world.keys.clear());
document.addEventListener("visibilitychange", () => {
  world.keys.clear();
  if (document.hidden && audioContext) audioContext.suspend();
  else if (soundEnabled && audioContext) audioContext.resume();
});
canvas.addEventListener("pointerdown", () =>
  canvas.focus({ preventScroll: true }),
);
document.querySelectorAll("[data-move]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    world.keys.add(b.dataset.move);
  });
  const stop = () => world.keys.delete(b.dataset.move);
  b.addEventListener("pointerup", stop);
  b.addEventListener("pointercancel", stop);
  b.addEventListener("lostpointercapture", stop);
});
// Touch destination tap: clicking a nearby entrance opens it, a distant one remains explorable through navigation.
canvas.addEventListener("click", (e) => {
  if (e.pointerType === "touch" && world.near) openArea(world.near);
});
const motion = document.querySelector("#motion");
function updateMotion() {
  motion.setAttribute("aria-pressed", String(world.reduced));
  motion.querySelector("span").textContent = world.reduced
    ? "wind still"
    : "wind on";
  motion.setAttribute(
    "aria-label",
    world.reduced ? "Enable ambient motion" : "Reduce ambient motion",
  );
}
motion.addEventListener("click", () => {
  world.reduced = !world.reduced;
  updateMotion();
});
matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
  "change",
  (e) => {
    world.reduced = e.matches;
    updateMotion();
  },
);
updateMotion();
let audioContext = null,
  soundEnabled = false;
function createAmbience() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0.035;
  master.connect(context.destination);
  // A quiet harmonic drone under filtered, looping rain. Audio begins only after a user gesture.
  [130.81, 196, 261.63, 329.63].forEach((frequency, i) => {
    const osc = context.createOscillator(),
      gain = context.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = 0.07;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    const lfo = context.createOscillator(),
      lfoGain = context.createGain();
    lfo.frequency.value = 0.09 + i * 0.02;
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
  });
  const buffer = context.createBuffer(
    1,
    context.sampleRate * 4,
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const rain = context.createBufferSource(),
    filter = context.createBiquadFilter();
  rain.buffer = buffer;
  rain.loop = true;
  filter.type = "lowpass";
  filter.frequency.value = 650;
  rain.connect(filter);
  filter.connect(master);
  rain.start();
  return context;
}
document.querySelector("#sound").addEventListener("click", async () => {
  const button = document.querySelector("#sound");
  try {
    audioContext ??= createAmbience();
    if (!audioContext) {
      button.querySelector("span").textContent = "UNAVAILABLE";
      button.setAttribute("aria-label", "Ambient sound unavailable");
      return;
    }
    soundEnabled = !soundEnabled;
    await (soundEnabled ? audioContext.resume() : audioContext.suspend());
    button.setAttribute("aria-pressed", String(soundEnabled));
    button.setAttribute(
      "aria-label",
      soundEnabled ? "Disable ambient sound" : "Enable ambient sound",
    );
    button.querySelector("span").textContent = soundEnabled
      ? "sound on"
      : "sound off";
  } catch {
    soundEnabled = false;
    button.setAttribute("aria-pressed", "false");
    button.querySelector("span").textContent = "sound off";
  }
});
