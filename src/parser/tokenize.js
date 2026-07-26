import { Lexer } from "../lexer/lexer";

/**
 * The terminals shared by all three parsing-algorithm demos on the parser
 * comparison page. Reuses the actual project Lexer (src/lexer/lexer.js) to
 * turn FIXED_INPUT into a token stream, exactly like a real parser would
 * consume a real lexer's output.
 */
const RULES = [
    { name: "NUMBER", pattern: "\\d+" },
    { name: "IDENTIFIER", pattern: "[a-zA-Z]\\w*" },
    { name: "PLUS", pattern: "\\+" },
    { name: "STAR", pattern: "\\*" },
    { name: "LPAREN", pattern: "\\(" },
    { name: "RPAREN", pattern: "\\)" },
    { name: "WS", pattern: " +" },
];

export const FIXED_INPUT = "( 1 + 2 ) * 3 + 4";

export const EOF = "EOF";

/**
 * Tokenizes FIXED_INPUT with the real Lexer, drops whitespace (none of the
 * three parsers below need to see it - see the parser design notes'
 * "skip tokens" section), and appends an EOF sentinel so every parser can
 * treat "ran out of input" as just another token instead of a special case.
 */
export function getFixedTokens() {
    const lexer = new Lexer(RULES);
    const tokens = lexer.tokenize(FIXED_INPUT).filter((t) => t.type !== "WS");
    tokens.push({ type: EOF, text: "", start: FIXED_INPUT.length, end: FIXED_INPUT.length });
    return tokens;
}
