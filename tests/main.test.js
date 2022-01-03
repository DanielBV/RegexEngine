
import { ConversionBuilder, regexToNFA } from '../src/engine/conversions';
import { CapturingNFT, NFA } from '../src/engine/dfa';
import parseRegex from '../src/grammar/parser';
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
  const ALGORITHMS = [() => new NFA(), 
    () => new CapturingNFT()]
  for (const algorithm of ALGORITHMS) {
    for (const [regex, string, result] of CASES) {
      const ast = parseRegex(regex);
      const cb = new ConversionBuilder(algorithm);
      const nfa = cb.regexToNFA(ast);
      expect(nfa.compute(string)).toBe(result);
    }
  }  
});