// ============================================
// SISTEMA DE PAGAMENTO - PÃO DO CISO
// ============================================
function abrirModalPagamento() {
    // 1. Calcula os valores consolidados (Produtos, Desconto e Taxa)
    const valores = typeof calcularTotalFinal === 'function' ? calcularTotalFinal() : {
        itens: 0, desconto: 0, taxa: 0, total: 0
    };
    
    // 2. Localizar o container de resumo no modal de pagamento
    const containerResumo = elemento('resumo-final-pedido-pagamento');
    
    // 3. Injetar o HTML IDÊNTICO ao do modal do carrinho (com ajuste de espaço inferior)
    if (containerResumo) {
        containerResumo.innerHTML = `
            <div class="resumo-carrinho-container" style="margin-top: 20px; margin-bottom: 25px; border: 1px solid var(--borda-nav); border-radius: 12px; background-color: var(--branco); overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
                
                <div style="background-color: var(--bege-claro); padding: 10px 15px; border-bottom: 1px solid var(--borda-nav);">
                    <span style="font-size: 13px; color: var(--marrom-cafe); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Resumo do Pedido</span>
                </div>

                <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 14px; color: var(--cinza-escuro);">Produtos</span>
                        <span style="font-size: 14px; font-weight: 500;">${formatarMoeda(valores.itens)}</span>
                    </div>

                    <div style="display: ${valores.desconto > 0 ? 'flex' : 'none'}; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 14px; color: var(--red);">🏷️ Desconto</span>
                        <span style="font-size: 14px; color: var(--red); font-weight: bold;">- ${formatarMoeda(valores.desconto)}</span>
                    </div>

                    <div style="display: ${estadoAplicativo.modoEntrega === 'entrega' ? 'flex' : 'none'}; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 14px; color: var(--cinza-escuro);">🚚 Taxa de Entrega</span>
                        <span style="font-size: 14px; font-weight: 500;">${valores.taxa > 0 ? formatarMoeda(valores.taxa) : 'Calculando...'}</span>
                    </div>

                    <div style="border-top: 1px dashed var(--borda-nav); margin: 12px 0;"></div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 16px; font-weight: bold; color: var(--verde-militar);">TOTAL GERAL</span>
                        <span style="font-size: 20px; font-weight: 800; color: var(--verde-militar);">
                            ${formatarMoeda(valores.total)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // 4. Sincroniza o valor do PIX e estado global para o WhatsApp
    const valorPixElemento = elemento('valor-pix');
    if (valorPixElemento) {
        valorPixElemento.textContent = formatarMoeda(valores.total);
    }
    
    if (typeof estadoAplicativo !== 'undefined') {
        estadoAplicativo.totalGeral = valores.total;
    }

    // 5. Abre o modal finalmente
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