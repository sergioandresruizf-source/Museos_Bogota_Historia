// Ventanas modales accesibles, confirmación propia (sin confirm()) y avisos breves.
import { ICONS } from "./icons.js";

const stack = [];
let onChange = () => {};
export function onModalStackChange(fn) { onChange = fn; }
export function modalCount() { return stack.length; }

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Abre una ventana modal.
 * @returns {{ el: HTMLElement, panel: HTMLElement, body: HTMLElement, close: Function }}
 */
export function openModal({ className = "", label = "Ventana", dismissible = true, closeButton = true, onClose } = {}) {
  const root = document.getElementById("modal-root") || document.body;
  const prevFocus = document.activeElement;
  const el = document.createElement("div");
  el.className = `modal ${className}`;
  el.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-panel" role="dialog" aria-modal="true" aria-label="${label}">
      ${closeButton ? `<button type="button" class="modal-close icon-btn" aria-label="Cerrar">${ICONS.close}</button>` : ""}
      <div class="modal-body"></div>
    </div>`;
  root.appendChild(el);
  const panel = el.querySelector(".modal-panel");
  const body = el.querySelector(".modal-body");
  let closed = false;

  const api = {
    el, panel, body, dismissible,
    close(reason) {
      if (closed) return;
      closed = true;
      const i = stack.indexOf(api);
      if (i >= 0) stack.splice(i, 1);
      el.classList.remove("is-open");
      el.classList.add("is-closing");
      setTimeout(() => el.remove(), 220);
      try { onClose?.(reason); } catch (e) { console.error(e); }
      onChange(stack.length);
      if (prevFocus && document.contains(prevFocus) && prevFocus.focus) prevFocus.focus({ preventScroll: true });
    },
    focusFirst() {
      const f = panel.querySelector("[autofocus]") || body.querySelector(FOCUSABLE) || panel.querySelector(FOCUSABLE);
      f?.focus({ preventScroll: true });
    },
    get closed() { return closed; },
  };
  if (closeButton) el.querySelector(".modal-close").addEventListener("click", () => api.dismissible && api.close("button"));
  el.querySelector(".modal-backdrop").addEventListener("click", () => api.dismissible && api.close("backdrop"));
  panel.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  stack.push(api);
  onChange(stack.length);
  requestAnimationFrame(() => { el.classList.add("is-open"); });
  setTimeout(() => api.focusFirst(), 30);
  return api;
}

/** Cierra la ventana superior si se puede (Esc). Devuelve true si cerró algo. */
export function closeTopModal() {
  const top = stack[stack.length - 1];
  if (!top) return false;
  if (top.dismissible) top.close("escape");
  return true;
}

/** Confirmación propia. Devuelve una promesa con true/false. */
export function confirmDialog({ title, text, confirmText = "Aceptar", cancelText = "Cancelar", danger = false }) {
  return new Promise((resolve) => {
    let answer = false;
    const m = openModal({ className: "modal-small confirm-modal", label: title, onClose: () => resolve(answer) });
    m.body.innerHTML = `
      <span class="eyebrow">Confirmación</span>
      <h2 class="modal-title">${title}</h2>
      <p class="modal-text">${text}</p>
      <div class="btn-row">
        <button type="button" class="btn btn-ghost" data-act="no">${cancelText}</button>
        <button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" data-act="yes">${confirmText}</button>
      </div>`;
    m.body.querySelector('[data-act="no"]').addEventListener("click", () => m.close("no"));
    m.body.querySelector('[data-act="yes"]').addEventListener("click", () => { answer = true; m.close("yes"); });
    setTimeout(() => m.body.querySelector('[data-act="no"]').focus(), 40);
  });
}

/** Aviso breve en la parte inferior. */
export function toast(html, { kind = "", ms = 3200 } = {}) {
  const root = document.getElementById("toasts");
  if (!root) return;
  const t = document.createElement("div");
  t.className = `toast ${kind}`;
  t.setAttribute("role", "status");
  t.innerHTML = html;
  root.appendChild(t);
  requestAnimationFrame(() => t.classList.add("is-in"));
  setTimeout(() => { t.classList.remove("is-in"); setTimeout(() => t.remove(), 400); }, ms);
}

/** Imprime solo un elemento (copiándolo a #print-root). */
export function printElement(el, mode = "report") {
  const root = document.getElementById("print-root");
  if (!root) { window.print(); return; }
  root.innerHTML = "";
  root.appendChild(el.cloneNode(true));
  document.body.classList.add("is-printing", `print-${mode}`);
  const done = () => {
    document.body.classList.remove("is-printing", `print-${mode}`);
    root.innerHTML = "";
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  setTimeout(() => { try { window.print(); } catch (e) { done(); } }, 60);
}
