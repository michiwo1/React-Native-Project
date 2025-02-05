const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.assetExts = ['png', 'svg', 'ttf'];

// Exclude Node.js modules
config.resolver.blockList = [/^console$/];

module.exports = config; 