import { EPSILON, MatchInput } from "./nfa";

class Matcher {
    matches(char: MatchInput, i?: number): boolean {
        return false;
    }

    get label(): string {
        return "undefined-matcher"
    }
}

export class CharacterMatcher extends Matcher{
    c: MatchInput;

    constructor(c: MatchInput) {
        super();
        this.c = c;
    }

    matches(char: MatchInput): boolean {
        return this.c === char;
    }

    get label(): string {
        return this.c === EPSILON ? "ε" :
        this.c === "." ? "\\." : (this.c as string);
    }
}


export class StartOfInputMatcher extends Matcher {

    matches(char: MatchInput, i?: number): boolean {
        return char === EPSILON && i == 0;
    }

    get label(): string {
        return "^";
    }
}

export class EndOfInputMatcher extends Matcher {

    matches(char: MatchInput): boolean {
        return char === "" || char === undefined;
    }

    get label(): string {
        return "$";
    }
}

export class DotMatcher extends Matcher {
    matches(char: MatchInput): boolean {
        return char != undefined && char != "" // These two checks are because the compute algorithm of the DPS can call matches with undefined.
        && char !== EPSILON && char !== "\n"  && char !== "\r";
    }

    get label(): string {
        return ".";
    }
}

/*
    A matcher for classes that match with "everything except X"
*/
export class NegatedMatcher extends Matcher {
    baseMatcher: (char: string) => boolean;
    name: string;

    constructor(baseLambda: (char: string) => boolean, name: string) {
        super();
        this.baseMatcher= baseLambda;
        this.name = name;
    }

    matches(char: MatchInput): boolean {
        return char != undefined && char != "" // These two checks are because the compute algorithm of the DPS can call matches with undefined.
        && char !== "\n"  && char !== "\r"
        && char !== EPSILON && this.baseMatcher(char as string);
    }

    get label(): string {
        return this.name;
    }
}

export class PositiveMatcher extends Matcher {
    baseMatcher: (char: string) => boolean;
    name: string;

    constructor(baseLambda: (char: string) => boolean, name: string) {
        super();
        this.baseMatcher= baseLambda;
        this.name = name;
    }

    matches(char: MatchInput): boolean {
        // The char !== EPSILON is to avoid the check bacause EPSILON is a symbol and not a string.
        // So if baseMatcher is  (char) => char >= "0" && char <= "9" it would throw an error.
        return char !== EPSILON && this.baseMatcher(char as string);
    }

    get label(): string {
        return this.name;
    }
}
