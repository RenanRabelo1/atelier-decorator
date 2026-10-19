# ADR 0001 — Arquivos estáticos e composição de objetos

Data: 2026-10-19. Status: adotada conforme stack e fluxo solicitados pelo usuário.

Usar HTML/CSS/JavaScript sem engine para permitir duplo clique em Index.html. Separar modelo didático e interface, com classes reais em ambos os modos. Usar quatro peças para apresentar todas as combinações sem catálogo impraticável. Contagens explicam 16 classes concretas tradicionais (base incluída) versus quatro decoradores concretos mais Personagem e RoupaDecorator.

Sprites de idle e camadas dos assets locais mantêm a comparação visual consistente. Testes verificam equivalência de todas as combinações, delegação e remoção. Remover uma peça recompõe a cadeia; não é apresentado como remoção automática fornecida pelo padrão.
