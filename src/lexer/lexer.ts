import { buildLexerNFA, LexerNFA, TokenRule } from "./lexerNfa";
import { nextToken } from "./simulate";

export interface Token {
    type: string;
    text: string;
    start: number;
    end: number;
}

export class LexerError extends Error {
    pos: number;

    constructor(pos: number, text: string) {
        super(`Unable to tokenize input at position ${pos}: '${text.substring(pos, pos + 20)}'`);
        this.pos = pos;
    }
}

/**
 * A tokenizer built from an ordered list of named token patterns. Patterns
 * are plain regex strings understood by this project's engine (src/grammar).
 *
 * Array order establishes priority: when multiple patterns can match the
 * same (longest) piece of text, the one declared earliest wins - e.g. list
 * keyword rules before an IDENTIFIER rule so `const` isn't tokenized as an
 * identifier.
 */
export class Lexer {
    tokenRules: TokenRule[];
    lexerNfa: LexerNFA;

    constructor(tokenRules: TokenRule[]) {
        this.tokenRules = tokenRules;
        this.lexerNfa = buildLexerNFA(tokenRules);
    }

    /**
     * @returns {Array<{type: string, text: string, start: number, end: number}>}
     */
    tokenize(text: string): Token[] {
        const tokens: Token[] = [];
        let pos = 0;
        while (pos < text.length) {
            const result = nextToken(this.lexerNfa, text, pos);
            // A zero-length match (e.g. from a pattern like `a*`) would never
            // consume input, so treat it the same as "no match" to avoid
            // looping forever at the same position.
            if (!result || result.endPos === pos) {
                throw new LexerError(pos, text);
            }
            tokens.push({
                type: result.token.name,
                text: text.substring(pos, result.endPos),
                start: pos,
                end: result.endPos,
            });
            pos = result.endPos;
        }
        return tokens;
    }
}
