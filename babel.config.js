// Only used by Jest, to transform the plain ES-module .js files ANTLR
// generates (src/grammar/generated) so Jest's CommonJS runtime can load
// them. The webpack build never uses Babel - it bundles that plain ESM
// syntax natively, and every hand-written source file is TypeScript,
// transformed by ts-jest/ts-loader instead.
module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
    ],
};
