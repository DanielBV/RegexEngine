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

    diagramFromRegex(regex) {
        const ast = parseRegex(regex);
        const cb = new ConversionBuilder( () => new CapturingNFT());
        const nfa = cb.regexToNFA(ast);
        const dot = nfaToDot(nfa);
        return <div><VizWrapper dot={dot}></VizWrapper></div>;        
    }

    compute(regex, string) {
        const ast = parseRegex(regex);
        const cb = new ConversionBuilder( () => new CapturingNFT());
        const nfa = cb.regexToNFA(ast);
        const result = nfa.compute(string);
        this.setState({result: result.success, matches: result.GROUP_MATCHES});
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
        let diagram = null, result = null;
        if(valid && nfa) {
            diagram = this.state.regex.trim() !== "" ? <VizWrapper dot={dot}></VizWrapper> : <div/>; 

            if (this.state.string.trim() !== "") {
                const match = nfa.compute(this.state.string);
                const matched =  match.success; 
                const matches = match.GROUP_MATCHES;
                const matchesComponent = Object.values(matches).map(([group, init, end]) => <div>Group {group}: {this.state.string.substring(init,end)}</div>);
                result =  <div>
                <div>Result: {`${matched}`}</div>
                <div>Matches: {matchesComponent}</div>
            </div>;
            }
            
            
        } 
        return <div>
            <Navbar bg="dark" variant="dark">
                <Container>
                <Navbar.Brand> Regex Engine</Navbar.Brand>
                <Nav className="me-auto">
                <Nav.Link href="https://github.com/DanielBV/RegexEngine">Github</Nav.Link>
                </Nav>
                </Container>
            </Navbar>
            <Container style={{marginTop: "20px"}}>
                    <InputGroup className="mb-3">
            <div id="regexLabel">Regex:</div>
            <FormControl isInvalid={!valid} className="regexInput"
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
            value={this.state.regex}  placeholder="((a|b)+)"
                        onChange={(x) => this.setState({regex: x.target.value,  result: null, matches: []})}
            /></InputGroup>
             <Form.Control
                className="textInput"
                as="textarea"
                placeholder="Input text"
                style={{ height: '100px' }}
                value={this.state.string} 
                onChange={(x) => this.setState({string: x.target.value})}
                />
            {diagram}
            {result}
            </Container>
        </div>
    }
}