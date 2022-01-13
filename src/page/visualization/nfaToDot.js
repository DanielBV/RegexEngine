
function escapeAndPrettify(name) {
    return name === " " ? "space" : name.replaceAll(/\\/g, "\\\\");
}

export function nfaToDot(nfa) {
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
const STATE_COLOR = {
    advance: "green",
    startBacktrack: "red",
    backtrack: "orange",
    totalFailure: "brown",
    finished: "lightblue"
};

export function animatedNFAToDot(nfa, currentState, stateType) {
    const states = Object.keys(nfa.states).sort().reverse();
    // The definitions are necessary to keep a consistent order
    const nodeDefinition = states.map(x => {
        const shape = x === nfa.endingStates[0] ? "doublecircle" : "circle";
        const color = x === currentState ? ", color=" + STATE_COLOR[stateType] : "";
        return `${x} [shape=${shape} ${color}];`
    })
    // Assumes only one final state
    let dot = `digraph nfa {
        rankdir=LR;
        "" [shape=none]
        ${nodeDefinition.join("\n")}
        "" -> ${nfa.initialState}\n
        rank = same;
        `;
        for (const state of Object.values(nfa.states)) {
            for (const [matcher, toState] of state.transitions) {
                dot += `    ${state.name} -> ${toState.name} [label = "${escapeAndPrettify(matcher.label)}"]; \n`
            }
        }
        return dot + "}";
}