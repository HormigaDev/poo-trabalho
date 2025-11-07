// Essa é a classe base abstrata Funcionario
// Eu coloquei "abstract" porque ela não pode ser usada diretamente
// Ela serve só como modelo para as outras classes que vão herdar dela
abstract class Funcionario {
    constructor(public nome: string, public salario: number, public identificacao: string) {}

    // Esse método é abstrato, ou seja, ele não tem implementação aqui
    // Cada classe filha (Gerente, Desenvolvedor, Estagiario) vai ter que criar sua própria versão
    // Isso é bom porque cada tipo de funcionário calcula o salário de um jeito diferente
    abstract calcularSalario(): number;

    // Esse método serve pra mostrar as informações do funcionário
    // Ele usa o calcularSalario() que cada classe filha vai implementar
    exibirInformacoes(): void {
        console.log(`Nome: ${this.nome}`);
        console.log(`Identificação: ${this.identificacao}`);
        console.log(`Salário Base: R$ ${this.salario.toFixed(2)}`);
        console.log(`Salário Final: R$ ${this.calcularSalario().toFixed(2)}`);
    }
}

// Classe Gerente herda de Funcionario
class Gerente extends Funcionario {
    // O construtor recebe os mesmos dados da classe pai
    // O "super" chama o construtor da classe pai (Funcionario)
    constructor(nome: string, salario: number, identificacao: string) {
        super(nome, salario, identificacao);
    }

    // Aqui eu implemento o método calcularSalario() do jeito do Gerente
    // Gerente ganha o salário base + 20% de bônus
    calcularSalario(): number {
        // Pego o salário base e adiciono 20% (multiplico por 1.20)
        const bonus = 0.2;
        return this.salario * (1 + bonus);
    }
}

// Classe Desenvolvedor também herda de Funcionario
class Desenvolvedor extends Funcionario {
    // Desenvolvedor tem um atributo a mais: projetosEntregues
    // Esse atributo conta quantos projetos ele já entregou
    constructor(
        nome: string,
        salario: number,
        identificacao: string,
        public projetosEntregues: number,
    ) {
        super(nome, salario, identificacao);
    }

    // Desenvolvedor ganha o salário base + 10% de bônus por cada projeto entregue
    calcularSalario(): number {
        // Calculo o bônus: 10% do salário multiplicado pelo número de projetos
        const bonusPorProjeto = this.salario * 0.1 * this.projetosEntregues;
        // Somo o salário base com o bônus dos projetos
        return this.salario + bonusPorProjeto;
    }

    // Sobrescrevo o método exibirInformacoes para mostrar também os projetos
    exibirInformacoes(): void {
        // Chamo o método da classe pai primeiro
        super.exibirInformacoes();
        // Depois adiciono a informação dos projetos
        console.log(`Projetos Entregues: ${this.projetosEntregues}`);
    }
}

// Classe Estagiario herda de Funcionario
class Estagiario extends Funcionario {
    constructor(nome: string, salario: number, identificacao: string) {
        super(nome, salario, identificacao);
    }

    // Estagiário tem salário fixo, não ganha bônus
    // Então eu só retorno o salário base mesmo
    calcularSalario(): number {
        return this.salario;
    }
}

// ============================================
// INSTANCIAÇÃO DOS FUNCIONÁRIOS (PONTO 5)
// ============================================

// Aqui eu crio uma lista que pode guardar qualquer tipo de Funcionario
// Isso é importante porque mostra o polimorfismo:
// A lista é do tipo Funcionario, mas dentro dela tem Gerente, Desenvolvedor e Estagiario
const funcionarios: Funcionario[] = [
    // Criando 4 Gerentes
    new Gerente('Carlos Silva', 8000, 'GER-001'),
    new Gerente('Maria Santos', 9000, 'GER-002'),
    new Gerente('José Oliveira', 8500, 'GER-003'),
    new Gerente('Ana Costa', 9500, 'GER-004'),

    // Criando 4 Desenvolvedores
    // Cada um tem um número diferente de projetos entregues
    new Desenvolvedor('Pedro Alves', 5000, 'DEV-001', 3),
    new Desenvolvedor('Juliana Lima', 5500, 'DEV-002', 5),
    new Desenvolvedor('Rafael Souza', 5200, 'DEV-003', 2),
    new Desenvolvedor('Fernanda Rocha', 5800, 'DEV-004', 7),

    // Criando 4 Estagiários
    new Estagiario('Lucas Martins', 1500, 'EST-001'),
    new Estagiario('Beatriz Ferreira', 1500, 'EST-002'),
    new Estagiario('Gabriel Dias', 1500, 'EST-003'),
    new Estagiario('Amanda Ribeiro', 1500, 'EST-004'),
];

// ============================================
// SIMULAÇÃO E DEMONSTRAÇÃO DO POLIMORFISMO (PONTO 6)
// ============================================

console.log('========================================');
console.log('SISTEMA DE FUNCIONÁRIOS - DEMONSTRAÇÃO');
console.log('========================================\n');

// Aqui acontece o polimorfismo!
// Eu percorro a lista de funcionários com um for
// Mesmo que cada objeto seja de uma classe diferente (Gerente, Desenvolvedor, Estagiario),
// eu posso tratar todos como Funcionario
// Quando chamo calcularSalario(), o JavaScript sabe qual versão usar automaticamente
funcionarios.forEach((funcionario, index) => {
    console.log(`\n--- FUNCIONÁRIO ${index + 1} ---`);

    // Aqui eu descubro qual é o tipo específico do funcionário
    // Isso é só para deixar claro no log qual classe está sendo usada
    if (funcionario instanceof Gerente) {
        console.log('Cargo: GERENTE');
    } else if (funcionario instanceof Desenvolvedor) {
        console.log('Cargo: DESENVOLVEDOR');
    } else if (funcionario instanceof Estagiario) {
        console.log('Cargo: ESTAGIÁRIO');
    }

    // Chamo exibirInformacoes() que vai usar o calcularSalario() específico de cada classe
    // Esse é o polimorfismo em açao: mesmo metodo, comportamentos diferentes.
    funcionario.exibirInformacoes();
    console.log('---');
});

// Aqui eu faço um resumo para mostrar melhor o polimorfismo
console.log('\n========================================');
console.log('RESUMO - DEMONSTRAÇÃO DO POLIMORFISMO');
console.log('========================================\n');

// Calculo a folha de pagamento total
let totalFolha = 0;
let totalGerentes = 0;
let totalDesenvolvedores = 0;
let totalEstagiarios = 0;

// Percorro a lista de novo para fazer os cálculos
funcionarios.forEach((funcionario) => {
    // Aqui está o polimorfismo: chamo o mesmo método calcularSalario()
    // mas ele funciona diferente dependendo do tipo de funcionário
    const salarioFinal = funcionario.calcularSalario();
    totalFolha += salarioFinal;

    // Separo os totais por cargo
    if (funcionario instanceof Gerente) {
        totalGerentes += salarioFinal;
    } else if (funcionario instanceof Desenvolvedor) {
        totalDesenvolvedores += salarioFinal;
    } else if (funcionario instanceof Estagiario) {
        totalEstagiarios += salarioFinal;
    }
});

console.log('Total da Folha de Pagamento (GERENTES): R$', totalGerentes.toFixed(2));
console.log('Total da Folha de Pagamento (DESENVOLVEDORES): R$', totalDesenvolvedores.toFixed(2));
console.log('Total da Folha de Pagamento (ESTAGIÁRIOS): R$', totalEstagiarios.toFixed(2));
console.log('\nTOTAL GERAL DA FOLHA: R$', totalFolha.toFixed(2));

console.log('\n========================================');
console.log('FIM DA DEMONSTRAÇÃO');
console.log('========================================');

// EXPLICAÇÃO FINAL DO POLIMORFISMO:
// O polimorfismo acontece porque eu posso guardar objetos diferentes (Gerente, Desenvolvedor, Estagiario)
// em uma lista do tipo Funcionario, e quando chamo calcularSalario(), cada um usa sua própria versão.
// Isso é útil porque eu posso tratar todos os funcionários de forma igual no código,
// mas cada tipo se comporta do seu jeito quando precisa calcular o salário.
// É tipo ter um controle remoto universal: o mesmo botão "play" funciona em qualquer aparelho,
// mas cada aparelho faz o "play" do seu jeito!
