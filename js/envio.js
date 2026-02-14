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
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=5511982391781&text=${encodeURIComponent(mensagem)}`;
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
    // 1. Inicializar variáveis de cálculo
    let totalProdutos = 0;
    let itensTexto = '';
    
    // 2. Percorrer o carrinho com a mesma lógica do resumo financeiro
    if (carrinho) {
        Object.values(carrinho).forEach(item => {
            const secao = dadosIniciais?.secoes?.[item.indiceSessao];
            const produto = secao?.itens?.[item.indiceItem];

            if (produto) {
                // Cálculo do preço base do produto
                let precoUnitarioTotal = Number(produto.preco || 0);
                let listaOpcionaisTexto = '';

                // Soma o valor dos opcionais ao preço unitário (se existirem)
                if (item.opcionais && Object.keys(item.opcionais).length > 0) {
                    Object.entries(item.opcionais).forEach(([nomeOpcional, dadosOpcional]) => {
                        const qtdOpc = Number(dadosOpcional.quantidade || 0);
                        const precoOpc = Number(dadosOpcional.preco || 0);
                        
                        precoUnitarioTotal += (precoOpc * qtdOpc);
                        listaOpcionaisTexto += `   ├ ${qtdOpc}x ${nomeOpcional}\n`;
                    });
                }

                const subtotalItem = precoUnitarioTotal * item.quantidade;
                totalProdutos += subtotalItem;
                
                // Monta o texto do item principal
                itensTexto += `• ${item.quantidade}x ${produto.nome} (${formatarMoeda(subtotalItem)})\n`;
                // Adiciona os opcionais logo abaixo do item se houver
                if (listaOpcionaisTexto) {
                    itensTexto += listaOpcionaisTexto;
                }
            }
        });
    }
    
    // 3. Obter valores de taxas e descontos do estado global
    const taxaEntrega = estadoAplicativo.modoEntrega === 'entrega' ? Number(estadoAplicativo.taxaEntrega || 0) : 0;
    const desconto = Number(estadoAplicativo.descontoCupom || 0);
    const totalGeral = (totalProdutos - desconto) + taxaEntrega;
    
    // 4. Construir o corpo da mensagem
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
    
    if (estadoAplicativo.modoEntrega === 'entrega') {
        mensagem += `Taxa de Entrega: ${taxaEntrega > 0 ? formatarMoeda(taxaEntrega) : 'Grátis'}\n`;
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