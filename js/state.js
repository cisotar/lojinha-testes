// ============================================
// ESTADO DA APLICAÇÃO - PÃO DO CISO
// ============================================

// REMOVER O BLOCO if/else COMPLETAMENTE
// E DEIXAR APENAS O CÓDIGO ESSENCIAL:

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
function carregarCarrinhoSalvo() {
    window.carrinho = {};
    console.log('🆕 Carrinho inicializado vazio');
}

function salvarCarrinho() {
    console.log('🔄 Carrinho atualizado');
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