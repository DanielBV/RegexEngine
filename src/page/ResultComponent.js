import React from "react";



export default class ResultComponent extends React.Component {


    constructor() {
        super();
        this.state = {currentGroup: null};
    }

    setGroup(i) {
        this.setState({currentGroup: i});
    }

    getGroup() {
        return this.state.currentGroup;
    }

    render() {
        const matches = this.props.matches;
        const match = matches[this.state.currentGroup];
        const matched =  match !== null && match !== undefined;
        const groups = matched ? match.groups() : {};
        const matchesComponent = Object.keys(groups).map(g => <div><span class="groupLabel">Group {g}: </span><span class="groupText">{groups[g]}</span></div>);
        return <div class="result">
            <div class="resultTutorial">Click a match to display the groups</div>
            {matched ? matchesComponent :null}
        </div>;
    }

}
