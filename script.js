/**
 * TRUCO ROYAL EDITION - FINAL STABLE
 * Regra implementada: Quem pediu o Truco/Aumento não pode pedir o próximo.
 */

const RANKS = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
const SUITS = ['♦', '♠', '♥', '♣'];
const SUIT_POWER = { '♦': 0, '♠': 1, '♥': 2, '♣': 3 };

// Configurações
const TURN_TIME = 15;
const AI_DELAY_MIN = 1000;
const AI_DELAY_MAX = 3000;

/* ================= CLASSE CARTA ================= */
class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }
    getPower(viraRank) {
        const viraIndex = RANKS.indexOf(viraRank);
        const manilhaIndex = (viraIndex + 1) % RANKS.length;
        if (this.rank === RANKS[manilhaIndex]) return 100 + SUIT_POWER[this.suit];
        return RANKS.indexOf(this.rank);
    }
    isManilha(viraRank) {
        const viraIndex = RANKS.indexOf(viraRank);
        return this.rank === RANKS[(viraIndex + 1) % RANKS.length];
    }
}

/* ================= CLASSE BARALHO ================= */
class Deck {
    constructor() { this.cards = []; this.reset(); }
    reset() {
        this.cards = [];
        for (let r of RANKS) for (let s of SUITS) this.cards.push(new Card(r, s));
        this.shuffle();
    }
    shuffle() { this.cards.sort(() => Math.random() - 0.5); }
    deal(count) { return this.cards.splice(0, count); }
    drawOne() { return this.cards.pop(); }
}

/* ================= CLASSE UI ================= */
class UI {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.timerInterval = null;
    }

    createCardEl(card, isManilha, isFaceUp = true, onClick = null, isBlind = false) {
        const el = document.createElement('div');
        if (!isFaceUp || isBlind) {
            el.className = 'card card-back';
        } else {
            el.className = 'card';
            if (isManilha) el.classList.add('manilha');
            el.classList.add(card.suit === '♥' || card.suit === '♦' ? 'red' : 'black');
            el.innerHTML = `
                <div class="card-corner">${card.rank}<br>${card.suit}</div>
                <div class="card-center">${card.suit}</div>
                <div class="card-corner bottom">${card.rank}<br>${card.suit}</div>
            `;
        }
        if (onClick) el.onclick = onClick;
        return el;
    }

    renderHand(who, hand, vira = null, isBlind = false) {
        const area = document.getElementById(who === 'player' ? 'handPlayer' : 'handCPU');
        area.innerHTML = '';
        hand.forEach((card, idx) => {
            const isManilha = vira ? card.isManilha(vira.rank) : false;
            const isFaceUp = who === 'player';
            const el = this.createCardEl(card, isManilha, isFaceUp,
                (who === 'player') ? () => this.game.playerPlayCard(idx) : null, isBlind);
            area.appendChild(el);
        });
    }

    renderVira(card) {
        const area = document.getElementById('cardVira');
        area.innerHTML = '';
        area.appendChild(this.createCardEl(card, false, true));
    }

    playCardAnimation(who, card, vira) {
        const slot = document.getElementById(who === 'player' ? 'slotPlayer' : 'slotCPU');
        slot.innerHTML = '';
        slot.className = 'card-slot';
        const isManilha = card.isManilha(vira.rank);
        slot.appendChild(this.createCardEl(card, isManilha, true));
    }

    clearTable() {
        document.getElementById('slotPlayer').innerHTML = '';
        document.getElementById('slotCPU').innerHTML = '';
        document.getElementById('slotPlayer').className = 'card-slot empty';
        document.getElementById('slotCPU').className = 'card-slot empty';
    }

    highlightTurn(who) {
        const pArea = document.getElementById('handPlayer');
        const cArea = document.getElementById('handCPU');
        if (who === 'player') {
            pArea.style.opacity = '1'; cArea.style.opacity = '0.6';
        } else {
            pArea.style.opacity = '0.6'; cArea.style.opacity = '1';
        }
        this.updateTrucoBtn(who);
    }

    updateScore(p, c) {
        document.getElementById('ptsPlayer').innerText = p;
        document.getElementById('ptsCPU').innerText = c;
    }

    resetRoundUI(val) {
        this.clearTable();
        this.updateRoundValue(val);
        [1, 2, 3].forEach(i => document.getElementById('dot' + i).className = 'dot');
        document.getElementById('modalOverlay').classList.add('hidden');
        document.getElementById('modalMao11').classList.add('hidden');
        document.getElementById('endOverlay').classList.add('hidden');
        this.stopTimer();
    }

    updateRoundValue(val) {
        document.getElementById('valRodada').innerText = val;
    }

    updateTrucoBtn(turn) {
        const btn = document.getElementById('btnTruco');

        // Texto do botão
        const nextVal = this.game.getNextVal();
        let label = "TRUCO";
        if (this.game.state.roundValue === 3) label = "PEDIR 6";
        if (this.game.state.roundValue === 6) label = "PEDIR 9";
        if (this.game.state.roundValue === 9) label = "PEDIR 12";

        btn.innerHTML = `${label} <i class="fas fa-bolt"></i>`;

        // === LÓGICA DE BLOQUEIO DO BOTÃO ===
        let disabled = false;

        // 1. Se não é vez do player
        if (turn === 'cpu') disabled = true;

        // 2. Se já vale 12 (máximo)
        if (this.game.state.roundValue >= 12) disabled = true;

        // 3. Se um truco já está pendente
        if (this.game.state.isTrucoActive) disabled = true;

        // 4. Se é Mão de Ferro ou Mão de 11
        if (this.game.state.isIronHand || this.game.state.scorePlayer === 11 || this.game.state.scoreCPU === 11) disabled = true;

        // 5. REGRA DE OURO: Se o Player foi o último a pedir, ele NÃO pode pedir de novo.
        if (this.game.state.lastRaiser === 'player') disabled = true;

        btn.disabled = disabled;
    }

    updateDots(history) {
        history.forEach((w, i) => {
            const dot = document.getElementById('dot' + (i + 1));
            if (w === 'player') dot.className = 'dot win';
            else if (w === 'cpu') dot.className = 'dot loss';
            else dot.className = 'dot draw';
        });
    }

    showMessage(msg, type = 'info') {
        const el = document.getElementById('gameMessage');
        const txt = document.getElementById('toastText');
        txt.innerText = msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 2500);
    }

    // --- TIMER SYSTEM ---
    startTimer(seconds, onTimeout, barId = 'timerBar') {
        this.stopTimer();
        const bar = document.getElementById(barId);
        if (!bar) return;

        let timeLeft = seconds;
        bar.style.width = '100%';

        this.timerInterval = setInterval(() => {
            timeLeft--;
            const pct = (timeLeft / seconds) * 100;
            bar.style.width = pct + '%';
            if (timeLeft <= 0) {
                this.stopTimer();
                if (onTimeout) onTimeout();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        ['timerBar', 'modalTimerBar', 'm11TimerBar'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.width = '100%';
        });
    }

    // Modais
    showTrucoModal(val, callback) {
        const modal = document.getElementById('modalOverlay');
        document.getElementById('modalVal').innerText = val;
        modal.classList.remove('hidden');

        const btnRaise = document.getElementById('mdlAumentar');
        if (val >= 12) {
            btnRaise.style.display = 'none';
        } else {
            btnRaise.style.display = 'block';
            let next = val === 3 ? 6 : (val === 6 ? 9 : 12);
            btnRaise.innerText = `PEDIR ${next}`;
        }

        const close = (action) => {
            modal.classList.add('hidden');
            this.stopTimer();
            callback(action);
        };
        document.getElementById('mdlAceitar').onclick = () => close('accept');
        document.getElementById('mdlAumentar').onclick = () => close('raise');
        document.getElementById('mdlCorrer').onclick = () => close('fold');

        this.startTimer(12, () => close('fold'), 'modalTimerBar');
    }

    showHandOf11Modal(callback) {
        const modal = document.getElementById('modalMao11');
        modal.classList.remove('hidden');

        const close = (action) => {
            modal.classList.add('hidden');
            this.stopTimer();
            callback(action);
        };
        document.getElementById('btnM11Jogar').onclick = () => close('play');
        document.getElementById('btnM11Correr').onclick = () => close('run');
        this.startTimer(10, () => close('run'), 'm11TimerBar');
    }

    showEndGame(isWin) {
        const modal = document.getElementById('endOverlay');
        modal.classList.remove('hidden');
        const title = document.getElementById('endTitle');
        title.innerText = isWin ? "VITÓRIA!" : "DERROTA";
        title.style.color = isWin ? "gold" : "#ff5252";
    }
}

/* ================= CLASSE JOGO ================= */
class Game {
    constructor() {
        this.deck = new Deck();
        this.ui = new UI(this);
        this.state = {
            scorePlayer: 0, scoreCPU: 0, roundValue: 1,
            handPlayer: [], handCPU: [], vira: null,
            tableCardPlayer: null, tableCardCPU: null,
            roundHistory: [], turn: 'player', starter: 'player',
            isTrucoActive: false, waitingResponse: false, isIronHand: false,
            lastRaiser: null // 'player' ou 'cpu' ou null
        };
        this.initButtons();
    }

    startMatch() {
        this.state.scorePlayer = 0;
        this.state.scoreCPU = 0;
        this.state.starter = 'player';
        this.ui.updateScore(0, 0);
        this.startRound();
    }

    startRound() {
        this.ui.stopTimer();
        this.state.roundValue = 1;
        this.state.roundHistory = [];
        this.state.tableCardPlayer = null;
        this.state.tableCardCPU = null;
        this.state.isTrucoActive = false;
        this.state.waitingResponse = false;
        this.state.isIronHand = false;
        this.state.lastRaiser = null; // Reseta quem pediu truco

        this.deck.reset();
        this.state.handPlayer = this.deck.deal(3);
        this.state.handCPU = this.deck.deal(3);
        this.state.vira = this.deck.drawOne();

        this.ui.resetRoundUI(1);
        this.ui.renderVira(this.state.vira);

        // Ferro
        if (this.state.scorePlayer === 11 && this.state.scoreCPU === 11) {
            this.state.isIronHand = true;
            this.ui.showMessage("MÃO DE FERRO!");
            this.ui.renderHand('player', this.state.handPlayer, this.state.vira, true);
            this.ui.renderHand('cpu', this.state.handCPU, null, true);
            this.state.turn = this.state.starter;
            this.processTurn();
            return;
        }

        // Mão de 11 Player
        if (this.state.scorePlayer === 11) {
            this.ui.showMessage("MÃO DE 11: Decida!");
            this.ui.renderHand('player', this.state.handPlayer, this.state.vira, false);
            this.ui.renderHand('cpu', this.state.handCPU, null, false);
            this.state.waitingResponse = true;
            this.ui.showHandOf11Modal((decision) => {
                if (decision === 'play') {
                    this.state.roundValue = 3;
                    this.ui.updateRoundValue(3);
                    this.state.lastRaiser = 'locked'; // Ninguém pede truco
                    this.ui.showMessage("VALE 3 TENTOS!");
                    this.state.waitingResponse = false;
                    this.state.turn = this.state.starter;
                    this.processTurn();
                } else {
                    this.finishRound('cpu', 1);
                }
            });
            return;
        }

        // Mão de 11 CPU
        if (this.state.scoreCPU === 11) {
            this.ui.showMessage("CPU Analisando...", "info");
            this.ui.renderHand('player', this.state.handPlayer, this.state.vira, true);
            this.ui.renderHand('cpu', this.state.handCPU, null, false);
            this.state.waitingResponse = true;

            setTimeout(() => {
                const cpuWantsToPlay = this.cpuDecideHandOf11();
                if (cpuWantsToPlay) {
                    this.state.roundValue = 3;
                    this.ui.updateRoundValue(3);
                    this.state.lastRaiser = 'locked';
                    this.ui.showMessage("CPU ACEITOU! VALE 3!");
                    this.ui.renderHand('player', this.state.handPlayer, this.state.vira, false);
                    this.state.waitingResponse = false;
                    this.state.turn = this.state.starter;
                    this.processTurn();
                } else {
                    this.ui.showMessage("CPU CORREU!");
                    this.finishRound('player', 1);
                }
            }, 3000);
            return;
        }

        this.ui.renderHand('player', this.state.handPlayer, this.state.vira, false);
        this.ui.renderHand('cpu', this.state.handCPU, null, false);
        this.state.turn = this.state.starter;
        this.processTurn();
    }

    cpuDecideHandOf11() {
        let p = 0; let m = 0;
        this.state.handCPU.forEach(c => {
            const pw = c.getPower(this.state.vira.rank);
            p += pw; if (pw >= 100) m++;
        });
        return m > 0 || p > 30 || Math.random() < 0.3;
    }

    processTurn() {
        this.ui.highlightTurn(this.state.turn);

        // Inicia Timer
        this.ui.startTimer(TURN_TIME, () => {
            this.ui.showMessage("TEMPO ESGOTADO!");
            if (this.state.turn === 'player') this.finishRound('cpu');
            else this.finishRound('player');
        });

        if (this.state.turn === 'cpu') {
            const delay = Math.floor(Math.random() * (AI_DELAY_MAX - AI_DELAY_MIN + 1)) + AI_DELAY_MIN;
            if (delay > 2000) setTimeout(() => {
                if (!this.state.isTrucoActive) this.ui.showMessage("CPU Pensando...", "info");
            }, 1000);
            setTimeout(() => this.cpuPlay(), delay);
        }
    }

    playerPlayCard(index) {
        if (this.state.turn !== 'player' || this.state.waitingResponse) return;
        this.ui.stopTimer();
        const card = this.state.handPlayer.splice(index, 1)[0];
        this.state.tableCardPlayer = card;
        this.ui.renderHand('player', this.state.handPlayer, this.state.vira, this.state.isIronHand);
        this.ui.playCardAnimation('player', card, this.state.vira);
        this.state.turn = 'cpu';
        this.checkTableFull();
    }

    cpuPlay() {
        if (this.state.waitingResponse) return;
        this.ui.stopTimer();

        if (this.state.isIronHand) {
            const idx = Math.floor(Math.random() * this.state.handCPU.length);
            this.executeCpuPlay(idx);
            return;
        }

        // Tenta pedir Truco (Só se não foi ela mesma que aumentou por último)
        if (!this.state.isTrucoActive &&
            this.state.tableCardCPU === null &&
            this.state.roundValue < 12 &&
            this.state.lastRaiser !== 'cpu') { // IA Checa a regra de ouro

            const isHandOf11 = (this.state.scorePlayer === 11 || this.state.scoreCPU === 11);
            if (!isHandOf11 && this.shouldCpuTruco()) {
                this.callTruco('cpu');
                return;
            }
        }
        const idx = this.getCpuBestCardIndex();
        this.executeCpuPlay(idx);
    }

    executeCpuPlay(index) {
        const card = this.state.handCPU.splice(index, 1)[0];
        this.state.tableCardCPU = card;
        this.ui.renderHand('cpu', this.state.handCPU);
        this.ui.playCardAnimation('cpu', card, this.state.vira);
        this.state.turn = 'player';
        this.checkTableFull();
    }

    getCpuBestCardIndex() {
        const hand = this.state.handCPU;
        const vira = this.state.vira;
        const pCard = this.state.tableCardPlayer;
        const handP = hand.map((c, i) => ({ i, p: c.getPower(vira.rank) })).sort((a, b) => a.p - b.p);
        if (!pCard) return handP[handP.length - 1].i;
        const pPow = pCard.getPower(vira.rank);
        const win = handP.find(c => c.p > pPow);
        return win ? win.i : handP[0].i;
    }

    shouldCpuTruco() {
        let p = 0; let m = false;
        this.state.handCPU.forEach(c => {
            const pw = c.getPower(this.state.vira.rank);
            p += pw; if (pw >= 100) m = true;
        });

        let bluff = 0.15;
        if (this.state.scoreCPU < this.state.scorePlayer - 3) bluff = 0.35;

        return (p > 150 || m) || Math.random() < bluff;
    }

    checkTableFull() {
        if (this.state.tableCardPlayer && this.state.tableCardCPU) {
            this.state.waitingResponse = true;
            this.ui.stopTimer();
            setTimeout(() => this.resolveHand(), 1500);
        } else {
            this.processTurn();
        }
    }

    resolveHand() {
        const pP = this.state.tableCardPlayer.getPower(this.state.vira.rank);
        const cP = this.state.tableCardCPU.getPower(this.state.vira.rank);
        let w = 'draw';
        if (pP > cP) w = 'player';
        else if (cP > pP) w = 'cpu';

        this.ui.clearTable();
        this.state.tableCardPlayer = null;
        this.state.tableCardCPU = null;
        this.state.roundHistory.push(w);
        this.ui.updateDots(this.state.roundHistory);

        const rw = this.checkRoundWinner();
        if (rw) {
            const msg = rw === 'player' ? "VOCÊ LEVOU A RODADA!" : "CPU LEVOU A RODADA!";
            this.ui.showMessage(msg);
            setTimeout(() => this.finishRound(rw), 2500);
        } else {
            if (w === 'player') { this.ui.showMessage("Você fez!"); this.state.turn = 'player'; }
            else if (w === 'cpu') { this.ui.showMessage("CPU fez!"); this.state.turn = 'cpu'; }
            else {
                this.ui.showMessage("CANGOU!");
                this.state.turn = (this.state.turn === 'player') ? 'cpu' : 'player';
            }
            this.state.waitingResponse = false;
            this.processTurn();
        }
    }

    checkRoundWinner() {
        const h = this.state.roundHistory;
        const p = h.filter(x => x === 'player').length;
        const c = h.filter(x => x === 'cpu').length;
        if (p === 2) return 'player';
        if (c === 2) return 'cpu';
        if (h[0] === 'draw') {
            if (h.length >= 2 && h[1] !== 'draw') return h[1];
            if (h.length === 3 && h[2] === 'draw') return 'draw';
        }
        if (h.length >= 2 && h[1] === 'draw' && h[0] !== 'draw') return h[0];
        if (h.length === 3 && h[2] === 'draw' && h[0] !== 'draw') return h[0];
        return null;
    }

    finishRound(winner, pts = null) {
        this.ui.stopTimer();
        let p = pts !== null ? pts : this.state.roundValue;
        if (winner === 'draw') p = 0;

        if (winner === 'player') this.state.scorePlayer += p;
        if (winner === 'cpu') this.state.scoreCPU += p;

        if (this.state.scorePlayer > 12) this.state.scorePlayer = 12;
        if (this.state.scoreCPU > 12) this.state.scoreCPU = 12;
        this.ui.updateScore(this.state.scorePlayer, this.state.scoreCPU);

        this.state.starter = (this.state.starter === 'player') ? 'cpu' : 'player';
        this.state.waitingResponse = false;

        if (this.state.scorePlayer >= 12 || this.state.scoreCPU >= 12) {
            this.ui.showEndGame(this.state.scorePlayer >= 12);
        } else {
            this.startRound();
        }
    }

    // --- LÓGICA DE APOSTA ---
    getNextVal() {
        const v = this.state.roundValue;
        if (v === 1) return 3;
        if (v === 3) return 6;
        if (v === 6) return 9;
        if (v >= 9) return 12;
        return 3;
    }

    callTruco(who) {
        if (this.state.isIronHand || this.state.scorePlayer === 11 || this.state.scoreCPU === 11) {
            this.ui.showMessage("Bloqueado agora!"); return;
        }
        if (this.state.roundValue >= 12) return;
        if (this.state.isTrucoActive) return;

        // Regra de Ouro: Quem pediu não pode pedir de novo
        if (this.state.lastRaiser === who) {
            this.ui.showMessage("Você não pode aumentar!");
            return;
        }

        this.ui.stopTimer();
        this.state.isTrucoActive = true;
        this.state.waitingResponse = true;

        // Define que este jogador é o "dono" da aposta atual
        this.state.lastRaiser = who;

        const nextVal = this.getNextVal();

        if (who === 'player') {
            this.ui.showMessage(`VOCÊ PEDIU ${nextVal}!`);
            this.ui.updateTrucoBtn('player'); // Desabilita botão visualmente
            setTimeout(() => this.cpuTrucoResponse(nextVal), 1500);
        } else {
            this.ui.showMessage("CPU PEDINDO APOSTA...");
            setTimeout(() => {
                this.ui.showTrucoModal(nextVal, (action) => this.handleModalResponse(action, nextVal));
            }, 1000);
        }
    }

    cpuTrucoResponse(val) {
        this.ui.showMessage("CPU Pensando...", "info");

        setTimeout(() => {
            try {
                let p = 0;
                if (this.state.handCPU && this.state.handCPU.length > 0) {
                    this.state.handCPU.forEach(c => p += c.getPower(this.state.vira.rank));
                }

                let accept = false; let raise = false;

                // IA decide
                if (p > 100) {
                    accept = true;
                    // IA só pede 6/9/12 se tiver mão boa E não estiver no limite
                    if (val < 12 && Math.random() < 0.4) raise = true;
                } else if (p > 50 && Math.random() < 0.5) {
                    accept = true;
                } else if (Math.random() < 0.15) {
                    accept = true;
                }

                if (raise) {
                    // CPU decide AUMENTAR
                    const next = val === 3 ? 6 : (val === 6 ? 9 : 12);

                    this.state.roundValue = val;
                    this.ui.updateRoundValue(val);
                    this.state.isTrucoActive = false;
                    this.ui.showMessage("CPU AUMENTOU!");

                    // Chama truco da CPU (que vai atualizar lastRaiser para 'cpu')
                    setTimeout(() => {
                        this.callTruco('cpu');
                    }, 1000);

                } else if (accept) {
                    this.ui.showMessage("CPU ACEITOU!");
                    this.state.roundValue = val;
                    this.ui.updateRoundValue(val);
                    this.state.isTrucoActive = false;
                    this.state.waitingResponse = false;

                    // lastRaiser continua sendo 'player', então player não pode pedir mais
                    this.ui.updateTrucoBtn(this.state.turn);

                    if (this.state.turn === 'cpu') this.processTurn();
                } else {
                    this.ui.showMessage("CPU CORREU!");
                    this.finishRound('player');
                }
            } catch (e) {
                console.error("Erro IA:", e);
                this.finishRound('player');
            }
        }, 2000);
    }

    handleModalResponse(action, val) {
        this.ui.stopTimer();

        if (action === 'accept') {
            this.state.roundValue = val;
            this.ui.updateRoundValue(val);
            this.state.isTrucoActive = false;
            this.state.waitingResponse = false;

            // lastRaiser continua sendo 'cpu', player pode pedir mais depois
            this.ui.updateTrucoBtn(this.state.turn);

            if (this.state.turn === 'cpu') this.processTurn();

        } else if (action === 'raise') {
            // Player AUMENTA (retruca)
            this.state.roundValue = val;
            this.ui.updateRoundValue(val);
            this.state.isTrucoActive = false;
            this.state.waitingResponse = false;

            // Chama novo truco (vai setar lastRaiser = 'player')
            this.callTruco('player');

        } else {
            this.finishRound('cpu');
        }
    }

    fold() {
        if (this.state.waitingResponse) return;
        this.finishRound('cpu');
    }

    initButtons() {
        document.getElementById('btnTruco').onclick = () => {
            if (this.state.turn === 'player' && !this.state.waitingResponse) this.callTruco('player');
        };
        document.getElementById('btnCorrer').onclick = () => this.fold();
    }
}

const app = new Game();
app.startMatch();