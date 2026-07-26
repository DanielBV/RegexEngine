/**
 * Generic FIRST/FOLLOW/nullable computation for a context-free grammar,
 * shared by the LL(1) table builder (ll1.js) and the SLR(1) table builder
 * (slr.js) - both need the exact same fixed-point analysis, just to build
 * different kinds of parsing tables from it.
 *
 * Grammar shape: { start, nonterminals: Set<string>, productions: [{lhs, rhs: string[]}] }.
 * A production with an empty rhs (`rhs: []`) is an epsilon production.
 * Anything not in `nonterminals` is treated as a terminal (including the
 * `eofSymbol`, which FOLLOW(start) always contains).
 */
export function computeFirstFollow(grammar, eofSymbol) {
    const { nonterminals, productions, start } = grammar;
    const isNonterminal = (sym) => nonterminals.has(sym);

    const NULLABLE = new Set();
    const FIRST = new Map();
    for (const nt of nonterminals) FIRST.set(nt, new Set());

    function firstOfSymbol(sym) {
        return isNonterminal(sym) ? FIRST.get(sym) : new Set([sym]);
    }

    function firstOfSequence(seq) {
        const set = new Set();
        let nullable = true;
        for (const sym of seq) {
            for (const f of firstOfSymbol(sym)) set.add(f);
            if (!(isNonterminal(sym) ? NULLABLE.has(sym) : false)) {
                nullable = false;
                break;
            }
        }
        return { set, nullable };
    }

    let changed = true;
    while (changed) {
        changed = false;
        for (const p of productions) {
            if (!NULLABLE.has(p.lhs) && p.rhs.every((s) => isNonterminal(s) && NULLABLE.has(s))) {
                NULLABLE.add(p.lhs);
                changed = true;
            }
            const before = FIRST.get(p.lhs).size;
            const { set } = firstOfSequence(p.rhs);
            for (const f of set) FIRST.get(p.lhs).add(f);
            if (FIRST.get(p.lhs).size !== before) changed = true;
        }
    }

    const FOLLOW = new Map();
    for (const nt of nonterminals) FOLLOW.set(nt, new Set());
    FOLLOW.get(start).add(eofSymbol);

    changed = true;
    while (changed) {
        changed = false;
        for (const p of productions) {
            for (let i = 0; i < p.rhs.length; i++) {
                const B = p.rhs[i];
                if (!isNonterminal(B)) continue;
                const { set: firstBeta, nullable: betaNullable } = firstOfSequence(p.rhs.slice(i + 1));
                const before = FOLLOW.get(B).size;
                for (const f of firstBeta) FOLLOW.get(B).add(f);
                if (betaNullable) for (const f of FOLLOW.get(p.lhs)) FOLLOW.get(B).add(f);
                if (FOLLOW.get(B).size !== before) changed = true;
            }
        }
    }

    return {
        FIRST,
        FOLLOW,
        NULLABLE,
        /**
         * FIRST of a whole symbol sequence (e.g. a production's rhs), reusing
         * the FIRST/NULLABLE tables just computed - both ll1.js (table
         * construction) and slr.js (nothing needs this directly today, but
         * kept alongside FOLLOW for symmetry) build on this instead of
         * recomputing the same fixed-point logic.
         */
        firstOfSequence: (seq) => firstOfSequence(seq),
    };
}
