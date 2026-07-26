import { CharacterMatcher } from "../matchers";
import { EPSILON, Matcher, MatchInput } from "../nfa";

// Old classes kept mainly to show that it's possible to do a breadth first algorithm to compute the NFA. But it isn't worth using because
//it wouldn't allow capturing groups
class State{
    name: string;
    transitions: Array<[Matcher, State]>;

    constructor(name: string) {
        this.name = name;
        this.transitions = [];
    }

    addTransition(toState: State, matcher: Matcher) {
        this.transitions.push([matcher, toState]);
    }

    unshiftTransition(toState: State, matcher: Matcher) {
        this.transitions.unshift([matcher, toState]);
    }

    compute(c: MatchInput): State | State[] | null {
        for (const [matcher, toState] of this.transitions) {
            if (matcher.matches(c)) return toState;
        }
        return null;
    }

}

class DFA {
    states: Record<string, State>;
    initialState: string | null;
    endingStates: string[] | null;

    constructor() {
        this.states = {};
        this.initialState = null;
        this.endingStates = null;
    }

    setInitialState(state: string) {
        this.initialState = state;
    }

    setEndingStates(states: string[]) {
        this.endingStates = states;
    }

    addState(name: string) {
        this.states[name] = new State(name);
    }

    declareStates(...names: string[]) {
        for (const n of names) this.addState(n);
    }

    addTransition(fromState: string, toState: string, matcher: Matcher) {
        this.states[fromState].addTransition(this.states[toState], matcher);
    }

    /**
     * Like 'addTransition' but the transition is given the highest priority
     */
    unshiftTransition(fromState: string, toState: string, matcher: Matcher) {
        this.states[fromState].unshiftTransition(this.states[toState], matcher);
    }

    compute(string: string): boolean {
        let s = this.states[this.initialState as string] as State | null;
        for (let i = 0; i < string.length ; i++) {
            s = (s as State).compute(string[i]) as State | null;
            if (s === null)
                return false;
        }
        return (this.endingStates as string[]).includes((s as State).name);
    }
}

export class NFAState extends State{
    compute(c: MatchInput): State[] {
        const matches: State[] = [];
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

    allowsCapturingGroups(): boolean {
        return false;
    }

    addState(name: string) {
        this.states[name] = new NFAState(name);
    }

    static calculateEpsilonClosure(states: Set<NFAState>): Set<NFAState> {
        const closure = new Set(states);
        let closureSizeInPreviousStep: number | null = null;
        while (closureSizeInPreviousStep !== closure.size) {
            closureSizeInPreviousStep = closure.size;
            for (const s of closure) {
                (s.compute(EPSILON) as NFAState[]).forEach(state => closure.add(state));
            }
        }
        return closure;
    }

    getStateByName(name: string): State {
        return this.states[name];
    }

    /**
     * It assumes that the names of the states of the nfa and this are unique
     * @param {*} nfa
     * @param {*} starting
     */
    appendNFA(nfa: FormalNFA, startingName: string, matcher: Matcher = new CharacterMatcher(EPSILON)) {
        for (const s in nfa.states) {
            this.states[s] = nfa.states[s];
        }
        this.addTransition(startingName, nfa.initialState as string, matcher);
        // If the joint is and end state, then the end states of the appended nfa are also end states of the fusion.
        if ((this.endingStates as string[]).includes(startingName)) {
            (this.endingStates as string[]).splice((this.endingStates as string[]).indexOf(startingName),1, ...(nfa.endingStates as string[]));
        }
    }

    /** This should only be used when:
     * - There are no transitions in otherNFA that go to otherNFA's initial state
     * - The nfa (this) 'unionState' doesn't have transitions
     * The main use of this method in thompson constructions to avoid unnecessary epsilon transitions.
     * If the assertios aren't true, the union might not be correct.
     */
    thompsonAppendNFA(otherNfa: FormalNFA, unionState: string) {
        for (const s in otherNfa.states) {
            this.states[s] = otherNfa.states[s];
        }
        delete this.states[otherNfa.initialState as string]; // This state is simplified
        for (const [matcher, toTransition] of otherNfa.states[otherNfa.initialState as string].transitions)
            this.addTransition(unionState, toTransition.name, matcher);
        // If the unionState is and end state, then the end states of the appended nfa are also end states of the fusion.
        if ((this.endingStates as string[]).includes(unionState)) {
            (this.endingStates as string[]).splice((this.endingStates as string[]).indexOf(unionState),1, ...(otherNfa.endingStates as string[]));
        }
    }

    /*
        Computes it in a similar way to a Breadth first search, but the machine is in multiple states at the same time.
         This avoids problems like catastrophic backtracking because it doesn't require backtracking.
        But this algorithm also doesn't allow capturing groups :(

        I deprecated this so it also lacks other features that could be implemented but I just didn't. Like anchors (^ & $)
    */
    compute(string: string): boolean {
        let states = new Set<NFAState>([this.states[this.initialState as string] as NFAState]);
        states = FormalNFA.calculateEpsilonClosure(states);
        for (let i = 0; i < string.length ; i++) {
            const tmp = new Set<NFAState>();
            for (const s of states) (s.compute(string[i]) as NFAState[]).forEach(x => tmp.add(x));
            states = FormalNFA.calculateEpsilonClosure(tmp);
        }
        return Array.from(states).some(x => (this.endingStates as string[]).includes(x.name));
    }
}
