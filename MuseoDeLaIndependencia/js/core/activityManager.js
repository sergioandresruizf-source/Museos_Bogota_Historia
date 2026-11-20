
import { getActivity, validateActivity } from "../data/activities.js";
import { initializePuzzle } from "../games/puzzle.js";

// ------------------------------------
// INICIAR ACTIVIDADES
// ------------------------------------

export function startActivity(work, onComplete) {

    if (!work) {
        console.warn("No se recibió una obra.");
        return false;
    }

    const activityId = work.activity;

    // Comprobar que la actividad existe
    if (!validateActivity(activityId)) {
        console.warn(
            `La actividad "${activityId}" no está registrada.`
        );
        return false;
    }

    const activity = getActivity(activityId);

    // ------------------------------------
    // ROMPECABEZAS
    // ------------------------------------

    if (activityId === "puzzle") {

        initializePuzzle(work.image, onComplete);

        return true;
    }

    // ------------------------------------
    // ACTIVIDADES PENDIENTES
    // ------------------------------------

    console.warn(
        `La actividad "${activity.name}" todavía no está implementada.`
    );

    return false;
}
