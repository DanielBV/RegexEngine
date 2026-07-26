import antlr4 from 'antlr4';
import { AstBuilder } from './astBuilder';
import RegexLexer from './generated/regexLexer';
import RegexParser from './generated/regexParser';
import { Regex, RegexAlternative } from './ast';

const { ErrorListener } = antlr4.error;

class CustomErrorListener extends ErrorListener {
    syntaxError(recognizer: any, offendingSymbol: any, line: number, column: number, msg: string, e: any) {
        console.log(msg);
        throw Error(msg);
    }
}
export default function parseRegex(regex: string): Regex | RegexAlternative {
    const chars = new antlr4.InputStream(regex)
    const lexer = new RegexLexer(chars)
    const tokens  = new antlr4.CommonTokenStream(lexer)
    const parser = new RegexParser(tokens)
    parser.buildParseTrees = true;
    parser.addErrorListener(new CustomErrorListener());
    const tree = parser.main();
    return new AstBuilder().visit(tree);
}
