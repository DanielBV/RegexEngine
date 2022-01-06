# Regex Engine

## Supported syntax
* Star `*`: `a*`
* Plus `+`: `a+`
* Capturing groups: (ab)+
* Character classes:
    * `.`: Matches any single character (except linebreaks).
    * `\d`: Matches a single digit.
    * `\D`: Matches any single character that isn't a digit.
    * `\w`: Matches [A-Za-z0-9_]
    * `\W`: Matches [^A-Za-z0-9_] 
    * `\s`: Matches whitespace charactrers
    * `\S`: Matches non-whitespace characters