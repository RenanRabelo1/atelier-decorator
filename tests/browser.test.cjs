const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const vm = require('node:vm');
const { chromium } = require('C:/Users/renpo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output', 'iterate');
const entry = path.join(root, 'Index.html');
const pieceIds = ['camisa', 'calca', 'botas', 'chapeu'];
const names = { camisa: 'CamisaDecorator', calca: 'CalcaDecorator', botas: 'BotasDecorator', chapeu: 'ChapeuDecorator' };
let browser;

before(async () => {
  assert.ok(fs.existsSync(entry), 'Index.html precisa existir e abrir diretamente por file://');
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
});

after(async () => { if (browser) await browser.close(); });

async function openGame(viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, offline: true });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  const external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', (request) => { if (/^https?:/i.test(request.url())) external.push(request.url()); });
  await page.goto(pathToFileURL(entry).href);
  await page.waitForFunction(() => typeof window.render_game_to_text === 'function');
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).assetsReady === true);
  return {
    page,
    async finish() {
      await context.close();
      assert.deepEqual(external, [], 'o jogo não deve solicitar recursos pela internet');
      assert.deepEqual(errors, [], 'o navegador deve permanecer sem erros');
    },
  };
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function start(page, mode) {
  await page.locator(`#start-${mode}`).click();
  assert.equal(await page.locator('#game-screen').isVisible(), true);
  assert.equal(await page.locator('#menu-screen').isVisible(), false);
  const result = await state(page);
  assert.equal(result.screen, 'game');
  assert.equal(result.mode, mode);
  return result;
}

async function code(page) {
  return page.locator('#code-content').innerText();
}

async function tabTo(page, selector, limit = 60) {
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press('Tab');
    if (await page.locator(selector).evaluate((element) => element === document.activeElement)) return;
  }
  assert.fail(`controle ${selector} não foi alcançado usando Tab`);
}

test('menu abre offline por file:// com dois modos e contrato de automação', async () => {
  const run = await openGame();
  try {
    const { page } = run;
    assert.equal(await page.locator('#menu-screen').isVisible(), true);
    assert.equal(await page.locator('#game-screen').isVisible(), false);
    for (const mode of ['tradicional', 'decorator']) {
      assert.equal(await page.locator(`#start-${mode}`).isVisible(), true);
      assert.equal(await page.locator(`#start-${mode}`).isEnabled(), true);
    }
    const initial = await state(page);
    assert.equal(initial.screen, 'menu');
    assert.equal(initial.assetsReady, true);
    const advanced = await page.evaluate(async () => JSON.parse(await window.advanceTime(250)));
    assert.deepEqual(advanced, initial, 'o personagem idle não deve mudar durante o avanço do tempo');
    await page.screenshot({ path: path.join(output, 'menu-desktop.png'), fullPage: true });
  } finally { await run.finish(); }
});

test('tradicional permite vestir e remover todas as 16 combinações concretas', async () => {
  const run = await openGame();
  try {
    const { page } = run;
    await start(page, 'tradicional');
    assert.equal(await page.locator('[data-combination]').count(), 16);
    const classes = new Set();
    for (let mask = 0; mask < 16; mask += 1) {
      const button = page.locator(`[data-combination="${mask}"]`);
      await button.click();
      const current = await state(page);
      assert.deepEqual(current.pecas, pieceIds.filter((_, index) => mask & (1 << index)));
      assert.equal(current.combinationId, mask);
      assert.equal(await button.getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('[data-combination][aria-pressed="true"]').count(), 1);
      classes.add(current.classe);
      assert.ok((await code(page)).includes(`new ${current.classe}(`), 'a montagem deve instanciar a classe concreta selecionada');
      assert.doesNotMatch(await code(page), /new \w+Decorator\(/);
    }
    assert.equal(classes.size, 16);
    await page.screenshot({ path: path.join(output, 'tradicional-desktop.png'), fullPage: true });
    await page.locator('#reset-outfit').click();
    assert.deepEqual((await state(page)).pecas, []);
    assert.equal((await state(page)).combinationId, 0);
  } finally { await run.finish(); }
});

test('decorator veste por camada, respeita a ordem e remove uma peça mantendo as demais', async () => {
  const run = await openGame();
  try {
    const { page } = run;
    await start(page, 'decorator');
    assert.equal(await page.locator('[data-piece]').count(), 4);
    assert.equal(await page.locator('[data-combination]').count(), 0);
    const canvas = page.locator('#character-canvas');
    let previous = await canvas.screenshot();
    const sequence = ['chapeu', 'camisa', 'botas'];
    for (let index = 0; index < sequence.length; index += 1) {
      const id = sequence[index];
      await page.locator(`[data-piece="${id}"]`).click();
      const current = await state(page);
      assert.deepEqual(current.pecas, sequence.slice(0, index + 1));
      assert.deepEqual(current.chain, [...sequence.slice(0, index + 1)].reverse().map((piece) => names[piece]).concat('Personagem'));
      assert.equal(await page.locator(`[data-piece="${id}"]`).getAttribute('aria-pressed'), 'true');
      const next = await canvas.screenshot();
      assert.notDeepEqual(next, previous, `${id} deve alterar o personagem desenhado`);
      previous = next;
    }
    const source = await code(page);
    assert.ok(source.indexOf('new ChapeuDecorator') < source.indexOf('new CamisaDecorator'));
    assert.ok(source.indexOf('new CamisaDecorator') < source.indexOf('new BotasDecorator'));
    await page.locator('[data-piece="camisa"]').click();
    const removed = await state(page);
    assert.deepEqual(removed.pecas, ['chapeu', 'botas']);
    assert.deepEqual(removed.chain, ['BotasDecorator', 'ChapeuDecorator', 'Personagem']);
    assert.doesNotMatch(await code(page), /new CamisaDecorator/);
    assert.equal(await page.locator('[data-piece="camisa"]').getAttribute('aria-pressed'), 'false');
    await page.locator('[data-piece="calca"]').click();
    await page.locator('[data-piece="camisa"]').click();
    await page.screenshot({ path: path.join(output, 'decorator-desktop.png'), fullPage: true });
    await page.locator('#reset-outfit').click();
    assert.deepEqual((await state(page)).pecas, []);
    assert.deepEqual((await state(page)).chain, ['Personagem']);
  } finally { await run.finish(); }
});

test('tons de pele e troca de modo preservam o conjunto de roupas', async () => {
  const run = await openGame();
  try {
    const { page } = run;
    await start(page, 'decorator');
    await page.locator('[data-piece="botas"]').click();
    await page.locator('[data-piece="camisa"]').click();
    const selected = ['botas', 'camisa'];
    const skins = page.locator('[data-skin]');
    assert.ok(await skins.count() >= 2, 'devem existir pelo menos dois tons de pele');
    let firstImage;
    let lastImage;
    for (let index = 0; index < await skins.count(); index += 1) {
      const swatch = skins.nth(index);
      const id = await swatch.getAttribute('data-skin');
      await swatch.click();
      const current = await state(page);
      assert.equal(current.pele, id);
      assert.deepEqual(current.pecas, selected);
      assert.equal(await swatch.getAttribute('aria-pressed'), 'true');
      assert.ok((await code(page)).includes(JSON.stringify(id)));
      const frame = await page.locator('#character-canvas').screenshot();
      if (index === 0) firstImage = frame;
      lastImage = frame;
    }
    assert.notDeepEqual(lastImage, firstImage, 'a troca do tom de pele deve aparecer no personagem');
    const skin = (await state(page)).pele;
    await page.locator('[data-mode="tradicional"]').click();
    const traditional = await state(page);
    assert.equal(traditional.mode, 'tradicional');
    assert.deepEqual([...traditional.pecas].sort(), [...selected].sort());
    assert.equal(traditional.pele, skin);
    assert.equal(traditional.combinationId, 5);
    assert.equal(await page.locator('[data-combination="5"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-mode="decorator"]').click();
    const decorated = await state(page);
    assert.equal(decorated.mode, 'decorator');
    assert.deepEqual([...decorated.pecas].sort(), [...selected].sort());
    assert.equal(decorated.pele, skin);
  } finally { await run.finish(); }
});

test('código exibido na estrutura executa e reproduz o personagem nos dois modos', async () => {
  const run = await openGame();
  try {
    const { page } = run;
    await start(page, 'decorator');
    await page.locator('[data-piece="botas"]').click();
    await page.locator('[data-piece="chapeu"]').click();
    for (const mode of ['decorator', 'tradicional']) {
      await page.locator(`[data-mode="${mode}"]`).click();
      await page.locator('#tab-estrutura').click();
      const source = await code(page);
      const current = await state(page);
      assert.match(source, /class Personagem\b/);
      const result = JSON.parse(JSON.stringify(vm.runInNewContext(source)));
      assert.deepEqual(result, { pele: current.pele, pecas: current.pecas });
      if (mode === 'decorator') {
        assert.match(source, /class RoupaDecorator/);
        assert.match(source, /componente\.visual\(\)/);
      } else {
        assert.doesNotMatch(source, /class RoupaDecorator/);
      }
      await page.locator('#tab-montagem').click();
      assert.ok((await code(page)).length < source.length);
    }
  } finally { await run.finish(); }
});

test('menu, roupas e retorno são acessíveis com Tab e Enter', async () => {
  const run = await openGame();
  try {
    const { page } = run;
    await tabTo(page, '#start-decorator');
    assert.equal(await page.locator('#start-decorator').evaluate((element) => element.matches(':focus-visible')), true);
    const focusStyle = await page.locator('#start-decorator').evaluate((element) => {
      const style = getComputedStyle(element);
      return { outline: style.outlineStyle, width: Number.parseFloat(style.outlineWidth), shadow: style.boxShadow };
    });
    assert.ok((focusStyle.outline !== 'none' && focusStyle.width > 0) || focusStyle.shadow !== 'none', 'o foco deve ter indicação visual');
    await page.keyboard.press('Enter');
    assert.equal((await state(page)).mode, 'decorator');
    await tabTo(page, '[data-piece="camisa"]');
    await page.keyboard.press('Enter');
    assert.deepEqual((await state(page)).pecas, ['camisa']);
    await tabTo(page, '#reset-outfit');
    await page.keyboard.press('Enter');
    assert.deepEqual((await state(page)).pecas, []);
    await tabTo(page, '#back-home');
    await page.keyboard.press('Enter');
    assert.equal((await state(page)).screen, 'menu');
    assert.equal(await page.locator('#menu-screen').isVisible(), true);
  } finally { await run.finish(); }
});

test('390 × 844 mantém conteúdo utilizável sem transbordamento horizontal', async () => {
  const run = await openGame({ width: 390, height: 844 });
  try {
    const { page } = run;
    for (const screen of ['menu', 'decorator', 'tradicional']) {
      if (screen === 'decorator') await start(page, screen);
      if (screen === 'tradicional') await page.locator('[data-mode="tradicional"]').click();
      const size = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      assert.ok(size.scroll <= size.width + 1, `${screen}: conteúdo excede a largura (${size.scroll}/${size.width})`);
      if (screen === 'decorator') {
        await page.locator('[data-piece="camisa"]').click();
        await page.locator('[data-piece="chapeu"]').click();
        assert.deepEqual((await state(page)).pecas, ['camisa', 'chapeu']);
      }
      if (screen === 'tradicional') {
        await page.locator('[data-combination="15"]').click();
        assert.deepEqual((await state(page)).pecas, pieceIds);
      }
      await page.screenshot({ path: path.join(output, `${screen}-mobile.png`), fullPage: true });
    }
  } finally { await run.finish(); }
});
