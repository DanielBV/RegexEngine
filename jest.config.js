module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.jsx?$": "babel-jest"
    },
    moduleNameMapper: {
        "\\.css$": "<rootDir>/__mocks__/styleMock.js"
    },
    testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.tsx?$"
};
