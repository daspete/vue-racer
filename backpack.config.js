module.exports = {
    webpack: (config, options, webpack) => {
        // Perform customizations to config
        // Important: return the modified config

        // changes the name of the entry point from index -> main.js
        config.entry.main = [
            './tools/spritemaker.js'
        ]

        return config
    }
}