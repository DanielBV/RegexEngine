import { buildLexerNFA } from "../src/lexer/lexerNfa";
import { nextToken } from "../src/lexer/simulate";

const RULES = [
    { name: "CONST", pattern: "const" },
    { name: "EQ", pattern: "=" },
    { name: "NUMBER", pattern: "\\d+" },
    { name: "IDENTIFIER", pattern: "[a-zA-Z]\\w*" },
    { name: "ADD", pattern: "\\+" },
    { name: "WS", pattern: " +" },
];

describe("buildLexerNFA", () => {
    it("tags each rule's end state with its name and priority", () => {
        const { tokenTypeByEndState } = buildLexerNFA(RULES);
        const tags = Object.values(tokenTypeByEndState).sort((a, b) => a.priority - b.priority);
        expect(tags.map((t) => t.name)).toEqual(["CONST", "EQ", "NUMBER", "IDENTIFIER", "ADD", "WS"]);
        expect(tags.map((t) => t.priority)).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it("gives every state in the combined NFA a unique name", () => {
        // Each rule's underlying NFA is built independently and would
        // normally start naming its states back at "q0" - this checks that
        // merging them didn't silently clobber another rule's states.
        const { nfa } = buildLexerNFA(RULES);
        const names = Object.keys(nfa.states);
        expect(new Set(names).size).toBe(names.length);
    });

    it("adds one epsilon transition from the shared start state per rule", () => {
        const { nfa } = buildLexerNFA(RULES);
        const startState = nfa.states[nfa.initialState];
        expect(startState.transitions.length).toBe(RULES.length);
    });
});

describe("nextToken - maximal munch", () => {
    const lexerNfa = buildLexerNFA(RULES);

    it("prefers the longer IDENTIFIER match over the shorter CONST keyword match", () => {
        const result = nextToken(lexerNfa, "constant", 0);
        expect(result.token.name).toBe("IDENTIFIER");
        expect(result.endPos).toBe(8);
    });

    it("matches the CONST keyword when input doesn't continue into an identifier", () => {
        const result = nextToken(lexerNfa, "const ", 0);
        expect(result.token.name).toBe("CONST");
        expect(result.endPos).toBe(5);
    });

    it("matches starting at a non-zero offset", () => {
        const result = nextToken(lexerNfa, "  const", 2);
        expect(result.token.name).toBe("CONST");
        expect(result.endPos).toBe(7);
    });

    it("returns null when nothing matches at the given position", () => {
        const result = nextToken(lexerNfa, "@@@", 0);
        expect(result).toBeNull();
    });
});
