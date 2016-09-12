var fixtures = require('./fixtures')('bemhtml');
var test = fixtures.test;

describe('Modes addMix', function() {
  it('should support addMix', function() {
    test(function() {
      block('button')(
        addMix()(function() {
          return 'tmpls';
        })
      );
    },
    { block: 'button', mix: { block: 'bemjson' } },
    '<div class="button bemjson tmpls"></div>');
  });

  it('should support addMix with literal', function() {
    test(function() {
      block('button').addMix()('tmpls');
    },
    { block: 'button', mix: { block: 'bemjson' } },
    '<div class="button bemjson tmpls"></div>');
  });

  it('should accumulate result', function() {
    test(function() {
      block('button')(
        addMix()(function() {
          return 'tmpls';
        }),
        addMix()(function() {
          return 'tmpls1';
        })
      );
    },
    { block: 'button', mix: { block: 'bemjson' } },
    '<div class="button bemjson tmpls tmpls1"></div>');
  });

  it('should extend mix', function() {
    test(function() {
      block('button').mix()({ block: 'templ_1' });
      block('button').addMix()({ block: 'templ_2' });
    },
    { block: 'button', mix: { block: 'bemjson' } },
    '<div class="button templ_1 templ_2"></div>');
  });
});
