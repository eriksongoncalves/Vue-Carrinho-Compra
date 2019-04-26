const vm = new Vue({
    el: "#app",
    data: {
        produtos: [],
        produto: false,
        carrinho: [],
        menssagemAlerta: "Item adicionado",
        alertaAtivo: false,
        carrinhoAtivo: false
    },
    filters: {
        numeroPreco(valor) {
            return valor.toLocaleString("pr-BR", {
                style: "currency",
                currency: "BRL"
            });
        }
    },
    methods: {
        fetchProdutos() {
            fetch('./api/produtos.json')
                .then(r => r.json())
                .then(json => {
                    this.produtos = json;
                });
        },
        fetchProduto(id) {
            fetch(`./api/produtos/${id}/dados.json`)
                .then(r => r.json())
                .then(json => {
                    this.produto = json;
                });
        },
        abrirModal(id) {
            this.fetchProduto(id);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        },
        fecharModal({ target, currentTarget }) {
            if (target === currentTarget) {
                this.produto = false;
            }
        },
        cliqueForaCarrinho({ target, currentTarget }) {
            if (target === currentTarget) {
                this.carrinhoAtivo = false;
            }
        },
        adicionarItem() {
            this.produto.estoque--;

            const { id, nome, preco } = this.produto
            this.carrinho.push({ id, nome, preco });

            this.alerta(`${nome} foi adicionado ao carrinho`);
        },
        removerItem(index) {
            this.produto.estoque++;
            this.carrinho.splice(index, 1);
        },
        checarLocalStorage() {
            if (window.localStorage.carrinho) {
                this.carrinho = JSON.parse(window.localStorage.carrinho);
            }
        },
        alerta(mensagem) {
            this.menssagemAlerta = mensagem;
            this.alertaAtivo = true;

            setTimeout(() => {
                this.alertaAtivo = false;
            }, 1000);
        },
        router() {
            const hash = document.location.hash;
            if (hash) {
                this.fetchProduto(hash.replace('#', ''));
            }
        },
        compararEstoque() {
            const items = this.carrinho.filter(item => item.id === this.produto.id);
            this.produto.estoque = this.produto.estoque - items.length;
        }
    },
    computed: {
        carrinhoTotal() {
            let total = 0;

            if (this.carrinho.length) {
                this.carrinho.forEach(item => {
                    total += item.preco;
                });
            }

            return total;
        }
    },
    watch: {
        produto() {
            document.title = this.produto.nome || "Techno";
            const hash = this.produto.id || "";
            history.pushState(null, null, `#${hash}`);

            if (this.produto) {
                this.compararEstoque();
            }
        },
        carrinho() {
            window.localStorage.carrinho = JSON.stringify(this.carrinho);
        }
    },
    created() {
        this.fetchProdutos();
        this.router();
        this.checarLocalStorage();
    }
})