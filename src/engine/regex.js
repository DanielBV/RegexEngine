import parseRegex from "../grammar/parser";
import { ConversionBuilder } from "./conversions";
import { EngineNFA } from "./nfa";


export class Match {
    constructor(source, start, end, groups) {
        this.source = source;
        this.start = start; 
        this.end = end;
        this._groups = groups;
    }

    static fromNFAResult(source, start, r) {
        const groups = {};
        if (r.success) {
            Object.values(r.GROUP_MATCHES).forEach(([i, start, end]) => groups[i] = source.substring(start,end));
        }
        return new Match(source, start, r.endingPosition, groups);
    }

    group(id) {
        return this._groups[id];
    }

    groups() {
        return this._groups;
    }
}

export class NFARegex {
    constructor (regex, iterative=true) {
        this.source = regex;
        const ast = parseRegex(regex);
        const cb = new ConversionBuilder( () => new EngineNFA());
        this.nfa = cb.regexToNFA(ast);
        this.iterative = iterative;
    }

    _compute(string, i) {
        return this.iterative ? this.nfa.iterativeCompute(string, i) : this.nfa.compute(string, i);
    }

    findFirstMatch(string) {
        for (let i = 0;  i < string.length; i++) {
            const r = this._compute(string.substring(i), i);
            if (r.success) {
                const match =  Match.fromNFAResult(string, i, r);
                if (match.start !== match.end) 
                    return match;
            }
        }
        return null;
    }

    /**
     * Returns a list of matches. The list is ordered in the same order the matches are found
     */
    findAllMatches(string) {
        const matches = [];
        for (let i = 0;  i < string.length; i++) {
           const r = this._compute(string.substring(i), i);
           if (r.success) {
               const match = Match.fromNFAResult(string, i, r);
               // This can be false when it matches "nothing", like with optional parameters
               if (match.start !== match.end) {
                   matches.push(match);
                   if (r.endingPosition !== i)i = r.endingPosition - 1; 
               }
           }
        }
        return matches;
    }

}