module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "prettier/prettier": ["error", { semi: false, printWidth: 100 }],
    "comma-dangle": ["error", "never"]
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  plugins: ["html"]
}
