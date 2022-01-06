# Regex Engine

## Supported syntax
* Star `*`: `a*`
* Plus `+`: `a+`
* Optional `?`: `ab?a`
* Capturing groups: `(ab)+`
* Character classes:
    * `.`: Matches any single character (except linebreaks).
    * `\d`: Matches a single digit.
    * `\D`: Matches any single character that isn't a digit.
    * `\w`: Matches [A-Za-z0-9_]
    * `\W`: Matches [^A-Za-z0-9_] 
    * `\s`: Matches whitespace charactrers
    * `\S`: Matches non-whitespace characters

## Pending features
- Character class ([])
- Negated character class ([^])
- Non capturing group
- Named capturing group:
* Non-greedy quantifiers
- ¿Non-greedy interface? - Spoiler: This might not happen at all.
    - MatchFirst
    - MatchAll
    - Anchors (^ and &)