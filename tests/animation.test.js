
import { newLoopGeneration } from "../src/page/loop";
import { NFARegex } from "../src/engine/regex";


describe('animation', () => {
    describe('basic works', () => {
        const CASES = [
            ["a", "a", [
                {isBacktracking: false, state:"q0", success: false, groups: {}},
                {isBacktracking: false, state:"q1", success: true, groups: {}}]],
            ["aaab|aac", "aac", [
                {isBacktracking: false, state:"q0",  success: false, groups: {}},
                {isBacktracking: false, state:"q2",  success: false, groups: {}},
                {isBacktracking: true, state:"q3",  success: false, groups: {}},
                {isBacktracking: true, state:"q2",  success: false, groups: {}},
                {isBacktracking: true, state:"q0",  success: false, groups: {}},
                {isBacktracking: false, state:"q7",  success: false, groups: {}},
                {isBacktracking: false, state:"q8",  success: false, groups: {}},
                {isBacktracking: false, state:"q9",  success: false, groups: {}},
                {isBacktracking: false, state:"q10", success: true, groups: {}},
            ]],
            ["aaaaa", "aaab", [
                {isBacktracking: false, state:"q0",  success: false, groups: {}},
                {isBacktracking: false, state:"q1",  success: false, groups: {}},
                {isBacktracking: false, state:"q2",  success: false, groups: {}},
                {isBacktracking: true, state:"q3",  success: false, groups: {}},
                {isBacktracking: true, state:"q2",  success: false, groups: {}},   
                {isBacktracking: true, state:"q1",  success: false, groups: {}},   
                {isBacktracking: true, state:"q0",  success: false, groups: {}},   
            ]],
            ["(aaaa)bc|aaaac", "aaaac",[
                {"state": "q0", "isBacktracking": false, "success": false,
                  "groups": {
                    "1": ""
                  }},
                  {"state": "q2",  "isBacktracking": false, "success": false,
                  "groups": {
                    "1": "a"
                  },
                
                },
                {"state": "q3", "isBacktracking": false,  "success": false,
                  "groups": {
                    "1": "aa"
                  },
                },
                {"state": "q4", "isBacktracking": false,  "success": false,
                  "groups": {
                    "1": "aaa"
                  },
                },
                {"state": "q5","isBacktracking": true,  "success": false,
                  "groups": {
                    "1": "aaaa"
                  },
                },
                {"state": "q4",  "isBacktracking": true,  "success": false,
                  "groups": {
                    "1": "aaa"
                  },
                },
                {"state": "q3", "isBacktracking": true,  "success": false,
                  "groups": {
                    "1": "aa"
                  },
                },
                {"state": "q2","isBacktracking": true,  "success": false,
                  "groups": {
                    "1": "a"
                  },
                },
                {"state": "q0", "isBacktracking": true,  "success": false,
                  "groups": {
                    "1": ""
                  },
                },
                {"state": "q9", "isBacktracking": false,  "success": false,
                  "groups": {
                    "1": "a"
                  },
                },
                {"state": "q10", "isBacktracking": false,  "success": false,
                  "groups": {
                    "1": "aa"
                  },
                },
                {"state": "q11", "isBacktracking": false,  "success": false,
                  "groups": {
                    "1": "aaa"
                  },
                },
                {"state": "q12", "isBacktracking": false,  "success": false,
                  "groups": {
                    "1": "aaaa"
                  },
                },
                {"state": "q13", "isBacktracking": false,  "success": false,
                  "groups": {
                    "1": "aaaac"
                  },
                },
                {"state": "q14", "isBacktracking": false,  "success": true,
                  "groups": {
                    "1": "aaaac"
                  },
                }
              ]],
            
        ]
        for (const [regex, string, result] of CASES) {
            it (`regex: ${regex}`, () => {
                const loop = newLoopGeneration(new NFARegex(regex), string);
                expect(loop).toEqual(result)
            });
        }
    });
});
