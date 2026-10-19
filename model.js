(function (root) {
  'use strict';

  // Todos os componentes compartilham o contrato visual(): { pele, pecas }.
  class Personagem {
    constructor(pele = 'clara') {
      if (typeof pele !== 'string') throw new TypeError('A pele deve ser uma string.');
      this.pele = pele;
    }

    visual() {
      return { pele: this.pele, pecas: [] };
    }
  }

  // O decorador guarda outro componente e delega a mesma operação a ele.
  class RoupaDecorator {
    constructor(componente) {
      if (!componente || typeof componente.visual !== 'function') {
        throw new TypeError('O componente precisa implementar visual().');
      }
      this.componente = componente;
    }

    visual() {
      return this.componente.visual();
    }
  }

  class CamisaDecorator extends RoupaDecorator {
    visual() {
      const visual = super.visual();
      return { ...visual, pecas: [...visual.pecas, 'camisa'] };
    }
  }

  class CalcaDecorator extends RoupaDecorator {
    visual() {
      const visual = super.visual();
      return { ...visual, pecas: [...visual.pecas, 'calca'] };
    }
  }

  class BotasDecorator extends RoupaDecorator {
    visual() {
      const visual = super.visual();
      return { ...visual, pecas: [...visual.pecas, 'botas'] };
    }
  }

  class ChapeuDecorator extends RoupaDecorator {
    visual() {
      const visual = super.visual();
      return { ...visual, pecas: [...visual.pecas, 'chapeu'] };
    }
  }

  // Alternativa tradicional: uma classe explícita para cada combinação fixa.
  class PersonagemComCamisa extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['camisa'] };
    }
  }

  class PersonagemComCalca extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['calca'] };
    }
  }

  class PersonagemComCamisaCalca extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['camisa', 'calca'] };
    }
  }

  class PersonagemComBotas extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['botas'] };
    }
  }

  class PersonagemComCamisaBotas extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['camisa', 'botas'] };
    }
  }

  class PersonagemComCalcaBotas extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['calca', 'botas'] };
    }
  }

  class PersonagemComCamisaCalcaBotas extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['camisa', 'calca', 'botas'] };
    }
  }

  class PersonagemComChapeu extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['chapeu'] };
    }
  }

  class PersonagemComCamisaChapeu extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['camisa', 'chapeu'] };
    }
  }

  class PersonagemComCalcaChapeu extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['calca', 'chapeu'] };
    }
  }

  class PersonagemComCamisaCalcaChapeu extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['camisa', 'calca', 'chapeu'] };
    }
  }

  class PersonagemComBotasChapeu extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['botas', 'chapeu'] };
    }
  }

  class PersonagemComCamisaBotasChapeu extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['camisa', 'botas', 'chapeu'] };
    }
  }

  class PersonagemComCalcaBotasChapeu extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['calca', 'botas', 'chapeu'] };
    }
  }

  class PersonagemComCamisaCalcaBotasChapeu extends Personagem {
    visual() {
      return { ...super.visual(), pecas: ['camisa', 'calca', 'botas', 'chapeu'] };
    }
  }

  const PECAS = Object.freeze([
    Object.freeze({ id: 'camisa', nome: 'Camisa', classe: 'CamisaDecorator', parte: 'Tronco' }),
    Object.freeze({ id: 'calca', nome: 'Calça', classe: 'CalcaDecorator', parte: 'Pernas' }),
    Object.freeze({ id: 'botas', nome: 'Botas', classe: 'BotasDecorator', parte: 'Pés' }),
    Object.freeze({ id: 'chapeu', nome: 'Chapéu', classe: 'ChapeuDecorator', parte: 'Cabeça' }),
  ]);

  const DECORADORES = Object.freeze({
    camisa: CamisaDecorator,
    calca: CalcaDecorator,
    botas: BotasDecorator,
    chapeu: ChapeuDecorator,
  });

  const TIPOS_TRADICIONAIS = [
    Personagem,
    PersonagemComCamisa,
    PersonagemComCalca,
    PersonagemComCamisaCalca,
    PersonagemComBotas,
    PersonagemComCamisaBotas,
    PersonagemComCalcaBotas,
    PersonagemComCamisaCalcaBotas,
    PersonagemComChapeu,
    PersonagemComCamisaChapeu,
    PersonagemComCalcaChapeu,
    PersonagemComCamisaCalcaChapeu,
    PersonagemComBotasChapeu,
    PersonagemComCamisaBotasChapeu,
    PersonagemComCalcaBotasChapeu,
    PersonagemComCamisaCalcaBotasChapeu,
  ];

  const COMBINACOES = Object.freeze(TIPOS_TRADICIONAIS.map((Tipo, id) => {
    const pieces = PECAS.filter((_, index) => id & (1 << index));
    return Object.freeze({
      id,
      pecas: Object.freeze(pieces.map((piece) => piece.id)),
      nome: pieces.length ? pieces.map((piece) => piece.nome).join(' + ') : 'Sem peças',
      classe: Tipo.name,
      Tipo,
    });
  }));

  function validatePieces(ids) {
    if (!Array.isArray(ids)) throw new TypeError('As peças devem ser um array.');
    const seen = new Set();
    for (const id of ids) {
      if (!Object.prototype.hasOwnProperty.call(DECORADORES, id)) {
        throw new RangeError('Peça desconhecida: ' + String(id));
      }
      if (seen.has(id)) throw new RangeError('Peça repetida: ' + id);
      seen.add(id);
    }
  }

  function getCombination(ids) {
    validatePieces(ids);
    const mask = PECAS.reduce((value, piece, index) => value | (ids.includes(piece.id) ? 1 << index : 0), 0);
    return COMBINACOES[mask];
  }

  function createTraditional(mask, pele = 'clara') {
    if (!Number.isInteger(mask) || mask < 0 || mask >= COMBINACOES.length) {
      throw new RangeError('A combinação deve ser um número inteiro de 0 a 15.');
    }
    return new COMBINACOES[mask].Tipo(pele);
  }

  function createDecorated(ids, pele = 'clara') {
    validatePieces(ids);
    return ids.reduce((component, id) => new DECORADORES[id](component), new Personagem(pele));
  }

  function generatedCode(mode, ids, pele = 'clara', tab = 'montagem') {
    if (!['tradicional', 'traditional', 'decorator'].includes(mode)) {
      throw new RangeError('Modo desconhecido.');
    }
    if (!['montagem', 'estrutura'].includes(tab)) throw new RangeError('Aba de código desconhecida.');
    const combination = getCombination(ids);
    const isDecorator = mode === 'decorator';
    const character = isDecorator ? createDecorated(ids, pele) : createTraditional(combination.id, pele);
    const skin = JSON.stringify(pele);
    const lines = isDecorator
      ? ['// Cada nova peça envolve o objeto anterior.', `let personagem = new Personagem(${skin});`, ...ids.map((id) => `personagem = new ${DECORADORES[id].name}(personagem);`)]
      : ['// Uma classe concreta para esta combinação inteira.', `const personagem = new ${combination.classe}(${skin});`];
    lines.push('', 'personagem.visual();', '// Resultado: ' + JSON.stringify(character.visual()));
    if (tab === 'montagem') return lines.join('\n');

    const types = isDecorator
      ? [Personagem, RoupaDecorator, ...ids.map((id) => DECORADORES[id])]
      : combination.id === 0 ? [Personagem] : [Personagem, combination.Tipo];
    const explanation = isDecorator
      ? '// Contrato comum: visual(). O decorador delega e acrescenta uma peça.\n// Abaixo: classes usadas na seleção atual.'
      : '// Abaixo: a base e a classe da combinação selecionada.\n// O catálogo completo tem 16 classes concretas (incluindo a base).';
    const definitions = types.map((Type) => Type.toString().replace(/^ {2}/gm, '')).join('\n\n');
    return explanation + '\n\n' + definitions + '\n\n' + lines.join('\n');
  }

  const api = {
    PECAS,
    COMBINACOES,
    Personagem,
    RoupaDecorator,
    CamisaDecorator,
    CalcaDecorator,
    BotasDecorator,
    ChapeuDecorator,
    createTraditional,
    createDecorated,
    getCombination,
    generatedCode,
  };
  for (const Type of TIPOS_TRADICIONAIS) api[Type.name] = Type;

  if (typeof module !== 'undefined' && module.exports) module.exports = Object.freeze(api);
  if (root) root.AtelierModel = Object.freeze(api);
})(typeof window !== 'undefined' ? window : null);
