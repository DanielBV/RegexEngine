import React from "react";
import { VizWrapper } from "./visualization/vizwrapper";
import { treeToDot } from "./visualization/treeToDot";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import Button from 'react-bootstrap/Button'
import { getFixedTokens, FIXED_INPUT } from "../parser/tokenize";
import { parsePratt } from "../parser/pratt";
import { parseLL1 } from "../parser/ll1";
import { parseSLR } from "../parser/slr";
import { TreeNode } from "../parser/tree";
import { Token } from "../lexer/lexer";

type Lane = "pratt" | "ll1" | "slr";
const LANES: Lane[] = ["pratt", "ll1", "slr"];

interface LaneResult {
    tree: TreeNode;
    // Each lane's trace frames share {tokenIndex, action, tree} but also carry
    // lane-specific fields (depth/note for pratt, stack for ll1, states/symbols
    // for slr) - left loosely typed here rather than forcing a union that
    // renderLane's generic renderState callback would have to narrow.
    trace: any[];
}

interface ParserComparisonPageState {
    i: Record<Lane, number>;
    auto: Record<Lane, boolean>;
}

export default class ParserComparisonPage extends React.Component<{}, ParserComparisonPageState> {
    tokens: Token[];
    realTokens: Token[];
    results: Record<Lane, LaneResult>;
    intervals: Partial<Record<Lane, ReturnType<typeof setInterval>>>;

    constructor(props: {}) {
        super(props);
        this.tokens = getFixedTokens();
        this.realTokens = this.tokens.slice(0, this.tokens.length - 1); // drop EOF sentinel
        this.results = {
            pratt: parsePratt(this.tokens),
            ll1: parseLL1(this.tokens),
            slr: parseSLR(this.tokens),
        };
        this.state = {
            i: { pratt: 0, ll1: 0, slr: 0 },
            auto: { pratt: false, ll1: false, slr: false },
        };
        this.intervals = {};
    }

    componentDidUpdate(prevProps: {}, prevState: ParserComparisonPageState) {
        for (const lane of LANES) {
            if (prevState.auto[lane] !== this.state.auto[lane]) {
                if (this.state.auto[lane]) this.intervals[lane] = setInterval(() => this.tick(lane), 900);
                else clearInterval(this.intervals[lane]);
            }
        }
    }

    componentWillUnmount() {
        for (const lane of LANES) clearInterval(this.intervals[lane]);
    }

    tick(lane: Lane) {
        this.setState((prev) => ({ i: { ...prev.i, [lane]: (prev.i[lane] + 1) % this.results[lane].trace.length } }));
    }

    step(lane: Lane, delta: number) {
        this.setState((prev) => {
            const len = this.results[lane].trace.length;
            return { i: { ...prev.i, [lane]: Math.max(0, Math.min(len - 1, prev.i[lane] + delta)) } };
        });
    }

    toggleAuto(lane: Lane) {
        this.setState((prev) => ({ auto: { ...prev.auto, [lane]: !prev.auto[lane] } }));
    }

    consumedRemaining(tokenIndex: number): { consumed: string, remaining: string } {
        const consumed = this.realTokens.slice(0, tokenIndex).map((t) => t.text).join(" ");
        const remaining = this.realTokens.slice(tokenIndex).map((t) => t.text).join(" ");
        return { consumed, remaining };
    }

    renderLane(lane: Lane, title: string, description: string, renderState: (frame: any) => React.ReactNode) {
        const { trace } = this.results[lane];
        const i = this.state.i[lane];
        const frame = trace[i];
        const { consumed, remaining } = this.consumedRemaining(frame.tokenIndex);

        return <div className="parserLane" key={lane}>
            <h5>{title}</h5>
            <div className="parserLaneDescription">{description}</div>
            <div className="parserStepControls">
                <Button size="sm" variant="outline-primary" onClick={() => this.step(lane, -1)}>&lt;</Button>
                <div className="center">{i + 1}/{trace.length}</div>
                <Button size="sm" variant="outline-primary" onClick={() => this.step(lane, 1)}>&gt;</Button>
                <div className="form-check form-switch center">
                    <label className="form-check-label">
                        <input className="form-check-input" type="checkbox" checked={this.state.auto[lane]} onChange={() => this.toggleAuto(lane)} />
                        Auto
                    </label>
                </div>
            </div>
            <div className="parserConsumed">
                <div>Consumed: {consumed || "(none)"}</div>
                <div>Remaining: {remaining || "(none)"}</div>
            </div>
            <div className="parserAction"><b>Action:</b> {frame.action}</div>
            {renderState(frame)}
            <div className="parserTree"><VizWrapper dot={treeToDot(frame.tree)}></VizWrapper></div>
        </div>;
    }

    render() {
        return <div id="page">
            <Navbar className="navBar" bg="dark" variant="dark">
                <Navbar.Brand className="logo">Regex Engine {<div className="versionLabel">{process.env.VERSION}</div>}</Navbar.Brand>
                <Nav>
                <Nav.Link href="./">Main Tool</Nav.Link>
                <Nav.Link href="./animation.html">Animation</Nav.Link>
                <Nav.Link href="./lexerAnimation.html">Lexer</Nav.Link>
                </Nav>
                <Nav className="me-auto">
                <Nav.Link href="https://github.com/DanielBV/RegexEngine">Github</Nav.Link>
                </Nav>
            </Navbar>
            <div className="parserBody">
                <div className="animationWarning">Fixed grammar, fixed input - comparing how three parsing algorithms consume the same token stream: "{FIXED_INPUT}" (evaluates to 13). See src/parser/README.md for the design notes behind each lane.</div>
                <div className="parserColumns">
                    {this.renderLane("pratt", "Recursive Descent + Pratt", "Hand-written, top-down. One parseExpr(minPrecedence) loop consults a precedence table - no grammar rewriting needed.", (frame) => (
                        <div className="parserCallStack">
                            <div>Call depth: {frame.depth}</div>
                            <div>{frame.note}</div>
                        </div>
                    ))}
                    {this.renderLane("ll1", "LL(1) Table-Driven", "Generated-style, top-down. Left recursion removed from the grammar by hand; a FIRST/FOLLOW-derived table drives an explicit symbol stack, no recursion at all.", (frame) => (
                        <div className="parserStack">
                            <div>Symbol stack (top last): {frame.stack.join(" ")}</div>
                        </div>
                    ))}
                    {this.renderLane("slr", "SLR(1) Shift-Reduce", "Generated-style, bottom-up. Natural left-recursive grammar used as-is - a real LR(0) automaton shifts/reduces the tree together from the leaves up.", (frame) => (
                        <div className="parserStack">
                            <div>State stack: {frame.states.join(" ")}</div>
                            <div>Symbol stack: {frame.symbols.join(" ")}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>;
    }
}
