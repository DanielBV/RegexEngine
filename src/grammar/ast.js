



export class Regex {
    constructor(subpatterns) {
        this.subpatterns = subpatterns;
    }
}

export class Expression {

    constructor(quantifier, child) {
        this.quantifier = quantifier;
        this.child = child;
    }
}

export class RegexAlternative {
    constructor(...alternatives) {
        this.alternatives = alternatives;
    }
}

export class AtomicPattern {
    constructor(char) {
        this.char = char;
    }
}

export class DotPattern {
}

export class CharacterClass {
    constructor(clazz) {
        this.class = clazz;
    }
}

export class Group {
    constructor() {
        this.subpatterns = [];
    }
}

export class ComplexClass {
    constructor(individialChars, ranges, name) {
        this.chars = individialChars;
        this.ranges = ranges;
        this.name = name;
    }

    matches(c) {
        return this.chars.includes(c) || this.ranges.some(([start, end]) => c >= start && end >= c);
    }
}