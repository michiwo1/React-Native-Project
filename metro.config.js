const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.assetExts = ['png', 'svg', 'ttf'];

// Node.jsモジュールの除外設定
config.resolver.blockList = [/^console$/];

module.exports = config; 