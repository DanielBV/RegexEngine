function escapeAndPrettify(name) {
    return name === " " ? "space" : name.replaceAll(/\\/g, "\\\\");
}

/**
 * DOT graph for the combined lexer NFA (see buildLexerNFA). Unlike the
 * single-pattern regex NFA diagram (nfaToDot.js), this NFA has one accepting
 * state per token rule, so every one of them is drawn as a labeled
 * doublecircle instead of assuming a single ending state. When a `frame`
 * (see trace.js) is given, its whole active-state set is highlighted, and
 * the accepting state (if any) backing the frame's current "best match so
 * far" is highlighted in a second color.
 */
export function lexerNfaToDot(lexerNfa, frame) {
    const { nfa, tokenTypeByEndState } = lexerNfa;
    const activeStates = new Set(frame ? frame.activeStates : []);
    const bestState = frame && frame.best
        ? Object.keys(tokenTypeByEndState).find((name) => tokenTypeByEndState[name].priority === frame.best.token.priority)
        : null;

    const states = Object.keys(nfa.states).sort().reverse();
    const nodeDefinition = states.map((name) => {
        const tag = tokenTypeByEndState[name];
        const shape = tag ? "doublecircle" : "circle";
        const label = tag ? `${name}\\n[${tag.name}]` : name;
        let color = "";
        if (name === bestState && activeStates.has(name)) color = ", color=blue, penwidth=2";
        else if (activeStates.has(name)) color = ", color=green";
        return `${name} [shape=${shape}, label="${label}"${color}];`;
    });

    let dot = `digraph nfa {
        rankdir=LR;
        "" [shape=none]
        ${nodeDefinition.join("\n")}
        "" -> ${nfa.initialState}\n`;
    for (const state of Object.values(nfa.states)) {
        for (const [matcher, toState] of state.transitions) {
            dot += `    ${state.name} -> ${toState.name} [label = "${escapeAndPrettify(matcher.label)}"]; \n`;
        }
    }
    return dot + "}";
}
