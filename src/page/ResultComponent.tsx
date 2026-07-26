import React from "react";
import { Match } from "../engine/regex";



interface ResultComponentProps {
    matches: Match[];
}

interface ResultComponentState {
    currentGroup: number | null;
}

export default class ResultComponent extends React.Component<ResultComponentProps, ResultComponentState> {


    constructor(props: ResultComponentProps) {
        super(props);
        this.state = {currentGroup: null};
    }

    setGroup(i: number | null) {
        this.setState({currentGroup: i});
    }

    getGroup(): number | null {
        return this.state.currentGroup;
    }

    render() {
        const matches = this.props.matches;
        const match = this.state.currentGroup !== null ? matches[this.state.currentGroup] : undefined;
        const matched =  match !== null && match !== undefined;
        const groups = matched ? match.groups() : {};
        const matchesComponent = Object.keys(groups).map(g => <div><span className="groupLabel">Group {g}: </span><span className="groupText">{groups[g]}</span></div>);
        return <div className="result">
            <div className="resultTutorial">Click a match to display the groups</div>
            {matched ? matchesComponent :null}
        </div>;
    }

}
