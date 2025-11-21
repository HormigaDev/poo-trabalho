// Tipo auxiliar que representa uma movimentação na conta
type Movimentacao = {
    tipo: 'DEBITO' | 'CREDITO';
    valor: number;
    descricao: string;
    data: Date;
    metodo: string; // exemplo: 'PIX', 'BOLETO', 'CARTAO_CREDITO'
};

class ContaBancaria {
    // Atributos sensíveis ficam privados para proteger o estado interno.
    // Uso getters públicos para permitir leitura controlada.
    private _titular: string;
    private _numero: string;
    private _saldo: number;
    private _historico: Movimentacao[] = [];

    // No construtor forneço o titular, número e saldo inicial.
    // O saldo inicial representa o dinheiro disponível na conta.
    constructor(titular: string, numero: string, saldoInicial: number = 0) {
        this._titular = titular;
        this._numero = numero;
        this._saldo = saldoInicial;
    }

    // Getters públicos para ler informações; não forneço setters para o saldo
    // porque alterações devem ocorrer somente pelas operações (sacar/depositar).
    get titular(): string {
        return this._titular;
    }

    get numero(): string {
        return this._numero;
    }

    get saldo(): number {
        return this._saldo;
    }

    // Retorna uma cópia do histórico para garantir que o array interno não seja modificado externamente.
    getHistorico(): Movimentacao[] {
        return this._historico.map((m) => ({ ...m }));
    }

    // Método para creditar (exemplo: depósito, estorno)
    // Esse método é público porque faz parte das operações legítimas da conta.
    depositar(valor: number, descricao: string, metodo: string = 'EXTERNO'): void {
        if (valor <= 0) return;
        this._saldo += valor;
        this.registrarMovimentacao({
            tipo: 'CREDITO',
            valor,
            descricao,
            data: new Date(),
            metodo,
        });
        console.log(`${this._titular}: Depósito de R$ ${valor.toFixed(2)} (${metodo})`);
    }

    // Método para sacar: retorna true se conseguiu, false se saldo insuficiente.
    sacar(valor: number, descricao: string, metodo: string): boolean {
        // Protejo contra valores inválidos
        if (valor <= 0) return false;

        if (this._saldo >= valor) {
            this._saldo -= valor;
            this.registrarMovimentacao({
                tipo: 'DEBITO',
                valor,
                descricao,
                data: new Date(),
                metodo,
            });
            console.log(`${this._titular}: Saque/Pagamento de R$ ${valor.toFixed(2)} (${metodo})`);
            return true;
        }

        // Se não tem saldo suficiente, não mexo no saldo e retorno false
        console.log(`${this._titular}: Falha no pagamento de R$ ${valor.toFixed(2)} (${metodo}) - Saldo insuficiente`);
        return false;
    }

    // Registro de movimentações é privado: só a própria conta altera seu histórico
    private registrarMovimentacao(m: Movimentacao) {
        this._historico.push(m);
    }
}

// A interafce abstrata define o contrato que todos os meios de pagamento devem seguir
interface MeioPagamento {
    // processarPagamento tenta executar um pagamento na conta passada
    // Retorna true em caso de sucesso, false caso contrário
    processarPagamento(conta: ContaBancaria, valor: number): boolean;
}

// 1. CARTÃO DE CRÉDITO
class CartaoCredito implements MeioPagamento {
    // Atributos do cartão: todos privados para aplicar encapsulamento
    private numero: string;
    private nomeTitular: string;
    private validade: Date; // data de validade
    private cvv: string;
    private limiteDisponivel: number; // limite disponível do cartão

    constructor(numero: string, nomeTitular: string, validade: string, cvv: string, limite: number) {
        this.numero = numero.replace(/\s+/g, '');
        this.nomeTitular = nomeTitular;
        // Recebo validade como string 'YYYY-MM' e transformo em Date no último dia do mês
        const [y, m] = validade.split('-').map(Number);
        this.validade = new Date(y, m, 0); // último dia do mês
        this.cvv = cvv;
        this.limiteDisponivel = limite;
    }

    // No mundo real cartoes de credito não debitam a conta imediatamente,
    // mas para simplificar desta atividade vou simular que o pagamento é cobrado
    // da conta na hora e que o limite disponível é reduziido
    processarPagamento(conta: ContaBancaria, valor: number): boolean {
        // Validacões simples:
        // - Número tem 13 a 19 dígitos (intervalo comum)
        // - CVV tem 3 ou 4 dígitos
        // - Validade não vencida
        // - Limite disponível cobre o valor

        if (!/^[0-9]{13,19}$/.test(this.numero)) {
            console.log('Cartão de Crédito: Número inválido');
            return false;
        }

        if (!/^[0-9]{3,4}$/.test(this.cvv)) {
            console.log('Cartão de Crédito: CVV inválido');
            return false;
        }

        const hoje = new Date();
        if (this.validade < hoje) {
            console.log('Cartão de Crédito: Cartão vencido');
            return false;
        }

        if (valor > this.limiteDisponivel) {
            console.log('Cartão de Crédito: Limite insuficiente');
            return false;
        }

        // Tentar debitar a conta (simulando pagamento à vista da fatura)
        const sucesso = conta.sacar(
            valor,
            `Pagamento com Cartão de Crédito (${this.numero.slice(-4)})`,
            'CARTAO_CREDITO',
        );
        if (sucesso) {
            // Reduzimos o limite disponível do cartão
            this.limiteDisponivel -= valor;
            return true;
        }

        return false;
    }
}

// 2. CARTÃO DE DÉBITO
class CartaoDebito implements MeioPagamento {
    private numero: string;
    private nomeTitular: string;
    private validade: Date;
    private cvv: string;

    constructor(numero: string, nomeTitular: string, validade: string, cvv: string) {
        this.numero = numero.replace(/\s+/g, '');
        this.nomeTitular = nomeTitular;
        const [y, m] = validade.split('-').map(Number);
        this.validade = new Date(y, m, 0);
        this.cvv = cvv;
    }

    // Débito exige que a conta tenha saldo; validações semelhantes ao crédito
    processarPagamento(conta: ContaBancaria, valor: number): boolean {
        if (!/^[0-9]{13,19}$/.test(this.numero)) {
            console.log('Cartão de Débito: Número inválido');
            return false;
        }

        if (!/^[0-9]{3,4}$/.test(this.cvv)) {
            console.log('Cartão de Débito: CVV inválido');
            return false;
        }

        const hoje = new Date();
        if (this.validade < hoje) {
            console.log('Cartão de Débito: Cartão vencido');
            return false;
        }

        // No débito a operação precisa do saldo na conta
        return conta.sacar(valor, `Pagamento com Cartão de Débito (${this.numero.slice(-4)})`, 'CARTAO_DEBITO');
    }
}

// 3. BOLETO BANCÁRIO
class BoletoBancario implements MeioPagamento {
    private codigoBarras: string;
    private dataVencimento: Date;

    constructor(codigoBarras: string, dataVencimento: string) {
        // Código de barras só números (no mundo real tem formato especifico)
        this.codigoBarras = codigoBarras.replace(/\D+/g, '');
        this.dataVencimento = new Date(dataVencimento);
    }

    processarPagamento(conta: ContaBancaria, valor: number): boolean {
        // Validações: código com tamanho plausível e boleto não vencido
        if (!/^[0-9]{30,60}$/.test(this.codigoBarras)) {
            console.log('Boleto: Código de barras inválido');
            return false;
        }

        const hoje = new Date();
        if (this.dataVencimento < hoje) {
            console.log('Boleto: Boleto vencido');
            return false;
        }

        // Pagamento por boleto debita a conta
        return conta.sacar(valor, `Pagamento de Boleto (${this.codigoBarras.slice(-6)})`, 'BOLETO');
    }
}

// 4. PIX
class Pix implements MeioPagamento {
    private chave: string; // pode ser CPF, e-mail, telefone ou chave aleatória

    constructor(chave: string) {
        this.chave = chave;
    }

    // Validação simples: não aceitar chaves vazias; opcionalmente validar formatos
    processarPagamento(conta: ContaBancaria, valor: number): boolean {
        if (!this.chave || this.chave.trim().length === 0) {
            console.log('Pix: Chave inválida');
            return false;
        }

        // Pix é instantâneo: debita a conta se houver saldo
        return conta.sacar(valor, `Pagamento via PIX (${this.chave})`, 'PIX');
    }
}

// Crio 4 contas com saldos diferentes para demonstrar várias situações
const conta1 = new ContaBancaria('Alice Pereira', '001-01', 5000); // boa margem
const conta2 = new ContaBancaria('Bruno Silva', '002-02', 300); // pouco saldo
const conta3 = new ContaBancaria('Carla Souza', '003-03', 1200); // saldo médio
const conta4 = new ContaBancaria('Daniel Costa', '004-04', 50); // quase sem saldo

// Crio instâncias dos meios de pagamento
const cartaoCredito = new CartaoCredito('4111111111111111', 'Alice Pereira', '2026-12', '123', 2000);
const cartaoDebito = new CartaoDebito('5283950000000000', 'Bruno Silva', '2025-05', '321');
const boleto = new BoletoBancario('8362000000 0000 0000 0000 0000 0000 000', '2026-12-31');
const pix = new Pix('alice@example.com');

console.log('========================================');
console.log('SISTEMA DE PAGAMENTO - SIMULAÇÃO');
console.log('========================================\n');

// Simulações mostrando sucessos e falhas com mensagens

// 1) Alice paga uma compra grande com cartão de crédito (tem limite e saldo)
console.log('\n--- Operação 1: Cartão de Crédito (Alice) ---');
cartaoCredito.processarPagamento(conta1, 1500); // deve passar

// 2) Bruno tenta pagar com cartão de débito, mas tem pouco saldo
console.log('\n--- Operação 2: Cartão de Débito (Bruno) ---');
cartaoDebito.processarPagamento(conta2, 400); // deve falhar por saldo insuficiente

// 3) Carla paga um boleto dentro do prazo
console.log('\n--- Operação 3: Boleto Bancário (Carla) ---');
boleto.processarPagamento(conta3, 200); // deve passar

// 4) Daniel tenta um Pix, mas não tem saldo
console.log('\n--- Operação 4: PIX (Daniel) ---');
const pixDaniel = new Pix('5511999999999');
pixDaniel.processarPagamento(conta4, 30); // deve falhar

// 5) Bruno faz um depósito e tenta pagar de novo com débito
console.log('\n--- Operação 5: Depósito + Cartão Débito (Bruno) ---');
conta2.depositar(200, 'Depósito para pagar compra', 'TED');
cartaoDebito.processarPagamento(conta2, 400); // ainda pode falhar dependendo do saldo

// 6) Alice faz um Pix pequeno
console.log('\n--- Operação 6: PIX (Alice) ---');
pix.processarPagamento(conta1, 50); // deve passar

// 7) Tentar pagar boleto vencido (crio um boleto vencido)
console.log('\n--- Operação 7: Boleto Vencido (Alice) ---');
const boletoVencido = new BoletoBancario('836200000000000000000000000000', '2020-01-01');
boletoVencido.processarPagamento(conta1, 10); // deve falhar

// Exibição do histórico
function exibirResumoConta(conta: ContaBancaria) {
    console.log('\n----------------------------------------');
    console.log(`Conta: ${conta.numero} - Titular: ${conta.titular}`);
    console.log(`Saldo atual: R$ ${conta.saldo.toFixed(2)}`);
    console.log('Histórico:');
    conta.getHistorico().forEach((m, i) => {
        console.log(
            `  ${i + 1}. [${m.data.toLocaleString()}] ${m.tipo} - R$ ${m.valor.toFixed(2)} - ${m.metodo} - ${
                m.descricao
            }`,
        );
    });
}

exibirResumoConta(conta1);
exibirResumoConta(conta2);
exibirResumoConta(conta3);
exibirResumoConta(conta4);

console.log('\n========================================');
console.log('FIM DA SIMULAÇÃO - SISTEMA DE PAGAMENTO');
console.log('========================================');
