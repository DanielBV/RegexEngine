import React from "react";
import { ConversionBuilder } from "../engine/conversions";
import { NFA } from "../engine/dfa";
import parseRegex from "../grammar/parser";
import nfaToDot from "./visualization/nfaToDot";
import { VizWrapper } from "./visualization/vizwrapper";

export default class MainPage extends React.Component {
    constructor() {
        super();
        this.state = {regex: false, tmpRegex: "", string:""};
    }

    diagramFromRegex(regex) {
        const ast = parseRegex(regex);
        const cb = new ConversionBuilder( () => new NFA());
        const nfa = cb.regexToNFA(ast);
        const dot = nfaToDot(nfa);
        return <div><VizWrapper dot={dot}></VizWrapper></div>;        
    }

    compute(regex, string) {
        const ast = parseRegex(regex);
        const cb = new ConversionBuilder( () => new NFA());
        const nfa = cb.regexToNFA(ast);
        return nfa.compute(string);
    }

    render() {
        const Diagram = () =>  this.state.regex ? this.diagramFromRegex(this.state.regex) : <div/>; 
        return <div>
            <input type="text" value={this.state.tmpRegex} 
                onChange={(x) => this.setState({tmpRegex: x.target.value})}></input>
            <input type="button" value="Compile" 
                onClick={() => this.setState({regex: this.state.tmpRegex})}></input>
            <input type="text" value={this.state.string} 
            onChange={(x) => this.setState({string: x.target.value})}></input>
            <input type="button" value="Run" 
                onClick={() => console.log(this.compute(this.state.regex, this.state.string))}></input>
            <Diagram></Diagram>
        </div>
    }
}