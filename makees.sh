tsc -t ES2015 --outDir es src/*.ts
deno run -A remap_imports.js
