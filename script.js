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
	sanitizeInput: function(input) {
		return input.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
	},
	/**
	 * Formata um número para o padrão brasileiro.
	 * @memberof utils
	 * @param {number} number - O número a ser formatado.
	 * @returns {string} O número formatado.
	 */
	formatNumber: function(number) {
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
	log: function(level, message, data = {}) {
		console.log(`[${level}] ${message}`, data);
	}
};


// --------------------------------------------------
//  CACHE
// --------------------------------------------------

/**
 * @class Cache
 * @description Implementa uma funcionalidade simples de cache para armazenar e recuperar dados temporariamente.
 */
class Cache {
	constructor() {
		/** @private */
		this.storage = {};
	}

	/**
	 * Obtém um valor do cache usando sua chave.
	 * @param {string} key - A chave de identificação do valor a ser recuperado.
	 * @returns {*} O valor em cache se for válido e não expirado, caso contrário, retorna null.
	 */
	get(key) {
		const item = this.storage[key];
		if (item && Date.now() < item.expires) {
			return item.value;
		}
		delete this.storage[key]; // Remove o item expirado do cache.
		return null;
	}

	/**
	 * Define um valor no cache associado a uma chave, com tempo de vida (TTL) opcional.
	 * @param {string} key - A chave para armazenar o valor no cache.
	 * @param {*} value - O valor a ser armazenado no cache.
	 * @param {number} [ttl=3600000] - Tempo de vida (Time To Live) em milissegundos antes de expirar (padrão: 1 hora).
	 */
	set(key, value, ttl = 3600000) {
		this.storage[key] = {
			value,
			expires: Date.now() + ttl // Calcula o tempo de expiração baseado no TTL fornecido e no tempo atual.
		};
	}
}

// --------------------------------------------------
//  NOTIFICAÇÕES
// --------------------------------------------------
/**
 * @class Notifications
 * @description Gerencia a exibição de notificações em sequência, utilizando uma fila para controlar a ordem e tempo de exibição.
 */
class Notifications {
	constructor() {
		/** @private */
		this.queue = [];
		/** @private */
		this.isDisplaying = false;
	}

	/**
	 * Adiciona uma nova notificação à fila para ser exibida.
	 * @param {string} message - A mensagem de texto a ser exibida na notificação.
	 * @param {string} [type='info'] - O tipo da notificação ('info' ou 'error'), que define o estilo visual.
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
		this.palavraSecreta = this.escolherPalavra(); // Define a palavra a ser adivinhada
		this.letrasErradas = [];
		this.letrasCorretas = [];
		this.maxErros = 6;
		this.erros = 0;
	}

	/**
	 * @private
	 */
	escolherPalavra() {
		return this.palavras[Math.floor(Math.random() * this.palavras.length)]; // Retorna uma palavra aleatória do array
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

		document.getElementById('btn-adivinhar').addEventListener('click', () => this.adivinharLetra()); // Evento do botão "Adivinhar"
		document.getElementById('letra-input').addEventListener('keyup', (event) => { // Evento para Enter no input
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
		letraInput.value = ''; // Limpa o input

		if (!letra.match(/[a-z]/i)) { // Valida se é letra
			document.getElementById('forca-mensagem').textContent = 'Por favor, digite uma letra válida.';
			return;
		}

		if (this.letrasCorretas.includes(letra) || this.letrasErradas.includes(letra)) { // Verifica se letra já foi tentada
			document.getElementById('forca-mensagem').textContent = 'Você já tentou essa letra. Tente outra.';
			return;
		}

		if (this.palavraSecreta.includes(letra)) {
			this.letrasCorretas.push(letra); // Acertou a letra
		} else {
			this.letrasErradas.push(letra); // Errou a letra
			this.erros++; // Incrementa erros
		}

		this.atualizarJogo(); // Atualiza a tela

		if (this.erros === this.maxErros) { // Perdeu o jogo
			document.getElementById('forca-mensagem').textContent = `Você perdeu! A palavra era ${this.palavraSecreta}.`;
			this.desabilitarJogo();
		} else if (!document.getElementById('forca-palavra').textContent.includes('_')) { // Ganhou o jogo
			document.getElementById('forca-mensagem').textContent = 'Parabéns! Você ganhou!';
			this.desabilitarJogo();
		}
	}

	/**
	 * @private
	 */
	desabilitarJogo() {
		document.getElementById('letra-input').disabled = true; // Desabilita input
		document.getElementById('btn-adivinhar').disabled = true; // Desabilita botão
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
		this.currentPlayer = 'X'; // Jogador humano começa
		this.gameBoard = ['', '', '', '', '', '', '', '', '']; // Tabuleiro vazio
		this.gameActive = true; // Jogo ativo
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
			cell.addEventListener('click', () => this.handleClick(i)); // Evento de clique na célula
			grid.appendChild(cell);
		}
		this.updateStatus(); // Status inicial
	}

	/**
	 * @method handleClick
	 * @param {number} index - Índice da célula clicada.
	 * @description Lida com o clique em uma célula do tabuleiro.
	 */
	handleClick(index) {
		if (this.gameBoard[index] === '' && this.gameActive) { // Célula vazia e jogo ativo?
			this.gameBoard[index] = this.currentPlayer; // Marca célula com jogador atual
			this.renderCell(index); // Atualiza visual da célula
			if (this.checkWinner()) { // Checa vitória
				this.updateStatus(); // Atualiza status de vitória
				this.gameActive = false; // Jogo inativo após vitória
				return;
			}
			if (this.isBoardFull()) { // Checa empate
				this.updateStatus(); // Atualiza status de empate
				this.gameActive = false; // Jogo inativo após empate
				return;
			}
			this.togglePlayer(); // Troca jogador
			this.updateStatus(); // Atualiza status do jogador da vez
			if (this.currentPlayer === 'O' && this.gameActive) { // Vez do computador?
				setTimeout(() => this.makeComputerMove(), 500); // IA joga após um delay
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
		cell.classList.add(this.currentPlayer); // Adiciona classe 'X' ou 'O'
	}

	/**
	 * @method togglePlayer
	 * @description Alterna o jogador atual entre 'X' e 'O'.
	 */
	togglePlayer() {
		this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X'; // Troca 'X' por 'O' ou vice-versa
	}

	/**
	 * @method checkWinner
	 * @returns {boolean} - Retorna true se houver um vencedor ou empate, false caso contrário.
	 * @description Verifica se há um vencedor no jogo ou se o jogo empatou.
	 */
	checkWinner() {
		const winPatterns = [ // Padrões de vitória
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8], // Linhas
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8], // Colunas
			[0, 4, 8],
			[2, 4, 6] // Diagonais
		];

		for (const pattern of winPatterns) {
			const [a, b, c] = pattern;
			if (this.gameBoard[a] && this.gameBoard[a] === this.gameBoard[b] && this.gameBoard[a] === this.gameBoard[c]) {
				return this.gameBoard[a]; // Retorna o jogador vencedor ('X' ou 'O')
			}
		}
		return null; // Sem vencedor ainda
	}

	/**
	 * @method isBoardFull
	 * @returns {boolean} - Retorna true se o tabuleiro estiver cheio (empate), false caso contrário.
	 * @description Verifica se todas as células do tabuleiro estão preenchidas.
	 */
	isBoardFull() {
		return this.gameBoard.every(cell => cell !== ''); // Checa se não tem célula vazia
	}


	/**
	 * @method updateStatus
	 * @description Atualiza a mensagem de status do jogo na interface, exibindo o jogador da vez, o vencedor ou empate.
	 */
	updateStatus() {
		if (!this.gameActive) return; // Jogo inativo, não atualiza

		const winner = this.checkWinner(); // Verifica vencedor
		const status = document.querySelector('.status'); // Elemento de status

		if (winner) {
			status.textContent = `Jogador ${winner} venceu!`; // Mostra vencedor
			this.gameActive = false; // Desativa jogo
		} else if (this.isBoardFull()) {
			status.textContent = 'Empate!'; // Mostra empate
			this.gameActive = false; // Desativa jogo
		} else {
			status.textContent = `Vez do Jogador ${this.currentPlayer}`; // Mostra jogador da vez
		}
	}

	/**
	 * @method makeComputerMove
	 * @description Determina e executa o movimento do computador ('O') com lógica de IA (nível fácil/médio).
	 */
	makeComputerMove() {
		if (!this.gameActive || this.currentPlayer !== 'O') return; // Jogo inativo ou não é vez do computador

		let bestMoveIndex = this.getBestMove(); // IA calcula o melhor movimento

		if (bestMoveIndex !== null) {
			this.gameBoard[bestMoveIndex] = 'O'; // Computador faz o movimento
			this.renderCell(bestMoveIndex); // Atualiza visual

			if (this.checkWinner()) { // Checa se IA venceu
				this.updateStatus(); // Atualiza status (IA venceu)
				this.gameActive = false; // Desativa jogo
				return;
			}
			if (this.isBoardFull()) { // Checa empate
				this.updateStatus(); // Atualiza status (empate)
				this.gameActive = false; // Desativa jogo
				return;
			}

			this.togglePlayer(); // Troca para jogador humano
			this.updateStatus(); // Atualiza status (vez do humano)
		}
	}


	/**
	 * @method getBestMove
	 * @returns {number|null} - Retorna o índice do melhor movimento para o computador ou null se não houver movimentos possíveis.
	 * @description Implementa a lógica de IA para o computador encontrar o melhor movimento, priorizando vitória, bloqueio e jogadas estratégicas.
	 */
	getBestMove() {
		// 1. Tenta vencer
		for (let i = 0; i < 9; i++) {
			if (this.gameBoard[i] === '') {
				this.gameBoard[i] = 'O'; // Simula movimento IA
				if (this.checkWinner() === 'O') { // Vencerá?
					this.gameBoard[i] = ''; // Desfaz simulação
					return i; // Retorna índice para vencer
				}
				this.gameBoard[i] = ''; // Desfaz simulação
			}
		}

		// 2. Tenta bloquear
		for (let i = 0; i < 9; i++) {
			if (this.gameBoard[i] === '') {
				this.gameBoard[i] = 'X'; // Simula movimento jogador
				if (this.checkWinner() === 'X') { // Jogador venceria?
					this.gameBoard[i] = ''; // Desfaz simulação
					return i; // Retorna índice para bloquear
				}
				this.gameBoard[i] = ''; // Desfaz simulação
			}
		}

		// 3. Movimento estratégico (centro, cantos, lados)
		const strategicMoves = [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Prioridades: Centro, Cantos, Lados
		for (const move of strategicMoves) {
			if (this.gameBoard[move] === '') {
				return move; // Retorna primeiro movimento estratégico livre
			}
		}

		// 4. Fallback (não deve acontecer em jogo normal)
		return null; // ou movimento aleatório se necessário
	}


	/**
	 * @method reiniciarJogo
	 * @description Reinicia o jogo, resetando o tabuleiro, o jogador atual e o estado do jogo.
	 */
	reiniciarJogo() {
		this.currentPlayer = 'X'; // Jogador 'X' sempre começa
		this.gameBoard = ['', '', '', '', '', '', '', '', '']; // Limpa tabuleiro
		this.gameActive = true; // Reativa jogo
		this.renderBoard(); // Redesenha tabuleiro
	}
}

// --------------------------------------------------
//  LISTA DE TAREFAS - Inteligência Aprimorada (Refatoração e Melhorias)
// --------------------------------------------------
/**
 * @class ListaDeTarefas
 * @description Gerencia a lógica da Lista de Tarefas com renderização e organização melhoradas.
 */
class ListaDeTarefas {
	constructor(contentDiv) {
		this.contentDiv = contentDiv;
		this.tasks = this.loadTasks(); // Inicializa tarefas carregando do localStorage
	}

	/**
	 * @method loadTasks
	 * @returns {Array<object>} - Array de tarefas do localStorage ou vazio.
	 * @description Carrega tarefas salvas ou inicia lista vazia.
	 */
	loadTasks() {
		const storedTasks = localStorage.getItem('tasks');
		return storedTasks ? JSON.parse(storedTasks) : []; // Retorna tarefas do storage ou array vazio
	}

	/**
	 * @method saveTasks
	 * @description Salva tarefas no localStorage.
	 */
	saveTasks() {
		localStorage.setItem('tasks', JSON.stringify(this.tasks)); // Salva array de tarefas no storage
	}

	/**
	 * @method renderTasks
	 * @description Renderiza a lista de tarefas na tela.
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
		this.setupEventListeners(); // Configura eventos dos botões
	}

	/**
	 * @method renderTaskListItems
	 * @private
	 * @returns {string} - HTML para itens da lista de tarefas.
	 * @description Cria HTML para cada tarefa na lista.
	 */
	renderTaskListItems() {
		return this.tasks.map((task, index) => `
                <li class="todo-item">
                    <input type="checkbox" id="task-${index}" ${task.completed ? 'checked' : ''} aria-labelledby="task-label-${index}">
                    <span id="task-label-${index}" class="${task.completed ? 'completed' : ''}">${utils.sanitizeInput(task.text)}</span>
                    <button class="delete-btn" data-index="${index}" aria-label="Excluir tarefa ${task.text}">Excluir</button>
                </li>`).join(''); // Transforma array de HTML em string
	}


	/**
	 * @method setupEventListeners
	 * @private
	 * @description Configura eventos para botões e checkboxes.
	 */
	setupEventListeners() {
		document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask()); // Evento botão Adicionar

		const taskList = document.querySelector('.todo-list');
		taskList.addEventListener('change', (event) => { // Evento change nos checkboxes (delegação)
			if (event.target.type === 'checkbox') {
				const index = parseInt(event.target.id.split('-')[1], 10); // Pega índice do checkbox
				this.toggleTask(index); // Alterna tarefa
			}
		});

		taskList.addEventListener('click', (event) => { // Evento click nos botões delete (delegação)
			if (event.target.classList.contains('delete-btn')) {
				const index = parseInt(event.target.dataset.index, 10); // Pega índice do botão delete
				this.deleteTask(index); // Deleta tarefa
			}
		});
	}


	/**
	 * @method addTask
	 * @description Adiciona nova tarefa. Valida input, atualiza UI e localStorage.
	 */
	addTask() {
		const taskInput = document.getElementById('taskInput');
		const taskText = taskInput.value.trim(); // Pega texto da tarefa

		if (!taskText) {
			alert("Por favor, insira uma tarefa antes de adicionar."); // Alerta se input vazio
			return; // Sai da função se não tiver texto
		}

		this.tasks.push({
			text: taskText,
			completed: false
		}); // Adiciona tarefa ao array
		this.saveTasks(); // Salva tarefas
		taskInput.value = ''; // Limpa input
		this.updateTaskListUI(); // Atualiza lista na tela
	}


	/**
	 * @method toggleTask
	 * @param {number} index - Índice da tarefa.
	 * @description Alterna status (concluída/não concluída) da tarefa. Atualiza UI e localStorage.
	 */
	toggleTask(index) {
		if (index >= 0 && index < this.tasks.length) { // Valida índice
			this.tasks[index].completed = !this.tasks[index].completed; // Inverte status da tarefa
			this.saveTasks(); // Salva tarefas
			this.updateTaskItemUI(index); // Atualiza item da tarefa na tela
		} else {
			console.error('Índice de tarefa inválido:', index); // Erro: índice inválido
		}
	}

	/**
	 * @method deleteTask
	 * @param {number} index - Índice da tarefa.
	 * @description Deleta tarefa da lista. Atualiza UI e localStorage.
	 */
	deleteTask(index) {
		if (index >= 0 && index < this.tasks.length) { // Valida índice
			this.tasks.splice(index, 1); // Remove tarefa do array
			this.saveTasks(); // Salva tarefas
			this.updateTaskListUI(); // Atualiza lista na tela
		} else {
			console.error('Índice de tarefa inválido:', index); // Erro: índice inválido
		}
	}

	/**
	 * @method updateTaskListUI
	 * @private
	 * @description Atualiza a lista de tarefas (UL) na tela. Renderiza novamente os itens da lista.
	 */
	updateTaskListUI() {
		const taskList = document.querySelector('.todo-list');
		if (taskList) {
			taskList.innerHTML = this.renderTaskListItems(); // Atualiza conteúdo da UL
			this.setupEventListenersForListItems(); // Refaz eventos dos itens (deprecated)
		}
	}

	/**
	 * @method updateTaskItemUI
	 * @private
	 * @param {number} index - Índice da tarefa.
	 * @description Atualiza um item específico da tarefa na UI (classe 'completed', checkbox).
	 */
	updateTaskItemUI(index) {
		const listItem = document.querySelector(`.todo-list li:nth-child(${index + 1})`);
		if (listItem) {
			const task = this.tasks[index];
			const taskSpan = listItem.querySelector('span');
			const checkbox = listItem.querySelector('input[type="checkbox"]');

			if (taskSpan) taskSpan.className = task.completed ? 'completed' : ''; // Atualiza classe do span
			if (checkbox) checkbox.checked = task.completed; // Atualiza checkbox
		}
	}

	/**
	 * @method setupEventListenersForListItems
	 * @private
	 * @description Configura eventos para itens da lista (checkboxes/delete btns) - DEPRECATED.
	 * @deprecated  - Delegação de eventos em `setupEventListeners` torna isto redundante.
	 */
	setupEventListenersForListItems() { // DEPRECATED - Delegação no setupEventListeners torna obsoleto
		// Implementação de listeners para checkboxes e delete buttons em cada item, se necessário em renderização parcial.
		// No modelo atual, delegação em 'setupEventListeners' torna essa função redundante, mantida por referência.
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
	 * @constructor
	 * @param {object} i18n - Objeto de internacionalização.
	 * @param {object} contentDiv - Div de conteúdo.
	 */
	constructor(i18n, contentDiv) {
		this.contentDiv = contentDiv;
		this.i18n = i18n;
		this.history = [];
		this.cache = new Cache(); // Cache (se precisar)
		this.mathParser = math; // Biblioteca math.js
	}

	initialize() {
		this.loadHistory(); // Carrega o histórico salvo
	}

	/**
	 * @private
	 * @returns {string} HTML dos botões.
	 * @description Renderiza os botões.
	 */
	renderButtons() {
		const buttons = [
			'7', '8', '9', '/',
			'4', '5', '6', '*',
			'1', '2', '3', '-',
			'0', '.', '=', '+',
			'CE', '%' // Botões extras
		];

		return buttons.map(button => {
			let className = 'calc-button';
			if (['/', '*', '-', '+', '%'].includes(button)) { // É operador?
				className += ' operator';
			} else if (button === '=') { // É igual?
				className += ' equal';
			} else if (button === 'CE') { // É Clear Entry?
				className += ' clear-entry';
			}

			return `<button
                                 class="${className}"
                                 data-key="${button}"
                                 aria-label="${button}"
                             >${button}</button>`;
		}).join(''); // Junta tudo em HTML
	}

	/**
	 * @param {string} button - Botão clicado.
	 * @description Manipula o clique dos botões.
	 */
	handleButtonClick(button) {
		const display = document.getElementById('display');
		if (button === '=') { // Clicou em igual
			try {
				const result = this.calculate(display.value); // Calcula
				display.value = result; // Mostra no display
			} catch (error) {
				app.notifications.show(error.message, 'error'); // Mostra erro se tiver
			}
		} else if (button === 'CE') { // Clicou em CE
			this.clearEntry(); // Limpa a entrada
		} else if (button === '%') { // Clicou em porcentagem
			this.handlePercentage(); // Faz a conta de porcentagem
		} else { // Clicou em número ou operador
			display.value += button; // Adiciona ao que já está no display
		}
	}

	/**
	 * @returns {string} HTML da calculadora.
	 * @description Renderiza a calculadora.
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
	 * @param {string} expression - Expressão matemática.
	 * @returns {number} Resultado do cálculo.
	 * @throws {Error} Se a expressão for inválida.
	 * @description Calcula a expressão.
	 */
	calculate(expression) {
		try {
			expression = expression.replace(/%/g, '/100'); // Troca % por divisão por 100
			const result = this.mathParser.evaluate(expression); // Usa math.js pra calcular

			if (!isFinite(result)) { // Checa se o resultado é um número válido
				throw new Error(this.i18n.t('calculationError')); // Se não for, dá erro
			}

			this.addToHistory(expression, result); // Salva no histórico
			return result; // Retorna o resultado
		} catch (error) {
			Logger.log(Logger.levels.ERROR, 'Erro no cálculo', { // Loga o erro
				expression,
				error
			});
			throw new Error(this.i18n.t('calculationError')); // Manda o erro pra tela
		}
	}

	/**
	 * @param {string} expression - Expressão calculada.
	 * @param {number} result - Resultado do cálculo.
	 * @description Adiciona ao histórico.
	 */
	addToHistory(expression, result) {
		const historyItem = {
			expression,
			result,
			timestamp: new Date().toISOString() // Guarda a hora que calculou
		};

		this.history.unshift(historyItem); // Põe no começo da lista
		this.history = this.history.slice(0, 10); // Limita a 10 itens no histórico
		this.saveHistory(); // Salva o histórico
		this.updateHistoryDisplay(); // Atualiza a tela do histórico
	}

	/**
	 * @description Carrega histórico.
	 */
	loadHistory() {
		try {
			const saved = localStorage.getItem('calcHistory'); // Pega do localStorage
			if (saved) {
				this.history = JSON.parse(saved); // Transforma de volta pra objeto
				this.updateHistoryDisplay(); // Mostra na tela
			}
		} catch (error) {
			Logger.log(Logger.levels.ERROR, 'Erro ao carregar histórico', { // Se der erro, loga
				error
			});
		}
	}

	/**
	 * @description Salva histórico.
	 */
	saveHistory() {
		try {
			localStorage.setItem('calcHistory', JSON.stringify(this.history)); // Salva no localStorage
		} catch (error) {
			Logger.log(Logger.levels.ERROR, 'Erro ao salvar histórico', { // Se der erro, loga
				error
			});
		}
	}

	/**
	 * @description Atualiza histórico na tela.
	 */
	updateHistoryDisplay() {
		const historyList = this.contentDiv.querySelector('.calc-history ul'); // Pega a lista HTML
		if (!historyList) return; // Se não tem lista, não faz nada

		historyList.innerHTML = this.history.map(item => `
                <li class="history-item" role="listitem">
                    <span class="expression">${utils.sanitizeInput(item.expression)}</span>
                    <span class="separator">=</span>
                    <span class="result">${utils.formatNumber(item.result)}</span>
                    <span class="timestamp">${this.formatTimestamp(item.timestamp)}</span>
                </li>
            `).join(''); // Cria HTML pra cada item do histórico

		const lastItem = historyList.lastElementChild; // Pega o último item adicionado
		if (lastItem) {
			lastItem.classList.add('new-item'); // Animação visual de novo item
			setTimeout(() => {
				lastItem.classList.remove('new-item'); // Remove a animação depois de um tempo
			}, 500); // Tempo da animação
		}
	}

	/**
	 * @description Limpa o histórico.
	 */
	clearHistory() {
		this.history = []; // Limpa o array do histórico
		this.saveHistory(); // Salva histórico vazio
		this.updateHistoryDisplay(); // Atualiza a tela do histórico
	}

	/**
	 * @private
	 * @param {string} timestamp - Timestamp ISO.
	 * @returns {string} Timestamp formatado.
	 * @description Formata a hora.
	 */
	formatTimestamp(timestamp) {
		const date = new Date(timestamp); // Cria objeto Date
		return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`; // Formata pra pt-BR
	}

	/**
	 * @description Configura eventos dos botões e teclado.
	 */
	setupEventListeners() {
		const buttons = this.contentDiv.querySelector('.calc-buttons'); // Pega os botões
		if (buttons) {
			buttons.addEventListener('click', (event) => { // Evento de clique nos botões
				const key = event.target.dataset.key; // Qual botão clicou?
				if (key) {
					this.handleButtonClick(key); // Manda pro manipulador de cliques
				}
			});
		}

		document.addEventListener('keydown', (event) => { // Evento de teclado
			this.handleKeyPress(event); // Manda pro manipulador de teclado
		});
	}

	/**
	 * @param {KeyboardEvent} event - Evento de teclado.
	 * @description Manipula teclado.
	 */
	handleKeyPress(event) {
		const key = event.key; // Tecla que apertou
		const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '*', '-', '+', '.', '=', '%']; // Teclas válidas na calculadora

		if (validKeys.includes(key)) { // É tecla de número/operador?
			event.preventDefault(); // Previne ação padrão da tecla
			this.handleButtonClick(key === '=' ? '=' : key); // Simula clique no botão
		} else if (key === 'Enter') { // É Enter?
			event.preventDefault();
			this.handleButtonClick('='); // Enter = Igual
		} else if (key === 'Backspace') { // É Backspace?
			event.preventDefault();
			this.handleBackspace(); // Apaga um caractere
		} else if (key === 'Escape') { // É Escape?
			event.preventDefault();
			this.clearDisplay(); // Limpa o display
		}
	}

	/**
	 * @description Apaga um caractere do display.
	 */
	handleBackspace() {
		const display = document.getElementById('display'); // Display da calculadora
		display.value = display.value.slice(0, -1); // Remove o último char
	}

	/**
	 * @description Limpa display pra zero.
	 */
	clearDisplay() {
		const display = document.getElementById('display'); // Display da calculadora
		display.value = '0'; // Zera o display
	}

	/**
	 * @description Limpa a entrada atual.
	 */
	clearEntry() {
		this.clearDisplay(); // CE faz a mesma coisa que Clear Display aqui
	}

	/**
	 * @description Manipula porcentagem.
	 */
	handlePercentage() {
		const display = document.getElementById('display'); // Display da calculadora
		let currentValue = parseFloat(display.value); // Valor atual no display
		if (!isNaN(currentValue)) { // Se for número
			display.value = currentValue / 100; // Divide por 100 (cálculo da %)
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
	 * @constructor
	 * @param {number} [stepSize=0.01] - Tamanho do passo.
	 * @param {number} [alpha=0.1] - Ajuste dinâmico do fator.
	 */
	constructor(stepSize = 0.01, alpha = 0.1) {
		this.weights = []; // Pesos do equalizador
		this.stepSize = stepSize;
		this.alpha = alpha;
		this.decisionThreshold = 1; // Limiar de decisão
	}

	/**
	 * @method initializeWeights
	 * @param {number} numTaps - Número de taps.
	 * @description Inicializa os pesos do equalizador.
	 */
	initializeWeights(numTaps) {
		this.weights = Array(numTaps).fill(0); // Cria array de pesos
		this.weights[0] = 1; // Peso central = 1
	}

	/**
	 * @method equalize
	 * @param {number[]} inputSignal - Sinal de entrada.
	 * @returns {number[]} Sinal equalizado.
	 * @description Equaliza o sinal de entrada.
	 */
	equalize(inputSignal) {
		const outputSignal = [];
		for (let i = 0; i < inputSignal.length; i++) {
			const inputVector = inputSignal.slice(Math.max(0, i - this.weights.length + 1), i + 1); // Vetor de entrada
			const reversedInput = inputVector.slice().reverse(); // Inverte vetor
			const paddedInput = Array(this.weights.length - reversedInput.length).fill(0).concat(reversedInput); // Preenche com zeros se curto
			const output = this.calculateOutput(paddedInput); // Calcula saída
			outputSignal.push(output); // Adiciona ao sinal de saída
			this.updateWeights(paddedInput, output); // Atualiza pesos
		}
		return outputSignal; // Retorna sinal equalizado
	}

	/**
	 * @private
	 * @method calculateOutput
	 * @param {number[]} input - Vetor de entrada.
	 * @returns {number} Saída do equalizador.
	 * @description Calcula a saída do equalizador.
	 */
	calculateOutput(input) {
		let output = 0;
		for (let i = 0; i < this.weights.length; i++) {
			output += this.weights[i] * input[i]; // Saída = soma dos pesos * entradas
		}
		return output; // Retorna saída
	}

	/**
	 * @private
	 * @method updateWeights
	 * @param {number[]} input - Vetor de entrada.
	 * @param {number} output - Saída do equalizador.
	 * @description Atualiza os pesos do equalizador.
	 */
	updateWeights(input, output) {
		const decision = this.makeDecision(output); // Decisão sobre o símbolo
		const error = decision - output; // Erro = decisão - saída

		// Fator variável dinâmico
		const dynamicFactor = Math.abs(output) > this.decisionThreshold ? 1 : this.alpha; // Fator dinâmico baseado na saída

		for (let i = 0; i < this.weights.length; i++) {
			this.weights[i] += dynamicFactor * this.stepSize * error * input[i]; // Atualiza cada peso
		}
	}

	/**
	 * @private
	 * @method makeDecision
	 * @param {number} output - Saída do equalizador.
	 * @returns {number} Símbolo decidido.
	 * @description Toma decisão sobre o símbolo de saída.
	 */
	makeDecision(output) {
		// Decisão para QPSK (ajustar se modulation mudar)
		return output > 0 ? 1 : -1; // Decisão simples: > 0 é 1, <= 0 é -1
	}
}

// --------------------------------------------------
//  CLASSE APP - Centralizando o gerenciamento da aplicação
// --------------------------------------------------
/**
 * @class App
 * @description Classe principal para gerenciar a aplicação.
 */
class App {
	constructor() {
		// Pego a div principal onde vou colocar todo o conteúdo dinâmico da aplicação.
		this.contentDiv = document.getElementById('content');
		/** @type {object} */
		// Defino um objeto para lidar com textos da interface, para facilitar se precisar mudar o idioma depois.
		this.i18n = {
			t: (key) => {
				const translations = {
					'calculator': 'Calculadora',
					'display': 'Visor',
					'history': 'Histórico',
					'returnToMenu': 'Voltar ao Menu',
					'back': 'Voltar',
					'calculationError': 'Erro no cálculo'
					// Aqui posso adicionar mais traduções se precisar.
				};
				return translations[key] || key;
			}
		};
		/** @type {Calculator} */
		// Inicializo as classes que representam cada funcionalidade do menu, passando as dependências necessárias.
		this.calculator = new Calculator(this.i18n, this.contentDiv);
		this.notifications = new Notifications();
		this.forca = new Forca(this.contentDiv);
		this.jogoDaVelha = new JogoDaVelha(this.contentDiv);
		this.listaDeTarefas = new ListaDeTarefas(this.contentDiv);
	}
	/**
	 * @method initialize
	 * @description Inicializo a aplicação e o menu principal.
	 */
	initialize() {
		this.setupMenu(); // Configuro o menu principal assim que a aplicação inicia.
	}

	/**
	 * @private
	 * @method setupMenu
	 * @description Configura os listeners para os botões do menu.
	 */
	setupMenu() {
		document.querySelectorAll(".menu button").forEach(button => {
			button.addEventListener("click", () => {
				const option = parseInt(button.dataset.option);

				// Aqui direciono para a função correta baseado na opção que o usuário escolheu no menu.
				switch (option) {
					case 1:
						this.exibirOlaMundo();
						break;
					case 2:
						this.lerNome();
						break;
					case 3:
						this.showCalculator(); // Mostro a calculadora.
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
	 * @method showCalculator
	 * @description Exibe a interface da calculadora.
	 */
	showCalculator() {
		this.contentDiv.innerHTML = this.calculator.render(); // Renderizo a calculadora na tela.
		this.calculator.initialize(); // Inicializo a lógica da calculadora.
		this.calculator.setupEventListeners(); // Ativo os eventos dos botões e teclado para a calculadora funcionar.
	}

	/**
	 * @method showForca
	 * @description Exibe o jogo da forca.
	 */
	showForca() {
		this.forca.atualizarJogo(); // Atualizo a tela do jogo da forca.
	}

	/**
	 * @method showJogoDaVelha
	 * @description Exibe o jogo da velha.
	 */
	showJogoDaVelha() {
		this.jogoDaVelha.renderBoard(); // Renderizo o tabuleiro do jogo da velha.
	}

	/**
	 * @method showListaDeTarefas
	 * @description Exibe a lista de tarefas.
	 */
	showListaDeTarefas() {
		this.listaDeTarefas.renderTasks(); // Renderizo a lista de tarefas.
	}

	/**
	 * @method voltarAoMenu
	 * @description Limpa o conteúdo principal e volta para o menu.
	 */
	voltarAoMenu() {
		this.contentDiv.innerHTML = ""; // Limpo o conteúdo da div principal para voltar para o menu.
	}

	/**
	 * @method exibirOlaMundo
	 * @description Exibe a tela de "Olá Mundo!".
	 */
	exibirOlaMundo() {
		this.contentDiv.innerHTML = `
                <div class="ola-mundo-container">
                    <h2>Olá Mundo!</h2>
                    <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
                </div>
            `;
	}

	/**
	 * @method lerNome
	 * @description Exibe a tela para ler o nome do usuário.
	 */
	lerNome() {
		this.contentDiv.innerHTML = `
                <div class="ler-nome-container">
                    <div class="input-group">
                        <label for="nome">Digite seu nome:</label>
                        <input type="text" id="nome">
                    </div>
                    <button onclick="app.exibirNome()">Exibir Nome</button>
                    <button onclick="app.voltarAoMenu()">Voltar ao Menu</button>
                    <div id="resultado-nome" class="resultado-mensagem"></div>
                </div>
            `;
	}

	/**
	 * @method exibirNome
	 * @description Exibe o nome do usuário na tela.
	 */
	exibirNome() {
		const nome = document.getElementById("nome").value;
		if (nome.trim() !== "") {
			document.getElementById("resultado-nome").innerHTML = `
                    <h2>Olá, ${utils.sanitizeInput(nome)}! Seja bem-vindo(a)!</h2>
                `;
		} else {
			this.notifications.show("Nome inválido!", "error"); // Mostro notificação de erro caso o nome seja inválido.
		}
	}

	/**
	 * @method calculadoraIdade
	 * @description Inicializa a calculadora de idade, configurando a interface.
	 */
	calculadoraIdade() {
		this.contentDiv.innerHTML = `
                <div class="calculadora-idade-container">
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
                </div>
            `;

		document.getElementById('calcularIdadeBtn').addEventListener('click', () => this.processarCalculoIdade());
		document.getElementById('voltarMenuBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
	 * @method processarCalculoIdade
	 * @description Processa o cálculo da idade após validação dos inputs.
	 */
	processarCalculoIdade() {
		// Valido se os anos digitados são números e se fazem sentido (nascimento < atual).
		const anoNascimento = this.obterNumero("anoNascimento");
		const anoAtual = this.obterNumero("anoAtual");

		this.limparMensagensErro(); // Limpo qualquer mensagem de erro que possa estar aparecendo.

		if (anoNascimento === null) {
			this.mostrarMensagemErro("anoNascimento", "Ano de nascimento inválido. Digite um número.");
			return;
		}
		if (anoAtual === null) {
			this.mostrarMensagemErro("anoAtual", "Ano atual inválido. Digite um número.");
			return;
		}

		if (anoNascimento > anoAtual) {
			this.mostrarMensagemErro("anoNascimento", "O ano de nascimento não pode ser posterior ao ano atual.");
			this.mostrarMensagemErro("anoAtual", "O ano atual não pode ser anterior ao ano de nascimento.");
			return;
		}

		const anoCorrente = new Date().getFullYear();
		if (anoAtual > anoCorrente + 1) { // Verifico se o ano atual digitado não é irreal (muito no futuro).
			this.mostrarMensagemErro("anoAtual", `Por favor, insira um ano atual válido (até ${anoCorrente + 1}).`);
			return;
		}

		// Se tudo estiver ok, calculo a idade e mostro na tela.
		const idade = anoAtual - anoNascimento;

		if (idade >= 0) {
			document.getElementById("resultado-idade").innerHTML = `
                    <h2>Sua idade é: <span class="idade-valor">${idade}</span> anos</h2>
            `;
		} else {
			this.notifications.show("Erro inesperado ao calcular a idade.", "error");
		}
	}


	/**
	 * @method obterNumero
	 * @param {string} idDoElemento - ID do elemento input.
	 * @returns {number|null} Número obtido ou null se inválido.
	 * @description Função reutilizável para obter um número de um input e validar.
	 */
	obterNumero(idDoElemento) {
		const valorInput = document.getElementById(idDoElemento).value;
		const numero = Number(valorInput);

		if (isNaN(numero)) {
			return null; // Retorno null se não for número.
		}
		return numero;
	}

	/**
	 * @method limparMensagensErro
	 * @description Limpa todas as mensagens de erro da tela.
	 */
	limparMensagensErro() {
		let errorMessages = document.querySelectorAll('.error-message');
		errorMessages.forEach(message => message.textContent = '');
	}

	/**
	 * @method mostrarMensagemErro
	 * @param {string} elementoId - ID do elemento input.
	 * @param {string} mensagem - Mensagem de erro a ser exibida.
	 * @description Mostra uma mensagem de erro abaixo de um input específico.
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
	 * @method verificarNumeroPrimo
	 * @description Inicializa a interface para verificar se um número é primo.
	 */
	verificarNumeroPrimo() {
		this.contentDiv.innerHTML = `
                <div class="verificador-primo-container">
                    <div class="input-group">
                        <label for="numeroPrimo">Digite um número inteiro positivo:</label>
                        <input type="number" id="numeroPrimo" placeholder="Ex: 17">
                        <small class="error-message" id="numeroPrimo-error"></small>
                    </div>
                    <button id="verificarPrimoBtn">Verificar</button>
                    <button id="voltarMenuBtn">Voltar ao Menu</button>
                    <div id="resultado-primo" class="resultado-mensagem"></div>
                </div>
            `;

		document.getElementById('verificarPrimoBtn').addEventListener('click', () => this.processarVerificacaoPrimo());
		document.getElementById('voltarMenuBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
	 * @method processarVerificacaoPrimo
	 * @description Processa a verificação de número primo após validação.
	 */
	processarVerificacaoPrimo() {
		// Valido se o que foi digitado é um número inteiro positivo.
		const numeroInput = document.getElementById("numeroPrimo");
		const numero = this.obterNumero("numeroPrimo");

		this.limparMensagensErro(); // Limpo mensagens de erro.

		if (numero === null) {
			this.mostrarMensagemErro("numeroPrimo", "Por favor, digite um número inteiro válido.");
			return;
		}

		if (!Number.isInteger(numero) || numero <= 0) {
			this.mostrarMensagemErro("numeroPrimo", "Digite um número inteiro *positivo*.");
			return;
		}

		// Se passou nas validações, verifico se é primo e exibo o resultado.
		const ehPrimo = this.isPrimo(numero);

		const resultadoTexto = ehPrimo ? `<span class="primo-valor">${numero}</span> é um número primo.` : `<span class="nao-primo-valor">${numero}</span> não é um número primo.`;
		document.getElementById("resultado-primo").innerHTML = `<h2>${resultadoTexto}</h2>`;
	}

	/**
	 * @method isPrimo
	 * @param {number} numero - Número a ser verificado.
	 * @returns {boolean} True se primo, false caso contrário.
	 * @description Verifica se um número é primo de forma eficiente.
	 */
	isPrimo(numero) {
		if (numero <= 1) return false; // Números <= 1 não são primos.
		if (numero <= 3) return true; // 2 e 3 são primos.

		if (numero % 2 === 0 || numero % 3 === 0) return false; // Se divisível por 2 ou 3, não é primo.

		// Otimização: verifico divisores só até a raiz quadrada e pulando de 6 em 6.
		for (let i = 5; i * i <= numero; i = i + 6) {
			if (numero % i === 0 || numero % (i + 2) === 0) return false;
		}

		return true; // Se não encontrei nenhum divisor, é primo.
	}


	/**
	 * @method calculadoraIMC
	 * @description Inicializa a interface da calculadora de IMC.
	 */
	calculadoraIMC() {
		this.contentDiv.innerHTML = `
                <div class="calculadora-imc-container">
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
                </div>
            `;

		document.getElementById('calcularIMCBtn').addEventListener('click', () => this.processarCalculoIMC());
		document.getElementById('voltarMenuBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
	 * @method processarCalculoIMC
	 * @description Processa o cálculo do IMC após validação dos inputs.
	 */
	processarCalculoIMC() {
		// Valido peso e altura, verificando se são números e se fazem sentido.
		const peso = this.obterNumero("peso");
		const altura = this.obterNumero("altura");

		this.limparMensagensErro(); // Limpo mensagens de erro.

		if (peso === null) {
			this.mostrarMensagemErro("peso", "Peso inválido. Digite um número em kg.");
			return;
		}
		if (altura === null) {
			this.mostrarMensagemErro("altura", "Altura inválida. Digite um número em metros.");
			return;
		}

		if (peso <= 0) {
			this.mostrarMensagemErro("peso", "Peso deve ser maior que zero.");
			return;
		}
		if (altura <= 0 || altura > 3) { // Altura máxima razoável 3m.
			this.mostrarMensagemErro("altura", "Altura deve ser maior que zero e razoável (máximo 3 metros).");
			return;
		}

		// Calculo o IMC se as validações passaram.
		const imc = peso / (altura * altura);

		// Classifico o IMC e exibo o resultado na tela.
		const classificacao = this.classificarIMC(imc);

		document.getElementById("resultado-imc").innerHTML = `
                <h2>Seu IMC é: <span class="imc-valor">${imc.toFixed(2).toLocaleString('pt-BR')}</span></h2>
                <p class="imc-classificacao">Classificação: <span class="classificacao-valor">${classificacao}</span></p>
        `;
	}

	/**
	 * @method classificarIMC
	 * @param {number} imc - Valor do IMC.
	 * @returns {string} Classificação do IMC.
	 * @description Classifica o IMC em categorias.
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
	 * @method conversorTemperatura
	 * @description Inicializa a interface do conversor de temperatura.
	 */
	conversorTemperatura() {
		this.contentDiv.innerHTML = `
                <div class="conversor-temperatura-container"> <div class="input-group">
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
                </div>
            `;

		document.getElementById('converterBtn').addEventListener('click', () => this.processarConversao());
		document.getElementById('voltarMenuBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
	 * @method processarConversao
	 * @description Processa a conversão de temperatura após validação.
	 */
	processarConversao() {
		// Valido se a temperatura digitada é número e se o tipo de conversão foi selecionado.
		const temperatura = this.obterNumero("temperatura");
		const tipoConversaoElement = document.getElementById("tipoConversao");
		const tipoConversao = parseInt(tipoConversaoElement.value);


		this.limparMensagensErro(); // Limpo mensagens de erro.

		if (temperatura === null) {
			this.mostrarMensagemErro("temperatura", "Temperatura inválida. Digite um número.");
			return;
		}

		if (tipoConversaoElement.value === "") {
			this.mostrarMensagemErro("tipoConversao", "Selecione o tipo de conversão.");
			return;
		}

		if (isNaN(tipoConversao) || tipoConversao < 1 || tipoConversao > 6) { // Valido se o tipo de conversão é válido.
			this.mostrarMensagemErro("tipoConversao", "Seleção de conversão inválida.");
			return;
		}

		let resultado;
		let unidadeOriginal, unidadeConvertida;

		// Faço a conversão baseada na opção escolhida.
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
				this.mostrarMensagemErro("tipoConversao", "Erro interno na seleção de conversão.");
				return;
		}

		// Exibo o resultado da conversão na tela.
		this.exibirResultadoConversao(temperatura, unidadeOriginal, resultado, unidadeConvertida);
	}

	/**
	 * @method exibirResultadoConversao
	 * @param {number} temperatura - Temperatura original.
	 * @param {string} unidadeOriginal - Unidade original.
	 * @param {number} resultado - Temperatura convertida.
	 * @param {string} unidadeConvertida - Unidade convertida.
	 * @description Exibe o resultado formatado da conversão de temperatura.
	 */
	exibirResultadoConversao(temperatura, unidadeOriginal, resultado, unidadeConvertida) {
		document.getElementById("resultado-conversao").innerHTML = `
                <h2><span class="temperatura-original">${temperatura.toFixed(1).toLocaleString('pt-BR')}</span><span class="unidade-original">${unidadeOriginal}</span> equivalem a <span class="temperatura-convertida">${resultado.toFixed(1).toLocaleString('pt-BR')}</span><span class="unidade-convertida">${unidadeConvertida}</span></h2>
        `;
	}


	/**
	 * @method geradorTabelaASCII
	 * @description Gera e exibe a tabela ASCII na tela.
	 */
	geradorTabelaASCII() {
		// Crio a tabela HTML na string e depois adiciono ao contentDiv.
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

		// Loop para gerar cada linha da tabela ASCII.
		for (let codigoASCII = 0; codigoASCII <= 127; codigoASCII++) {
			tabelaHTML += this.gerarLinhaTabelaASCII(codigoASCII);
		}

		tabelaHTML += `
                        </tbody>
                    </table>
                </div>
                <button id="voltarMenuASCIIBtn">Voltar ao Menu</button>
        `;

		this.contentDiv.innerHTML = tabelaHTML; // Insiro a tabela no HTML.

		document.getElementById('voltarMenuASCIIBtn').addEventListener('click', () => this.voltarAoMenu());
	}

	/**
	 * @method gerarLinhaTabelaASCII
	 * @param {number} codigoASCII - Código ASCII.
	 * @returns {string} Linha HTML da tabela ASCII.
	 * @description Gera uma linha da tabela ASCII para um código específico.
	 */
	gerarLinhaTabelaASCII(codigoASCII) {
		// Converto para caractere, hexadecimal e octal.
		const caractere = String.fromCharCode(codigoASCII);
		const hexadecimal = codigoASCII.toString(16).toUpperCase();
		const octal = codigoASCII.toString(8);

		// Formato a linha HTML com os dados.
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
	 * @method formatarCaractereASCII
	 * @param {string} caractere - Caractere ASCII.
	 * @param {number} codigoASCII - Código ASCII.
	 * @returns {string} Caractere formatado para exibição.
	 * @description Formata o caractere ASCII para exibição na tabela, tratando caracteres de controle.
	 */
	formatarCaractereASCII(caractere, codigoASCII) {
		// Caracteres de controle (códigos 0-31 e 127) não são imprimíveis, então mostro um nome pra eles.
		if (codigoASCII < 32 || codigoASCII === 127) {
			return `<span class="caractere-controle">${this.obterNomeControleASCII(codigoASCII)} (Código ${codigoASCII})</span>`;
		} else {
			return caractere; // Caracteres normais mostro direto.
		}
	}


	/**
	 * @method obterNomeControleASCII
	 * @param {number} codigoASCII - Código ASCII de controle.
	 * @returns {string} Nome descritivo do caractere de controle.
	 * @description Obtém o nome descritivo de um caractere de controle ASCII.
	 */
	obterNomeControleASCII(codigoASCII) {
		// Um mapa de códigos de controle para nomes mais legíveis na tabela.
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
		return nomesControle[codigoASCII] || `CTRL-${codigoASCII}`; // Se não tiver nome específico, mostro como CTRL-código.
	}
}

// --------------------------------------------------
//  INICIALIZAÇÃO DA APLICAÇÃO - Ponto de partida do app
// --------------------------------------------------

/**
 * @global
 * @description Instância principal da aplicação.
 * @type {App}
 */
let app; // Aqui vai ficar a instância da nossa classe App.

/**
 * @global
 * @description Função que roda quando o math.js termina de carregar.
 */
function initializeApp() {
	app = new App(); // Crio uma nova instância do App.
	app.initialize(); // Inicializo o app, configurando o menu e tudo mais.

	// Modo escuro - Puxando as configurações e ativando se já tava antes
	const darkModeToggle = document.getElementById('darkModeToggle');

	// Checo se o modo escuro tava ligado da última vez no localStorage
	if (localStorage.getItem('darkMode') === 'enabled') {
		document.body.classList.add('dark-mode'); // Se tava, já ligo o modo escuro no body.
		darkModeToggle.checked = true; // E deixo o toggle 'ligado' visualmente.
	}

	// Listener pro toggle do modo escuro - Pra mudar quando o usuário clica
	darkModeToggle.addEventListener('change', () => {
		console.log("DarkMode toggle changed:", darkModeToggle.checked);
		if (darkModeToggle.checked) {
			document.body.classList.add('dark-mode'); // Ligo o modo escuro.
			localStorage.setItem('darkMode', 'enabled'); // Salvo que tá ligado no localStorage.
		} else {
			document.body.classList.remove('dark-mode'); // Desligo o modo escuro.
			localStorage.setItem('darkMode', 'disabled'); // Salvo que tá desligado.
		}
	});
}

function loadMathLibrary() {
	const script = document.createElement('script');
	script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.7.0/math.min.js';
	script.onload = () => {
		console.log('Math.js loaded.');
		initializeApp(); // Assim que carregar, inicializo o app.
	};
	script.onerror = () => {
		console.error('Erro ao carregar Math.js.'); // Se der erro, console avisa.
	};
	document.head.appendChild(script); // Adiciono o script no head pra começar o download e execução.
}

// Inicializa tudo DEPOIS que a página carrega completamente
document.addEventListener('DOMContentLoaded', () => {
	loadMathLibrary(); // Chamo a função que carrega o math.js e inicia o app.
});