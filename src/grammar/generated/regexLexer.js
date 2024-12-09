// Generated from ./src/regex.g4 by ANTLR 4.9.3
// jshint ignore: start
import antlr4 from 'antlr4';



const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786",
    "\u5964\u0002\u0015^\b\u0001\u0004\u0002\t\u0002\u0004\u0003\t\u0003",
    "\u0004\u0004\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007",
    "\t\u0007\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004",
    "\f\t\f\u0004\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010",
    "\t\u0010\u0004\u0011\t\u0011\u0004\u0012\t\u0012\u0004\u0013\t\u0013",
    "\u0004\u0014\t\u0014\u0003\u0002\u0003\u0002\u0003\u0003\u0003\u0003",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004\u0003\u0004",
    "\u0003\u0004\u0003\u0004\u0005\u0004<\n\u0004\u0003\u0005\u0003\u0005",
    "\u0003\u0005\u0003\u0006\u0003\u0006\u0003\u0007\u0003\u0007\u0003\b",
    "\u0003\b\u0003\t\u0003\t\u0003\n\u0003\n\u0003\u000b\u0003\u000b\u0003",
    "\f\u0003\f\u0003\r\u0003\r\u0003\u000e\u0003\u000e\u0003\u000f\u0003",
    "\u000f\u0003\u0010\u0003\u0010\u0003\u0011\u0003\u0011\u0003\u0012\u0003",
    "\u0012\u0003\u0013\u0003\u0013\u0003\u0014\u0003\u0014\u0002\u0002\u0015",
    "\u0003\u0003\u0005\u0004\u0007\u0005\t\u0006\u000b\u0007\r\b\u000f\t",
    "\u0011\n\u0013\u000b\u0015\f\u0017\r\u0019\u000e\u001b\u000f\u001d\u0010",
    "\u001f\u0011!\u0012#\u0013%\u0014\'\u0015\u0003\u0002\u0003\b\u0002",
    "FFUUYYffuuyy\u0002i\u0002\u0003\u0003\u0002\u0002\u0002\u0002\u0005",
    "\u0003\u0002\u0002\u0002\u0002\u0007\u0003\u0002\u0002\u0002\u0002\t",
    "\u0003\u0002\u0002\u0002\u0002\u000b\u0003\u0002\u0002\u0002\u0002\r",
    "\u0003\u0002\u0002\u0002\u0002\u000f\u0003\u0002\u0002\u0002\u0002\u0011",
    "\u0003\u0002\u0002\u0002\u0002\u0013\u0003\u0002\u0002\u0002\u0002\u0015",
    "\u0003\u0002\u0002\u0002\u0002\u0017\u0003\u0002\u0002\u0002\u0002\u0019",
    "\u0003\u0002\u0002\u0002\u0002\u001b\u0003\u0002\u0002\u0002\u0002\u001d",
    "\u0003\u0002\u0002\u0002\u0002\u001f\u0003\u0002\u0002\u0002\u0002!",
    "\u0003\u0002\u0002\u0002\u0002#\u0003\u0002\u0002\u0002\u0002%\u0003",
    "\u0002\u0002\u0002\u0002\'\u0003\u0002\u0002\u0002\u0003)\u0003\u0002",
    "\u0002\u0002\u0005+\u0003\u0002\u0002\u0002\u0007-\u0003\u0002\u0002",
    "\u0002\t=\u0003\u0002\u0002\u0002\u000b@\u0003\u0002\u0002\u0002\rB",
    "\u0003\u0002\u0002\u0002\u000fD\u0003\u0002\u0002\u0002\u0011F\u0003",
    "\u0002\u0002\u0002\u0013H\u0003\u0002\u0002\u0002\u0015J\u0003\u0002",
    "\u0002\u0002\u0017L\u0003\u0002\u0002\u0002\u0019N\u0003\u0002\u0002",
    "\u0002\u001bP\u0003\u0002\u0002\u0002\u001dR\u0003\u0002\u0002\u0002",
    "\u001fT\u0003\u0002\u0002\u0002!V\u0003\u0002\u0002\u0002#X\u0003\u0002",
    "\u0002\u0002%Z\u0003\u0002\u0002\u0002\'\\\u0003\u0002\u0002\u0002)",
    "*\u0007~\u0002\u0002*\u0004\u0003\u0002\u0002\u0002+,\u0007^\u0002\u0002",
    ",\u0006\u0003\u0002\u0002\u0002-;\u0005\u0005\u0003\u0002.<\u0005\u0005",
    "\u0003\u0002/<\u0005\u000b\u0006\u00020<\u0005\r\u0007\u00021<\u0005",
    "\u000f\b\u00022<\u0005\u0011\t\u00023<\u0005\u0013\n\u00024<\u0005\u0017",
    "\f\u00025<\u0005\u0019\r\u00026<\u0005\u001d\u000f\u00027<\u0005\u001f",
    "\u0010\u00028<\u0005!\u0011\u00029<\u0005#\u0012\u0002:<\u0005%\u0013",
    "\u0002;.\u0003\u0002\u0002\u0002;/\u0003\u0002\u0002\u0002;0\u0003\u0002",
    "\u0002\u0002;1\u0003\u0002\u0002\u0002;2\u0003\u0002\u0002\u0002;3\u0003",
    "\u0002\u0002\u0002;4\u0003\u0002\u0002\u0002;5\u0003\u0002\u0002\u0002",
    ";6\u0003\u0002\u0002\u0002;7\u0003\u0002\u0002\u0002;8\u0003\u0002\u0002",
    "\u0002;9\u0003\u0002\u0002\u0002;:\u0003\u0002\u0002\u0002<\b\u0003",
    "\u0002\u0002\u0002=>\u0005\u0005\u0003\u0002>?\t\u0002\u0002\u0002?",
    "\n\u0003\u0002\u0002\u0002@A\u0007*\u0002\u0002A\f\u0003\u0002\u0002",
    "\u0002BC\u0007+\u0002\u0002C\u000e\u0003\u0002\u0002\u0002DE\u0007,",
    "\u0002\u0002E\u0010\u0003\u0002\u0002\u0002FG\u0007-\u0002\u0002G\u0012",
    "\u0003\u0002\u0002\u0002HI\u00070\u0002\u0002I\u0014\u0003\u0002\u0002",
    "\u0002JK\u0007A\u0002\u0002K\u0016\u0003\u0002\u0002\u0002LM\u0007]",
    "\u0002\u0002M\u0018\u0003\u0002\u0002\u0002NO\u0007_\u0002\u0002O\u001a",
    "\u0003\u0002\u0002\u0002PQ\u0007/\u0002\u0002Q\u001c\u0003\u0002\u0002",
    "\u0002RS\u0007@\u0002\u0002S\u001e\u0003\u0002\u0002\u0002TU\u0007>",
    "\u0002\u0002U \u0003\u0002\u0002\u0002VW\u0007<\u0002\u0002W\"\u0003",
    "\u0002\u0002\u0002XY\u0007`\u0002\u0002Y$\u0003\u0002\u0002\u0002Z[",
    "\u0007&\u0002\u0002[&\u0003\u0002\u0002\u0002\\]\u000b\u0002\u0002\u0002",
    "](\u0003\u0002\u0002\u0002\u0004\u0002;\u0002"].join("");


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

export default class regexLexer extends antlr4.Lexer {

    static grammarFileName = "regex.g4";
    static channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	static modeNames = [ "DEFAULT_MODE" ];
	static literalNames = [ null, "'|'", "'\\'", null, null, "'('", "')'", 
                         "'*'", "'+'", "'.'", "'?'", "'['", "']'", "'-'", 
                         "'>'", "'<'", "':'", "'^'", "'$'" ];
	static symbolicNames = [ null, null, "BACKSLASH", "ESCAPED_RESERVED_CHAR", 
                          "CHARACTER_CLASS", "OPEN_PAR", "CLOSE_PAR", "ASTERISK", 
                          "PLUS", "DOT", "QUESTION_MARK", "OPEN_BRACKET", 
                          "CLOSE_BRACKET", "DASH", "GREATER_THAN", "LOWER_THAN", 
                          "COLON", "CARET", "DOLLAR", "CHAR" ];
	static ruleNames = [ "T__0", "BACKSLASH", "ESCAPED_RESERVED_CHAR", "CHARACTER_CLASS", 
                      "OPEN_PAR", "CLOSE_PAR", "ASTERISK", "PLUS", "DOT", 
                      "QUESTION_MARK", "OPEN_BRACKET", "CLOSE_BRACKET", 
                      "DASH", "GREATER_THAN", "LOWER_THAN", "COLON", "CARET", 
                      "DOLLAR", "CHAR" ];

    constructor(input) {
        super(input)
        this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.PredictionContextCache());
    }

    get atn() {
        return atn;
    }
}

regexLexer.EOF = antlr4.Token.EOF;
regexLexer.T__0 = 1;
regexLexer.BACKSLASH = 2;
regexLexer.ESCAPED_RESERVED_CHAR = 3;
regexLexer.CHARACTER_CLASS = 4;
regexLexer.OPEN_PAR = 5;
regexLexer.CLOSE_PAR = 6;
regexLexer.ASTERISK = 7;
regexLexer.PLUS = 8;
regexLexer.DOT = 9;
regexLexer.QUESTION_MARK = 10;
regexLexer.OPEN_BRACKET = 11;
regexLexer.CLOSE_BRACKET = 12;
regexLexer.DASH = 13;
regexLexer.GREATER_THAN = 14;
regexLexer.LOWER_THAN = 15;
regexLexer.COLON = 16;
regexLexer.CARET = 17;
regexLexer.DOLLAR = 18;
regexLexer.CHAR = 19;



