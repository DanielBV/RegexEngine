import { AtomicPattern, Regex, RegexAlternative } from "../grammar/ast";
import { ASTERISK, PLUS } from "../grammar/astBuilder";
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

export function regexToNFA(regexAST, resetNumbers=true) {
    if (regexAST instanceof RegexAlternative) 
        return alternativeToNFA(regexAST,resetNumbers);
    else 
        return singleRegexToNFA(regexAST, resetNumbers);
}

export function singleRegexToNFA(regexAST, resetNumbers=true) {
    let nfa = null;
    if (resetNumbers) resetStateNumbers();
    for (const c of regexAST.subpatterns) {
        let baseBuilder, base;
        if (c.child instanceof AtomicPattern) {
            baseBuilder = () => atomicPatternNFA(c.child.char);
        } else if (c.child instanceof RegexAlternative) {  // Groups
            baseBuilder = () => alternativeToNFA(c.child, false);
        } else if (c.child instanceof Regex) // Groups
            baseBuilder = () => regexToNFA(c.child, false);


        if (c.quantifier === ASTERISK) {
            base = asterisk(baseBuilder);
        } else if (c.quantifier === PLUS) {
            base = baseBuilder();
            const extraPart = asterisk(baseBuilder);
            base.thompsonAppendNFA(extraPart, base.endingStates[0]);
        } else {
            base = baseBuilder();
        }
        if (nfa === null) 
            nfa = base 
        else 
            nfa.thompsonAppendNFA(base, nfa.endingStates[0]);
    }
    return nfa;
}

function asterisk(builder) {
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

function alternativeToNFA(alternativeAst, resetNumbers=true) {
    if (resetNumbers) resetStateNumbers();
    const nfa = new NFA();
    const start = newState();
    nfa.addState(start);
    nfa.setInitialState(start);
    nfa.setEndingStates([]);
    const endingStates = [];
    for (let i = 0; i < alternativeAst.alternatives.length; i++) {
        const tmp = regexToNFA(alternativeAst.alternatives[i],false);
        endingStates.push(...tmp.endingStates);
        nfa.thompsonAppendNFA(tmp, start);
    }
    const end = newState();
    nfa.addState(end);
    endingStates.forEach(x => nfa.addTransition(x, end, new CharacterMatcher(EPSILON)));
    nfa.setEndingStates([end]);
    return nfa;
}


function NFAToDFA() {
    //TODO
}

function minimizeDFA() {
    //TODO
}