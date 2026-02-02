// ============================================
// ESTADO DA APLICAÇÃO - PÃO DO CISO
// ============================================

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
    try {
        const carrinhoSalvo = localStorage.getItem('carrinho_pao_do_ciso');
        if (carrinhoSalvo) {
            window.carrinho = JSON.parse(carrinhoSalvo);
            console.log('🛒 Carrinho carregado do localStorage:', window.carrinho);
        } else {
            window.carrinho = {};
            console.log('🆕 Carrinho inicializado vazio');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar carrinho:', error);
        window.carrinho = {};
    }
}

function salvarCarrinho() {
    try {
        localStorage.setItem('carrinho_pao_do_ciso', JSON.stringify(window.carrinho));
        console.log('💾 Carrinho salvo no localStorage:', window.carrinho);
    } catch (error) {
        console.error('❌ Erro ao salvar carrinho:', error);
    }
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
    
    localStorage.removeItem('carrinho_pao_do_ciso');
    console.log('🔄 Estado resetado completamente');
}

// EXPORTAR FUNÇÕES
window.carregarCarrinhoSalvo = carregarCarrinhoSalvo;
window.salvarCarrinho = salvarCarrinho;
window.resetarEstado = resetarEstado;