import { readFileSync, writeFileSync } from "node:fs";

const repoPath = "c:/Users/amuni/Desktop/josanz-proyect/josanz-erp/arquitectura_seguridad_ultra_detallada.html";
const dlPath =
  "C:/Users/amuni/Downloads/arquitectura_seguridad_ultra_detallada - copia (13).html";

let repo = readFileSync(repoPath, "utf8");
let d = readFileSync(dlPath, "utf8");

const start = repo.indexOf('<article id="estimacion-hitossprints"');
const end = repo.indexOf('<article id="capa-1"', start);
if (start < 0 || end < 0) throw new Error("repo markers not found");
const block = repo.slice(start, end);

const ds = d.indexOf('<article id="estimacion-hitossprints"');
const de = d.indexOf('<article id="capa-1"', ds);
if (ds < 0 || de < 0) throw new Error("downloads markers not found");
d = d.slice(0, ds) + block + d.slice(de);

const cssNeed = ".estimacion-bloque table.hito-table td.num";
if (!d.includes(cssNeed)) {
  const needle = `.estimacion-bloque table.hito-table th { background: #f1f5f9; color: #0f172a; font-weight: 600; }
.estimacion-bloque table.hito-table tfoot td { background: #f8fafc; font-weight: 600; color: #0f172a; }`;
  const insert = `.estimacion-bloque table.hito-table th { background: #f1f5f9; color: #0f172a; font-weight: 600; }
.estimacion-bloque table.hito-table td.num,
.estimacion-bloque table.hito-table th.num { text-align: right; white-space: nowrap; }
.estimacion-bloque table.hito-table tfoot td { background: #f8fafc; font-weight: 600; color: #0f172a; }
.estimacion-bloque table.hito-table tfoot td.muted-foot {
  font-weight: 500; font-size: 11px; color: #64748b; background: #f1f5f9;
}`;
  if (!d.includes(needle)) throw new Error("css needle missing in downloads file");
  d = d.replace(needle, insert);
}

writeFileSync(dlPath, d, "utf8");
console.log("OK", dlPath);
