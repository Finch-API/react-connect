import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import dts from 'rollup-plugin-dts';
import external from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url';
import replace from '@rollup/plugin-replace';

import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      external(),
      url({ exclude: ['**/*.svg'] }),
      babel({
        exclude: 'node_modules/**',
      }),
      resolve(),
      commonjs(),
      replace({
        SDK_VERSION: JSON.stringify(pkg.version), // has to be stringified somehow
      }),
    ],
  },
  {
    input: 'src/index.d.ts',
    output: [
      {
        file: pkg.types,
        format: 'es',
      },
    ],
    plugins: [dts()],
  },
];
