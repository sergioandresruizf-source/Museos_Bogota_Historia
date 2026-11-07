extends Node2D
## Raíz del juego: crea la interfaz y cambia entre escenas (título/mar, llegada, museo, cinemática).

const SCENES := {
	"sea": "res://scripts/sea.gd",
	"arrival": "res://scripts/arrival.gd",
	"museum": "res://scripts/museum.gd",
	"cine": "res://scripts/cine.gd",
}
const UIScript = preload("res://scripts/ui.gd")

var current: Node = null
var current_name: String = ""
var busy: bool = false


func _ready() -> void:
	Game.main = self
	var u := CanvasLayer.new()
	u.set_script(UIScript)
	add_child(u)
	Game.ui = u
	u.build()
	_set_scene("sea", {"demo": true})
	u.show_title()


func _set_scene(scene_name: String, params: Dictionary) -> void:
	if current:
		current.queue_free()
		current = null
	Game.ui.show_skip(false)
	Game.ui.set_caption("")
	Game.ui.set_prompt("")
	Game.ui.minimap.visible = false
	var s := Node2D.new()
	s.set_script(load(SCENES[scene_name]))
	add_child(s)
	current = s
	current_name = scene_name
	s.setup(params)


func go(scene_name: String, params: Dictionary) -> void:
	if busy: return
	busy = true
	Game.blocked = true
	var tw := create_tween()
	tw.tween_property(Game.ui.fade, "color:a", 1.0, 0.3)
	await tw.finished
	_set_scene(scene_name, params)
	var tw2 := create_tween()
	tw2.tween_property(Game.ui.fade, "color:a", 0.0, 0.3)
	await tw2.finished
	busy = false
	if not Game.ui.title_root.visible and not Game.ui.finale_root.visible:
		Game.blocked = false
