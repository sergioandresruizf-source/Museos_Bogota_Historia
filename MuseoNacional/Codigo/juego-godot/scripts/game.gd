extends Node
## Autoload "Game": datos del museo, progreso guardado, utilidades del mundo
## (colisiones con islas, rutas, texturas, sonidos). Los datos editables están en
## res://data/museo.json (islas, obras, textos). El mapa está en res://data/world.json.

const VW := 400
const VH := 300
const WORLD_W := 2320
const WORLD_H := 2840
const N_ISL := 10
const SKULL_I := 10
const FOG_R := 238.0
const CELL := 40
const SAVE_PATH := "user://progreso.json"
const SHIP_MAP := [2, 3, 4, 5, 6, 7, 0, 1]   # índice = round(ángulo/45°) mod 8 (0 = este)

var museo: Dictionary = {}
var cfg: Dictionary = {"exigirVerTodas": true, "exigirVerTodasEnCalavera": true, "velocidadBarco": 105.0, "atajos": false}
var txt: Dictionary = {
	"nieblaBloqueada": "Una espesa niebla bloquea el paso a la Isla Calavera…",
	"nieblaSeDisipa": "¡La niebla se disipa! La Isla Calavera ya es accesible.",
	"cineInicio": "Las obras removidas vuelven a casa…",
	"finalTitulo": "¡La contrarrevolución está completa!",
	"finalTexto": "Cada obra removida regresó a su sala y la bandera de la revolución ondea en todas las islas."
}
var places: Array = []
var start: Vector2 = Vector2.ZERO
var save: Dictionary = {}
var main: Node = null      # nodo raíz (main.gd)
var ui: Node = null        # capa de interfaz (ui.gd)
var fog_alpha: float = 1.0
var dialog_open: bool = false
var blocked: bool = false  # true mientras hay fundido / título / pantalla final
var cine_flags: Dictionary = {}   # durante la cinemática: isla -> progreso 0..1
var astar: AStarGrid2D
var muted: bool = false

var _tex_cache: Dictionary = {}
var _consumed_frame: int = -1
var _players: Array = []
var _sounds: Dictionary = {}


func _ready() -> void:
	_setup_inputs()
	_load_data()
	load_save()
	_build_astar()
	for i in 4:
		var p := AudioStreamPlayer.new()
		add_child(p)
		_players.append(p)


func _unhandled_input(event: InputEvent) -> void:
	if not cfg.get("atajos", false): return
	if event is InputEventKey and event.pressed and event.shift_pressed:
		if event.keycode == KEY_E: cheat_explore_all()
		elif event.keycode == KEY_C:
			cheat_explore_all()
			save["fog_lifted"] = true
			if main: main.go("cine", {})


# ---------------------------------------------------------------- entrada
func _setup_inputs() -> void:
	_add_action("izq", [KEY_LEFT, KEY_A])
	_add_action("der", [KEY_RIGHT, KEY_D])
	_add_action("arr", [KEY_UP, KEY_W])
	_add_action("abj", [KEY_DOWN, KEY_S])
	_add_action("accion", [KEY_SPACE, KEY_ENTER, KEY_E, KEY_Z])
	_add_action("atras", [KEY_ESCAPE, KEY_B, KEY_BACKSPACE, KEY_X])


func _add_action(action_name: String, keys: Array) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name, 0.15)
	for k in keys:
		var e := InputEventKey.new()
		e.keycode = k
		InputMap.action_add_event(action_name, e)


## Pulsación de "accion" que aún no fue usada en este fotograma.
func action_pressed() -> bool:
	return Input.is_action_just_pressed("accion") and _consumed_frame != Engine.get_process_frames()


func back_pressed() -> bool:
	return Input.is_action_just_pressed("atras") and _consumed_frame != Engine.get_process_frames()


func consume() -> void:
	_consumed_frame = Engine.get_process_frames()


func axis() -> Vector2:
	return Input.get_vector("izq", "der", "arr", "abj")


# ---------------------------------------------------------------- datos
func _read_json(path: String) -> Variant:
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("No se pudo abrir " + path)
		return null
	return JSON.parse_string(f.get_as_text())


func _load_data() -> void:
	var m: Variant = _read_json("res://data/museo.json")
	if m is Dictionary:
		museo = m
		cfg.merge(m.get("config", {}), true)
		txt.merge(m.get("textos", {}), true)
	var w: Variant = _read_json("res://data/world.json")
	places = w["places"]
	start = Vector2(w["start"][0], w["start"][1])
	for p in places:
		p["posv"] = Vector2(p["pos"][0], p["pos"][1])
		var d: Dictionary = p["dock"]
		d["tipv"] = Vector2(d["tip"][0], d["tip"][1])
		d["dirv"] = Vector2(d["ux"], d["uy"])
		p["flagv"] = Vector2(p["flag_base"][0], p["flag_base"][1])


func place_name(i: int) -> String:
	if i == SKULL_I:
		return str(museo.get("calavera", {}).get("nombre", "Isla Calavera"))
	var islas: Array = museo.get("islas", [])
	if i < islas.size():
		return str(islas[i].get("nombre", "Isla %d" % (i + 1)))
	return "Isla %d" % (i + 1)


func island_works(i: int) -> Array:
	var islas: Array = museo.get("islas", [])
	if i < islas.size():
		return islas[i].get("obras", [])
	return []


func removed_list() -> Array:
	var out: Array = []
	for i in N_ISL:
		var works := island_works(i)
		for j in works.size():
			if works[j].get("removida", false):
				out.append({"i": i, "j": j, "o": works[j]})
	return out


# ---------------------------------------------------------------- progreso
func default_save() -> Dictionary:
	return {"viewed": {}, "entered": {}, "cine_done": false, "fog_lifted": false}


func load_save() -> void:
	save = default_save()
	if FileAccess.file_exists(SAVE_PATH):
		var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
		var s: Variant = JSON.parse_string(f.get_as_text())
		if s is Dictionary:
			save.merge(s, true)


func persist() -> void:
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f: f.store_string(JSON.stringify(save))


func reset_save() -> void:
	save = default_save()
	persist()
	fog_alpha = 1.0


func has_progress() -> bool:
	return save["viewed"].size() > 0 or save["entered"].size() > 0 or save["cine_done"]


func is_explored(i: int) -> bool:
	if not save["entered"].has(str(i)): return false
	if not cfg.get("exigirVerTodas", true): return true
	var w := island_works(i)
	for j in w.size():
		if not save["viewed"].has("%d:%d" % [i, j]): return false
	return true


func explored_count() -> int:
	var n := 0
	for i in N_ISL:
		if is_explored(i): n += 1
	return n


func all_explored() -> bool:
	return explored_count() == N_ISL


func cheat_explore_all() -> void:
	for i in N_ISL:
		save["entered"][str(i)] = true
		var w := island_works(i)
		for j in w.size():
			save["viewed"]["%d:%d" % [i, j]] = true
	persist()
	if ui: ui.update_hud()
	if ui: ui.toast("[atajo] Todas las islas exploradas", 2.0)


# ---------------------------------------------------------------- texturas y sonido
func tex(path: String) -> Texture2D:
	if _tex_cache.has(path): return _tex_cache[path]
	var t: Texture2D = null
	if ResourceLoader.exists(path):
		t = load(path)
	_tex_cache[path] = t
	return t


## Imagen de una obra: acepta "obras/foto.jpg" (dentro del proyecto) o una ruta externa.
func obra_tex(rel: String) -> Texture2D:
	if rel == "": return null
	var key := "obra:" + rel
	if _tex_cache.has(key): return _tex_cache[key]
	var t: Texture2D = null
	var candidates: Array = ["res://" + rel, rel, "user://" + rel, OS.get_executable_path().get_base_dir().path_join(rel)]
	for c in candidates:
		if ResourceLoader.exists(c):
			t = load(c)
			break
		if FileAccess.file_exists(c):
			var img := Image.load_from_file(c)
			if img: t = ImageTexture.create_from_image(img)
			break
	_tex_cache[key] = t
	return t


func play(sound: String) -> void:
	if muted: return
	if not _sounds.has(sound):
		_sounds[sound] = load("res://assets/sfx/%s.wav" % sound)
	for p in _players:
		if not p.playing:
			p.stream = _sounds[sound]
			p.play()
			return


# ---------------------------------------------------------------- mundo
func dir_index(v: Vector2) -> int:
	var k := roundi(atan2(v.y, v.x) / (PI / 4.0))
	return SHIP_MAP[posmod(k, 8)]


func place_r(p: Dictionary, th: float) -> float:
	var a: Array = p["pa"]
	return 0.92 + 0.12 * sin(2.0 * th + a[0]) + 0.09 * sin(3.0 * th + a[1]) + 0.06 * sin(5.0 * th + a[2])


## Si el punto está dentro de la isla (más margen) lo empuja hacia afuera.
func push_out(i: int, pt: Vector2, margin: float) -> Vector2:
	var p: Dictionary = places[i]
	var c: Vector2 = p["posv"]
	var rx: float = p["rx"]
	var ry: float = p["ry"]
	var dx := (pt.x - c.x) / rx
	var dy := (pt.y - c.y) / ry
	var d := maxf(sqrt(dx * dx + dy * dy), 0.0001)
	var lim := place_r(p, atan2(dy, dx)) + margin / ((rx + ry) / 2.0)
	if d < lim:
		var k := lim / d
		return Vector2(c.x + dx * k * rx, c.y + dy * k * ry)
	return pt


func blocked_at(pt: Vector2, margin: float) -> bool:
	for i in places.size():
		var p: Dictionary = places[i]
		var c: Vector2 = p["posv"]
		var rx: float = p["rx"]
		var ry: float = p["ry"]
		if absf(pt.x - c.x) > rx * 1.4 + margin or absf(pt.y - c.y) > ry * 1.4 + margin: continue
		var dx := (pt.x - c.x) / rx
		var dy := (pt.y - c.y) / ry
		if sqrt(dx * dx + dy * dy) < place_r(p, atan2(dy, dx)) + margin / ((rx + ry) / 2.0):
			return true
	return false


func _build_astar() -> void:
	var gw := ceili(WORLD_W / float(CELL))
	var gh := ceili(WORLD_H / float(CELL))
	astar = AStarGrid2D.new()
	astar.region = Rect2i(0, 0, gw, gh)
	astar.cell_size = Vector2(CELL, CELL)
	astar.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	astar.update()
	for y in gh:
		for x in gw:
			if blocked_at(Vector2(x * CELL + CELL / 2.0, y * CELL + CELL / 2.0), 30.0):
				astar.set_point_solid(Vector2i(x, y), true)


func line_free(a: Vector2, b: Vector2, m: float) -> bool:
	var n := maxi(1, ceili(a.distance_to(b) / 8.0))
	for i in n + 1:
		if blocked_at(a.lerp(b, float(i) / n), m): return false
	return true


func _nearest_free(p: Vector2) -> Vector2i:
	var gx := clampi(int(p.x / CELL), 0, astar.region.size.x - 1)
	var gy := clampi(int(p.y / CELL), 0, astar.region.size.y - 1)
	if not astar.is_point_solid(Vector2i(gx, gy)): return Vector2i(gx, gy)
	for r in range(1, 12):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				var v := Vector2i(gx + dx, gy + dy)
				if astar.is_in_boundsv(v) and not astar.is_point_solid(v): return v
	return Vector2i(gx, gy)


## Ruta de a -> b rodeando las islas (usada por la cinemática).
func find_path(a: Vector2, b: Vector2) -> PackedVector2Array:
	if line_free(a, b, 24.0):
		return PackedVector2Array([a, b])
	var ids: Array = astar.get_id_path(_nearest_free(a), _nearest_free(b))
	if ids.is_empty():
		return PackedVector2Array([a, b])
	var pts: Array = [a]
	for id in ids:
		pts.append(Vector2(id.x * CELL + CELL / 2.0, id.y * CELL + CELL / 2.0))
	pts.append(b)
	var out := PackedVector2Array([pts[0]])
	var i := 0
	while i < pts.size() - 1:
		var j := pts.size() - 1
		while j > i + 1 and not line_free(pts[i], pts[j], 22.0):
			j -= 1
		out.append(pts[j])
		i = j
	return out


## Bandera visible en la isla i: {} (ninguna) | {"k": "pen"} | {"k": "luffy", "p": progreso}
func flag_for(i: int) -> Dictionary:
	if i == SKULL_I: return {}
	if cine_flags.has(i): return {"k": "luffy", "p": cine_flags[i]}
	if save.get("cine_done", false): return {"k": "luffy", "p": 1.0}
	if is_explored(i): return {"k": "pen"}
	return {}
