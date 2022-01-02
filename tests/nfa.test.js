import { CharacterMatcher, EPSILON, NFA } from "../src/engine/dfa";

describe('nfa - append', () => {
    test('basic works', () => {
        const nfa1 = new NFA();
        nfa1.declareStates("q0", "q1");
        nfa1.setInitialState("q0");
        nfa1.setEndingStates(["q1"]);
        nfa1.addTransition("q0", "q1", new CharacterMatcher("a"));
      
        const nfa2 = new NFA();
        nfa2.declareStates("q2", "q3");
        nfa2.setInitialState("q2");
        nfa2.setEndingStates(["q3"]);
        nfa2.addTransition("q2", "q3", new CharacterMatcher("b"));
      
        nfa1.appendNFA(nfa2, "q1", new CharacterMatcher(EPSILON));
        expect(nfa1.compute("ab")).toBe(true);
        // Tests that the original nfa end state is no longer an end state
        expect(nfa1.compute("a")).toBe(false);
      });

});
