import external from 'rollup-plugin-peer-deps-external';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

const plugins = [
  external(),
  replace({ SDK_VERSION: pkg.version }),
  typescript({ sourceRoot: '.' }),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true },
    ],
    plugins,
  },
];
