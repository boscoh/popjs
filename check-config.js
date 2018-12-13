#!/usr/bin/env node

/**
 * Create config.js from default-config.js if not found
 */

const path = require('path')
const fs = require('fs-extra')
const configJs = path.resolve(__dirname, 'src/config.js')
const defaultConfigJs = path.resolve(__dirname, 'src/default-config.js')
if (!fs.existsSync(configJs)) {
  fs.copySync(defaultConfigJs, configJs)
}

