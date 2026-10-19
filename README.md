# Atelier Decorator

Jogue online em: **https://renanrabelo1.github.io/atelier-decorator/**

**Para jogar localmente, dê dois cliques em `Index.html`.** Não precisa instalar nada, iniciar servidor ou estar conectado à internet. Mantenha `Index.html`, `styles.css`, `model.js`, `app.js` e as três pastas de assets juntos.

## Como experimentar

1. Escolha **Tradicional**: o painel esquerdo contém todas as 16 possibilidades das quatro peças, incluindo o personagem base. Role o catálogo, escolha um visual e observe a classe específica no código. Use **Tirar esta combinação** para limpar.
2. Escolha **Decorator**: clique nas peças para vestir ou tirar. Cada peça adicionada envolve o objeto anterior. Os botões abaixo do personagem também removem peças individuais.
3. Troque o tom de pele nas seis amostras acima do personagem. As roupas são mantidas.
4. Alterne entre os modos no topo para comparar o mesmo visual. Voltar ao início e entrar novamente começa uma seleção vazia.
5. No código, **Montagem** mostra os objetos instanciados. **Estrutura das classes** inclui as definições usadas na seleção e pode ser copiada e executada como JavaScript independente. A montagem isolada pressupõe essas classes.

O código acompanha o estado atual: retirar uma peça retira sua linha da montagem. O código exibido não edita arquivos no disco. A seleção não persiste ao recarregar a página.

## Roteiro curto para apresentar

- No Tradicional, escolha Camisa + Calça + Botas + Chapéu: a instância é de `PersonagemComCamisaCalcaBotasChapeu`.
- Mostre que quatro peças opcionais geram `2⁴ = 16` classes concretas nessa abordagem, contando `Personagem`. Uma quinta peça exigiria 32.
- Mude para Decorator: cada roupa é um objeto que envolve o anterior. `visual()` é o contrato comum; `RoupaDecorator` delega a chamada, e cada decorador concreto acrescenta sua peça.
- Abra **Estrutura das classes** e mostre `this.componente`, `super.visual()` e o resultado retornado.
- Aqui são quatro decoradores concretos mais `Personagem` e `RoupaDecorator`: seis classes. Remover uma peça reconstrói a cadeia com as demais; a remoção não é uma operação mágica do padrão.
- A cadeia de objetos respeita a ordem dos cliques. O desenho usa a ordem visual das regiões do corpo para manter as roupas alinhadas.

O modo tradicional demonstra especificamente a explosão de subclasses. Existem outras soluções para um guarda-roupa sem Decorator. Não há interface formal em JavaScript: o contrato é o método comum `visual()`.

Referência teórica: [Decorator — Refactoring.Guru](https://refactoring.guru/pt-br/design-patterns/decorator).

## Assets

- **Mana Seed / Seliel the Shaper:** personagem, seis tons de pele, cabelo, roupa base, roupa de fazendeiro e chapéu. Apenas o primeiro frame idle frontal de 64×64 é utilizado. A roupa é recortada durante o desenho em camisa, calça e botas, sem modificar os PNGs originais. A roupa de base permanece ao remover as peças.
- **Craftpix — Free Clothing 32×32 Pixel Icons:** ícones do catálogo. São ilustrações de inventário; as camadas vestidas usam os sprites compatíveis do Mana Seed, com pequenas diferenças de desenho.
- **Border and Panels Menu Part 3:** detalhes de moldura do provador e menu.

Os originais e seus textos de licença foram preservados. O pacote Mana Seed permite uso comercial e não comercial em `this is only a demo.txt`; Craftpix aponta sua licença em `License.txt`. A pasta de painéis fornecida não contém um texto de licença. O pacote Kenney não é necessário para este jogo.

## Arquivos e validação

- `model.js`: classes tradicionais, decoradores e geração do código exibido.
- `app.js`: interface, seleção, desenho e troca de pele.
- `styles.css`: layout responsivo e aparência.
- `tests/model.test.cjs`: `node --test tests/model.test.cjs`.
- `tests/browser.test.cjs`: `node --test tests/browser.test.cjs`. Somente o teste depende de Playwright e Chrome; o script usa os caminhos do runtime disponíveis nesta máquina.
- `output/iterate/`: capturas da validação em desktop e celular.

Controles: clique/toque, Tab e Enter/Espaço nos botões, setas nas abas de código, Esc para fechar a ajuda. A página de referência externa requer internet, mas o jogo funciona offline.
