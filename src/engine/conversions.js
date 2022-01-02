import { AtomicPattern } from "../grammar/ast";
import { ASTERISK } from "../grammar/astBuilder";
import { CharacterMatcher, EPSILON, NFA } from "./dfa";

let i = 0;
function newState() {
    const c = `q${i}`;
    i++;
    return c;
}

function resetStateNumbers() {
    i = 0;
}


export function regexToNFA(regexAST) {
    let nfa = null;
    resetStateNumbers();
    for (const c of regexAST.subpatterns) {
        let base;
        if (c.child instanceof AtomicPattern) {
            base = atomicPatternNFA(c.child.char);
        }

        if (c.quantifier === ASTERISK) {
            const newInit = newState();
            const newEnd = newState();
            base.addState(newInit); base.addState(newEnd);
            base.addTransition(newInit, base.initialState, new CharacterMatcher(EPSILON));
            // 0 because it can only have a single ending state (with this construction)
            base.addTransition(base.endingStates[0], newEnd, new CharacterMatcher(EPSILON));
            base.addTransition(base.endingStates[0], base.initialState, new CharacterMatcher(EPSILON));
            base.addTransition(newInit, newEnd, new CharacterMatcher(EPSILON));
            base.setInitialState(newInit);
            base.setEndingStates([newEnd]);
        }
        if (nfa === null) 
            nfa = base 
        else 
            nfa.thompsonAppendNFA(base, nfa.endingStates[0]);
    }
    return nfa;
}

function atomicPatternNFA(character) {
    const nfa = new NFA();
    let a = newState();
    let b = newState();
    nfa.declareStates(a,b);
    nfa.setInitialState(a);
    nfa.setEndingStates([b]);

    nfa.addTransition(a,b, new CharacterMatcher(character));
    return nfa;
}

function NFAToDFA() {
    //TODO
}

function minimizeDFA() {
    //TODO
}