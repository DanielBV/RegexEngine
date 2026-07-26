import {CharacterMatcher} from './matchers';

const DEBUG = false;
export const EPSILON = Symbol("epsilon");

export type MatchInput = string | typeof EPSILON | undefined;
// Groups can be numbered or named capturing groups (?<name>...)
export type GroupId = string | number;

export interface Matcher {
    // i: current position in the string being matched. Only StartOfInputMatcher
    // uses it (to check i === 0 for '^'); every other matcher ignores it.
    matches(char: MatchInput, i?: number): boolean;
    readonly label: string;
}

export interface ComputeMemory {
    ACTIVE_GROUPS: Record<GroupId, number>;
    GROUP_MATCHES: Record<GroupId, [GroupId, number, number]>;
    EPSILON_VISITED: string[];
    success?: boolean;
    endingPosition?: number;
}

export interface IterativeStackFrame {
    string: string;
    i: number;
    currentState: State;
    memory: ComputeMemory;
    nextTransition?: number;
    sourceState?: string | null;
}

export interface AnimationStepResult {
    stack: IterativeStackFrame[];
    backtrack: boolean;
    memory: ComputeMemory;
    currentState: State;
    sourceState?: string | null;
    pos: number;
    backtracked?: boolean;
}

export class State {
    name: string;
    transitions: Array<[Matcher, State]>;
    startsGroups: GroupId[];
    endsGroups: GroupId[];

    constructor(name: string) {
        this.name = name;
        this.transitions = [];
        this.startsGroups = [];
        this.endsGroups = [];
    }

    addTransition(toState: State, matcher: Matcher) {
        this.transitions.push([matcher, toState]);
    }

    unshiftTransition(toState: State, matcher: Matcher) {
        this.transitions.unshift([matcher, toState]);
    }

    addStartGroup(group: GroupId) {
        this.startsGroups.push(group);
    }

    addEndGroup(group: GroupId) {
        this.endsGroups.push(group);
    }
}

/**
 * The core automaton model shared by every flavor of NFA in this project:
 * just states/initialState/endingStates plus the structural mutators needed
 * to build them. No matching/simulation algorithm lives here - that's
 * specific to each subclass (EngineNFA's backtracking + capturing-group
 * compute methods, vs the lexer's subset-construction simulation in
 * simulate.ts, which operates on a LexerNFA).
 */
export class NFA {
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
}

/**
 * A NFA that has been modified to allow capturing groups. This would make it more like a transducer than an accepter
 */
export class EngineNFA extends NFA {
    compute(string: string, i: number = 0): ComputeMemory {
        if (DEBUG) console.log("----------------------------------------------------------------------------------------" + i);
        if (DEBUG) console.log(this);
        return this.recursiveCompute(string, this.states[this.initialState as string], {ACTIVE_GROUPS: {}, GROUP_MATCHES:{}, EPSILON_VISITED: []},i);

    }

    computeGroups(currentState: State, memory: ComputeMemory, i: number) {
        for (const group of currentState.startsGroups) {
            if (DEBUG) console.log(`Entered group ${String(group)} in state ${currentState.name}. i=${i}`);
            memory.ACTIVE_GROUPS[group] = i; // i = starting position of a group
        }
        for (const group of currentState.endsGroups) {
            if (DEBUG) console.log(`Exited group ${String(group)} in state ${currentState.name}. i=${i}`);
            memory.GROUP_MATCHES[group] = [group, memory.ACTIVE_GROUPS[group], i];
        }
    }

     /**
     * Method in EngineNFA. Appends 'nfa' to
     * It assumes that the names of the states of the nfa and this are unique
     * @param {*} nfa
     * @param {*} unionState
     */
    appendNFA(nfa: EngineNFA, unionState: string, matcher: Matcher = new CharacterMatcher(EPSILON)) {
        for (const s in nfa.states) {
            this.states[s] = nfa.states[s];
        }
        this.addTransition(unionState, nfa.initialState as string, matcher);
        // If the joint is and end state, then the end states of the appended nfa are also end states of the fusion.
        if (this.endingStates && this.endingStates.includes(unionState)) {
            this.endingStates.splice(this.endingStates.indexOf(unionState),1, ...(nfa.endingStates as string[]));
        }
    }


    /**
     * This should only be used when:
     * - There are no transitions in otherNFA that go to otherNFA's initial state
     * - The nfa (this) 'unionState' doesn't have transitions
     * The main use of this method in thompson constructions to avoid unnecessary epsilon transitions.
     * If the assertios aren't true, the append might not be correct.
     */
    thompsonAppendNFA(otherNfa: EngineNFA, unionState: string) {
        const currentStates = Object.keys(this.states);
        let unionWithSameName = unionState === otherNfa.initialState;
        for (const s in otherNfa.states) {
            if (s === unionState) {
            // I leave this here to highlight it
            } else if (currentStates.includes(s)) {
                throw Error("Found duplicated name state - The only duplicated state can be the union state");
            } else
                this.states[s] = otherNfa.states[s];
        }
        if (!unionWithSameName)
            delete this.states[otherNfa.initialState as string]; // This state is simplified
        for (const [matcher, toTransition] of otherNfa.states[otherNfa.initialState as string].transitions)
            this.addTransition(unionState, toTransition.name, matcher);
        for (const group of otherNfa.states[otherNfa.initialState as string].startsGroups)
            this.states[unionState].addStartGroup(group);
        for (const group of otherNfa.states[otherNfa.initialState as string].endsGroups)
            this.states[unionState].addEndGroup(group);
        // If the unionState is and end state, then the end states of the appended nfa are also end states of the fusion.
        if (this.endingStates && this.endingStates.includes(unionState)) {
            this.endingStates.splice(this.endingStates.indexOf(unionState),1, ...(otherNfa.endingStates as string[]));
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
    recursiveCompute(remainingString: string, currentState: State, memory: ComputeMemory, i: number): ComputeMemory {
        this.computeGroups(currentState, memory, i);
        if ((this.endingStates as string[]).includes(currentState.name)) {
            // The closure can't be used here because then it wouldn't compute the groups of the final state.
            // And computing the groups of all epsilon transitions
            // could lead to invalid results
            memory.success = (this.endingStates as string[]).includes(currentState.name);
            memory.endingPosition = i;
            return memory;
        }

        const input: MatchInput = remainingString[0];
        for (const [matcher, toState] of currentState.transitions) {
            if (matcher.matches(input, i)) { // Non-epsilon
                const copyMemory: ComputeMemory = JSON.parse(JSON.stringify(memory));
                copyMemory.EPSILON_VISITED = [];
                if (DEBUG) console.log(`${currentState.name} -> ${toState.name} with input ${String(input)}`);
                const niceTry = this.recursiveCompute(remainingString.substring(1), toState, copyMemory, i+1);
                if (niceTry.success) return niceTry;
                if (DEBUG) console.log(`Backtracked to state ${currentState.name}`);
            } else if (matcher.matches(EPSILON, i)) {
                // If you are going to a state that has already been visited in an epsilon transition, you might be in a
                // loop. So don't follow it again. It's possible to create an epsilon loop with (|)*
                if (!memory.EPSILON_VISITED.includes(toState.name)) {
                    const copyMemory: ComputeMemory = JSON.parse(JSON.stringify(memory));
                    copyMemory.EPSILON_VISITED.push(currentState.name);
                    // It's an epsilon transition so the string doesn't change and 'i' isn't updated
                    if (DEBUG) console.log(`${currentState.name} -> ${toState.name} with input EPSILON`);
                    const niceTry = this.recursiveCompute(remainingString, toState, copyMemory, i);
                    if (niceTry.success) return niceTry;
                    if (DEBUG) console.log(`Backtracked to state ${currentState.name}`);
                }
            }
        }

        memory.success = (this.endingStates as string[]).includes(currentState.name);
        memory.endingPosition = i;
        return memory;
    }

    firstIterativeStep(string: string, sourcePos: number): IterativeStackFrame[] {
        const stack: IterativeStackFrame[] = [];
        stack.push({string, nextTransition:0, i: sourcePos, sourceState: null, currentState:  this.states[this.initialState as string], memory: {success: false, ACTIVE_GROUPS: {}, GROUP_MATCHES:{}, EPSILON_VISITED: []}})
        return stack;
    }

    /**
     * A variation of the iterative algorihm that produces a nicer animation:
     * - It only iterates a single step of the loop.
     * - It returns the stack after the step and multiple information about the step (technically it could be obtained from the stack but
     * its more convinient this way)
     * - Unlike the regular iterative algorithm, this one doesn't push to the stack all of its transitions. Instead it records
     * which transition a node has already tried to go through (nextTransition) and then it pushes itself (with nextTransition changed)
     * and then it pushes the first transition that matches.
     *   - The idea behind this is to force the algorithm to literally backtrack by retracing all the steps it previously walked through
     *     (to make a smoother animation)
     *
     * @param {*} remainingStack The first call to this algorithm should be with this.firstIterativeStep
     * @returns
     */
    animationStepAlgorithm(remainingStack: IterativeStackFrame[]): AnimationStepResult | null {
        const stack = [...remainingStack];
        if (stack.length === 0)
            return null;

        const current = stack.pop() as IterativeStackFrame;
        const currentState = current.currentState;
        const remainingString = current.string;
        const memory = current.memory;
        const sourceState = current.sourceState;
        const i = current.i;
        const nextTransition = current.nextTransition as number;
        this.computeGroups(currentState, memory, i);
        if ((this.endingStates as string[]).includes(currentState.name)) {
            memory.success = (this.endingStates as string[]).includes(currentState.name);
            memory.endingPosition = i;
            return {stack, backtrack: false, memory, currentState, sourceState, pos:i};
        }

        const input: MatchInput = remainingString[0];
        let backtracked = true;
        for (let c = nextTransition; c < currentState.transitions.length; c++) {
            const [matcher, toState] = currentState.transitions[c];
            if (matcher.matches(input, i)) { // Non-epsilon
                backtracked = false;
                stack.push({...current, nextTransition: c + 1}) // To backtrack if it fails
                const copyMemory: ComputeMemory = JSON.parse(JSON.stringify(memory));
                copyMemory.EPSILON_VISITED = [];
                if (DEBUG) console.log(`Added to stack ${currentState.name} -> ${toState.name} with input ${String(input)}`);
                stack.push({string: remainingString.substring(1), nextTransition:0,  i: i+1, currentState: toState, memory: copyMemory, sourceState: currentState.name});
                return {stack, memory: copyMemory, backtrack: nextTransition !== 0, currentState, pos: i};
            } else if (matcher.matches(EPSILON, i)) {
                // If you are going to a state that has already been visited in an epsilon transition, you might be in a
                // loop. So don't follow it again. It's possible to create an epsilon loop with (|)*
                if (!memory.EPSILON_VISITED.includes(toState.name)) {
                    backtracked = false;
                    stack.push({...current, nextTransition: c + 1}) // To backtrack if it fails
                    const copyMemory: ComputeMemory = JSON.parse(JSON.stringify(memory));
                    copyMemory.EPSILON_VISITED.push(currentState.name);
                    // It's an epsilon transition so the string doesn't change and 'i' isn't updated
                    if (DEBUG) console.log(`Added to stack ${currentState.name} -> ${toState.name} with input EPSILON`);
                    stack.push({string: remainingString, i: i, nextTransition:0, currentState: toState, memory: copyMemory, sourceState: currentState.name});
                    return {stack,memory: copyMemory, backtrack:  nextTransition !== 0,  currentState, pos: i};
                }
            }
        }

        return  {stack, backtrack: true, memory, currentState, backtracked, sourceState, pos: i};
    }

    iterativeCompute(string: string, sourcePos: number): ComputeMemory {
        const stack: IterativeStackFrame[] = [];
        stack.push({string, i: sourcePos, currentState:  this.states[this.initialState as string], memory: {ACTIVE_GROUPS: {}, GROUP_MATCHES:{}, EPSILON_VISITED: []}})

        while (stack.length) {
            const {currentState, string: remainingString, memory, i} = stack.pop() as IterativeStackFrame;
            this.computeGroups(currentState, memory, i);
            if ((this.endingStates as string[]).includes(currentState.name)) {
                // The closure can't be used here because then it wouldn't compute the groups of the final state.
                // And computing the groups of all epsilon transitions
                // could lead to invalid results
                memory.success = (this.endingStates as string[]).includes(currentState.name);
                memory.endingPosition = i;
                return memory;
            }

            const input: MatchInput = remainingString[0]; //TODO no recuerdo por qué era así esto.
            // Transitions are pushed in reverse order because we want the first transition to be in the last position of the stack
            for (let c = currentState.transitions.length-1; c >= 0; c--) {
                const [matcher, toState] = currentState.transitions[c];
                if (matcher.matches(input, i)) { // Non-epsilon
                    const copyMemory: ComputeMemory = JSON.parse(JSON.stringify(memory));
                    copyMemory.EPSILON_VISITED = [];
                    if (DEBUG) console.log(`Added to stack ${currentState.name} -> ${toState.name} with input ${String(input)}`);
                    stack.push({string: remainingString.substring(1), i: i+1, currentState: toState, memory: copyMemory});
                } else if (matcher.matches(EPSILON, i)) {
                    // If you are going to a state that has already been visited in an epsilon transition, you might be in a
                    // loop. So don't follow it again. It's possible to create an epsilon loop with (|)*
                    if (!memory.EPSILON_VISITED.includes(toState.name)) {
                        const copyMemory: ComputeMemory = JSON.parse(JSON.stringify(memory));
                        copyMemory.EPSILON_VISITED.push(currentState.name);
                        // It's an epsilon transition so the string doesn't change and 'i' isn't updated
                        if (DEBUG) console.log(`Added to stack ${currentState.name} -> ${toState.name} with input EPSILON`);
                        stack.push({string: remainingString, i: i, currentState: toState, memory: copyMemory});
                    }
                }
            }
        }
        const memory: ComputeMemory = {} as ComputeMemory;
        memory.success = false;
        memory.endingPosition = sourcePos+string.length;
        return memory;
    }

    addGroup(start: string, end: string, group: GroupId) {
        this.states[start].addStartGroup(group);
        this.states[end].addEndGroup(group);
    }

    /**
     *
     * @param {*} original
     * @param {*} stateBuilder Function that Generates names of new states. Multiple class to this method must return different unique states
     */
    static clone(original: EngineNFA, stateBuilder: () => string): EngineNFA {
        const cloned = new EngineNFA();
        const translation: Record<string, string> = {};
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

        cloned.setInitialState(translation[original.initialState as string]);
        cloned.setEndingStates((original.endingStates as string[]).map(x => translation[x]));
        return cloned;
    }
}
