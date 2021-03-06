
import { newLoopGeneration } from "../src/page/loop";
import { NFARegex } from "../src/engine/regex";


describe('animation', () => {
    describe('basic works', () => {
        const CASES = [
            ["a", "a", [
                {isBacktracking: false, state:"q0", pos: 0, success: false, groups: {0: ""}},
                {isBacktracking: false, state:"q1", pos: 1, success: true, groups: {0: "a"}}]],
            ["aaab|aac", "aac", [
                {isBacktracking: false, state:"q0", pos: 0, success: false, groups: {0: ""}},
                {isBacktracking: false, state:"q2",  pos: 1,success: false, groups: {0: "a"}},
                {isBacktracking: true, state:"q3",  pos: 2, success: false, groups: {0: "aa"}},
                {isBacktracking: true, state:"q2",  pos: 1, success: false, groups: {0: "a"}},
                {isBacktracking: true, state:"q0",  pos: 0, success: false, groups: {0: ""}},
                {isBacktracking: false, state:"q7",  pos: 1, success: false, groups: {0: "a"}},
                {isBacktracking: false, state:"q8",  pos: 2, success: false, groups: {0: "aa"}},
                {isBacktracking: false, state:"q9",  pos: 3, success: false, groups: {0: "aac"}},
                {isBacktracking: false, state:"q10", pos: 3, success: true, groups: {0: "aac"}},
            ]],
            ["aaaaa", "aaab", [
                {isBacktracking: false, state:"q0", pos: 0, success: false, groups: {0:""}},
                {isBacktracking: false, state:"q1",  pos: 1, success: false, groups: {0:"a"}},
                {isBacktracking: false, state:"q2",  pos: 2,success: false, groups: {0: "aa"}},
                {isBacktracking: true, state:"q3", pos: 3, success: false, groups: {0: "aaa"}},
                {isBacktracking: true, state:"q2", pos: 2, success: false, groups: {0: "aa"}},   
                {isBacktracking: true, state:"q1",  pos: 1, success: false, groups: {0: "a"}},   
                {isBacktracking: true, state:"q0",  pos: 0,success: false, groups: {0: ""}},   
            ]],
            ["(aaaa)bc|aaaac", "aaaac",[
                {"state": "q0", "isBacktracking": false, "success": false, pos: 0, 
                  "groups": {
                    "0": "",
                    "1": ""
                  }},
                  {"state": "q2",  "isBacktracking": false, "success": false, pos: 1, 
                  "groups": {
                    "0": "a",
                    "1": "a"
                  },
                
                },
                {"state": "q3", "isBacktracking": false,  "success": false, pos: 2, 
                  "groups": {
                    "0": "aa",
                    "1": "aa"
                  },
                },
                {"state": "q4", "isBacktracking": false,  "success": false, pos: 3, 
                  "groups": {
                    "0": "aaa",
                    "1": "aaa"
                  },
                },
                {"state": "q5","isBacktracking": true,  "success": false, pos: 4, 
                  "groups": {
                    "0": "aaaa",
                    "1": "aaaa"
                  },
                },
                {"state": "q4",  "isBacktracking": true,  "success": false, pos: 3, 
                  "groups": {
                    "0": "aaa",
                    "1": "aaa"
                  },
                },
                {"state": "q3", "isBacktracking": true,  "success": false, pos: 2, 
                  "groups": {
                    "0": "aa",
                    "1": "aa"
                  },
                },
                {"state": "q2","isBacktracking": true,  "success": false, pos: 1, 
                  "groups": {
                    "0": "a",
                    "1": "a"
                  },
                },
                {"state": "q0", "isBacktracking": true,  "success": false, pos: 0, 
                  "groups": {
                    "0": "",
                    "1": ""
                  },
                },
                {"state": "q9", "isBacktracking": false,  "success": false, pos: 1, 
                  "groups": {
                    "0": "a",
                    "1": "a"
                  },
                },
                {"state": "q10", "isBacktracking": false,  "success": false, pos: 2, 
                  "groups": {
                    "0": "aa",
                    "1": "aa"
                  },
                },
                {"state": "q11", "isBacktracking": false,  "success": false, pos: 3, 
                  "groups": {
                    "0": "aaa",
                    "1": "aaa"
                  },
                },
                {"state": "q12", "isBacktracking": false,  "success": false, pos: 4, 
                  "groups": {
                    "0": "aaaa",
                    "1": "aaaa"
                  },
                },
                {"state": "q13", "isBacktracking": false,  "success": false, pos: 5, 
                  "groups": {
                    "0": "aaaac",
                    "1": "aaaac"
                  },
                },
                {"state": "q14", "isBacktracking": false,  "success": true, pos: 5, 
                  "groups": {
                    "0": "aaaac",
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
