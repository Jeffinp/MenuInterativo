// --------------------------------------------------
//  FUNÇÕES AUXILIARES 
// --------------------------------------------------

/**
 * @namespace utils
 * @description Funções utilitárias para sanitização de entrada e formatação de números.
 */
const utils = {
    /**
     * Sanitiza a entrada do usuário para prevenir ataques XSS.
     * @memberof utils
     * @param {string} input - A entrada do usuário a ser sanitizada.
     * @returns {string} A entrada sanitizada.
     */
    sanitizeInput: function (input) {
        return input.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },
    /**
     * Formata um número para o padrão brasileiro.
     * @memberof utils
     * @param {number} number - O número a ser formatado.
     * @returns {string} O número formatado.
     */
    formatNumber: function (number) {
        return number.toLocaleString('pt-BR');
    }
};

/**
 * @namespace Logger
 * @description Funções para logging de mensagens em diferentes níveis.
 */
const Logger = {
    levels: {
        ERROR: 'ERROR',
        INFO: 'INFO'
    },
    /**
     * Registra uma mensagem no console.
     * @memberof Logger
     * @param {string} level - O nível da mensagem (ex: 'ERROR', 'INFO').
     * @param {string} message - A mensagem a ser registrada.
     * @param {object} data - Dados adicionais a serem registrados.
     */
    log: function (level, message, data = {}) {
        console.log(`[${level}] ${message}`, data);
    }
};


/**
 * @class Cache
 * @description Implementa uma funcionalidade simples de cache.
 */
class Cache {
    constructor() {
        /** @private */
        this.storage = {};
    }

    /**
     * Obtém um valor do cache.
     * @param {string} key - A chave do valor.
     * @returns {*} O valor armazenado ou null se não encontrado ou expirado.
     */
    get(key) {
        const item = this.storage[key];
        if (item && Date.now() < item.expires) {
            return item.value;
        }
        delete this.storage[key];
        return null;
    }

    /**
     * Define um valor no cache.
     * @param {string} key - A chave do valor.
     * @param {*} value - O valor a ser armazenado.
     * @param {number} [ttl=3600000] - Tempo de vida em milissegundos (padrão: 1 hora).
     */
    set(key, value, ttl = 3600000) {
        this.storage[key] = {
            value,
            expires: Date.now() + ttl
        };
    }
}

// --------------------------------------------------
//  NOTIFICAÇÕES
// --------------------------------------------------
/**
 * @class Notifications
 * @description Gerencia a exibição de notificações.
 */
class Notifications {
    constructor() {
        /** @private */
        this.queue = [];
        /** @private */
        this.isDisplaying = false;
    }

    /**
     * Mostra uma notificação.
     * @param {string} message - A mensagem a ser exibida.
     * @param {string} [type='info'] - O tipo da notificação ('info', 'error').
     */
    show(message, type = 'info') {
        this.queue.push({ message, type });
        if (!this.isDisplaying) {
            this.displayNext();
        }
    }

    /**
     * @private
     */
    displayNext() {
        if (this.queue.length === 0) {
            this.isDisplaying = false;
            return;
        }

        this.isDisplaying = true;
        const next = this.queue.shift();
        const notification = document.createElement('div');
        notification.className = `notification ${next.type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <span class="message">${utils.sanitizeInput(next.message)}</span>
            <button class="close" aria-label="Fechar">&times;</button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
                this.displayNext();
            }, 300);
        }, 5000);

        notification.querySelector('.close').addEventListener('click', () => {
            notification.remove();
            this.displayNext();
        });
    }
}

// --------------------------------------------------
//  JOGO DA FORCA
// --------------------------------------------------
/**
 * @class Forca
 * @description Gerencia a lógica do Jogo da Forca.
 */
class Forca {
    constructor(contentDiv) {
        this.contentDiv = contentDiv;
        this.palavras = ["javascript", "html", "css", "programacao", "computador", "internet"];
        this.palavraSecreta = this.escolherPalavra();
        this.letrasErradas = [];
        this.letrasCorretas = [];
        this.maxErros = 6;
        this.erros = 0;
    }

    /**
     * @private
     */
    escolherPalavra() {
        return this.palavras[Math.floor(Math.random() * this.palavras.length)];
    }

    /**
     * Atualiza o estado do jogo na interface.
     */
    atualizarJogo() {
        this.contentDiv.innerHTML = `
            <div id="forca-container">
                <h2>Jogo da Forca</h2>
                <p id="forca-palavra">${this.palavraSecreta.split('').map(letra => this.letrasCorretas.includes(letra) ? letra : '_').join(' ')}</p>
                <p id="forca-letras-erradas">Letras Erradas: ${this.letrasErradas.join(', ')}</p>
                <p>Erros: ${this.erros}/${this.maxErros}</p>
                <input type="text" id="letra-input" maxlength="1" placeholder="Digite uma letra">
                <button id="btn-adivinhar">Adivinhar</button>
                <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
                <p id="forca-mensagem"></p>
            </div>
        `;

        document.getElementById('btn-adivinhar').addEventListener('click', () => this.adivinharLetra());
        document.getElementById('letra-input').addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                this.adivinharLetra();
            }
        });
    }

    /**
     * @private
     */
    adivinharLetra() {
        const letraInput = document.getElementById('letra-input');
        const letra = letraInput.value.toLowerCase();
        letraInput.value = '';

        if (!letra.match(/[a-z]/i)) {
            document.getElementById('forca-mensagem').textContent = 'Por favor, digite uma letra válida.';
            return;
        }

        if (this.letrasCorretas.includes(letra) || this.letrasErradas.includes(letra)) {
            document.getElementById('forca-mensagem').textContent = 'Você já tentou essa letra. Tente outra.';
            return;
        }

        if (this.palavraSecreta.includes(letra)) {
            this.letrasCorretas.push(letra);
        } else {
            this.letrasErradas.push(letra);
            this.erros++;
        }

        this.atualizarJogo();

        if (this.erros === this.maxErros) {
            document.getElementById('forca-mensagem').textContent = `Você perdeu! A palavra era ${this.palavraSecreta}.`;
            this.desabilitarJogo();
        } else if (!document.getElementById('forca-palavra').textContent.includes('_')) {
            document.getElementById('forca-mensagem').textContent = 'Parabéns! Você ganhou!';
            this.desabilitarJogo();
        }
    }

    /**
     * @private
     */
    desabilitarJogo() {
        document.getElementById('letra-input').disabled = true;
        document.getElementById('btn-adivinhar').disabled = true;
    }
}

// --------------------------------------------------
//  JOGO DA VELHA
// --------------------------------------------------
/**
 * @class JogoDaVelha
 * @description Gerencia a lógica do Jogo da Velha.
 */
class JogoDaVelha {
    constructor(contentDiv) {
        this.contentDiv = contentDiv;
        this.currentPlayer = 'X';
        this.gameBoard = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
    }

    renderBoard() {
        this.contentDiv.innerHTML = `
            <div class="jogo-velha-container">
                <h2>Jogo da Velha</h2>
                <div class="grid"></div>
                <div class="status"></div>
                <button onclick="app.jogoDaVelha.reiniciarJogo()">Reiniciar Jogo</button>
                <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
            </div>
        `;
        const grid = document.querySelector('.grid');
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => this.handleClick(i));
            grid.appendChild(cell);
        }
        this.updateStatus();
    }

    handleClick(index) {
        if (this.gameBoard[index] === '' && this.gameActive) {
            this.gameBoard[index] = this.currentPlayer;
            this.renderCell(index);
            if (this.checkWinner()) {
                this.updateStatus();
                this.gameActive = false;
                return;
            }
            this.togglePlayer();
            this.updateStatus();
            if (this.currentPlayer === 'O' && this.gameActive) {
                setTimeout(() => this.makeComputerMove(), 500);
            }
        }
    }

    renderCell(index) {
        const cell = document.querySelector(`.grid .cell:nth-child(${index + 1})`);
        cell.classList.add(this.currentPlayer);
    }

    togglePlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
            [0, 4, 8], [2, 4, 6]             // Diagonais
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.gameBoard[a] && this.gameBoard[a] === this.gameBoard[b] && this.gameBoard[a] === this.gameBoard[c]) {
                return true;
            }
        }

        return this.gameBoard.every(cell => cell !== ''); // Verifica empate
    }

    updateStatus() {
        const winner = this.checkWinner();
        const status = document.querySelector('.status');
        if (winner) {
            if (this.gameBoard.every(cell => cell !== '')) {
                status.textContent = 'Empate!';
            } else {
                status.textContent = `Jogador ${this.currentPlayer === 'X' ? 'O' : 'X'} venceu!`;
            }
        } else {
            status.textContent = `Vez do Jogador ${this.currentPlayer}`;
        }
    }

    makeComputerMove() {
        const emptyCells = this.gameBoard.reduce((acc, cell, index) => {
            if (cell === '') {
                acc.push(index);
            }
            return acc;
        }, []);

        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const computerMove = emptyCells[randomIndex];

        this.gameBoard[computerMove] = 'O';
        this.renderCell(computerMove);

        if (this.checkWinner()) {
            this.updateStatus();
            this.gameActive = false;
            return;
        }

        this.togglePlayer();
        this.updateStatus();
    }

    reiniciarJogo() {
        this.currentPlayer = 'X';
        this.gameBoard = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.renderBoard();
    }
}

// ... (Todo o código anterior permanece o mesmo até a classe ListaDeTarefas)

// --------------------------------------------------
//  LISTA DE TAREFAS
// --------------------------------------------------
/**
 * @class ListaDeTarefas
 * @description Gerencia a lógica da Lista de Tarefas.
 */
class ListaDeTarefas {
    constructor(contentDiv) {
        this.contentDiv = contentDiv;
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    renderTasks() {
        this.contentDiv.innerHTML = `
            <div class="todo-container">
                <h2>Lista de Tarefas</h2>
                <div class="todo-header">
                    <input type="text" id="taskInput" placeholder="Adicione uma tarefa">
                    <button id="addTaskBtn">Adicionar</button>
                </div>
                <ul class="todo-list"></ul>
                <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
            </div>
        `;

        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());

        const taskList = document.querySelector('.todo-list');
        this.tasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('todo-item');
            listItem.innerHTML = `
                <input type="checkbox" id="task-${index}" ${task.completed ? 'checked' : ''}>
                <span ${task.completed ? 'class="completed"' : ''}>${utils.sanitizeInput(task.text)}</span>
                <button class="delete-btn" data-index="${index}">Excluir</button>
            `;

            const checkbox = listItem.querySelector(`#task-${index}`);
            checkbox.addEventListener('change', () => this.toggleTask(index));

            const deleteBtn = listItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index, 10);
                this.deleteTask(index);
            });

            taskList.appendChild(listItem);
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        if (taskText) {
            this.tasks.push({ text: taskText, completed: false });
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            taskInput.value = '';
            this.renderTasks();
        }
    }

    toggleTask(index) {
        this.tasks[index].completed = !this.tasks[index].completed;
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.renderTasks();
    }

    deleteTask(index) {
        this.tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.renderTasks();
    }
}

// --------------------------------------------------
//  CALCULADORA
// --------------------------------------------------
/**
 * @class Calculator
 * @description Gerencia a lógica da Calculadora.
 */
class Calculator {
    /**
     * Cria uma instância da Calculadora.
     * @param {object} i18n - Objeto de internacionalização.
     * @param {object} contentDiv - Referência ao elemento div de conteúdo
     */
    constructor(i18n, contentDiv) {
        this.contentDiv = contentDiv;
        this.i18n = i18n;
        this.history = [];
        this.cache = new Cache();
        this.mathParser = math; // Usando a biblioteca math.js
    }

    initialize() {
        this.loadHistory();
    }

    /**
     * Renderiza os botões da calculadora.
     * @private
     * @returns {string} HTML dos botões.
     */
    renderButtons() {
        const buttons = [
            '7', '8', '9', '/',
            '4', '5', '6', '*',
            '1', '2', '3', '-',
            '0', '.', '=', '+'
        ];

        return buttons.map(button => {
            let className = 'calc-button';
            if (['/', '*', '-', '+'].includes(button)) {
                className += ' operator';
            } else if (button === '=') {
                className += ' equal';
            }

            return `<button 
                        class="${className}"
                        data-key="${button}"
                        aria-label="${button}"
                    >${button}</button>`;
        }).join('');
    }

    /**
     * Manipula o clique nos botões da calculadora.
     * @param {string} button - O botão que foi clicado.
     */
    handleButtonClick(button) {
        const display = document.getElementById('display');
        if (button === '=') {
            try {
                const result = this.calculate(display.value);
                display.value = result;
            } catch (error) {
                app.notifications.show(error.message, 'error');
            }
        } else {
            display.value += button;
        }
    }

    /**
     * Renderiza a interface da calculadora.
     * @returns {string} HTML da calculadora.
     */
    render() {
        return `
            <div class="calculator-container" role="application">
                <h2>${this.i18n.t('calculator')}</h2>
                <div class="calc-display" role="textbox" aria-label="${this.i18n.t('display')}">
                    <input type="text" id="display" readonly>
                </div>
                <div class="calc-buttons" role="group">
                    ${this.renderButtons()}
                </div>
                <div class="calc-history">
                    <h3>${this.i18n.t('history')}</h3>
                    <ul id="calcHistory" role="list"></ul>
                    <button class="clear-history" onclick="app.calculator.clearHistory()">Limpar Histórico</button>
                </div>
                <button 
                    onclick="app.voltarAoMenu()"
                    class="secondary-button"
                    aria-label="${this.i18n.t('returnToMenu')}"
                >${this.i18n.t('back')}
                </button>
            </div>
        `;
    }

    /**
     * Calcula o resultado de uma expressão matemática.
     * @param {string} expression - A expressão a ser calculada.
     * @returns {number} O resultado do cálculo.
     * @throws {Error} Se a expressão for inválida.
     */
    calculate(expression) {
        try {
            const result = this.mathParser.evaluate(expression);

            if (!isFinite(result)) {
                throw new Error(this.i18n.t('calculationError'));
            }

            this.addToHistory(expression, result);
            return result;
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Erro no cálculo', { expression, error });
            throw new Error(this.i18n.t('calculationError'));
        }
    }

    /**
     * Adiciona uma expressão e seu resultado ao histórico.
     * @param {string} expression - A expressão calculada.
     * @param {number} result - O resultado do cálculo.
     */
    addToHistory(expression, result) {
        const historyItem = {
            expression,
            result,
            timestamp: new Date().toISOString()
        };

        this.history.unshift(historyItem);
        this.history = this.history.slice(0, 10); // Manter apenas últimos 10 cálculos
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    /**
     * Carrega o histórico do localStorage.
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('calcHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                this.updateHistoryDisplay();
            }
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Erro ao carregar histórico', { error });
        }
    }

    /**
     * Salva o histórico no localStorage.
     */
    saveHistory() {
        try {
            localStorage.setItem('calcHistory', JSON.stringify(this.history));
        } catch (error) {
            Logger.log(Logger.levels.ERROR, 'Erro ao salvar histórico', { error });
        }
    }

    /**
     * Atualiza a exibição do histórico na interface.
     */
    updateHistoryDisplay() {
        const historyList = this.contentDiv.querySelector('.calc-history ul');
        if (!historyList) return;

        historyList.innerHTML = this.history.map(item => `
            <li class="history-item" role="listitem">
                <span class="expression">${utils.sanitizeInput(item.expression)}</span>
                <span class="separator">=</span>
                <span class="result">${utils.formatNumber(item.result)}</span>
                <span class="timestamp">${this.formatTimestamp(item.timestamp)}</span>
            </li>
        `).join('');

        // Adiciona um efeito visual ao adicionar um novo item
        const lastItem = historyList.lastElementChild;
        if (lastItem) {
            lastItem.classList.add('new-item');
            setTimeout(() => {
                lastItem.classList.remove('new-item');
            }, 500); // Remove o efeito após 500ms
        }
    }

    /**
    * Limpa o histórico de cálculos e atualiza a exibição.
    */
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    /**
     * Formata o timestamp para um formato mais legível.
     * @private
     * @param {string} timestamp - O timestamp no formato ISO.
     * @returns {string} O timestamp formatado.
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`;
    }

    /**
     * Configura os event listeners para os botões da calculadora e do teclado.
     */
    setupEventListeners() {
        const buttons = this.contentDiv.querySelector('.calc-buttons');
        if (buttons) {
            buttons.addEventListener('click', (event) => {
                const key = event.target.dataset.key;
                if (key) {
                    this.handleButtonClick(key);
                }
            });
        }

        // Adiciona suporte para entrada via teclado
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
    }

    /**
     * Manipula a entrada do teclado.
     * @param {KeyboardEvent} event - O evento de teclado.
     */
    handleKeyPress(event) {
        const key = event.key;
        const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '*', '-', '+', '.', '='];

        if (validKeys.includes(key)) {
            event.preventDefault();
            this.handleButtonClick(key === '=' ? '=' : key);
        } else if (key === 'Enter') {
            event.preventDefault();
            this.handleButtonClick('=');
        } else if (key === 'Backspace') {
            event.preventDefault();
            this.handleBackspace();
        } else if (key === 'Escape') {
            event.preventDefault();
            this.clearDisplay();
        }
    }

    /**
     * Apaga o último caractere do display.
     */
    handleBackspace() {
        const display = document.getElementById('display');
        display.value = display.value.slice(0, -1);
    }

    /**
     * Limpa o display da calculadora.
     */
    clearDisplay() {
        const display = document.getElementById('display');
        display.value = '';
    }
}

// --------------------------------------------------
//  CLASSE ImprovedBlindEqualization (Implementação do Algoritmo de Equalização Cega)
// --------------------------------------------------

/**
 * @class ImprovedBlindEqualization
 * @description Implementa o algoritmo de equalização cega aprimorado.
 */
class ImprovedBlindEqualization {
    /**
     * Cria uma instância de ImprovedBlindEqualization.
     * @param {number} [stepSize=0.01] - Tamanho do passo inicial.
     * @param {number} [alpha=0.1] - Parâmetro de ajuste do fator variável dinâmico.
     */
    constructor(stepSize = 0.01, alpha = 0.1) {
        this.weights = []; // Pesos do equalizador
        this.stepSize = stepSize;
        this.alpha = alpha;
        this.decisionThreshold = 1; // Limiar de decisão, ajuste conforme a modulação
    }

    /**
     * Inicializa os pesos do equalizador.
     * @param {number} numTaps - Número de taps do equalizador.
     */
    initializeWeights(numTaps) {
        this.weights = Array(numTaps).fill(0);
        this.weights[0] = 1; // Inicializa o tap central como 1
    }

    /**
     * Equaliza o sinal de entrada.
     * @param {number[]} inputSignal - O sinal de entrada a ser equalizado.
     * @returns {number[]} O sinal equalizado.
     */
    equalize(inputSignal) {
        const outputSignal = [];
        for (let i = 0; i < inputSignal.length; i++) {
            const inputVector = inputSignal.slice(Math.max(0, i - this.weights.length + 1), i + 1);
            const reversedInput = inputVector.slice().reverse(); // Inverte o vetor de entrada
            const paddedInput = Array(this.weights.length - reversedInput.length).fill(0).concat(reversedInput);
            const output = this.calculateOutput(paddedInput);
            outputSignal.push(output);
            this.updateWeights(paddedInput, output);
        }
        return outputSignal;
    }

    /**
     * Calcula a saída do equalizador.
     * @private
     * @param {number[]} input - O vetor de entrada.
     * @returns {number} A saída do equalizador.
     */
    calculateOutput(input) {
        let output = 0;
        for (let i = 0; i < this.weights.length; i++) {
            output += this.weights[i] * input[i];
        }
        return output;
    }

    /**
     * Atualiza os pesos do equalizador.
     * @private
     * @param {number[]} input - O vetor de entrada.
     * @param {number} output - A saída do equalizador.
     */
    updateWeights(input, output) {
        const decision = this.makeDecision(output);
        const error = decision - output;

        // Fator variável dinâmico
        const dynamicFactor = Math.abs(output) > this.decisionThreshold ? 1 : this.alpha;

        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] += dynamicFactor * this.stepSize * error * input[i];
        }
    }

    /**
     * Toma uma decisão sobre o símbolo de saída.
     * @private
     * @param {number} output - A saída do equalizador.
     * @returns {number} O símbolo decidido.
     */
    makeDecision(output) {
        // Decisão para QPSK (ajuste conforme a modulação)
        return output > 0 ? 1 : -1;
    }
}

// --------------------------------------------------
//  CLASSE APP (GERENCIAMENTO DA APLICAÇÃO)
// --------------------------------------------------
/**
 * @class App
 * @description Classe principal que gerencia a aplicação.
 */
class App {
    constructor() {
        this.contentDiv = document.getElementById('content'); // ডিফাইন করুন contentDiv
        /** @type {object} */
        this.i18n = {
            t: (key) => {
                const translations = {
                    'calculator': 'Calculadora',
                    'display': 'Visor',
                    'history': 'Histórico',
                    'returnToMenu': 'Voltar ao Menu',
                    'back': 'Voltar',
                    'calculationError': 'Erro no cálculo'
                    // adicionar outras traduções conforme necessário
                };
                return translations[key] || key;
            }
        };
        /** @type {Calculator} */
        this.calculator = new Calculator(this.i18n, this.contentDiv);
        this.notifications = new Notifications();
        this.forca = new Forca(this.contentDiv);
        this.jogoDaVelha = new JogoDaVelha(this.contentDiv);
        this.listaDeTarefas = new ListaDeTarefas(this.contentDiv);
    }
    /**
     * Inicializa a aplicação e configura o menu principal.
     */
    initialize() {
        this.setupMenu();
    }

    /**
     * Configura os event listeners para o menu principal.
     * @private
     */
    setupMenu() {
        document.querySelectorAll(".menu button").forEach(button => {
            button.addEventListener("click", () => {
                const option = parseInt(button.dataset.option);

                switch (option) {
                    case 1:
                        this.exibirOlaMundo();
                        break;
                    case 2:
                        this.lerNome();
                        break;
                    case 3:
                        this.showCalculator();
                        break;
                    case 4:
                        this.calculadoraIdade();
                        break;
                    case 5:
                        this.verificarNumeroPrimo();
                        break;
                    case 6:
                        this.calculadoraIMC();
                        break;
                    case 7:
                        this.conversorTemperatura();
                        break;
                    case 8:
                        this.geradorTabelaASCII();
                        break;
                    case 9:
                        this.showForca();
                        break;
                    case 10:
                        this.showJogoDaVelha();
                        break;
                    case 11:
                        this.showListaDeTarefas();
                        break;
                    case 12:
                        this.contentDiv.innerHTML = "<h2>Saindo do programa... Até mais!</h2>";
                        break;
                    default:
                        this.contentDiv.innerHTML = "<h2>Opção inválida. Tente novamente.</h2>";
                }
            });
        });
    }

    /**
     * Exibe a calculadora.
     */
    showCalculator() {
        this.contentDiv.innerHTML = this.calculator.render();
        this.calculator.initialize();
        this.calculator.setupEventListeners();
    }

    /**
     * Exibe o jogo da forca.
     */
    showForca() {
        this.forca.atualizarJogo();
    }

    /**
     * Exibe o jogo da velha.
     */
    showJogoDaVelha() {
        this.jogoDaVelha.renderBoard();
    }

    /**
     * Exibe a lista de tarefas.
     */
    showListaDeTarefas() {
        this.listaDeTarefas.renderTasks();
    }

    /**
     * Volta ao menu principal.
     */
    voltarAoMenu() {
        this.contentDiv.innerHTML = "";
    }

    /**
     * Exibe a mensagem de "Olá Mundo!".
     */
    exibirOlaMundo() {
        this.contentDiv.innerHTML = `
            <h2>Olá Mundo!</h2>
            <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
        `;
    }

    /**
     * Solicita e exibe o nome do usuário.
     */
    lerNome() {
        this.contentDiv.innerHTML = `
            <div class="input-group">
                <label for="nome">Digite seu nome:</label>
                <input type="text" id="nome">
            </div>
            <button onclick="app.exibirNome()">Exibir Nome</button>
            <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
            <div id="resultado-nome"></div>
        `;
    }

    /**
     * Exibe o nome digitado pelo usuário.
     */
    exibirNome() {
        const nome = document.getElementById("nome").value;
        if (nome.trim() !== "") {
            document.getElementById("resultado-nome").innerHTML = `
                <h2>Olá, ${utils.sanitizeInput(nome)}! Seja bem-vindo(a)!</h2>
            `;
        } else {
            this.notifications.show("Nome inválido!", "error");
        }
    }

    /**
     * Solicita e calcula a idade do usuário.
     */
    calculadoraIdade() {
        this.contentDiv.innerHTML = `
            <div class="input-group">
                <label for="anoNascimento">Digite o ano de nascimento:</label>
                <input type="number" id="anoNascimento">
            </div>
            <div class="input-group">
                <label for="anoAtual">Digite o ano atual:</label>
                <input type="number" id="anoAtual">
            </div>
            <button onclick="app.calcularIdade()">Calcular Idade</button>
            <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
            <div id="resultado-idade"></div>
        `;
    }

    /**
     * Calcula a idade com base no ano de nascimento e ano atual.
     */
    calcularIdade() {
        let anoNascimento = this.obterNumero("anoNascimento", true);
        let anoAtual = this.obterNumero("anoAtual", true);

        if (anoNascimento === null || anoAtual === null) {
            return; // Volta ao menu se a entrada for inválida
        }

        let idade = anoAtual - anoNascimento;

        // Valida se a idade é um número positivo
        if (idade >= 0) {
            document.getElementById("resultado-idade").innerHTML = `
                <h2>Sua idade é: ${idade} anos</h2>
            `;
        } else {
            this.notifications.show("A idade não pode ser negativa.", "error");
        }
    }

    /**
     * Solicita um número e verifica se é primo.
     */
    verificarNumeroPrimo() {
        this.contentDiv.innerHTML = `
            <div class="input-group">
                <label for="numeroPrimo">Digite um número inteiro positivo:</label>
                <input type="number" id="numeroPrimo">
            </div>
            <button onclick="app.verificarPrimo()">Verificar</button>
            <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
            <div id="resultado-primo"></div>
        `;
    }

    /**
     * Verifica se um número é primo.
     */
    verificarPrimo() {
        let numero = this.obterNumero("numeroPrimo", true);

        if (numero === null) {
            return; // Volta ao menu se a entrada for inválida
        }

        let primo = true;

        if (numero <= 1) {
            primo = false;
        } else {
            for (let i = 2; i <= numero / 2; i++) {
                if (numero % i === 0) {
                    primo = false;
                    break;
                }
            }
        }

        document.getElementById("resultado-primo").innerHTML = `
            <h2>${primo ? `${numero} é um número primo.` : `${numero} não é um número primo.`}</h2>
        `;
    }

    /**
     * Solicita peso e altura e calcula o IMC.
     */
    calculadoraIMC() {
        this.contentDiv.innerHTML = `
            <div class="input-group">
                <label for="peso">Digite seu peso (em kg):</label>
                <input type="number" id="peso">
            </div>
            <div class="input-group">
                <label for="altura">Digite sua altura (em metros. Ex: 1.75):</label>
                <input type="number" id="altura">
            </div>
            <button onclick="app.calcularIMC()">Calcular IMC</button>
            <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
            <div id="resultado-imc"></div>
        `;
    }

    /**
     * Calcula o IMC com base no peso e altura fornecidos.
     */
    calcularIMC() {
        let peso = this.obterNumero("peso");
        let altura = this.obterNumero("altura");

        if (peso === null || altura === null) {
            return; // Volta ao menu se a entrada for inválida
        }

        let imc = peso / (altura * altura);

        let classificacao = "";
        if (imc < 18.5) {
            classificacao = "Abaixo do peso.";
        } else if (imc >= 18.5 && imc < 25) {
            classificacao = "Peso normal.";
        } else if (imc >= 25 && imc < 30) {
            classificacao = "Sobrepeso.";
        } else if (imc >= 30 && imc < 35) {
            classificacao = "Obesidade Grau I";
        } else if (imc >= 35 && imc < 40) {
            classificacao = "Obesidade Grau II";
        } else {
            classificacao = "Obesidade Grau III";
        }

        document.getElementById("resultado-imc").innerHTML = `
            <h2>Seu IMC é: ${imc.toFixed(2).toLocaleString('pt-BR')}</h2>
            <p>Classificação: ${classificacao}</p>
        `;
    }

    /**
     * Solicita uma temperatura e um tipo de conversão e realiza a conversão.
     */
    conversorTemperatura() {
        this.contentDiv.innerHTML = `
            <div class="input-group">
                <label for="temperatura">Digite a temperatura:</label>
                <input type="number" id="temperatura">
            </div>
            <div class="input-group">
                <label for="tipoConversao">Escolha o tipo de conversão:</label>
                <select id="tipoConversao">
                    <option value="1">Celsius para Fahrenheit</option>
                    <option value="2">Celsius para Kelvin</option>
                    <option value="3">Fahrenheit para Celsius</option>
                    <option value="4">Fahrenheit para Kelvin</option>
                    <option value="5">Kelvin para Celsius</option>
                    <option value="6">Kelvin para Fahrenheit</option>
                </select>
            </div>
            <button onclick="app.converter()">Converter</button>
            <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
            <div id="resultado-conversao"></div>
        `;
    }

    /**
     * Converte a temperatura para o tipo de conversão selecionado.
     */
    converter() {
        let temperatura = this.obterNumero("temperatura");
        let tipoConversao = parseInt(document.getElementById("tipoConversao").value);

        if (temperatura === null) {
            return; // Volta ao menu se a entrada for inválida
        }

        let resultado;

        switch (tipoConversao) {
            case 1:
                resultado = (temperatura * 9) / 5 + 32;
                this.exibirResultadoConversao(temperatura, "°C", resultado, "°F");
                break;
            case 2:
                resultado = temperatura + 273.15;
                this.exibirResultadoConversao(temperatura, "°C", resultado, "K");
                break;
            case 3:
                resultado = ((temperatura - 32) * 5) / 9;
                this.exibirResultadoConversao(temperatura, "°F", resultado, "°C");
                break;
            case 4:
                resultado = ((temperatura - 32) * 5) / 9 + 273.15;
                this.exibirResultadoConversao(temperatura, "°F", resultado, "K");
                break;
            case 5:
                resultado = temperatura - 273.15;
                this.exibirResultadoConversao(temperatura, "K", resultado, "°C");
                break;
            case 6:
                resultado = (temperatura - 273.15) * 9 / 5 + 32;
                this.exibirResultadoConversao(temperatura, "K", resultado, "°F");
                break;
            default:
                this.notifications.show("Opção de conversão inválida.", "error");
                return;
        }
    }

    /**
     * Exibe o resultado da conversão de temperatura.
     * @param {number} temperatura - Temperatura original.
     * @param {string} unidadeOriginal - Unidade original.
     * @param {number} resultado - Temperatura convertida.
     * @param {string} unidadeConvertida - Unidade convertida.
     */
    exibirResultadoConversao(temperatura, unidadeOriginal, resultado, unidadeConvertida) {
        document.getElementById("resultado-conversao").innerHTML = `
            <h2>${temperatura.toFixed(1).toLocaleString('pt-BR')}${unidadeOriginal} equivalem a ${resultado.toFixed(1).toLocaleString('pt-BR')}${unidadeConvertida}</h2>
        `;
    }

    /**
     * Gera e exibe a tabela ASCII.
     */
    geradorTabelaASCII() {
        let tabela = `
            <h2>Tabela ASCII</h2>
            <div class="tabela-ascii">
                <table>
                    <thead>
                        <tr>
                            <th>Decimal</th>
                            <th>Caractere</th>
                            <th>Hexadecimal</th>
                            <th>Octal</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (let i = 0; i <= 127; i++) {
            tabela += `
                <tr>
                    <td>${i}</td>
                    <td>${String.fromCharCode(i)}</td>
                    <td>${i.toString(16)}</td>
                    <td>${i.toString(8)}</td>
                </tr>
            `;
        }

        tabela += `
                    </tbody>
                </table>
            </div>
            <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
        `;

        this.contentDiv.innerHTML = tabela;
    }

    /**
     * Obtém um número do campo de entrada especificado.
     * @param {string} idElemento - O ID do elemento do campo de entrada.
     * @param {boolean} [inteiro=false] - Se verdadeiro, retorna um inteiro, caso contrário, um float.
     * @returns {number|null} O número obtido ou null se a entrada for inválida.
     */
    obterNumero(idElemento, inteiro = false) {
        let valor = document.getElementById(idElemento).value;

        if (valor.trim() === "" || (inteiro && !/^-?\d+$/.test(valor)) || (!inteiro && !/^-?\d+(\.\d+)?$/.test(valor))) {
            this.notifications.show("Entrada inválida. Por favor, digite um número válido.", "error");
            return null;
        }

        return inteiro ? parseInt(valor) : parseFloat(valor);
    }
}

// --------------------------------------------------
//  INICIALIZAÇÃO DA APLICAÇÃO
// --------------------------------------------------

/**
 * @global
 * @description Instância principal da aplicação.
 * @type {App}
 */
let app;

/**
 * @global
 * @description Função chamada quando o script math.js é carregado.
 */
function initializeApp() {
    app = new App();
    app.initialize();

    // Configura o modo escuro após a inicialização da App
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Verifica se o modo noturno está ativado no localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', () => {
        console.log("DarkMode toggle changed:", darkModeToggle.checked);
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

function loadMathLibrary() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.7.0/math.min.js';
    script.onload = () => {
        console.log('Math.js loaded.');
        initializeApp();
    };
    script.onerror = () => {
        console.error('Erro ao carregar Math.js.');
    };
    document.head.appendChild(script);
}

// Inicializa a aplicação após o DOM ser carregado
document.addEventListener('DOMContentLoaded', () => {
    loadMathLibrary();
});