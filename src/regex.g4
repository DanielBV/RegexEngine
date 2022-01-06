
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
    | ESCAPED_RESERVED_CHAR #escapedReservedAtomicPattern
    | CHARACTER_CLASS #characterClass
    | DOT #dotPattern;

regexGroup: OPEN_PAR regex CLOSE_PAR;

quantifier:
    ASTERISK #asteriskQuantifier
    | PLUS #plusQuantifier;

WS: [ \n\t\r]+ -> skip;

BACKSLASH : '\\';
ESCAPED_RESERVED_CHAR: BACKSLASH (BACKSLASH | OPEN_PAR | CLOSE_PAR | ASTERISK | PLUS | DOT);
CHARACTER_CLASS: BACKSLASH ( 'd' | 'D' | 'w' | 'W' | 's' | 'S');
OPEN_PAR: '(';
CLOSE_PAR: ')';
ASTERISK: '*';
PLUS: '+';
DOT: '.';

CHAR: .;
