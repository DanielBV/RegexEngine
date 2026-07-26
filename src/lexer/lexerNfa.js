import parseRegex from "../grammar/parser";
import { ConversionBuilder } from "../engine/conversions";
import { EngineNFA, EPSILON } from "../engine/nfa";
import { CharacterMatcher } from "../engine/matchers";

/**
 * Combines multiple token patterns into a single NFA, tagging each pattern's
 * accepting state with the token type it belongs to.
 *
 * Each pattern is compiled independently via the regex engine's own
 * ConversionBuilder, which names states starting from "q0" every time (its
 * counters are module-level globals reset per regexToNFA call). Merging those
 * NFAs as-is would silently collide, so every pattern's states are first
 * cloned into a single shared naming namespace before being folded into the
 * combined NFA.
 *
 * @param {Array<{name: string, pattern: string}>} tokenRules Ordered list of
 *  token definitions. Array order establishes priority (index 0 = highest),
 *  used by the simulation to break ties when multiple rules match the same
 *  (longest) length of input.
 */
export function buildLexerNFA(tokenRules) {
    let counter = 0;
    const nextName = () => `s${counter++}`;

    const combined = new EngineNFA();
    const start = nextName();
    combined.addState(start);
    combined.setInitialState(start);

    const tokenTypeByEndState = {};
    const cb = new ConversionBuilder(() => new EngineNFA());

    tokenRules.forEach((rule, priority) => {
        const ast = parseRegex(rule.pattern);
        const rawNfa = cb.regexToNFA(ast);
        const cloned = EngineNFA.clone(rawNfa, nextName);

        for (const stateName in cloned.states) {
            combined.states[stateName] = cloned.states[stateName];
        }
        combined.addTransition(start, cloned.initialState, new CharacterMatcher(EPSILON));

        // regexToNFA always produces exactly one ending state: every
        // construction helper in conversions.js (_oneStepNFA, _asteriskplus,
        // _alternativeToNFA, _singleRegexToNFA) resolves to a single-ending
        // -state fragment.
        const [endState] = cloned.endingStates;
        tokenTypeByEndState[endState] = { name: rule.name, priority };
    });

    combined.setEndingStates(Object.keys(tokenTypeByEndState));
    return { nfa: combined, tokenTypeByEndState };
}
