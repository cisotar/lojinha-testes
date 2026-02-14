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
    const mostrarCEP = estadoAplicativo.modoEntrega === 'entrega';
    const cepValue = estadoAplicativo.cepCalculado ? 
        estadoAplicativo.cepCalculado.substring(0,5) + '-' + estadoAplicativo.cepCalculado.substring(5) : '';
    
    return `
        <div class="opcoes-carrinho">
            <div class="grupo-cupom" style="display: flex; gap: 8px; width: 100%; box-sizing: border-box; margin-bottom: 20px;">
                <input type="text" 
                       id="campo-cupom-carrinho" 
                       placeholder="CUPOM DE DESCONTO" 
                       class="campo-cupom" 
                       style="flex: 1; min-width: 0; margin-bottom: 0; height: 45px; border: 1px solid #ccc; border-radius: 8px; padding: 0 12px;">
                
                <button class="botao-aplicar-cupom" 
                        onclick="aplicarCupom()" 
                        style="flex: 0 0 auto; width: auto; white-space: nowrap; padding: 0 20px; height: 45px; background-color: var(--marrom-cafe); color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer;">
                    APLICAR
                </button>
            </div>

            <div class="grupo-entrega">
                <p class="titulo-entrega" style="font-weight: bold; margin-bottom: 15px;">Como deseja receber seu pedido?</p>
                <div class="opcoes-entrega" style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <label class="opcao-entrega ${estadoAplicativo.modoEntrega === 'retirada' ? 'selecionada' : ''}" style="flex: 1;">
                        <input type="radio" name="modoEntrega" value="retirada" 
                               ${estadoAplicativo.modoEntrega === 'retirada' ? 'checked' : ''} 
                               onchange="alterarModoEntrega('retirada')">
                        <i class="fas fa-store"></i> <span>RETIRADA</span>
                    </label>
                    <label class="opcao-entrega ${estadoAplicativo.modoEntrega === 'entrega' ? 'selecionada' : ''}" style="flex: 1;">
                        <input type="radio" name="modoEntrega" value="entrega" 
                               ${estadoAplicativo.modoEntrega === 'entrega' ? 'checked' : ''} 
                               onchange="alterarModoEntrega('entrega')">
                        <i class="fas fa-motorcycle"></i> <span>ENTREGA</span>
                    </label>
                </div>
                
                <div id="secao-cep-carrinho" class="secao-cep-carrinho" style="${mostrarCEP ? 'display: block;' : 'display: none;'}">
                    <div class="informacao-taxa" style="margin-bottom: 10px; font-size: 12px; color: #666;">
                        <i class="fas fa-info-circle"></i> <span>Informe seu CEP para o cálculo da taxa</span>
                    </div>                   

                    <div style="display: flex !important; gap: 8px !important; width: 100% !important; box-sizing: border-box !important; margin-bottom: 20px;">
                        <input type="text" 
                            id="cep-carrinho" 
                            placeholder="DIGITE SEU CEP"
                            maxlength="9"
                            value="${cepValue}"
                            style="flex: 1 !important; min-width: 0 !important; height: 45px !important; border: 1px solid #ccc !important; border-radius: 8px !important; padding: 0 12px !important; font-size: 14px !important; margin: 0 !important; box-sizing: border-box !important;"
                            oninput="estadoAplicativo.cepCalculado = this.value.replace(/\\D/g, '')">

                        <button type="button"
                                onclick="const cepVal = document.getElementById('cep-carrinho').value; if(cepVal.length >= 8) { window.buscarEnderecoPorCodigoPostal(cepVal); } else { alert('Digite um CEP válido'); }" 
                                style="flex: 0 0 auto !important; width: auto !important; white-space: nowrap !important; padding: 0 20px !important; height: 45px !important; background-color: #332616 !important; color: white !important; border: none !important; border-radius: 8px !important; font-weight: bold !important; font-size: 13px !important; cursor: pointer !important; margin: 0 !important;">
                            APLICAR
                        </button>
                    </div>

                    <div id="notificacao-bairro-carrinho" style="display: none; font-size: 13px; color: #5d4037; font-weight: bold; margin-top: 10px;">
                        <i class="fas fa-map-marker-alt"></i> <span id="nome-bairro-info"></span>
                    </div>
                    
                    <div id="resultado-frete-carrinho" style="display: none; margin-top: 10px; padding: 5px 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #666;">
                            <span style="display: flex; align-items: center; gap: 5px;">
                                <i class="fas fa-truck"></i> Taxa de entrega:
                            </span>
                            <span id="valor-frete-carrinho" style="font-weight: bold; color: var(--verde-militar);">R$ 0,00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
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
    
    // 1. Calcular o subtotal atualizado (Produtos + Opcionais)
    Object.values(carrinho).forEach(item => {
        const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
        let subtotalItem = produto.preco * item.quantidade;
        
        if (item.opcionais) {
            Object.values(item.opcionais).forEach(opcional => {
                subtotalItem += opcional.quantidade * opcional.preco;
            });
        }
        totalProdutos += subtotalItem;
    });

    // 2. Recalcular o valor do desconto
    if (estadoAplicativo.cupomAplicado) {
        const dadosCupom = dadosIniciais.cupons.find(c => 
            c.codigo.toUpperCase() === estadoAplicativo.cupomAplicado.toUpperCase()
        );
        if (dadosCupom) {
            estadoAplicativo.descontoCupom = dadosCupom.tipo === 'porcentagem' 
                ? totalProdutos * (dadosCupom.valor / 100) 
                : dadosCupom.valor;
        }
    }

    // 3. Preparar valores finais
    let desconto = estadoAplicativo.descontoCupom || 0;
    let taxaEntrega = estadoAplicativo.modoEntrega === 'entrega' ? (estadoAplicativo.taxaEntrega || 0) : 0;
    let totalGeral = (totalProdutos - desconto) + taxaEntrega;
    estadoAplicativo.totalGeral = totalGeral;

    // 4. Renderizar o Layout Idêntico ao Modal de Pagamento
    container.innerHTML = `
        <div class="resumo-carrinho-container" style="margin-top: 20px; margin-bottom: 25px; border: 1px solid var(--borda-nav); border-radius: 12px; background-color: var(--branco); overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
            <div style="background-color: var(--bege-claro); padding: 10px 15px; border-bottom: 1px solid var(--borda-nav);">
                <span style="font-size: 13px; color: var(--marrom-cafe); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Resumo do Pedido</span>
            </div>
            <div style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 14px; color: var(--cinza-escuro);">Produtos</span>
                    <span style="font-size: 14px; font-weight: 500;">${formatarMoeda(totalProdutos)}</span>
                </div>
                
                ${desconto > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 14px; color: var(--red);">🏷️ Desconto</span>
                    <span style="font-size: 14px; color: var(--red); font-weight: bold;">- ${formatarMoeda(desconto)}</span>
                </div>` : ''}
                
                ${estadoAplicativo.modoEntrega === 'entrega' ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 14px; color: var(--cinza-escuro);">🚚 Taxa de Entrega</span>
                    <span style="font-size: 14px; font-weight: 500;">${taxaEntrega > 0 ? formatarMoeda(taxaEntrega) : 'Grátis'}</span>
                </div>` : ''}
                
                <div style="border-top: 1px dashed var(--borda-nav); margin: 12px 0;"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 16px; font-weight: bold; color: var(--verde-militar);">TOTAL GERAL</span>
                    <span style="font-size: 20px; font-weight: 800; color: var(--verde-militar);">${formatarMoeda(totalGeral)}</span>
                </div>
            </div>
        </div>
    `;

    // 5. Atualiza a barra flutuante
    const totalElementoBarra = elemento('resumo-total-carrinho');
    if (totalElementoBarra) totalElementoBarra.textContent = formatarMoeda(totalGeral);
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

    // --- CORREÇÃO: Calcular subtotal real (Produtos + Opcionais) ---
    let subtotalParaDesconto = 0;
    Object.values(carrinho).forEach(item => {
        const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
        let valorItem = produto.preco * item.quantidade;
        
        // Incluir opcionais no cálculo do desconto
        if (item.opcionais) {
            Object.values(item.opcionais).forEach(opcional => {
                valorItem += opcional.quantidade * opcional.preco;
            });
        }
        subtotalParaDesconto += valorItem;
    });

    let desconto = 0;
    if (cupomValido.tipo === 'porcentagem') {
        desconto = subtotalParaDesconto * (cupomValido.valor / 100);
    } else if (cupomValido.tipo === 'fixo') {
        desconto = cupomValido.valor;
    }

    // Salvar no estado global
    estadoAplicativo.cupomAplicado = codigoCupom;
    estadoAplicativo.descontoCupom = desconto;

    // Atualiza as telas
    atualizarResumoFinanceiroCarrinho();
    if (typeof atualizarResumoPagamentoFinal === 'function') {
        atualizarResumoPagamentoFinal();
    }
    
    mostrarNotificacao(`Cupom ${codigoCupom} aplicado com sucesso!`);
}

function alterarModoEntrega(modo) {
    console.log(`[CEP] Alterando modo entrega para: ${modo}`);
    
    estadoAplicativo.modoEntrega = modo;
    
    // Limpar dados de CEP quando mudar para retirada
    if (modo === 'retirada') {
        estadoAplicativo.cepCalculado = null;
        estadoAplicativo.taxaEntrega = 0;
        
        const campoCEP = elemento('cep-carrinho');
        if (campoCEP) campoCEP.value = '';
        
        const resultadoFrete = elemento('resultado-frete-carrinho');
        if (resultadoFrete) resultadoFrete.style.display = 'none';
    }
    
    // Atualizar classes visuais das opções
    document.querySelectorAll('.opcao-entrega').forEach(opcao => {
        opcao.classList.remove('selecionada');
    });
    
    const opcaoSelecionada = document.querySelector(`[value="${modo}"]`)?.closest('.opcao-entrega');
    if (opcaoSelecionada) opcaoSelecionada.classList.add('selecionada');
    
    // Mostrar/ocultar seção CEP no carrinho
    const secaoCEP = elemento('secao-cep-carrinho');
    if (secaoCEP) {
        secaoCEP.style.display = modo === 'entrega' ? 'block' : 'none';
        
        if (modo === 'entrega' && estadoAplicativo.cepCalculado) {
            const campoCEP = elemento('cep-carrinho');
            if (campoCEP && !campoCEP.value) {
                campoCEP.value = estadoAplicativo.cepCalculado.substring(0,5) + '-' + estadoAplicativo.cepCalculado.substring(5);
            }
            
            if (estadoAplicativo.taxaEntrega > 0) {
                const resultadoFrete = elemento('resultado-frete-carrinho');
                if (resultadoFrete) resultadoFrete.style.display = 'block';
            }
        }
    }
    
    // Inicializar AddressManager se for entrega
    if (modo === 'entrega' && window.AddressManager) {
        setTimeout(() => {
            if (window.AddressManager.init) {
                window.AddressManager.init();
            }
        }, 300);
    }
    
    atualizarResumoFinanceiroCarrinho();
}

function prosseguirParaDadosCliente() {
    console.log('[CEP] Prosseguindo para dados do cliente...');
    
    if (Object.keys(carrinho).length === 0) {
        alert('Adicione itens ao carrinho antes de prosseguir.');
        return;
    }

    fecharModal('modal-carrinho');
    
    // 🔥 CORREÇÃO PRINCIPAL: Sincronizar CEP do carrinho para o modal de dados
    if (estadoAplicativo.modoEntrega === 'entrega' && estadoAplicativo.cepCalculado) {
        console.log(`[CEP] Transferindo CEP ${estadoAplicativo.cepCalculado} para modal de dados`);
        
        // Abrir modal primeiro
        setTimeout(() => {
            abrirModal('modal-dados-cliente');
            
            // Pequeno delay para garantir que o DOM do modal está pronto
            setTimeout(() => {
                if (window.AddressManager && window.AddressManager.sincronizarCEPComModalDados) {
                    console.log('[CEP] Chamando sincronização...');
                    window.AddressManager.sincronizarCEPComModalDados(estadoAplicativo.cepCalculado);
                }
            }, 300);
        }, 100);
    } else {
        abrirModal('modal-dados-cliente');
    }
    
    // Mostrar/ocultar seção de endereço baseado no modo
    setTimeout(() => {
        const secaoEndereco = elemento('secao-endereco');
        if (secaoEndereco) {
            secaoEndereco.style.display = estadoAplicativo.modoEntrega === 'retirada' ? 'none' : 'block';
        }
    }, 400);
}

function atualizarDisplayFreteCarrinho(valor) {
    const resultadoDiv = elemento('resultado-frete-carrinho');
    const valorSpan = elemento('valor-frete-carrinho');
    
    if (resultadoDiv && valorSpan) {
        valorSpan.textContent = formatarMoeda(valor);
        resultadoDiv.style.display = 'block';
    }
    
    // Salvar a taxa no estado
    estadoAplicativo.taxaEntrega = valor;
    console.log(`[CEP] Taxa salva: R$ ${valor.toFixed(2)}`);
    
    atualizarResumoFinanceiroCarrinho();
}

// ============================================
// RECUPERAÇÃO DE CARRINHO - PÃO DO CISO
// ============================================

// ===================== VERIFICAR CARRINHO RECUPERADO =====================
function verificarCarrinhoRecuperado() {
    console.log('🔍 Verificando carrinho salvo...');
    
    // 1. Contar itens no carrinho atual
    const itensCarrinho = Object.keys(window.carrinho).length;
    console.log(`   Itens encontrados: ${itensCarrinho}`);
    
    // 2. Verificar se já mostramos o modal nesta sessão
    const modalJaMostrado = sessionStorage.getItem('modalCarrinhoMostrado');
    console.log(`   Modal já mostrado? ${modalJaMostrado}`);
    
    // 3. Mostrar modal apenas se tiver itens E não tiver mostrado ainda
    if (itensCarrinho > 0 && !modalJaMostrado) {
        console.log(`🛒 ${itensCarrinho} itens no carrinho. Mostrando opções...`);
        
        // Atualizar número no modal
        const elementoQuantidade = elemento('quantidade-itens-recuperados');
        if (elementoQuantidade) {
            elementoQuantidade.textContent = itensCarrinho;
            console.log(`   Contador atualizado: ${itensCarrinho} itens`);
        }
        
        // Mostrar modal depois de 2 segundos (tempo para página carregar)
        setTimeout(() => {
            abrirModal('modal-recuperar-carrinho');
            console.log('✅ Modal de continuação exibido');
        }, 2000);
        
        // Marcar como mostrado (não mostrar de novo nesta sessão)
        sessionStorage.setItem('modalCarrinhoMostrado', 'true');
        console.log('   Modal marcado como "mostrado" para esta sessão');
    } else {
        console.log('✅ Nenhuma ação necessária para carrinho recuperado.');
    }
}

// ===================== LIMPAR CARRINHO RECUPERADO =====================
function limparCarrinhoRecuperado() {
    console.log('🗑️ Cliente escolheu limpar carrinho.');
    
    // 1. Limpar dados do carrinho
    window.carrinho = {};
    console.log('   Carrinho limpo na memória');
    
    // 2. Salvar no localStorage
    if (typeof salvarCarrinho === 'function') {
        salvarCarrinho();
        console.log('   Carrinho salvo no localStorage (vazio)');
    }
    
    // 3. Limpar badges visuais
    const todosBadges = document.querySelectorAll('.badge-quantidade');
    console.log(`   Removendo ${todosBadges.length} badges visuais`);
    todosBadges.forEach(badge => badge.remove());
    
    // 4. Atualizar barra do carrinho (vai sumir automaticamente)
    if (typeof atualizarBarraCarrinho === 'function') {
        atualizarBarraCarrinho();
        console.log('   Barra do carrinho atualizada');
    }
    
    // 5. Fechar modal
    fecharModal('modal-recuperar-carrinho');
    console.log('   Modal fechado');
    
    // 6. Feedback para o usuário
    if (typeof mostrarNotificacao === 'function') {
        mostrarNotificacao('🛒 Carrinho limpo! Você pode começar uma nova compra.');
        console.log('   Notificação exibida');
    }
}

// ===================== INICIALIZAR VERIFICAÇÃO =====================
// A função será chamada após tudo carregar
function inicializarRecuperacaoCarrinho() {
    console.log('🔄 Inicializando sistema de recuperação de carrinho...');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        verificarCarrinhoRecuperado();
    }, 2000);
}

function calcularTotalFinal() {
    // 1. Soma dos itens (subtotal bruto)
    let subtotalItens = 0;
    Object.values(carrinho).forEach(item => {
        const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
        let precoBase = produto.preco * item.quantidade;
        
        for (let nomeOpcional in item.opcionais) {
            const opcional = item.opcionais[nomeOpcional];
            precoBase += opcional.quantidade * opcional.preco;
        }
        subtotalItens += precoBase;
    });

    // 2. Recupera o desconto do estado global (conforme definido no seu envio.js)
    const valorDesconto = estadoAplicativo.descontoCupom || 0;

    // 3. Recupera a taxa de entrega (Busca direto na fonte mestre do cep-frete.js)
    const taxaEntrega = typeof window.obterTaxaEntregaAtual === 'function' 
        ? window.obterTaxaEntregaAtual() 
        : (estadoAplicativo.taxaEntrega || 0);

    // 4. Cálculo final
    const totalGeral = Math.max(0, subtotalItens - valorDesconto) + taxaEntrega;

    return {
        itens: subtotalItens,
        desconto: valorDesconto,
        taxa: taxaEntrega,
        total: totalGeral
    };
}

function atualizarResumoPagamentoFinal() {
    const container = elemento('resumo-final-pedido-pagamento');
    if (!container) return;

    // 1. Calcular valores exatos do carrinho atual (Produtos + Opcionais)
    let totalProdutos = 0;
    Object.values(carrinho).forEach(item => {
        const produto = dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
        let subtotalItem = produto.preco * item.quantidade;
        if (item.opcionais) {
            Object.values(item.opcionais).forEach(opcional => {
                subtotalItem += opcional.quantidade * opcional.preco;
            });
        }
        totalProdutos += subtotalItem;
    });

    // 2. Obter desconto e taxa do estado global
    let desconto = estadoAplicativo.descontoCupom || 0;
    let taxaEntrega = estadoAplicativo.modoEntrega === 'entrega' ? (estadoAplicativo.taxaEntrega || 0) : 0;
    let totalGeral = (totalProdutos - desconto) + taxaEntrega;

    // 3. Renderizar o Layout IDENTICO ao do Carrinho
    container.innerHTML = `
        <div class="resumo-carrinho-container" style="margin-top: 20px; margin-bottom: 40px; border: 1px solid var(--borda-nav); border-radius: 12px; background-color: var(--branco); overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
            
            <div style="background-color: var(--bege-claro); padding: 10px 15px; border-bottom: 1px solid var(--borda-nav);">
                <span style="font-size: 13px; color: var(--marrom-cafe); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Resumo do Pedido</span>
            </div>

            <div style="padding: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 14px; color: var(--cinza-escuro);">Produtos</span>
                    <span style="font-size: 14px; font-weight: 500;">${formatarMoeda(totalProdutos)}</span>
                </div>

                <div style="display: ${desconto > 0 ? 'flex' : 'none'}; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 14px; color: var(--red);">🏷️ Desconto</span>
                    <span style="font-size: 14px; color: var(--red); font-weight: bold;">- ${formatarMoeda(desconto)}</span>
                </div>

                <div style="display: ${estadoAplicativo.modoEntrega === 'entrega' ? 'flex' : 'none'}; justify-content: space-between; margin-bottom: 10px;">
                    <span style="font-size: 14px; color: var(--cinza-escuro);">🚚 Taxa de Entrega</span>
                    <span style="font-size: 14px; font-weight: 500;">${taxaEntrega > 0 ? formatarMoeda(taxaEntrega) : 'Calculando...'}</span>
                </div>

                <div style="border-top: 1px dashed var(--borda-nav); margin: 12px 0;"></div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 16px; font-weight: bold; color: var(--verde-militar);">TOTAL GERAL</span>
                    <span style="font-size: 20px; font-weight: 800; color: var(--verde-militar);">
                        ${formatarMoeda(totalGeral)}
                    </span>
                </div>
            </div>
        </div>
    `;

    // 4. Sincronizar o valor do PIX (se o elemento existir)
    const valorPixElemento = elemento('valor-pix');
    if (valorPixElemento) {
        valorPixElemento.textContent = formatarMoeda(totalGeral);
    }
}

// Não esqueça de adicionar esta exportação ao final do arquivo:
window.atualizarResumoPagamentoFinal = atualizarResumoPagamentoFinal;

// ===================== EXPORTAR FUNÇÕES (FIM DO ARQUIVO) =====================

// Funções principais do carrinho
window.atualizarBarraCarrinho = atualizarBarraCarrinho;
window.abrirModalCarrinho = abrirModalCarrinho;
window.removerItemDoCarrinho = removerItemDoCarrinho;
window.sincronizarProdutoNoCarrinho = sincronizarProdutoNoCarrinho; // Importante estar aqui

// Funções de lógica financeira e entrega
window.aplicarCupom = aplicarCupom;
window.alterarModoEntrega = alterarModoEntrega;
window.prosseguirParaDadosCliente = prosseguirParaDadosCliente;
window.calcularTotalFinal = calcularTotalFinal; // A que acabamos de criar

console.log('✅ carrinho.js: Funções exportadas com sucesso');