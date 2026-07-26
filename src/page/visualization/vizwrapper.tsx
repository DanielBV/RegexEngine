import React from 'react';

import Viz from 'viz.js';
const { Module, render } = require('viz.js/full.render.js');

interface VizWrapperProps {
    dot: string;
}

interface VizWrapperState {
    element: React.ReactNode | null;
    scale?: number;
}

export class VizWrapper extends React.Component<VizWrapperProps, VizWrapperState>{

  wrapperRef: React.RefObject<HTMLDivElement>;

  constructor(props: VizWrapperProps) {
    super(props);
    this.state = {element: null};
    this.wrapperRef = React.createRef();
  }

  componentDidMount() {
    this.renderElement();
  }

  componentDidUpdate(prevProps: VizWrapperProps, prevState: VizWrapperState) {
    if (prevProps.dot !== this.props.dot) {
      this.renderElement();
    }
  }

  renderElement() {
    const me = this;
    var viz = new Viz({ Module, render });
    viz.renderSVGElement(this.props.dot)
    .then(function(element: SVGSVGElement) {
      const e = me.wrapperRef.current as HTMLDivElement;
      if (e.children.length > 0) e.removeChild(e.children[0]);
      e.appendChild(element);
    })
    .catch((error: any) => {
      // Possibly display the error
      console.error(error);
    });
  }

    render() {

        return <div id="diagramWrapper" >
          <div id="vizwrapper"  ref={this.wrapperRef} style={{ width:`${100*(this.state.scale as number)}%`}}>
            {this.state.element}
          </div>
          </div>
    }
}
