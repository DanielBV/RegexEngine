import { Lexer, LexerError, Token } from "../src/lexer/lexer";
import { TokenRule } from "../src/lexer/lexerNfa";

// The blog's motivating example: an ordered list of token rules, mirroring an
// ANTLR-style grammar. Keywords are listed before IDENTIFIER so maximal
// munch + priority tokenizes `const` as CONST but `constant` as a single
// IDENTIFIER (not CONST followed by an IDENTIFIER("ant")).
const JS_LIKE_RULES: TokenRule[] = [
    { name: "CONST", pattern: "const" },
    { name: "EQ", pattern: "=" },
    { name: "NUMBER", pattern: "\\d+" },
    { name: "IDENTIFIER", pattern: "[a-zA-Z]\\w*" },
    { name: "ADD", pattern: "\\+" },
    { name: "WS", pattern: " +" },
];

function types(tokens: Token[]): string[] {
    return tokens.map((t) => t.type);
}

function texts(tokens: Token[]): string[] {
    return tokens.map((t) => t.text);
}

describe("Lexer.tokenize", () => {
    const CASES: Array<[string, string[], string[]]> = [
        [
            "const foo = 3 + aVariable",
            ["CONST", "WS", "IDENTIFIER", "WS", "EQ", "WS", "NUMBER", "WS", "ADD", "WS", "IDENTIFIER"],
            ["const", " ", "foo", " ", "=", " ", "3", " ", "+", " ", "aVariable"],
        ],
        // Maximal munch: `constant` must stay one IDENTIFIER, not CONST + IDENTIFIER("ant").
        ["constant", ["IDENTIFIER"], ["constant"]],
        ["const", ["CONST"], ["const"]],
        ["const42", ["IDENTIFIER"], ["const42"]],
    ];

    for (const [input, expectedTypes, expectedTexts] of CASES) {
        it(`tokenizes '${input}' as ${JSON.stringify(expectedTypes)}`, () => {
            const lexer = new Lexer(JS_LIKE_RULES);
            const tokens = lexer.tokenize(input);
            expect(types(tokens)).toEqual(expectedTypes);
            expect(texts(tokens)).toEqual(expectedTexts);
        });
    }

    it("throws a LexerError with the offending position on unmatched input", () => {
        const lexer = new Lexer(JS_LIKE_RULES);
        try {
            lexer.tokenize("foo @ bar");
            fail("Expected tokenize to throw");
        } catch (e) {
            expect(e).toBeInstanceOf(LexerError);
            expect((e as LexerError).pos).toBe(4);
        }
    });
});

describe("Lexer.tokenize - priority tie-breaking", () => {
    // Both rules can match "foo" in full (length 3): FOO literally, and
    // FOOX via `fo\w*` (since the trailing 'o' is a word character). When
    // two rules tie on match length, the earlier-declared rule wins.
    it("prefers the earlier-declared rule when match lengths tie", () => {
        const lexer = new Lexer([
            { name: "FOO", pattern: "foo" },
            { name: "FOOX", pattern: "fo\\w*" },
        ]);
        expect(types(lexer.tokenize("foo"))).toEqual(["FOO"]);
    });

    it("respects declaration order when reversed", () => {
        const lexer = new Lexer([
            { name: "FOOX", pattern: "fo\\w*" },
            { name: "FOO", pattern: "foo" },
        ]);
        expect(types(lexer.tokenize("foo"))).toEqual(["FOOX"]);
    });
});
