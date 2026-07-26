import { EOF } from "./tokenize";

const PRECEDENCE = { PLUS: 1, STAR: 2 };
const OP_LABEL = { PLUS: "+", STAR: "*" };

function cloneTree(node) {
    return node ? JSON.parse(JSON.stringify(node)) : null;
}

function labelOf(node) {
    return node ? node.label : "?";
}

/**
 * Traced Pratt / precedence-climbing parser (see src/parser/README.md,
 * section 4b): a single parseExpr(minPrecedence) loop consults PRECEDENCE
 * instead of the grammar having one rule per precedence level. Records one
 * trace frame per meaningful step, tagged with the current call depth (so
 * the UI can render it as an indented call stack) and a snapshot of the
 * tree built so far.
 */
export function parsePratt(tokens) {
    const trace = [];
    let pos = 0;
    let depth = 0;

    function record(action, note, tree) {
        trace.push({ depth, action, note, tokenIndex: pos, tree: cloneTree(tree) });
    }

    function parseAtom() {
        depth++;
        const tok = tokens[pos];
        record("enter", `parseAtom() at "${tok.text}"`, null);
        let node;
        if (tok.type === "NUMBER" || tok.type === "IDENTIFIER") {
            pos++;
            node = { label: tok.text, children: [] };
            record("atom", `matched ${tok.type} "${tok.text}"`, node);
        } else if (tok.type === "LPAREN") {
            pos++;
            record("enter", "matched '(' - recursing into parseExpr(0)", null);
            node = parseExpr(0);
            const close = tokens[pos];
            if (close.type !== "RPAREN") throw new Error(`Expected ')' at position ${close.start}`);
            pos++;
            record("atom", `matched ')' - group is "${labelOf(node)}"`, node);
        } else {
            throw new Error(`Unexpected token '${tok.text || tok.type}' at position ${tok.start}`);
        }
        depth--;
        return node;
    }

    function parseExpr(minPrecedence) {
        depth++;
        record("enter", `parseExpr(minPrecedence=${minPrecedence})`, null);
        let left = parseAtom();
        while (true) {
            const opTok = tokens[pos];
            const prec = PRECEDENCE[opTok.type];
            if (prec === undefined || prec < minPrecedence) break;
            record("decide", `next token "${opTok.text}" has precedence ${prec} >= ${minPrecedence} - keep combining`, left);
            pos++;
            const right = parseExpr(prec + 1); // +1 makes '+'/'*' left-associative
            left = { label: OP_LABEL[opTok.type], children: [left, right] };
            record("combine", `built (${labelOf(left.children[0])} ${opTok.text} ${labelOf(left.children[1])})`, left);
        }
        record("exit", `parseExpr returns "${labelOf(left)}"`, left);
        depth--;
        return left;
    }

    const tree = parseExpr(0);
    if (tokens[pos].type !== EOF) throw new Error(`Unexpected trailing token '${tokens[pos].text}' at position ${tokens[pos].start}`);
    record("done", "parse complete", tree);
    return { tree, trace };
}
