import { buildLexerNFA, LexerNFA, TokenRule } from "./lexerNfa";
import { epsilonClosure, bestAccepting, NextTokenResult } from "./simulate";
import { State } from "../engine/nfa";
import { Token } from "./lexer";

function stateNames(states: Iterable<State>): string[] {
    return [...states].map((s) => s.name);
}

export interface TraceFrame {
    pos: number;
    activeStates: string[];
    best: NextTokenResult | null;
}

export interface TokenizeTraceFrame extends TraceFrame {
    tokenIndex: number;
    type: "advance" | "tokenAccepted" | "error";
}

export interface TraceTokenizeResult {
    tokens: Token[];
    frames: TokenizeTraceFrame[];
    lexerNfa: LexerNFA;
    error: { pos: number } | null;
}

/**
 * Same stepping algorithm as simulate.js's nextToken, except it records one
 * frame per character consumed - meant for driving a step-by-step animation,
 * not for actual tokenization (see nextToken/Lexer.tokenize for that).
 */
function traceNextToken(lexerNfa: LexerNFA, text: string, startPos: number): { best: NextTokenResult | null, frames: TraceFrame[] } {
    const { nfa, tokenTypeByEndState } = lexerNfa;
    const frames: TraceFrame[] = [];

    let current = epsilonClosure([nfa.states[nfa.initialState as string]], startPos);
    let best = bestAccepting(current, startPos, tokenTypeByEndState);
    frames.push({ pos: startPos, activeStates: stateNames(current), best });

    let pos = startPos;
    while (current.size > 0 && pos < text.length) {
        const char = text[pos];
        const nextStates = new Set<State>();
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
        frames.push({ pos, activeStates: stateNames(current), best });
    }

    return { best, frames };
}

/**
 * Instrumented equivalent of Lexer.tokenize that additionally returns a flat
 * animation trace: one frame per character examined while looking for the
 * next token, each tagged with which token attempt (`tokenIndex`) it belongs
 * to and whether that attempt is still in progress ("advance"), just found a
 * winner ("tokenAccepted"), or ran out of options with no rule ever matching
 * ("error" - the same condition `Lexer.tokenize` raises a LexerError for).
 */
export function traceTokenize(tokenRules: TokenRule[], text: string): TraceTokenizeResult {
    const lexerNfa = buildLexerNFA(tokenRules);
    const tokens: Token[] = [];
    const frames: TokenizeTraceFrame[] = [];
    let pos = 0;

    while (pos < text.length) {
        const { best, frames: tokenFrames } = traceNextToken(lexerNfa, text, pos);
        const tokenIndex = tokens.length;
        tokenFrames.forEach((f, idx) => {
            const isLast = idx === tokenFrames.length - 1;
            frames.push({ ...f, tokenIndex, type: isLast ? (best ? "tokenAccepted" : "error") : "advance" });
        });

        if (!best || best.endPos === pos) break;

        tokens.push({ type: best.token.name, text: text.substring(pos, best.endPos), start: pos, end: best.endPos });
        pos = best.endPos;
    }

    const error = pos < text.length ? { pos } : null;
    return { tokens, frames, lexerNfa, error };
}
