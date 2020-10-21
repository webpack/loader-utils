module.exports = {
  root: true,
  plugins: ["node"],
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "prettier",
  ],
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  rules: {
    "no-template-curly-in-string": "error",
    "no-caller": "error",
    yoda: "error",
    eqeqeq: "error",
    "no-extra-bind": "error",
    "no-process-exit": "error",
    "no-loop-func": "error",
    "no-console": "off",
    "valid-jsdoc": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "object-shorthand": "error",
  },
};