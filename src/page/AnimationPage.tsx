import React from "react";
import {animatedNFAToDot} from "./visualization/nfaToDot";
import { VizWrapper } from "./visualization/vizwrapper";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FormControl, InputGroup } from "react-bootstrap";
import MonacoEditor from 'react-monaco-editor';
import './style.css';
import { NFARegex } from "../engine/regex";
import { defineAndSetTheme, Editor, Monaco, MONACO_EDITOR_OPTIONS } from "./visualization/utils";
import Button from 'react-bootstrap/Button'
import { AnimationStep, generateAnimation } from "./loop";

interface AnimationPageState {
    loop: AnimationStep[];
    i: number;
    regex: NFARegex | null;
    regexSource: string;
    string: string;
    automaticAnimation: boolean;
}

interface ParsedRegex {
    valid: boolean;
    regex?: NFARegex | null;
}

export default class AnimationPage extends React.Component<{}, AnimationPageState> {
    decorator: any[];
    resultComponent: React.RefObject<any>;
    interval: ReturnType<typeof setInterval> | null;
    editor?: Editor;
    monaco?: Monaco;

    constructor(props: {}) {
        super(props);
        this.decorator = [];
        const {valid, regex} = this.parseRegex("");
        const loop: AnimationStep[] = [];
        this.state = {loop, i: 0, regex: regex ?? null, regexSource: "", string: "", automaticAnimation: false};
        this.interval = null;
        this.resultComponent = React.createRef();
    }

    componentDidMount() {
        //this.interval = setInterval(() => this.tick(), 1000);
    }

    componentDidUpdate(prevProps: {}, prevState: AnimationPageState) {
        if (prevState.automaticAnimation !== this.state.automaticAnimation) {
            if (this.state.automaticAnimation)  this.interval = setInterval(() => this.tick(), 1000);
            else clearInterval(this.interval as ReturnType<typeof setInterval>);
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval as ReturnType<typeof setInterval>);
    }





    tick() {
        this.setState((prevState)=> {return {...prevState, i: (prevState.i + 1) % prevState.loop.length }});
    }

    parseRegex(regex: string): ParsedRegex {
        try {
            const _regex = new NFARegex(regex);
            return {valid: true, regex: _regex};
        } catch (e) {
            console.error(e);
            return {valid: false};
        }
    }

    render() {
        let diagram = null;
        const i = this.state.i;
        if (this.state.regex && this.state.regex.nfa) {
            const dot = this.state.regex && this.state.regex.nfa
                ? animatedNFAToDot(this.state.regex.nfa, this.state.loop[i].state, this.state.loop[i].type) : null;
            diagram = (this.state.regex as any)  !== "" ? <VizWrapper dot={dot as string}></VizWrapper> : <div/>;
        }

        const editorDidMount = (editor: Editor, monaco: Monaco) => {
            defineAndSetTheme(monaco);
            this.editor = editor;
            this.monaco = monaco;
          }
        let groups: React.ReactNode[] = [];
        if (this.state.loop.length > 0 ) {
            Object.keys(this.state.loop[i].groups).forEach(x => groups.push(<div>Group {x}: {this.state.loop[i].groups[x]}</div>))
        }

        const result = this.state.loop.length > 0 ? <div className="resultSection">
            <h5 id="resultHeader">State</h5>
                <div>Consumed input: {this.state.string.substring(0, this.state.loop[i].pos)}</div>
                <div>Remaining input: {this.state.string.substring(this.state.loop[i].pos)}</div>
                <div>Pos: {this.state.loop[i].pos} {["startBacktrack","backtrack"].includes(this.state.loop[i].type) ? "--- Backtracking" : null}</div>
                {this.state.loop[i].type === "finished" ? <div> ---- Finished. Match: {this.state.string.substring(0,this.state.loop[i].pos)}</div> : null}
                <div> Groups:
                    <div>
                        {groups}
                    </div>
                </div>
            </div> : null;

        return <div id="page">
            <Navbar className="navBar" bg="dark" variant="dark">
                <Navbar.Brand className="logo">Regex Engine {<div className="versionLabel">{process.env.VERSION}</div>}</Navbar.Brand>
                <Nav>
                <Nav.Link href="./">Main Tool</Nav.Link>
                <Nav.Link href="./lexerAnimation.html">Lexer</Nav.Link>
               {false} ? <Nav.Link href="./parserComparison.html">Parser</Nav.Link> : <></>
                </Nav>
                <Nav className="me-auto">
                <Nav.Link href="https://github.com/DanielBV/RegexEngine">Github</Nav.Link>
                </Nav>
            </Navbar>
            <div id="content">
                <div className="animationWarning">This page only shows the animation for a single computation. This means the regex you write has an implicit ^ anchor. Methods like 'findFirstMatch' and 'findAllMatch' run multiple computations starting at different indexes.</div>
                        <InputGroup className="mb-3">
                <div id="regexLabel">Regex:</div>
                <FormControl className="regexInput"
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                value={this.state.regexSource}  placeholder="((a|b)+)"
                            onChange={(x: React.ChangeEvent<HTMLInputElement>) => {
                                const {valid, regex} = this.parseRegex(x.target.value);
                                if (!valid || x.target.value === "")
                                    this.setState({loop:[], i: 0, regex:null, regexSource: x.target.value});
                                else {
                                    const loop = generateAnimation(regex as NFARegex, this.state.string);
                                    this.setState({loop, i: 0, regex: regex ?? null,   regexSource: x.target.value});
                                }
                            }}
                /></InputGroup>

                <div id="inputResultContainer">
                    <div className="textInput">
                    <MonacoEditor
                        language="javascript"
                        theme="vs-light"
                        value={this.state.string}
                        options={MONACO_EDITOR_OPTIONS}
                        onChange={(x) => {
                                const loop = this.state.regex && this.state.regex.nfa ? generateAnimation(this.state.regex, x) : [];
                                this.setState({loop, i: 0, string: x});
                        }}
                        editorDidMount={editorDidMount}
                    />
                    </div>
                    {result}
                </div>
            </div>
            <div className="diagramContainer">
                <div id="animationHeader">
                    <h5 className="center" id="nfaLabel">NFA</h5>
                    <Button variant="outline-primary" onClick={() => {
                        this.setState((prevState)=> {return {...prevState, i: Math.max(0, (prevState.i - 1)) }});
                    }}>&lt;</Button>
                    <div className="center">{this.state.regex && this.state.regex.nfa ? `${this.state.i+1}/${this.state.loop.length}` : "-"}</div>
                    <Button variant="outline-primary" onClick={() => {
                        this.setState((prevState)=> {return {...prevState, i: Math.min(prevState.loop.length-1, (prevState.i + 1)) }});
                    }}>&gt;</Button>
                    <div className="form-check form-switch center">
                    <label className="form-check-label">
                        <input className="form-check-input" checked={this.state.automaticAnimation} onChange={() => this.setState((prevState) => ({automaticAnimation: !prevState.automaticAnimation}))} type="checkbox" id="flexSwitchCheckDefault"/>
                            Automatic Animation
                    </label>
                </div>
                </div>
                {diagram}
            </div>
        </div>
    }
}
