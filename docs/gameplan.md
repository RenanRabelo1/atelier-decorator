# Atelier Decorator

Jogo de vestir didático para comparar subclasses de combinações fixas com composição pelo padrão GoF Decorator. Escopo definido pelo pedido de 19/10/2026.

## Fluxo

Escolher Tradicional ou Decorator na tela inicial, vestir o personagem e acompanhar o JavaScript no painel direito. O painel esquerdo lista as combinações no Tradicional e as peças individuais no Decorator. O centro mostra o personagem idle e permite trocar seu tom de pele. Remover peças, limpar o visual e voltar ao menu permite repetir a demonstração.

## Regras

- Quatro peças independentes: camisa, calça, botas e chapéu. Cada peça pode estar presente uma vez ou ausente.
- Todas as 16 possibilidades são representadas no modo tradicional, incluindo a base sem peças adicionais. Cada combinação vestida tem uma classe concreta própria.
- No Decorator, cada clique adiciona ou remove uma peça; a cadeia preserva a ordem de seleção. Ao remover, reconstruir a cadeia com as peças restantes.
- A troca de pele preserva as roupas e usa o mesmo frame parado de outra variante.
- Mesmo resultado visual nos dois modos para a mesma seleção.
- Demonstração livre, individual, sem pontuação, tempo limite ou condição de derrota. Controle por clique, toque ou teclado nos botões.

## Apresentação

Três painéis lado a lado em desktop, layout empilhado em telas pequenas. Pixel art dos pacotes fornecidos, tons escuros de verde, papel creme e detalhes dourados. Sem áudio. Interface e explicações em português. A fonte indicada pelo usuário é a referência teórica, não uma família tipográfica.

Referência: https://refactoring.guru/pt-br/design-patterns/decorator

## Aceitação

Abrir Index.html diretamente, experimentar os dois modos e observar personagem, roupas e código sincronizados, sem instalações ou rede.
