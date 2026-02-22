module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                targets: {
                    firefox: 57
                },
            },
        ],
        "@babel/preset-react"
    ]
};
