
const DEBUG = false;
export const EPSILON = Symbol("epsilon");
class Matcher {
    matches(char) {
        return false;
    }

    get label() {
        return "undefined-matcher"
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

    get label() {
        return this.c === EPSILON ? "ε" :
        this.c === " " ? "space" :
        this.c === "." ? "\\\\." :
        this.c === "\\" ? "\\\\" : this.c;
    }
}


export class DotMatcher extends Matcher {
    matches(char) {
        return char != undefined && char != "" // These two checks are because the compute algorithm of the DPS can call matches with undefined.
        && char !== EPSILON && char !== "\n"  && char !== "\r";
    }

    get label() {
        return ".";
    }
}

/*
    A matcher for classes that match with "everything except X"
*/
export class NegatedMatcher extends Matcher {
    constructor(baseLambda, name) {
        super();
        this.baseMatcher= baseLambda;
        this.name = name;
    }

    matches(char) {
        return char != undefined && char != "" // These two checks are because the compute algorithm of the DPS can call matches with undefined.
        && char !== "\n"  && char !== "\r"
        && char !== EPSILON && this.baseMatcher(char);
    }

    get label() {
        return this.name;
    }
}

export class PositiveMatcher extends Matcher {
    constructor(baseLambda, name) {
        super();
        this.baseMatcher= baseLambda;
        this.name = name;
    }

    matches(char) {
        // The char !== EPSILON is to avoid the check bacause EPSILON is a symbol and not a string. 
        // So if baseMatcher is  (char) => char >= "0" && char <= "9" it would throw an error.
        return char !== EPSILON && this.baseMatcher(char);
    }

    get label() {
        return this.name;
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
            //console.log(`Current state ---> ${s.name}`);
            s = s.compute(string[i]);
            if (s === null)
                return false;
            //console.log(`Next state ---> ${s.name}`);
        }
        return this.endingStates.includes(s.name);
    }
}

export class NFA extends DFA {
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

export class CapturingNFTState extends NFAState {
    constructor(name) {
        super(name);
        this.startsGroups = [];
        this.endsGroups = [];
    }

    addStartGroup(group) {
        this.startsGroups.push(group);
    }

    addEndGroup(group) {
        this.endsGroups.push(group);
    }
}

class ExecResult {
    constructor(matched, string, groups) {
        this._matched = matched;
        this._groups = {};
        if (this._matched) this._groups[0] = string;
        Object.values(groups).forEach(([i, start, end]) => this._groups[i] = string.substring(start,end));
    }

    matched() {
        return this._matched;
    }

    group(i) {
        return this._groups[i];
    }

    groups() {
        return this._groups;
    }
    
}

export class CapturingNFT extends NFA{
    allowsCapturingGroups() {
        return true;
    }

    addState(name) {
        this.states[name] = new CapturingNFTState(name);
    }

    compute(string) {
        if (DEBUG) console.log("----------------------------------------------------------------------------------------");
        if (DEBUG) console.log(this);
        const match = this.recursiveCompute(string, this.states[this.initialState], {ACTIVE_STATES: {}, GROUP_MATCHES:{}, EPSILON_VISITED: []},0);
        return new ExecResult(match.success, string, match.GROUP_MATCHES);
    }

    computeGroups(currentState, memory, i) {
        for (const group of currentState.startsGroups) {
            if (DEBUG) console.log(`Entered group ${group} in state ${currentState.name}. i=${i}`);
            memory.ACTIVE_STATES[group] = i; // i = starting position of a group 
        }
        for (const group of currentState.endsGroups) {
            if (DEBUG) console.log(`Exited group ${group} in state ${currentState.name}. i=${i}`);
            memory.GROUP_MATCHES[group] = [group, memory.ACTIVE_STATES[group], i];
        }
    }

      /**
       * Tis is the same as hNFA.thompsonAppendNFA and has the same restrictions.
       * The only difference is this also assings the start/endGroups of the deleted state to its replacement
        */
       thompsonAppendNFA(otherNfa, unionState) {
        for (const s in otherNfa.states) {
            this.states[s] = otherNfa.states[s];
        } 
        delete this.states[otherNfa.initialState]; // This state is simplified
        for (const [matcher, toTransition] of otherNfa.states[otherNfa.initialState].transitions)
            this.addTransition(unionState, toTransition.name, matcher);
        for (const group of otherNfa.states[otherNfa.initialState].startsGroups)
            this.states[unionState].addStartGroup(group);
        for (const group of otherNfa.states[otherNfa.initialState].endsGroups)
            this.states[unionState].addEndGroup(group);
        // If the unionState is and end state, then the end states of the appended nfa are also end states of the fusion.
        if (this.endingStates.includes(unionState)) {
            this.endingStates.splice(this.endingStates.indexOf(unionState),1, ...otherNfa.endingStates);
        }
    }

    /**
     * 
     * @param {*} remainingString The string that it hasn't been consumed yet.
     * @param {*} currentState 
     * @param {*} memory 
     * @param {*} i The current position in the string. In theory fullString.substring(i) === remainingString. I might refactor it 
     *              in the future to remove the duplication
     * @returns 
     */
    recursiveCompute(remainingString, currentState, memory, i) {
        this.computeGroups(currentState, memory, i);
         //TODO no tengo muy claro si esto dara problemas si justo el último estado acaba un grupo
        if (remainingString.length === 0 && this.endingStates.includes(currentState.name)) {
            // The closure can't be used here because then it wouldn't compute the groups of the final state. And computing the groups of all epsilon transitions
            // could lead to invalid results
            memory.success = this.endingStates.includes(currentState.name);
            return memory;
        }

        const input = remainingString[0];
        // Since it takes into account all the closure at the same time it doesn't have the problem of epsilon loops
        for (const [matcher, toState] of currentState.transitions) {
            if (matcher.matches(input)) { // Non-epsilon
                const copyMemory = JSON.parse(JSON.stringify(memory));
                copyMemory.EPSILON_VISITED = [];
                if (DEBUG) console.log(`${currentState.name} -> ${toState.name} with input ${input}`);
                const niceTry = this.recursiveCompute(remainingString.substring(1), toState, copyMemory, i+1);
                if (niceTry.success) return niceTry;
                if (DEBUG) console.log(`Backtracked to state ${currentState.name}`);
            } else if (matcher.matches(EPSILON)) {
                    // If you are going to a state that has already been visited in an epsilon transition, you might be in a loop. So don't follow it again
                if (!memory.EPSILON_VISITED.includes(toState.name)) {
                    if (remainingString.length === 0 && this.endingStates.includes(currentState.name)) {
                        // This is a shortcut to avoid unnecesary backtracking. I need to find a way to make this code more clear.
                        // Example: 
                        //      - Starting state: q0
                        //      - Final state: q1
                        //      - States: q0, q1, q2, q3. 
                        //      - They all have a single epsilon transition to the next one: q0 ɛ-> q1, q1 ɛ-> q2 q2ɛ->q3 
                        // If I just added the remainingString check at the end of this loop without this check, then the algorithm would go to q3. It couldn't 
                        // continue and it isn't the final state, so it backtracks to q2. There are no more transitions and it isn't a final state either, so it
                        // backtrackts to q1. Which doesn't have transitions but... surprise it is the final state.
                        memory.success = true;
                        return memory;
                    }
                    const copyMemory = JSON.parse(JSON.stringify(memory));
                    copyMemory.EPSILON_VISITED.push(currentState.name);
                    // It's an epsilon transition so the string doesn't change and 'i' isn't updated
                    if (DEBUG) console.log(`${currentState.name} -> ${toState.name} with input EPSILON`);
                    const niceTry = this.recursiveCompute(remainingString, toState, copyMemory, i); 
                    if (niceTry.success) return niceTry;
                    if (DEBUG) console.log(`Backtracked to state ${currentState.name}`);
                } 
            }
        }
        if (remainingString.length === 0) {
            // The closure can't be used here because then it wouldn't compute the groups of the final state. And computing the groups of all epsilon transitions
            // could lead to invalid results
            memory.success = this.endingStates.includes(currentState.name);
            return memory;
        }

        memory.success = false;
        return memory;
    }

    addGroup(start, end, group) {
        this.states[start].addStartGroup(group);
        this.states[end].addEndGroup(group);
    }
}