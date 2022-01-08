# Regex Engine
* Tests
* Import regex and run
## Supported syntax
* Star `*`: `a*`
* Plus `+`: `a+`
* Optional `?`: `ab?a`
* Lazy quantifiers: `*?`, `+?`, `??`
* Capturing groups: `(ab)+`
    * Named capturing group: `(?<name>a+)`
    * Non-capturing group: `((?:ab)+)` 
* Character classes:
    * `.`: Matches any single character (except linebreaks).
    * `\d`: Matches a single digit.
    * `\D`: Matches any single character that isn't a digit.
    * `\w`: Matches [A-Za-z0-9_]
    * `\W`: Matches [^A-Za-z0-9_] 
    * `\s`: Matches whitespace charactrers
    * `\S`: Matches non-whitespace characters
    * `[a-zA-Z]`: Matches all characters between a-z and A-Z
    * `[^a-zA-Z]`: Matches any character that isn't between a-z and A-Z
* `findFirstMatch` and `findAllMatches`.

## Changelog
### 1.3.1
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
### 1.3.0
* Updated regex backtracking algorithm to allow not consuming the whole input.
    * Previously every regex had implicitly a end of input anchor (`regex$`)
        * This means that the regex `a` didn't find any match in the input `aa`. Now it matches the first `a`.
* Added class `NFARegex` to abstract the regex parsing and NFA creation.
    * Includes the methods `findFirstMatch` and `findAllMatches`.
* Replaced the input textarea with monaco editor. 
    * Added highlighting of the matches
    * Now the 'Results' panel shows the groups of the selected match. You can click on a match to select it.
        * This was ~~plagiarized~~ inspired by https://regexr.com/
### 1.2.0
* Added named capturing groups
* Added non capturing groups
* Added negated character classes
### 1.1.0
* Added lazy quantifiers (`*?`, `+?` and `??`)

### 1.0.0
* Created base engine
