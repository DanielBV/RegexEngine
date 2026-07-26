import RegexVisitor from './generated/regexVisitor';
import {Regex, Expression, AtomicPattern, RegexAlternative, DotPattern, CharacterClass, ComplexClass, DollarAnchor, CaretAnchor} from './ast';
import { EPSILON } from '../engine/nfa';


export const ASTERISK = Symbol("*");
export const PLUS = Symbol("+");
export const OPTIONAL = Symbol("?");
export const LAZY_ASTERISK = Symbol("*?");
export const LAZY_PLUS = Symbol("+?");
export const LAZY_OPTIONAL = Symbol("??");

export class AstBuilder extends RegexVisitor {

    visitMain(ctx: any): Regex | RegexAlternative {
        return this.visit(ctx.regex());
    }

    visitRegex(ctx: any): Regex | RegexAlternative {
        if (ctx.alternative().length === 0)
            return new Regex(this.visit(ctx.expr()));
        else {
            const main = ctx.expr().length === 0 ? this._epsilonAlternative() : new Regex(this.visit(ctx.expr()));
            const alternatives: Regex[] = this.visit(ctx.alternative());
            main.nonCapturing();
            alternatives.forEach(x => x.nonCapturing());
            return new RegexAlternative(main,  ...alternatives);
        }
    }

    visitAlternative(ctx: any): Regex {
        if (ctx.expr().length !== 0)
            return new Regex(this.visit(ctx.expr()));
        else
            return this._epsilonAlternative();
    }

    _epsilonAlternative(): Regex {
        return new Regex([new Expression(null,new AtomicPattern(EPSILON))]);
    }

    visitExpr(ctx: any): Expression {
        return new Expression(ctx.quantifier() ? this.visit(ctx.quantifier()) : null, this.visit(ctx.subexpr()));
    }

    visitAtomicPattern(ctx: any): AtomicPattern {
        return new AtomicPattern(ctx.getText());
    }

    visitEscapedReservedAtomicPattern(ctx: any): AtomicPattern {
        return new AtomicPattern(ctx.getText().substring(1));
    }

    visitCharacterClass(ctx: any): CharacterClass {
        return new CharacterClass(ctx.getText());
    }

    visitDotPattern(): DotPattern {
        return new DotPattern();
    }

    visitDollarAnchor(): DollarAnchor {
        return new DollarAnchor();
    }

    visitCaretAnchor(): CaretAnchor {
        return new CaretAnchor();
    }

    visitComplexCharacterClass(ctx: any): ComplexClass {
        const negated = Boolean(ctx.negated);
        const children: string[][] = this.visit(ctx.complexCCPiece());
        const single: string[] = [];
        const ranges: [string, string][] = [];
        for (const c of children) {
            if (c.length === 1) single.push(c[0]);
            else ranges.push(c as [string, string]);
        }
        return new ComplexClass(single, ranges, ctx.getText(), negated);
    }

    visitComplexClass(ctx: any): ComplexClass {
       return this.visit(ctx.complexCharacterClass());
    }

    visitComplexCCPiece(ctx: any): string[] {
        return this.visit(ctx.allowedCharInCharacterClass());
    }

    visitAllowedCharInCharacterClass(ctx: any): string {
        const txt: string = ctx.getText();
        return txt[0] === "\\" ? txt.substring(1) : txt;
    }

    visitAsteriskQuantifier(): symbol {
        return ASTERISK;
    }

    visitQuestionQuantifier(): symbol {
        return OPTIONAL;
    }

    visitLazyAsteriskQuantifier(): symbol {
        return LAZY_ASTERISK;
    }

    visitLazyPlusQuantifier(): symbol {
        return LAZY_PLUS;
    }

    visitLazyQuestionQuantifier(): symbol {
        return LAZY_OPTIONAL;
    }

    visitGroupPattern(ctx: any): Regex | RegexAlternative {
        return this.visit(ctx.regexGroup());
    }

    visitRegexGroup(ctx: any): Regex | RegexAlternative {
        const alternative = this.visit(ctx.regex());
        alternative.groupName = ctx.name.map((x: any) => x.text).join("");
        if (ctx.nonCapture) alternative.nonCapturing();
        return alternative;
    }

    visitPlusQuantifier(): symbol {
        return PLUS;
    }
}
