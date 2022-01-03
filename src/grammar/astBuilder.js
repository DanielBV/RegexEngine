import RegexVisitor from './generated/regexVisitor';
import {Regex, Expression, AtomicPattern, RegexAlternative} from './ast';
import { EPSILON } from '../engine/dfa';


export const ASTERISK = Symbol("*");
export const PLUS = Symbol("+");

export class AstBuilder extends RegexVisitor {
    visitRegex(ctx) {
        if (ctx.alternative().length === 0)
            return new Regex(this.visit(ctx.expr()));
        else {
            const main = ctx.expr().length === 0 ? this._epsilonAlternative() : new Regex(this.visit(ctx.expr()));
            return new RegexAlternative(main,  ...this.visit(ctx.alternative()));
        }
    }

    visitAlternative(ctx) {
        if (ctx.expr().length !== 0)
            return new Regex(this.visit(ctx.expr()));
        else 
            return this._epsilonAlternative();
    }

    _epsilonAlternative() {
        return new Regex([new Expression(null,new AtomicPattern(EPSILON))]);
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
    
    visitGroupPattern(ctx) {
        return this.visit(ctx.regexGroup());
    }

    visitRegexGroup(ctx) {
        return this.visit(ctx.regex());
    }

    visitPlusQuantifier() {
        return PLUS;
    }
}

