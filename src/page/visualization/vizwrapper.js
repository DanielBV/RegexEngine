import React from 'react';

import Viz from 'viz.js';
const { Module, render } = require('viz.js/full.render.js');

export class VizWrapper extends React.Component{
    
    render() {
        var viz = new Viz({ Module, render });
viz.renderSVGElement(this.props.dot)
.then(function(element) {
  document.querySelector("#vizwrapper").appendChild(element);
})
.catch(error => {
  // Possibly display the error
  console.error(error);
});
        return <div id="vizwrapper"></div>
    }
}