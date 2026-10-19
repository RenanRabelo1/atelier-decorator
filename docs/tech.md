# Tecnologia

HTML, CSS e JavaScript puros. Scripts clássicos carregados por caminhos relativos, compatíveis com file://. Sem servidor, build, frameworks, imports de módulos, fetch ou dependências de execução.

`model.js` contém classes e funções puras. `app.js` controla a interface e o desenho. A renderização usa os sprites fornecidos, recortados no frame idle; os arquivos originais são preservados. O painel de código mostra JavaScript correspondente ao modelo real.

Contrato comum: `visual()` retorna `{ pele, pecas }`. Personagem é o componente concreto; RoupaDecorator guarda o componente e delega `visual()`; decoradores concretos acrescentam suas peças. O tradicional usa subclasses explícitas com arrays completos de peças. Não usar eval nem gerar classes em runtime.

Hooks de inspeção: `window.render_game_to_text()` retorna JSON; `window.advanceTime(ms)` devolve o mesmo estado, pois a demonstração não depende de simulação temporal.

Validação: `node --test tests/model.test.cjs`, checagem sintática de JS e Playwright via runtime disponível, abrindo file://. Capturas em output/iterate. Dependências de QA são externas ao produto.
