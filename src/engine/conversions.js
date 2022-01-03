import { AtomicPattern, Regex, RegexAlternative } from "../grammar/ast";
import { ASTERISK, PLUS } from "../grammar/astBuilder";
import { CharacterMatcher, EPSILON, NFA } from "./dfa";

let i = 0;
function newState() {
    const c = `q${i}`;
    i++;
    return c;
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
        for (const c of regexAST.subpatterns) {
            let baseBuilder, base, baseIsCapturing;
            if (c.child instanceof AtomicPattern) {
                baseBuilder = () => this._atomicPatternNFA(c.child.char);
            } else if (c.child instanceof RegexAlternative) {  // Groups
                baseIsCapturing = true;
                baseBuilder = (groupNumber) => this._alternativeToNFA(c.child, false, groupNumber);
            } else if (c.child instanceof Regex) { // Groups
                baseIsCapturing = true;
                baseBuilder = (groupNumber) => this.regexToNFA(c.child, false, groupNumber);
            }
    
    
            if (c.quantifier === ASTERISK) {
                base = this._asterisk(() => baseBuilder(baseIsCapturing ? newGroup() : null));
            } else if (c.quantifier === PLUS) {
                const group = baseIsCapturing ? newGroup() : null;
                base = baseBuilder(group);
                const extraPart = this._asterisk(() => baseBuilder(group));
                base.thompsonAppendNFA(extraPart, base.endingStates[0]);
            } else {
                base = baseBuilder(baseIsCapturing ? newGroup() : null);
            }
            if (nfa === null) 
                nfa = base 
            else 
                nfa.thompsonAppendNFA(base, nfa.endingStates[0]);
        }
        if (capturingGroupNumber !== null && nfa.allowsCapturingGroups()) nfa.addGroup(nfa.initialState, nfa.endingStates[0], capturingGroupNumber); 
        return nfa;
    }

    _asterisk(builder) {
        const newInit = newState();
        const base = builder();
        const newEnd = newState();
        base.addState(newInit); base.addState(newEnd);
        base.addTransition(newInit, base.initialState, new CharacterMatcher(EPSILON));
        // 0 because it can only have a single ending state (with this construction)
        base.addTransition(base.endingStates[0], newEnd, new CharacterMatcher(EPSILON));
        base.addTransition(base.endingStates[0], base.initialState, new CharacterMatcher(EPSILON));
        base.addTransition(newInit, newEnd, new CharacterMatcher(EPSILON));
        base.setInitialState(newInit);
        base.setEndingStates([newEnd]);
        return base;
    }

    
    _atomicPatternNFA(character) {
        const nfa = this.nfaFactory();
        let a = newState();
        let b = newState();
        nfa.declareStates(a,b);
        nfa.setInitialState(a);
        nfa.setEndingStates([b]);

        nfa.addTransition(a,b, new CharacterMatcher(character));
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
        endingStates.forEach(x => nfa.addTransition(x, end, new CharacterMatcher(EPSILON)));
        nfa.setEndingStates([end]);
        if (capturingGroupNumber !== null && nfa.allowsCapturingGroups()) nfa.addGroup(start, end, capturingGroupNumber);
        return nfa;
    }
}



function NFAToDFA() {
    //TODO
}

function minimizeDFA() {
    //TODO
}