import React from 'react';

import Viz from 'viz.js';
const { Module, render } = require('viz.js/full.render.js');

export class VizWrapper extends React.Component{
    
  constructor() {
    super();
    this.state = {element: null};
    this.wrapperRef = React.createRef();
  }

  componentDidMount() {
    this.renderElement();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.dot !== this.props.dot) {
      this.renderElement();
    }
  }

  renderElement() {
    const me = this;
    var viz = new Viz({ Module, render });
    viz.renderSVGElement(this.props.dot)
    .then(function(element) {
      const e = me.wrapperRef.current;
      if (e.children.length > 0) e.removeChild(e.children[0]);
      e.appendChild(element);
    })
    .catch(error => {
      // Possibly display the error
      console.error(error);
    });
  }
  
    render() {    
     
        return <div id="diagramWrapper" >
          <div id="nfaHeader">
            <h5 id="nfaLabel">NFA</h5>
          </div>
          <div id="vizwrapper"  ref={this.wrapperRef} style={{ width:`${100*this.state.scale}%`}}>
            {this.state.element}
          </div>
          </div>
    }
}