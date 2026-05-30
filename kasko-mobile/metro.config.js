// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// SDK 54 enables package-exports resolution by default, which breaks some
// CommonJS deps (e.g. pretty-format via @expo/metro-runtime). Opt out so
// their internal relative requires (./plugins/DOMCollection) resolve.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
