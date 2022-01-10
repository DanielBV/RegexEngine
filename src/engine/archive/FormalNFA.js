

// Old classes kept mainly to show that it's possible to do a breadth first algorithm to compute the NFA. But it isn't worth using because
//it wouldn't allow capturing groups
class State{
    constructor(name) {
        this.name = name;
        this.transitions = [];
    }

    addTransition(toState, matcher) {
        this.transitions.push([matcher, toState]);
    }

    unshiftTransition(toState, matcher) {
        this.transitions.unshift([matcher, toState]);
    }

    compute(c) {
        for (const [matcher, toState] of this.transitions) {
            if (matcher.matches(c)) return toState;
        }
        return null;
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

    /**
     * Like 'addTransition' but the transition is given the highest priority
     */
    unshiftTransition(fromState, toState, matcher) {
        this.states[fromState].unshiftTransition(this.states[toState], matcher);
    }

    compute(string) {
        let s = this.states[this.initialState];
        for (let i = 0; i < string.length ; i++) {
            s = s.compute(string[i]);
            if (s === null)
                return false;
        }
        return this.endingStates.includes(s.name);
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



/**
 * A NFA that uses a breadth first algorithm to compute the states.
 * The engine doesn't use it because it doesn't allow capturing groups
 */
class FormalNFA extends DFA{
    constructor() {
        super();
    }

    allowsCapturingGroups() {
        return false;
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
    appendNFA(nfa, startingName, matcher=new CharacterMatcher(EPSILON)) {
        for (const s in nfa.states) {
            this.states[s] = nfa.states[s];
        } 
        this.addTransition(startingName, nfa.initialState, matcher);
        // If the joint is and end state, then the end states of the appended nfa are also end states of the fusion.
        if (this.endingStates.includes(startingName)) {
            this.endingStates.splice(this.endingStates.indexOf(startingName),1, ...nfa.endingStates);
        }
    }

    /** This should only be used when:
     * - There are no transitions in otherNFA that go to otherNFA's initial state
     * - The nfa (this) 'unionState' doesn't have transitions
     * The main use of this method in thompson constructions to avoid unnecessary epsilon transitions.
     * If the assertios aren't true, the union might not be correct.
     */
    thompsonAppendNFA(otherNfa, unionState) {
        for (const s in otherNfa.states) {
            this.states[s] = otherNfa.states[s];
        } 
        delete this.states[otherNfa.initialState]; // This state is simplified
        for (const [matcher, toTransition] of otherNfa.states[otherNfa.initialState].transitions)
            this.addTransition(unionState, toTransition.name, matcher);
        // If the unionState is and end state, then the end states of the appended nfa are also end states of the fusion.
        if (this.endingStates.includes(unionState)) {
            this.endingStates.splice(this.endingStates.indexOf(unionState),1, ...otherNfa.endingStates);
        }
    }

    /* 
        Computes it in a similar way to a Breadth first search, but the machine is in multiple states at the same time.
         This avoids problems like catastrophic backtracking because it doesn't require backtracking. 
        But this algorithm also doesn't allow capturing groups :(
        
        I deprecated this so it also lacks other features that could be implemented but I just didn't. Like anchors (^ & $)
    */
    compute(string) {
        let states = new Set([this.states[this.initialState]]);
        states = NFA.calculateEpsilonClosure(states);
        for (let i = 0; i < string.length ; i++) {
            const tmp = new Set();
            for (const s of states) s.compute(string[i]).forEach(x => tmp.add(x));
            states = NFA.calculateEpsilonClosure(tmp);
        }
        return Array.from(states).some(x => this.endingStates.includes(x.name));
    }
}