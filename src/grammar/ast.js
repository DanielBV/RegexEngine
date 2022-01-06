



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

export class Group {
    constructor() {
        this.subpatterns = [];
    }
}