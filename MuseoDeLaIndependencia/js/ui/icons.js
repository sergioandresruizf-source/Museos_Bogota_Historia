// Íconos SVG en línea (sin dependencias externas).
const svg = (body, vb = "0 0 24 24") =>
  `<svg class="icon" viewBox="${vb}" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const ICONS = {
  coin: `<svg class="icon icon-coin" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" fill="#e2b85a" stroke="#9a6d1f" stroke-width="1.4"/><circle cx="12" cy="12" r="6.6" fill="none" stroke="#9a6d1f" stroke-width="1" stroke-dasharray="1.6 1.4"/><path d="M12 7.6l1.2 2.7 2.9.3-2.2 1.9.7 2.9-2.6-1.6-2.6 1.6.7-2.9-2.2-1.9 2.9-.3z" fill="#9a6d1f"/></svg>`,
  badge: svg('<circle cx="12" cy="9" r="6"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/><path d="M12 6.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z" fill="currentColor" stroke="none"/>'),
  book: svg('<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5"/><path d="M9 7h7M9 10.5h5"/>'),
  sound: svg('<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>'),
  mute: svg('<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  back: svg('<path d="M15 18l-6-6 6-6"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  play: svg('<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>'),
  print: svg('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'),
  reset: svg('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  scroll: svg('<path d="M8 3h11a2 2 0 0 1 2 2v2h-4"/><path d="M17 7v12a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3v-1h11v1a2 2 0 0 0 2 2"/><path d="M8 3a3 3 0 0 0-3 3v11"/><path d="M9 8h5M9 12h5"/>'),
  help: svg('<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 4"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>'),
  info: svg('<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".7" fill="currentColor"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  music: svg('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
  bolt: svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
};

export function starsHTML(n, total = 3, cls = "stars") {
  let s = `<span class="${cls}" role="img" aria-label="${n} de ${total} estrellas">`;
  for (let i = 0; i < total; i++) {
    s += `<svg class="star ${i < n ? "is-on" : ""}" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>`;
  }
  return s + "</span>";
}

export function badgeEmblem(icon) {
  const paths = {
    pluma: '<path d="M18 4c-6 1-10 6-11 13l-1 3 3-1c6-1 10-6 9-15z"/><path d="M7 17l6-6"/>',
    libro: '<path d="M5 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H5z"/><path d="M19 5h-6v14a2 2 0 0 1 2-2h4z"/>',
    estrella: '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>',
    llave: '<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H20M17 12v3M20 12v2.5"/>',
    sello: '<circle cx="12" cy="11" r="6"/><path d="M9 17l-1 4 4-2 4 2-1-4"/><path d="M10 11h4M12 9v4"/>',
    corona: '<path d="M4 17h16l-1.5-9-4 4L12 6l-2.5 6-4-4z"/><path d="M5 20h14"/>',
  };
  return `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[icon] || paths.estrella}</svg>`;
}

export function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export function formatDate(ms) {
  const d = new Date(ms || Date.now());
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}
export function formatDuration(ms) {
  const min = Math.floor((ms || 0) / 60000);
  const h = Math.floor(min / 60), m = min % 60;
  if (h > 0) return `${h} h ${m} min`;
  if (min < 1) return "menos de 1 min";
  return `${m} min`;
}
