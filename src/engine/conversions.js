import { AtomicPattern, CaretAnchor, CharacterClass, ComplexClass, DollarAnchor, DotPattern, Regex, RegexAlternative } from "../grammar/ast";
import { ASTERISK, LAZY_ASTERISK, OPTIONAL, PLUS, LAZY_PLUS, LAZY_OPTIONAL } from "../grammar/astBuilder";
import { EngineNFA, EPSILON } from "./dfa";
import {CharacterMatcher, DotMatcher, EndOfInputMatcher, NegatedMatcher, PositiveMatcher, StartOfInputMatcher} from './matchers';


let i = 0;
function newState() {
    const c = `q${i}`;
    i++;
    return c;
}

function stateBack() {
    i -= 1;
}

let g = 1;
function newGroup() {
    const c = g;
    g++;
    return c;
}

function resetGroupNumbers() {
    g = 1;
}

function resetStateNumbers() {
    i = 0;
}
const EPSILON_MATCHER = new CharacterMatcher(EPSILON);

const wordLambda = (char) => (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") ||  (char >= "0" && char <= "9") || char === "_";
const SINGLE_SPACE = [" ", "\f", "\n", "\r", "\t", "\v", "\u00a0", "\u1680", "\u2028","\u2029","\u202f", "\u205f", "\u3000", "\ufeff"];
const spaceLambda = (char) => SINGLE_SPACE.includes(char) || (char >= "\u2000" && char <= "\u200a");
const CLASS_CHARACTERS = {
    "\\d": {lambda: (char) => char >= "0" && char <= "9", positive: true}, 
    "\\D": {positive: false, lambda: (char) =>  char < "0" || char > "9"},
    "\\w": {lambda: wordLambda , positive: true}, 
    "\\W": {lambda: (char) => !wordLambda(char) , positive: false}, 
    "\\s": {lambda: spaceLambda, positive: true},
    "\\S": {lambda: (char) => !spaceLambda(char), positive: false},
};
function getClassMatcher(clazz) {
    const matcher = CLASS_CHARACTERS[clazz];
    //TODO this could be simplified just by making the negative match as literally the negation of the positive one. But I should be carefull with "weird"
    //cases like new line, epsilon, undefined, empty string, etc
    if (matcher.positive)
        return new PositiveMatcher(matcher.lambda, clazz);
    else 
        return new NegatedMatcher(matcher.lambda, clazz);
}

export class ConversionBuilder {
    constructor(nfaFactory) {
        this.nfaFactory = nfaFactory;
    }

    regexToNFA(regexAST, resetNumbers=true, isCapturingGroup=null) {
        if (regexAST instanceof RegexAlternative) 
            return this._alternativeToNFA(regexAST,resetNumbers, isCapturingGroup);
        else 
            return this._singleRegexToNFA(regexAST, resetNumbers, isCapturingGroup);
    }

    _singleRegexToNFA(regexAST, resetNumbers=true, capturingGroupNumber=null) {
        let nfa = null;
        if (resetNumbers) {
            resetStateNumbers();
            resetGroupNumbers();
        }
        let isFirst = true;
        for (const c of regexAST.subpatterns) {
            let baseBuilder, base, baseIsCapturing, namedGroup = null;
            if (c.child instanceof AtomicPattern) {
                baseBuilder = () => this._atomicPatternNFA(c.child.char);
            } else if (c.child instanceof RegexAlternative) {  // Groups
                baseIsCapturing = c.child.isCapturingGroup();
                namedGroup = c.child.groupName;
                baseBuilder = (groupNumber) => this._alternativeToNFA(c.child, false, groupNumber);
            } else if (c.child instanceof Regex) { // Groups
                baseIsCapturing = c.child.isCapturingGroup();
                namedGroup = c.child.groupName;
                baseBuilder = (groupNumber) => this.regexToNFA(c.child, false, groupNumber);
            } else if (c.child instanceof DotPattern) {
                baseBuilder = () => this._dotPatternNFA();
            } else if (c.child instanceof CharacterClass) {
                baseBuilder = () => this._characterClassNFA(c.child.class);
            } else if (c.child instanceof ComplexClass) {
                baseBuilder = () => this._complexCharacterClassNFA(c.child);
            } else if (c.child instanceof DollarAnchor)
                baseBuilder = () => this._oneStepNFA(new EndOfInputMatcher());
            else if (c.child instanceof CaretAnchor)
                baseBuilder = () => this._oneStepNFA(new StartOfInputMatcher());
    
            // Lazy to avoid creating unnecessary groups, since newGroup upgrades an internal counter
            const groupBuilder = () => namedGroup ? namedGroup : newGroup();
    
            /* This is a minor detail to make sure the states name don't skip any name 
                Doing it shouldn't have any effect on the final result, but it generates a prettier diagram.
                The basics of this is: 
                - EngineNFA.thompsonAppend allows the unionState and the otherNFA.initialState to have the same 
                    - Whether it has the same name or not, the state 'otherNFA.initialState' is deleted. The difference is that if 
                    they have a differen't names there will be a gap in the names
                - But because the nfa pieces are build independently, the names will never coincide. To force it to coincide we can 
                  just decrease the current state number. But this shouldn't be done for the first node (I don't want a q-1 state)
            */
            if (isFirst) isFirst = false;
            else stateBack();

            if (c.quantifier === ASTERISK || c.quantifier === LAZY_ASTERISK) {
                base = this._asterisk(() => baseBuilder(baseIsCapturing ? groupBuilder() : null), c.quantifier === LAZY_ASTERISK);
            } else if (c.quantifier === PLUS || c.quantifier === LAZY_PLUS) {
                const group = baseIsCapturing ? groupBuilder() : null;
                base = baseBuilder(group);
                const extraPart = this._asterisk(() => EngineNFA.clone(base, () => newState()), c.quantifier === LAZY_PLUS);
                base.thompsonAppendNFA(extraPart, base.endingStates[0]);
            } else if (c.quantifier === OPTIONAL || c.quantifier === LAZY_OPTIONAL) {
                base = baseBuilder(baseIsCapturing ? groupBuilder() : null);
                if (c.quantifier === LAZY_OPTIONAL)
                    base.unshiftTransition(base.initialState, base.endingStates[0], EPSILON_MATCHER);
                else 
                    base.addTransition(base.initialState, base.endingStates[0], EPSILON_MATCHER);
            } else {
                base = baseBuilder(baseIsCapturing ? groupBuilder() : null);
            }
            if (nfa === null) 
                nfa = base 
            else 
                nfa.thompsonAppendNFA(base, nfa.endingStates[0]);
        }
        if (capturingGroupNumber !== null) nfa.addGroup(nfa.initialState, nfa.endingStates[0], capturingGroupNumber); 
        return nfa;
    }

    _asterisk(builder, lazy) {
        const newInit = newState();
        const base = builder();
        const newEnd = newState();
        base.addState(newInit); base.addState(newEnd);
        // The order is important to the NFA with capturing groups because when its executed it tests the transitions in order
        // Which means:
        // - If base.endingStates[0] -> base.initialState goes first, it's greedy 
        // - If base.endingStates[0] -> newEnd goes first, it's non greedy
        if (lazy) {
            base.addTransition(newInit, newEnd, EPSILON_MATCHER);
            base.addTransition(newInit, base.initialState, EPSILON_MATCHER);
            base.addTransition(base.endingStates[0], newEnd, EPSILON_MATCHER);
            base.addTransition(base.endingStates[0], base.initialState, EPSILON_MATCHER);
        } else {
            base.addTransition(newInit, base.initialState, EPSILON_MATCHER);
            base.addTransition(base.endingStates[0], base.initialState, EPSILON_MATCHER);
            base.addTransition(base.endingStates[0], newEnd, EPSILON_MATCHER);
            base.addTransition(newInit, newEnd, EPSILON_MATCHER);
        }
      
        base.setInitialState(newInit);
        base.setEndingStates([newEnd]);
        return base;
    }

    _atomicPatternNFA(character) {
        return this._oneStepNFA(new CharacterMatcher(character));
    }

    _dotPatternNFA() {
        return this._oneStepNFA(new DotMatcher());
    }

    _characterClassNFA(clazz) {
        return this._oneStepNFA(getClassMatcher(clazz));
    }

    _complexCharacterClassNFA(ccc) {
        const matcherLambda = (char) => ccc.matches(char);
        if (ccc.negated) 
            return this._oneStepNFA(new NegatedMatcher((char) => !matcherLambda(char), ccc.name));
        else 
            return this._oneStepNFA(new PositiveMatcher(matcherLambda, ccc.name));
    }

    _oneStepNFA(matcher) {
        const nfa = this.nfaFactory();
        let a = newState();
        let b = newState();
        nfa.declareStates(a,b);
        nfa.setInitialState(a);
        nfa.setEndingStates([b]);

        nfa.addTransition(a,b, matcher);
        return nfa;
    }

    _alternativeToNFA(alternativeAst, resetNumbers=true, capturingGroupNumber=null) {
        if (resetNumbers) {
            resetStateNumbers();
            resetGroupNumbers();
        }
        const nfa = this.nfaFactory();
        const start = newState();
        nfa.addState(start);
        nfa.setInitialState(start);
        nfa.setEndingStates([]);
        const endingStates = [];
        for (let i = 0; i < alternativeAst.alternatives.length; i++) {
            const tmp = this.regexToNFA(alternativeAst.alternatives[i], false);
            endingStates.push(...tmp.endingStates);
            nfa.thompsonAppendNFA(tmp, start);
        }
        const end = newState();
        nfa.addState(end);
        endingStates.forEach(x => nfa.addTransition(x, end, EPSILON_MATCHER));
        nfa.setEndingStates([end]);
        if (capturingGroupNumber !== null) nfa.addGroup(start, end, capturingGroupNumber);
        return nfa;
    }
}
