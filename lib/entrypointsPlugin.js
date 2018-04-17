const path = require('path');
const glob = require('glob');

let globBasedir;

function getEntryName(pathname, basedir, extname) {
  let name;
  if (pathname.startsWith(basedir)) {
    name = pathname.substring(basedir.length + 1);
  }
  return name;
}

class WildcardsEntryWebpackPlugin {
  static entry(wildcards, assignEntry, namePrefix) {
    if (!wildcards) {
      throw new Error(
        'please give me a wildcards path by invok WildcardsEntryWebpackPlugin.entry!'
      );
    }

    namePrefix = namePrefix ? `${namePrefix}/` : '';
    let basedir;
    let flagIndex = wildcards.indexOf('/*');

    if (flagIndex === -1) {
      flagIndex = wildcards.lastIndexOf('/');
    }
    basedir = wildcards.substring(0, flagIndex);
    const file = wildcards.substring(flagIndex + 1);

    basedir = path.resolve(process.cwd(), basedir);
    globBasedir = basedir = path.normalize(basedir);

    return () => {
      const files = glob.sync(path.resolve(basedir, file));
      const entries = {};
      let entry;
      let dirname;
      let basename;
      let pathname;
      let extname;

      for (let i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = path.normalize(path.join(dirname, basename));
        pathname = getEntryName(pathname, basedir, extname);
        entries[namePrefix + pathname] = [entry];
      }
      Object.assign(entries, assignEntry);
      return entries;
    };
  }

  apply(compiler) {
    compiler.plugin('after-compile', (compilation, callback) => {
      compilation.contextDependencies.add(globBasedir);
      callback();
    });
  }
}

module.exports = WildcardsEntryWebpackPlugin;
