
import antlr4 from 'antlr4';
import { AstBuilder } from './astBuilder';
import RegexLexer from './generated/regexLexer';
import RegexParser from './generated/regexParser';

export default function parseRegex(regex) {
    const chars = new antlr4.InputStream(regex)
    const lexer = new RegexLexer(chars)
    const tokens  = new antlr4.CommonTokenStream(lexer)
    const parser = new RegexParser(tokens)
    parser.buildParseTrees = true
    const tree = parser.regex();
    return new AstBuilder().visit(tree);
}