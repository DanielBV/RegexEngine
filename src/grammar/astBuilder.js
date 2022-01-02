import RegexVisitor from './generated/regexVisitor';
import {Regex, Expression, AtomicPattern} from './ast';


export const ASTERISK = Symbol("*");
export const PLUS = Symbol("+");

export class AstBuilder extends RegexVisitor {
    visitRegex(ctx) {
        return new Regex(this.visitChildren(ctx));
    }

    visitExpr(ctx) {
        return new Expression(ctx.quantifier() ? this.visit(ctx.quantifier()) : null, this.visit(ctx.subexpr()));
    }

    visitAtomicPattern(ctx) {
        return new AtomicPattern(ctx.getText());
    }

    visitAsteriskQuantifier() {
        return ASTERISK;
    }

    visitPlusQuantifier() {
        return PLUS;
    }
}

