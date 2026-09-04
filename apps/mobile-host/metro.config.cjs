const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: path.resolve(projectRoot, 'shims/crypto.js'),
  'node:crypto': path.resolve(projectRoot, 'shims/crypto.js'),
  stream: path.resolve(projectRoot, 'shims/empty.js'),
  'node:stream': path.resolve(projectRoot, 'shims/empty.js'),
  buffer: path.resolve(projectRoot, 'shims/empty.js'),
  'node:buffer': path.resolve(projectRoot, 'shims/empty.js'),
};

config.resolver.sourceExts = [...new Set([...(config.resolver.sourceExts ?? []), 'mjs', 'cjs'])];

module.exports = config;
