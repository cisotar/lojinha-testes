// ============================================
// RECUPERAÇÃO DE CARRINHO - PÃO DO CISO
// ============================================

console.log('✅ recuperacao-carrinho.js carregado');

// ===================== VERIFICAR CARRINHO RECUPERADO =====================
function verificarCarrinhoRecuperado() {
    console.log('🔍 VERIFICAR CARRINHO: Iniciando...');
    
    // 1. Contar itens no carrinho atual
    const itensCarrinho = Object.keys(window.carrinho).length;
    console.log(`   📊 Itens encontrados no carrinho: ${itensCarrinho}`);
    
    // 2. Apenas verificar se tem itens (SEM sessionStorage)
    if (itensCarrinho > 0) {
        console.log(`🛒 ${itensCarrinho} itens no carrinho. Mostrando modal...`);
        
        // Atualizar número no modal
        const elementoQuantidade = document.getElementById('quantidade-itens-recuperados');
        if (elementoQuantidade) {
            elementoQuantidade.textContent = itensCarrinho;
            console.log(`   ✅ Contador atualizado: ${itensCarrinho} itens`);
        }
        
        // Mostrar modal imediatamente
        console.log('🎯 Abrindo modal de recuperação...');
        abrirModal('modal-recuperar-carrinho');
        
    } else {
        console.log('✅ Carrinho vazio, sem ação necessária.');
    }
}

// ===================== LIMPAR CARRINHO RECUPERADO =====================
function limparCarrinhoRecuperado() {
    console.log('🗑️ LIMPAR CARRINHO: Iniciando...');
    
    // 1. Limpar dados do carrinho
    window.carrinho = {};
    console.log('   ✅ Carrinho limpo na memória');
    
    // 2. Salvar no localStorage
    if (typeof salvarCarrinho === 'function') {
        salvarCarrinho();
        console.log('   ✅ Carrinho vazio salvo no localStorage');
    }
    
    // 3. Limpar badges visuais
    const todosBadges = document.querySelectorAll('.badge-quantidade');
    console.log(`   🏷️ Removendo ${todosBadges.length} badges visuais`);
    todosBadges.forEach(badge => badge.remove());
    
    // 4. Atualizar barra do carrinho
    if (typeof atualizarBarraCarrinho === 'function') {
        atualizarBarraCarrinho();
        console.log('   📊 Barra do carrinho atualizada');
    }
    
    // 5. Fechar modal
    fecharModal('modal-recuperar-carrinho');
    console.log('   ❌ Modal fechado');
    
    // 6. Feedback para o usuário
    if (typeof mostrarNotificacao === 'function') {
        mostrarNotificacao('🛒 Carrinho limpo! Comece uma nova compra.');
        console.log('   💬 Notificação exibida');
    }
}

// ===================== INICIAR VERIFICAÇÃO =====================
// Esta função será chamada do main.js
function iniciarRecuperacaoCarrinho() {
    console.log('🚀 INICIAR RECUPERAÇÃO: Verificando imediatamente...');
    verificarCarrinhoRecuperado();
}

// ===================== EXPORTAR FUNÇÕES =====================
window.verificarCarrinhoRecuperado = verificarCarrinhoRecuperado;
window.limparCarrinhoRecuperado = limparCarrinhoRecuperado;
window.iniciarRecuperacaoCarrinho = iniciarRecuperacaoCarrinho;

console.log('🎯 Funções de recuperação exportadas');