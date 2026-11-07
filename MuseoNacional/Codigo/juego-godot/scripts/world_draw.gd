extends RefCounted
## Funciones de dibujo compartidas por las escenas (se llaman dentro de un _draw()).

static var _water: Array = []
static var _islands: Array = []
static var _ships: Array = []
static var _flag: Texture2D
static var _clouds: Array = []
static var _pirates: Dictionary = {}


static func load_textures() -> void:
	if not _water.is_empty(): return
	for i in 2: _water.append(Game.tex("res://assets/world/water_%d.png" % i))
	for i in 11: _islands.append(Game.tex("res://assets/world/island_%02d.png" % i))
	for i in 8: _ships.append(Game.tex("res://assets/ship/ship_%d.png" % i))
	for i in 3: _clouds.append(Game.tex("res://assets/world/cloud_%d.png" % i))
	_flag = Game.tex("res://assets/world/flag_luffy.png")
	for theme in ["n", "s"]:
		for d in ["d", "u", "r"]:
			for f in 2:
				_pirates["%s_%s_%d" % [theme, d, f]] = Game.tex(
					"res://assets/pirate/pirate_%s_%s_%d.png" % [theme, d, f]
				)

		# Crear sprites invertidos para caminar hacia la izquierda
		for f in 2:
			var right_tex: Texture2D = _pirates["%s_r_%d" % [theme, f]]

			var img: Image = right_tex.get_image()
			img.flip_x()

			_pirates["%s_l_%d" % [theme, f]] = ImageTexture.create_from_image(img)
static func cloud(i: int) -> Texture2D:
	return _clouds[i]


static func water_tile(t: float) -> Texture2D:
	return _water[int(t * 1.6) % 2]


## Mar + islas + banderas. cam = esquina superior izquierda de la vista (en px del mundo).
static func draw_world(ci: CanvasItem, cam: Vector2, t: float) -> void:
	var c := cam.round()
	var tile := water_tile(t)
	var sx := int(fposmod(c.x, 32.0))
	var sy := int(fposmod(c.y, 32.0))
	var y := -sy
	while y < Game.VH:
		var x := -sx
		while x < Game.VW:
			ci.draw_texture(tile, Vector2(x, y))
			x += 32
		y += 32
	for i in Game.places.size():
		var p: Dictionary = Game.places[i]
		var pos: Vector2 = p["posv"]
		var ex: float = p["ex"]
		var ey: float = p["ey"]
		var o := (pos - Vector2(ex, ey) - c).round()
		if o.x > Game.VW or o.y > Game.VH or o.x + ex * 2.0 < 0.0 or o.y + ey * 2.0 < 0.0: continue
		ci.draw_texture(_islands[i], o)
		var fl := Game.flag_for(i)
		if fl.is_empty(): continue
		var fp: Vector2 = ((p["flagv"] as Vector2) - c).round()
		if fl["k"] == "pen":
			ci.draw_rect(Rect2(fp.x, fp.y - 26, 2, 26), Color("3b2a1a"))
			_pennant(ci, fp + Vector2(2, -26), t)
		else:
			var prog: float = fl["p"]
			if prog > 0.0:
				var h := roundf(34.0 * prog)
				ci.draw_rect(Rect2(fp.x, fp.y - h, 2, h), Color("3b2a1a"))
				ci.draw_rect(Rect2(fp.x - 1, fp.y - h - 2, 4, 2), Color("f0c24a"))
				if prog > 0.05: _cloth(ci, fp + Vector2(2, -h), t)


static func _cloth(ci: CanvasItem, pos: Vector2, t: float) -> void:
	for col in 16:
		var dy := roundf(sin(t * 5.0 + col * 0.55) * 2.2 * (col / 15.0))
		ci.draw_texture_rect_region(_flag, Rect2(pos.x + col, pos.y + dy, 1, 16), Rect2(col, 0, 1, 16))


static func _pennant(ci: CanvasItem, pos: Vector2, t: float) -> void:
	for col in 12:
		var hh := roundf(7.0 - col * 0.5)
		var dy := roundf(sin(t * 5.0 + col * 0.6) * 1.3 * (col / 11.0))
		ci.draw_rect(Rect2(pos.x + col, pos.y + dy + roundf((7.0 - hh) / 2.0), 1, hh), Color("f0c24a"))


## Barco con tus 8 sprites. pos = punto del casco sobre el agua (coordenadas de pantalla).
static func draw_ship(ci: CanvasItem, dir: int, pos: Vector2, scale: float, bob: float) -> void:
	var s := 64.0 * scale
	ci.draw_rect(Rect2(roundf(pos.x - 15.0 * scale * 1.3), roundf(pos.y + 2.0 + bob), roundf(30.0 * scale * 1.3), maxf(3.0, roundf(4.0 * scale))), Color(0, 0, 0, 0.22))
	ci.draw_texture_rect(_ships[dir], Rect2(roundf(pos.x - s / 2.0), roundf(pos.y - 44.0 * scale + bob), s, s), false)


static func draw_fog(ci: CanvasItem, cam: Vector2, t: float, fog_clouds: Array) -> void:
	if Game.fog_alpha <= 0.01: return
	var col := Color(1, 1, 1, minf(1.0, Game.fog_alpha) * 0.93)
	for c in fog_clouds:
		var x := roundf(c["x"] + sin(t * c["sp"] + c["ph"]) * 14.0 - cam.x - 42.0)
		var y := roundf(c["y"] + cos(t * c["sp"] * 0.8 + c["ph"]) * 6.0 - cam.y - 24.0)
		if x > Game.VW or y > Game.VH or x < -90 or y < -50: continue
		ci.draw_texture(_clouds[c["v"]], Vector2(x, y), col)


static func make_fog_clouds() -> Array:
	var rng := RandomNumberGenerator.new()
	rng.seed = 777
	var c: Vector2 = Game.places[Game.SKULL_I]["posv"]
	var out: Array = []
	for i in 54:
		var a := rng.randf() * TAU
		var d := sqrt(rng.randf()) * (Game.FOG_R + 10.0)
		out.append({"x": c.x + cos(a) * d, "y": c.y + sin(a) * d * 0.95, "v": rng.randi() % 3, "ph": rng.randf() * TAU, "sp": 0.15 + rng.randf() * 0.25})
	return out


## Pirata a pie. pos = pies (centro-abajo). dir: "d","u","l","r".
static func draw_pirate(ci: CanvasItem, pos: Vector2, dir: String, fr: int, skull: bool) -> void:
	var theme := "s" if skull else "n"
	var tx: Texture2D = _pirates["%s_%s_%d" % [theme, dir, fr]]
	var p := pos.round()
	ci.draw_texture(tx, p + Vector2(-8, -26))
