import { computeFirstFollow, Grammar, Production } from "./grammarUtils";
import { EOF } from "./tokenize";
import { Token } from "../lexer/lexer";
import { TreeNode } from "./tree";

/**
 * The same expression language as pratt.js/ll1.js, but left in its natural
 * left-recursive form (E := E '+' T | T) - unlike LL(1), bottom-up LR
 * parsing handles left recursion directly, no grammar rewriting needed (see
 * src/parser/README.md section 4). Augmented with S' -> E (index 0 - the
 * table builder below relies on that index to recognize the accept state).
 */
const NONTERMINALS = new Set(["S'", "E", "T", "F"]);
const TERMINALS = ["PLUS", "STAR", "LPAREN", "RPAREN", "NUMBER", "IDENTIFIER"];
const PRODUCTIONS: Production[] = [
    { lhs: "S'", rhs: ["E"] },
    { lhs: "E", rhs: ["E", "PLUS", "T"] },
    { lhs: "E", rhs: ["T"] },
    { lhs: "T", rhs: ["T", "STAR", "F"] },
    { lhs: "T", rhs: ["F"] },
    { lhs: "F", rhs: ["LPAREN", "E", "RPAREN"] },
    { lhs: "F", rhs: ["NUMBER"] },
    { lhs: "F", rhs: ["IDENTIFIER"] },
];
const GRAMMAR: Grammar = { start: "S'", nonterminals: NONTERMINALS, productions: PRODUCTIONS };

interface Item {
    prodIndex: number;
    dot: number;
}

type Action =
    | { type: "shift", state: number }
    | { type: "reduce", prodIndex: number }
    | { type: "accept" };

export interface SLRTraceFrame {
    states: number[];
    symbols: string[];
    tokenIndex: number;
    action: string;
    tree: TreeNode | null;
}

function itemKey(item: Item): string {
    return `${item.prodIndex}#${item.dot}`;
}

/** Closure of a set of LR(0) items: expand every nonterminal right after a dot. */
function closure(items: Item[]): Item[] {
    const byKey = new Map<string, Item>(items.map((it) => [itemKey(it), it]));
    const queue = [...items];
    while (queue.length) {
        const item = queue.shift() as Item;
        const symbolAfterDot = PRODUCTIONS[item.prodIndex].rhs[item.dot];
        if (!symbolAfterDot || !NONTERMINALS.has(symbolAfterDot)) continue;
        PRODUCTIONS.forEach((p, prodIndex) => {
            if (p.lhs !== symbolAfterDot) return;
            const newItem: Item = { prodIndex, dot: 0 };
            const key = itemKey(newItem);
            if (!byKey.has(key)) {
                byKey.set(key, newItem);
                queue.push(newItem);
            }
        });
    }
    return [...byKey.values()];
}

/** goto(itemSet, symbol): advance the dot past `symbol`, then close. */
function gotoSet(items: Item[], symbol: string): Item[] {
    const moved = items
        .filter((item) => PRODUCTIONS[item.prodIndex].rhs[item.dot] === symbol)
        .map((item) => ({ prodIndex: item.prodIndex, dot: item.dot + 1 }));
    return moved.length ? closure(moved) : [];
}

function itemSetSignature(items: Item[]): string {
    return items.map(itemKey).sort().join(",");
}

/** Canonical collection of LR(0) states, built by repeated goto() from state 0. */
function buildLR0Automaton(): { states: Item[][], transitions: Record<string, number>[] } {
    const allSymbols = [...TERMINALS, ...NONTERMINALS];
    const start = closure([{ prodIndex: 0, dot: 0 }]);
    const states: Item[][] = [start];
    const signatures = new Map<string, number>([[itemSetSignature(start), 0]]);
    const transitions: Record<string, number>[] = [];

    for (let i = 0; i < states.length; i++) {
        transitions[i] = {};
        for (const symbol of allSymbols) {
            const target = gotoSet(states[i], symbol);
            if (target.length === 0) continue;
            const sig = itemSetSignature(target);
            let targetIndex = signatures.get(sig);
            if (targetIndex === undefined) {
                targetIndex = states.length;
                states.push(target);
                signatures.set(sig, targetIndex);
            }
            transitions[i][symbol] = targetIndex;
        }
    }
    return { states, transitions };
}

/** ACTION/GOTO tables via the SLR(1) rule: reduce by A on all of FOLLOW(A). */
function buildSLRTables(): { ACTION: Record<string, Action>[], GOTO: Record<string, number>[] } {
    const { FOLLOW } = computeFirstFollow(GRAMMAR, EOF);
    const { states, transitions } = buildLR0Automaton();
    const ACTION: Record<string, Action>[] = states.map(() => ({}));
    const GOTO: Record<string, number>[] = states.map(() => ({}));

    states.forEach((items, s) => {
        for (const symbol of Object.keys(transitions[s])) {
            const target = transitions[s][symbol];
            if (NONTERMINALS.has(symbol)) GOTO[s][symbol] = target;
            else ACTION[s][symbol] = { type: "shift", state: target };
        }
        for (const item of items) {
            const prod = PRODUCTIONS[item.prodIndex];
            if (item.dot !== prod.rhs.length) continue;
            if (item.prodIndex === 0) {
                ACTION[s][EOF] = { type: "accept" };
                continue;
            }
            for (const t of FOLLOW.get(prod.lhs) as Set<string>) {
                if (ACTION[s][t]) throw new Error(`SLR conflict in state ${s} on '${t}'`);
                ACTION[s][t] = { type: "reduce", prodIndex: item.prodIndex };
            }
        }
    });

    return { ACTION, GOTO };
}

export const { ACTION: SLR_ACTION, GOTO: SLR_GOTO } = buildSLRTables();

function cloneTree(node: TreeNode | null): TreeNode | null {
    return node ? JSON.parse(JSON.stringify(node)) : null;
}

interface SymbolStackEntry {
    symbol: string;
    node: TreeNode;
}

/**
 * Standard shift-reduce driver over the SLR(1) tables above. Unlike the
 * top-down lanes (pratt.js, ll1.js), the tree is assembled bottom-up: mid
 * -parse the stack holds several still-disconnected partial subtrees (a
 * forest), which only get wired together into fewer, larger pieces on each
 * reduce - so each frame's snapshot wraps the current forest under a
 * synthetic invisible root (see treeToDot.js) instead of showing one single
 * growing tree like the top-down lanes do.
 */
export function parseSLR(tokens: Token[]): { tree: TreeNode, trace: SLRTraceFrame[] } {
    const trace: SLRTraceFrame[] = [];
    const stateStack: number[] = [0];
    const symbolStack: SymbolStackEntry[] = [];
    let pos = 0;

    function record(action: string) {
        const forest = symbolStack.map((e) => cloneTree(e.node) as TreeNode);
        const tree: TreeNode | null = forest.length === 0 ? null : forest.length === 1 ? forest[0] : { label: "", children: forest };
        trace.push({ states: [...stateStack], symbols: symbolStack.map((e) => e.symbol), tokenIndex: pos, action, tree });
    }

    while (true) {
        const s = stateStack[stateStack.length - 1];
        const token = tokens[pos];
        const act = SLR_ACTION[s][token.type];
        if (!act) throw new Error(`No SLR action for state ${s} on ${token.type} ("${token.text}") at position ${token.start}`);

        if (act.type === "shift") {
            symbolStack.push({ symbol: token.type, node: { label: token.text, children: [] } });
            stateStack.push(act.state);
            pos++;
            record(`shift "${token.text}" -> state ${act.state}`);
        } else if (act.type === "reduce") {
            const prod = PRODUCTIONS[act.prodIndex];
            const k = prod.rhs.length;
            const children = k > 0 ? symbolStack.splice(-k).map((e) => e.node) : [];
            if (k > 0) stateStack.splice(-k);
            const node: TreeNode = { label: prod.lhs, children };
            symbolStack.push({ symbol: prod.lhs, node });
            const s2 = stateStack[stateStack.length - 1];
            stateStack.push(SLR_GOTO[s2][prod.lhs]);
            record(`reduce ${prod.lhs} -> ${prod.rhs.join(" ") || "ε"}`);
        } else {
            record("accept");
            break;
        }
    }

    return { tree: symbolStack[symbolStack.length - 1].node, trace };
}
