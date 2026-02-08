// ============================================
// SISTEMA DE PAGAMENTO - PÃO DO CISO
// ============================================
function abrirModalPagamento() {
    // 1. Calcula os valores consolidados (Produtos, Desconto e Taxa)
    // Esta função deve estar exportada no seu carrinho.js
    const valores = typeof calcularTotalFinal === 'function' ? calcularTotalFinal() : {
        itens: 0, desconto: 0, taxa: 0, total: 0
    };
    
    // 2. Recuperar elementos do seu HTML
    const quantidadeElemento = elemento('quantidade-itens-pagamento');
    const taxaElemento = elemento('taxa-entrega-pagamento');
    const totalElemento = elemento('total-geral-pagamento');
    const valorPixElemento = elemento('valor-pix');
    
    // 3. Atualizar Quantidade de itens
    if (quantidadeElemento) {
        const totalItens = Object.values(carrinho).reduce((total, item) => total + item.quantidade, 0);
        quantidadeElemento.textContent = totalItens;
    }
    
    // 4. Atualizar Taxa de Entrega
    if (taxaElemento) {
        taxaElemento.textContent = formatarMoeda(valores.taxa);
    }

    // 5. LÓGICA DO DESCONTO: Criar ou atualizar a linha de desconto
    let linhaDesconto = document.getElementById('linha-desconto-pagamento');
    
    if (valores.desconto > 0) {
        if (!linhaDesconto && totalElemento) {
            // Se a linha não existe, cria ela dinamicamente
            linhaDesconto = document.createElement('div');
            linhaDesconto.id = 'linha-desconto-pagamento';
            linhaDesconto.style.display = 'flex';
            linhaDesconto.style.justifyContent = 'space-between';
            linhaDesconto.style.color = '#d9534f'; // Vermelho para destaque
            linhaDesconto.style.fontWeight = 'bold';
            linhaDesconto.style.margin = '8px 0';
            
            // Insere a linha de desconto logo ANTES do Total
            totalElemento.closest('.linha-resumo, div').before(linhaDesconto);
        }
        
        if (linhaDesconto) {
            linhaDesconto.innerHTML = `<span><i class="fas fa-tag"></i> Desconto Cupom:</span><span>-${formatarMoeda(valores.desconto)}</span>`;
            linhaDesconto.style.display = 'flex';
        }
    } else if (linhaDesconto) {
        // Se não houver desconto, remove a linha da visualização
        linhaDesconto.style.display = 'none';
    }
    
    // 6. Atualizar os Totais (Total Geral e Valor do PIX)
    if (totalElemento) {
        totalElemento.textContent = formatarMoeda(valores.total);
    }
    
    if (valorPixElemento) {
        valorPixElemento.textContent = formatarMoeda(valores.total);
    }
    
    // 7. Sincroniza com o estado global para o envio do WhatsApp
    if (typeof estadoAplicativo !== 'undefined') {
        estadoAplicativo.totalGeral = valores.total;
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