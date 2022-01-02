import React from "react";
import ReactDOM from "react-dom";
import parseRegex from "./grammar/parser";

console.log(parseRegex("aeae"));
const App = () => <div>Hello world</div>;

ReactDOM.render(<App/>, document.getElementById("root"));