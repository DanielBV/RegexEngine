import RegexVisitor from './generated/regexVisitor';
import {Regex, Expression, AtomicPattern, RegexAlternative, DotPattern, CharacterClass, ComplexClass} from './ast';
import { EPSILON } from '../engine/dfa';


export const ASTERISK = Symbol("*");
export const PLUS = Symbol("+");
export const OPTIONAL = Symbol("?");

export class AstBuilder extends RegexVisitor {

    visitMain(ctx) {
        return this.visit(ctx.regex());
    }

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

    visitEscapedReservedAtomicPattern(ctx) {
        return new AtomicPattern(ctx.getText().substring(1));
    }

    visitCharacterClass(ctx) {
        return new CharacterClass(ctx.getText());
    }

    visitDotPattern() {
        return new DotPattern();
    }
    
    visitComplexCharacterClass(ctx) {
        const children = this.visit(ctx.complexCCPiece());
        const single = [];
        const ranges = [];
        for (const c of children) {
            if (c.length === 1) single.push(c[0]);
            else ranges.push(c);
        }
        return new ComplexClass(single, ranges, ctx.getText());
    }
    
    visitComplexClass(ctx) {
       return this.visit(ctx.complexCharacterClass());
    }

    visitComplexCCPiece(ctx) {
        return this.visit(ctx.allowedCharInCharacterClass());
    }

    visitAllowedCharInCharacterClass(ctx) {
        const txt = ctx.getText();
        return txt[0] === "\\" ? txt.substring(1) : txt;
    }

    visitAsteriskQuantifier() {
        return ASTERISK;
    }

    visitQuestionQuantifier() {
        return OPTIONAL;
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

