// Generated from ./src/regex.g4 by ANTLR 4.9.3
// jshint ignore: start
import antlr4 from 'antlr4';
import regexVisitor from './regexVisitor.js';


const serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786",
    "\u5964\u0003\u0015n\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004",
    "\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007",
    "\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004\f\t\f",
    "\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0003\u0007\u0003\u001d\n",
    "\u0003\f\u0003\u000e\u0003 \u000b\u0003\u0003\u0003\u0007\u0003#\n\u0003",
    "\f\u0003\u000e\u0003&\u000b\u0003\u0003\u0004\u0003\u0004\u0007\u0004",
    "*\n\u0004\f\u0004\u000e\u0004-\u000b\u0004\u0003\u0005\u0003\u0005\u0005",
    "\u00051\n\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003",
    "\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0005\u0006;\n\u0006\u0003",
    "\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0006\u0007A\n\u0007\r\u0007",
    "\u000e\u0007B\u0003\u0007\u0003\u0007\u0005\u0007G\n\u0007\u0005\u0007",
    "I\n\u0007\u0003\u0007\u0003\u0007\u0003\u0007\u0003\b\u0003\b\u0005",
    "\bP\n\b\u0003\b\u0007\bS\n\b\f\b\u000e\bV\u000b\b\u0003\b\u0003\b\u0003",
    "\t\u0003\t\u0003\t\u0005\t]\n\t\u0003\n\u0003\n\u0003\u000b\u0003\u000b",
    "\u0003\f\u0003\f\u0003\f\u0003\f\u0003\f\u0003\f\u0003\f\u0003\f\u0003",
    "\f\u0005\fl\n\f\u0003\f\u0002\u0002\r\u0002\u0004\u0006\b\n\f\u000e",
    "\u0010\u0012\u0014\u0016\u0002\u0004\u0005\u0002\u0005\u0005\u0007\r",
    "\u000f\u0015\u0004\u0002\u000e\u0012\u0015\u0015\u0002x\u0002\u0018",
    "\u0003\u0002\u0002\u0002\u0004\u001e\u0003\u0002\u0002\u0002\u0006\'",
    "\u0003\u0002\u0002\u0002\b.\u0003\u0002\u0002\u0002\n:\u0003\u0002\u0002",
    "\u0002\f<\u0003\u0002\u0002\u0002\u000eM\u0003\u0002\u0002\u0002\u0010",
    "Y\u0003\u0002\u0002\u0002\u0012^\u0003\u0002\u0002\u0002\u0014`\u0003",
    "\u0002\u0002\u0002\u0016k\u0003\u0002\u0002\u0002\u0018\u0019\u0005",
    "\u0004\u0003\u0002\u0019\u001a\u0007\u0002\u0002\u0003\u001a\u0003\u0003",
    "\u0002\u0002\u0002\u001b\u001d\u0005\b\u0005\u0002\u001c\u001b\u0003",
    "\u0002\u0002\u0002\u001d \u0003\u0002\u0002\u0002\u001e\u001c\u0003",
    "\u0002\u0002\u0002\u001e\u001f\u0003\u0002\u0002\u0002\u001f$\u0003",
    "\u0002\u0002\u0002 \u001e\u0003\u0002\u0002\u0002!#\u0005\u0006\u0004",
    "\u0002\"!\u0003\u0002\u0002\u0002#&\u0003\u0002\u0002\u0002$\"\u0003",
    "\u0002\u0002\u0002$%\u0003\u0002\u0002\u0002%\u0005\u0003\u0002\u0002",
    "\u0002&$\u0003\u0002\u0002\u0002\'+\u0007\u0003\u0002\u0002(*\u0005",
    "\b\u0005\u0002)(\u0003\u0002\u0002\u0002*-\u0003\u0002\u0002\u0002+",
    ")\u0003\u0002\u0002\u0002+,\u0003\u0002\u0002\u0002,\u0007\u0003\u0002",
    "\u0002\u0002-+\u0003\u0002\u0002\u0002.0\u0005\n\u0006\u0002/1\u0005",
    "\u0016\f\u00020/\u0003\u0002\u0002\u000201\u0003\u0002\u0002\u00021",
    "\t\u0003\u0002\u0002\u00022;\u0005\f\u0007\u00023;\u0005\u0014\u000b",
    "\u00024;\u0007\u0005\u0002\u00025;\u0007\u0006\u0002\u00026;\u0005\u000e",
    "\b\u00027;\u0007\u0014\u0002\u00028;\u0007\u0013\u0002\u00029;\u0007",
    "\u000b\u0002\u0002:2\u0003\u0002\u0002\u0002:3\u0003\u0002\u0002\u0002",
    ":4\u0003\u0002\u0002\u0002:5\u0003\u0002\u0002\u0002:6\u0003\u0002\u0002",
    "\u0002:7\u0003\u0002\u0002\u0002:8\u0003\u0002\u0002\u0002:9\u0003\u0002",
    "\u0002\u0002;\u000b\u0003\u0002\u0002\u0002<H\u0007\u0007\u0002\u0002",
    "=F\u0007\f\u0002\u0002>@\u0007\u0011\u0002\u0002?A\u0007\u0015\u0002",
    "\u0002@?\u0003\u0002\u0002\u0002AB\u0003\u0002\u0002\u0002B@\u0003\u0002",
    "\u0002\u0002BC\u0003\u0002\u0002\u0002CD\u0003\u0002\u0002\u0002DG\u0007",
    "\u0010\u0002\u0002EG\u0007\u0012\u0002\u0002F>\u0003\u0002\u0002\u0002",
    "FE\u0003\u0002\u0002\u0002GI\u0003\u0002\u0002\u0002H=\u0003\u0002\u0002",
    "\u0002HI\u0003\u0002\u0002\u0002IJ\u0003\u0002\u0002\u0002JK\u0005\u0004",
    "\u0003\u0002KL\u0007\b\u0002\u0002L\r\u0003\u0002\u0002\u0002MO\u0007",
    "\r\u0002\u0002NP\u0007\u0013\u0002\u0002ON\u0003\u0002\u0002\u0002O",
    "P\u0003\u0002\u0002\u0002PT\u0003\u0002\u0002\u0002QS\u0005\u0010\t",
    "\u0002RQ\u0003\u0002\u0002\u0002SV\u0003\u0002\u0002\u0002TR\u0003\u0002",
    "\u0002\u0002TU\u0003\u0002\u0002\u0002UW\u0003\u0002\u0002\u0002VT\u0003",
    "\u0002\u0002\u0002WX\u0007\u000e\u0002\u0002X\u000f\u0003\u0002\u0002",
    "\u0002Y\\\u0005\u0012\n\u0002Z[\u0007\u000f\u0002\u0002[]\u0005\u0012",
    "\n\u0002\\Z\u0003\u0002\u0002\u0002\\]\u0003\u0002\u0002\u0002]\u0011",
    "\u0003\u0002\u0002\u0002^_\t\u0002\u0002\u0002_\u0013\u0003\u0002\u0002",
    "\u0002`a\t\u0003\u0002\u0002a\u0015\u0003\u0002\u0002\u0002bl\u0007",
    "\t\u0002\u0002cl\u0007\n\u0002\u0002dl\u0007\f\u0002\u0002ef\u0007\t",
    "\u0002\u0002fl\u0007\f\u0002\u0002gh\u0007\n\u0002\u0002hl\u0007\f\u0002",
    "\u0002ij\u0007\f\u0002\u0002jl\u0007\f\u0002\u0002kb\u0003\u0002\u0002",
    "\u0002kc\u0003\u0002\u0002\u0002kd\u0003\u0002\u0002\u0002ke\u0003\u0002",
    "\u0002\u0002kg\u0003\u0002\u0002\u0002ki\u0003\u0002\u0002\u0002l\u0017",
    "\u0003\u0002\u0002\u0002\u000e\u001e$+0:BFHOT\\k"].join("");


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.PredictionContextCache();

export default class regexParser extends antlr4.Parser {

    static grammarFileName = "regex.g4";
    static literalNames = [ null, "'|'", "'\\'", null, null, "'('", "')'", 
                            "'*'", "'+'", "'.'", "'?'", "'['", "']'", "'-'", 
                            "'>'", "'<'", "':'", "'^'", "'$'" ];
    static symbolicNames = [ null, null, "BACKSLASH", "ESCAPED_RESERVED_CHAR", 
                             "CHARACTER_CLASS", "OPEN_PAR", "CLOSE_PAR", 
                             "ASTERISK", "PLUS", "DOT", "QUESTION_MARK", 
                             "OPEN_BRACKET", "CLOSE_BRACKET", "DASH", "GREATER_THAN", 
                             "LOWER_THAN", "COLON", "CARET", "DOLLAR", "CHAR" ];
    static ruleNames = [ "main", "regex", "alternative", "expr", "subexpr", 
                         "regexGroup", "complexCharacterClass", "complexCCPiece", 
                         "allowedCharInCharacterClass", "atomicChar", "quantifier" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = regexParser.ruleNames;
        this.literalNames = regexParser.literalNames;
        this.symbolicNames = regexParser.symbolicNames;
    }

    get atn() {
        return atn;
    }



	main() {
	    let localctx = new MainContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, regexParser.RULE_main);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 22;
	        this.regex();
	        this.state = 23;
	        this.match(regexParser.EOF);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	regex() {
	    let localctx = new RegexContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, regexParser.RULE_regex);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 28;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << regexParser.ESCAPED_RESERVED_CHAR) | (1 << regexParser.CHARACTER_CLASS) | (1 << regexParser.OPEN_PAR) | (1 << regexParser.DOT) | (1 << regexParser.OPEN_BRACKET) | (1 << regexParser.CLOSE_BRACKET) | (1 << regexParser.DASH) | (1 << regexParser.GREATER_THAN) | (1 << regexParser.LOWER_THAN) | (1 << regexParser.COLON) | (1 << regexParser.CARET) | (1 << regexParser.DOLLAR) | (1 << regexParser.CHAR))) !== 0)) {
	            this.state = 25;
	            this.expr();
	            this.state = 30;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 34;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===regexParser.T__0) {
	            this.state = 31;
	            this.alternative();
	            this.state = 36;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	alternative() {
	    let localctx = new AlternativeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, regexParser.RULE_alternative);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 37;
	        this.match(regexParser.T__0);
	        this.state = 41;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << regexParser.ESCAPED_RESERVED_CHAR) | (1 << regexParser.CHARACTER_CLASS) | (1 << regexParser.OPEN_PAR) | (1 << regexParser.DOT) | (1 << regexParser.OPEN_BRACKET) | (1 << regexParser.CLOSE_BRACKET) | (1 << regexParser.DASH) | (1 << regexParser.GREATER_THAN) | (1 << regexParser.LOWER_THAN) | (1 << regexParser.COLON) | (1 << regexParser.CARET) | (1 << regexParser.DOLLAR) | (1 << regexParser.CHAR))) !== 0)) {
	            this.state = 38;
	            this.expr();
	            this.state = 43;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	expr() {
	    let localctx = new ExprContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, regexParser.RULE_expr);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 44;
	        this.subexpr();
	        this.state = 46;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << regexParser.ASTERISK) | (1 << regexParser.PLUS) | (1 << regexParser.QUESTION_MARK))) !== 0)) {
	            this.state = 45;
	            this.quantifier();
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	subexpr() {
	    let localctx = new SubexprContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, regexParser.RULE_subexpr);
	    try {
	        this.state = 56;
	        this._errHandler.sync(this);
	        switch(this._input.LA(1)) {
	        case regexParser.OPEN_PAR:
	            localctx = new GroupPatternContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 48;
	            this.regexGroup();
	            break;
	        case regexParser.CLOSE_BRACKET:
	        case regexParser.DASH:
	        case regexParser.GREATER_THAN:
	        case regexParser.LOWER_THAN:
	        case regexParser.COLON:
	        case regexParser.CHAR:
	            localctx = new AtomicPatternContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 49;
	            this.atomicChar();
	            break;
	        case regexParser.ESCAPED_RESERVED_CHAR:
	            localctx = new EscapedReservedAtomicPatternContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 50;
	            this.match(regexParser.ESCAPED_RESERVED_CHAR);
	            break;
	        case regexParser.CHARACTER_CLASS:
	            localctx = new CharacterClassContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 51;
	            this.match(regexParser.CHARACTER_CLASS);
	            break;
	        case regexParser.OPEN_BRACKET:
	            localctx = new ComplexClassContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 52;
	            this.complexCharacterClass();
	            break;
	        case regexParser.DOLLAR:
	            localctx = new DollarAnchorContext(this, localctx);
	            this.enterOuterAlt(localctx, 6);
	            this.state = 53;
	            this.match(regexParser.DOLLAR);
	            break;
	        case regexParser.CARET:
	            localctx = new CaretAnchorContext(this, localctx);
	            this.enterOuterAlt(localctx, 7);
	            this.state = 54;
	            this.match(regexParser.CARET);
	            break;
	        case regexParser.DOT:
	            localctx = new DotPatternContext(this, localctx);
	            this.enterOuterAlt(localctx, 8);
	            this.state = 55;
	            this.match(regexParser.DOT);
	            break;
	        default:
	            throw new antlr4.error.NoViableAltException(this);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	regexGroup() {
	    let localctx = new RegexGroupContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 10, regexParser.RULE_regexGroup);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 58;
	        this.match(regexParser.OPEN_PAR);
	        this.state = 70;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        if(_la===regexParser.QUESTION_MARK) {
	            this.state = 59;
	            this.match(regexParser.QUESTION_MARK);
	            this.state = 68;
	            this._errHandler.sync(this);
	            switch(this._input.LA(1)) {
	            case regexParser.LOWER_THAN:
	                this.state = 60;
	                this.match(regexParser.LOWER_THAN);
	                this.state = 62; 
	                this._errHandler.sync(this);
	                _la = this._input.LA(1);
	                do {
	                    this.state = 61;
	                    localctx._CHAR = this.match(regexParser.CHAR);
	                    localctx.name.push(localctx._CHAR);
	                    this.state = 64; 
	                    this._errHandler.sync(this);
	                    _la = this._input.LA(1);
	                } while(_la===regexParser.CHAR);
	                this.state = 66;
	                this.match(regexParser.GREATER_THAN);
	                break;
	            case regexParser.COLON:
	                this.state = 67;
	                localctx.nonCapture = this.match(regexParser.COLON);
	                break;
	            default:
	                throw new antlr4.error.NoViableAltException(this);
	            }
	        }

	        this.state = 72;
	        this.regex();
	        this.state = 73;
	        this.match(regexParser.CLOSE_PAR);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	complexCharacterClass() {
	    let localctx = new ComplexCharacterClassContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 12, regexParser.RULE_complexCharacterClass);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 75;
	        this.match(regexParser.OPEN_BRACKET);
	        this.state = 77;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,8,this._ctx);
	        if(la_===1) {
	            this.state = 76;
	            localctx.negated = this.match(regexParser.CARET);

	        }
	        this.state = 82;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << regexParser.ESCAPED_RESERVED_CHAR) | (1 << regexParser.OPEN_PAR) | (1 << regexParser.CLOSE_PAR) | (1 << regexParser.ASTERISK) | (1 << regexParser.PLUS) | (1 << regexParser.DOT) | (1 << regexParser.QUESTION_MARK) | (1 << regexParser.OPEN_BRACKET) | (1 << regexParser.DASH) | (1 << regexParser.GREATER_THAN) | (1 << regexParser.LOWER_THAN) | (1 << regexParser.COLON) | (1 << regexParser.CARET) | (1 << regexParser.DOLLAR) | (1 << regexParser.CHAR))) !== 0)) {
	            this.state = 79;
	            this.complexCCPiece();
	            this.state = 84;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 85;
	        this.match(regexParser.CLOSE_BRACKET);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	complexCCPiece() {
	    let localctx = new ComplexCCPieceContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 14, regexParser.RULE_complexCCPiece);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 87;
	        this.allowedCharInCharacterClass();
	        this.state = 90;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,10,this._ctx);
	        if(la_===1) {
	            this.state = 88;
	            this.match(regexParser.DASH);
	            this.state = 89;
	            this.allowedCharInCharacterClass();

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	allowedCharInCharacterClass() {
	    let localctx = new AllowedCharInCharacterClassContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 16, regexParser.RULE_allowedCharInCharacterClass);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 92;
	        _la = this._input.LA(1);
	        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << regexParser.ESCAPED_RESERVED_CHAR) | (1 << regexParser.OPEN_PAR) | (1 << regexParser.CLOSE_PAR) | (1 << regexParser.ASTERISK) | (1 << regexParser.PLUS) | (1 << regexParser.DOT) | (1 << regexParser.QUESTION_MARK) | (1 << regexParser.OPEN_BRACKET) | (1 << regexParser.DASH) | (1 << regexParser.GREATER_THAN) | (1 << regexParser.LOWER_THAN) | (1 << regexParser.COLON) | (1 << regexParser.CARET) | (1 << regexParser.DOLLAR) | (1 << regexParser.CHAR))) !== 0))) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	atomicChar() {
	    let localctx = new AtomicCharContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 18, regexParser.RULE_atomicChar);
	    var _la = 0; // Token type
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 94;
	        _la = this._input.LA(1);
	        if(!((((_la) & ~0x1f) == 0 && ((1 << _la) & ((1 << regexParser.CLOSE_BRACKET) | (1 << regexParser.DASH) | (1 << regexParser.GREATER_THAN) | (1 << regexParser.LOWER_THAN) | (1 << regexParser.COLON) | (1 << regexParser.CHAR))) !== 0))) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	quantifier() {
	    let localctx = new QuantifierContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 20, regexParser.RULE_quantifier);
	    try {
	        this.state = 105;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,11,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new AsteriskQuantifierContext(this, localctx);
	            this.enterOuterAlt(localctx, 1);
	            this.state = 96;
	            this.match(regexParser.ASTERISK);
	            break;

	        case 2:
	            localctx = new PlusQuantifierContext(this, localctx);
	            this.enterOuterAlt(localctx, 2);
	            this.state = 97;
	            this.match(regexParser.PLUS);
	            break;

	        case 3:
	            localctx = new QuestionQuantifierContext(this, localctx);
	            this.enterOuterAlt(localctx, 3);
	            this.state = 98;
	            this.match(regexParser.QUESTION_MARK);
	            break;

	        case 4:
	            localctx = new LazyAsteriskQuantifierContext(this, localctx);
	            this.enterOuterAlt(localctx, 4);
	            this.state = 99;
	            this.match(regexParser.ASTERISK);
	            this.state = 100;
	            this.match(regexParser.QUESTION_MARK);
	            break;

	        case 5:
	            localctx = new LazyPlusQuantifierContext(this, localctx);
	            this.enterOuterAlt(localctx, 5);
	            this.state = 101;
	            this.match(regexParser.PLUS);
	            this.state = 102;
	            this.match(regexParser.QUESTION_MARK);
	            break;

	        case 6:
	            localctx = new LazyQuestionQuantifierContext(this, localctx);
	            this.enterOuterAlt(localctx, 6);
	            this.state = 103;
	            this.match(regexParser.QUESTION_MARK);
	            this.state = 104;
	            this.match(regexParser.QUESTION_MARK);
	            break;

	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

regexParser.EOF = antlr4.Token.EOF;
regexParser.T__0 = 1;
regexParser.BACKSLASH = 2;
regexParser.ESCAPED_RESERVED_CHAR = 3;
regexParser.CHARACTER_CLASS = 4;
regexParser.OPEN_PAR = 5;
regexParser.CLOSE_PAR = 6;
regexParser.ASTERISK = 7;
regexParser.PLUS = 8;
regexParser.DOT = 9;
regexParser.QUESTION_MARK = 10;
regexParser.OPEN_BRACKET = 11;
regexParser.CLOSE_BRACKET = 12;
regexParser.DASH = 13;
regexParser.GREATER_THAN = 14;
regexParser.LOWER_THAN = 15;
regexParser.COLON = 16;
regexParser.CARET = 17;
regexParser.DOLLAR = 18;
regexParser.CHAR = 19;

regexParser.RULE_main = 0;
regexParser.RULE_regex = 1;
regexParser.RULE_alternative = 2;
regexParser.RULE_expr = 3;
regexParser.RULE_subexpr = 4;
regexParser.RULE_regexGroup = 5;
regexParser.RULE_complexCharacterClass = 6;
regexParser.RULE_complexCCPiece = 7;
regexParser.RULE_allowedCharInCharacterClass = 8;
regexParser.RULE_atomicChar = 9;
regexParser.RULE_quantifier = 10;

class MainContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_main;
    }

	regex() {
	    return this.getTypedRuleContext(RegexContext,0);
	};

	EOF() {
	    return this.getToken(regexParser.EOF, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitMain(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class RegexContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_regex;
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	alternative = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(AlternativeContext);
	    } else {
	        return this.getTypedRuleContext(AlternativeContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitRegex(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class AlternativeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_alternative;
    }

	expr = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ExprContext);
	    } else {
	        return this.getTypedRuleContext(ExprContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitAlternative(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ExprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_expr;
    }

	subexpr() {
	    return this.getTypedRuleContext(SubexprContext,0);
	};

	quantifier() {
	    return this.getTypedRuleContext(QuantifierContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitExpr(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SubexprContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_subexpr;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class DotPatternContext extends SubexprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	DOT() {
	    return this.getToken(regexParser.DOT, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitDotPattern(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.DotPatternContext = DotPatternContext;

class GroupPatternContext extends SubexprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	regexGroup() {
	    return this.getTypedRuleContext(RegexGroupContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitGroupPattern(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.GroupPatternContext = GroupPatternContext;

class CharacterClassContext extends SubexprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	CHARACTER_CLASS() {
	    return this.getToken(regexParser.CHARACTER_CLASS, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitCharacterClass(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.CharacterClassContext = CharacterClassContext;

class ComplexClassContext extends SubexprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	complexCharacterClass() {
	    return this.getTypedRuleContext(ComplexCharacterClassContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitComplexClass(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.ComplexClassContext = ComplexClassContext;

class CaretAnchorContext extends SubexprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	CARET() {
	    return this.getToken(regexParser.CARET, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitCaretAnchor(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.CaretAnchorContext = CaretAnchorContext;

class DollarAnchorContext extends SubexprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	DOLLAR() {
	    return this.getToken(regexParser.DOLLAR, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitDollarAnchor(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.DollarAnchorContext = DollarAnchorContext;

class EscapedReservedAtomicPatternContext extends SubexprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	ESCAPED_RESERVED_CHAR() {
	    return this.getToken(regexParser.ESCAPED_RESERVED_CHAR, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitEscapedReservedAtomicPattern(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.EscapedReservedAtomicPatternContext = EscapedReservedAtomicPatternContext;

class AtomicPatternContext extends SubexprContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	atomicChar() {
	    return this.getTypedRuleContext(AtomicCharContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitAtomicPattern(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.AtomicPatternContext = AtomicPatternContext;

class RegexGroupContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_regexGroup;
        this._CHAR = null; // Token
        this.name = []; // of Tokens
        this.nonCapture = null; // Token
    }

	OPEN_PAR() {
	    return this.getToken(regexParser.OPEN_PAR, 0);
	};

	regex() {
	    return this.getTypedRuleContext(RegexContext,0);
	};

	CLOSE_PAR() {
	    return this.getToken(regexParser.CLOSE_PAR, 0);
	};

	QUESTION_MARK() {
	    return this.getToken(regexParser.QUESTION_MARK, 0);
	};

	COLON() {
	    return this.getToken(regexParser.COLON, 0);
	};

	LOWER_THAN() {
	    return this.getToken(regexParser.LOWER_THAN, 0);
	};

	GREATER_THAN() {
	    return this.getToken(regexParser.GREATER_THAN, 0);
	};

	CHAR = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(regexParser.CHAR);
	    } else {
	        return this.getToken(regexParser.CHAR, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitRegexGroup(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ComplexCharacterClassContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_complexCharacterClass;
        this.negated = null; // Token
    }

	OPEN_BRACKET() {
	    return this.getToken(regexParser.OPEN_BRACKET, 0);
	};

	CLOSE_BRACKET() {
	    return this.getToken(regexParser.CLOSE_BRACKET, 0);
	};

	complexCCPiece = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(ComplexCCPieceContext);
	    } else {
	        return this.getTypedRuleContext(ComplexCCPieceContext,i);
	    }
	};

	CARET() {
	    return this.getToken(regexParser.CARET, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitComplexCharacterClass(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ComplexCCPieceContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_complexCCPiece;
    }

	allowedCharInCharacterClass = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(AllowedCharInCharacterClassContext);
	    } else {
	        return this.getTypedRuleContext(AllowedCharInCharacterClassContext,i);
	    }
	};

	DASH() {
	    return this.getToken(regexParser.DASH, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitComplexCCPiece(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class AllowedCharInCharacterClassContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_allowedCharInCharacterClass;
    }

	CHAR() {
	    return this.getToken(regexParser.CHAR, 0);
	};

	DASH() {
	    return this.getToken(regexParser.DASH, 0);
	};

	OPEN_BRACKET() {
	    return this.getToken(regexParser.OPEN_BRACKET, 0);
	};

	OPEN_PAR() {
	    return this.getToken(regexParser.OPEN_PAR, 0);
	};

	CLOSE_PAR() {
	    return this.getToken(regexParser.CLOSE_PAR, 0);
	};

	ASTERISK() {
	    return this.getToken(regexParser.ASTERISK, 0);
	};

	PLUS() {
	    return this.getToken(regexParser.PLUS, 0);
	};

	DOT() {
	    return this.getToken(regexParser.DOT, 0);
	};

	QUESTION_MARK() {
	    return this.getToken(regexParser.QUESTION_MARK, 0);
	};

	ESCAPED_RESERVED_CHAR() {
	    return this.getToken(regexParser.ESCAPED_RESERVED_CHAR, 0);
	};

	GREATER_THAN() {
	    return this.getToken(regexParser.GREATER_THAN, 0);
	};

	LOWER_THAN() {
	    return this.getToken(regexParser.LOWER_THAN, 0);
	};

	COLON() {
	    return this.getToken(regexParser.COLON, 0);
	};

	CARET() {
	    return this.getToken(regexParser.CARET, 0);
	};

	DOLLAR() {
	    return this.getToken(regexParser.DOLLAR, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitAllowedCharInCharacterClass(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class AtomicCharContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_atomicChar;
    }

	CHAR() {
	    return this.getToken(regexParser.CHAR, 0);
	};

	CLOSE_BRACKET() {
	    return this.getToken(regexParser.CLOSE_BRACKET, 0);
	};

	DASH() {
	    return this.getToken(regexParser.DASH, 0);
	};

	GREATER_THAN() {
	    return this.getToken(regexParser.GREATER_THAN, 0);
	};

	LOWER_THAN() {
	    return this.getToken(regexParser.LOWER_THAN, 0);
	};

	COLON() {
	    return this.getToken(regexParser.COLON, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitAtomicChar(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class QuantifierContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = regexParser.RULE_quantifier;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class LazyAsteriskQuantifierContext extends QuantifierContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	ASTERISK() {
	    return this.getToken(regexParser.ASTERISK, 0);
	};

	QUESTION_MARK() {
	    return this.getToken(regexParser.QUESTION_MARK, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitLazyAsteriskQuantifier(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.LazyAsteriskQuantifierContext = LazyAsteriskQuantifierContext;

class LazyPlusQuantifierContext extends QuantifierContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	PLUS() {
	    return this.getToken(regexParser.PLUS, 0);
	};

	QUESTION_MARK() {
	    return this.getToken(regexParser.QUESTION_MARK, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitLazyPlusQuantifier(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.LazyPlusQuantifierContext = LazyPlusQuantifierContext;

class QuestionQuantifierContext extends QuantifierContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	QUESTION_MARK() {
	    return this.getToken(regexParser.QUESTION_MARK, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitQuestionQuantifier(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.QuestionQuantifierContext = QuestionQuantifierContext;

class LazyQuestionQuantifierContext extends QuantifierContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	QUESTION_MARK = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(regexParser.QUESTION_MARK);
	    } else {
	        return this.getToken(regexParser.QUESTION_MARK, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitLazyQuestionQuantifier(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.LazyQuestionQuantifierContext = LazyQuestionQuantifierContext;

class PlusQuantifierContext extends QuantifierContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	PLUS() {
	    return this.getToken(regexParser.PLUS, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitPlusQuantifier(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.PlusQuantifierContext = PlusQuantifierContext;

class AsteriskQuantifierContext extends QuantifierContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	ASTERISK() {
	    return this.getToken(regexParser.ASTERISK, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof regexVisitor ) {
	        return visitor.visitAsteriskQuantifier(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

regexParser.AsteriskQuantifierContext = AsteriskQuantifierContext;


regexParser.MainContext = MainContext; 
regexParser.RegexContext = RegexContext; 
regexParser.AlternativeContext = AlternativeContext; 
regexParser.ExprContext = ExprContext; 
regexParser.SubexprContext = SubexprContext; 
regexParser.RegexGroupContext = RegexGroupContext; 
regexParser.ComplexCharacterClassContext = ComplexCharacterClassContext; 
regexParser.ComplexCCPieceContext = ComplexCCPieceContext; 
regexParser.AllowedCharInCharacterClassContext = AllowedCharInCharacterClassContext; 
regexParser.AtomicCharContext = AtomicCharContext; 
regexParser.QuantifierContext = QuantifierContext; 
