extends Node2D
## CINEMÁTICA: el barco lleva las obras removidas a cada isla y planta la bandera de la revolución.

const WorldDraw = preload("res://scripts/world_draw.gd")

var ship_pos: Vector2
var ship_dir: int = 4
var cam: Vector2 = Vector2.ZERO
var order: Array = []
var oi: int = 0
var path: PackedVector2Array = PackedVector2Array()
var pi: int = 1
var phase: String = "intro"
var pt: float = 0.0
var crate: Variant = null
var done: bool = false
var wake: Array = []
var wt: float = 0.0
var delivered: int = 0
var t: float = 0.0
var flag_sound: bool = false


func setup(_p: Dictionary) -> void:
	WorldDraw.load_textures()
	Game.cine_flags = {}
	Game.ui.show_hud(false)
	Game.ui.minimap.visible = false
	Game.ui.show_skip(true)
	Game.ui.set_prompt("")
	var sk: Dictionary = Game.places[Game.SKULL_I]
	var dk: Dictionary = sk["dock"]
	ship_pos = (dk["tipv"] as Vector2) + (dk["dirv"] as Vector2) * 6.0
	ship_dir = Game.dir_index(dk["dirv"])
	# orden: siempre la isla más cercana a la posición actual
	var left: Array = []
	for i in Game.N_ISL: left.append(i)
	var pos := ship_pos
	while not left.is_empty():
		var bi := 0
		var bd := 1e9
		for ii in left.size():
			var d: float = pos.distance_to(Game.places[left[ii]]["dock"]["tipv"])
			if d < bd:
				bd = d
				bi = ii
		var k: int = left[bi]
		left.remove_at(bi)
		order.append(k)
		pos = Game.places[k]["dock"]["tipv"]
	cam = Vector2(clampf(ship_pos.x - Game.VW / 2.0, 0, Game.WORLD_W - Game.VW), clampf(ship_pos.y - Game.VH / 2.0, 0, Game.WORLD_H - Game.VH))
	Game.ui.set_caption(Game.txt["cineInicio"])


func _start_leg() -> void:
	var tgt: Vector2 = Game.places[order[oi]]["dock"]["tipv"]
	path = Game.find_path(ship_pos, tgt)
	pi = 1
	phase = "sail"
	Game.ui.set_caption("Rumbo a: " + Game.place_name(order[oi]))


func skip() -> void:
	_finish()


func _finish() -> void:
	if done: return
	done = true
	Game.cine_flags = {}
	Game.save["cine_done"] = true
	Game.persist()
	Game.ui.set_caption("")
	Game.ui.show_skip(false)
	Game.ui.show_finale()
	Game.play("win")


func _process(delta: float) -> void:
	t += delta
	pt += delta
	if phase == "intro":
		if pt > 2.2: _start_leg()
	elif phase == "sail":
		var tgt: Vector2 = path[pi]
		var d := tgt - ship_pos
		var step := 210.0 * delta
		if d.length() <= step:
			ship_pos = tgt
			pi += 1
			if pi >= path.size():
				phase = "unload"
				pt = 0.0
				crate = null
				Game.ui.set_caption(Game.place_name(order[oi]))
				Game.play("thud")
		else:
			ship_pos += d.normalized() * step
			ship_dir = Game.dir_index(d)
		wt -= delta
		if wt <= 0.0:
			wake.append({"p": ship_pos - d.normalized() * 10.0 + Vector2(0, 2), "l": 1.0})
			wt = 0.06
	elif phase == "unload":
		var p: Dictionary = Game.places[order[oi]]
		if pt < 1.0:
			var a := ship_pos + Vector2(0, -22)
			var b: Vector2 = (p["posv"] as Vector2) + Vector2(0, 4)
			crate = a.lerp(b, pt) + Vector2(0, -sin(pt * PI) * 46.0)
		elif pt < 1.1:
			crate = null
		elif pt < 2.1:
			Game.cine_flags[order[oi]] = pt - 1.1
			if not flag_sound:
				flag_sound = true
				Game.play("flag")
		else:
			Game.cine_flags[order[oi]] = 1.0
			flag_sound = false
			delivered += 1
			oi += 1
			if oi >= order.size():
				phase = "end"
				pt = 0.0
				Game.ui.set_caption("")
			else:
				_start_leg()
		if phase == "unload":
			Game.ui.set_caption(Game.place_name(order[oi]) + ("  ✔  %d/%d" % [delivered + 1, Game.N_ISL] if pt > 1.1 else ""))
	elif phase == "end":
		if pt > 1.2 and not done: _finish()
	for w in wake: w["l"] -= delta * 1.6
	wake = wake.filter(func(w): return w["l"] > 0.0)
	var focus := Vector2(Game.WORLD_W / 2.0, Game.WORLD_H / 2.0) if phase == "end" else ship_pos
	var target := Vector2(clampf(focus.x - Game.VW / 2.0, 0, Game.WORLD_W - Game.VW), clampf(focus.y - Game.VH / 2.0, 0, Game.WORLD_H - Game.VH))
	cam = cam.lerp(target, minf(1.0, (1.5 if phase == "end" else 5.0) * delta))
	queue_redraw()


func _draw() -> void:
	var c := cam.round()
	WorldDraw.draw_world(self, c, t)
	for w in wake:
		var z := 2.0 + roundf((1.0 - w["l"]) * 4.0)
		var q: Vector2 = (w["p"] as Vector2) - c
		draw_rect(Rect2(roundf(q.x - z / 2.0), roundf(q.y), z, 2), Color(0.92, 0.98, 1.0, w["l"] * 0.8))
	WorldDraw.draw_ship(self, ship_dir, ship_pos - c, 0.75, roundf(sin(t * 3.0)))
	if crate != null:
		var q: Vector2 = ((crate as Vector2) - c).round()
		draw_rect(Rect2(q.x - 6, q.y - 6, 12, 12), Color("5a3a1a"))
		draw_rect(Rect2(q.x - 5, q.y - 5, 10, 10), Color("a87648"))
		draw_rect(Rect2(q.x - 5, q.y - 1, 10, 2), Color("d4a63a"))
		draw_rect(Rect2(q.x - 1, q.y - 5, 2, 10), Color("d4a63a"))
