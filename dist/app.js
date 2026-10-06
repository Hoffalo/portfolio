import { World } from "./world.js";
import { areas } from "./content.js";
const canvas = document.querySelector("#world"),
  panel = document.querySelector("#panel"),
  interact = document.querySelector("#interact");
let returnFocus = null;
const world = new World(canvas, (id) => {
  interact.hidden = !id;
  if (id) {
    const section =
      id === "gamedev" ? "game development" : areas[id].name.toLowerCase();
    interact.querySelector("span").textContent = `Enter the ${section} section`;
    document.querySelector("#world-status").textContent =
      `Press E to enter the ${section} section`;
  } else document.querySelector("#world-status").textContent = "";
});
const journey = document.querySelector("#journey-world");
let worldTop = 0,
  worldScale = 1,
  layoutWidth = 0,
  layoutHeight = 0;
function updateViewport() {
  const top = (scrollY - worldTop) / worldScale;
  world.viewport = {
    top: Math.max(0, top - 20),
    bottom: Math.min(world.layout.height, top + innerHeight / worldScale + 20),
  };
  world.visible = world.viewport.bottom > world.viewport.top;
  world.gameVisible =
    world.viewport.bottom > world.layout.skyHeight + 274 &&
    world.viewport.top < world.layout.skyHeight + 500;
  if (!world.gameVisible) world.keys.clear();
}
function resizeJourney() {
  const box = journey.getBoundingClientRect();
  worldTop = scrollY + box.top;
  worldScale = box.width / 960;
  if (
    Math.abs(box.width - layoutWidth) > 1 ||
    Math.abs(box.height - layoutHeight) > 1
  ) {
    layoutWidth = box.width;
    layoutHeight = box.height;
    const sections = [...document.querySelectorAll(".reading-section")].map(
      (section) => {
        const rect = section.getBoundingClientRect();
        return {
          id: section.id,
          x: (rect.left - box.left) / worldScale,
          y: (rect.top - box.top) / worldScale,
          width: rect.width / worldScale,
          height: rect.height / worldScale,
        };
      },
    );
    world.setLayout({
      height: Math.ceil(box.height / worldScale / 2) * 2,
      sections,
      skyHeight:
        document.querySelector(".sky-header").getBoundingClientRect().height /
        worldScale,
      moonY:
        (document.querySelector(".header").getBoundingClientRect().top -
          box.top +
          document.querySelector(".header").getBoundingClientRect().height *
            (innerWidth <= 700 ? 0.42 : 0.2)) /
        worldScale,
      mobile: innerWidth <= 700,
      tablet: innerWidth > 700 && innerWidth <= 1100,
    });
  }
  updateViewport();
}
resizeJourney();
new ResizeObserver(resizeJourney).observe(journey);
document.fonts.ready.then(resizeJourney);
addEventListener("scroll", updateViewport, { passive: true });
addEventListener("resize", resizeJourney);
function stopExploring() {
  world.keys.clear();
  if (document.activeElement === canvas) canvas.blur();
}
addEventListener("wheel", stopExploring, { passive: true });
canvas.addEventListener("pointercancel", stopExploring);
document
  .querySelectorAll(".reading-section,.reading-invitation,.social-links")
  .forEach((element) => element.addEventListener("pointerdown", stopExploring));
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
  if (panel.open || !world.gameVisible || e.ctrlKey || e.metaKey || e.altKey)
    return;
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
});
canvas.addEventListener("pointerdown", (event) => {
  const y =
    (event.clientY + scrollY - worldTop) / worldScale - world.layout.skyHeight;
  if (y >= 0 && y <= 540) canvas.focus({ preventScroll: true });
});
document.querySelectorAll("[data-move]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    canvas.focus({ preventScroll: true });
    world.keys.add(b.dataset.move);
  });
  const stop = () => world.keys.delete(b.dataset.move);
  b.addEventListener("pointerup", stop);
  b.addEventListener("pointercancel", stop);
  b.addEventListener("lostpointercapture", stop);
});
// Touch destination tap: clicking a nearby entrance opens it, a distant one remains explorable through navigation.
canvas.addEventListener("click", (e) => {
  const y =
    (e.clientY + scrollY - worldTop) / worldScale - world.layout.skyHeight;
  if (
    e.pointerType === "touch" &&
    world.gameVisible &&
    y >= 0 &&
    y <= 540 &&
    world.near
  )
    openArea(world.near);
});
matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
  "change",
  (e) => {
    world.reduced = e.matches;
  },
);
