declare module "antlr4" {
    namespace antlr4 {
        class InputStream {
            constructor(input: string);
        }

        class CommonTokenStream {
            constructor(lexer: Lexer);
        }

        class Lexer {
            constructor(input: InputStream);
        }

        class Parser {
            constructor(input: CommonTokenStream);
            buildParseTrees: boolean;
            addErrorListener(listener: error.ErrorListener): void;
        }

        namespace tree {
            class ParseTreeVisitor {
                visit(ctx: any): any;
                visitChildren(ctx: any): any;
            }
        }

        namespace error {
            class ErrorListener {
                syntaxError(recognizer: any, offendingSymbol: any, line: number, column: number, msg: string, e: any): void;
            }
        }
    }

    export = antlr4;
}
