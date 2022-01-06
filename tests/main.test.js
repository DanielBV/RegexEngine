
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
    return computedResult.matched();
  }
}

function testCase(algorithm, regex, string, result) {
  it (`Test regex '${regex}' with string '${string}' and algorithm ${algorithm.constructor.name}`, () => {
    const ast = parseRegex(regex);
    const cb = algorithm.getBuilder();
    const nfa = cb.regexToNFA(ast);
    expect(algorithm.hasMatched(nfa.compute(string))).toBe(result);
  });
}

const ALGORITHMS = [ new NFAWrapper(), new NFTWrapper()];

describe('test basic regex', () => {
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
  for (const algorithm of ALGORITHMS) {
    for (const [regex, string, result] of CASES) {
      testCase(algorithm, regex, string, result);
    }
  }  
});

describe('Regex escaped characters', () => {
  const CASES = [
    ["\\\\+", "\\\\\\", true],
    ["\\++", "++++", true],
    ["\\*", "\*", true],
    ["\\*", "", false],
    ["\\(\\)", "()", true],
    ["\\.", ".", true],
    ["\\.", "a", false],
  ];
  for (const algorithm of ALGORITHMS) {
    for (const [regex, string, result] of CASES) {
      testCase(algorithm, regex, string, result);
    }
  }  
});


describe('Dot Matcher', () => {
  const CASES = [
    [".+", "abc@^º#&·1", true],
    [".+", "\n", false],
    [".+", "\r", false],
  ];
  for (const algorithm of ALGORITHMS) {
    for (const [regex, string, result] of CASES) {
      testCase(algorithm, regex, string, result);
    }
  }  
});

describe('Test capture groups', () => {
  const CASES = [
    ["(aa)(bb)", "aabb", [{group:0, txt: "aabb"},{group: 1, txt: "aa"}, {group:2, txt: "bb"}]],
    ["(.+)(.+)", "aaaaab", [{group:0, txt: "aaaaab"},{group: 1, txt: "aaaaa"}, {group:2, txt: "b"}]],
    ["(a|b)+(a|b)", "aaaab",  [{group:0, txt: "aaaab"},{group: 1, txt: "a"}, {group:2, txt: "b"}]]
  ]

    for (const [regex, string, result] of CASES) {
      const ast = parseRegex(regex);
      const cb = new NFTWrapper().getBuilder();
      const nfa = cb.regexToNFA(ast);
      const match = nfa.compute(string);
      for (const group of result) {
        expect(match.group(group.group)).toBe(group.txt);
      }
    }
});