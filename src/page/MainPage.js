import React from "react";
import { ConversionBuilder } from "../engine/conversions";
import { CapturingNFT, NFA } from "../engine/dfa";
import parseRegex from "../grammar/parser";
import nfaToDot from "./visualization/nfaToDot";
import { VizWrapper } from "./visualization/vizwrapper";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, FormControl, InputGroup } from "react-bootstrap";
import './style.css';

export default class MainPage extends React.Component {
    constructor() {
        super();
        this.state = {regex: "", string:"", matches: [], result: null};
    }

    parseRegex(regex) {
        try {
            const ast = parseRegex(regex);
            const cb = new ConversionBuilder( () => new CapturingNFT());
            const nfa = cb.regexToNFA(ast);
            const dot = nfaToDot(nfa);
            return {valid: true, nfa, dot};
        } catch (e) {
            return {valid: regex.trim() === ""};
        }
    }

    render() {
        const {valid, nfa, dot} = this.parseRegex(this.state.regex);
        let diagram = null, resultContent = <div></div>;
        if(valid && nfa) {
            diagram = this.state.regex.trim() !== "" ? <VizWrapper dot={dot}></VizWrapper> : <div/>; 

            if (this.state.string.trim() !== "") {
                const match = nfa.compute(this.state.string);
                const matched =  match.matched(); 
                const groups = match.groups();
                const matchesComponent = Object.keys(groups).map(g => <div>Group {g}: {groups[g]}</div>);
                resultContent =  <div class="result">
                <div>Matched: {`${matched}`}</div>
                <div>Groups: {matchesComponent}</div>
            </div>;
            
            }
          
            
        } 
        const result = <div class="resultSection">
            <h5 id="resultHeader">Result</h5>
                {resultContent}
            </div>;
        return <div id="page">
            <Navbar className="navBar" bg="dark" variant="dark">
                <Navbar.Brand className="logo"> Regex Engine</Navbar.Brand>
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
                    <Form.Control
                        className="textInput"
                        as="textarea"
                        placeholder="Input text"
                        value={this.state.string} 
                        onChange={(x) => this.setState({string: x.target.value})}
                        />
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