# Parser design notes — building on `src/lexer/`

Status: **design report only, no code yet.** This documents the investigation into
what the next learning step (a parser consuming the lexer's token stream) should
look like, following the same approach as the lexer: a simplified-but-informed
version of what professional tools actually do, not a toy shortcut and not a
full production implementation either.

## 1. What the parser starts from

`Lexer.tokenize(text)` (`src/lexer/lexer.js`) already returns exactly the kind of
flat token stream a parser expects:

```js
[{ type: "CONST", text: "const", start: 0, end: 5 }, { type: "WS", text: " ", start: 5, end: 6 }, ...]
```

Two things about the current output matter for parser design:
- **Whitespace tokens are included**, not filtered (per the lexer's own design
  notes, this was intentionally left as future-phase item #4: an `ignore`/`skip`
  flag per rule). The parser is the natural place this finally becomes necessary
  - a parser doesn't want to special-case `WS` in every grammar rule.
- **Priority-ordered, maximal-munch tokenization** is already solved - the parser
  never needs to worry about ambiguous lexing, only about what sequence of
  (already-disambiguated) token *types* is valid.

## 2. A concrete toy grammar to target

To keep the design grounded rather than abstract, the natural next step is to
extend the blog's own running example (`CONST`, `EQ`, `NUMBER`, `IDENTIFIER`,
`ADD`, `WS`) into a tiny statement grammar:

```
program     := statement* EOF
statement   := 'const' IDENTIFIER '=' expr ';'?
expr        := expr '+' expr        (left-associative)
             | NUMBER
             | IDENTIFIER
             | '(' expr ')'
```

This is deliberately small, but it already contains the two problems every real
parser has to deal with: **left recursion** (`expr := expr '+' expr`) and
**operator precedence/associativity** - so the design choices below aren't
hypothetical, they're forced by this grammar the moment a second operator
(`*`, say) is added.

## 3. Preprocessing the token stream

Before any parsing logic:
- **Filter skip tokens** (`WS`, later `COMMENT`) out of the stream. This is
  where the lexer's long-flagged `ignore` rule flag should finally get built -
  the parser is what actually needs it.
- **Append an explicit `EOF` sentinel token.** Standard technique in real
  parsers: every "peek next token" check has a token to look at, so the parser
  never has to special-case "ran out of input" as a separate condition from
  "unexpected token" - it's just another token type that fails to match
  whatever was expected.

## 4. Algorithm choice: recursive descent + Pratt/precedence climbing

### Why not plain recursive descent for `expr`

Recursive descent - one function per grammar rule, calling into each other
top-down - is a direct, natural fit for `statement` and `program` above. But
implemented literally, `expr := expr '+' expr` sends `parseExpr()` immediately
back into `parseExpr()` before consuming any token: infinite recursion.
Recursive descent parsing cannot handle left-recursive grammars directly - this
is a standard, well-documented limitation ([Recursive descent parser -
Grokipedia](https://grokipedia.com/page/Recursive_descent_parser)).

There are two classic fixes, and picking between them is the main design
decision here:

**a) Rewrite the grammar to remove left recursion**, e.g.
`expr := term ('+' term)*`, then recursive-descent it normally. This is what
LL parser generators historically required grammar authors to do by hand. It
works, but the moment you add more operators at different precedence levels
(`*` binds tighter than `+`), you end up with one grammar rule - and one
parsing function - per precedence level (`addExpr`, `mulExpr`, `unaryExpr`,
...), which is exactly the pain point called out in the next option.

**b) Precedence climbing / Pratt parsing.** Keep the grammar conceptually as
`expr := expr op expr | atom`, and instead of encoding precedence in the
grammar shape, encode it in a small **precedence table** consulted by a loop:
parse one atom, then repeatedly look at the next operator token, and if its
precedence is high enough, keep consuming and combining. Pratt parsing
(Vaughan Pratt, 1973, "Top Down Operator Precedence") is a generalization of
precedence climbing built on recursive descent
([Pratt Parsing and Precedence Climbing Are the Same
Algorithm](http://www.oilshell.org/blog//2016/11/01.html); [Pratt Parsers:
Expression Parsing Made
Easy](https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/)).
The practical payoff: adding a new operator later is a one-line table entry,
not a new grammar rule and a new function - "With recursive descent, you have
to write separate functions for each level of precedence... [Pratt parsing]
combines the best properties of recursive descent and Floyd's Operator
Precedence parsing" ([Pratt Parsers: Expression Parsing Made
Easy](https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/)).

This hybrid - recursive descent for statement/program structure, Pratt for
expressions - is not a compromise invented for this project; it's what
production parsers actually do: GCC's hand-coded C/C++ recursive-descent
parser is paired with an operator-precedence parser specifically to handle
arithmetic expressions fast, Douglas Crockford's JSLint parser is Pratt-based,
and Bob Nystrom's *Crafting Interpreters* uses exactly this recursive-descent
+ Pratt combination for its Lox language - a book with the same "build it to
understand it" spirit as this project's own blog series
([craftinginterpreters.com/parsing-expressions.html](https://craftinginterpreters.com/parsing-expressions.html)).
Recursive descent in general is also simply what most real, heavyweight
compilers use at the top level - "GCC, V8, Roslyn, and many other heavyweight
production language implementations use recursive descent"
([Grokipedia](https://grokipedia.com/page/Recursive_descent_parser)).

### The alternative professional approaches (for context, not for this project)

- **LL(1)/LL(k) table-driven parsing**: instead of hand-written functions, a
  parser generator computes FIRST/FOLLOW sets and builds an explicit parsing
  table ahead of time - conceptually the parser's analogue of what flex does
  for lexers (compile the automaton once, execute a table at runtime). More
  rigid about grammar shape (still needs left-recursion elimination, left
  factoring) than either recursive descent or ALL(*).
- **LALR(1) / bottom-up (yacc, bison)**: shift-reduce parsing over a
  precomputed state machine, strictly more powerful than LL(1) (handles some
  left-recursive and ambiguous-looking grammars natively), but the generated
  parser is a black-box table and debugging/error-messages are notoriously
  harder to get right than in a hand-written descent parser.
- **ANTLR4's ALL(*) ("Adaptive LL(*)")**: what the regex grammar already used
  in this very repo (`src/regex.g4` → `src/grammar/generated/`) is built with.
  Rather than precomputing lookahead requirements statically, ALL(*) computes
  and **caches lookahead decisions at runtime**, adapting to the actual input
  it sees - directly analogous to the same lexer-side ATN/DFA-caching
  behavior already documented for ANTLR4's `LexerATNSimulator` when we looked
  at the lexer's own "how do professional lexers really work" question.
  Crucially for grammar authors, "ANTLR 4 introduces a left-recursion
  detection and elimination mechanism, allowing it to handle left-recursive
  rules... [it] automatically rewrites left-recursive rules to be
  non-left-recursive and unambiguous" ([Adaptive LL(*) Parsing: The Power of
  Dynamic Analysis](https://www.antlr.org/papers/allstar-techreport.pdf) is
  the original algorithm paper; summary via
  [DeepWiki](https://deepwiki.com/courses-at-nju-by-hfwei/compilers-lectures/3.3-antlr-and-adaptive-ll(*)-parsing)).
  So ANTLR4 gets to offer LL-style grammars (easier to read/write than
  LALR grammars) *and* direct left recursion support, at the cost of the
  parser doing real analysis work at runtime rather than everything being
  baked into a static table - the parser genuinely "warms up" as it runs,
  the same way its lexer counterpart does.
- This project already contains a **live example of the generated-parser
  approach**: `src/grammar/generated/` is ANTLR4 output from `src/regex.g4`,
  used to parse *regex pattern syntax* into an AST. The new token-stream
  parser would be a deliberate contrast sitting right next to it in the same
  codebase - hand-written recursive-descent/Pratt vs. generated ALL(*) - for
  two different parsing jobs.

## 5. AST design

Mirror the existing convention in `src/grammar/ast.js` (small, plain ES
classes, one per node kind, no inheritance hierarchy beyond what's needed):

```js
export class ConstDeclaration { constructor(name, value) { this.name = name; this.value = value; } }
export class BinaryExpression { constructor(operator, left, right) { ... } }
export class NumberLiteral { constructor(value) { this.value = value; } }
export class IdentifierExpression { constructor(name) { this.name = name; } }
```

## 6. Error handling

- **MVP**: a `ParserError` thrown on the first unexpected token, carrying the
  offending token's `start` position - same shape as `LexerError` already in
  `src/lexer/lexer.js`. Fail fast, no recovery. Consistent with this
  project's stated "educational, not production" scope.
- **What professional parsers add**: *panic-mode recovery* - on a syntax
  error, skip tokens until a "synchronizing" token is reached (e.g. the next
  `;` or the start of a new statement keyword), then resume parsing, so one
  typo doesn't abort the whole file and multiple errors can be reported in a
  single pass. "Good synchronizing tokens...mark the beginning of new
  statements" and this technique is what lets "GCC, V8, Roslyn, and many
  other heavyweight production language implementations" report multiple
  errors per run instead of stopping at the first one ([Recursive descent
  parser - Grokipedia](https://grokipedia.com/page/Recursive_descent_parser);
  [Error Recovery in Predictive Parsing -
  GeeksforGeeks](https://www.geeksforgeeks.org/error-recovery-in-predictive-parsing/)).
  Flagged here as a future-phase improvement, not part of the MVP - same
  pattern as the lexer's own "future improvements" list.

## 7. Proposed module layout (not yet implemented)

```
src/parser/
  ast.js       — AST node classes (see §5)
  parser.js    — Parser class: recursive descent for program/statement,
                 Pratt/precedence-climbing loop for expr
  parserError.js (or folded into parser.js) — ParserError, mirrors LexerError

tests/
  parser.test.js — table-driven, same describe/it-per-case style as tests/lexer.test.js
```

A parse-tree visualization page (a 4th page alongside the existing Main Tool /
Animation / Lexer pages) is a plausible later stretch goal, but is out of
scope until the parser itself exists.

## 8. Recommended concrete next step

Implement the MVP end to end for the toy grammar in §2:
1. A `skip: true` flag on lexer rules (or an equivalent filter step) so `WS`
   tokens don't reach the parser.
2. `Parser` class: `parseProgram()` / `parseStatement()` via recursive
   descent, `parseExpr(minPrecedence)` via Pratt/precedence climbing over a
   small `{ '+': { precedence: 1, associativity: 'left' } }`-style table.
3. AST classes per §5, `ParserError` per §6.
4. `tests/parser.test.js` covering: the happy path (`const foo = 3 + 4;`),
   precedence/associativity once a second operator is added, and the
   unexpected-token error case.

## Sources

- [Pratt Parsing and Precedence Climbing Are the Same Algorithm](http://www.oilshell.org/blog//2016/11/01.html)
- [Pratt Parsers: Expression Parsing Made Easy](https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/)
- [Recursive descent parser — Grokipedia](https://grokipedia.com/page/Recursive_descent_parser)
- [Parsing Expressions · Crafting Interpreters](https://craftinginterpreters.com/parsing-expressions.html)
- [Adaptive LL(*) Parsing: The Power of Dynamic Analysis (ANTLR ALL(*) paper)](https://www.antlr.org/papers/allstar-techreport.pdf)
- [ANTLR and Adaptive LL(*) Parsing — DeepWiki summary](https://deepwiki.com/courses-at-nju-by-hfwei/compilers-lectures/3.3-antlr-and-adaptive-ll(*)-parsing)
- [Error Recovery in Predictive Parsing - GeeksforGeeks](https://www.geeksforgeeks.org/error-recovery-in-predictive-parsing/)
