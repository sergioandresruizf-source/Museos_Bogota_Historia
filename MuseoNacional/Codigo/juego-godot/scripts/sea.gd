extends Node2D
## Escena del MAR: navegas entre islas con tu barco de 8 direcciones.

const WorldDraw = preload("res://scripts/world_draw.gd")

var ship_pos: Vector2
var ship_vel: Vector2 = Vector2.ZERO
var ship_dir: int = 0
var cam: Vector2 = Vector2.ZERO
var wake: Array = []
var wake_t: float = 0.0
var near: int = -1
var fog_msg: float = 0.0
var demo: bool = false     # true en la pantalla de título (el barco no se mueve)
var t: float = 0.0
var fog_clouds: Array = []
var fog_toast_t: float = -1.0


func setup(p: Dictionary) -> void:
	WorldDraw.load_textures()
	fog_clouds = WorldDraw.make_fog_clouds()
	demo = p.get("demo", false)
	ship_pos = Game.start
	ship_dir = 0
	if p.has("from"):
		var pl: Dictionary = Game.places[p["from"]]
		var dk: Dictionary = pl["dock"]
		ship_pos = (dk["tipv"] as Vector2) + (dk["dirv"] as Vector2) * 12.0
		ship_dir = Game.dir_index(dk["dirv"])
	elif demo:
		ship_dir = 4
	_snap_cam()
	Game.fog_alpha = 0.0 if Game.all_explored() else 1.0
	Game.ui.show_hud(not demo)
	Game.ui.minimap.visible = not demo
	Game.ui.update_hud()
	if not demo and Game.all_explored() and not Game.save["fog_lifted"]:
		Game.save["fog_lifted"] = true
		Game.persist()
		fog_toast_t = 0.5


func _snap_cam() -> void:
	cam = Vector2(clampf(ship_pos.x - Game.VW / 2.0, 0, Game.WORLD_W - Game.VW), clampf(ship_pos.y - Game.VH / 2.0, 0, Game.WORLD_H - Game.VH))


func _process(delta: float) -> void:
	t += delta
	if fog_toast_t > 0.0:
		fog_toast_t -= delta
		if fog_toast_t <= 0.0:
			Game.ui.toast(Game.txt["nieblaSeDisipa"], 4.2)
			Game.play("win")
	var unlocked := Game.all_explored()
	Game.fog_alpha = maxf(0.0, Game.fog_alpha - delta * 0.35) if unlocked else minf(1.0, Game.fog_alpha + delta)
	var active := not Game.blocked and not Game.dialog_open and not demo
	if active:
		var a := Game.axis()
		var sp: float = Game.cfg["velocidadBarco"]
		ship_vel = ship_vel.lerp(a * sp, minf(1.0, 5.0 * delta))
		ship_pos += ship_vel * delta
		for i in Game.places.size():
			ship_pos = Game.push_out(i, ship_pos, 20.0)
		if not unlocked:
			var c: Vector2 = Game.places[Game.SKULL_I]["posv"]
			var d := ship_pos - c
			if d.length() < Game.FOG_R:
				ship_pos = c + d.normalized() * Game.FOG_R
				if fog_msg <= 0.0:
					Game.ui.toast(Game.txt["nieblaBloqueada"], 2.4)
					Game.play("bump")
					fog_msg = 3.0
		ship_pos.x = clampf(ship_pos.x, 40, Game.WORLD_W - 40)
		ship_pos.y = clampf(ship_pos.y, 70, Game.WORLD_H - 40)
		if ship_vel.length() > 12.0 and a.length() > 0.1:
			ship_dir = Game.dir_index(a)
		fog_msg -= delta
	elif demo:
		ship_vel = Vector2.ZERO
	# estela
	wake_t -= delta
	if ship_vel.length() > 25.0 and wake_t <= 0.0:
		wake.append({"p": ship_pos - ship_vel * 0.12 + Vector2(0, 2), "l": 1.0})
		wake_t = 0.07
	for w in wake: w["l"] -= delta * 1.6
	wake = wake.filter(func(w): return w["l"] > 0.0)
	# cámara
	var target := Vector2(clampf(ship_pos.x - Game.VW / 2.0, 0, Game.WORLD_W - Game.VW), clampf(ship_pos.y - Game.VH / 2.0, 0, Game.WORLD_H - Game.VH))
	cam = cam.lerp(target, minf(1.0, 6.0 * delta))
	# muelles y nombre del lugar
	near = -1
	var near_name := ""
	var best := 1e9
	for i in Game.places.size():
		var p: Dictionary = Game.places[i]
		var visible_place: bool = i != Game.SKULL_I or unlocked
		var dk: Dictionary = p["dock"]
		if ship_pos.distance_to(dk["tipv"]) < 50.0 and visible_place: near = i
		var de: float = ship_pos.distance_to(p["posv"]) - maxf(p["rx"], p["ry"])
		if de < 150.0 and de < best and visible_place:
			best = de
			near_name = Game.place_name(i)
	if not demo:
		Game.ui.set_place(near_name if near_name != "" else "Mar abierto")
		Game.ui.minimap.ship_pos = ship_pos
		if near >= 0 and active:
			Game.ui.set_prompt("[A] Atracar en: " + Game.place_name(near))
			if Game.action_pressed():
				Game.consume()
				Game.play("ok")
				Game.main.go("arrival", {"idx": near})
		else:
			Game.ui.set_prompt("")
	queue_redraw()


func _draw() -> void:
	var c := cam.round()
	WorldDraw.draw_world(self, c, t)
	for w in wake:
		var z := 2.0 + roundf((1.0 - w["l"]) * 4.0)
		var q: Vector2 = (w["p"] as Vector2) - c
		draw_rect(Rect2(roundf(q.x - z / 2.0), roundf(q.y), z, 2), Color(0.92, 0.98, 1.0, w["l"] * 0.8))
	WorldDraw.draw_ship(self, ship_dir, ship_pos - c, 0.75, roundf(sin(t * 3.0)))
	WorldDraw.draw_fog(self, c, t, fog_clouds)
