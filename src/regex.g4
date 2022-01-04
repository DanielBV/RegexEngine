
grammar regex;

main: regex EOF;

regex: expr* alternative*;
alternative: '|' expr*;

expr: subexpr quantifier?;
/* TODO: 
    - Anchors (^and $)
    - Non greedy (?)
    - Range quantifier: ({1})
*/
subexpr: 
    regexGroup #groupPattern
    | CHAR #atomicPattern;

regexGroup: OPEN_PAR regex CLOSE_PAR;

quantifier:
    ASTERISK #asteriskQuantifier
    | PLUS #plusQuantifier;

WS: [ \n\t\r]+ -> skip;

OPEN_PAR: '(';
CLOSE_PAR: ')';
CHAR: [a-zA-Z];
ASTERISK: '*';
PLUS: '+';