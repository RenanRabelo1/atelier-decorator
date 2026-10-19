# 01 — Comparação interativa completa

Objetivo: demonstrar o custo das combinações fixas e a composição com Decorator.

- [x] Menu inicial com dois modos.
- [x] Tradicional mostra todas as 16 possibilidades, classe concreta e remoção.
- [x] Decorator mostra quatro peças, composição real e remoção individual.
- [x] Sprite idle, roupas alinhadas e seis tons de pele preservam a seleção.
- [x] Código e resultado visual refletem o mesmo modelo nos dois modos.
- [x] Abre por file://, sem dependências de execução e sem erros no navegador.
- [x] Layout verificado em desktop e tela pequena.

Validação em 2026-10-19: 8 testes do modelo + 7 testes de navegador passaram. O código da aba Estrutura foi executado nos testes e reproduziu o resultado do modelo. Chrome abriu file:// em contexto offline. Capturas desktop 1440×1000, idle 1366×768 e mobile 390×844 inspecionadas. Ajuda, Esc, setas nas abas e cópia também verificadas com Playwright.

Saída: usuário abre Index.html, veste uma combinação em cada modo e vê a diferença no código. Aprovação subjetiva do visual permanece com o usuário.
