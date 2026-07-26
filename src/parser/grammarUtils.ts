export interface Production {
    lhs: string;
    rhs: string[];
}

export interface Grammar {
    start: string;
    nonterminals: Set<string>;
    productions: Production[];
}

export interface FirstFollowResult {
    FIRST: Map<string, Set<string>>;
    FOLLOW: Map<string, Set<string>>;
    NULLABLE: Set<string>;
    firstOfSequence: (seq: string[]) => { set: Set<string>, nullable: boolean };
}

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
export function computeFirstFollow(grammar: Grammar, eofSymbol: string): FirstFollowResult {
    const { nonterminals, productions, start } = grammar;
    const isNonterminal = (sym: string) => nonterminals.has(sym);

    const NULLABLE = new Set<string>();
    const FIRST = new Map<string, Set<string>>();
    for (const nt of nonterminals) FIRST.set(nt, new Set());

    function firstOfSymbol(sym: string): Set<string> {
        return isNonterminal(sym) ? (FIRST.get(sym) as Set<string>) : new Set([sym]);
    }

    function firstOfSequence(seq: string[]): { set: Set<string>, nullable: boolean } {
        const set = new Set<string>();
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
            const before = (FIRST.get(p.lhs) as Set<string>).size;
            const { set } = firstOfSequence(p.rhs);
            for (const f of set) (FIRST.get(p.lhs) as Set<string>).add(f);
            if ((FIRST.get(p.lhs) as Set<string>).size !== before) changed = true;
        }
    }

    const FOLLOW = new Map<string, Set<string>>();
    for (const nt of nonterminals) FOLLOW.set(nt, new Set());
    (FOLLOW.get(start) as Set<string>).add(eofSymbol);

    changed = true;
    while (changed) {
        changed = false;
        for (const p of productions) {
            for (let i = 0; i < p.rhs.length; i++) {
                const B = p.rhs[i];
                if (!isNonterminal(B)) continue;
                const { set: firstBeta, nullable: betaNullable } = firstOfSequence(p.rhs.slice(i + 1));
                const before = (FOLLOW.get(B) as Set<string>).size;
                for (const f of firstBeta) (FOLLOW.get(B) as Set<string>).add(f);
                if (betaNullable) for (const f of FOLLOW.get(p.lhs) as Set<string>) (FOLLOW.get(B) as Set<string>).add(f);
                if ((FOLLOW.get(B) as Set<string>).size !== before) changed = true;
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
        firstOfSequence: (seq: string[]) => firstOfSequence(seq),
    };
}
