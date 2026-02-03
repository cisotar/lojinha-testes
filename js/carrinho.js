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
    
    // 1. Caso Carrinho Vazio
    if (itens.length === 0) {
        container.innerHTML = gerarHTMLCarrinhoVazio();
        return;
    }

    // 2. Montagem do HTML Modularizado
    let html = `
        <h3 class="titulo-carrinho">Carrinho de Compras</h3>
        <div class="lista-itens-carrinho">
            ${itens.map(item => gerarHTMLItemCarrinho(item)).join('')}
        </div>
        
        ${gerarHTMLOpcoesEntregaCupom()}
        
        <div id="resumo-financeiro-carrinho"></div>
        
        ${gerarHTMLBotoesAcaoCarrinho()}
    `;

    container.innerHTML = html;
    atualizarResumoFinanceiroCarrinho();
}

// --- SUB-FUNÇÕES DE RENDERIZAÇÃO ---

function gerarHTMLCarrinhoVazio() {
    return `
        <div class="carrinho-vazio">
            <i class="fas fa-shopping-basket" style="font-size:3rem; color:#ddd; margin-bottom:20px;"></i>
            <p style="color:#888; font-weight:500; margin-bottom:20px;">Seu carrinho está vazio no momento.</p>
            <button class="botao-acao botao-bege" onclick="fecharModal('modal-carrinho')">
                VOLTAR AO CARDÁPIO
            </button>
        </div>
    `;
}

function gerarHTMLItemCarrinho(item) {
    const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
    let subtotalItem = produto.preco * item.quantidade;
    let htmlOpcionais = '';

    Object.keys(item.opcionais).forEach(nomeOpcional => {
        const opcional = item.opcionais[nomeOpcional];
        subtotalItem += opcional.quantidade * opcional.preco;
        htmlOpcionais += `<div class="opcional-carrinho">+ ${opcional.quantidade}x ${nomeOpcional}</div>`;
    });

    return `
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
}

function gerarHTMLOpcoesEntregaCupom() {
    console.log("📦 Renderizando opções de entrega e cupom...");
    
    // Usar o estado atual para determinar se mostra ou não
    const mostrarCEP = estadoAplicativo.modoEntrega === 'entrega';
    
    return `
        <div class="opcoes-carrinho">
            <div class="grupo-cupom">
                <input type="text" id="campo-cupom-carrinho" placeholder="CUPOM DE DESCONTO" class="campo-cupom">
                <button class="botao-aplicar-cupom" onclick="aplicarCupom()">APLICAR</button>
            </div>
            <div class="grupo-entrega">
                <p class="titulo-entrega">Como deseja receber seu pedido?</p>
                <div class="opcoes-entrega">
                    <label class="opcao-entrega ${estadoAplicativo.modoEntrega === 'retirada' ? 'selecionada' : ''}">
                        <input type="radio" name="modoEntrega" value="retirada" ${estadoAplicativo.modoEntrega === 'retirada' ? 'checked' : ''} onchange="alterarModoEntrega('retirada')">
                        <i class="fas fa-store"></i> <span>RETIRADA</span>
                    </label>
                    <label class="opcao-entrega ${estadoAplicativo.modoEntrega === 'entrega' ? 'selecionada' : ''}">
                        <input type="radio" name="modoEntrega" value="entrega" ${estadoAplicativo.modoEntrega === 'entrega' ? 'checked' : ''} onchange="alterarModoEntrega('entrega')">
                        <i class="fas fa-motorcycle"></i> <span>ENTREGA</span>
                    </label>
                </div>
                
                <!-- 🔥 CORREÇÃO: Removido style="display: none;" e usando variável -->
                <div id="secao-cep-carrinho" class="secao-cep-carrinho" style="${mostrarCEP ? 'display: block;' : 'display: none;'}">
                    <div class="informacao-taxa">
                        <i class="fas fa-info-circle"></i> 
                        <span>Informe seu CEP para o cálculo da taxa de entrega</span>
                    </div>
                    
                    <div class="grupo-cep-carrinho">
                        <input type="text" 
                               id="cep-carrinho" 
                               class="campo-cep-carrinho"
                               placeholder="00000-000"
                               maxlength="9"
                               value="${enderecoCliente.cep ? formatarCEP(enderecoCliente.cep) : ''}">
                        <button class="botao-calcular-frete" onclick="calcularFreteNoCarrinho()">
                            <i class="fas fa-calculator"></i> CALCULAR
                        </button>
                    </div>
                    
                    <!-- Display do frete calculado -->
                    <div id="resultado-frete-carrinho" class="resultado-frete" style="display: none;">
                        <div class="frete-info">
                            <i class="fas fa-truck"></i>
                            <div class="frete-detalhes">
                                <span class="frete-titulo">TAXA DE ENTREGA:</span>
                                <span id="valor-frete-carrinho" class="frete-valor">R$ 0,00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function testarVisibilidadeCEP() {
    console.log('=== TESTE DE VISIBILIDADE CEP ===');
    const secaoCEP = elemento('secao-cep-carrinho');
    console.log('Seção CEP encontrada:', !!secaoCEP);
    console.log('Display atual:', secaoCEP?.style.display);
    console.log('Modo entrega atual:', estadoAplicativo.modoEntrega);
    console.log('=== FIM TESTE ===');
}

function gerarHTMLBotoesAcaoCarrinho() {
    return `
        <div class="botoes-carrinho" style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
            <button class="botao-acao botao-verde-militar" onclick="prosseguirParaDadosCliente()">
                PROSSEGUIR PARA O PAGAMENTO <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="botao-acao botao-bege" onclick="fecharModal('modal-carrinho')">
                CONTINUAR COMPRANDO
            </button>
        </div>
    `;
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
    // Atualizar apenas badges, não re-renderizar tudo
    atualizarBadgesAposRemocao();
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
    
    const opcaoSelecionada = document.querySelector(`[value="${modo}"]`)?.closest('.opcao-entrega');
    if (opcaoSelecionada) {
        opcaoSelecionada.classList.add('selecionada');
    }
    
    // 🔥 CORREÇÃO: Mostrar/ocultar seção CEP no carrinho
    const secaoCEP = elemento('secao-cep-carrinho');
    if (secaoCEP) {
        secaoCEP.style.display = modo === 'entrega' ? 'block' : 'none';
        console.log(`Seção CEP ${modo === 'entrega' ? 'mostrada' : 'ocultada'}`);
    }
    
    // Mostrar/ocultar informação da taxa
    const infoTaxa = elemento('informacao-taxa-entrega');
    if (infoTaxa) {
        infoTaxa.style.display = modo === 'entrega' ? 'block' : 'none';
    }
    
    // 🔥 NOVA LINHA ADICIONADA (PASSO 4)
    // Se for entrega, inicializa o AddressManager
    if (modo === 'entrega' && window.AddressManager) {
        console.log('Inicializando AddressManager para entrega');
        window.AddressManager.init();
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

function calcularFreteNoCarrinho() {
    const campoCEP = elemento('cep-carrinho');
    if (!campoCEP) return;
    
    const cep = campoCEP.value.replace(/\D/g, '');
    if (cep.length !== 8) {
        alert('Digite um CEP válido com 8 números.');
        campoCEP.focus();
        return;
    }
    
    // Salva o CEP no endereço global
    enderecoCliente.cep = cep;
    
    // Formata o CEP no campo
    campoCEP.value = cep.substring(0,5) + '-' + cep.substring(5);
    
    calcularFretePorBairroNoCarrinho(cep);
}

function calcularFretePorBairroNoCarrinho(cep) {
    const freteCalculado = 8.00;
    
    estadoAplicativo.taxaEntrega = freteCalculado;
    estadoAplicativo.cepCalculado = cep;
    
    atualizarDisplayFreteCarrinho(freteCalculado);
    atualizarResumoFinanceiroCarrinho();
    
    mostrarNotificacao(`Frete calculado: R$ ${freteCalculado.toFixed(2)}`, 'success');
}

function atualizarDisplayFreteCarrinho(valor) {
    const resultadoDiv = elemento('resultado-frete-carrinho');
    const valorSpan = elemento('valor-frete-carrinho');
    
    if (resultadoDiv && valorSpan) {
        resultadoDiv.style.display = 'block';
        valorSpan.textContent = formatarMoeda(valor);
    }
}

// EXPORTAR FUNÇÕES
window.atualizarBarraCarrinho = atualizarBarraCarrinho;
window.abrirModalCarrinho = abrirModalCarrinho;
window.removerItemDoCarrinho = removerItemDoCarrinho;
window.aplicarCupom = aplicarCupom;
window.alterarModoEntrega = alterarModoEntrega;
window.prosseguirParaDadosCliente = prosseguirParaDadosCliente;
window.calcularFreteNoCarrinho = calcularFreteNoCarrinho;
window.calcularFretePorBairroNoCarrinho = calcularFretePorBairroNoCarrinho;