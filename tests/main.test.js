
import { regexToNFA } from '../src/engine/conversions';
import parseRegex from '../src/grammar/parser';
test('test basic regex', () => {
  const CASES = [
    ["aaa", "aaa", true],
    ["a*", "aa", true],
    ["a*", "", true]
  ];
  for (const [regex, string, result] of CASES) {
    const ast = parseRegex(regex);
    const nfa = regexToNFA(ast);
    expect(nfa.compute(string)).toBe(result);
  }
});