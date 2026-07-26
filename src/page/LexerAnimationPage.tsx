import React from "react";
import { lexerNfaToDot } from "./visualization/lexerToDot";
import { VizWrapper } from "./visualization/vizwrapper";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FormControl, Table } from "react-bootstrap";
import MonacoEditor from 'react-monaco-editor';
import './style.css';
import { traceTokenize, TokenizeTraceFrame } from "../lexer/trace";
import { defineAndSetTheme, Editor, Monaco, MONACO_EDITOR_OPTIONS } from "./visualization/utils";
import Button from 'react-bootstrap/Button'
import { TokenRule, LexerNFA } from "../lexer/lexerNfa";
import { Token } from "../lexer/lexer";

const DEFAULT_RULES: TokenRule[] = [
    { name: "CONST", pattern: "const" },
    { name: "EQ", pattern: "=" },
    { name: "NUMBER", pattern: "\\d+" },
    { name: "IDENTIFIER", pattern: "[a-zA-Z]\\w*" },
    { name: "ADD", pattern: "\\+" },
    { name: "WS", pattern: " +" },
];

const DEFAULT_TEXT = "const foo = 3 + aVariable";

interface TraceState {
    tokens: Token[];
    frames: TokenizeTraceFrame[];
    lexerNfa: LexerNFA | null;
    error: { pos: number } | null;
    valid: boolean;
}

interface LexerAnimationPageState extends TraceState {
    tokenRules: TokenRule[];
    text: string;
    i: number;
    automaticAnimation: boolean;
}

export default class LexerAnimationPage extends React.Component<{}, LexerAnimationPageState> {
    interval: ReturnType<typeof setInterval> | null;
    editor?: Editor;
    monaco?: Monaco;

    constructor(props: {}) {
        super(props);
        const tokenRules = DEFAULT_RULES;
        const text = DEFAULT_TEXT;
        this.state = { tokenRules, text, i: 0, automaticAnimation: false, ...this.trace(tokenRules, text) };
        this.interval = null;
    }

    componentDidUpdate(prevProps: {}, prevState: LexerAnimationPageState) {
        if (prevState.automaticAnimation !== this.state.automaticAnimation) {
            if (this.state.automaticAnimation) this.interval = setInterval(() => this.tick(), 700);
            else clearInterval(this.interval as ReturnType<typeof setInterval>);
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval as ReturnType<typeof setInterval>);
    }

    tick() {
        this.setState((prevState) => ({ i: prevState.frames.length > 0 ? (prevState.i + 1) % prevState.frames.length : 0 }));
    }

    trace(tokenRules: TokenRule[], text: string): TraceState {
        try {
            const cleanRules = tokenRules.filter((r) => r.name && r.pattern);
            const { tokens, frames, lexerNfa, error } = traceTokenize(cleanRules, text);
            return { tokens, frames, lexerNfa, error, valid: true };
        } catch (e) {
            return { tokens: [], frames: [], lexerNfa: null, error: null, valid: false };
        }
    }

    updateRules(tokenRules: TokenRule[]) {
        this.setState({ tokenRules, i: 0, ...this.trace(tokenRules, this.state.text) });
    }

    updateText(text: string) {
        this.setState({ text, i: 0, ...this.trace(this.state.tokenRules, text) });
    }

    updateRule(index: number, field: "name" | "pattern", value: string) {
        this.updateRules(this.state.tokenRules.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    }

    addRule() {
        this.updateRules([...this.state.tokenRules, { name: "", pattern: "" }]);
    }

    removeRule(index: number) {
        this.updateRules(this.state.tokenRules.filter((_, i) => i !== index));
    }

    moveRule(index: number, direction: number) {
        const target = index + direction;
        if (target < 0 || target >= this.state.tokenRules.length) return;
        const tokenRules = [...this.state.tokenRules];
        [tokenRules[index], tokenRules[target]] = [tokenRules[target], tokenRules[index]];
        this.updateRules(tokenRules);
    }

    render() {
        const { frames, i, tokens, lexerNfa, valid, error, text } = this.state;
        const frame = frames[i];
        const diagram = valid && lexerNfa && frame ? <VizWrapper dot={lexerNfaToDot(lexerNfa, frame)}></VizWrapper> : <div/>;

        const editorDidMount = (editor: Editor, monaco: Monaco) => {
            defineAndSetTheme(monaco);
            this.editor = editor;
            this.monaco = monaco;
        };

        let result = <div>Enter at least one rule and some text to see the tokenization animation.</div>;
        if (!valid) {
            result = <div className="resultSection">One or more rule patterns are invalid.</div>;
        } else if (frame) {
            const doneCount = frame.type === "tokenAccepted" ? frame.tokenIndex + 1 : frame.tokenIndex;
            const producedTokens = tokens.slice(0, doneCount);
            result = <div className="resultSection">
                <h5 id="resultHeader">State</h5>
                {error ? <div className="animationWarning">Warning: tokenization got stuck at position {error.pos} (no rule matches there).</div> : null}
                <div>Consumed input: {text.substring(0, frame.pos)}</div>
                <div>Remaining input: {text.substring(frame.pos)}</div>
                <div>Pos: {frame.pos}</div>
                <div>Active states: {frame.activeStates.join(", ") || "(none)"}</div>
                <div>Best match so far: {frame.best ? `${frame.best.token.name} (ends at ${frame.best.endPos})` : "none yet"}</div>
                {frame.type === "tokenAccepted" ? <div>---- Token accepted: {producedTokens[producedTokens.length - 1].type} "{producedTokens[producedTokens.length - 1].text}"</div> : null}
                {frame.type === "error" ? <div>---- No rule matches the input at position {frame.pos}</div> : null}
                <div> Tokens so far:
                    <div>
                        {producedTokens.map((t, idx) => <div key={idx}>{t.type}: "{t.text}"</div>)}
                    </div>
                </div>
            </div>;
        }

        return <div id="page">
            <Navbar className="navBar" bg="dark" variant="dark">
                <Navbar.Brand className="logo">Regex Engine {<div className="versionLabel">{process.env.VERSION}</div>}</Navbar.Brand>
                <Nav>
                <Nav.Link href="./">Main Tool</Nav.Link>
                <Nav.Link href="./animation.html">Animation</Nav.Link>
                <Nav.Link href="./parserComparison.html">Parser</Nav.Link>
                </Nav>
                <Nav className="me-auto">
                <Nav.Link href="https://github.com/DanielBV/RegexEngine">Github</Nav.Link>
                </Nav>
            </Navbar>
            <div id="content">
                <div className="animationWarning">Ordered token rules - order sets priority (top = highest). When multiple rules match the same (longest) text, the earliest-declared one wins.</div>
                <div className="lexerRulesSection">
                    <Table size="sm" className="ruleTable">
                        <thead>
                            <tr><th>Name</th><th>Pattern</th><th></th></tr>
                        </thead>
                        <tbody>
                            {this.state.tokenRules.map((rule, idx) => <tr key={idx}>
                                <td><FormControl size="sm" value={rule.name} onChange={(x: React.ChangeEvent<HTMLInputElement>) => this.updateRule(idx, "name", x.target.value)} /></td>
                                <td><FormControl size="sm" value={rule.pattern} onChange={(x: React.ChangeEvent<HTMLInputElement>) => this.updateRule(idx, "pattern", x.target.value)} /></td>
                                <td>
                                    <Button size="sm" variant="outline-secondary" onClick={() => this.moveRule(idx, -1)}>&uarr;</Button>
                                    <Button size="sm" variant="outline-secondary" onClick={() => this.moveRule(idx, 1)}>&darr;</Button>
                                    <Button size="sm" variant="outline-danger" onClick={() => this.removeRule(idx)}>x</Button>
                                </td>
                            </tr>)}
                        </tbody>
                    </Table>
                    <Button size="sm" variant="outline-primary" onClick={() => this.addRule()}>+ Add rule</Button>
                </div>

                <div id="inputResultContainer">
                    <div className="textInput">
                    <MonacoEditor
                        language="javascript"
                        theme="vs-light"
                        value={this.state.text}
                        options={MONACO_EDITOR_OPTIONS}
                        onChange={(x) => this.updateText(x)}
                        editorDidMount={editorDidMount}
                    />
                    </div>
                    {result}
                </div>
            </div>
            <div className="diagramContainer">
                <div id="animationHeader">
                    <h5 className="center" id="nfaLabel">Combined Lexer NFA</h5>
                    <Button variant="outline-primary" onClick={() => {
                        this.setState((prevState) => ({ i: Math.max(0, prevState.i - 1) }));
                    }}>&lt;</Button>
                    <div className="center">{frames.length > 0 ? `${i + 1}/${frames.length}` : "-"}</div>
                    <Button variant="outline-primary" onClick={() => {
                        this.setState((prevState) => ({ i: Math.min(prevState.frames.length - 1, prevState.i + 1) }));
                    }}>&gt;</Button>
                    <div className="form-check form-switch center">
                    <label className="form-check-label">
                        <input className="form-check-input" checked={this.state.automaticAnimation} onChange={() => this.setState((prevState) => ({ automaticAnimation: !prevState.automaticAnimation }))} type="checkbox" id="lexerAutoAnim"/>
                            Automatic Animation
                    </label>
                    </div>
                </div>
                {diagram}
            </div>
        </div>;
    }
}
