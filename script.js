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
    const nome = prompt("Digite seu nome: ");
    contentDiv.innerHTML = `
        <h2>Olá, ${nome}! Seja bem-vindo(a)!</h2>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
    `;
}

function realizarConta() {
    let numero1 = parseFloat(prompt("Digite o primeiro número: "));
    let numero2 = parseFloat(prompt("Digite o segundo número: "));
    let operacao = parseInt(
        prompt("Escolha a operação (1: +, 2: -, 3: *, 4: /): ")
    );
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
                contentDiv.innerHTML = `
                    <h2>Divisão por zero não é permitida.</h2>
                    <button onclick="voltarAoMenu()">Voltar ao Menu</button>
                `;
                return;
            }
            break;
        default:
            contentDiv.innerHTML = `
                <h2>Operação inválida.</h2>
                <button onclick="voltarAoMenu()">Voltar ao Menu</button>
            `;
            return;
    }

    contentDiv.innerHTML = `
        <h2>Resultado: ${resultado}</h2>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
    `;
}

function calculadoraIdade() {
    let anoNascimento = parseInt(prompt("Digite o ano de nascimento: "));
    let anoAtual = parseInt(prompt("Digite o ano atual: "));
    let idade = anoAtual - anoNascimento;
    contentDiv.innerHTML = `
        <h2>Sua idade é: ${idade} anos</h2>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
    `;
}

function verificarNumeroPrimo() {
    let numero = parseInt(prompt("Digite um número inteiro positivo: "));
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

    contentDiv.innerHTML = `
        <h2>${primo ? `${numero} é um número primo.` : `${numero} não é um número primo.`}</h2>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
    `;
}

function calculadoraIMC() {
    let peso = parseFloat(prompt("Digite seu peso (em kg): "));
    let altura = parseFloat(prompt("Digite sua altura (em metros. Ex: 1.75): "));
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

    contentDiv.innerHTML = `
        <h2>Seu IMC é: ${imc.toFixed(2)}</h2>
        <p>Classificação: ${classificacao}</p>
        <button onclick="voltarAoMenu()">Voltar ao Menu</button>
    `;
}

function conversorTemperatura() {
    let temperatura = 0.0;
    let tipoConversao = 0;

    tipoConversao = parseInt(
        prompt(
            `Escolha o tipo de conversão:
      1. Celsius para Fahrenheit
      2. Celsius para Kelvin
      3. Fahrenheit para Celsius
      4. Fahrenheit para Kelvin
      5. Kelvin para Celsius
      6. Kelvin para Fahrenheit
      7. Voltar ao menu principal`
        )
    );

    if (tipoConversao >= 1 && tipoConversao <= 6) {
        temperatura = parseFloat(prompt("Digite a temperatura: "));
    }

    let celsius, fahrenheit, kelvin;

    switch (tipoConversao) {
        case 1: // Celsius para Fahrenheit
            celsius = temperatura;
            fahrenheit = (celsius * 9) / 5 + 32;
            contentDiv.innerHTML = `
            <h2>${celsius.toFixed(
                1
            )}°C equivalem a ${fahrenheit.toFixed(1)}°F</h2>
            <button onclick="voltarAoMenu()">Voltar ao Menu</button>
          `;
            break;

        case 2: // Celsius para Kelvin
            celsius = temperatura;
            kelvin = celsius + 273.15;
            contentDiv.innerHTML = `
            <h2>${celsius.toFixed(1)}°C equivalem a ${kelvin.toFixed(
                1
            )}K</h2>
            <button onclick="voltarAoMenu()">Voltar ao Menu</button>
          `;
            break;

        case 3: // Fahrenheit para Celsius
            fahrenheit = temperatura;
            celsius = ((fahrenheit - 32) * 5) / 9;
            contentDiv.innerHTML = `
            <h2>${fahrenheit.toFixed(
                1
            )}°F equivalem a ${celsius.toFixed(1)}°C</h2>
            <button onclick="voltarAoMenu()">Voltar ao Menu</button>
          `;
            break;

        case 4: // Fahrenheit para Kelvin
            fahrenheit = temperatura;
            kelvin = ((fahrenheit - 32) * 5) / 9 + 273.15;
            contentDiv.innerHTML = `
            <h2>${fahrenheit.toFixed(
                1
            )}°F equivalem a ${kelvin.toFixed(1)}K</h2>
            <button onclick="voltarAoMenu()">Voltar ao Menu</button>
          `;
            break;

        case 5: // Kelvin para Celsius
            kelvin = temperatura;
            celsius = kelvin - 273.15;
            contentDiv.innerHTML = `
            <h2>${kelvin.toFixed(1)}K equivalem a ${celsius.toFixed(
                1
            )}°C</h2>
            <button onclick="voltarAoMenu()">Voltar ao Menu</button>
          `;
            break;

        case 6: // Kelvin para Fahrenheit
            kelvin = temperatura;
            fahrenheit = (kelvin - 273.15) * 9 / 5 + 32;
            contentDiv.innerHTML = `
            <h2>${kelvin.toFixed(1)}K equivalem a ${fahrenheit.toFixed(
                1
            )}°F</h2>
            <button onclick="voltarAoMenu()">Voltar ao Menu</button>
          `;
            break;

        case 7: // Voltar ao menu principal
            voltarAoMenu();
            return;

        default:
            contentDiv.innerHTML = `
            <h2>Opção de conversão inválida.</h2>
            <button onclick="voltarAoMenu()">Voltar ao Menu</button>
        `;
            return;
    }
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