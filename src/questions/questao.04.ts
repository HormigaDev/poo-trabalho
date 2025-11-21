export {};

// MODELOS (ENTIDADES) - encapsluam estado e comportamento
class Livro {
    constructor(
        private _id: number,
        private _titulo: string,
        private _autor: string,
        private _ano: number,
        private _quantidade: number,
        private _categoria: string,
        private _preco: number,
    ) {}

    get id() {
        return this._id;
    }

    get titulo() {
        return this._titulo;
    }

    get autor() {
        return this._autor;
    }

    get ano() {
        return this._ano;
    }

    get quantidade() {
        return this._quantidade;
    }

    get categoria() {
        return this._categoria;
    }

    get preco() {
        return this._preco;
    }

    // Disponiveis calculados a partir da quantidade e dos emprestimos ativos
    private _disponiveis: number | null = null;

    setDisponiveis(valor: number) {
        this._disponiveis = valor;
    }

    get disponiveis() {
        // Se nao foi setado, assume que todos estao disponiveis
        return this._disponiveis ?? this._quantidade;
    }

    retirarExemplar() {
        if (this.disponiveis <= 0) return false;
        this.setDisponiveis(this.disponiveis - 1);
        return true;
    }

    devolverExemplar() {
        this.setDisponiveis(this.disponiveis + 1);
    }
}

class Usuario {
    constructor(
        private _id: number,
        private _nome: string,
        private _cpf: string,
        private _tipo: 'estudante' | 'professor' | 'comum',
        private _telefone: string,
        private _ativo: boolean = true,
        private _multas: number = 0,
    ) {}

    get id() {
        return this._id;
    }

    get nome() {
        return this._nome;
    }

    get cpf() {
        return this._cpf;
    }

    get tipo() {
        return this._tipo;
    }

    get telefone() {
        return this._telefone;
    }

    get ativo() {
        return this._ativo;
    }

    get multas() {
        return this._multas;
    }

    adicionarMulta(valor: number) {
        this._multas += valor;
    }

    pagarMulta(valor: number) {
        this._multas = Math.max(0, this._multas - valor);
    }

    // Verifica se pode tomar emprestimos (ativo e sem multas)
    podeEmprestar(): boolean {
        return this._ativo && this._multas <= 0;
    }
}

class Emprestimo {
    public devolvido: boolean = false;
    public dataDevolucaoReal?: Date;
    public multaCalculada: number = 0;

    constructor(
        public id: number,
        public usuarioId: number,
        public livroId: number,
        public dataEmprestimo: Date,
        public dataDevolucao: Date,
        public diasPermitidos: number,
        public taxaMultaDiaria: number,
        public tipo: string,
    ) {}
}

class Reserva {
    constructor(public id: number, public usuarioId: number, public livroId: number, public ativo: boolean = true) {}
}

// REPOSITÓRIO / SERVIÇO: Biblioteca - coordena operações

class Biblioteca {
    private livros: Livro[] = [];
    private usuarios: Usuario[] = [];
    private emprestimos: Emprestimo[] = [];
    private reservas: Reserva[] = [];

    constructor() {
        // Dados iniciais extraídos do `refactor.ts` para preservação do cenário de testes
        this.adicionarLivroInicial(1, 'Clean Code', 'Robert Martin', 2008, 3, 'tecnologia', 89.9);
        this.adicionarLivroInicial(2, '1984', 'George Orwell', 1949, 2, 'ficcao', 45.0);
        this.adicionarLivroInicial(3, 'Sapiens', 'Yuval Harari', 2011, 4, 'historia', 65.5);
        this.adicionarLivroInicial(4, 'O Hobbit', 'Tolkien', 1937, 2, 'fantasia', 55.0);

        this.cadastrarUsuarioInicial(1, 'Ana Silva', '12345678901', 'estudante', '48999999999', true, 0);
        this.cadastrarUsuarioInicial(2, 'Carlos Santos', '98765432100', 'professor', '48988888888', true, 15.5);
        this.cadastrarUsuarioInicial(3, 'Beatriz Costa', '11122233344', 'comum', '48977777777', false, 0);
    }

    // Métodos privados de inicialização (mantêm construtor limpo)
    private adicionarLivroInicial(
        id: number,
        titulo: string,
        autor: string,
        ano: number,
        quantidade: number,
        categoria: string,
        preco: number,
    ) {
        const livro = new Livro(id, titulo, autor, ano, quantidade, categoria, preco);
        livro.setDisponiveis(quantidade);
        this.livros.push(livro);
    }

    private cadastrarUsuarioInicial(
        id: number,
        nome: string,
        cpf: string,
        tipo: any,
        telefone: string,
        ativo: boolean,
        multas: number,
    ) {
        this.usuarios.push(new Usuario(id, nome, cpf, tipo, telefone, ativo, multas));
    }

    // Buscas simples com responsabilidade única
    private findUsuarioById(id: number): Usuario | undefined {
        return this.usuarios.find((u) => u.id === id);
    }

    private findLivroById(id: number): Livro | undefined {
        return this.livros.find((l) => l.id === id);
    }

    // Exposto: adicionar livro com validação mínima
    adicionarLivro(titulo: string, autor: string, ano: number, quantidade: number, categoria: string, preco: number) {
        const novoId = this.livros.length + 1;
        const livro = new Livro(novoId, titulo, autor, ano, quantidade, categoria, preco);
        livro.setDisponiveis(quantidade);
        this.livros.push(livro);
        console.log(`Livro '${titulo}' adicionado com sucesso!`);
    }

    cadastrarUsuario(nome: string, cpf: string, tipo: 'estudante' | 'professor' | 'comum', telefone: string) {
        const novoId = this.usuarios.length + 1;
        this.usuarios.push(new Usuario(novoId, nome, cpf, tipo, telefone, true, 0));
        console.log(`Usuário '${nome}' cadastrado com sucesso!`);
    }

    // Regras de negocio: cálculo de dias permitidos e multta por tipo
    private regrasPorTipo(tipoEmprestimo: string, tipoUsuario: string) {
        // Retorna {diasPermitidos, taxaMultaDiaria}
        if (tipoEmprestimo === 'normal') {
            if (tipoUsuario === 'estudante') return { dias: 14, taxa: 0.5 };
            if (tipoUsuario === 'professor') return { dias: 30, taxa: 0.3 };
            return { dias: 7, taxa: 1.0 };
        }

        if (tipoEmprestimo === 'renovacao') {
            if (tipoUsuario === 'estudante') return { dias: 7, taxa: 0.5 };
            if (tipoUsuario === 'professor') return { dias: 15, taxa: 0.3 };
            return { dias: 3, taxa: 1.0 };
        }

        if (tipoEmprestimo === 'expresso') {
            return { dias: 1, taxa: 5.0 };
        }

        return null;
    }

    // Limite de empréstimos por tipo de usuário
    private limitePorTipo(tipoUsuario: string) {
        if (tipoUsuario === 'estudante') return 3;
        if (tipoUsuario === 'professor') return 5;
        return 2;
    }

    // Lógica de empréstimo com responsabilidades bem definidas
    realizarEmprestimo(usuarioId: number, livroId: number, diasSolicitados: number, tipoEmprestimo: string) {
        console.log('\n=== PROCESSANDO EMPRÉSTIMO ===');

        const usuario = this.findUsuarioById(usuarioId);
        if (!usuario) return console.log('ERRO: Usuário não encontrado!');
        if (!usuario.ativo) return console.log('ERRO: Usuário inativo!');
        if (usuario.multas > 0) return console.log(`ERRO: Usuário possui multas pendentes de R$${usuario.multas}`);

        const livro = this.findLivroById(livroId);
        if (!livro) return console.log('ERRO: Livro não encontrado!');
        if (livro.disponiveis <= 0) return console.log('ERRO: Livro indisponível no momento!');

        const regra = this.regrasPorTipo(tipoEmprestimo, usuario.tipo);
        if (!regra) return console.log('ERRO: Tipo de empréstimo inválido!');

        if (diasSolicitados > regra.dias)
            return console.log(
                `ERRO: Período solicitado (${diasSolicitados} dias) excede o permitido (${regra.dias} dias)`,
            );

        // Contar emprestimos ativos do usuário
        const emprestimosAtivos = this.emprestimos.filter((e) => e.usuarioId === usuarioId && !e.devolvido).length;
        const limite = this.limitePorTipo(usuario.tipo);
        if (emprestimosAtivos >= limite)
            return console.log(`ERRO: Usuário já atingiu o limite de ${limite} empréstimos simultâneos!`);

        // Processar
        if (!livro.retirarExemplar()) return console.log('ERRO: não foi possível retirar exemplar');

        const dataEmprestimo = new Date();
        const dataDevolucao = new Date();
        dataDevolucao.setDate(dataDevolucao.getDate() + diasSolicitados);

        const novoId = this.emprestimos.length + 1;
        const emprestimo = new Emprestimo(
            novoId,
            usuarioId,
            livroId,
            dataEmprestimo,
            dataDevolucao,
            diasSolicitados,
            regra.taxa,
            tipoEmprestimo,
        );
        this.emprestimos.push(emprestimo);

        // Notificações (simples)
        console.log(`Email para ${usuario.nome}: Empréstimo realizado com sucesso!`);
        console.log(
            `SMS para ${usuario.telefone}: Livro '${
                livro.titulo
            }' deve ser devolvido até ${dataDevolucao.toLocaleDateString()}`,
        );

        // Comprovante (separado da lógica de negócio)
        this.imprimirComprovanteEmprestimo(emprestimo, usuario, livro);
    }

    private imprimirComprovanteEmprestimo(emprestimo: Emprestimo, usuario: Usuario, livro: Livro) {
        console.log('\n╔════════════════════════════════════╗');
        console.log('║     COMPROVANTE DE EMPRÉSTIMO      ║');
        console.log('╠════════════════════════════════════╣');
        console.log('║ ID: ' + emprestimo.id);
        console.log('║ Usuário: ' + usuario.nome);
        console.log('║ CPF: ' + usuario.cpf);
        console.log('║ Livro: ' + livro.titulo);
        console.log('║ Autor: ' + livro.autor);
        console.log('║ Data Empréstimo: ' + emprestimo.dataEmprestimo.toLocaleDateString());
        console.log('║ Data Devolução: ' + emprestimo.dataDevolucao.toLocaleDateString());
        console.log('║ Tipo: ' + emprestimo.tipo);
        console.log('║ Multa/dia atraso: R$' + emprestimo.taxaMultaDiaria);
        console.log('╚════════════════════════════════════╝\n');
    }

    realizarDevolucao(emprestimoId: number) {
        console.log('\n=== PROCESSANDO DEVOLUÇÃO ===');

        const emprestimo = this.emprestimos.find((e) => e.id === emprestimoId);
        if (!emprestimo) return console.log('ERRO: Empréstimo não encontrado!');
        if (emprestimo.devolvido) return console.log('ERRO: Este livro já foi devolvido!');

        const usuario = this.findUsuarioById(emprestimo.usuarioId);
        const livro = this.findLivroById(emprestimo.livroId);
        if (!usuario || !livro) return console.log('ERRO: Dados inconsistentes no empréstimo');

        const agora = new Date();
        let diasAtraso = 0;
        let multa = 0;
        if (agora > emprestimo.dataDevolucao) {
            diasAtraso = Math.floor((agora.getTime() - emprestimo.dataDevolucao.getTime()) / (1000 * 60 * 60 * 24));
            multa = diasAtraso * emprestimo.taxaMultaDiaria;
            usuario.adicionarMulta(multa);
            console.log(`ATENÇÃO: Devolução com ${diasAtraso} dia(s) de atraso! Multa: R$${multa.toFixed(2)}`);
        } else {
            console.log('Devolução dentro do prazo. Sem multas!');
        }

        emprestimo.devolvido = true;
        emprestimo.dataDevolucaoReal = agora;
        emprestimo.multaCalculada = multa;

        livro.devolverExemplar();

        // Notificar reservas
        this.reservas.forEach((r) => {
            if (r.livroId === livro.id && r.ativo) {
                const user = this.findUsuarioById(r.usuarioId);
                if (user) console.log(`Email para ${user.nome}: Livro '${livro.titulo}' está disponível!`);
            }
        });

        // Imprimir comprovante de devolução
        console.log('\n╔════════════════════════════════════╗');
        console.log('║     COMPROVANTE DE DEVOLUÇÃO       ║');
        console.log('╠════════════════════════════════════╣');
        console.log('║ Usuário: ' + usuario.nome);
        console.log('║ Livro: ' + livro.titulo);
        console.log('║ Data Devolução: ' + agora.toLocaleDateString());
        console.log('║ Dias de Atraso: ' + diasAtraso);
        console.log('║ Multa: R$' + multa.toFixed(2));
        console.log('║ Total de multas pendentes: R$' + usuario.multas.toFixed(2));
        console.log('╚════════════════════════════════════╝\n');
    }

    buscarLivros(termo: string) {
        console.log(`\n=== RESULTADOS DA BUSCA: '${termo}' ===`);
        const encontrados = this.livros.filter(
            (l) =>
                l.titulo.toLowerCase().includes(termo.toLowerCase()) ||
                l.autor.toLowerCase().includes(termo.toLowerCase()),
        );
        if (encontrados.length === 0) return console.log('Nenhum livro encontrado.');

        encontrados.forEach((l) => {
            console.log('\n📚 ' + l.titulo);
            console.log('   Autor: ' + l.autor);
            console.log('   Ano: ' + l.ano);
            console.log('   Categoria: ' + l.categoria);
            console.log('   Disponíveis: ' + l.disponiveis + '/' + l.quantidade);
            console.log('   Preço: R$' + l.preco);
            console.log(l.disponiveis > 0 ? '   ✅ DISPONÍVEL PARA EMPRÉSTIMO' : '   ❌ INDISPONÍVEL NO MOMENTO');
        });

        console.log('\n' + encontrados.length + ' livro(s) encontrado(s).');
    }

    gerarRelatorioCompleto() {
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║           RELATÓRIO COMPLETO DA BIBLIOTECA            ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        let totalLivros = 0;
        let livrosDisponiveis = 0;
        let valorTotal = 0;

        this.livros.forEach((l) => {
            totalLivros += l.quantidade;
            livrosDisponiveis += l.disponiveis;
            valorTotal += l.preco * l.quantidade;
            console.log('• ' + l.titulo + ' - ' + l.autor);
            console.log('  Disponíveis: ' + l.disponiveis + '/' + l.quantidade);
            console.log('  Categoria: ' + l.categoria + ' | Valor: R$' + l.preco);
        });

        console.log('\nTotal de exemplares: ' + totalLivros);
        console.log('Disponíveis: ' + livrosDisponiveis);
        console.log('Emprestados: ' + (totalLivros - livrosDisponiveis));
        console.log('Valor total do acervo: R$' + valorTotal.toFixed(2));

        // Usuários
        let usuariosAtivos = 0;
        let totalMultas = 0;
        this.usuarios.forEach((u) => {
            if (u.ativo) usuariosAtivos++;
            totalMultas += u.multas;
            console.log('• ' + u.nome + ' (' + u.tipo + ')');
            console.log('  Status: ' + (u.ativo ? 'Ativo' : 'Inativo'));
            console.log('  Multas: R$' + u.multas.toFixed(2));
        });

        console.log('\nTotal de usuários: ' + this.usuarios.length);
        console.log('Usuários ativos: ' + usuariosAtivos);
        console.log('Total em multas: R$' + totalMultas.toFixed(2));

        // Empréstimos
        const emprestimosAtivos = this.emprestimos.filter((e) => !e.devolvido).length;
        const emprestimosAtrasados = this.emprestimos.filter(
            (e) => !e.devolvido && e.dataDevolucao < new Date(),
        ).length;

        console.log('\nTotal de empréstimos: ' + this.emprestimos.length);
        console.log('Empréstimos ativos: ' + emprestimosAtivos);
        console.log('Empréstimos atrasados: ' + emprestimosAtrasados);

        // Ranking top 3
        const contagem: Record<number, number> = {};
        this.emprestimos.forEach((e) => (contagem[e.livroId] = (contagem[e.livroId] || 0) + 1));
        const ranking = Object.keys(contagem)
            .map((k) => ({ id: Number(k), count: contagem[Number(k)] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
        console.log('\n--- TOP 3 LIVROS MAIS EMPRESTADOS ---');
        ranking.forEach((r, i) => {
            const livro = this.findLivroById(r.id);
            if (livro) console.log(`${i + 1}. ${livro.titulo} (${r.count} empréstimos)`);
        });

        console.log('\n' + '='.repeat(60) + '\n');
    }
}

// ==================================================
// SIMULAÇÃO (substitui os testes misturados do arquivo original)
// ==================================================

const biblioteca = new Biblioteca();

console.log('\n--- TESTE 1: Empréstimo Normal ---');
biblioteca.realizarEmprestimo(1, 1, 10, 'normal');

console.log('\n--- TESTE 2: Empréstimo para Professor ---');
biblioteca.realizarEmprestimo(2, 2, 20, 'normal');

console.log('\n--- TESTE 3: Tentativa de empréstimo com multa pendente ---');
biblioteca.realizarEmprestimo(2, 3, 5, 'normal');

console.log('\n--- TESTE 4: Buscar livros ---');
biblioteca.buscarLivros('code');

console.log('\n--- TESTE 5: Devolução ---');
biblioteca.realizarDevolucao(1);

console.log('\n--- TESTE 6: Adicionar novo livro ---');
biblioteca.adicionarLivro('Design Patterns', 'Gang of Four', 1994, 2, 'tecnologia', 120.0);

console.log('\n--- TESTE 7: Cadastrar novo usuário ---');
biblioteca.cadastrarUsuario('Diego Souza', '55566677788', 'estudante', '48966666666');

biblioteca.gerarRelatorioCompleto();

// OPORTUNIDADES DE REFACTORIZAÇÃO ENCONTRADAS:
// - Separar dados de inicialização da lógica (feito via métodos privados).
// - Encapsular estado em classes (Livro, Usuario, Emprestimo) em vez de estruturas "any".
// - Remover métodos gigantes com muitas responsabilidades, dividindo em funções menores.
// - Validar entradas antes de executar operações.
// - Separar apresentação (impressão de comprovantes) da lógica de negócio.

// RISCOS A LONGO PRAZO SE NÃO REFATORADO:
// - Código difícil de manter: mudanças em regras afetariam métodos gigantes e espalhariam bugs.
// - Difícil de testar automaticamente porque lógica e formatação estão misturadas.
// - Maior probabilidade de violações de invariantes (ex.: atualizar disponibilidade sem registrar empréstimo).
// - Escalabilidade ruim: adicionar novas regras (novos tipos de usuário, políticas) exigiria modificar muitos pontos.

// Observacao: este refactor é uma versao didatica; em producao recomenda-se ainda
// - separar camadas (persistência, serviços, interface), aplicar injeção de dependência,
// - e adicionar testes automatizados.
