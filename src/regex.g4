
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
    | atomicChar #atomicPattern
    | ESCAPED_RESERVED_CHAR #escapedReservedAtomicPattern
    | CHARACTER_CLASS #characterClass
    | complexCharacterClass #complexClass
    | DOLLAR #dollarAnchor
    | CARET #caretAnchor
    | DOT #dotPattern;

regexGroup: OPEN_PAR (QUESTION_MARK ((LOWER_THAN name+=CHAR+ GREATER_THAN) | nonCapture=COLON))? regex CLOSE_PAR;
complexCharacterClass: OPEN_BRACKET negated=CARET? complexCCPiece* CLOSE_BRACKET;

complexCCPiece: allowedCharInCharacterClass (DASH allowedCharInCharacterClass)?;

allowedCharInCharacterClass:
    CHAR | DASH | OPEN_BRACKET | OPEN_PAR | CLOSE_PAR | ASTERISK | PLUS | DOT | QUESTION_MARK | ESCAPED_RESERVED_CHAR | GREATER_THAN 
    | LOWER_THAN | COLON | CARET | DOLLAR;

atomicChar: 
    CHAR | CLOSE_BRACKET | DASH | GREATER_THAN | LOWER_THAN | COLON;

quantifier:
    ASTERISK #asteriskQuantifier
    | PLUS #plusQuantifier
    | QUESTION_MARK #questionQuantifier
    | ASTERISK QUESTION_MARK #lazyAsteriskQuantifier
    | PLUS QUESTION_MARK #lazyPlusQuantifier
    | QUESTION_MARK QUESTION_MARK #lazyQuestionQuantifier;


BACKSLASH : '\\';
ESCAPED_RESERVED_CHAR: BACKSLASH (BACKSLASH | OPEN_PAR | CLOSE_PAR | ASTERISK | PLUS | DOT | OPEN_BRACKET | CLOSE_BRACKET | GREATER_THAN 
    | LOWER_THAN | COLON | CARET | DOLLAR);
CHARACTER_CLASS: BACKSLASH ( 'd' | 'D' | 'w' | 'W' | 's' | 'S');
OPEN_PAR: '(';
CLOSE_PAR: ')';
ASTERISK: '*';
PLUS: '+';
DOT: '.';
QUESTION_MARK: '?';
OPEN_BRACKET: '[';
CLOSE_BRACKET: ']';
DASH: '-';
GREATER_THAN: '>';
LOWER_THAN: '<';
COLON: ':';
CARET: '^';
DOLLAR: '$';

CHAR: .;
