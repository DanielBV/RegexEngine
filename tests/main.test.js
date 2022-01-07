
import { ConversionBuilder } from '../src/engine/conversions';
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
    ["||||||", "", true],
    ["a?", "", true],
    ["ab?a", "aa", true],
    ["ab?a", "aba", true],
    ["-", "-", true],
    ["[-]", "-", true],
    ["[--]", "-", true],
    ["[---]", "-", true],
    ["]", "]", true],
    ["[[]", "[", true],
    ["[]]", "]", false],
    ["[()]+", ")(", true],
    ["[\\\\]", "\\", true],
    ["[.?+*]+", "?+*.", true],
    ["[\\(]+", "(", true],
    ["[\\(]+", "\\", false],
    ["[0-9]+", "0123456789", true],
    ["[0-9]+", "/", false],
    ["[0-9]+", ":", false],
    ["[0-9a-zA-Zñ]+", "ñazAZ", true],
    ["[9-0]+", "0", false],
    ["[]+", "0", false],
    ["a b", "a b", true],
    ["a b", "ab", false],
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
    ["\\\\d", "\\d", true],
    ["[\\]]", "]", true],
    ["[\\[]", "[", true],
    ["\\[", "[", true],
    ["\\]", "]", true],
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

describe('Regex character classes', () => {
  const CASES = [
    ["\\d+", "0123456789", true],
    ["\\d+", "/", false],
    ["\\d+", ":", false],
    ["\\D+", "a@^ª'¡€", true],
    ["\\D+", "a\n", false],
    ["\\D+", "1", false],
    ["\\D+", "9", false],
    ["\\w+", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_", true],
    ["\\w+", ":", false],
    ["\\w+", "@", false],
    ["\\w+", ".", false],
    ["\\w+", "{", false],
    ["\\w+", "[", false],
    ["\\w+", "/", false],
    ["\\W+", ":", true],
    ["\\W+", "@", true],
    ["\\W+", ".", true],
    ["\\W+", "{", true],
    ["\\W+", "[", true],
    ["\\W+", "/", true],
    ["\\W+", ":\n", false],
    ["\\W+", "a", false],
    ["\\W+", "z", false],
    ["\\W+", "A", false],
    ["\\W+", "Z", false],
    ["\\W+", "0", false],
    ["\\W+", "9", false],
    ["\\W+", "_", false],
  ];
  const whitespaces = [" ", "\f", "\n", "\r", "\t", "\v", "\u00a0", "\u1680", "\u2028","\u2029","\u202f", "\u205f", 
    "\u3000", "\ufeff", "\u2000", "\u2001", "\u2002","\u2003", "\u2004", "\u2005", "\u2006", "\u2007", "\u2008", 
    "\u2009"];
  const WHITESPACE_CASES = [];
  whitespaces.forEach(x => WHITESPACE_CASES.push(["\\s", x, true]));
  whitespaces.forEach(x => WHITESPACE_CASES.push(["\\S", x, false]));
  CASES.push(...WHITESPACE_CASES);

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