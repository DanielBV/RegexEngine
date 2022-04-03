import { AtomicPattern, CaretAnchor, CharacterClass, ComplexClass, DollarAnchor, DotPattern, Regex, RegexAlternative } from "../grammar/ast";
import { ASTERISK, LAZY_ASTERISK, OPTIONAL, PLUS, LAZY_PLUS, LAZY_OPTIONAL } from "../grammar/astBuilder";
import { EngineNFA, EPSILON } from "./nfa";
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

let g = 0;
function newGroup() {
    const c = g;
    g++;
    return c;
}

function resetGroupNumbers() {
    g = 0;
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

    regexToNFA(regexAST) {
        resetStateNumbers();
        resetGroupNumbers();
        return this._regexToNFA(regexAST, 0);
    }

    _regexToNFA(regexAST) {
        if (regexAST instanceof RegexAlternative) 
            return this._alternativeToNFA(regexAST);
        else 
            return this._singleRegexToNFA(regexAST);
    }

    _singleRegexToNFA(regexAST) {
        let nfa = null;
        let isFirst = true;
        // You have to define a concrete group name before going to any subnode so that the order of the group numbers is ascending.
        const groupName = regexAST.isCapturingGroup() ? regexAST.groupName || newGroup() : null;
        for (const c of regexAST.subpatterns) {
            let baseBuilder, base;
            if (c.child instanceof AtomicPattern) {
                baseBuilder = () => this._atomicPatternNFA(c.child.char);
            } else if (c.child instanceof RegexAlternative || c.child instanceof Regex) {  // Groups
                baseBuilder = () => this._regexToNFA(c.child);
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
                base = this._asterisk(() => baseBuilder(), c.quantifier === LAZY_ASTERISK);
            } else if (c.quantifier === PLUS || c.quantifier === LAZY_PLUS) {
                base = this._plus(() => baseBuilder(), c.quantifier === LAZY_PLUS);
            } else if (c.quantifier === OPTIONAL || c.quantifier === LAZY_OPTIONAL) {
                base = baseBuilder();
                if (c.quantifier === LAZY_OPTIONAL)
                    base.unshiftTransition(base.initialState, base.endingStates[0], EPSILON_MATCHER);
                else 
                    base.addTransition(base.initialState, base.endingStates[0], EPSILON_MATCHER);
            } else {
                base = baseBuilder();
            }
            if (nfa === null) 
                nfa = base 
            else 
                //TODO no tengo muy claro si esto es peligroso porque podría cargarse el primer group? O lo he teniddo en cuenta
                nfa.thompsonAppendNFA(base, nfa.endingStates[0]);
        }
        if (groupName !== null) nfa.addGroup(nfa.initialState, nfa.endingStates[0], groupName); 
        return nfa;
    }

    _asterisk(builder, lazy) {
        return this._asteriskplus(builder, lazy, true);
    }

    _plus(builder, lazy) {
        return this._asteriskplus(builder, lazy, false);
    }

    _asteriskplus(builder, lazy, asterisk) {
        const newInit = newState();
        const base = builder();
        const newEnd = newState();
        base.addState(newInit); base.addState(newEnd);
        // The order is important to the NFA with capturing groups because when its executed it tests the transitions in order
        // Which means:
        // - If base.endingStates[0] -> base.initialState goes first, it's greedy 
        // - If base.endingStates[0] -> newEnd goes first, it's non greedy
        if (lazy) {
            if (asterisk) base.addTransition(newInit, newEnd, EPSILON_MATCHER);
            base.addTransition(newInit, base.initialState, EPSILON_MATCHER);
            base.addTransition(base.endingStates[0], newEnd, EPSILON_MATCHER);
            base.addTransition(base.endingStates[0], base.initialState, EPSILON_MATCHER);
        } else {
            base.addTransition(newInit, base.initialState, EPSILON_MATCHER);
            base.addTransition(base.endingStates[0], base.initialState, EPSILON_MATCHER);
            base.addTransition(base.endingStates[0], newEnd, EPSILON_MATCHER);
            if (asterisk) base.addTransition(newInit, newEnd, EPSILON_MATCHER);
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

    _alternativeToNFA(alternativeAst) {
         // You have to define a concrete group name before going to any subnode so that the order of the group numbers is ascending.
         const groupName = alternativeAst.isCapturingGroup() ? alternativeAst.groupName || newGroup() : null;
        const nfa = this.nfaFactory();
        const start = newState();
        nfa.addState(start);
        nfa.setInitialState(start);
        const endingStates = [];
        for (let i = 0; i < alternativeAst.alternatives.length; i++) {
            const tmp = this._regexToNFA(alternativeAst.alternatives[i]);
            endingStates.push(...tmp.endingStates);
            nfa.thompsonAppendNFA(tmp, start);
        }
        const end = newState();
        nfa.addState(end);
        endingStates.forEach(x => nfa.addTransition(x, end, EPSILON_MATCHER));
        nfa.setEndingStates([end]);
        if (groupName !== null) nfa.addGroup(start, end, groupName);
        return nfa;
    }
}
