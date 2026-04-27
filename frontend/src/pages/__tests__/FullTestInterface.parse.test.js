/**
 * Syntax smoke test: ensures FullTestInterface.js parses with the
 * project's Babel preset. We use @babel/parser directly so we don't
 * need to resolve React/ESM dependencies — only syntax is checked.
 */
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

test('FullTestInterface.js parses with Babel', () => {
  const filePath = path.resolve(__dirname, '../FullTestInterface.js');
  const code = fs.readFileSync(filePath, 'utf8');
  expect(() => {
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx'],
    });
  }).not.toThrow();
});
