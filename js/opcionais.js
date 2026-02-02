// ============================================
// GERENCIAMENTO DE OPCIONAIS - PÃO DO CISO
// ============================================

function alterarQuantidadeOpcional(nomeOpcional, precoOpcional, valor) {
    if (produtoAtual.quantidade === 0) {
        alert('Adicione pelo menos 1 item do produto antes de selecionar opcionais.');
    return;
}
    
    // Inicializar opcional se não existir
    if (!produtoAtual.opcionais[nomeOpcional]) {
        produtoAtual.opcionais[nomeOpcional] = {
            quantidade: 0,
            preco: precoOpcional
        };
    }
    
    const novaQuantidade = produtoAtual.opcionais[nomeOpcional].quantidade + valor;
    
    if (novaQuantidade < 0) return;
    
    produtoAtual.opcionais[nomeOpcional].quantidade = novaQuantidade;
    
    // Atualizar display
    const elementoQuantidade = elemento(`quantidade-opcional-${nomeOpcional.replace(/\s+/g, '-')}`);
    if (elementoQuantidade) {
        elementoQuantidade.textContent = novaQuantidade;
    }
    
    // Remover opcional se quantidade for zero
    if (novaQuantidade === 0) {
        delete produtoAtual.opcionais[nomeOpcional];
    }
    
    // Recalcular subtotal
    atualizarSubtotalProduto();
}

// EXPORTAR FUNÇÕES
window.alterarQuantidadeOpcional = alterarQuantidadeOpcional;
//window.obterOpcionaisAtivos = obterOpcionaisAtivos;