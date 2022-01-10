
const DEBUG = false;
export const EPSILON = Symbol("epsilon");

export class State {
    constructor(name) {
        this.name = name;
        this.transitions = [];
        this.startsGroups = [];
        this.endsGroups = [];
    }

    addTransition(toState, matcher) {
        this.transitions.push([matcher, toState]);
    }

    unshiftTransition(toState, matcher) {
        this.transitions.unshift([matcher, toState]);
    }

    addStartGroup(group) {
        this.startsGroups.push(group);
    }

    addEndGroup(group) {
        this.endsGroups.push(group);
    }
}

export class ExecResult {
    constructor(matched, string, groups,endingPosition) {
        this._matched = matched;
        this._groups = {};
        this.endingPosition = endingPosition;
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

export class CapturingNFT {
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
  
    compute(string, i=0) {
        if (DEBUG) console.log("----------------------------------------------------------------------------------------" + i);
        if (DEBUG) console.log(this);
        return this.recursiveCompute(string, this.states[this.initialState], {ACTIVE_STATES: {}, GROUP_MATCHES:{}, EPSILON_VISITED: []},i);

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

    
    /** 
     * This should only be used when:
     * - There are no transitions in otherNFA that go to otherNFA's initial state
     * - The nfa (this) 'unionState' doesn't have transitions
     * The main use of this method in thompson constructions to avoid unnecessary epsilon transitions.
     * If the assertios aren't true, the append might not be correct.
     */
    thompsonAppendNFA(otherNfa, unionState) {
        const currentStates = Object.keys(this.states);
        let unionWithSameName = unionState === otherNfa.initialState;
        for (const s in otherNfa.states) {
            if (s === unionState) {
            // I leave this here to highlight it
            } else if (currentStates.includes(s.name)) {
                throw Error("Found duplicated name state - The only duplicated state can be the union state");
            } else 
                this.states[s] = otherNfa.states[s];
        } 
        if (!unionWithSameName)
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
     * @param {*} i The current position in the source string. This means that if it isn't the algorithms first attempt, then
     *  remainingString === fullString.substring(i) !== sourceString.substring(i)
     *       - Source string: The one the user wrote
     *       - Full string: The part of the source string that is trying to be matched now.
     *       - remainingString: The part of the full string that is still being computed
     * @returns 
     */
    recursiveCompute(remainingString, currentState, memory, i) {
        this.computeGroups(currentState, memory, i);
        if (this.endingStates.includes(currentState.name)) {
            // The closure can't be used here because then it wouldn't compute the groups of the final state. 
            // And computing the groups of all epsilon transitions
            // could lead to invalid results
            memory.success = this.endingStates.includes(currentState.name);
            memory.endingPosition = i;
            return memory;
        }

        const input = remainingString[0];
        for (const [matcher, toState] of currentState.transitions) {
            if (matcher.matches(input, i)) { // Non-epsilon
                const copyMemory = JSON.parse(JSON.stringify(memory));
                copyMemory.EPSILON_VISITED = [];
                if (DEBUG) console.log(`${currentState.name} -> ${toState.name} with input ${input}`);
                const niceTry = this.recursiveCompute(remainingString.substring(1), toState, copyMemory, i+1);
                if (niceTry.success) return niceTry;
                if (DEBUG) console.log(`Backtracked to state ${currentState.name}`);
            } else if (matcher.matches(EPSILON, i)) {
                // If you are going to a state that has already been visited in an epsilon transition, you might be in a 
                // loop. So don't follow it again. It's possible to create an epsilon loop with (|)*
                if (!memory.EPSILON_VISITED.includes(toState.name)) {
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
       
        memory.success = this.endingStates.includes(currentState.name);
        memory.endingPosition = i;
        return memory;
    }

    addGroup(start, end, group) {
        this.states[start].addStartGroup(group);
        this.states[end].addEndGroup(group);
    }

    /**
     * 
     * @param {*} nfa 
     * @param {*} stateBuilder Function that Generates names of new states. Multiple class to this method must return different unique states
     */
    static clone(original, stateBuilder) {
        const cloned = new CapturingNFT();
        const translation = {};
        for (const state in original.states) {
            const ns = stateBuilder();
            translation[state] = ns;
            cloned.addState(ns);
        }
        for (const state in original.states) {
            for (const [matcher, toTransition] of original.states[state].transitions)
                cloned.addTransition(translation[state], translation[toTransition.name], matcher);
            for (const group of original.states[state].startsGroups)
                cloned.states[translation[state]].addStartGroup(group);
            for (const group of original.states[state].endsGroups)
                cloned.states[translation[state]].addEndGroup(group);
        }

        cloned.setInitialState(translation[original.initialState]);
        cloned.setEndingStates(original.endingStates.map(x => translation[x]));
        return cloned;
    }
}