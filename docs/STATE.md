# Estado

2026-10-19: Atelier Decorator implementado na raiz. Abrir `Index.html` diretamente. A pasta inicialmente continha apenas assets, sem código anterior ou repositório Git.

Entregue: menu, dois modos, três painéis, 16 combinações tradicionais, quatro decoradores, seis tons de pele, remoção, código de montagem e estrutura, cadeia de objetos, ajuda e cópia. Assets originais preservados; apenas o idle frontal é desenhado. O cabelo é ocultado sob o chapéu para evitar sobreposição.

Validação: `node --test tests/model.test.cjs tests/browser.test.cjs` passou 15/15. Testes de navegador usaram Chrome headless, file:// e contexto offline, sem requisições externas ou erros de console. Sintaxe de app.js validada. Inspeção visual das capturas em output/iterate confirmou desktop e mobile. Smoke adicional confirmou ajuda, Escape, navegação de abas por setas e cópia (aguardando a conclusão assíncrona).

README contém abertura, controles, roteiro de apresentação e créditos. AGENTS.md registra o contrato estático e instruções de manutenção. Não foi necessário instalar dependências, gerar novos assets ou modificar originais.

Hospedagem: repositório público em https://github.com/RenanRabelo1/atelier-decorator e GitHub Pages em https://renanrabelo1.github.io/atelier-decorator/. O workflow `.github/workflows/pages.yml` prepara `index.html` no artefato publicado, mantendo `Index.html` como a entrada local exigida pelo Windows.

Pendente apenas a avaliação subjetiva do usuário sobre aparência e clareza da demonstração; não foi declarada aprovação do usuário. Nenhum requisito funcional foi adiado.
