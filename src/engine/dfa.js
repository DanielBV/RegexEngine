export const EPSILON = Symbol("epsilon");
class Matcher {
    matches(char) {
        return false;
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
}

class State{
    constructor(name) {
        this.name = name;
        this.transitions = [];
    }

    addTransition(toState, matcher) {
        this.transitions.push([matcher, toState]);
    }

    compute(c) {
        for (const [matcher, toState] of this.transitions) {
            if (matcher.matches(c)) return toState;
        }
        return null;
    }

}

export class NFAState extends State{
    compute(c) {
        const matches = [];
        for (const [matcher, toState] of this.transitions) {
            if (matcher.matches(c)) matches.push(toState);
        }
        return matches;
    }
}

class DFA {
    constructor() {
        this.states = {};
        this.initialState = null;
        this.endingStates = null;
    }

    setInitialState(state) {
        this.initialState = state;
    }

    setEndingStates(states) {
        this.endingStates = states;
    }

    addState(name) {
        this.states[name] = new State(name);
    }

    declareStates(...names) {
        for (const n of names) this.addState(n);
    }

    addTransition(fromState, toState, matcher) {
        this.states[fromState].addTransition(this.states[toState], matcher);
    }

    compute(string) {
        let s = this.states[this.initialState];
        for (let i = 0; i < string.length ; i++) {
            console.log(`Current state ---> ${s.name}`);
            s = s.compute(string[i]);
            if (s === null)
                return false;
            console.log(`Next state ---> ${s.name}`);
        }
        return this.endingStates.includes(s.name);
    }
}

export class NFA extends DFA {
    constructor() {
        super();
    }

    addState(name) {
        this.states[name] = new NFAState(name);
    }

    static calculateEpsilonClosure(states) {
        const closure = new Set(states);
        let closureSizeInPreviousStep = null;
        while (closureSizeInPreviousStep !== closure.length) {
            closureSizeInPreviousStep = closure.length;
            for (const s of closure) {
                s.compute(EPSILON).forEach(state => closure.add(state));
            }
        }
        return closure;
    }

    getStateByName(name) {
        return this.states[name];
    }

    /**
     * It assumes that the names of the states of the nfa and this are unique
     * @param {*} nfa 
     * @param {*} starting 
     */
    appendNFA(nfa, startingName, matcher) {
        for (const s in nfa.states) {
            this.states[s] = nfa.states[s];
        } 
        this.addTransition(startingName, nfa.initialState, matcher);
        // If the joint is and end state, then the end states of the appended nfa are also end states of the fusion.
        if (this.endingStates.includes(startingName)) {
            this.endingStates.splice(this.endingStates.indexOf(startingName),1, ...nfa.endingStates);
        }
    }

    compute(string) {
        let states = new Set([this.states[this.initialState]]);
        states = NFA.calculateEpsilonClosure(states);
        for (let i = 0; i < string.length ; i++) {
            console.log(`States in ${i}--> ${Array.from(states).map(x => x.name).join(", ")}`);
            const tmp = new Set();
            for (const s of states) s.compute(string[i]).forEach(x => tmp.add(x));
            states = NFA.calculateEpsilonClosure(tmp);
        }
        return Array.from(states).some(x => this.endingStates.includes(x.name));
    }

}


const cf = (c) => new CharacterMatcher(c);
/*const a = new DFA();
a.declareStates("q0", "q1", "q2");
a.addTransition("q0", "q1", cf("a"));
a.addTransition("q1", "q2", cf("b"));
a.addTransition("q1", "q1", cf("a"));
a.setInitialState("q0");
a.setEndingStates(["q2"]);
console.log(a.compute("aaaaaaaab"));*/

const b = new NFA();
