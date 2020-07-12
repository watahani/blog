const glob = require("glob");
const fs = require("fs");

const regex = /\{% asset_img\s((lena)?.bmp)\s(.+?)\s%\}/gi;

const files = glob("./source/**/*.md", { nodir: true, sync: true });

let i = 0;
files.forEach(md => {
  const content = fs.readFileSync(md, "utf-8");
  const filename = md.split(/\\|\//).pop().split(".")[0];
  content.split("\n").forEach(
    line => {
      if(line.match(regex)){
        console.log(line)
        const replaced = line.replace(regex, `[](./${filename}/$3)`)
        console.log( `---> ${replaced}`);
        i++
      }
    }
  )
});

console.log(`Replace ${i} lines`)

files.forEach(md => {
  const filename = md.split(/\\|\//).pop().split(".")[0]; 
  const content = fs.readFileSync(md, "utf-8");
  const replaced = content.replace(regex, `![](./${filename}/$3)`);
  fs.writeFileSync(md, replaced);
})