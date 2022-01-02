
grammar regex;

regex: expr+;

expr: subexpr quantifier?;
/* TODO: 
    - Anchors (^and $)
    - Non greedy (?)
    - Range quantifier: ({1})
*/
subexpr: 
    regexGroup #groupPattern
    | CHAR #atomicPattern;

regexGroup: '(' regex ')';

quantifier:
    ASTERISK #asteriskQuantifier
    | PLUS #plusQuantifier;
    


CHAR: [a-zA-Z];
ASTERISK: '*';
PLUS: '+';