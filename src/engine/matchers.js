import { EPSILON } from "./nfa";

class Matcher {
    matches(char) {
        return false;
    }

    get label() {
        return "undefined-matcher"
    }
}

export class CharacterMatcher extends Matcher{
    constructor(c) {
        super();
        this.c = c;
    }

    matches(char) {
        return this.c === char;
    }

    get label() {
        return this.c === EPSILON ? "ε" :
        this.c === "." ? "\\." : this.c;
    }
}


export class StartOfInputMatcher extends Matcher {

    matches(char, i) {
        return char === EPSILON && i == 0;
    }

    get label() {
        return "^";
    }
}

export class EndOfInputMatcher extends Matcher {

    matches(char, i) {
        return char === "" || char === undefined;
    }

    get label() {
        return "$";
    }
}

export class DotMatcher extends Matcher {
    matches(char) {
        return char != undefined && char != "" // These two checks are because the compute algorithm of the DPS can call matches with undefined.
        && char !== EPSILON && char !== "\n"  && char !== "\r";
    }

    get label() {
        return ".";
    }
}

/*
    A matcher for classes that match with "everything except X"
*/
export class NegatedMatcher extends Matcher {
    constructor(baseLambda, name) {
        super();
        this.baseMatcher= baseLambda;
        this.name = name;
    }

    matches(char) {
        return char != undefined && char != "" // These two checks are because the compute algorithm of the DPS can call matches with undefined.
        && char !== "\n"  && char !== "\r"
        && char !== EPSILON && this.baseMatcher(char);
    }

    get label() {
        return this.name;
    }
}

export class PositiveMatcher extends Matcher {
    constructor(baseLambda, name) {
        super();
        this.baseMatcher= baseLambda;
        this.name = name;
    }

    matches(char) {
        // The char !== EPSILON is to avoid the check bacause EPSILON is a symbol and not a string. 
        // So if baseMatcher is  (char) => char >= "0" && char <= "9" it would throw an error.
        return char !== EPSILON && this.baseMatcher(char);
    }

    get label() {
        return this.name;
    }
}