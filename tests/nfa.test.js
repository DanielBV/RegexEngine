import { EngineNFA, EPSILON } from "../src/engine/nfa";
import { CharacterMatcher } from "../src/engine/matchers";


describe('nfa - append', () => {
    test('basic works', () => {
        const nfa1 = new EngineNFA();
        nfa1.declareStates("q0", "q1");
        nfa1.setInitialState("q0");
        nfa1.setEndingStates(["q1"]);
        nfa1.addTransition("q0", "q1", new CharacterMatcher("a"));
      
        const nfa2 = new EngineNFA();
        nfa2.declareStates("q2", "q3");
        nfa2.setInitialState("q2");
        nfa2.setEndingStates(["q3"]);
        nfa2.addTransition("q2", "q3", new CharacterMatcher("b"));
      
        nfa1.appendNFA(nfa2, "q1", new CharacterMatcher(EPSILON));
        expect(nfa1.compute("ab").success).toBe(true);
        // Tests that the original nfa end state is no longer an end state
        expect(nfa1.compute("a").success).toBe(false);
      });

    test('thompson append with duplicated union name', () => {
      const nfa1 = new EngineNFA();
      nfa1.declareStates("q0", "q1");
      nfa1.setInitialState("q0");
      nfa1.setEndingStates(["q1"]);
      nfa1.addTransition("q0", "q1", new CharacterMatcher("a"));

      const nfa2 = new EngineNFA();
      nfa2.declareStates("q1", "q2");
      nfa2.setInitialState("q1");
      nfa2.setEndingStates(["q2"]);
      nfa2.addTransition("q1", "q2", new CharacterMatcher("b"));
      nfa1.thompsonAppendNFA(nfa2, "q1");
      expect(nfa1.compute("ab").success).toBe(true);
      // Tests that the original nfa end state is no longer an end state
      expect(nfa1.compute("a").success).toBe(false);
    });
});
