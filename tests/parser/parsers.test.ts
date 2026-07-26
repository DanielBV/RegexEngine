import { getFixedTokens, FIXED_INPUT, EOF } from "../../src/parser/tokenize";
import { parsePratt } from "../../src/parser/pratt";
import { parseLL1 } from "../../src/parser/ll1";
import { parseSLR } from "../../src/parser/slr";
import { TreeNode } from "../../src/parser/tree";
import { Token } from "../../src/lexer/lexer";

// FIXED_INPUT = "( 1 + 2 ) * 3 + 4"  =>  ((1+2)*3)+4 = 13
const EXPECTED_VALUE = 13;

function evalPrattTree(node: TreeNode): number {
    if (node.label === "+") return evalPrattTree(node.children[0]) + evalPrattTree(node.children[1]);
    if (node.label === "*") return evalPrattTree(node.children[0]) * evalPrattTree(node.children[1]);
    return Number(node.label);
}

// LL1's tree is a full *concrete* parse tree (E/E'/T/T'/F nodes and epsilon
// leaves all present) - walk it the same way the grammar itself is shaped.
function evalE(node: TreeNode): number {
    return evalEPrime(node.children[1], evalT(node.children[0]));
}
function evalEPrime(node: TreeNode, acc: number): number {
    if (node.children.length === 1) return acc; // epsilon
    const [, T, ePrime] = node.children;
    return evalEPrime(ePrime, acc + evalT(T));
}
function evalT(node: TreeNode): number {
    return evalTPrime(node.children[1], evalF(node.children[0]));
}
function evalTPrime(node: TreeNode, acc: number): number {
    if (node.children.length === 1) return acc; // epsilon
    const [, F, tPrime] = node.children;
    return evalTPrime(tPrime, acc * evalF(F));
}
function evalF(node: TreeNode): number {
    if (node.children.length === 3) return evalE(node.children[1]);
    return Number(node.children[0].label);
}

// SLR's tree is the reduced grammar shape directly (E/T/F, no tail helpers).
function evalSLRTree(node: TreeNode): number {
    if (node.label === "E") return node.children.length === 1 ? evalSLRTree(node.children[0]) : evalSLRTree(node.children[0]) + evalSLRTree(node.children[2]);
    if (node.label === "T") return node.children.length === 1 ? evalSLRTree(node.children[0]) : evalSLRTree(node.children[0]) * evalSLRTree(node.children[2]);
    if (node.label === "F") return node.children.length === 3 ? evalSLRTree(node.children[1]) : evalSLRTree(node.children[0]);
    return Number(node.label);
}

describe("getFixedTokens", () => {
    it("tokenizes FIXED_INPUT via the real Lexer and drops whitespace, appending EOF", () => {
        const tokens = getFixedTokens();
        expect(tokens.map((t) => t.type)).toEqual([
            "LPAREN", "NUMBER", "PLUS", "NUMBER", "RPAREN", "STAR", "NUMBER", "PLUS", "NUMBER", EOF,
        ]);
        expect(FIXED_INPUT).toBe("( 1 + 2 ) * 3 + 4");
    });
});

describe("all three algorithms agree on the same result", () => {
    const tokens = getFixedTokens();

    it("Pratt/precedence-climbing produces the correct AST", () => {
        const { tree, trace } = parsePratt(tokens);
        expect(evalPrattTree(tree)).toBe(EXPECTED_VALUE);
        expect(trace[trace.length - 1].action).toBe("done");
    });

    it("LL(1) table-driven parsing produces a concrete parse tree with the correct value", () => {
        const { tree, trace } = parseLL1(tokens);
        expect(tree.label).toBe("E");
        expect(evalE(tree)).toBe(EXPECTED_VALUE);
        expect(trace[trace.length - 1].action).toBe("accept");
    });

    it("SLR(1) shift-reduce parsing produces the correct reduced tree", () => {
        const { tree, trace } = parseSLR(tokens);
        expect(tree.label).toBe("E");
        expect(evalSLRTree(tree)).toBe(EXPECTED_VALUE);
        expect(trace[trace.length - 1].action).toBe("accept");
    });
});

describe("error handling on malformed input", () => {
    // "( 1 + 2" with no closing paren, no trailing "* 3 + 4"
    const badTokens: Token[] = [
        { type: "LPAREN", text: "(", start: 0, end: 1 },
        { type: "NUMBER", text: "1", start: 2, end: 3 },
        { type: "PLUS", text: "+", start: 4, end: 5 },
        { type: "NUMBER", text: "2", start: 6, end: 7 },
        { type: EOF, text: "", start: 7, end: 7 },
    ];

    it("Pratt throws on the missing ')'", () => {
        expect(() => parsePratt(badTokens)).toThrow();
    });

    it("LL(1) throws on the missing ')'", () => {
        expect(() => parseLL1(badTokens)).toThrow();
    });

    it("SLR throws on the missing ')'", () => {
        expect(() => parseSLR(badTokens)).toThrow();
    });
});
