# Logical keyframes

After installing repository dependencies, run from this directory:

```sh
pnpm exec tsx process.ts
```

Open `index.html` in a browser. The generated `output.css` contains separate LTR and RTL keyframes. Switching the root `dir` attribute changes the active animation without rebuilding CSS.

Animation compilation requires `animations: true`; the default remains disabled. This example keeps definitions and static references in one file. For separate files, inline them with `postcss-import` first. Runtime references through `var()` remain native-only and produce a warning.
