
function getGroups(memory, source, currentPos) {
    const groups = {};
    Object.keys(memory.ACTIVE_GROUPS).forEach(x => groups[x] = source.substring(memory.ACTIVE_GROUPS[x],currentPos));
    Object.values(memory.GROUP_MATCHES).forEach(([i, start, end]) => {
        if (memory.ACTIVE_GROUPS[i] && memory.ACTIVE_GROUPS[i] > start) {
            // The group is being overriden at the moment
        } else {
            // The group is finished
            groups[i] = source.substring(start, end);
        }
    });
    return groups;
}

/**
 * This loop (and the animationStepAlgorithm) is kind of fake. It doesn't represent the real flow when backtracking.
 * Still, the animation looks better if it backtracks one step at a time
 * @returns 
 */
export  function newLoopGeneration(regex, string) {
    let stack =  regex.nfa.firstIterativeStep(string, 0);
    let result = {memory: {success: false}};
    const steps = [];
    while (stack.length > 0 && !result.memory.success) {
        result = regex.nfa.animationStepAlgorithm(stack);
        stack = result.stack;
        steps.push({state: result.currentState.name, pos: result.pos, groups: getGroups(result.memory, string, result.pos), isBacktracking: result.backtrack, success: result.memory.success});
    }
    return steps;
}

/**
 * Does the following transformations to the loop:
 * - The step where the backtracking starts is divided into two: a 'advance' (in green) to show that is has moved to that
 *    state and a 'backtrack' to show... that it backtracks
 * - If the loop is a failure it removes the last backtrack trail and replaces it by a single 'failure' in the last
 *    non-backtrack-node.
 * - Adds a type to the state which differenciates more clearly between states.
 * @param {*} loop 
 */
export function prettifyLoop(loop) {
    const newLoop = [];
    let lastNonBacktrack = 0;
    let absolutePositionInNewLoop = 0;
    for (let i = 0; i < loop.length; i++) {
        const step = loop[i];
        if (step.isBacktracking) {
            let plusOne = false;
            if (lastNonBacktrack !== 0 && lastNonBacktrack === i-1 ) { // An intermediate node to soften the animation
                newLoop.push({state: step.state, type: "advance", pos: step.pos, groups: step.groups});
                absolutePositionInNewLoop +=1;
                plusOne = true;
            }
            newLoop.push({state: step.state, type: lastNonBacktrack === i-1 ? "startBacktrack"  : "backtrack", pos: step.pos, groups: step.groups});
            if (i === loop.length - 1 ){
                newLoop.splice(lastNonBacktrack + 2); /** +2 because of the intermediate 'advance' state */
                newLoop[newLoop.length-1].type = "totalFailure";
            }
        } else if (step.success) {
            newLoop.push({state: step.state, type: "finished", pos: step.pos, groups: step.groups});
        } else {
            newLoop.push({state: step.state, type: "advance", pos: step.pos, groups: step.groups});
            lastNonBacktrack = absolutePositionInNewLoop;
        }
        absolutePositionInNewLoop+=1;
    }
    return newLoop;
}


export function generateAnimation(regex, string) {
    return prettifyLoop(newLoopGeneration(regex, string));
}