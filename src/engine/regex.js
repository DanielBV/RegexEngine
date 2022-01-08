import parseRegex from "../grammar/parser";
import { ConversionBuilder } from "./conversions";
import { CapturingNFT } from "./dfa";


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
            groups[0] = source.substring(start, r.endingPosition);
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
    constructor (regex) {
        this.source = regex;
        const ast = parseRegex(regex);
        const cb = new ConversionBuilder( () => new CapturingNFT());
        this.nfa = cb.regexToNFA(ast);
    }

    findFirstMatch(string) {
        for (let i = 0;  i < string.length; i++) {
            const r = this.nfa.compute(string.substring(i), i);
            if (r.success) return Match.fromNFAResult(string, i, r);
        }
        return null;
    }

    /**
     * Returns a list of matches. The list is ordered in the same order the matches are found
     */
    findAllMatches(string) {
        const matches = [];
        for (let i = 0;  i < string.length; i++) {
           const r = this.nfa.compute(string.substring(i), i);
           if (r.success) {
               matches.push(Match.fromNFAResult(string, i, r));
               if (r.endingPosition === i) break; // This can happen with lazy regex like '.*?'. If they arent stop they'll loop forever
               i = r.endingPosition - 1; // - 1 because when the loop ends it sums 1
           }
        }
        return matches;
    }

}