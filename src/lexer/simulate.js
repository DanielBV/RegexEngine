import { EPSILON } from "../engine/nfa";

/**
 * All states reachable from `states` through epsilon-only transitions,
 * including `states` themselves. A plain visited-set is enough to avoid
 * infinite loops on epsilon cycles (e.g. from constructs like `(|)*`) -
 * unlike the engine's backtracking simulation, there's no per-path memory to
 * juggle here since we only ever care about "is this state reachable", not
 * "by which path".
 */
export function epsilonClosure(states, pos) {
    const stack = [...states];
    const closure = new Set(states);
    while (stack.length) {
        const state = stack.pop();
        for (const [matcher, toState] of state.transitions) {
            if (!closure.has(toState) && matcher.matches(EPSILON, pos)) {
                closure.add(toState);
                stack.push(toState);
            }
        }
    }
    return closure;
}

/**
 * Among a set of currently active states, finds the highest-priority token
 * tag (lowest priority number) attached to an accepting state, if any.
 */
export function bestAccepting(states, pos, tokenTypeByEndState) {
    let winner = null;
    for (const state of states) {
        const tag = tokenTypeByEndState[state.name];
        if (tag && (winner === null || tag.priority < winner.priority)) {
            winner = tag;
        }
    }
    return winner ? { endPos: pos, token: winner } : null;
}

/**
 * Finds the token that should be produced starting at `startPos`, using
 * maximal munch (longest match wins) with ties broken by rule priority.
 *
 * Rather than the engine's single-path backtracking simulation (which
 * returns as soon as any one path reaches an accepting state - wrong for a
 * lexer, since a lower-priority rule might match further ahead), this steps
 * the whole set of currently-active NFA states in lockstep (subset
 * construction performed on the fly). Every alternative is explored before a
 * winner is picked, so the longest reachable accepting position always wins.
 *
 * @returns {{endPos: number, token: {name: string, priority: number}} | null}
 *  `null` when no rule matches anything starting at `startPos`.
 */
export function nextToken(lexerNfa, text, startPos) {
    const { nfa, tokenTypeByEndState } = lexerNfa;

    let current = epsilonClosure([nfa.states[nfa.initialState]], startPos);
    let best = bestAccepting(current, startPos, tokenTypeByEndState);

    let pos = startPos;
    while (current.size > 0 && pos < text.length) {
        const char = text[pos];
        const nextStates = new Set();
        for (const state of current) {
            for (const [matcher, toState] of state.transitions) {
                if (matcher.matches(char, pos)) {
                    nextStates.add(toState);
                }
            }
        }
        if (nextStates.size === 0) break;

        pos += 1;
        current = epsilonClosure(nextStates, pos);
        const candidate = bestAccepting(current, pos, tokenTypeByEndState);
        if (candidate) best = candidate;
    }

    return best;
}
