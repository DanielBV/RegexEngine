import React from "react";
import { regexToNFA } from "../engine/conversions";
import parseRegex from "../grammar/parser";
import nfaToDot from "./visualization/nfaToDot";
import { VizWrapper } from "./visualization/vizwrapper";

export default class MainPage extends React.Component {
    constructor() {
        super();
        this.state = {regex: false, tmpRegex: ""};
    }

    diagramFromRegex(regex) {
        const ast = parseRegex(regex);
        console.log(ast);
        const nfa = regexToNFA(ast);
        const dot = nfaToDot(nfa);
        return <div><VizWrapper dot={dot}></VizWrapper></div>;        
    }

    render() {
        const Diagram = () =>  this.state.regex ? this.diagramFromRegex(this.state.regex) : <div/>; 
        return <div>
            <input type="text" value={this.state.tmpRegex} 
                onChange={(x) => this.setState({tmpRegex: x.target.value})}></input>
            <input type="button" value="Compile" 
                onClick={() => this.setState({regex: this.state.tmpRegex})}></input>
            <Diagram></Diagram>
        </div>

    }
}