
import { getActivity, validateActivity } from "../data/activities.js";
import { initializePuzzle } from "../games/puzzle.js";
import { initializeQuiz } from "../games/quiz.js";
import { quizQuestions } from "../data/quizQuestions.js";
import { initializeTimeline } from "../games/timeline.js";
import { timelineEvents } from "../data/timelineEvents.js";
import { initializeHangman } from "../games/hangman.js";
import { hangmanWords } from "../data/hangmanWords.js";

// ------------------------------------
// INICIAR ACTIVIDADES
// ------------------------------------

export function startActivity(work, onComplete) {

    if (!work) {
        console.warn("No se recibió una obra.");
        return false;
    }

    const activityId = work.activity;

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
    // QUIZ
    // ------------------------------------

    if (activityId === "quiz") {

        const questions = quizQuestions[work.quizKey];

        if (!questions) {
            console.warn(
                `No hay preguntas registradas para ${work.title}.`
            );
            return false;
        }

        return initializeQuiz(questions, onComplete);
    }

        if (activityId === "timeline") {
        const events = timelineEvents[work.timelineKey];

        if (!events) {
            console.warn(`No hay acontecimientos registrados para ${work.title}.`);
            return false;
        }

        return initializeTimeline(events, onComplete);
    }

        if (activityId === "hangman") {
        const wordData = hangmanWords[work.hangmanKey];

        if (!wordData) {
            console.warn(`No hay palabra registrada para ${work.title}.`);
            return false;
        }

        return initializeHangman(wordData, onComplete);
    }

    // ------------------------------------
    // ACTIVIDADES PENDIENTES
    // ------------------------------------

    
    console.warn(
        `La actividad "${activity.name}" todavía no está implementada.`
    );

    return false;
}
