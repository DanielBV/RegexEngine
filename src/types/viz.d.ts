declare module "viz.js" {
    export default class Viz {
        constructor(options?: { Module?: any; render?: any });
        renderSVGElement(src: string): Promise<SVGSVGElement>;
    }
}

declare module "viz.js/full.render.js" {
    export const Module: any;
    export const render: any;
}
