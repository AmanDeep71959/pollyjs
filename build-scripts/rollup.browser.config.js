import deepmerge from 'deepmerge';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import { rollup as lerna } from 'lerna-alias';
import builtins from 'rollup-plugin-node-builtins';
import createCommonConfig, { output, pkg } from './rollup.common.config';

export default function createClientConfig(options = {}, targets) {
  return deepmerge(
    createCommonConfig({
      output: deepmerge(output('umd'), { name: pkg.name }),
      plugins: [
        alias(lerna()),
        builtins(),
        babel({
          babelrc: false,
          runtimeHelpers: true,
          presets: [
            [
              'env',
              {
                modules: false,
                targets: targets || {
                  browsers: ['ie 11', 'last 2 versions', 'safari >= 7']
                }
              }
            ]
          ],
          plugins: [
            'external-helpers',
            'transform-runtime',
            ['transform-object-rest-spread', { useBuiltIns: true }]
          ],
          only: [
            'packages/@pollyjs/*/src/**',
            /* the following libs are not es5 compat. */
            'node_modules/@sindresorhus/fnv1a/**',
            'node_modules/merge-options/**'
          ],
          ignore: ['node_modules/**']
        })
      ],
      onwarn(message) {
        /* nise uses eval for strings within native fns setTimeout('alert("foo")', 10) */
        if (/nise/.test(message) && /eval/.test(message)) {
          return;
        }

        console.error(message);
      }
    }),
    options
  );
}
