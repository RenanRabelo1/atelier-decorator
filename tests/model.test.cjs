const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const model = require('../model.js');

const plain = (value) => JSON.parse(JSON.stringify(value));
const pieceIds = ['camisa', 'calca', 'botas', 'chapeu'];

test('catálogo tradicional contém exatamente as 16 combinações e classes distintas', () => {
  assert.deepEqual(model.PECAS.map((piece) => piece.id), pieceIds);
  assert.equal(model.COMBINACOES.length, 16);
  assert.equal(new Set(model.COMBINACOES.map((item) => item.Tipo)).size, 16);
  for (let mask = 0; mask < 16; mask += 1) {
    const expected = pieceIds.filter((_, index) => mask & (1 << index));
    const combination = model.COMBINACOES[mask];
    assert.equal(combination.id, mask);
    assert.deepEqual(combination.pecas, expected);
    assert.equal(combination.classe, combination.Tipo.name);
    assert.equal(model.getCombination([...expected].reverse()), combination);
    assert.ok(combination.nome.length > 0);
    const traditional = model.createTraditional(mask, 'pele de teste');
    const decorated = model.createDecorated(expected, 'pele de teste');
    assert.ok(traditional instanceof combination.Tipo);
    assert.deepEqual(traditional.visual(), { pele: 'pele de teste', pecas: expected });
    assert.deepEqual(decorated.visual(), traditional.visual());
  }
});

test('decoradores mantêm o componente e delegam visual()', () => {
  let calls = 0;
  const originalVisual = { pele: 'escura', pecas: [] };
  const component = { visual() { calls += 1; return originalVisual; } };
  const wrapper = new model.RoupaDecorator(component);
  assert.equal(wrapper.componente, component);
  assert.equal(wrapper.visual(), originalVisual);
  assert.equal(calls, 1);
  const dressed = new model.CamisaDecorator(wrapper);
  assert.equal(dressed.componente, wrapper);
  assert.deepEqual(dressed.visual(), { pele: 'escura', pecas: ['camisa'] });
  assert.equal(calls, 2);
  assert.deepEqual(originalVisual.pecas, []);
});

test('cadeia preserva a ordem dos cliques e remove por reconstrução', () => {
  const selected = ['chapeu', 'botas', 'camisa'];
  const original = model.createDecorated(selected, 'oliva');
  assert.deepEqual(original.visual().pecas, selected);
  assert.ok(original instanceof model.CamisaDecorator);
  assert.ok(original.componente instanceof model.BotasDecorator);
  assert.ok(original.componente.componente instanceof model.ChapeuDecorator);
  assert.ok(original.componente.componente.componente instanceof model.Personagem);
  const remaining = selected.filter((id) => id !== 'botas');
  const removed = model.createDecorated(remaining, 'oliva');
  assert.deepEqual(removed.visual(), { pele: 'oliva', pecas: ['chapeu', 'camisa'] });
  assert.deepEqual(original.visual().pecas, selected);
  assert.deepEqual(model.createDecorated([], 'oliva').visual(), { pele: 'oliva', pecas: [] });
  assert.deepEqual(model.createTraditional(0, 'oliva').visual(), { pele: 'oliva', pecas: [] });
});

test('trocar a pele não altera as peças e visual() não expõe arrays internos', () => {
  const selected = ['botas', 'calca'];
  const first = model.createDecorated(selected, 'clara');
  const second = model.createDecorated(selected, 'escura');
  const visible = second.visual();
  visible.pecas.push('camisa');
  assert.deepEqual(first.visual(), { pele: 'clara', pecas: selected });
  assert.deepEqual(second.visual(), { pele: 'escura', pecas: selected });
  assert.deepEqual(selected, ['botas', 'calca']);
  assert.deepEqual(new model.Personagem().visual(), { pele: 'clara', pecas: [] });
});

test('entrada inválida é rejeitada sem gerar uma combinação silenciosa', () => {
  for (const invalid of [null, 'camisa', {}, ['capa'], ['camisa', 'camisa']]) {
    assert.throws(() => model.createDecorated(invalid));
    assert.throws(() => model.getCombination(invalid));
  }
  for (const invalid of [-1, 16, 0.5, NaN, '1', undefined]) {
    assert.throws(() => model.createTraditional(invalid));
  }
  assert.throws(() => new model.RoupaDecorator(null));
  assert.throws(() => new model.RoupaDecorator({}));
  assert.throws(() => new model.Personagem({}));
  assert.throws(() => model.generatedCode('desconhecido', [], 'clara', 'montagem'));
  assert.throws(() => model.generatedCode('decorator', [], 'clara', 'desconhecida'));
  assert.throws(() => model.generatedCode('decorator', ['capa'], 'clara', 'estrutura'));
});

test('código de estrutura executa sozinho para todas as combinações nos dois modos', () => {
  const skin = 'teste "especial"\ncom quebra';
  for (const combination of model.COMBINACOES) {
    const ids = [...combination.pecas].reverse();
    for (const mode of ['tradicional', 'decorator']) {
      const source = model.generatedCode(mode, ids, skin, 'estrutura');
      const result = plain(vm.runInNewContext(source));
      const actual = mode === 'decorator'
        ? model.createDecorated(ids, skin)
        : model.createTraditional(combination.id, skin);
      assert.deepEqual(result, actual.visual(), `${mode}: ${combination.id}`);
      assert.match(source, /class Personagem\b/);
      assert.match(source, /visual\(\)/);
    }
  }
});

test('código da montagem usa as mesmas classes e ordem do modelo real', () => {
  const ids = ['chapeu', 'camisa', 'botas'];
  const decoratedSource = model.generatedCode('decorator', ids, 'media', 'montagem');
  assert.ok(decoratedSource.indexOf('new ChapeuDecorator') < decoratedSource.indexOf('new CamisaDecorator'));
  assert.ok(decoratedSource.indexOf('new CamisaDecorator') < decoratedSource.indexOf('new BotasDecorator'));
  assert.deepEqual(plain(vm.runInNewContext(decoratedSource, { ...model })), model.createDecorated(ids, 'media').visual());
  const traditionalSource = model.generatedCode('tradicional', ids, 'media', 'montagem');
  assert.match(traditionalSource, /new PersonagemComCamisaBotasChapeu\("media"\)/);
  assert.deepEqual(plain(vm.runInNewContext(traditionalSource, { ...model })), model.createTraditional(13, 'media').visual());
});

test('script clássico publica AtelierModel sem depender de Node ou DOM', () => {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'model.js'), 'utf8'), sandbox);
  assert.equal(typeof sandbox.window.AtelierModel.createDecorated, 'function');
  assert.deepEqual(plain(sandbox.window.AtelierModel.createDecorated(['camisa'], 'media').visual()), {
    pele: 'media', pecas: ['camisa'],
  });
});
