extends Node2D
## Escena de la SALA del museo: pasillo con marcos. Obra presente = marco dorado con tu imagen;
## obra removida = recuadro negro punteado (sin imagen). En la Isla Calavera aparecen todas las removidas.

const WorldDraw = preload("res://scripts/world_draw.gd")

const WALL_H := 64
const HALL_H := 208
const FLOOR_BOTTOM := 198.0

var kind: String = "isla"
var idx: int = 0
var skull: bool = false
var slots: Array = []
var ww: int = 416
var pl: Dictionary = {"pos": Vector2(48, 186), "dir": "u", "fr": 0, "t": 0.0}
var cam: float = 0.0
var benches: Array = []
var chest: Variant = null
var near: Variant = null
var was_explored: bool = false
var t: float = 0.0
var th: String = "n"
var tx: Dictionary = {}


func setup(p: Dictionary) -> void:
	WorldDraw.load_textures()
	kind = p["kind"]
	idx = p["idx"]
	skull = kind == "calavera"
	th = "s" if skull else "n"
	for k in ["wall", "floor", "bottom", "pillar_l", "pillar_r", "exit"]:
		tx[k] = Game.tex("res://assets/hall/%s_%s.png" % [k, th])
	tx["frame_present"] = Game.tex("res://assets/hall/frame_present.png")
	tx["frame_removed"] = Game.tex("res://assets/hall/frame_removed.png")
	tx["placeholder"] = Game.tex("res://assets/hall/placeholder_obra.png")
	tx["check"] = Game.tex("res://assets/hall/check.png")
	# marcos
	if skull:
		for r in Game.removed_list():
			slots.append({"titulo": r["o"].get("titulo", ""), "descripcion": r["o"].get("descripcion", ""), "imagen": "", "removida": true,
				"key": "k:%d:%d" % [r["i"], r["j"]], "origen": "Pertenecía a: " + Game.place_name(r["i"]), "tex": null})
	else:
		var works := Game.island_works(idx)
		for j in works.size():
			var o: Dictionary = works[j]
			var rem: bool = o.get("removida", false)
			slots.append({"titulo": o.get("titulo", ""), "descripcion": o.get("descripcion", ""), "imagen": "" if rem else o.get("imagen", ""),
				"removida": rem, "key": "%d:%d" % [idx, j], "origen": "", "tex": null if rem else Game.obra_tex(o.get("imagen", ""))})
	var n := slots.size()
	var w := 88 + 80 * maxi(0, n - 1) + 100 + (80 if skull else 0)
	ww = maxi(416, ceili(w / 16.0) * 16)
	for i in n:
		if i % 2 == 0: benches.append(Rect2(88 + 80 * i - 22, WALL_H + 64, 44, 12))
	if skull: chest = Rect2(ww - 62, WALL_H + 62, 24, 14)
	pl["pos"] = Vector2(48, 186)
	if kind == "isla":
		Game.save["entered"][str(idx)] = true
		Game.persist()
		was_explored = Game.is_explored(idx)
	Game.ui.show_hud(true)
	Game.ui.minimap.visible = false
	Game.ui.set_place(Game.place_name(Game.SKULL_I if skull else idx))
	Game.ui.update_hud()
	cam = clampf(48.0 - Game.VW / 2.0, 0, ww - Game.VW)


func _can_go(x: float, y: float) -> bool:
	var in_gap := x >= 36 and x <= 60
	if x < 24 or x > ww - 24: return false
	if y < WALL_H + 8: return false
	if y > (214.0 if in_gap else FLOOR_BOTTOM): return false
	var fr := Rect2(x - 5, y - 4, 10, 4)
	for b in benches:
		if fr.intersects(b): return false
	if chest != null and fr.intersects(chest): return false
	return true


func _process(delta: float) -> void:
	t += delta
	queue_redraw()
	if Game.blocked or Game.dialog_open: return
	var a := Game.axis()
	var pos: Vector2 = pl["pos"]
	var moving := false
	if a.length() > 0.15:
		var v := a * 74.0 * delta
		if _can_go(pos.x + v.x, pos.y): pos.x += v.x
		if _can_go(pos.x, pos.y + v.y): pos.y += v.y
		moving = true
		if absf(a.x) > absf(a.y): pl["dir"] = "l" if a.x < 0 else "r"
		else: pl["dir"] = "u" if a.y < 0 else "d"
	pl["t"] += delta if moving else 0.0
	pl["fr"] = (int(pl["t"] * 7.0) % 2) if moving else 0
	pl["pos"] = pos
	cam = lerpf(cam, clampf(pos.x - Game.VW / 2.0, 0, ww - Game.VW), minf(1.0, 8.0 * delta))
	if pos.y >= 205.0 and pos.x >= 36 and pos.x <= 60:
		Game.play("ok")
		Game.main.go("arrival", {"idx": Game.SKULL_I if skull else idx})
		return
	# objetivo de interacción
	near = null
	var best := 1e9
	for i in slots.size():
		var cx := 88.0 + 80.0 * i
		var dx := absf(pos.x - cx)
		if dx <= 36.0 and pos.y <= WALL_H + 40 and dx < best:
			best = dx
			near = {"type": "obra", "i": i, "cx": cx}
	if chest != null and Vector2(pos.x - (chest.position.x + 12), pos.y - (chest.position.y + 18)).length() < 34.0:
		near = {"type": "cofre"}
	if near == null:
		Game.ui.set_prompt("")
		return
	if near["type"] == "obra":
		var s: Dictionary = slots[near["i"]]
		Game.ui.set_prompt("[A] Ver obra%s: %s" % [" removida" if s["removida"] else "", s["titulo"] if s["titulo"] != "" else "Sin título"])
		if Game.action_pressed():
			Game.consume()
			_open_slot(s)
	else:
		var faltan := 0
		for s in slots:
			if not Game.save["viewed"].has(s["key"]): faltan += 1
		if Game.cfg.get("exigirVerTodasEnCalavera", true) and faltan > 0:
			Game.ui.set_prompt("[A] Cofre cerrado: te faltan %d obra(s) por revisar" % faltan)
			if Game.action_pressed():
				Game.consume()
				Game.play("bump")
				Game.ui.toast("Revisa todas las obras removidas antes de abrir el cofre.", 2.6)
		else:
			Game.ui.set_prompt("[A] Cargar las obras en el barco")
			if Game.action_pressed():
				Game.consume()
				Game.play("win")
				Game.ui.set_prompt("")
				Game.main.go("cine", {})


func _open_slot(s: Dictionary) -> void:
	var info := {"titulo": s["titulo"], "descripcion": s["descripcion"], "imagen": s["imagen"], "removida": s["removida"], "origen": s["origen"], "tex": s["tex"]}
	Game.ui.open_dialog(info, func() -> void:
		var first: bool = not Game.save["viewed"].has(s["key"])
		Game.save["viewed"][s["key"]] = true
		Game.persist()
		Game.ui.update_hud()
		if kind == "isla":
			if not was_explored and Game.is_explored(idx):
				was_explored = true
				Game.play("win")
				Game.ui.toast("¡ISLA EXPLORADA! %d/%d" % [Game.explored_count(), Game.N_ISL], 3.2)
				if Game.all_explored():
					Game.ui.toast_after("¡Exploraste las 10 islas! Algo cambia en el mar…", 3.3, 4.2)
			elif first and Game.cfg.get("exigirVerTodas", true):
				var rest := 0
				var w := Game.island_works(idx)
				for j in w.size():
					if not Game.save["viewed"].has("%d:%d" % [idx, j]): rest += 1
				if rest > 0: Game.ui.toast("Te faltan %d obra(s) en esta sala" % rest, 1.8))


func _draw() -> void:
	var oy := floorf((Game.VH - HALL_H) / 2.0)
	var cx := roundf(cam)
	draw_rect(Rect2(0, 0, Game.VW, Game.VH), Color("0b0a14") if skull else Color("0d0b0a"))
	draw_set_transform(Vector2(-cx, oy), 0.0, Vector2.ONE)
	# pared, suelo y pilares (texturas que se repiten)
	draw_texture_rect(tx["wall"], Rect2(0, 0, ww, WALL_H), true)
	draw_texture_rect(tx["floor"], Rect2(0, WALL_H, ww, 136), true)
	draw_texture_rect(tx["bottom"], Rect2(0, 200, ww, 8), true)
	draw_texture(tx["exit"], Vector2(32, 192))
	draw_texture(tx["pillar_l"], Vector2(0, 0))
	draw_texture(tx["pillar_r"], Vector2(ww - 16, 0))
	# bancas
	for b in benches:
		var r: Rect2 = b
		draw_rect(Rect2(r.position.x + 2, r.position.y + 10, r.size.x, 4), Color(0, 0, 0, 0.25))
		draw_rect(Rect2(r.position.x, r.position.y + 4, r.size.x, 8), Color("5a3a1a"))
		draw_rect(Rect2(r.position.x, r.position.y, r.size.x, 6), Color("8a5a35"))
		draw_rect(Rect2(r.position.x, r.position.y, r.size.x, 1), Color("a87648"))
		draw_rect(Rect2(r.position.x + 2, r.position.y + 12, 3, 3), Color("3a2410"))
		draw_rect(Rect2(r.position.x + r.size.x - 5, r.position.y + 12, 3, 3), Color("3a2410"))
	# marcos con sus obras
	for i in slots.size():
		var s: Dictionary = slots[i]
		var fx := 88.0 + 80.0 * i
		if s["removida"]:
			draw_texture(tx["frame_removed"], Vector2(fx - 20, 12))
		else:
			var img: Texture2D = s["tex"] if s["tex"] != null else tx["placeholder"]
			draw_texture_rect(img, Rect2(fx - 16, 16, 32, 28), false)
			draw_texture(tx["frame_present"], Vector2(fx - 20, 12))
		if Game.save["viewed"].has(s["key"]):
			draw_texture(tx["check"], Vector2(fx + 8, 46))
	# antorchas
	for i in range(1, slots.size() + 1):
		var x := 48.0 + 80.0 * i
		var f := int(t * 9.0 + i * 3) % 3
		draw_rect(Rect2(x - 1, 30, 3, 10), Color("3a2410"))
		draw_rect(Rect2(x - 3, 28, 7, 3), Color("6b6b78"))
		draw_rect(Rect2(x - 2, 20 - f, 5, 9 + f), Color("39ff9c") if skull else Color("ff9a2a"))
		draw_rect(Rect2(x - 1, 23 - f, 3, 5), Color("d0ffe8") if skull else Color("ffe27a"))
		draw_rect(Rect2(x - 22, 6, 44, 52), Color(0.22, 1.0, 0.61, 0.07) if skull else Color(1.0, 0.7, 0.24, 0.09))
	if chest != null: _draw_chest(chest)
	if int(t * 2.0) % 2 == 0:
		draw_rect(Rect2(46, 202, 4, 2), Color.WHITE)
		draw_rect(Rect2(45, 204, 6, 2), Color.WHITE)
		draw_rect(Rect2(44, 206, 8, 2), Color.WHITE)
	if near != null and near["type"] == "obra" and not Game.blocked and not Game.dialog_open:
		draw_rect(Rect2(near["cx"] - 21.5, 11.5, 43, 39), Color("f0c24a"), false, 1.0)
	WorldDraw.draw_pirate(self, pl["pos"], pl["dir"], pl["fr"], skull)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	if skull: draw_rect(Rect2(0, 0, Game.VW, Game.VH), Color(0.08, 0.0, 0.16, 0.18))


func _draw_chest(c: Rect2) -> void:
	var open: bool = not Game.cfg.get("exigirVerTodasEnCalavera", true)
	if not open:
		open = true
		for s in slots:
			if not Game.save["viewed"].has(s["key"]): open = false
	var x := c.position.x
	var y := c.position.y
	draw_rect(Rect2(x - 1, y + 14, c.size.x + 4, 4), Color(0, 0, 0, 0.3))
	draw_rect(Rect2(x, y + 4, c.size.x, 12), Color("5a3a1a"))
	draw_rect(Rect2(x, y - 2, c.size.x, 8), Color("7a5028"))
	draw_rect(Rect2(x, y + 4, c.size.x, 2), Color("d4a63a"))
	draw_rect(Rect2(x + 10, y + 2, 4, 6), Color("d4a63a"))
	draw_rect(Rect2(x + 3, y - 2, 2, 18), Color("d4a63a"))
	draw_rect(Rect2(x + c.size.x - 5, y - 2, 2, 18), Color("d4a63a"))
	if open:
		var s := int(t * 6.0) % 2
		var col := Color("fff6b0") if s == 1 else Color("ffd24a")
		draw_rect(Rect2(x + 11, y - 8 - s, 2, 4), col)
		draw_rect(Rect2(x + 9, y - 6 - s, 6, 1), col)
