import commonjs from 'rollup-plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

const plugins = [
  external(),
  resolve(),
  commonjs(),
  replace({ SDK_VERSION: pkg.version }),
  typescript(),
];

export default [
  {
    input: 'src/index.ts',
    output: [{ file: pkg.main, format: 'cjs', sourcemap: true }],
    plugins,
  },
  {
    input: 'src/index.ts',
    output: [{ file: pkg.module, format: 'es', sourcemap: true }],
    plugins,
  },
];
