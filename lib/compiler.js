var vm = require('vm');
var BEMXJSTError = require('./bemxjst/error').BEMXJSTError;
var fnToString = require('./bemxjst/utils').fnToString;

function Compiler(runtime) {
  this.runtime = runtime;
}

exports.Compiler = Compiler;

Compiler.prototype.generate = function generate(code, options) {
  if (!options) options = {};

  code = fnToString(code);

  var exportName = options.exportName || 'BEMHTML';
  var engine = options.engine || 'BEMHTML';

  var locals = this.runtime.prototype.locals;

  if (options.runtimeLint)
    code = code + ';' + require('fs')
      .readFileSync('./runtime-lint/index.js', 'utf8');

  var source = [
    '/// -------------------------------------',
    '/// --------- BEM-XJST Runtime Start ----',
    '/// -------------------------------------',
    'var ' + exportName + ' = function(module, exports) {',
    this.runtime.source + ';',
    '  return module.exports ||',
    '      exports.' + exportName + ';',
    '}({}, {});',
    '/// -------------------------------------',
    '/// --------- BEM-XJST Runtime End ------',
    '/// -------------------------------------',
    '',
    'var api = new ' + engine + '(' + JSON.stringify(options) + ');',
    '/// -------------------------------------',
    '/// ------ BEM-XJST User-code Start -----',
    '/// -------------------------------------',
    'api.compile(function(' + locals.join(', ') + ') {',
    code + ';',
    '});',
    'api.exportApply(exports);',
    '/// -------------------------------------',
    '/// ------ BEM-XJST User-code End -------',
    '/// -------------------------------------\n'
  ].join('\n');

  return source;
};

var _compile = function _compile(fn, exports) {
  try {
    fn(exports, console);
  } catch (e) {
    if (e instanceof BEMXJSTError)
      throw new BEMXJSTError(e.message);
    else
      throw e;
  }

  return exports;
};

Compiler.prototype.compile = function compile(code, options) {
  if (!options) options = {};

  var out = this.generate(code, options);

  out = '(function(exports, console) {' + out + '})';
  var exports = {};

  var fn = options.context === 'this' ?
    vm.runInThisContext(out) :
    vm.runInNewContext(out, {
      console: console,
      Error: Error,
      BEMXJSTError: BEMXJSTError });

  _compile(fn, exports);

  return exports;
};
