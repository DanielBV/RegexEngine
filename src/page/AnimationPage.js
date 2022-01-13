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
import { defineAndSetTheme, MONACO_EDITOR_OPTIONS } from "./visualization/utils";
import Button from 'react-bootstrap/Button'
import { generateAnimation } from "./loop";
import ToggleButton from 'react-bootstrap/ToggleButton'

export default class AnimationPage extends React.Component {
    constructor() {
        super();
        this.decorator = [];
        const {valid, regex} = this.parseRegex("");
        const loop = [];
        this.state = {loop, i: 0, regex, regexSource: "", string: "", automaticAnimation: false};
        this.interval = null;
        this.resultComponent = React.createRef();
    }

    componentDidMount() {
        //this.interval = setInterval(() => this.tick(), 1000);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.automaticAnimation !== this.state.automaticAnimation) {
            if (this.state.automaticAnimation)  this.interval = setInterval(() => this.tick(), 1000);
            else clearInterval(this.interval);
        }
    }
    
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getGroups(memory, source, currentPos) {
        const groups = {};
        Object.keys(memory.ACTIVE_GROUPS).forEach(x => groups[x] = source.substring(memory.ACTIVE_GROUPS[x],currentPos));
        Object.values(memory.GROUP_MATCHES).forEach(([i, start, end]) => {
            if (memory.ACTIVE_GROUPS[i] && memory.ACTIVE_GROUPS[i] > start) {
                // The group is being overriden at the moment
            } else {
                // The group is finished
                groups[i] = source.substring(start, end);
            }
        });
        return groups;
    }




    tick() {
        this.setState((prevState)=> {return {...prevState, i: (prevState.i + 1) % prevState.loop.length }});
    }

    parseRegex(regex) {
        try {
            const _regex = new NFARegex(regex);
            return {valid: true, regex: _regex};
        } catch (e) {
            console.error(e);
            return {valid: regex === ""};
        }
    }
    
    render() {
        let diagram = null, matches = [];
        const valid = true;
        const i = this.state.i;
        const dot = this.state.regex && this.state.regex.nfa ? animatedNFAToDot(this.state.regex.nfa, this.state.loop[i].state, this.state.loop[i].type) : null;
        this.matchesPositions = [];
        diagram = this.state.regex  !== "" ? <VizWrapper dot={dot}></VizWrapper> : <div/>; 

        const editorDidMount = (editor, monaco) => {
            defineAndSetTheme(monaco);
            this.editor = editor;
            this.monaco = monaco;
          }
        let groups = [];
        if (this.state.loop.length > 0 ) {
            Object.keys(this.state.loop[i].groups).forEach(x => groups.push(<div>Group {x}: {this.state.loop[i].groups[x]}</div>))
        }

        const result = this.state.loop.length > 0 ? <div class="resultSection">
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
                <Navbar.Brand className="logo">Regex Engine {<div class="versionLabel">{process.env.VERSION}</div>}</Navbar.Brand>
                <Nav>
                <Nav.Link href="/">Main Tool</Nav.Link>
                </Nav>
                <Nav className="me-auto">
                <Nav.Link href="https://github.com/DanielBV/RegexEngine">Github</Nav.Link>
                </Nav>
            </Navbar>
            <div id="content">
                        <InputGroup className="mb-3">
                <div id="regexLabel">Regex:</div>
                <FormControl isInvalid={!valid} className="regexInput"
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                value={this.state.regexSource}  placeholder="((a|b)+)"
                            onChange={(x) => {
                                const {valid, regex} = this.parseRegex(x.target.value);
                                if (!valid)
                                    this.setState({loop:[], i: 0, regex:null, regexSource: x.target.value});
                                else {
                                    const loop = generateAnimation(regex, this.state.string);
                                    this.setState({loop, i: 0, regex,   regexSource: x.target.value});
                                }
                            }}
                /></InputGroup>
               
                <div id="inputResultContainer">
                    <div class="textInput">
                    <MonacoEditor
                        language="javascript"
                        theme="vs-light"
                        value={this.state.string} 
                        options={MONACO_EDITOR_OPTIONS}
                        onChange={(x) => {
                            const loop = generateAnimation(this.state.regex, x);
                            console.log(loop);
                            this.setState({loop, i: 0, string: x});
                        }}
                        editorDidMount={editorDidMount}
                    />
                    </div>
                    {result}
                </div> 
            </div>
            <div class="diagramContainer">
                <div id="animationHeader">
                    <h5 class="center" id="nfaLabel">NFA</h5>
                    <Button variant="outline-primary" onClick={() => {
                        this.setState((prevState)=> {return {...prevState, i: Math.max(0, (prevState.i - 1)) }});
                    }}>&lt;</Button>
                    <div class="center">{this.state.regex && this.state.regex.nfa ? `${this.state.i+1}/${this.state.loop.length}` : "-"}</div>
                    <Button variant="outline-primary" onClick={() => {
                        this.setState((prevState)=> {return {...prevState, i: Math.min(prevState.loop.length-1, (prevState.i + 1)) }});
                    }}>&gt;</Button>
                    <div class="form-check form-switch center">
                    <label class="form-check-label">
                        <input class="form-check-input" checked={this.state.automaticAnimation} onChange={() => this.setState((prevState) => ({automaticAnimation: !prevState.automaticAnimation}))} type="checkbox" id="flexSwitchCheckDefault"/>
                            Automatic Animation
                    </label>
                </div>
                </div>
                {diagram}
            </div>
        </div>
    }
}