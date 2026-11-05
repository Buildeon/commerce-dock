export default [
  {
    ignores: ["node_modules/**", "dist/**"]
  },
  {
    files: ["src/**/*.js", "test/**/*.js", "test/**/*.mjs", "scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        crypto: "readonly",
        navigator: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        AbortController: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        Uint8Array: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLSelectElement: "readonly",
        HTMLTextAreaElement: "readonly",
        Blob: "readonly",
        FileReader: "readonly",
        performance: "readonly",
        Buffer: "readonly",
        btoa: "readonly",
        atob: "readonly",
        CustomEvent: "readonly",
        EventTarget: "readonly",
        prompt: "readonly",
        confirm: "readonly",
        module: "readonly",
        process: "readonly",
        globalThis: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error"
    }
  }
];
