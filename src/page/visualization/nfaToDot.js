
function escapeAndPrettify(name) {
    return name === " " ? "space" : name.replaceAll(/\\/g, "\\\\");
}

export default function nfaToDot(nfa) {
    let dot = `digraph nfa {
    rankdir=LR;
    "" [shape=none]
    node [shape = doublecircle]; ${nfa.endingStates.map(x => x).join(" ")};
    node [shape = circle];
    "" -> ${nfa.initialState}\n`;
    for (const state of Object.values(nfa.states)) {
        for (const [matcher, toState] of state.transitions) {
            dot += `    ${state.name} -> ${toState.name} [label = "${escapeAndPrettify(matcher.label)}"]; \n`
        }
    }
    return dot + "}";
}