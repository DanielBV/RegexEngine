
import antlr4 from 'antlr4';
import { ErrorListener } from 'antlr4/src/antlr4/error';
import { AstBuilder } from './astBuilder';
import RegexLexer from './generated/regexLexer';
import RegexParser from './generated/regexParser';

class CustomErrorListener extends ErrorListener {
    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        console.log(msg);
        throw Error(msg);
    }
}
export default function parseRegex(regex) {
    const chars = new antlr4.InputStream(regex)
    const lexer = new RegexLexer(chars)
    const tokens  = new antlr4.CommonTokenStream(lexer)
    const parser = new RegexParser(tokens)
    parser.buildParseTrees = true;
    parser.addErrorListener(new CustomErrorListener());
    const tree = parser.main();
    return new AstBuilder().visit(tree);
}