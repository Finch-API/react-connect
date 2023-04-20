import commonjs from 'rollup-plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

const commonPlugins = [
  external(),
  url({ exclude: ['**/*.svg'] }),
  resolve(),
  commonjs(),
  replace({
    SDK_VERSION: JSON.stringify(pkg.version), // has to be stringified somehow
  }),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      ...commonPlugins,
      typescript({
        module: 'CommonJS',
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      ...commonPlugins,
      typescript({
        module: 'ESNext',
      }),
    ],
  },
];
