// Entrada: teclado (flechas/WASD, E/Espacio/Enter, Esc) + joystick táctil + botón de acción.

const KEYMAP = {
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
};
const ACTION_KEYS = new Set(["KeyE", "Space", "Enter", "NumpadEnter"]);

export function createInput({ joystickEl, knobEl, actionEl }) {
  const held = new Set();
  const handlers = { action: [], pause: [], firstInteraction: [] };
  let enabled = false;
  let joy = { active: false, id: null, cx: 0, cy: 0, x: 0, y: 0 };
  let interacted = false;

  const emit = (name) => handlers[name].forEach((fn) => fn());
  const markInteraction = () => {
    if (!interacted) { interacted = true; emit("firstInteraction"); }
  };

  const isTypingTarget = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

  window.addEventListener("keydown", (e) => {
    markInteraction();
    if (isTypingTarget(e.target)) return;
    if (e.code === "Escape") { emit("pause"); return; }
    if (!enabled) return;
    const dir = KEYMAP[e.code];
    if (dir) { held.add(dir); e.preventDefault(); return; }
    if (ACTION_KEYS.has(e.code) && !e.repeat) {
      // Evita que Enter/Espacio "pulsen" otro botón enfocado mientras se camina
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      e.preventDefault();
      emit("action");
    }
  });
  window.addEventListener("keyup", (e) => {
    const dir = KEYMAP[e.code];
    if (dir) held.delete(dir);
  });
  window.addEventListener("blur", () => { held.clear(); resetJoy(); });
  window.addEventListener("pointerdown", markInteraction, { capture: true });

  // ---- Joystick táctil ----
  const RADIUS = 46;
  function resetJoy() {
    joy.active = false; joy.id = null; joy.x = 0; joy.y = 0;
    if (knobEl) knobEl.style.transform = "translate(-50%, -50%)";
    joystickEl?.classList.remove("is-active");
  }
  function moveJoy(e) {
    let dx = e.clientX - joy.cx, dy = e.clientY - joy.cy;
    const d = Math.hypot(dx, dy);
    if (d > RADIUS) { dx = (dx / d) * RADIUS; dy = (dy / d) * RADIUS; }
    joy.x = dx / RADIUS; joy.y = dy / RADIUS;
    if (knobEl) knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }
  if (joystickEl) {
    joystickEl.addEventListener("pointerdown", (e) => {
      if (!enabled) return;
      e.preventDefault();
      const r = joystickEl.getBoundingClientRect();
      joy.active = true; joy.id = e.pointerId;
      joy.cx = r.left + r.width / 2; joy.cy = r.top + r.height / 2;
      joystickEl.setPointerCapture?.(e.pointerId);
      joystickEl.classList.add("is-active");
      moveJoy(e);
    });
    joystickEl.addEventListener("pointermove", (e) => { if (joy.active && e.pointerId === joy.id) moveJoy(e); });
    const end = (e) => { if (e.pointerId === joy.id) resetJoy(); };
    joystickEl.addEventListener("pointerup", end);
    joystickEl.addEventListener("pointercancel", end);
    joystickEl.addEventListener("lostpointercapture", end);
  }
  if (actionEl) {
    actionEl.addEventListener("pointerdown", (e) => { if (!enabled) return; e.preventDefault(); actionEl.classList.add("is-pressed"); emit("action"); });
    const up = () => actionEl.classList.remove("is-pressed");
    actionEl.addEventListener("pointerup", up);
    actionEl.addEventListener("pointercancel", up);
    actionEl.addEventListener("click", (e) => { if (e.detail === 0 && enabled) emit("action"); }); // activación por teclado
  }

  return {
    axis() {
      let x = 0, y = 0;
      if (held.has("left")) x -= 1;
      if (held.has("right")) x += 1;
      if (held.has("up")) y -= 1;
      if (held.has("down")) y += 1;
      if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      if (joy.active) {
        const m = Math.hypot(joy.x, joy.y);
        if (m > 0.18) { x = joy.x; y = joy.y; }
      }
      return { x, y };
    },
    setEnabled(v) { enabled = v; if (!v) { held.clear(); resetJoy(); } },
    get enabled() { return enabled; },
    on(name, fn) { handlers[name].push(fn); },
    get hasInteracted() { return interacted; },
  };
}
