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
		this.queue.push({
			message,
			type
		});
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
//  JOGO DA VELHA - Inteligência Aprimorada
// --------------------------------------------------
/**
 * @class JogoDaVelha
 * @description Gerencia a lógica do Jogo da Velha com IA aprimorada.
 */
class JogoDaVelha {
	constructor(contentDiv) {
		this.contentDiv = contentDiv;
		this.currentPlayer = 'X'; // Jogador humano começa como 'X'
		this.gameBoard = ['', '', '', '', '', '', '', '', '']; // Tabuleiro vazio
		this.gameActive = true; // Jogo ativo no início
	}

	/**
	 * @method renderBoard
	 * @description Renderiza o tabuleiro do jogo e os elementos da interface.
	 */
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

	/**
	 * @method handleClick
	 * @param {number} index - Índice da célula clicada.
	 * @description Lida com o clique em uma célula do tabuleiro.
	 */
	handleClick(index) {
		if (this.gameBoard[index] === '' && this.gameActive) {
			this.gameBoard[index] = this.currentPlayer;
			this.renderCell(index);
			if (this.checkWinner()) {
				this.updateStatus();
				this.gameActive = false;
				return;
			}
			if (this.isBoardFull()) { // Verifica empate aqui também
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

	/**
	 * @method renderCell
	 * @param {number} index - Índice da célula a ser renderizada.
	 * @description Adiciona a classe do jogador ('X' ou 'O') à célula correspondente no tabuleiro visual.
	 */
	renderCell(index) {
		const cell = document.querySelector(`.grid .cell:nth-child(${index + 1})`);
		cell.classList.add(this.currentPlayer);
	}

	/**
	 * @method togglePlayer
	 * @description Alterna o jogador atual entre 'X' e 'O'.
	 */
	togglePlayer() {
		this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
	}

	/**
	 * @method checkWinner
	 * @returns {boolean} - Retorna true se houver um vencedor ou empate, false caso contrário.
	 * @description Verifica se há um vencedor no jogo ou se o jogo empatou.
	 */
	checkWinner() {
		const winPatterns = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
			[0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
			[0, 4, 8], [2, 4, 6]          // Diagonais
		];

		for (const pattern of winPatterns) {
			const [a, b, c] = pattern;
			if (this.gameBoard[a] && this.gameBoard[a] === this.gameBoard[b] && this.gameBoard[a] === this.gameBoard[c]) {
				return this.gameBoard[a]; // Retorna o jogador vencedor ('X' ou 'O')
			}
		}
		return null; // Retorna null se não houver vencedor ainda
	}

	/**
	 * @method isBoardFull
	 * @returns {boolean} - Retorna true se o tabuleiro estiver cheio (empate), false caso contrário.
	 * @description Verifica se todas as células do tabuleiro estão preenchidas.
	 */
	isBoardFull() {
		return this.gameBoard.every(cell => cell !== '');
	}


	/**
	 * @method updateStatus
	 * @description Atualiza a mensagem de status do jogo na interface, exibindo o jogador da vez, o vencedor ou empate.
	 */
	updateStatus() {
		if (!this.gameActive) return; // Não atualiza se o jogo não estiver ativo

		const winner = this.checkWinner();
		const status = document.querySelector('.status');

		if (winner) {
			status.textContent = `Jogador ${winner} venceu!`; // Exibe o jogador vencedor
			this.gameActive = false; // Desativa o jogo após vitória
		} else if (this.isBoardFull()) {
			status.textContent = 'Empate!'; // Exibe mensagem de empate
			this.gameActive = false; // Desativa o jogo após empate
		} else {
			status.textContent = `Vez do Jogador ${this.currentPlayer}`; // Exibe o jogador atual
		}
	}

	/**
	 * @method makeComputerMove
	 * @description Determina e executa o movimento do computador ('O') com lógica de IA (nível fácil/médio).
	 */
	makeComputerMove() {
		if (!this.gameActive || this.currentPlayer !== 'O') return; // Impede movimento se o jogo acabou ou não for vez do computador

		let bestMoveIndex = this.getBestMove(); // Obtém o melhor movimento usando a IA

		if (bestMoveIndex !== null) {
			this.gameBoard[bestMoveIndex] = 'O'; // Faz o movimento no tabuleiro
			this.renderCell(bestMoveIndex);  // Renderiza o movimento visualmente

			if (this.checkWinner()) {      // Verifica se o computador venceu
				this.updateStatus();       // Atualiza o status do jogo
				this.gameActive = false;     // Desativa o jogo se o computador venceu
				return;
			}
			if (this.isBoardFull()) {      // Verifica se o jogo empatou
				this.updateStatus();       // Atualiza o status para empate
				this.gameActive = false;     // Desativa o jogo em caso de empate
				return;
			}

			this.togglePlayer();         // Passa a vez para o jogador humano
			this.updateStatus();       // Atualiza a interface para refletir a vez do jogador humano
		}
	}


	/**
	 * @method getBestMove
	 * @returns {number|null} - Retorna o índice do melhor movimento para o computador ou null se não houver movimentos possíveis.
	 * @description Implementa a lógica de IA para o computador encontrar o melhor movimento, priorizando vitória, bloqueio e jogadas estratégicas.
	 */
	getBestMove() {
		// 1. Tenta vencer: Verifica se o computador pode vencer no próximo movimento
		for (let i = 0; i < 9; i++) {
			if (this.gameBoard[i] === '') {
				this.gameBoard[i] = 'O'; // Simula movimento do computador
				if (this.checkWinner() === 'O') { // Verifica se este movimento vence
					this.gameBoard[i] = ''; // Desfaz a simulação
					return i;                // Retorna o índice para vencer
				}
				this.gameBoard[i] = ''; // Desfaz a simulação
			}
		}

		// 2. Tenta bloquear: Verifica se o jogador humano pode vencer no próximo movimento e bloqueia
		for (let i = 0; i < 9; i++) {
			if (this.gameBoard[i] === '') {
				this.gameBoard[i] = 'X'; // Simula movimento do jogador humano
				if (this.checkWinner() === 'X') { // Verifica se o jogador humano venceriathis.gameBoard[i] = ''; // Desfaz a simulação
					return i;                // Retorna o índice para bloquear
				}
				this.gameBoard[i] = ''; // Desfaz a simulação
			}
		}

		// 3. Movimento Estratégico: Prioriza o centro, cantos e depois os lados
		const strategicMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Centro, Cantos, Lados
		for (const move of strategicMoves) {
			if (this.gameBoard[move] === '') {
				return move; // Retorna o primeiro movimento estratégico disponível
			}
		}

		// 4. Fallback: Se nenhum movimento estratégico estiver disponível (não deve acontecer em um jogo normal de Jogo da Velha com IA bem implementada neste nível, mas por segurança)
		return null; // ou poderia retornar um movimento aleatório de células vazias, se necessário como último recurso. Em teoria, com as prioridades acima, sempre haverá um movimento válido a ser retornado antes de chegar aqui em um jogo de Jogo da Velha que não terminou em empate.
	}


	/**
	 * @method reiniciarJogo
	 * @description Reinicia o jogo, resetando o tabuleiro, o jogador atual e o estado do jogo.
	 */
	reiniciarJogo() {
		this.currentPlayer = 'X'; // Jogador 'X' (humano) começa sempre
		this.gameBoard = ['', '', '', '', '', '', '', '', '']; // Limpa o tabuleiro
		this.gameActive = true; // Reativa o jogo
		this.renderBoard(); // Renderiza o tabuleiro vazio novamente
	}
}

// --------------------------------------------------
//  LISTA DE TAREFAS - Inteligência Aprimorada (Refatoração e Melhorias)
// --------------------------------------------------
/**
 * @class ListaDeTarefas
 * @description Gerencia a lógica da Lista de Tarefas com renderização aprimorada e melhor organização.
 */
class ListaDeTarefas {
	constructor(contentDiv) {
		this.contentDiv = contentDiv;
		this.tasks = this.loadTasks(); // Carrega tarefas do localStorage no construtor
	}

	/**
	 * @method loadTasks
	 * @returns {Array<object>} - Array de tarefas carregadas do localStorage ou um array vazio se não houver tarefas salvas.
	 * @description Carrega as tarefas do localStorage ou inicializa com um array vazio.
	 */
	loadTasks() {
		const storedTasks = localStorage.getItem('tasks');
		return storedTasks ? JSON.parse(storedTasks) : [];
	}

	/**
	 * @method saveTasks
	 * @description Salva o array de tarefas atual no localStorage.
	 */
	saveTasks() {
		localStorage.setItem('tasks', JSON.stringify(this.tasks));
	}

	/**
	 * @method renderTasks
	 * @description Renderiza a estrutura HTML principal da lista de tarefas e lista as tarefas.
	 */
	renderTasks() {
		this.contentDiv.innerHTML = `
            <div class="todo-container fade-in">
                <h2>Lista de Tarefas</h2>
                <div class="todo-header">
                    <input type="text" id="taskInput" placeholder="Adicione uma tarefa" aria-label="Nova tarefa">
                    <button id="addTaskBtn">Adicionar</button>
                </div>
                <ul class="todo-list">
                    ${this.renderTaskListItems()}
                </ul>
                <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
            </div>
        `;
		this.setupEventListeners(); // Configura os event listeners após renderizar o HTML
	}

	/**
	 * @method renderTaskListItems
	 * @private
	 * @returns {string} - HTML string contendo os list items para cada tarefa.
	 * @description Gera o HTML para cada item da lista de tarefas baseado no array de tarefas atual.
	 */
	renderTaskListItems() {
		return this.tasks.map((task, index) => `
            <li class="todo-item">
                <input type="checkbox" id="task-${index}" ${task.completed ? 'checked' : ''} aria-labelledby="task-label-${index}">
                <span id="task-label-${index}" class="${task.completed ? 'completed' : ''}">${utils.sanitizeInput(task.text)}</span>
                <button class="delete-btn" data-index="${index}" aria-label="Excluir tarefa ${task.text}">Excluir</button>
            </li>`
		).join(''); // .join('') para converter o array de strings HTML em uma única string
	}


	/**
	 * @method setupEventListeners
	 * @private
	 * @description Configura os event listeners para os botões e checkboxes dentro da lista de tarefas.
	 */
	setupEventListeners() {
		document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());

		const taskList = document.querySelector('.todo-list');
		taskList.addEventListener('change', (event) => { // Delegação de eventos para checkboxes
			if (event.target.type === 'checkbox') {
				const index = parseInt(event.target.id.split('-')[1], 10); // Extrai o índice do ID
				this.toggleTask(index);
			}
		});

		taskList.addEventListener('click', (event) => { // Delegação de eventos para botões de delete
			if (event.target.classList.contains('delete-btn')) {
				const index = parseInt(event.target.dataset.index, 10);
				this.deleteTask(index);
			}
		});
	}


	/**
	 * @method addTask
	 * @description Adiciona uma nova tarefa à lista, obtendo o texto do input, validando-o e atualizando a UI e o localStorage.
	 */
	addTask() {
		const taskInput = document.getElementById('taskInput');
		const taskText = taskInput.value.trim();

		if (!taskText) {
			alert("Por favor, insira uma tarefa antes de adicionar."); // Feedback amigável para o usuário
			return; // Impede adicionar tarefa vazia
		}

		this.tasks.push({ text: taskText, completed: false });
		this.saveTasks(); // Salva no localStorage após adicionar
		taskInput.value = ''; // Limpa o input
		this.updateTaskListUI(); // Atualiza apenas a lista de tarefas na UI
	}


	/**
	 * @method toggleTask
	 * @param {number} index - Índice da tarefa a ser alternada (concluída/não concluída).
	 * @description Marca uma tarefa como concluída ou não concluída, atualizando a UI e o localStorage.
	 */
	toggleTask(index) {
		if (index >= 0 && index < this.tasks.length) { // Validação de índice
			this.tasks[index].completed = !this.tasks[index].completed;
			this.saveTasks(); // Salva no localStorage após alterar o estado da tarefa
			this.updateTaskItemUI(index); // Atualiza apenas o item da tarefa específico na UI
		} else {
			console.error('Índice de tarefa inválido:', index); // Log de erro para debug
		}
	}

	/**
	 * @method deleteTask
	 * @param {number} index - Índice da tarefa a ser excluída.
	 * @description Exclui uma tarefa da lista, atualizando a UI e o localStorage.
	 */
	deleteTask(index) {
		if (index >= 0 && index < this.tasks.length) { // Validação de índice
			this.tasks.splice(index, 1);
			this.saveTasks(); // Salva no localStorage após excluir
			this.updateTaskListUI(); // Atualiza a lista de tarefas na UI
		} else {
			console.error('Índice de tarefa inválido:', index); // Log de erro para debug
		}
	}

	/**
	 * @method updateTaskListUI
	 * @private
	 * @description Renderiza novamente apenas a lista de itens de tarefas dentro da UL, de forma eficiente.
	 */
	updateTaskListUI() {
		const taskList = document.querySelector('.todo-list');
		if (taskList) {
			taskList.innerHTML = this.renderTaskListItems(); // Atualiza apenas o conteúdo da lista (UL)
			this.setupEventListenersForListItems(); // Reconfigura event listeners para os novos list items
		}
	}

	/**
	 * @method updateTaskItemUI
	 * @private
	 * @param {number} index - Índice do item da tarefa a ser atualizado na UI.
	 * @description Atualiza um único item da tarefa na UI (e.g., para mudar a classe 'completed').
	 */
	updateTaskItemUI(index) {
		const listItem = document.querySelector(`.todo-list li:nth-child(${index + 1})`);
		if (listItem) {
			const task = this.tasks[index];
			const taskSpan = listItem.querySelector('span');
			const checkbox = listItem.querySelector('input[type="checkbox"]');

			if (taskSpan) taskSpan.className = task.completed ? 'completed' : ''; // Atualiza a classe do span
			if (checkbox) checkbox.checked = task.completed; // Atualiza o estado do checkbox
		}
	}

	/**
	 * @method setupEventListenersForListItems
	 * @private
	 * @description Configura event listeners especificamente para os itens da lista (checkboxes e delete buttons) após uma renderização parcial da lista.
	 *              Necessário após substituir o innerHTML da lista para re-ligar os eventos.
	 * @deprecated  -- Delegação de eventos no `setupEventListeners` tornou isto obsoleto, mantendo por referência ou possível uso futuro.
	 */
	setupEventListenersForListItems() { // @deprecated - Tornou-se redundante com a delegação no setupEventListeners principal
		// Implementação de event listeners para checkboxes e delete buttons em cada item da lista, se necessário em cenários de renderização parcial.
		// No modelo atual com delegação no 'setupEventListeners', esta função pode não ser mais necessária, mas é mantida como referência ou para cenários de uso futuro
	}
}

/* script.js */
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
		this.cache = new Cache(); // Supondo que Cache esteja definido em outro lugar se necessário
		this.mathParser = math; // Usando a biblioteca math.js (inclua na sua HTML)
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
			'0', '.', '=', '+',
			'CE', '%' // Botões adicionados: Clear Entry e Porcentagem
		];

		return buttons.map(button => {
			let className = 'calc-button';
			if (['/', '*', '-', '+', '%'].includes(button)) { // Incluindo '%' como operador
				className += ' operator';
			} else if (button === '=') {
				className += ' equal';
			} else if (button === 'CE') {
				className += ' clear-entry'; // Classe para o botão CE
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
		} else if (button === 'CE') {
			this.clearEntry(); // Limpa a entrada atual
		} else if (button === '%') {
			this.handlePercentage(); // Lida com o botão de porcentagem
		}
		else {
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
                <h2>Calculadora - Parecida com iphone</h2>
                <div class="calc-display" role="textbox" aria-label="${this.i18n.t('display')}">
                    <input type="text" id="display" value="0" readonly>
                </div>
                <div class="calc-buttons" role="group">
                    ${this.renderButtons()}
                </div>
                <div class="calc-history">
                    <h3>${this.i18n.t('history')}</h3>
                    <ul id="calcHistory" role="list"></ul>
                    <button class="clear-history" onclick="app.calculator.clearHistory()">${this.i18n.t('clearHistory') || 'Limpar Histórico'}</button>
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
			// Substitui a porcentagem pelo seu valor decimal antes de avaliar
			expression = expression.replace(/%/g, '/100');
			const result = this.mathParser.evaluate(expression);

			if (!isFinite(result)) {
				throw new Error(this.i18n.t('calculationError'));
			}

			this.addToHistory(expression, result);
			return result;
		} catch (error) {
			Logger.log(Logger.levels.ERROR, 'Erro no cálculo', {
				expression,
				error
			});
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
			Logger.log(Logger.levels.ERROR, 'Erro ao carregar histórico', {
				error
			});
		}
	}

	/**
	 * Salva o histórico no localStorage.
	 */
	saveHistory() {
		try {
			localStorage.setItem('calcHistory', JSON.stringify(this.history));
		} catch (error) {
			Logger.log(Logger.levels.ERROR, 'Erro ao salvar histórico', {
				error
			});
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
		const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '*', '-', '+', '.', '=', '%']; // Adicionado '%' como tecla válida

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
		display.value = '0'; // Define o valor para '0' ao invés de vazio
	}

	/**
	 * Limpa a entrada atual no display (botão CE).
	 */
	clearEntry() {
		this.clearDisplay(); // No exemplo, CE e Clear Display fazem o mesmo (limpar para '0') - pode ajustar se necessário
	}

	/**
	 * Manipula o botão de porcentagem.
	 */
	handlePercentage() {
		const display = document.getElementById('display');
		let currentValue = parseFloat(display.value);
		if (!isNaN(currentValue)) {
			display.value = currentValue / 100; // Divide o valor atual por 100
			// Ou outra lógica de porcentagem que você desejar implementar
		}
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
 * Solicita e calcula a idade do usuário, com melhorias na interface e validação.
 */
	calculadoraIdade() {
		this.contentDiv.innerHTML = `
        <div class="input-group">
            <label for="anoNascimento">Ano de Nascimento:</label>
            <input type="number" id="anoNascimento" placeholder="Ex: 1990">
            <small class="error-message" id="anoNascimento-error"></small>
        </div>
        <div class="input-group">
            <label for="anoAtual">Ano Atual:</label>
            <input type="number" id="anoAtual" placeholder="${new Date().getFullYear()}">
            <small class="error-message" id="anoAtual-error"></small>
        </div>
        <button id="calcularIdadeBtn">Calcular Idade</button>
        <button id="voltarMenuBtn">Voltar ao Menu</button>
        <div id="resultado-idade" class="resultado-mensagem"></div>
    `;

		// Adiciona event listeners para os botões, evitando HTML inline
		document.getElementById('calcularIdadeBtn').addEventListener('click', () => this.processarCalculoIdade());
		document.getElementById('voltarMenuBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
 * Processa o cálculo da idade após obter e validar os anos de nascimento e atual.
 * Este método é chamado ao clicar no botão 'Calcular Idade' na interface.
 */
	processarCalculoIdade() {
		// 1. Obter valores dos campos de input e tentar convertê-los para números.
		const anoNascimento = this.obterNumero("anoNascimento");
		const anoAtual = this.obterNumero("anoAtual");

		// 2. Limpar quaisquer mensagens de erro exibidas anteriormente.
		this.limparMensagensErro();

		// 3. Validar as entradas do usuário:
		if (anoNascimento === null) {
			this.mostrarMensagemErro("anoNascimento", "Ano de nascimento inválido. Digite um número.");
			return; // Aborta o processamento se a entrada for inválida.
		}
		if (anoAtual === null) {
			this.mostrarMensagemErro("anoAtual", "Ano atual inválido. Digite um número.");
			return; // Aborta o processamento se a entrada for inválida.
		}

		if (anoNascimento > anoAtual) {
			this.mostrarMensagemErro("anoNascimento", "O ano de nascimento não pode ser posterior ao ano atual.");
			this.mostrarMensagemErro("anoAtual", "O ano atual não pode ser anterior ao ano de nascimento.");
			return; // Aborta se os anos forem logicamente inválidos.
		}

		const anoCorrente = new Date().getFullYear();
		if (anoAtual > anoCorrente + 1) { // Limite de segurança para ano atual (considerando o próximo ano como razoável)
			this.mostrarMensagemErro("anoAtual", `Por favor, insira um ano atual válido (até ${anoCorrente + 1}).`);
			return; // Aborta se o ano atual for irrealista.
		}

		// 4. Calcular a idade (somente se todas as validações passarem).
		const idade = anoAtual - anoNascimento;

		// 5. Exibir o resultado na interface do usuário.
		if (idade >= 0) {
			document.getElementById("resultado-idade").innerHTML = `
            <h2>Sua idade é: <span class="idade-valor">${idade}</span> anos</h2>
        `;
		} else {
			// 6. Caso improvável de idade negativa após validações, exibir mensagem de erro genérica.
			//    Este bloco deve ser dificilmente atingido pelas validações robustas.
			this.notifications.show("Erro inesperado ao calcular a idade.", "error");
		}
	}


	/**
	 * Obtém o valor de um campo de input pelo ID, tenta convertê-lo para um número,
	 * e valida se o resultado é realmente um número (não NaN).
	 *
	 * @param {string} idDoElemento - O ID do elemento input do qual obter o valor.
	 * @returns {number|null} - O número obtido do campo de input, ou null se a entrada não for um número válido.
	 */
	obterNumero(idDoElemento) {
		const valorInput = document.getElementById(idDoElemento).value;
		const numero = Number(valorInput); // Converte a string para um número.

		// 1. Verificar se a conversão resultou em um número válido (não NaN - Not a Number).
		if (isNaN(numero)) {
			return null; // Retorna null se a conversão falhar, indicando entrada não numérica.
		}

		// 2. Retornar o número convertido se for válido.
		return numero;
	}

	/**
	 * Limpa todas as mensagens de erro exibidas.
	 */
	limparMensagensErro() {
		let errorMessages = document.querySelectorAll('.error-message');
		errorMessages.forEach(message => message.textContent = '');
	}

	/**
	 * Exibe uma mensagem de erro abaixo do campo de input especificado.
	 * @param {string} elementoId - ID do elemento input.
	 * @param {string} mensagem - Mensagem de erro a ser exibida.
	 */
	mostrarMensagemErro(elementoId, mensagem) {
		let errorElement = document.getElementById(elementoId + "-error");
		if (errorElement) {
			errorElement.textContent = mensagem;
		} else {
			console.error("Elemento de erro não encontrado para ID:", elementoId);
		}
	}

	/**
 * Inicializa a interface para verificar se um número é primo.
 * Solicita ao usuário que digite um número inteiro positivo.
 */
	verificarNumeroPrimo() {
		this.contentDiv.innerHTML = `
        <div class="input-group">
            <label for="numeroPrimo">Digite um número inteiro positivo:</label>
            <input type="number" id="numeroPrimo" placeholder="Ex: 17">
            <small class="error-message" id="numeroPrimo-error"></small>
        </div>
        <button id="verificarPrimoBtn">Verificar</button>
        <button id="voltarMenuBtn">Voltar ao Menu</button>
        <div id="resultado-primo" class="resultado-mensagem"></div>
    `;

		// Adiciona listeners de evento para os botões usando addEventListener
		document.getElementById('verificarPrimoBtn').addEventListener('click', () => this.processarVerificacaoPrimo());
		document.getElementById('voltarMenuBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
	 * Processa a verificação se o número inserido é primo, após validação.
	 */
	processarVerificacaoPrimo() {
		// 1. Obtém o número do input e tenta convertê-lo para número.
		const numeroInput = document.getElementById("numeroPrimo");
		const numero = this.obterNumero("numeroPrimo"); // Já retorna null se não for um número válido

		// 2. Limpa mensagens de erro anteriores.
		this.limparMensagensErro();

		// 3. Validação da entrada:
		if (numero === null) {
			this.mostrarMensagemErro("numeroPrimo", "Por favor, digite um número inteiro válido.");
			return; // Aborta se a entrada não for um número.
		}

		if (!Number.isInteger(numero) || numero <= 0) {
			this.mostrarMensagemErro("numeroPrimo", "Digite um número inteiro *positivo*.");
			return; // Aborta se não for um inteiro positivo.
		}

		// 4. Verifica se o número é primo.
		const ehPrimo = this.isPrimo(numero);

		// 5. Exibe o resultado na interface.
		const resultadoTexto = ehPrimo ? `<span class="primo-valor">${numero}</span> é um número primo.` : `<span class="nao-primo-valor">${numero}</span> não é um número primo.`;
		document.getElementById("resultado-primo").innerHTML = `<h2>${resultadoTexto}</h2>`;
	}

	/**
	 * Determina se um número é primo.
	 * Implementa uma otimização simples: verifica divisores até a raiz quadrada do número.
	 * @param {number} numero - O número a ser verificado.
	 * @returns {boolean} - True se o número for primo, false caso contrário.
	 */
	isPrimo(numero) {
		if (numero <= 1) return false; // Números menores ou iguais a 1 não são primos.
		if (numero <= 3) return true;  // 2 e 3 são primos.

		// Se divisível por 2 ou 3, não é primo.
		if (numero % 2 === 0 || numero % 3 === 0) return false;

		// Verifica apenas até a raiz quadrada de 'numero'.
		// Otimização: incrementa de 6 em 6, verificando i e i+2, pois já excluímos divisíveis por 2 e 3.
		for (let i = 5; i * i <= numero; i = i + 6) {
			if (numero % i === 0 || numero % (i + 2) === 0) return false;
		}

		return true; // Se não encontrou divisores, é primo.
	}


	/**
	 * Obtém um número do campo de input, validando se é um número.
	 * Retorna null se não for um número.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	obterNumero(idDoElemento) {
		const valorInput = document.getElementById(idDoElemento).value;
		const numero = Number(valorInput);

		if (isNaN(numero)) {
			return null;
		}
		return numero;
	}

	/**
	 * Limpa todas as mensagens de erro exibidas.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	limparMensagensErro() {
		const errorMessages = document.querySelectorAll('.error-message');
		errorMessages.forEach(message => message.textContent = '');
	}

	/**
	 * Exibe uma mensagem de erro abaixo do campo de input especificado.
	 * @param {string} elementoId - ID do elemento input.
	 * @param {string} mensagem - Mensagem de erro a ser exibida.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	mostrarMensagemErro(elementoId, mensagem) {
		const errorElement = document.getElementById(elementoId + "-error");
		if (errorElement) {
			errorElement.textContent = mensagem;
		} else {
			console.error("Elemento de erro não encontrado para ID:", elementoId);
		}
	}

	/**
 * Inicializa a interface para a calculadora de IMC.
 * Solicita peso (em kg) e altura (em metros) do usuário.
 */
	calculadoraIMC() {
		this.contentDiv.innerHTML = `
        <div class="input-group">
            <label for="peso">Digite seu peso (em kg):</label>
            <input type="number" id="peso" placeholder="Ex: 75">
            <small class="error-message" id="peso-error"></small>
        </div>
        <div class="input-group">
            <label for="altura">Digite sua altura (em metros):</label>
            <input type="number" id="altura" placeholder="Ex: 1.75" step="0.01">
            <small class="error-message" id="altura-error"></small>
        </div>
        <button id="calcularIMCBtn">Calcular IMC</button>
        <button id="voltarMenuBtn">Voltar ao Menu</button>
        <div id="resultado-imc" class="resultado-mensagem"></div>
    `;

		// Adiciona listeners de evento para os botões, evitando HTML inline
		document.getElementById('calcularIMCBtn').addEventListener('click', () => this.processarCalculoIMC());
		document.getElementById('voltarMenuBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
	 * Processa o cálculo do IMC após obter e validar peso e altura.
	 */
	processarCalculoIMC() {
		// 1. Obter valores dos inputs e tentar convertê-los para números.
		const peso = this.obterNumero("peso");
		const altura = this.obterNumero("altura");

		// 2. Limpar mensagens de erro anteriores.
		this.limparMensagensErro();

		// 3. Validação das entradas:
		if (peso === null) {
			this.mostrarMensagemErro("peso", "Peso inválido. Digite um número em kg.");
			return; // Aborta se o peso for inválido.
		}
		if (altura === null) {
			this.mostrarMensagemErro("altura", "Altura inválida. Digite um número em metros.");
			return; // Aborta se a altura for inválida.
		}

		if (peso <= 0) {
			this.mostrarMensagemErro("peso", "Peso deve ser maior que zero.");
			return; // Aborta se o peso for zero ou negativo.
		}
		if (altura <= 0 || altura > 3) { // Altura máxima razoável é 3 metros
			this.mostrarMensagemErro("altura", "Altura deve ser maior que zero e razoável (máximo 3 metros).");
			return; // Aborta se a altura for zero, negativa ou irrazoável.
		}

		// 4. Calcular o IMC.
		const imc = peso / (altura * altura);

		// 5. Determinar a classificação do IMC.
		const classificacao = this.classificarIMC(imc);

		// 6. Exibir o resultado na interface do usuário.
		document.getElementById("resultado-imc").innerHTML = `
        <h2>Seu IMC é: <span class="imc-valor">${imc.toFixed(2).toLocaleString('pt-BR')}</span></h2>
        <p class="imc-classificacao">Classificação: <span class="classificacao-valor">${classificacao}</span></p>
    `;
	}

	/**
	 * Classifica o IMC em categorias de peso.
	 * @param {number} imc - O valor do IMC.
	 * @returns {string} - A classificação do IMC.
	 */
	classificarIMC(imc) {
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
		return classificacao;
	}


	/**
	 * Obtém um número do campo de input, validando se é um número.
	 * Retorna null se não for um número.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	obterNumero(idDoElemento) {
		const valorInput = document.getElementById(idDoElemento).value;
		const numero = Number(valorInput);

		if (isNaN(numero)) {
			return null;
		}
		return numero;
	}

	/**
	 * Limpa todas as mensagens de erro exibidas.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	limparMensagensErro() {
		const errorMessages = document.querySelectorAll('.error-message');
		errorMessages.forEach(message => message.textContent = '');
	}

	/**
	 * Exibe uma mensagem de erro abaixo do campo de input especificado.
	 * @param {string} elementoId - ID do elemento input.
	 * @param {string} mensagem - Mensagem de erro a ser exibida.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	mostrarMensagemErro(elementoId, mensagem) {
		const errorElement = document.getElementById(elementoId + "-error");
		if (errorElement) {
			errorElement.textContent = mensagem;
		} else {
			console.error("Elemento de erro não encontrado para ID:", elementoId);
		}
	}

	/**
 * Inicializa a interface para o conversor de temperatura.
 * Solicita a temperatura e o tipo de conversão desejado.
 */
	conversorTemperatura() {
		this.contentDiv.innerHTML = `
        <div class="input-group">
            <label for="temperatura">Digite a temperatura:</label>
            <input type="number" id="temperatura" placeholder="Ex: 25">
            <small class="error-message" id="temperatura-error"></small>
        </div>
        <div class="input-group">
            <label for="tipoConversao">Escolha a conversão:</label>
            <select id="tipoConversao">
                <option value="">Selecione o tipo de conversão</option>
                <option value="1">Celsius para Fahrenheit</option>
                <option value="2">Celsius para Kelvin</option>
                <option value="3">Fahrenheit para Celsius</option>
                <option value="4">Fahrenheit para Kelvin</option>
                <option value="5">Kelvin para Celsius</option>
                <option value="6">Kelvin para Fahrenheit</option>
            </select>
            <small class="error-message" id="tipoConversao-error"></small>
        </div>
        <button id="converterBtn">Converter</button>
        <button id="voltarMenuBtn">Voltar ao Menu</button>
        <div id="resultado-conversao" class="resultado-mensagem"></div>
    `;

		// Adiciona listeners de evento para os botões usando addEventListener
		document.getElementById('converterBtn').addEventListener('click', () => this.processarConversao());
		document.getElementById('voltarMenuBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
	 * Processa a conversão de temperatura após validação da entrada.
	 */
	processarConversao() {
		// 1. Obter valores dos inputs e tentar convertê-los.
		const temperatura = this.obterNumero("temperatura");
		const tipoConversaoElement = document.getElementById("tipoConversao");
		const tipoConversao = parseInt(tipoConversaoElement.value);


		// 2. Limpar mensagens de erro anteriores.
		this.limparMensagensErro();

		// 3. Validação das entradas:
		if (temperatura === null) {
			this.mostrarMensagemErro("temperatura", "Temperatura inválida. Digite um número.");
			return; // Aborta se a temperatura for inválida.
		}

		if (tipoConversaoElement.value === "") {
			this.mostrarMensagemErro("tipoConversao", "Selecione o tipo de conversão.");
			return; // Aborta se o tipo de conversão não for selecionado.
		}

		if (isNaN(tipoConversao) || tipoConversao < 1 || tipoConversao > 6) {
			this.mostrarMensagemErro("tipoConversao", "Seleção de conversão inválida.");
			return; // Validação adicional para garantir que tipoConversao é um valor esperado.
		}

		let resultado;
		let unidadeOriginal, unidadeConvertida;

		// 4. Realizar a conversão com base no tipo selecionado.
		switch (tipoConversao) {
			case 1: // Celsius para Fahrenheit
				resultado = (temperatura * 9) / 5 + 32;
				unidadeOriginal = "°C";
				unidadeConvertida = "°F";
				break;
			case 2: // Celsius para Kelvin
				resultado = temperatura + 273.15;
				unidadeOriginal = "°C";
				unidadeConvertida = "K";
				break;
			case 3: // Fahrenheit para Celsius
				resultado = ((temperatura - 32) * 5) / 9;
				unidadeOriginal = "°F";
				unidadeConvertida = "°C";
				break;
			case 4: // Fahrenheit para Kelvin
				resultado = ((temperatura - 32) * 5) / 9 + 273.15;
				unidadeOriginal = "°F";
				unidadeConvertida = "K";
				break;
			case 5: // Kelvin para Celsius
				resultado = temperatura - 273.15;
				unidadeOriginal = "K";
				unidadeConvertida = "°C";
				break;
			case 6: // Kelvin para Fahrenheit
				resultado = (temperatura - 273.15) * 9 / 5 + 32;
				unidadeOriginal = "K";
				unidadeConvertida = "°F";
				break;
			default:
				// Este caso não deve ocorrer devido à validação anterior, mas é mantido como fallback.
				this.mostrarMensagemErro("tipoConversao", "Erro interno na seleção de conversão.");
				return;
		}

		// 5. Exibir o resultado da conversão na interface.
		this.exibirResultadoConversao(temperatura, unidadeOriginal, resultado, unidadeConvertida);
	}

	/**
	 * Exibe o resultado formatado da conversão de temperatura na interface.
	 * @param {number} temperatura - Temperatura original.
	 * @param {string} unidadeOriginal - Unidade original da temperatura.
	 * @param {number} resultado - Temperatura convertida.
	 * @param {string} unidadeConvertida - Unidade para a qual a temperatura foi convertida.
	 */
	exibirResultadoConversao(temperatura, unidadeOriginal, resultado, unidadeConvertida) {
		document.getElementById("resultado-conversao").innerHTML = `
        <h2><span class="temperatura-original">${temperatura.toFixed(1).toLocaleString('pt-BR')}</span><span class="unidade-original">${unidadeOriginal}</span> equivalem a <span class="temperatura-convertida">${resultado.toFixed(1).toLocaleString('pt-BR')}</span><span class="unidade-convertida">${unidadeConvertida}</span></h2>
    `;
	}


	/**
	 * Obtém um número do campo de input, validando se é um número.
	 * Retorna null se não for um número.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	obterNumero(idDoElemento) {
		const valorInput = document.getElementById(idDoElemento).value;
		const numero = Number(valorInput);

		if (isNaN(numero)) {
			return null;
		}
		return numero;
	}

	/**
	 * Limpa todas as mensagens de erro exibidas.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	limparMensagensErro() {
		const errorMessages = document.querySelectorAll('.error-message');
		errorMessages.forEach(message => message.textContent = '');
	}

	/**
	 * Exibe uma mensagem de erro abaixo do campo de input especificado.
	 * @param {string} elementoId - ID do elemento input.
	 * @param {string} mensagem - Mensagem de erro a ser exibida.
	 * (Função reutilizada e pode ser movida para um utilitário comum se aplicável)
	 */
	mostrarMensagemErro(elementoId, mensagem) {
		const errorElement = document.getElementById(elementoId + "-error");
		if (errorElement) {
			errorElement.textContent = mensagem;
		} else {
			console.error("Elemento de erro não encontrado para ID:", elementoId);
		}
	}

	/**
 * Gera e exibe a tabela ASCII de forma mais estruturada e legível.
 */
geradorTabelaASCII() {
    // 1. Inicializa o cabeçalho da tabela HTML.
    let tabelaHTML = `
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

    // 2. Loop para gerar as linhas da tabela ASCII para os códigos de 0 a 127.
    for (let codigoASCII = 0; codigoASCII <= 127; codigoASCII++) {
        tabelaHTML += this.gerarLinhaTabelaASCII(codigoASCII);
    }

    // 3. Finaliza a tabela HTML e adiciona o botão 'Voltar ao Menu'.
    tabelaHTML += `
                </tbody>
            </table>
        </div>
        <button id="voltarMenuASCIIBtn">Voltar ao Menu</button>
    `;

    // 4. Insere a tabela HTML completa e o botão no elemento contentDiv.
    this.contentDiv.innerHTML = tabelaHTML;

    // 5. Adiciona um listener de evento para o botão 'Voltar ao Menu' usando addEventListener.
    document.getElementById('voltarMenuASCIIBtn').addEventListener('click', () => this.voltarAoMenu());
}

/**
 * Gera uma linha (<tr>) da tabela ASCII para um código ASCII específico.
 * @param {number} codigoASCII - O código ASCII para gerar a linha.
 * @returns {string} - Uma string representando a linha <tr> da tabela ASCII.
 */
gerarLinhaTabelaASCII(codigoASCII) {
    // Converte o código ASCII para caractere, hexadecimal e octal.
    const caractere = String.fromCharCode(codigoASCII);
    const hexadecimal = codigoASCII.toString(16).toUpperCase(); // Converter para hexadecimal (base 16) e maiúsculas
    const octal = codigoASCII.toString(8); // Converter para octal (base 8)

    // Formata a linha da tabela (<tr>) com os dados.
    return `
        <tr>
            <td>${codigoASCII}</td>
            <td>${this.formatarCaractereASCII(caractere, codigoASCII)}</td>
            <td>${hexadecimal}</td>
            <td>${octal}</td>
        </tr>
    `;
}

/**
 * Formata o caractere ASCII para exibição na tabela.
 * Para caracteres de controle (códigos 0-31 e 127), exibe representações especiais.
 * @param {string} caractere - O caractere ASCII a ser formatado.
 * @param {number} codigoASCII - O código ASCII do caractere.
 * @returns {string} - O caractere formatado para exibição.
 */
formatarCaractereASCII(caractere, codigoASCII) {
    // Caracteres de controle ASCII (0-31 e 127) não são imprimíveis, então os representamos por nomes.
    if (codigoASCII < 32 || codigoASCII === 127) {
        return `<span class="caractere-controle">${this.obterNomeControleASCII(codigoASCII)} (Código ${codigoASCII})</span>`;
    } else {
        return caractere; // Caracteres imprimíveis são exibidos normalmente.
    }
}


/**
 * Obtém o nome descritivo de um caractere de controle ASCII.
 * @param {number} codigoASCII - O código ASCII do caractere de controle.
 * @returns {string} - O nome descritivo do caractere de controle.
 */
obterNomeControleASCII(codigoASCII) {
    // Mapeamento de alguns códigos de controle ASCII para nomes descritivos para melhor entendimento na tabela.
    const nomesControle = {
        0: "NUL (Null)",
        1: "SOH (Start of Heading)",
        2: "STX (Start of Text)",
        3: "ETX (End of Text)",
        4: "EOT (End of Transmission)",
        5: "ENQ (Enquiry)",
        6: "ACK (Acknowledgement)",
        7: "BEL (Bell)",
        8: "BS (Backspace)",
        9: "TAB (Tab)",
        10: "LF (Line Feed)",
        11: "VT (Vertical Tab)",
        12: "FF (Form Feed)",
        13: "CR (Carriage Return)",
        14: "SO (Shift Out)",
        15: "SI (Shift In)",
        16: "DLE (Data Link Escape)",
        17: "DC1 (Device Control 1)",
        18: "DC2 (Device Control 2)",
        19: "DC3 (Device Control 3)",
        20: "DC4 (Device Control 4)",
        21: "NAK (Negative Acknowledgement)",
        22: "SYN (Synchronous Idle)",
        23: "ETB (End of Transmission Block)",
        24: "CAN (Cancel)",
        25: "EM (End of Medium)",
        26: "SUB (Substitute)",
        27: "ESC (Escape)",
        28: "FS (File Separator)",
        29: "GS (Group Separator)",
        30: "RS (Record Separator)",
        31: "US (Unit Separator)",
        127: "DEL (Delete)"
    };
    return nomesControle[codigoASCII] || `Control Code ${codigoASCII}`; // Retorna nome ou um genérico se não mapeado.
}


/**
 * Obtém um número do campo de entrada especificado.
 * @param {string} idElemento - O ID do elemento do campo de entrada.
 * @param {boolean} [inteiro=false] - Se verdadeiro, retorna um inteiro, caso contrário, um float.
 * @returns {number|null} O número obtido ou null se a entrada for inválida.
 * (Função reutilizada - manter conforme necessário)
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