const fs = require("node:fs"),
  path = require("node:path"),
  acorn = require("acorn");
const p = path.posix;
const places = [
  "bookshop",
  "free-chaos-merch",
  "gossip-well",
  "mushroom-post-office",
  "newsstand",
  "not-my-fucking-fire-zine",
  "rummage-yard",
  "solve-the-wave",
  "tarot",
  "wavy-days-issue-01",
];
function toSource(s) {
  if (s === "TOWN-JOURNEYS.md") return "tools/TOWN-JOURNEYS.md";
  if (s.startsWith("tests/")) return "tools/" + s;
  if (s === "town-assets" || s.startsWith("town-assets/"))
    return s.replace("town-assets", "assets/town");
  if (s === "gobbo-weekly" || s.startsWith("gobbo-weekly/"))
    return s.replace("gobbo-weekly", "assets/newspapers");
  if (!s.includes("/") && s.endsWith(".css")) return "assets/styles/" + s;
  if (!s.includes("/") && s.endsWith(".js")) return "assets/scripts/" + s;
  if (places.some((n) => s === n || s.startsWith(n + "/")))
    return "places/" + s;
  return s;
}
function toPublic(s) {
  if (s.startsWith("places/")) return s.slice(7);
  if (s === "assets/town" || s.startsWith("assets/town/"))
    return s.replace("assets/town", "town-assets");
  if (s === "assets/newspapers" || s.startsWith("assets/newspapers/"))
    return s.replace("assets/newspapers", "gobbo-weekly");
  if (s.startsWith("assets/styles/") || s.startsWith("assets/scripts/"))
    return p.basename(s);
  return s;
}
function inventory(root, files) {
  const set = new Set([""]);
  for (const file of files) {
    set.add(file);
    let dir = p.dirname(file);
    while (dir !== ".") {
      set.add(dir);
      dir = p.dirname(dir);
    }
  }
  return set;
}
function reference(value, from, to, map, known) {
  if (
    !value ||
    value === "." ||
    value === ".." ||
    /^(?:[a-z]+:|\/|#)/i.test(value) ||
    !/[/.]/.test(value)
  )
    return value;
  const split = value.search(/[?#]/),
    head = split < 0 ? value : value.slice(0, split),
    suffix = split < 0 ? "" : value.slice(split);
  let target = p.normalize(p.join(p.dirname(from), head));
  target = target.replace(/\/$/, "");
  if (target === ".") target = "";
  let remainder = "";
  if (!known.has(target)) {
    const variable = target.indexOf("${");
    if (variable < 0) return value;
    const slash = target.lastIndexOf("/", variable);
    remainder = target.slice(slash + 1);
    target = target.slice(0, slash);
    if (!known.has(target)) return value;
  }
  let moved = map(target);
  let rel = p.relative(p.dirname(to), moved) || ".";
  if (remainder) rel += "/" + remainder;
  else if (head.endsWith("/")) rel += "/";
  if (rel === ".") rel = "./";
  return rel + suffix;
}
function css(code, from, to, map, known) {
  return code.replace(
    /url\(\s*(["']?)([^)"']+)\1\s*\)/g,
    (all, q, url) =>
      "url(" + q + reference(url, from, to, map, known) + q + ")",
  );
}
function js(code, from, to, map, known, forward) {
  const journey = p.basename(from) === "town-journey.js";
  if (journey && !forward) {
    code = code
      .replace(/\/\* layout bridge \*\/[\s\S]*?\/\* end layout bridge \*\//, "")
      .replace("new URL(layoutPath(path),root)", "new URL(path,root)")
      .replace(
        "new URL('../../',document.currentScript.src)",
        "new URL('./',document.currentScript.src)",
      )
      .replace("path==='places/'+place+'/'", "path===place+'/'");
  }
  const a = journey ? "index.html" : from,
    b = journey ? "index.html" : to;
  const edits = [];
  for (const t of acorn.tokenizer(code, { ecmaVersion: "latest" })) {
    if (t.type.label === "string") {
      const next = reference(t.value, a, b, map, known);
      if (next !== t.value)
        edits.push({ start: t.start, end: t.end, value: JSON.stringify(next) });
    } else if (t.type.label === "template") {
      const raw = code.slice(t.start, t.end);
      const next = reference(raw, a, b, map, known);
      if (next !== raw) edits.push({ start: t.start, end: t.end, value: next });
    }
  }
  for (const e of edits.reverse())
    code = code.slice(0, e.start) + e.value + code.slice(e.end);
  if (journey && forward) {
    code = code
      .replace(
        "new URL('./',document.currentScript.src)",
        "new URL('../../',document.currentScript.src)",
      )
      .replace("path===place+'/'", "path==='places/'+place+'/'");
    const bridge =
      "/* layout bridge */\nconst layoutPath=path=>path.replace(/^(bookshop|free-chaos-merch|gossip-well|mushroom-post-office|newsstand|not-my-fucking-fire-zine|rummage-yard|solve-the-wave|tarot|wavy-days-issue-01)\\//,'places/$1/');\n/* end layout bridge */\n";
    code = code
      .replace("const url=path=>", bridge + "const url=path=>")
      .replace("new URL(path,root)", "new URL(layoutPath(path),root)");
  }
  acorn.parse(code, { ecmaVersion: "latest" });
  return code;
}
function transform(code, from, to, map, known, forward) {
  if (from.endsWith(".js")) return js(code, from, to, map, known, forward);
  if (from.endsWith(".css")) return css(code, from, to, map, known);
  if (!from.endsWith(".html")) return code;
  let result = "",
    last = 0;
  for (const match of code.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)) {
    result += markup(code.slice(last, match.index), from, to, map, known);
    const start = match[0].indexOf(">") + 1,
      end = match[0].lastIndexOf("</script>");
    result +=
      markup(match[0].slice(0, start), from, to, map, known) +
      js(match[0].slice(start, end), from, to, map, known, forward) +
      match[0].slice(end);
    last = match.index + match[0].length;
  }
  return result + markup(code.slice(last), from, to, map, known);
}
function markup(s, from, to, map, known) {
  s = s.replace(
    /\b(href|src|poster|data-src)=(['"])(.*?)\2/g,
    (all, attr, q, value) =>
      attr + "=" + q + reference(value, from, to, map, known) + q,
  );
  return css(s, from, to, map, known);
}
function walk(root, dir = "") {
  const result = [];
  for (const d of fs.readdirSync(path.join(root, dir), {
    withFileTypes: true,
  })) {
    const name = p.join(dir, d.name);
    if (d.isDirectory()) result.push(...walk(root, name));
    else result.push(name);
  }
  return result;
}
function build(dest) {
  const root = path.resolve(__dirname, "..");
  dest = path.resolve(dest);
  if (dest === root || root.startsWith(dest + path.sep))
    throw Error("Output must be outside the source root");
  if (fs.existsSync(dest) && fs.readdirSync(dest).length)
    throw Error("Build output must be empty");
  const files = [
    "index.html",
    ...walk(root, "assets"),
    ...walk(root, "places"),
  ].filter((n) => p.basename(n) !== ".gitkeep");
  const known = inventory(root, files);
  for (const file of files) {
    const target = toPublic(file),
      out = path.join(dest, target);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const data = fs.readFileSync(path.join(root, file));
    fs.writeFileSync(
      out,
      /\.(html|css|js)$/.test(file)
        ? transform(data.toString("utf8"), file, target, toPublic, known, false)
        : data,
    );
  }
  fs.writeFileSync(path.join(dest, ".nojekyll"), "");
  console.log(
    "Built " + files.length + " files with the original public routes.",
  );
}
module.exports = { toSource, toPublic, inventory, reference, transform, build };
if (require.main === module)
  build(process.argv[2] || path.join(__dirname, "../_site"));
