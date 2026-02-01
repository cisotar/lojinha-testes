// ============================================
// GERENCIAMENTO DO CARRINHO - PÃO DO CISO
// ============================================

// ===================== BARRA DO CARRINHO =====================
function atualizarBarraCarrinho() {
    const barraCarrinho = elemento('barra-carrinho');
    const quantidadeElemento = elemento('resumo-quantidade-carrinho');
    const totalElemento = elemento('resumo-total-carrinho');
    
    if (!barraCarrinho || !quantidadeElemento || !totalElemento) return;
    
    let quantidadeTotal = 0;
    let valorTotal = 0;
    
    Object.values(carrinho).forEach(item => {
        const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
        let subtotalItem = produto.preco * item.quantidade;
        
        // Adicionar opcionais
        for (let nomeOpcional in item.opcionais) {
            const opcional = item.opcionais[nomeOpcional];
            subtotalItem += opcional.quantidade * opcional.preco;
        }
        
        quantidadeTotal += item.quantidade;
        valorTotal += subtotalItem;
    });
    
    if (quantidadeTotal > 0) {
        barraCarrinho.style.display = 'flex';
        quantidadeElemento.textContent = `${quantidadeTotal} ${quantidadeTotal === 1 ? 'item' : 'itens'}`;
        totalElemento.textContent = formatarMoeda(valorTotal);
    } else {
        barraCarrinho.style.display = 'none';
    }
}

// ===================== MODAL DO CARRINHO =====================
function abrirModalCarrinho() {
    renderizarCarrinho();
    abrirModal('modal-carrinho');
}

function renderizarCarrinho() {
    const container = elemento('conteudo-carrinho');
    if (!container) return;

    const itens = Object.values(carrinho);
    
    if (itens.length === 0) {
        container.innerHTML = `
            <div class="carrinho-vazio">
                <i class="fas fa-shopping-basket" style="font-size:3rem; color:#ddd; margin-bottom:20px;"></i>
                <p style="color:#888; font-weight:500; margin-bottom:20px;">Seu carrinho está vazio no momento.</p>
                <button class="botao-acao botao-verde" onclick="fecharModal('modal-carrinho')">
                    VOLTAR AO CARDÁPIO
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <h3 class="titulo-carrinho">Carrinho de Compras</h3>
        <div class="lista-itens-carrinho">
    `;

    itens.forEach(item => {
        const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
        let subtotalItem = produto.preco * item.quantidade;
        let htmlOpcionais = '';

        // Opcionais do item
        Object.keys(item.opcionais).forEach(nomeOpcional => {
            const opcional = item.opcionais[nomeOpcional];
            subtotalItem += opcional.quantidade * opcional.preco;
            htmlOpcionais += `
                <div class="opcional-carrinho">
                    + ${opcional.quantidade}x ${nomeOpcional}
                </div>
            `;
        });

        html += `
            <div class="item-carrinho">
                <div class="info-item-carrinho">
                    <div class="nome-quantidade-item">
                        <span class="quantidade-item">${item.quantidade}x</span>
                        <span class="nome-item">${produto.nome}</span>
                    </div>
                    ${htmlOpcionais}
                    <div class="subtotal-item">${formatarMoeda(subtotalItem)}</div>
                </div>
                <button class="botao-remover-item" onclick="removerItemDoCarrinho('${item.identificador}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    html += `
        </div>
        
        <!-- Opções do Carrinho -->
        <div class="opcoes-carrinho">
            <!-- Cupom -->
            <div class="grupo-cupom">
                <input type="text" id="campo-cupom-carrinho" 
                       placeholder="CUPOM DE DESCONTO" 
                       class="campo-cupom">
                <button class="botao-aplicar-cupom" onclick="aplicarCupom()">
                    APLICAR
                </button>
            </div>
            
            <!-- Modo de Entrega -->
            <div class="grupo-entrega">
                <p class="titulo-entrega">Como deseja receber seu pedido?</p>
                <div class="opcoes-entrega">
                    <label class="opcao-entrega ${estadoAplicativo.modoEntrega === 'retirada' ? 'selecionada' : ''}">
                        <input type="radio" name="modoEntrega" value="retirada" 
                               ${estadoAplicativo.modoEntrega === 'retirada' ? 'checked' : ''}
                               onchange="alterarModoEntrega('retirada')">
                        <i class="fas fa-store"></i>
                        <span>RETIRADA</span>
                    </label>
                    <label class="opcao-entrega ${estadoAplicativo.modoEntrega === 'entrega' ? 'selecionada' : ''}">
                        <input type="radio" name="modoEntrega" value="entrega" 
                               ${estadoAplicativo.modoEntrega === 'entrega' ? 'checked' : ''}
                               onchange="alterarModoEntrega('entrega')">
                        <i class="fas fa-motorcycle"></i>
                        <span>ENTREGA</span>
                    </label>
                </div>
                
                <!-- Informação da Taxa -->
                <div id="informacao-taxa-entrega" class="informacao-taxa" 
                     style="${estadoAplicativo.modoEntrega === 'entrega' ? 'display: block;' : 'display: none;'}">
                    <i class="fas fa-info-circle"></i>
                    <span>Taxa de entrega será calculada no próximo passo</span>
                </div>
            </div>
        </div>
        
        <!-- Resumo Financeiro -->
        <div id="resumo-financeiro-carrinho"></div>
        
        <!-- Botões de Ação -->
        <div class="botoes-carrinho">
            <button class="botao-acao botao-bege" onclick="fecharModal('modal-carrinho')">
                + CONTINUAR COMPRANDO +
            </button>
            <button class="botao-acao botao-verde" onclick="prosseguirParaDadosCliente()">
                PROSSEGUIR PARA O PAGAMENTO <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;

    container.innerHTML = html;
    atualizarResumoFinanceiroCarrinho();
}

function atualizarResumoFinanceiroCarrinho() {
    const container = elemento('resumo-financeiro-carrinho');
    if (!container) return;

    let totalProdutos = 0;
    
    Object.values(carrinho).forEach(item => {
        const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
        let subtotalItem = produto.preco * item.quantidade;
        
        Object.values(item.opcionais).forEach(opcional => {
            subtotalItem += opcional.quantidade * opcional.preco;
        });
        
        totalProdutos += subtotalItem;
    });

    // Aplicar cupom se existir
    let desconto = estadoAplicativo.descontoCupom || 0;
    let subtotalComDesconto = totalProdutos - desconto;
    
    // Adicionar taxa de entrega se for entrega
    let taxaEntrega = 0;
    if (estadoAplicativo.modoEntrega === 'entrega') {
        taxaEntrega = estadoAplicativo.taxaEntrega || 0;
    }
    
    const totalGeral = subtotalComDesconto + taxaEntrega;
    estadoAplicativo.totalGeral = totalGeral;

    container.innerHTML = `
        <div class="detalhes-resumo">
            <div class="linha-resumo">
                <span>Produtos:</span>
                <span>${formatarMoeda(totalProdutos)}</span>
            </div>
            
            ${desconto > 0 ? `
            <div class="linha-resumo desconto">
                <span>Desconto:</span>
                <span>- ${formatarMoeda(desconto)}</span>
            </div>
            ` : ''}
            
            <div class="linha-resumo">
                <span>Taxa de Entrega:</span>
                <span>${estadoAplicativo.modoEntrega === 'entrega' ? formatarMoeda(taxaEntrega) : 'Grátis'}</span>
            </div>
        </div>
        
        <div class="total-geral-carrinho">
            <span class="rotulo-total">TOTAL</span>
            <span class="valor-total">${formatarMoeda(totalGeral)}</span>
        </div>
    `;
}

function removerItemDoCarrinho(identificador) {
    delete carrinho[identificador];
    salvarCarrinho();
    renderizarCarrinho();
    atualizarBarraCarrinho();
    renderizarCardapio();
}

function aplicarCupom() {
    const campoCupom = elemento('campo-cupom-carrinho');
    if (!campoCupom) return;

    const codigoCupom = campoCupom.value.trim().toUpperCase();
    
    if (!codigoCupom) {
        alert('Digite um código de cupom.');
        return;
    }

    const cupomValido = dadosIniciais.cupons?.find(cupom => 
        cupom.codigo.toUpperCase() === codigoCupom
    );

    if (!cupomValido) {
        alert('Cupom inválido ou expirado.');
        campoCupom.value = '';
        return;
    }

    // Calcular desconto
    let totalProdutos = 0;
    Object.values(carrinho).forEach(item => {
        const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
        totalProdutos += produto.preco * item.quantidade;
    });

    let desconto = 0;
    if (cupomValido.tipo === 'porcentagem') {
        desconto = totalProdutos * (cupomValido.valor / 100);
    } else if (cupomValido.tipo === 'fixo') {
        desconto = cupomValido.valor;
    }

    estadoAplicativo.cupomAplicado = codigoCupom;
    estadoAplicativo.descontoCupom = desconto;

    atualizarResumoFinanceiroCarrinho();
    mostrarNotificacao(`Cupom ${codigoCupom} aplicado com sucesso!`);
}

function alterarModoEntrega(modo) {
    estadoAplicativo.modoEntrega = modo;
    
    // Atualizar classes das opções
    document.querySelectorAll('.opcao-entrega').forEach(opcao => {
        opcao.classList.remove('selecionada');
    });
    
    const opcaoSelecionada = document.querySelector(`[value="${modo}"]`).closest('.opcao-entrega');
    if (opcaoSelecionada) {
        opcaoSelecionada.classList.add('selecionada');
    }
    
    // Mostrar/ocultar informação da taxa
    const infoTaxa = elemento('informacao-taxa-entrega');
    if (infoTaxa) {
        infoTaxa.style.display = modo === 'entrega' ? 'block' : 'none';
    }
    
    atualizarResumoFinanceiroCarrinho();
}

function prosseguirParaDadosCliente() {
    if (Object.keys(carrinho).length === 0) {
        alert('Adicione itens ao carrinho antes de prosseguir.');
        return;
    }

    fecharModal('modal-carrinho');
    abrirModal('modal-dados-cliente');
    
    // Se for retirada, esconder seção de endereço
    if (estadoAplicativo.modoEntrega === 'retirada') {
        const secaoEndereco = elemento('secao-endereco');
        if (secaoEndereco) {
            secaoEndereco.style.display = 'none';
        }
    } else {
        const secaoEndereco = elemento('secao-endereco');
        if (secaoEndereco) {
            secaoEndereco.style.display = 'block';
        }
    }
}

// EXPORTAR FUNÇÕES
window.atualizarBarraCarrinho = atualizarBarraCarrinho;
window.abrirModalCarrinho = abrirModalCarrinho;
window.removerItemDoCarrinho = removerItemDoCarrinho;
window.aplicarCupom = aplicarCupom;
window.alterarModoEntrega = alterarModoEntrega;
window.prosseguirParaDadosCliente = prosseguirParaDadosCliente;