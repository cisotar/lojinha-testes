// ============================================
// SISTEMA DE ENVIO DE PEDIDOS - PÃO DO CISO
// ============================================

function processarFinalizacaoPedido() {
    // Coletar dados
    const nome = elemento('nome-cliente')?.value.trim() || '';
    const whatsapp = elemento('whatsapp-cliente')?.value.trim() || '';
    const metodoPagamento = estadoAplicativo?.formaPagamento;
    
    // Validar dados básicos
    if (!nome || nome.length < 3) {
        alert('Por favor, digite seu nome completo.');
        return;
    }
    
    const whatsappNumeros = whatsapp.replace(/\D/g, '');
    if (whatsappNumeros.length !== 11) {
        alert('Por favor, digite um WhatsApp válido (11 dígitos).');
        return;
    }
    
    if (!metodoPagamento) {
        alert('Por favor, selecione uma forma de pagamento.');
        return;
    }
    
    // Coletar endereço se for entrega
    let enderecoTexto = 'Retirada no local';
    if (estadoAplicativo?.modoEntrega === 'entrega') {
        const rua = elemento('logradouro-cliente')?.value.trim() || '';
        const bairro = elemento('bairro-cliente')?.value.trim() || '';
        const numero = elemento('numero-residencia-cliente')?.value.trim() || '';
        const complemento = elemento('complemento-residencia-cliente')?.value.trim() || '';
        const referencia = elemento('ponto-referencia-entrega')?.value.trim() || '';
        const cep = elemento('codigo-postal-cliente')?.value.trim() || '';
        
        if (!rua || !bairro || !numero) {
            alert('Para entrega, preencha todos os campos de endereço obrigatórios.');
            return;
        }
        
        enderecoTexto = `${rua}, ${numero}`;
        if (complemento) enderecoTexto += ` - ${complemento}`;
        if (bairro) enderecoTexto += ` - ${bairro}`;
        if (cep) enderecoTexto += ` (CEP: ${cep})`;
        if (referencia) enderecoTexto += ` [Ref: ${referencia}]`;
    }
    
    // Gerar mensagem para WhatsApp
    const mensagem = gerarMensagemWhatsApp(nome, whatsappNumeros, enderecoTexto, metodoPagamento);
    
// Abrir WhatsApp
    const linkWhatsApp = `https://wa.me/5511982391781?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsApp, '_blank');

    // Salvar o link para o botão de reenvio
    window.ultimoLinkWhatsapp = linkWhatsApp; 

    // 1. Fecha TUDO (pagamento, dados, carrinho e overlay) de uma vez só
    if (typeof fecharTodosModais === 'function') {
        fecharTodosModais();
    }

    // 2. Abre o sucesso com um pequeno atraso para garantir a transição visual
    setTimeout(() => {
        if (typeof abrirModal === 'function') {
            abrirModal('modal-sucesso');
        }
    }, 300);
}

function gerarMensagemWhatsApp(nome, whatsapp, endereco, metodoPagamento) {
    // Calcular totais
    let totalProdutos = 0;
    let itensTexto = '';
    
    if (carrinho) {
        Object.values(carrinho).forEach(item => {
            if (dadosIniciais?.secoes?.[item.indiceSessao]?.itens?.[item.indiceItem]) {
                const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
                const subtotal = produto.preco * item.quantidade;
                totalProdutos += subtotal;
                
                itensTexto += `• ${item.quantidade}x ${produto.nome} (${formatarMoeda(subtotal)})\n`;
                
                // Adicionar opcionais
                if (item.opcionais && Object.keys(item.opcionais).length > 0) {
                    Object.keys(item.opcionais).forEach(opcionalNome => {
                        const opcional = item.opcionais[opcionalNome];
                        itensTexto += `  ├ ${opcional.quantidade}x ${opcionalNome}\n`;
                    });
                }
            }
        });
    }
    
    const taxaEntrega = estadoAplicativo?.taxaEntrega || 0;
    const desconto = estadoAplicativo?.descontoCupom || 0;
    const totalGeral = (totalProdutos - desconto) + taxaEntrega;
    
    // Construir mensagem
    let mensagem = `*NOVO PEDIDO - PÃO DO CISO*\n`;
    mensagem += `══════════════════════════════\n\n`;
    mensagem += `👤 *Cliente:* ${nome}\n`;
    mensagem += `📱 *WhatsApp:* ${whatsapp}\n`;
    mensagem += `📍 *${estadoAplicativo?.modoEntrega === 'entrega' ? 'Endereço' : 'Retirada'}:* ${endereco}\n`;
    mensagem += `💳 *Pagamento:* ${metodoPagamento}\n\n`;
    
    if (estadoAplicativo?.cupomAplicado) {
        mensagem += `🎫 *Cupom:* ${estadoAplicativo.cupomAplicado}\n\n`;
    }
    
    mensagem += `══════════════════════════════\n`;
    mensagem += `🛒 *ITENS DO PEDIDO:*\n\n`;
    mensagem += itensTexto || 'Nenhum item\n';
    
    mensagem += `\n══════════════════════════════\n`;
    mensagem += `💰 *RESUMO FINANCEIRO:*\n\n`;
    mensagem += `Produtos: ${formatarMoeda(totalProdutos)}\n`;
    
    if (desconto > 0) {
        mensagem += `Desconto: -${formatarMoeda(desconto)}\n`;
    }
    
    if (taxaEntrega > 0) {
        mensagem += `Taxa de Entrega: ${formatarMoeda(taxaEntrega)}\n`;
    } else if (estadoAplicativo?.modoEntrega === 'entrega') {
        mensagem += `Taxa de Entrega: Grátis\n`;
    }
    
    mensagem += `\n*TOTAL FINAL: ${formatarMoeda(totalGeral)}*\n`;
    mensagem += `══════════════════════════════\n`;
    mensagem += `_Pedido gerado via site Pão do Ciso_`;
    
    return mensagem;
}

function reiniciarFluxoCompra() {
    console.log('🔄 Reiniciando sistema com reload...');
    localStorage.removeItem('carrinho_pao_do_ciso');
    window.location.reload();
}

function reenviarPedidoWhatsapp() {
    if (window.ultimoLinkWhatsapp) {
        window.open(window.ultimoLinkWhatsapp, '_blank');
    } else {
        alert("Link do pedido não encontrado. Tente enviar novamente.");
    }
}

// Exportações
window.processarFinalizacaoPedido = processarFinalizacaoPedido;
window.reiniciarFluxoCompra = reiniciarFluxoCompra;
window.reenviarPedidoWhatsapp = reenviarPedidoWhatsapp;