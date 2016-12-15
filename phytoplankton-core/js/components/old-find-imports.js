function findImports(str, basepath) {
    var url = configDir + styleExt + '/';
    var regex = /(?:(?![\/*]])[^\/* ]|^ *)@import ['"](.*?)['"](?![^*]*?\*\/)/g;
    var match, matches = [];
    while ((match = regex.exec(str)) !== null) {
        matches.push(match[1]);
    }
    _.each(matches, function(match) {
        // Check if it's a filename
        var path = match.split('/');
        var filename, fullpath, _basepath = basepath;
        if (path.length > 1) {
            filename = path.pop();
            var something, basepathParts;
            if (_basepath) {
                 basepathParts = _basepath.split('/');
            }
            while ((something = path.shift()) === '..') {
                 basepathParts.pop();
            }
            if (something) {
                 path.unshift(something);
            }
            _basepath = (basepathParts ? basepathParts.join('/') + '/' : '') + path.join('/');
        } else {
            filename = path.join('');
        }
        filename = '_' + filename + '.' + styleExt;
        fullpath = _basepath + '/' + filename;

        var importContent = Module.read(url + fullpath);
        Sass.writeFile(match, importContent);

        findImports(importContent, _basepath);
    });
}

configPath = configPath.substr(0, configPath.lastIndexOf('/'));
// Recursive function to find all @imports.
findImports(stylesheet, configPath);