
import { ConversionBuilder, regexToNFA } from '../src/engine/conversions';
import { CapturingNFT, NFA } from '../src/engine/dfa';
import parseRegex from '../src/grammar/parser';

class AlgorithmWrapper {
  getBuilder() {
    return null;
  }

  hasMatched() {
    return false;
  }
}

class NFAWrapper extends AlgorithmWrapper {
  getBuilder() {
    return new ConversionBuilder(() => new NFA());
  }

  hasMatched(computedResult) {
    return computedResult;
  }
}

class NFTWrapper extends AlgorithmWrapper {
  getBuilder() {
    return new ConversionBuilder(() => new CapturingNFT())
  }

  hasMatched(computedResult) {
    return computedResult.success;
  }
}

test('test basic regex', () => {
  const CASES = [
    ["aaa", "aaa", true],
    ["a*", "aa", true],
    ["a*", "", true],
    ["a|b", "a", true],
    ["a(a|b)a", "aba", true],
    ["a(a|b)+a", "abbababababababababababbbababaa", true],
    ["a|", "", true],
    ["a(b|)a", "aa", true],
    ["a(|b)a", "aa", true],
    ["||||||", "", true]
  ];
  const ALGORITHMS = [ new NFAWrapper(), new NFTWrapper()];
  for (const algorithm of ALGORITHMS) {
    for (const [regex, string, result] of CASES) {
      const ast = parseRegex(regex);
      const cb = algorithm.getBuilder();
      const nfa = cb.regexToNFA(ast);
      expect(algorithm.hasMatched(nfa.compute(string))).toBe(result);
    }
  }  
});