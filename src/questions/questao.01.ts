class Livro {
    // Aqui eu crio uma variável para saber se o livro está disponível ou não
    // Começa como true porque quando criamos um livro novo, ele está disponível
    public disponivel: boolean = true;

    constructor(
        public id: number,
        public titulo: string,
        public autor: string,
        public editora: string,
        public anoPublicacao: number,
    ) {}

    // Esse método serve para emprestar o livro
    // Ele só empresta se o livro estiver disponível
    emprestar(): boolean {
        // Verifico se o livro está disponível
        if (this.disponivel) {
            // Se está disponível, marco como não disponível (false)
            this.disponivel = false;
            console.log(`✓ Livro "${this.titulo}" emprestado com sucesso!`);
            return true; // Retorno true pra dizer que deu certo
        } else {
            // Se não está disponível, mostro mensagem de erro
            console.log(`✗ Livro "${this.titulo}" não está disponível para empréstimo.`);
            return false; // Retorno false pra dizer que não deu certo
        }
    }

    // Esse método serve para devolver o livro
    devolver(): void {
        // Quando devolve, o livro fica disponível novamente
        this.disponivel = true;
        console.log(`✓ Livro "${this.titulo}" devolvido com sucesso!`);
    }
}

class Membro {
    constructor(
        public id: number,
        public nome: string,
        public identificacao: string,
        // A lista começa vazia porque no começo o membro não tem nenhum livro emprestado
        public livrosEmprestados: Livro[] = [],
    ) {}

    // Esse método serve para o membro pegar um livro emprestado
    pegarEmprestado(livro: Livro): void {
        console.log(`\n${this.nome} está tentando pegar emprestado "${livro.titulo}"...`);

        // Verifico se o livro já está na lista de livros emprestados desse membro
        const jaTemEsseLivro = this.livrosEmprestados.some((l) => l.id === livro.id);

        if (jaTemEsseLivro) {
            // Se já tem, não pode pegar de novo
            console.log(`✗ ${this.nome} já tem o livro "${livro.titulo}" emprestado!`);
            return;
        }

        // Tento emprestar o livro usando o método da classe Livro
        const conseguiu = livro.emprestar();

        // Se conseguiu emprestar, adiciono na lista de livros do membro
        if (conseguiu) {
            this.livrosEmprestados.push(livro);
            console.log(
                `  ${this.nome} agora tem ${this.livrosEmprestados.length} livro(s) emprestado(s).`,
            );
        }
    }

    // Esse método serve para o membro devolver um livro
    devolverLivro(livro: Livro): void {
        console.log(`\n${this.nome} está tentando devolver "${livro.titulo}"...`);

        // Procuro o livro na lista de livros emprestados
        const indice = this.livrosEmprestados.findIndex((l) => l.id === livro.id);

        // Se não encontrei (indice = -1), é porque o membro não tem esse livro
        if (indice === -1) {
            console.log(`✗ ${this.nome} não tem o livro "${livro.titulo}" para devolver!`);
            return;
        }

        // Se encontrei, tiro o livro da lista
        this.livrosEmprestados.splice(indice, 1);
        // E chamo o método devolver do livro para marcá-lo como disponível
        livro.devolver();
        console.log(
            `  ${this.nome} agora tem ${this.livrosEmprestados.length} livro(s) emprestado(s).`,
        );
    }
}

const livros: Livro[] = [
    new Livro(1, 'Harry Potter e a Pedra Filosofal', 'J. K. Rowling', 'Bloomsbury', 1997),
    new Livro(2, 'O senhor dos aneis', 'J. R. R. Tolkien', 'Allen & Unwin', 1954),
    new Livro(
        3,
        'Crônica da morte anuciada',
        'Gabriel Garcia Marquez',
        'Editorial Ovelha Preta',
        1981,
    ),
    new Livro(4, '1984', 'George Orwell', 'Secker & Warburg', 1949),
];

const membros: Membro[] = [
    new Membro(1, 'Isai Medina', '707.123.456-00'),
    new Membro(2, 'Anatoli Karpov', '708.123.654.01'),
    new Membro(3, 'Garry Kasparov', '709.312.465-67'),
];

// ============================================
// SIMULAÇÃO DAS OPERAÇÕES (PONTO 6)
// ============================================
console.log('========================================');
console.log('SISTEMA DE BIBLIOTECA - SIMULAÇÃO');
console.log('========================================');

// Operação 1: Isai pega Harry Potter emprestado
membros[0].pegarEmprestado(livros[0]);

// Operação 2: Anatoli pega O Senhor dos Anéis emprestado
membros[1].pegarEmprestado(livros[1]);

// Operação 3: Garry tenta pegar Harry Potter (mas está emprestado para Isai)
membros[2].pegarEmprestado(livros[0]);

// Operação 4: Garry pega 1984 emprestado
membros[2].pegarEmprestado(livros[3]);

// Operação 5: Isai devolve Harry Potter
membros[0].devolverLivro(livros[0]);

// Operação 6: Garry agora consegue pegar Harry Potter
membros[2].pegarEmprestado(livros[0]);

// Operação 7: Isai tenta devolver Harry Potter de novo (mas já devolveu)
membros[0].devolverLivro(livros[0]);

// Operação 8: Anatoli pega Crônica da morte anunciada
membros[1].pegarEmprestado(livros[2]);

// Operação 9: Anatoli tenta pegar O Senhor dos Anéis de novo (já tem)
membros[1].pegarEmprestado(livros[1]);

// Operação 10: Garry devolve 1984
membros[2].devolverLivro(livros[3]);

// Operação 11: Isai pega 1984 (agora está disponível)
membros[0].pegarEmprestado(livros[3]);

// Operação 12: Anatoli devolve todos seus livros
membros[1].devolverLivro(livros[1]);
membros[1].devolverLivro(livros[2]);

console.log('\n========================================');
console.log('FIM DA SIMULAÇÃO');
console.log('========================================');
