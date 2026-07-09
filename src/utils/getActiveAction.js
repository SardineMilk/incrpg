export function getActiveAction() {
    for (const id in game.actionStates) {
        const state = game.actionStates[id];
        if (state?.activeHolder?.active) return id;
    }
    return null;
}