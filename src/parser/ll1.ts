import { computeFirstFollow, Grammar, Production } from "./grammarUtils";
import { EOF } from "./tokenize";
import { Token } from "../lexer/lexer";
import { TreeNode } from "./tree";

/**
 * The same expression language as pratt.js and slr.js, but rewritten to
 * remove left recursion (E := E '+' T | T becomes E := T E'), since plain
 * LL(1) table-driven parsing can't handle left-recursive rules - see
 * src/parser/README.md section 4a. E'/T' are the standard "tail" helper
 * nonterminals from that textbook transformation.
 */
const GRAMMAR: Grammar = {
    start: "E",
    nonterminals: new Set(["E", "E'", "T", "T'", "F"]),
    productions: [
        { lhs: "E", rhs: ["T", "E'"] },
        { lhs: "E'", rhs: ["PLUS", "T", "E'"] },
        { lhs: "E'", rhs: [] },
        { lhs: "T", rhs: ["F", "T'"] },
        { lhs: "T'", rhs: ["STAR", "F", "T'"] },
        { lhs: "T'", rhs: [] },
        { lhs: "F", rhs: ["LPAREN", "E", "RPAREN"] },
        { lhs: "F", rhs: ["NUMBER"] },
        { lhs: "F", rhs: ["IDENTIFIER"] },
    ],
};

export interface LL1TraceFrame {
    stack: string[];
    tokenIndex: number;
    action: string;
    tree: TreeNode | null;
}

function cloneTree(node: TreeNode | null): TreeNode | null {
    return node ? JSON.parse(JSON.stringify(node)) : null;
}

/** Builds table[nonterminal][terminal] = production, from FIRST/FOLLOW. */
function buildLL1Table(grammar: Grammar, eofSymbol: string): Record<string, Record<string, Production>> {
    const { FOLLOW, firstOfSequence } = computeFirstFollow(grammar, eofSymbol);
    const table: Record<string, Record<string, Production>> = {};
    for (const nt of grammar.nonterminals) table[nt] = {};

    for (const p of grammar.productions) {
        const { set: firstRhs, nullable } = firstOfSequence(p.rhs);
        for (const t of firstRhs) {
            if (table[p.lhs][t]) throw new Error(`LL(1) conflict on [${p.lhs}, ${t}]`);
            table[p.lhs][t] = p;
        }
        if (nullable) {
            for (const t of FOLLOW.get(p.lhs) as Set<string>) {
                if (table[p.lhs][t]) throw new Error(`LL(1) conflict on [${p.lhs}, ${t}]`);
                table[p.lhs][t] = p;
            }
        }
    }
    return table;
}

export const LL1_TABLE = buildLL1Table(GRAMMAR, EOF);

interface StackEntry {
    symbol: string;
    node: TreeNode | null;
}

/**
 * Standard table-driven predictive parsing with an explicit symbol stack
 * (no recursion at all - this is the generated-parser-generator style,
 * contrasted with pratt.js's hand-written recursive calls). Builds a
 * genuine *concrete parse tree* alongside it: every grammar symbol shows up
 * as a node, including the E'/T' helper nonterminals and explicit epsilon
 * leaves - unlike pratt.js's abstracted AST, this is deliberately left
 * un-simplified to show what table-driven parsing actually produces.
 */
export function parseLL1(tokens: Token[]): { tree: TreeNode, trace: LL1TraceFrame[] } {
    const trace: LL1TraceFrame[] = [];
    const root: TreeNode = { label: GRAMMAR.start, children: [] };
    const stack: StackEntry[] = [
        { symbol: EOF, node: null },
        { symbol: GRAMMAR.start, node: root },
    ];
    let pos = 0;

    function record(action: string) {
        trace.push({
            stack: stack.map((e) => e.symbol),
            tokenIndex: pos,
            action,
            tree: cloneTree(root),
        });
    }

    while (true) {
        const top = stack[stack.length - 1];
        const token = tokens[pos];

        if (top.symbol === EOF) {
            record("accept");
            break;
        }

        if (!GRAMMAR.nonterminals.has(top.symbol)) {
            if (top.symbol !== token.type) throw new Error(`Expected ${top.symbol} but found '${token.text}' at position ${token.start}`);
            (top.node as TreeNode).label = token.text;
            stack.pop();
            pos++;
            record(`match ${token.type} ("${token.text}")`);
            continue;
        }

        const production = LL1_TABLE[top.symbol][token.type];
        if (!production) throw new Error(`No rule for ${top.symbol} with lookahead ${token.type} ("${token.text}") at position ${token.start}`);
        stack.pop();
        if (production.rhs.length === 0) {
            (top.node as TreeNode).children.push({ label: "ε", children: [] });
        } else {
            const entries: StackEntry[] = production.rhs.map((sym) => {
                const node: TreeNode = { label: sym, children: [] };
                (top.node as TreeNode).children.push(node);
                return { symbol: sym, node };
            });
            for (let i = entries.length - 1; i >= 0; i--) stack.push(entries[i]);
        }
        record(`expand ${top.symbol} -> ${production.rhs.join(" ") || "ε"}`);
    }

    return { tree: root, trace };
}
