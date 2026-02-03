# 🃏 Truco Royal Edition

> A experiência definitiva de Truco Paulista na web. Estratégia, blefes e design premium.

![Version](https://img.shields.io/badge/version-1.0.0-gold)
![Status](https://img.shields.io/badge/status-stable-green)
![Tech](https://img.shields.io/badge/tech-HTML%20%7C%20CSS%20%7C%20JS-blue)

## 📋 Sobre o Projeto

**Truco Royal** é uma implementação moderna e responsiva do clássico jogo de cartas **Truco Paulista**. Desenvolvido com foco na experiência do usuário (UX), o jogo apresenta uma Inteligência Artificial calibrada para simular um comportamento humano, incluindo tempos de "pensamento" e estratégias de blefe.

Diferente de versões genéricas, este projeto foca no "Game Feel" (sensação de jogo), com animações fluidas, interface estilo cassino e regras oficiais implementadas rigorosamente.

## ✨ Funcionalidades Principais

* **🧠 IA com Personalidade:** A CPU não joga aleatoriamente. Ela calcula a força da mão, decide se aceita trucos baseada no risco e **blefa** quando está perdendo.
* **🎨 UI Premium:** Design com texturas de madeira e feltro, botões 3D, efeitos de vidro (glassmorphism) e animações de vitória/derrota.
* **📱 100% Responsivo:** Jogue no PC ou no Celular. O layout se adapta automaticamente, ajustando o tamanho das cartas para telas pequenas.
* **⏱️ Sistema de Timer:** Turnos com tempo limite (15s) para manter o dinamismo da partida.
* **🛡️ Regras Oficiais Blindadas:**
    * Sistema de Manilhas (Vira) do Truco Paulista.
    * Força dos Naipes: Zap (♣) > Copas (♥) > Espadilha (♠) > Pica-fumo (♦).
    * **Regra de Ouro:** Um jogador não pode aumentar a aposta se ele mesmo fez o último pedido (evita loop infinito de aumentos).
    * Escalada de Apostas: Truco (3) -> Seis (6) -> Nove (9) -> Doze (12).
* **👑 Mão de 11 e Ferro:** Lógica específica para quando um ou ambos os jogadores atingem 11 pontos (cartas cobertas na Mão de Ferro).

## 🚀 Como Executar

Este é um projeto estático, não requer instalação de dependências ou servidores complexos (Node/Python).

1.  **Clone ou Baixe** os arquivos do projeto.
2.  Certifique-se de ter os 3 arquivos na mesma pasta:
    * `index.html`
    * `style.css`
    * `script.js`
3.  **Abra o arquivo `index.html`** em qualquer navegador moderno (Chrome, Edge, Firefox, Safari).

> **Dica:** Para uma melhor experiência de desenvolvimento, recomenda-se usar a extensão "Live Server" do VS Code.

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura semântica e Modais.
* **CSS3:** Flexbox, Grid, Variáveis CSS, Animações (`@keyframes`), Media Queries e Gradientes.
* **JavaScript (ES6+):** Programação Orientada a Objetos (Classes `Game`, `Deck`, `Card`, `UI`) para gerenciamento de estado limpo e sem bugs.
* **Font Awesome:** Ícones vetoriais para interface.
* **Google Fonts:** Tipografia 'Rye' e 'Roboto Condensed'.

## 📂 Estrutura do Código

/ ├── index.html # Estrutura da mesa, placar e modais ├── style.css # Estilização visual, efeitos 3D e responsividade └── script.js # Lógica do jogo (Core Game Loop, IA, Regras)


### Detalhes da Lógica (JS)
O código JS foi refatorado para evitar conflitos de estado ("spaghetti code").
* **Classe `Card`:** Calcula sua própria força baseada na Vira.
* **Classe `Deck`:** Gera e embaralha o baralho.
* **Classe `UI`:** Controla **apenas** o visual (DOM), animações e timers.
* **Classe `Game`:** O cérebro. Controla turnos, pontuação, estados de aposta (`isTrucoActive`) e a inteligência da CPU.

## 🎮 Controles

* **Clicar nas Cartas:** Joga a carta na mesa (apenas no seu turno).
* **Botão TRUCO:** Pede Truco ou aumenta a aposta (6, 9, 12).
* **Botão CORRER:** Desiste da mão atual e entrega os pontos para o oponente.

## 🐛 Correções Recentes (Changelog)

* **Fix:** Corrigido bug onde o jogo travava ao pedir "Nove" ou "Doze" (conflito de estados assíncronos).
* **Fix:** Implementada trava lógica onde quem pediu Truco não pode pedir Seis em cima do próprio pedido.
* **Feat:** Adicionada tela de derrota/vitória responsiva com botão de reinício funcional.
* **Style:** Ajuste de tamanho de cartas para dispositivos móveis (`max-width: 480px`).

## 📄 Licença

Este projeto é de código aberto e livre para uso educacional e pessoal. Divirta-se!

---

## 👨‍💻 Autor

Desenvolvido por Patrick Gonçalves

💡 Projeto educacional e interativo em JavaScript
