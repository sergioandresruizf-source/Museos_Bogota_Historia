extends Node2D
## Escena de LLEGADA: el muelle, el letrero con el nombre y la puerta del museo.

const WorldDraw = preload("res://scripts/world_draw.gd")

var idx: int = 0
var skull: bool = false
var pl: Dictionary = {"pos": Vector2(200, 238), "dir": "u", "fr": 0, "t": 0.0}
var t: float = 0.0
var clouds: Array = []
var sky: Texture2D
var fg: Texture2D
var sign_label: Label
# zonas por donde se puede caminar (suelo + muelle)
var rects: Array = [Rect2(16, 154, 368, 50), Rect2(188, 200, 24, 64)]


func setup(p: Dictionary) -> void:
	WorldDraw.load_textures()
	idx = p["idx"]
	skull = idx == Game.SKULL_I
	var th := "s" if skull else "n"
	sky = Game.tex("res://assets/arrival/sky_%s.png" % th)
	fg = Game.tex("res://assets/arrival/fg_%s.png" % th)
	var rng := RandomNumberGenerator.new()
	rng.seed = 3
	for i in 4:
		clouds.append({"x": rng.randf() * Game.VW, "y": 14.0 + rng.randf() * 70.0, "v": i % 3, "s": 4.0 + rng.randf() * 6.0})
	# letrero con el nombre (editable: es un Label normal)
	sign_label = Label.new()
	sign_label.text = Game.place_name(idx)
	sign_label.position = Vector2(148, 68)
	sign_label.size = Vector2(104, 18)
	sign_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sign_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	sign_label.clip_text = true
	var fs := clampi(int(88.0 / maxf(6.0, sign_label.text.length()) * 1.7), 6, 11)
	sign_label.add_theme_font_size_override("font_size", fs)
	sign_label.add_theme_color_override("font_color", Color("ffe9a8"))
	sign_label.add_theme_color_override("font_shadow_color", Color("2a1608"))
	sign_label.add_theme_constant_override("shadow_offset_x", 1)
	sign_label.add_theme_constant_override("shadow_offset_y", 1)
	add_child(sign_label)
	Game.ui.show_hud(true)
	Game.ui.minimap.visible = false
	Game.ui.set_place(Game.place_name(idx))
	Game.ui.update_hud()


func _walk_ok(x: float, y: float) -> bool:
	for pt in [Vector2(x - 4, y), Vector2(x + 4, y), Vector2(x - 4, y - 3), Vector2(x + 4, y - 3)]:
		var ok := false
		for r in rects:
			if (r as Rect2).has_point(pt) or pt.x == r.end.x or pt.y == r.end.y:
				ok = true
				break
		if not ok: return false
	return true


func _process(delta: float) -> void:
	t += delta
	for c in clouds:
		c["x"] += c["s"] * delta
		if c["x"] > Game.VW + 10: c["x"] = -90.0
	if not Game.blocked and not Game.dialog_open:
		var a := Game.axis()
		var pos: Vector2 = pl["pos"]
		var moving := false
		if a.length() > 0.15:
			var v := a * 62.0 * delta
			if _walk_ok(pos.x + v.x, pos.y): pos.x += v.x
			if _walk_ok(pos.x, pos.y + v.y): pos.y += v.y
			moving = true
			if absf(a.x) > absf(a.y): pl["dir"] = "l" if a.x < 0 else "r"
			else: pl["dir"] = "u" if a.y < 0 else "d"
		pl["t"] += delta if moving else 0.0
		pl["fr"] = (int(pl["t"] * 7.0) % 2) if moving else 0
		pl["pos"] = pos
		if pos.y <= 160.0 and absf(pos.x - 200.0) <= 15.0:
			Game.play("ok")
			Game.main.go("museum", {"kind": "calavera" if skull else "isla", "idx": idx})
		elif pos.y >= 252.0:
			Game.ui.set_prompt("[A] Zarpar")
			if Game.action_pressed():
				Game.consume()
				Game.play("ok")
				Game.main.go("sea", {"from": idx})
		elif pos.y < 190.0 and absf(pos.x - 200.0) < 40.0:
			Game.ui.set_prompt("Entra por la puerta ▲")
		else:
			Game.ui.set_prompt("")
	queue_redraw()


func _draw() -> void:
	draw_rect(Rect2(0, 0, Game.VW, Game.VH), Color.BLACK)
	var tile := WorldDraw.water_tile(t)
	var y := 190
	while y < Game.VH:
		var x := 0
		while x < Game.VW:
			draw_texture(tile, Vector2(x, y))
			x += 32
		y += 32
	draw_texture(sky, Vector2.ZERO)
	for c in clouds:
		draw_texture(WorldDraw.cloud(c["v"]), Vector2(roundf(c["x"]), roundf(c["y"])), Color(1, 1, 1, 0.35 if skull else 0.9))
	draw_texture(fg, Vector2.ZERO)
	for x in [175, 225]:
		var f := int(t * 10.0 + x) % 3
		draw_rect(Rect2(x - 1, 124, 3, 12), Color("4d2f1a"))
		draw_rect(Rect2(x - 2, 116 - f, 5, 8 + f), Color("39ff9c") if skull else Color("ff9a2a"))
		draw_rect(Rect2(x - 1, 119 - f, 3, 5), Color("c8ffe4") if skull else Color("ffe27a"))
	WorldDraw.draw_ship(self, 0, Vector2(200, 303 + roundf(sin(t * 2.2))), 0.75, 0.0)
	WorldDraw.draw_pirate(self, pl["pos"], pl["dir"], pl["fr"], skull)
	if skull: draw_rect(Rect2(0, 0, Game.VW, Game.VH), Color(0.04, 0.04, 0.12, 0.25))
