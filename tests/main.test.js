
import { ConversionBuilder } from '../src/engine/conversions';
import { CapturingNFT } from '../src/engine/dfa';
import { NFARegex } from '../src/engine/regex';
import parseRegex from '../src/grammar/parser';

class AlgorithmWrapper {
  getBuilder() {
    return null;
  }

  hasMatched() {
    return false;
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

function testCase(algorithm, regex, string, result) {
  it (`Test regex '${regex}' with string '${string}' and algorithm ${algorithm.constructor.name}`, () => {
    const ast = parseRegex(regex);
    const cb = algorithm.getBuilder();
    const nfa = cb.regexToNFA(ast);
    expect(algorithm.hasMatched(nfa.compute(string))).toBe(result);
  });
}

const ALGORITHMS = [new NFTWrapper()];

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
    ["<", "<", true],
    [">", ">", true],
    ["[<]", "<", true],
    ["[>]", ">", true],
    [":", ":", true],
    ["[:]", ":", true],
    ["[\\^]", "^", true],
    ["[$]", "$", true],
    ["[a^]", "^", true],
    ["[^a]+", "a", false],
    ["[^a]+", "b", true],
    ["[^a-z]+", "a", false],
    ["[^a-z]+", "z", false],
    ["[^a-z]+", "`{", true],
    ["[^a-zA-Z]+", "W", false],
    ["[^a-zA-Zñ]+", "ñ", false],
    ["^a$", "a", true],
    ["^a", "ab", true],
    ["a$", "ba", false],
    ["^a$", "ab", false],
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
    ["\\>", ">", true],
    ["\\<", "<", true],
    ["\\:", ":", true],
    ["\\^", "^", true],
    ["\\$", "$", true],
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
    ["^\\D+$", "a\n", false],
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
    ["^\\W+$", ":\n", false],
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
    ["(a|b)+(a|b)", "aaaab",  [{group:0, txt: "aaaab"},{group: 1, txt: "a"}, {group:2, txt: "b"}]],
    //Lazy capture groups:
    ["(a*?)(a*)", "aaaa", [{group:0, txt: "aaaa"},{group: 1, txt: ""}, {group:2, txt: "aaaa"}]],
    ["(.+?)(.+)", "abbb",  [{group:0, txt: "abbb"},{group: 1, txt: "a"}, {group:2, txt: "bbb"}]],
    ["(.+?)(.+?)(.+)", "abcc",  [{group:0, txt: "abcc"},{group: 1, txt: "a"}, {group:2, txt: "b"}, {group:3, txt: "cc"}]],
    ["a(b??)(b+)", "abb",  [{group:0, txt: "abb"},{group: 1, txt: ""}, {group:2, txt: "bb"}]],
    //TODO When the algorithm is no longer a "match the whole string" instead of a ^regex$, then (a*?)(a*?) should have no matches
    //Named groups:
    ["(?<name>a+)", "aaaa", [{group:0, txt: "aaaa"},{group: "name", txt: "aaaa"}]],
    ["(?<name>a+)(?<name>b+)", "aabb", [{group:0, txt: "aabb"},{group: "name", txt: "bb"}]],
    //Non capturing group
    ["((?:ab)+)", "abab", [{group:0, txt: "abab"},{group: 1, txt: "abab"}]],
    ["((a))+", "aa", [{group:0, txt: "aa"},{group: 1, txt: "a"}, {group: 2, txt: "a"}]],
  ]

    for (const [regex, string, result] of CASES) {
      it (`- regex: '${regex}', string: '${string}', expected: ${JSON.stringify(result)}`, () => {
        const re = new NFARegex(regex);
        const match = re.findFirstMatch(string);
        expect(Object.keys(match.groups()).length).toBe(result.length)
        for (const group of result) {
          expect(match.group(group.group)).toBe(group.txt);
        }
      });
    }
});

describe('Test regex class', () => {

  it('findFirstMatch', () => {
    const CASES = [
      ["^a$", "ba", null],
      ["a", "ba", {groups: {0: "a"}, start: 1, end: 2}],
    ];
    for (const [regex, string, result] of CASES) {
      const re = new NFARegex(regex);
      const match = re.findFirstMatch(string);
      if (result === null) expect(match).toBe(result);
      else {
        expect(match.start).toBe(result.start);
        expect(match.end).toBe(result.end);
        expect(Object.keys(match.groups()).length).toBe(Object.keys(result.groups).length);
        for (const key in result.groups) 
          expect(match.group(key)).toBe(result.groups[key]);
      }
    }
  });

  describe('findAllMatches', () => {
    const CASES = [
      ["^a$", "ba", []],
      ["a", "a a a", [{groups: {0: "a"}, start: 0, end: 1}, {groups: {0: "a"}, start: 2, end: 3}, {groups: {0: "a"}, start: 4, end: 5}]],
      ["(\\w+)\\s+(\\w+)", "the potato is green", [{groups: {0: "the potato", 1: "the", 2: "potato"}, start: 0, end: 10}, 
        {groups: {0: "is green", 1: "is", 2: "green"}, start: 11, end: 19}]],
      ["\\w+\\s+", "the potato is green", [{groups: {0: "the "}, start: 0, end: 4}, 
        {groups: {0: "potato "}, start: 4, end: 11}, {groups: {0: "is "}, start: 11, end: 14}]],
      ["(.*?)", "foo", [{groups: {0: "", 1: ""}, start: 0, end: 0}]],
    ];
    for (const [regex, string, result] of CASES) {
      it (`- regex: '${regex}', string: '${string}', expected: ${JSON.stringify(result)}`, () => {
        const re = new NFARegex(regex);
        const matches = re.findAllMatches(string);
        expect(matches.length).toBe(result.length);
        for (let i = 0; i < matches.length; i++) {
          expect(matches[i].start).toBe(result[i].start);
          expect(matches[i].end).toBe(result[i].end);
          expect(Object.keys(matches[i].groups()).length).toBe(Object.keys(result[i].groups).length);
          for (const key in result[i].groups) 
            expect(matches[i].group(key)).toBe(result[i].groups[key]);
        }
      });
    }
  });
  
});