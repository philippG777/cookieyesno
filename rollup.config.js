import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

// const srcFile = (production)? 'src/cookieyesno.js' : 'src/main.js';
// const resultFile = (production)? 'dist/cookieyesno.min.js' : 'public/bundle.js';

const devBuildConfig = {
	input: 'src/main.js',
	output: {
		file: 'public/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true
	},
	plugins: [
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
		production && terser() // minify, but only in production
	]
};

const productionBuildConfig = // browser-friendly UMD build
{
    input: 'src/cookieyesno.js',
    output: {
        name: 'cookieyesno',
        file: 'dist/cookieyesno.js',
        format: 'iife',
        sourcemap: false
    },
    plugins: [
        resolve(), // so Rollup can find `ms`
        commonjs(), // so Rollup can convert `ms` to an ES module
        terser()
    ]
};

export default (production)? productionBuildConfig : devBuildConfig;
