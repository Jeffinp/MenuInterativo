const contentDiv = document.getElementById("content");

document.querySelectorAll(".menu button").forEach(button => {
    button.addEventListener("click", () => {
        const option = parseInt(button.dataset.option);

        switch (option) {
            case 1:
                exibirOlaMundo();
                break;
            case 2:
                lerNome();
                break;
            case 3:
                realizarConta();
                break;
            case 4:
                calculadoraIdade();
                break;
            case 5:
                verificarNumeroPrimo();
                break;
            case 6:
                calculadoraIMC();
                break;
            case 7:
                conversorTemperatura();
                break;
            case 8:
                geradorTabelaASCII();
                break;
            case 9:
                contentDiv.innerHTML = "<h2>Saindo do programa... Até mais!</h2>";
                break;
            default:
                contentDiv.innerHTML = "<h2>Opção inválida. Tente novamente.</h2>";
        }
    });
});

function exibirOlaMundo() {
    contentDiv.innerHTML = `
        <h2>Olá Mundo!</h2>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
    `;
}

function lerNome() {
    contentDiv.innerHTML = `
        <div class="input-group">
            <label for="nome">Digite seu nome:</label>
            <input type="text" id="nome">
        </div>
        <button onclick="exibirNome()">Exibir Nome</button>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
        <div id="resultado-nome"></div>
    `;
}

function exibirNome() {
    const nome = document.getElementById("nome").value;
    if (nome.trim() !== "") {
        document.getElementById("resultado-nome").innerHTML = `
            <h2>Olá, ${nome}! Seja bem-vindo(a)!</h2>
        `;
    } else {
        exibirMensagemErro("Nome inválido!");
    }
}

function realizarConta() {
    contentDiv.innerHTML = `
        <div class="input-group">
            <label for="numero1">Digite o primeiro número:</label>
            <input type="number" id="numero1">
        </div>
        <div class="input-group">
            <label for="numero2">Digite o segundo número:</label>
            <input type="number" id="numero2">
        </div>
        <div class="input-group">
            <label for="operacao">Escolha a operação:</label>
            <select id="operacao">
                <option value="1">+</option>
                <option value="2">-</option>
                <option value="3">*</option>
                <option value="4">/</option>
            </select>
        </div>
        <button onclick="calcular()">Calcular</button>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
        <div id="resultado-conta"></div>
    `;
}

function calcular() {
    let numero1 = obterNumero("numero1");
    let numero2 = obterNumero("numero2");

    if (numero1 === null || numero2 === null) {
        return; // Volta ao menu se a entrada for inválida (tratado em obterNumero)
    }

    let operacao = parseInt(document.getElementById("operacao").value);
    let resultado;

    switch (operacao) {
        case 1:
            resultado = numero1 + numero2;
            break;
        case 2:
            resultado = numero1 - numero2;
            break;
        case 3:
            resultado = numero1 * numero2;
            break;
        case 4:
            if (numero2 !== 0) {
                resultado = numero1 / numero2;
            } else {
                exibirMensagemErro("Divisão por zero não é permitida.");
                return;
            }
            break;
        default:
            exibirMensagemErro("Operação inválida.");
            return;
    }

    // Formata o resultado com separadores de milhares e exibe
    document.getElementById("resultado-conta").innerHTML = `
        <h2>Resultado: ${resultado.toLocaleString('pt-BR')}</h2>
    `;
}

function calculadoraIdade() {
    contentDiv.innerHTML = `
        <div class="input-group">
            <label for="anoNascimento">Digite o ano de nascimento:</label>
            <input type="number" id="anoNascimento">
        </div>
        <div class="input-group">
            <label for="anoAtual">Digite o ano atual:</label>
            <input type="number" id="anoAtual">
        </div>
        <button onclick="calcularIdade()">Calcular Idade</button>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
        <div id="resultado-idade"></div>
    `;
}

function calcularIdade() {
    let anoNascimento = obterNumero("anoNascimento", true);
    let anoAtual = obterNumero("anoAtual", true);

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
        exibirMensagemErro("A idade não pode ser negativa.");
    }
}

function verificarNumeroPrimo() {
    contentDiv.innerHTML = `
        <div class="input-group">
            <label for="numeroPrimo">Digite um número inteiro positivo:</label>
            <input type="number" id="numeroPrimo">
        </div>
        <button onclick="verificarPrimo()">Verificar</button>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
        <div id="resultado-primo"></div>
    `;
}

function verificarPrimo() {
    let numero = obterNumero("numeroPrimo", true);

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

function calculadoraIMC() {
    contentDiv.innerHTML = `
        <div class="input-group">
            <label for="peso">Digite seu peso (em kg):</label>
            <input type="number" id="peso">
        </div>
        <div class="input-group">
            <label for="altura">Digite sua altura (em metros. Ex: 1.75):</label>
            <input type="number" id="altura">
        </div>
        <button onclick="calcularIMC()">Calcular IMC</button>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
        <div id="resultado-imc"></div>
    `;
}

function calcularIMC() {
    let peso = obterNumero("peso");
    let altura = obterNumero("altura");

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

function conversorTemperatura() {
    contentDiv.innerHTML = `
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
        <button onclick="converter()">Converter</button>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
        <div id="resultado-conversao"></div>
    `;
}

function converter() {
    let temperatura = obterNumero("temperatura");
    let tipoConversao = parseInt(document.getElementById("tipoConversao").value);

    if (temperatura === null) {
        return; // Volta ao menu se a entrada for inválida
    }

    let resultado;

    switch (tipoConversao) {
        case 1:
            resultado = (temperatura * 9) / 5 + 32;
            exibirResultadoConversao(temperatura, "°C", resultado, "°F");
            break;
        case 2:
            resultado = temperatura + 273.15;
            exibirResultadoConversao(temperatura, "°C", resultado, "K");
            break;
        case 3:
            resultado = ((temperatura - 32) * 5) / 9;
            exibirResultadoConversao(temperatura, "°F", resultado, "°C");
            break;
        case 4:
            resultado = ((temperatura - 32) * 5) / 9 + 273.15;
            exibirResultadoConversao(temperatura, "°F", resultado, "K");
            break;
        case 5:
            resultado = temperatura - 273.15;
            exibirResultadoConversao(temperatura, "K", resultado, "°C");
            break;
        case 6:
            resultado = (temperatura - 273.15) * 9 / 5 + 32;
            exibirResultadoConversao(temperatura, "K", resultado, "°F");
            break;
        default:
            exibirMensagemErro("Opção de conversão inválida.");
            return;
    }
}

function exibirResultadoConversao(temperatura, unidadeOriginal, resultado, unidadeConvertida) {
    document.getElementById("resultado-conversao").innerHTML = `
        <h2>${temperatura.toFixed(1).toLocaleString('pt-BR')}${unidadeOriginal} equivalem a ${resultado.toFixed(1).toLocaleString('pt-BR')}${unidadeConvertida}</h2>
    `;
}

function geradorTabelaASCII() {
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
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
    `;

    contentDiv.innerHTML = tabela;
}

function voltarAoMenu() {
    contentDiv.innerHTML = ""; // Limpa o conteúdo atual
}

function obterNumero(idElemento, inteiro = false) {
    let valor = document.getElementById(idElemento).value;

    if (valor.trim() === "" || (inteiro && !/^-?\d+$/.test(valor)) || (!inteiro && !/^-?\d+(\.\d+)?$/.test(valor))) {
        exibirMensagemErro("Entrada inválida. Por favor, digite um número válido.");
        return null;
    }

    return inteiro ? parseInt(valor) : parseFloat(valor);
}

function exibirMensagemErro(mensagem) {
    contentDiv.innerHTML = `
        <h2 style="color: red;">${mensagem}</h2>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
    `;
}