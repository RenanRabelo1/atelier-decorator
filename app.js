(function () {
  'use strict';
  const M = window.AtelierModel;
  const $ = (id) => document.getElementById(id);
  const state = { screen: 'menu', mode: 'decorator', pele: 'clara', pecas: [], tab: 'montagem', assetsReady: false };
  const skins = [
    { id: 'clara', name: 'Claro', variant: '01', color: '#f8d49b' },
    { id: 'dourada', name: 'Dourado', variant: '03', color: '#eeb377' },
    { id: 'media', name: 'Médio', variant: '05', color: '#ce8a54' },
    { id: 'bronze', name: 'Bronze', variant: '06', color: '#ad6b48' },
    { id: 'escura', name: 'Escuro', variant: '07', color: '#87492e' },
    { id: 'profunda', name: 'Profundo', variant: '10', color: '#654729' }
  ];
  const basePath = 'FREE Mana Seed Character Base Demo 2.0/char_a_p1/';
  const iconPath = 'Free-Clothing-32x32-Pixel-Icons/1 Icons/';
  const icons = { camisa: 'Icon30_13.png', calca: 'Icon30_23.png', botas: 'Icon30_33.png', chapeu: 'Icon30_06.png' };
  const images = {};
  let personagem = M.createDecorated([], state.pele);
  let currentCode = '';
  let copyTimer;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function icon(id) {
    const image = element('img');
    image.src = iconPath + icons[id];
    image.alt = '';
    return image;
  }
  function announce(text) { $('live-message').textContent = text; }
  function chain() {
    const result = [];
    for (let item = personagem; item; item = item.componente) result.push(item.constructor.name);
    return result;
  }
  window.render_game_to_text = () => JSON.stringify({
    screen: state.screen, mode: state.mode, ...personagem.visual(),
    classe: personagem.constructor.name, combinationId: M.getCombination(state.pecas).id,
    chain: chain(), assetsReady: state.assetsReady
  });
  // The scene is intentionally static: there is no walking animation or timer.
  window.advanceTime = () => window.render_game_to_text();

  function drawCharacter(canvas, visual) {
    if (!state.assetsReady) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Idle: first 64x64 frame. Crop the empty margins for the display.
    const fullLayer = (image) => ctx.drawImage(image, 0, 0, 64, 64, -16, -8, 64, 64);
    fullLayer(images[visual.pele]);
    fullLayer(images.shorts);
    // Independent body regions from the fitted Mana Seed outfit.
    const regions = { camisa: [0, 34], calca: [34, 6], botas: [40, 24] };
    for (const id of ['camisa', 'calca', 'botas']) {
      if (!visual.pecas.includes(id)) continue;
      const [y, height] = regions[id];
      ctx.drawImage(images.outfit, 0, y, 64, height, -16, y - 8, 64, height);
    }
    // This pointed hat replaces the hair layer to avoid pixels protruding through it.
    if (!visual.pecas.includes('chapeu')) fullLayer(images.hair);
    if (visual.pecas.includes('chapeu')) fullLayer(images.hat);
    const clothes = visual.pecas.map((id) => M.PECAS.find((piece) => piece.id === id).nome);
    canvas.setAttribute('aria-label', 'Personagem de tom ' + visual.pele + ': ' + (clothes.join(', ') || 'sem peças adicionais'));
  }

  function buildWardrobe() {
    const container = $('wardrobe-items');
    container.replaceChildren();
    const traditional = state.mode === 'tradicional';
    container.classList.toggle('combinations', traditional);
    if (traditional) {
      for (const combination of M.COMBINACOES) {
        const button = element('button', 'combination-card');
        button.type = 'button';
        button.dataset.combination = combination.id;
        button.title = combination.classe;
        button.setAttribute('aria-label', combination.nome);
        const preview = element('span', 'combination-icons');
        if (combination.pecas.length) combination.pecas.forEach((id) => preview.append(icon(id)));
        else preview.append(element('span', 'base-icon', '♙'));
        button.append(preview, element('strong', '', combination.nome), element('small', '', 'VISUAL ' + String(combination.id + 1).padStart(2, '0')));
        button.addEventListener('click', () => {
          state.pecas = [...combination.pecas];
          render();
          announce('Combinação selecionada: ' + combination.nome + '. Classe ' + combination.classe + '.');
        });
        container.append(button);
      }
    } else {
      for (const piece of M.PECAS) {
        const button = element('button', 'piece-card');
        button.type = 'button';
        button.dataset.piece = piece.id;
        const imageBox = element('span', 'piece-icon');
        imageBox.append(icon(piece.id));
        const info = element('span', 'piece-info');
        info.append(element('small', '', piece.parte), element('strong', '', piece.nome), element('code', '', piece.classe));
        const action = element('span', 'piece-action', '+');
        action.setAttribute('aria-hidden', 'true');
        button.append(imageBox, info, action);
        button.addEventListener('click', () => togglePiece(piece.id));
        container.append(button);
      }
    }
    container.scrollTop = 0;
  }

  function togglePiece(id) {
    const removing = state.pecas.includes(id);
    state.pecas = removing ? state.pecas.filter((piece) => piece !== id) : [...state.pecas, id];
    render();
    announce(M.PECAS.find((piece) => piece.id === id).nome + (removing ? ' removida. Cadeia reconstruída com as peças restantes.' : ' adicionada como uma nova camada.'));
  }

  function renderCode() {
    currentCode = M.generatedCode(state.mode, state.pecas, state.pele, state.tab);
    const code = $('code-content');
    code.replaceChildren();
    // Tokenize before building DOM; code is always text, never executable HTML.
    const tokenPattern = /(\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:class|extends|constructor|return|const|let|new|super|this|if|throw|typeof)\b|\b[A-Z][A-Za-z]*(?:Decorator|Personagem)?\b)/g;
    for (const line of currentCode.split('\n')) {
      const row = element('span', 'code-line');
      let position = 0;
      for (const match of line.matchAll(tokenPattern)) {
        row.append(document.createTextNode(line.slice(position, match.index)));
        const token = match[0];
        const kind = token.startsWith('//') ? 'comment' : /^["']/.test(token) ? 'string' : /^[A-Z]/.test(token) ? 'class' : 'keyword';
        row.append(element('span', 'syntax-' + kind, token));
        position = match.index + token.length;
      }
      row.append(document.createTextNode(line.slice(position) || (line ? '' : '\u200b')));
      code.append(row);
    }
    // An empty row needs height, not a character that would pollute copied code.
    for (const row of code.children) if (row.textContent === '\u200b') row.textContent = '';
    for (const tab of ['montagem', 'estrutura']) {
      $('tab-' + tab).setAttribute('aria-selected', String(state.tab === tab));
      $('tab-' + tab).tabIndex = state.tab === tab ? 0 : -1;
    }
    $('code-view').setAttribute('aria-labelledby', 'tab-' + state.tab);
    $('code-filename').textContent = state.tab === 'montagem' ? 'montagem.js' : 'classes.js';
    $('visual-result').textContent = JSON.stringify(personagem.visual());

    $('chain-label').textContent = state.mode === 'decorator' ? 'DE FORA PARA DENTRO · CADA SETA ENVOLVE' : 'UMA INSTÂNCIA DA CLASSE ESCOLHIDA';
    const chainContainer = $('object-chain');
    chainContainer.replaceChildren();
    chain().forEach((name, index, array) => {
      if (index) chainContainer.append(element('span', 'chain-arrow', '→'));
      const label = name === 'Personagem' ? name : name.replace('Decorator', '');
      chainContainer.append(element('span', 'chain-node' + (index === array.length - 1 ? ' base' : ''), label));
    });
  }

  function render() {
    const traditional = state.mode === 'tradicional';
    personagem = traditional ? M.createTraditional(M.getCombination(state.pecas).id, state.pele) : M.createDecorated(state.pecas, state.pele);
    $('menu-screen').hidden = state.screen !== 'menu';
    $('game-screen').hidden = state.screen !== 'game';
    $('game-screen').classList.toggle('traditional', traditional);
    for (const button of document.querySelectorAll('[data-mode]')) button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode));
    $('mode-eyebrow').textContent = traditional ? 'HERANÇA E COMBINAÇÕES FIXAS' : 'COMPOSIÇÃO EM TEMPO DE EXECUÇÃO';
    $('game-title').textContent = traditional ? 'Um visual, uma classe inteira.' : 'Seu personagem, peça por peça.';
    $('mode-description').textContent = traditional ? 'Escolha uma combinação pronta. Cada visual tem sua própria classe.' : 'Escolha uma peça. Observe o personagem e o código ganharem uma camada.';
    $('wardrobe-title').textContent = traditional ? 'As combinações' : 'As peças';
    $('wardrobe-count').textContent = traditional ? '16' : '4';
    $('wardrobe-description').textContent = traditional ? 'Todas as possibilidades para as quatro peças.' : 'Clique para vestir. Clique de novo para tirar.';
    $('wardrobe-insight').textContent = traditional ? '4 peças opcionais = 16 possibilidades. Cada visual precisa de uma classe concreta neste modelo.' : 'As mesmas 16 possibilidades, compostas com apenas quatro decoradores de roupa.';
    for (const button of document.querySelectorAll('[data-piece]')) {
      const selected = state.pecas.includes(button.dataset.piece);
      button.setAttribute('aria-pressed', String(selected));
      button.querySelector('.piece-action').textContent = selected ? '✓' : '+';
      button.setAttribute('aria-label', (selected ? 'Tirar ' : 'Vestir ') + M.PECAS.find((p) => p.id === button.dataset.piece).nome);
    }
    const combination = M.getCombination(state.pecas);
    for (const button of document.querySelectorAll('[data-combination]')) button.setAttribute('aria-pressed', String(Number(button.dataset.combination) === combination.id));
    for (const button of document.querySelectorAll('[data-skin]')) button.setAttribute('aria-pressed', String(button.dataset.skin === state.pele));
    $('piece-count').textContent = state.pecas.length + ' de 4 peças';
    const outfit = $('outfit-pieces');
    outfit.replaceChildren();
    if (!state.pecas.length) outfit.append(element('span', 'empty-outfit', 'Só o começo de uma ideia.'));
    for (const id of state.pecas) {
      const name = M.PECAS.find((piece) => piece.id === id).nome;
      if (traditional) outfit.append(element('span', 'outfit-chip', name));
      else {
        const chip = element('button', 'outfit-chip', name);
        chip.type = 'button';
        chip.setAttribute('aria-label', 'Remover ' + name);
        const cross = element('span', '', '×');
        cross.setAttribute('aria-hidden', 'true');
        chip.append(cross);
        chip.addEventListener('click', () => {
          togglePiece(id);
          document.querySelector('[data-piece="' + id + '"]').focus({ preventScroll: true });
        });
        outfit.append(chip);
      }
    }
    $('reset-outfit').disabled = !state.pecas.length;
    $('reset-outfit').textContent = traditional ? '↺ Tirar esta combinação' : '↺ Tirar todas as peças';
    $('lesson-title').textContent = traditional ? 'As combinações se multiplicam.' : 'O segredo está na composição.';
    $('lesson-text').textContent = traditional ? 'Uma quinta peça dobraria o catálogo: de 16 para 32 classes concretas. O código de cada combinação descreve o visual inteiro.' : 'Cada roupa envolve o objeto anterior, delega visual() e acrescenta sua peça. A interface continua a mesma; o comportamento ganha camadas.';
    $('lesson-stat').textContent = traditional ? '4 peças → 16 classes' : '4 decoradores + 2 bases = 6 classes';
    $('game-tip').textContent = traditional ? 'Compare o mesmo visual no modo Decorator usando o seletor acima.' : 'A ordem no código segue seus cliques. Para remover uma peça, o jogo reconstrói a cadeia sem ela.';
    renderCode();
    drawCharacter($('character-canvas'), personagem.visual());
    drawCharacter($('hero-canvas'), { pele: 'media', pecas: M.PECAS.map((piece) => piece.id) });
  }

  function setMode(mode, fromMenu = false) {
    state.mode = mode;
    state.screen = 'game';
    if (fromMenu) { state.pecas = []; state.tab = 'montagem'; }
    if (mode === 'tradicional') state.pecas = [...M.getCombination(state.pecas).pecas];
    buildWardrobe();
    render();
    if (fromMenu) {
      window.scrollTo(0, 0);
      $('game-title').focus({ preventScroll: true });
    }
  }

  for (const mode of ['tradicional', 'decorator']) {
    $('start-' + mode).addEventListener('click', () => setMode(mode, true));
    document.querySelector('[data-mode="' + mode + '"]').addEventListener('click', () => setMode(mode));
  }
  $('back-home').addEventListener('click', () => {
    state.screen = 'menu';
    render();
    $('start-' + state.mode).focus({ preventScroll: true });
    window.scrollTo(0, 0);
  });
  $('reset-outfit').addEventListener('click', () => { state.pecas = []; render(); announce('Todas as peças foram retiradas. Personagem base restaurado.'); });
  for (const skin of skins) {
    const button = element('button', 'skin-button');
    button.type = 'button';
    button.dataset.skin = skin.id;
    button.style.setProperty('--skin', skin.color);
    button.title = 'Tom de pele: ' + skin.name;
    button.setAttribute('aria-label', button.title);
    button.addEventListener('click', () => { state.pele = skin.id; render(); announce('Tom de pele: ' + skin.name + '. Roupas mantidas.'); });
    $('skin-options').append(button);
  }
  function setTab(tab) {
    state.tab = tab;
    renderCode();
    $('code-view').scrollTop = 0;
    $('code-view').scrollLeft = 0;
  }
  for (const tab of ['montagem', 'estrutura']) {
    $('tab-' + tab).addEventListener('click', () => setTab(tab));
    $('tab-' + tab).addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === 'Home' ? 'montagem' : event.key === 'End' ? 'estrutura' : tab === 'montagem' ? 'estrutura' : 'montagem';
      setTab(target);
      $('tab-' + target).focus();
    });
  }
  $('open-help').addEventListener('click', () => $('help-dialog').showModal());
  $('close-help').addEventListener('click', () => $('help-dialog').close());
  $('help-dialog').addEventListener('click', (event) => {
    if (event.target !== $('help-dialog')) return;
    const rect = $('help-dialog').getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('help-dialog').close();
  });
  $('copy-code').addEventListener('click', async () => {
    let copied = false;
    try { await navigator.clipboard.writeText(currentCode); copied = true; } catch {
      const text = element('textarea');
      text.value = currentCode;
      text.style.position = 'fixed';
      text.style.opacity = '0';
      document.body.append(text);
      text.select();
      copied = document.execCommand('copy');
      text.remove();
      $('copy-code').focus();
    }
    $('copy-code').textContent = copied ? '✓' : '!';
    announce(copied ? 'Código copiado.' : 'Não foi possível copiar automaticamente. Selecione o código no painel para copiar.');
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { $('copy-code').textContent = '⧉'; }, 1800);
  });

  const sources = {
    ...Object.fromEntries(skins.map((skin) => [skin.id, basePath + 'char_a_p1_0bas_humn_v' + skin.variant + '.png'])),
    shorts: basePath + '1out/char_a_p1_1out_boxr_v01.png',
    outfit: basePath + '1out/char_a_p1_1out_pfpn_v02.png',
    hair: basePath + '4har/char_a_p1_4har_dap1_v06.png',
    hat: basePath + '5hat/char_a_p1_5hat_pnty_v03.png'
  };
  buildWardrobe();
  render();
  Promise.all(Object.entries(sources).map(([key, path]) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { images[key] = image; resolve(); };
    image.onerror = () => reject(new Error(path));
    image.src = path;
  }))).then(() => { state.assetsReady = true; render(); }).catch((error) => {
    $('asset-error').hidden = false;
    $('asset-error').textContent = 'Não foi possível carregar um asset. Mantenha as pastas originais junto do Index.html. Arquivo: ' + error.message;
  });
})();
