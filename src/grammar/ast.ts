import { EPSILON } from "../engine/nfa";

export type GroupName = string | number | null;

export type PatternNode = AtomicPattern | DotPattern | CharacterClass | ComplexClass | DollarAnchor | CaretAnchor | Regex | RegexAlternative;

export class Regex {
    subpatterns: Expression[];
    groupName: GroupName;
    _capturing: boolean;

    constructor(subpatterns: Expression[]) {
        this.subpatterns = subpatterns;
        this.groupName = null;
        this._capturing = true;
    }

    isCapturingGroup(): boolean {
        return this._capturing;
    }

    nonCapturing(): this {
        this._capturing = false;
        return this;
    }
}

export class Expression {
    quantifier: symbol | null;
    child: PatternNode;

    constructor(quantifier: symbol | null, child: PatternNode) {
        this.quantifier = quantifier;
        this.child = child;
    }
}

export class RegexAlternative {
    groupName: GroupName;
    _capturing: boolean;
    alternatives: Regex[];

    /**
     *
     * @param {*} groupName Null if it's not a named group.
     * @param  {...any} alternatives
     */
    constructor(...alternatives: Regex[]) {
        this.groupName = null;
        this._capturing = true;
        this.alternatives = alternatives;
    }

    isCapturingGroup(): boolean {
        return this._capturing;
    }

    nonCapturing(): this {
        this._capturing = false;
        return this;
    }
}

export class AtomicPattern {
    char: string | typeof EPSILON;

    constructor(char: string | typeof EPSILON) {
        this.char = char;
    }
}

export class DotPattern {
}

export class CharacterClass {
    class: string;

    constructor(clazz: string) {
        this.class = clazz;
    }
}

export class ComplexClass {
    chars: string[];
    ranges: [string, string][];
    name: string;
    negated: boolean;

    constructor(individialChars: string[], ranges: [string, string][], name: string, negated: boolean) {
        this.chars = individialChars;
        this.ranges = ranges;
        this.name = name;
        this.negated = negated;
    }

    matches(c: string): boolean {
        return this.chars.includes(c) || this.ranges.some(([start, end]) => c >= start && end >= c);
    }
}

export class DollarAnchor {

}

export class CaretAnchor {

}
