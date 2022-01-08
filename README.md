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
