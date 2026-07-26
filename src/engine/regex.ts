import parseRegex from "../grammar/parser";
import { ConversionBuilder } from "./conversions";
import { ComputeMemory, EngineNFA, GroupId } from "./nfa";


export class Match {
    source: string;
    start: number;
    end: number;
    _groups: Record<GroupId, string>;

    constructor(source: string, start: number, end: number, groups: Record<GroupId, string>) {
        this.source = source;
        this.start = start;
        this.end = end;
        this._groups = groups;
    }

    static fromNFAResult(source: string, start: number, r: ComputeMemory): Match {
        const groups: Record<GroupId, string> = {};
        if (r.success) {
            Object.values(r.GROUP_MATCHES).forEach(([i, start, end]) => groups[i] = source.substring(start,end));
        }
        return new Match(source, start, r.endingPosition as number, groups);
    }

    group(id: GroupId): string {
        return this._groups[id];
    }

    groups(): Record<GroupId, string> {
        return this._groups;
    }
}

export class NFARegex {
    source: string;
    nfa: EngineNFA;
    iterative: boolean;

    constructor (regex: string, iterative: boolean = true) {
        this.source = regex;
        const ast = parseRegex(regex);
        const cb = new ConversionBuilder( () => new EngineNFA());
        this.nfa = cb.regexToNFA(ast);
        this.iterative = iterative;
    }

    _compute(string: string, i: number): ComputeMemory {
        return this.iterative ? this.nfa.iterativeCompute(string, i) : this.nfa.compute(string, i);
    }

    findFirstMatch(string: string): Match | null {
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
    findAllMatches(string: string): Match[] {
        const matches: Match[] = [];
        for (let i = 0;  i < string.length; i++) {
           const r = this._compute(string.substring(i), i);
           if (r.success) {
               const match = Match.fromNFAResult(string, i, r);
               // This can be false when it matches "nothing", like with optional parameters
               if (match.start !== match.end) {
                   matches.push(match);
                   if (r.endingPosition !== i)i = (r.endingPosition as number) - 1;
               }
           }
        }
        return matches;
    }

}
