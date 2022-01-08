



export class Regex {
    constructor(subpatterns) {
        this.subpatterns = subpatterns;
        this.groupName = null;
        this._capturing = true;
    }

    isCapturingGroup() {
        return this._capturing;
    }

    nonCapturing() {
        this._capturing = false;
        return this;
    }
}

export class Expression {

    constructor(quantifier, child) {
        this.quantifier = quantifier;
        this.child = child;
    }
}

export class RegexAlternative {
    /**
     * 
     * @param {*} groupName Null if it's not a named group.
     * @param  {...any} alternatives 
     */
    constructor(...alternatives) {
        this.groupName = null;
        this._capturing = true;
        this.alternatives = alternatives;
    }

    isCapturingGroup() {
        return this._capturing;
    }

    nonCapturing() {
        this._capturing = false;
        return this;
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

export class ComplexClass {
    constructor(individialChars, ranges, name, negated) {
        this.chars = individialChars;
        this.ranges = ranges;
        this.name = name;
        this.negated = negated;
    }

    matches(c) {
        return this.chars.includes(c) || this.ranges.some(([start, end]) => c >= start && end >= c);
    }
}

export class DollarAnchor {

}

export class CaretAnchor {
    
}