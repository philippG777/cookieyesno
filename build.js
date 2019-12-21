var rollup = require("rollup");
var babel = require("rollup-plugin-babel");

rollup.rollup({
  input: "src/cookieyesno.js",
  plugins: [ babel() ]
}).then(function (bundle) {
  bundle.write({
    file: "dist/cookieyesno.min.js",
    format: "umd",
    name: 'cookieyesno'
  });
});
