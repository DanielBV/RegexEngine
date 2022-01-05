
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
    | CHAR #atomicPattern
    | ESCAPED_CHAR #escapedAtomicPattern;

regexGroup: OPEN_PAR regex CLOSE_PAR;

quantifier:
    ASTERISK #asteriskQuantifier
    | PLUS #plusQuantifier;

WS: [ \n\t\r]+ -> skip;

BACKSLASH : '\\';
ESCAPED_CHAR: BACKSLASH (BACKSLASH | OPEN_PAR | CLOSE_PAR | ASTERISK | PLUS);
OPEN_PAR: '(';
CLOSE_PAR: ')';
ASTERISK: '*';
PLUS: '+';
CHAR: .;
