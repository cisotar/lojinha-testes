// ============================================
// ESTADO DA APLICAÇÃO - PÃO DO CISO
// ============================================

// VERIFICAR DUPLICAÇÃO
if (window.__PAO_CARREGADO) {
    console.warn('Pão do Ciso já foi carregado. Ignorando state.js');
} else {
    window.__PAO_CARREGADO = true;

    // ESTADO GLOBAL
    window.carrinho = {};
    window.produtoAtual = null;
    window.enderecoCliente = {
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: '',
        numero: '',
        complemento: '',
        referencia: ''
    };

    window.estadoAplicativo = {
        formaPagamento: null,
        totalGeral: 0,
        modoEntrega: 'retirada',
        taxaEntrega: 0,
        bairroEntrega: null,
        cupomAplicado: null,
        descontoCupom: 0
    };

    // FUNÇÕES DE ESTADO
// FUNÇÕES DE ESTADO - MODIFICADAS
function carregarCarrinhoSalvo() {
    // SEMPRE começa com carrinho vazio (não carrega do localStorage)
    window.carrinho = {};
    console.log('🆕 Carrinho inicializado vazio (não persiste entre sessões)');
}

function salvarCarrinho() {
    // NÃO salva no localStorage - carrinho é apenas da sessão atual
    // Apenas mantém em memória durante a sessão
    console.log('🔄 Carrinho atualizado (apenas em memória)');
}

function resetarEstado() {
    window.carrinho = {};
    window.produtoAtual = null;
    window.enderecoCliente = {
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: '',
        numero: '',
        complemento: '',
        referencia: ''
    };
    
    window.estadoAplicativo = {
        formaPagamento: null,
        totalGeral: 0,
        modoEntrega: 'retirada',
        taxaEntrega: 0,
        bairroEntrega: null,
        cupomAplicado: null,
        descontoCupom: 0
    };
    
    console.log('🔄 Estado resetado');
}

    // EXPORTAR FUNÇÕES
    window.carregarCarrinhoSalvo = carregarCarrinhoSalvo;
    window.salvarCarrinho = salvarCarrinho;
    window.resetarEstado = resetarEstado;
}