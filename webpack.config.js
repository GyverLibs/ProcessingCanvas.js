module.exports = {
    entry: './ProcessingCanvas.js',
    output: {
        path: __dirname,
        filename: 'ProcessingCanvas.min.js',
        library: {
            type: 'module'
        }
    },
    experiments: {
        outputModule: true
    },
    mode: "production",
};