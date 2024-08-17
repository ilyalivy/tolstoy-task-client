export default {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    extensionsToTreatAsEsm: ['.jsx',],
    testEnvironment: 'jsdom',
};
