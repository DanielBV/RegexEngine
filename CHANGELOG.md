
# Changelog
## 1.3.3
* Removed trim() in non-empty check for regex and text input. This way `    ` is considered a valid regex.
* The result label is no longer sticky
* Small refactors and cleaning

## 1.3.2 
* Fixed bug with `findAllMatches` when the regex was fully lazy. For example `.*?`.
    Since the regex didn't consume any token, the input didn't progressed and the program was stuck in an eternal loop.
* Moved changelog to its own file
## 1.3.1
* Fixed bug with nested capturing groups creating more groups that in should
For example `((a))+` created 3 groups instead of two, where the second group was split between the two qX a-> qY.
So instead of
- q0: Starts [1,2]
- q1: Ends [1,2]
- q3: Starts  [1,2]
- q4: Ends [1,2]

It was generating: 

- q0: Starts [1,2]
- q1: Ends [1,2]
- q3: Starts  [1,3]
- q4: Ends [1,3]
* Now the generated NFA do not skip numbers. Previously due to how two NFA were created separated and then appended one state was always removed.
  After the change the initial state of the appended NFA is still removed but its name coincides with the union state, so for the end user 
  is like no state was removed.
## 1.3.0
* Updated regex backtracking algorithm to allow not consuming the whole input.
    * Previously every regex had implicitly a end of input anchor (`regex$`)
        * This means that the regex `a` didn't find any match in the input `aa`. Now it matches the first `a`.
* Added class `NFARegex` to abstract the regex parsing and NFA creation.
    * Includes the methods `findFirstMatch` and `findAllMatches`.
* Replaced the input textarea with monaco editor. 
    * Added highlighting of the matches
    * Now the 'Results' panel shows the groups of the selected match. You can click on a match to select it.
        * This was ~~plagiarized~~ inspired by https://regexr.com/
## 1.2.0
* Added named capturing groups
* Added non capturing groups
* Added negated character classes
## 1.1.0
* Added lazy quantifiers (`*?`, `+?` and `??`)

## 1.0.0
* Created base engine
