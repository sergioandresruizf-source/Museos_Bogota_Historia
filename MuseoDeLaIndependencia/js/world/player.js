// Jugador: el cronista (sombrero, casaca y libreta), movimiento y colisiones.
import { TILE } from "./rooms.js";

const SPEED = 118; // px de mundo por segundo
const HALF_W = 7;  // media anchura de la huella (pies)
const HALF_H = 4;  // media altura de la huella

export function createPlayer(x, y) {
  return { x, y, dir: "down", moving: false, anim: 0, stepAcc: 0 };
}

function solidTile(room, tx, ty, isDoorOpen) {
  if (tx < 0 || ty < 0 || tx >= room.w || ty >= room.h) return true;
  const t = room.grid[ty][tx];
  if (t === "#" || t === "F") return true;
  if (t === "D") return !isDoorOpen(tx, ty);
  return false;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function collides(room, x, y, isDoorOpen) {
  const box = { x: x - HALF_W, y: y - HALF_H, w: HALF_W * 2, h: HALF_H * 2 };
  const x0 = Math.floor(box.x / TILE), x1 = Math.floor((box.x + box.w - 0.01) / TILE);
  const y0 = Math.floor(box.y / TILE), y1 = Math.floor((box.y + box.h - 0.01) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (solidTile(room, tx, ty, isDoorOpen)) return true;
    }
  }
  for (const o of room.objects) {
    if (o.solid && rectsOverlap(box, o.box)) return true;
  }
  return false;
}

/** Mueve al jugador según el eje de entrada (-1..1). Devuelve true si dio un paso. */
export function updatePlayer(p, axis, dt, room, isDoorOpen) {
  let { x: ax, y: ay } = axis;
  const len = Math.hypot(ax, ay);
  if (len > 1) { ax /= len; ay /= len; }
  p.moving = len > 0.12;
  if (!p.moving) { p.anim = 0; return false; }
  if (Math.abs(ax) > Math.abs(ay)) p.dir = ax > 0 ? "right" : "left";
  else p.dir = ay > 0 ? "down" : "up";

  const sp = SPEED * Math.min(1, len) * dt;
  const nx = p.x + ax * sp;
  if (!collides(room, nx, p.y, isDoorOpen)) p.x = nx;
  else {
    // deslizarse suavemente por las esquinas
    for (const nudge of [3, -3]) {
      if (Math.abs(ay) < 0.3 && !collides(room, nx, p.y + nudge, isDoorOpen)) { p.y += nudge * 0.3; break; }
    }
  }
  const ny = p.y + ay * sp;
  if (!collides(room, p.x, ny, isDoorOpen)) p.y = ny;
  else {
    for (const nudge of [3, -3]) {
      if (Math.abs(ax) < 0.3 && !collides(room, p.x + nudge, ny, isDoorOpen)) { p.x += nudge * 0.3; break; }
    }
  }

  p.anim += dt * 9 * Math.min(1, len);
  p.stepAcc += dt * Math.min(1, len);
  if (p.stepAcc > 0.32) { p.stepAcc = 0; return true; }
  return false;
}

export function isBlockedAt(room, x, y, isDoorOpen) {
  return collides(room, x, y, isDoorOpen);
}

// ------------------------------------------------------------
// Dibujo del cronista (vista cenital 3/4). (x, y) = pies.
// ------------------------------------------------------------
const C = {
  coat: "#2c3a35", coatLight: "#3d5049", coatDark: "#1f2a26",
  vest: "#b6533c", shirt: "#f5ead5", skin: "#e2b48c", skinShade: "#c99671",
  hat: "#3a2b20", hatBand: "#b6533c", hatTop: "#4b3828",
  pants: "#5a4636", boots: "#2a1f17", book: "#8a5a35", page: "#f8f0e1",
};

export function drawPlayer(ctx, p, t) {
  const { x, y, dir } = p;
  const phase = p.moving ? Math.sin(p.anim) : 0;
  const bob = p.moving ? Math.abs(Math.sin(p.anim)) * 1.4 : Math.sin(t * 2) * 0.35;

  // sombra
  ctx.fillStyle = "rgba(40,25,15,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y, 10, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y - bob);

  const side = dir === "left" || dir === "right";
  const flip = dir === "left" ? -1 : 1;

  // piernas
  if (side) {
    ctx.save();
    ctx.scale(flip, 1);
    ctx.fillStyle = C.pants;
    ctx.save(); ctx.translate(0, -9); ctx.rotate(phase * 0.5);
    ctx.fillRect(-2, 0, 4, 8); ctx.fillStyle = C.boots; ctx.fillRect(-2, 6, 6, 3); ctx.restore();
    ctx.fillStyle = C.pants;
    ctx.save(); ctx.translate(0, -9); ctx.rotate(-phase * 0.5);
    ctx.fillRect(-2, 0, 4, 8); ctx.fillStyle = C.boots; ctx.fillRect(-2, 6, 6, 3); ctx.restore();
    ctx.restore();
  } else {
    const l = phase * 2.2;
    ctx.fillStyle = C.pants;
    ctx.fillRect(-5, -10 + Math.max(0, l), 4, 8 - Math.max(0, l));
    ctx.fillRect(1, -10 + Math.max(0, -l), 4, 8 - Math.max(0, -l));
    ctx.fillStyle = C.boots;
    ctx.fillRect(-5.5, -3 - Math.max(0, l) * 0.6, 5, 3);
    ctx.fillRect(0.5, -3 - Math.max(0, -l) * 0.6, 5, 3);
  }

  // casaca (faldones)
  ctx.fillStyle = C.coat;
  roundRect(ctx, -8, -24, 16, 16, 4);
  ctx.fill();
  ctx.fillStyle = C.coatDark;
  if (!side) {
    ctx.fillRect(-8, -12, 3, 4);
    ctx.fillRect(5, -12, 3, 4);
  }
  // chaleco y camisa
  if (dir === "down") {
    ctx.fillStyle = C.vest;
    ctx.beginPath(); ctx.moveTo(-4, -23); ctx.lineTo(4, -23); ctx.lineTo(3, -11); ctx.lineTo(-3, -11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.shirt;
    ctx.beginPath(); ctx.moveTo(-2.5, -23.5); ctx.lineTo(2.5, -23.5); ctx.lineTo(0, -18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e9c46a";
    ctx.fillRect(-0.6, -17, 1.2, 1.2); ctx.fillRect(-0.6, -14, 1.2, 1.2);
  } else if (side) {
    ctx.fillStyle = C.vest;
    ctx.fillRect(flip > 0 ? 3 : -5, -22, 2, 10);
  }
  // brazos + libreta
  const arm = p.moving ? phase * 2 : 0;
  ctx.fillStyle = C.coatLight;
  if (dir === "down") {
    ctx.fillRect(-10.5, -22 + arm, 3.5, 10);
    ctx.fillRect(7, -22 - arm, 3.5, 9);
    // libreta en la mano derecha
    ctx.fillStyle = C.book; ctx.fillRect(6.5, -14 - arm, 7, 8);
    ctx.fillStyle = C.page; ctx.fillRect(7.5, -13 - arm, 5, 6);
    ctx.fillStyle = "#b6533c"; ctx.fillRect(9.5, -13 - arm, 0.8, 6);
    ctx.fillStyle = C.skin; ctx.fillRect(-10, -12.5 + arm, 3, 2.5);
  } else if (dir === "up") {
    ctx.fillRect(-10.5, -22 - arm, 3.5, 10);
    ctx.fillRect(7, -22 + arm, 3.5, 10);
    ctx.fillStyle = C.book; ctx.fillRect(8, -13 + arm, 3, 6);
  } else {
    ctx.save(); ctx.scale(flip, 1);
    ctx.fillStyle = C.coatLight;
    ctx.save(); ctx.translate(0, -21); ctx.rotate(-0.25 - arm * 0.12);
    ctx.fillRect(-2, 0, 4, 10);
    ctx.fillStyle = C.book; ctx.fillRect(-1, 7, 8, 6);
    ctx.fillStyle = C.page; ctx.fillRect(0, 8, 6, 4);
    ctx.restore();
    ctx.restore();
  }

  // cabeza
  ctx.fillStyle = C.skin;
  ctx.beginPath(); ctx.arc(0, -29, 6.2, 0, Math.PI * 2); ctx.fill();
  if (dir === "down") {
    ctx.fillStyle = "#3a2b20";
    ctx.fillRect(-2.6, -29, 1.4, 1.6); ctx.fillRect(1.2, -29, 1.4, 1.6);
    ctx.fillStyle = C.skinShade; ctx.fillRect(-1.5, -25.6, 3, 0.9);
  } else if (side) {
    ctx.fillStyle = "#3a2b20";
    ctx.fillRect(flip * 2.5 - 0.7, -29, 1.4, 1.6);
  } else {
    ctx.fillStyle = "#5a4030";
    ctx.beginPath(); ctx.arc(0, -28.5, 5.6, 0, Math.PI); ctx.fill();
  }

  // sombrero de ala ancha
  ctx.fillStyle = C.hat;
  ctx.beginPath(); ctx.ellipse(0, -33, 11, 4.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.hatTop;
  roundRect(ctx, -6, -41, 12, 8.5, 3); ctx.fill();
  ctx.fillStyle = C.hatBand;
  ctx.fillRect(-6, -35.5, 12, 2);
  // pluma
  ctx.strokeStyle = "#f8f0e1"; ctx.lineWidth = 1.3;
  ctx.beginPath();
  const fx = dir === "left" ? -5 : 5;
  ctx.moveTo(fx, -36); ctx.quadraticCurveTo(fx * 1.9, -44, fx * 1.3, -48); ctx.stroke();

  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
