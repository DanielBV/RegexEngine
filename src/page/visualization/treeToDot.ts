import { TreeNode } from "../../parser/tree";

function escapeLabel(label: string): string {
    return String(label).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * DOT graph for a parse-tree/AST snapshot, shared by all three parsing-
 * algorithm lanes on the parser comparison page (src/parser/pratt.js,
 * ll1.js, slr.js all produce the same plain `{label, children}` node shape).
 * A node with an empty label renders invisible (shape=none) - used by the
 * SLR lane to wrap its still-disconnected forest of partial subtrees under
 * one synthetic root during bottom-up construction, the same idea as
 * nfaToDot's invisible "" pointer node.
 */
export function treeToDot(root: TreeNode | null): string {
    if (!root) return "digraph tree { }";
    let counter = 0;
    const lines: string[] = [];

    function walk(node: TreeNode): string {
        const id = `n${counter++}`;
        const invisible = node.label === "";
        const shape = invisible ? "shape=none" : "shape=box";
        lines.push(`${id} [${shape}, label="${escapeLabel(node.label)}"];`);
        for (const child of node.children || []) {
            const childId = walk(child);
            lines.push(`${id} -> ${childId};`);
        }
        return id;
    }

    walk(root);
    return `digraph tree {\n${lines.join("\n")}\n}`;
}
