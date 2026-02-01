// ============================================
// SISTEMA DE PAGAMENTO - PÃO DO CISO
// ============================================

function abrirModalPagamento() {
    // Atualizar valores no modal
    const quantidadeElemento = elemento('quantidade-itens-pagamento');
    const taxaElemento = elemento('taxa-entrega-pagamento');
    const totalElemento = elemento('total-geral-pagamento');
    const valorPixElemento = elemento('valor-pix');
    
    if (quantidadeElemento) {
        const totalItens = Object.values(carrinho).reduce((total, item) => total + item.quantidade, 0);
        quantidadeElemento.textContent = totalItens;
    }
    
    if (taxaElemento) {
        taxaElemento.textContent = formatarMoeda(estadoAplicativo.taxaEntrega || 0);
    }
    
    if (totalElemento) {
        totalElemento.textContent = formatarMoeda(estadoAplicativo.totalGeral);
    }
    
    if (valorPixElemento) {
        valorPixElemento.textContent = formatarMoeda(estadoAplicativo.totalGeral);
    }
    
    abrirModal('modal-pagamento');
}

function selecionarPagamento(forma, elementoHtml) {
    estadoAplicativo.formaPagamento = forma;
    
    // Remover seleção de todos
    document.querySelectorAll('.opcao-pagamento').forEach(opcao => {
        opcao.style.borderColor = "#eee";
        opcao.style.background = "#fff";
        const frame = opcao.querySelector('.pagamento-info-frame, .opcao-conteudo');
        if (frame) frame.style.display = 'none';
    });
    
    // Selecionar atual
    elementoHtml.style.borderColor = "var(--marrom-cafe)";
    elementoHtml.style.background = "#fdfaf7";
    const infoFrame = elementoHtml.querySelector('.pagamento-info-frame, .opcao-conteudo');
    if (infoFrame) infoFrame.style.display = 'block';
    
    // Atualizar valor do PIX
    if (forma === 'PIX') {
        const txtValor = document.getElementById('pix-valor-txt');
        if (txtValor) txtValor.textContent = formatarMoeda(estadoAplicativo.totalGeral);
        
        // Atualizar também no novo formato
        const valorPix = document.getElementById('valor-pix');
        if (valorPix) valorPix.textContent = formatarMoeda(estadoAplicativo.totalGeral);
    }
    
    // Habilitar botão de finalizar
    const botaoFinalizar = document.getElementById('botao-finalizar-pedido');
    if (botaoFinalizar) {
        botaoFinalizar.disabled = false;
    }
}

function copiarChavePix() {
    const chave = 'paodociso@gmail.com';
    navigator.clipboard.writeText(chave).then(() => {
        const mensagem = elemento('mensagem-copiado');
        if (mensagem) {
            mensagem.style.display = 'block';
            setTimeout(() => {
                mensagem.style.display = 'none';
            }, 3000);
        }
    });
}

function finalizarPedido() {
    if (!estadoAplicativo.formaPagamento) {
        alert('Por favor, selecione uma forma de pagamento.');
        return;
    }

    // Desabilitar botão durante o processamento
    const botao = elemento('botao-finalizar-pedido');
    if (botao) {
        botao.disabled = true;
        botao.innerHTML = 'PROCESSANDO... <i class="fas fa-spinner fa-spin"></i>';
    }

    // Processar pedido
    if (typeof processarFinalizacaoPedido === 'function') {
        setTimeout(() => {
            processarFinalizacaoPedido();
        }, 1000);
    } else {
        alert('Erro: Função de processamento não encontrada.');
        if (botao) {
            botao.disabled = false;
            botao.innerHTML = 'FINALIZAR PEDIDO <i class="fab fa-whatsapp"></i>';
        }
    }
}

// EXPORTAR FUNÇÕES
window.abrirModalPagamento = abrirModalPagamento;
window.selecionarPagamento = selecionarPagamento;
window.copiarChavePix = copiarChavePix;
window.finalizarPedido = finalizarPedido;