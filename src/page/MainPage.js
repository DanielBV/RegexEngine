import React from "react";
import {nfaToDot} from "./visualization/nfaToDot";
import { VizWrapper } from "./visualization/vizwrapper";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FormControl, InputGroup } from "react-bootstrap";
import MonacoEditor from 'react-monaco-editor';
import './style.css';
import { NFARegex } from "../engine/regex";
import ResultComponent from "./ResultComponent";
import { defineAndSetTheme, MONACO_EDITOR_OPTIONS } from "./visualization/utils";

const decorationsColors = [
    "greenDecorator", "blueDecorator", "yellowDecorator"
];
let decoratorIt = 0;
function getDecorator() {
    const d = decorationsColors[decoratorIt];
    decoratorIt = (decoratorIt + 1) % decorationsColors.length;
    return d;
}

function resetDecorator() {
    decoratorIt = 0;
}

export default class MainPage extends React.Component {
    constructor() {
        super();
        this.decorator = [];
        this.state = {regex: "", string:"", matches: [], result: null};
        this.resultComponent = React.createRef();
    }

    parseRegex(regex) {
        try {
            const _regex = new NFARegex(regex, true);
            const dot = nfaToDot(_regex.nfa);
            return {valid: true, regex: _regex, dot};
        } catch (e) {
            return {valid: regex === ""};
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevState.regex !== this.state.regex) {
            this.selectMatch(null);
        }
    }

    highlightMatches(selectedIndex) {
        const decorations = [];
        let i = 0;
        resetDecorator();
        this.matchesPositions.forEach(([start, end]) => {
            const selected = i === selectedIndex ? " selectedMatch" : "";
            i+=1;
            const s = this.editor.getModel().getPositionAt(start);
            const e = this.editor.getModel().getPositionAt(end);
            const color = getDecorator();
            if (s.lineNumber === e.lineNumber) {
                decorations.push({
                    range: new this.monaco.Range(s.lineNumber, s.column, e.lineNumber, e.column),
                    options: {
                        className: color + selected,
                    }
                });
            } else {
                /**
                 * Monaco doesn't expand the highlight if the range is a multiline.  
                 * (isWholeLine does expand, but it expands too much, even to text before the range starts) 
                 * 
                 * So to implement the behaviour I want, I divide it into three cases:
                 * - First line: It begines in (s.lineNumber, s.column) and must fill the remaining line space. This is done with the css class 'completeLine'
                 * - Last line: It begins in (e.lineNumber, 0) and ends in (e.lineNumber, column)
                 * - Middle lines: The whole line should be highlighted. This is done with 'isWholeLine'
                 */
                decorations.push({
                    range: new this.monaco.Range(s.lineNumber, s.column, s.lineNumber, s.column+1 /*The completeLine takes charge of filling the rest of the line */),
                    options: {
                        className: `${color} completeLine` + selected,
                    }
                });
                for (let i = s.lineNumber + 1 ; i < e.lineNumber; i++) {
                    decorations.push({
                        range: new this.monaco.Range(i, 0, i, 1 /* The wholeLine expands the rest of the line */),
                        options: {
                            isWholeLine: true,
                            className: color + selected,
                        }
                    });
                }
                decorations.push({
                    range: new this.monaco.Range(e.lineNumber, 0, e.lineNumber, e.column),
                    options: {
                        className: color + selected, 
                    }
                });

            }
        });
        if (this.editor)
            this.decorator = this.editor.deltaDecorations(this.decorator, decorations);
    }

    selectMatch(i) {
        this.resultComponent.current.setGroup(i);
        this.highlightMatches(i);
    }

    findClickedMatch(x) {
        let i = 0;
        for (const [start, end] of this.matchesPositions) {
            const s = this.editor.getModel().getPositionAt(start);
            const e = this.editor.getModel().getPositionAt(end);
            if (new this.monaco.Range(s.lineNumber, s.column, e.lineNumber, e.column).containsPosition(x.position)) {
               return i;
            }
            i++;
        }
        return null;
    }

    render() {
        const {valid, regex, dot} = this.parseRegex(this.state.regex);
        let diagram = null, matches = [];
        this.matchesPositions = [];
        if(valid && regex) {
            diagram = this.state.regex  !== "" ? <VizWrapper dot={dot}></VizWrapper> : <div/>; 

            if (this.state.string !== "") {
                matches = regex.findAllMatches(this.state.string);
                matches.forEach(x => this.matchesPositions.push([x.start, x.end])); 
            }
        } 

        const editorDidMount = (editor, monaco) => {
            defineAndSetTheme(monaco);
            this.editor = editor;
            this.monaco = monaco;
            this.editor.onDidChangeCursorPosition((x) => {
                const i = this.findClickedMatch(x);
                this.selectMatch(i);
            })
          }

        this.highlightMatches(this.resultComponent.current ? this.resultComponent.current.getGroup() : 0);

        const result = <div class="resultSection">
            <h5 id="resultHeader">Result</h5>
                <ResultComponent ref={this.resultComponent} matches={matches}></ResultComponent>
            </div>;
        return <div id="page">
            <Navbar className="navBar" bg="dark" variant="dark">
                <Navbar.Brand className="logo">Regex Engine {<div class="versionLabel">{process.env.VERSION}</div>}</Navbar.Brand>
                <Nav>
                <Nav.Link href="./animation.html">Animation</Nav.Link>
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
                value={this.state.regex}  placeholder="((a|b)+)"
                            onChange={(x) => this.setState({regex: x.target.value,  result: null, matches: []})}
                /></InputGroup>
               
                <div id="inputResultContainer">
                    <div class="textInput">
                    <MonacoEditor
                        language="javascript"
                        theme="vs-light"
                        value={this.state.string} 
                        options={MONACO_EDITOR_OPTIONS}
                        onChange={(x) => this.setState({string: x})}
                        editorDidMount={editorDidMount}
                    />
                    </div>
                    {result}
                </div> 
            </div>
            <div class="diagramContainer">
                <div id="nfaHeader">
                    <h5 id="nfaLabel">NFA</h5>
                </div>
                {diagram}
            </div>
        </div>
    }
}