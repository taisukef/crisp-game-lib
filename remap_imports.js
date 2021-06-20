const map = {
  "../..//pixijs/es/pixi.v5.3.9.min.js": "https://taisukef.github.io/pixijs/es/pixi.v5.3.9.min.js",
  "../../sounds-some-sounds/sss.js": "https://taisukef.github.io/sounds-some-sounds/sss.js",
  "../../filters/es/filter-crt.js": "https://taisukef.github.io/filters/es/filter-crt.js",
  "../../filters/es/filter-advanced-bloom.js": "https://taisukef.github.io/filters/es/filter-advanced-bloom.js",
  "../../../util/mp4-capture-canvas/mcc.js": "https://taisukef.github.io/mp4-capture-canvas/mcc.js",
};

const path = "./es/";
for await (const f of Deno.readDir(path)) {
  const fn = path + f.name;
  if (!fn.endsWith(".js")) {
    continue;
  }
  const ss = (await Deno.readTextFile(fn)).split("\n");
  for (let i = 0; i < ss.length; i++) {
    const s = ss[i];
    if (s.startsWith("import ") || s.startsWith("export ")) {
      const r = s.match(/from \"(.+)\"/);
      if (r) {
        const name = r[1];
        //console.log(name);
        const mapname = map[name] || name + ".js";
        const n = s.indexOf(`"${name}"`);
        ss[i] = s.substring(0, n + 1) + mapname + s.substring(n + 1 + name.length);
        //console.log(s, ss[i])
      }
    }
  }
  await Deno.writeTextFile(fn, ss.join("\n"));
}
