import React from "react";
import { ConversionBuilder } from "../engine/conversions";
import { CapturingNFT, NFA } from "../engine/dfa";
import parseRegex from "../grammar/parser";
import nfaToDot from "./visualization/nfaToDot";
import { VizWrapper } from "./visualization/vizwrapper";

export default class MainPage extends React.Component {
    constructor() {
        super();
        this.state = {regex: false, tmpRegex: "", string:"", matches: [], result: null};
    }

    diagramFromRegex(regex) {
        const ast = parseRegex(regex);
        const cb = new ConversionBuilder( () => new CapturingNFT());
        const nfa = cb.regexToNFA(ast);
        console.log(nfa);
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

    render() {
        const Diagram = () =>  this.state.regex ? this.diagramFromRegex(this.state.regex) : <div/>; 
        const matches = Object.values(this.state.matches).map(([group, init, end]) => <div>Group {group}: {this.state.string.substring(init,end)}</div>);
        const Result = () => this.state.result !== null ? <div>
            <div>Result: {`${this.state.result}`}</div>
            <div>Matches: {matches}</div>
        </div>  : null;
        return <div>
            <input type="text" value={this.state.tmpRegex} 
                onChange={(x) => this.setState({tmpRegex: x.target.value})}></input>
            <input type="button" value="Compile" 
                onClick={() => this.setState({regex: this.state.tmpRegex, result: null, matches: []})}></input>
            <input type="text" value={this.state.string} 
            onChange={(x) => this.setState({string: x.target.value})}></input>
            <input type="button" value="Run" 
                onClick={() => console.log(this.compute(this.state.regex, this.state.string))}></input>
            <Diagram></Diagram>
            <Result></Result>
        </div>
    }
}