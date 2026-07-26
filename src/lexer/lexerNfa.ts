import parseRegex from "../grammar/parser";
import { ConversionBuilder } from "../engine/conversions";
import { EngineNFA, EPSILON, NFA } from "../engine/nfa";
import { CharacterMatcher } from "../engine/matchers";

export interface TokenRule {
    name: string;
    pattern: string;
}

export interface TokenTag {
    name: string;
    // We need to keep track of the priority to resolve ambiguity when the same token parses matches two rules
    priority: number;
}

/**
 * The combined automaton backing a lexer: a plain NFA (no capturing groups,
 * no backtracking compute methods - those are EngineNFA-specific and
 * meaningless here) plus which token each accepting state belongs to.
 * Simulated by simulate.ts's subset-construction nextToken, not by any
 * EngineNFA method.
 */
export class LexerNFA extends NFA {
    tokenTypeByEndState: Record<string, TokenTag>;

    constructor() {
        super();
        this.tokenTypeByEndState = {};
    }
}

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
export function buildLexerNFA(tokenRules: TokenRule[]): LexerNFA {
    let counter = 0;
    const nextName = () => `s${counter++}`;

    const combined = new LexerNFA();
    const start = nextName();
    combined.addState(start);
    combined.setInitialState(start);

    const cb = new ConversionBuilder(() => new EngineNFA());

    tokenRules.forEach((rule, priority) => {
        const ast = parseRegex(rule.pattern);
        const rawNfa = cb.regexToNFA(ast);
        const cloned = EngineNFA.clone(rawNfa, nextName);

        for (const stateName in cloned.states) {
            combined.states[stateName] = cloned.states[stateName];
        }
        combined.addTransition(start, cloned.initialState as string, new CharacterMatcher(EPSILON));

        // regexToNFA always produces exactly one ending state: every
        // construction helper in conversions.js (_oneStepNFA, _asteriskplus,
        // _alternativeToNFA, _singleRegexToNFA) resolves to a single-ending
        // -state fragment.
        const [endState] = cloned.endingStates as string[];
        combined.tokenTypeByEndState[endState] = { name: rule.name, priority };
    });

    combined.setEndingStates(Object.keys(combined.tokenTypeByEndState));
    return combined;
}
