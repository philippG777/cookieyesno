import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import buble from '@rollup/plugin-buble';
import { uglify } from 'rollup-plugin-uglify';

const production = !process.env.ROLLUP_WATCH;


const devBuildConfig = {
	input: 'src/index.js',
	output: {
		file: 'dev/bundle.js',
		format: 'iife',
		sourcemap: true
	},
	plugins: [
        resolve(),
        commonjs(),
        buble()
	]
};

const productionBuildConfig = [
    {
        input: 'src/cookieyesno.js',
        output: {
            file: 'dist/cookieyesno.js',
            name: 'CookieYesNo',
            sourcemap: false,
            format: 'iife'
        },
        plugins: [
            resolve(), // so Rollup can find `ms`
            commonjs(), // so Rollup can convert `ms` to an ES module
            buble()
        ]
    },
    {
        input: 'src/cookieyesno.js',
        output: {
            file: 'dist/cookieyesno.min.js',
            name: 'CookieYesNo',
            sourcemap: false,
            format: 'iife'
        },
        plugins: [
            resolve(), // so Rollup can find `ms`
            commonjs(), // so Rollup can convert `ms` to an ES module
            buble(),
            uglify()
        ]
    },
    {
        input: 'src/cookieyesno.js',
        output: {
            file: 'dist/cookieyesno.cjs.js',
            name: 'CookieYesNo',
            sourcemap: false,
            format: 'cjs'
        },
        plugins: [
            resolve(),
            commonjs()
        ]
    }
];

export default (production)? productionBuildConfig : devBuildConfig;
