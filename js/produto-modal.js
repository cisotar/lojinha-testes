// ============================================
// MODAL DE PRODUTO - PÃO DO CISO
// ============================================

function alterarQuantidadeProduto(valor) {
    const novaQuantidade = produtoAtual.quantidade + valor;
    
    if (novaQuantidade < 0) return; // Permite zero
    
    produtoAtual.quantidade = novaQuantidade;
    
    // Atualizar display
    const quantidadeDisplay = elemento('quantidade-produto-modal');
    if (quantidadeDisplay) {
        quantidadeDisplay.textContent = novaQuantidade;
    }
    
    // Atualizar status
    const statusAdicionado = elemento('status-adicionado-produto');
    if (statusAdicionado) {
        statusAdicionado.className = novaQuantidade > 0 ? 'visivel' : 'escondido';
    }
    
    // Atualizar container de opcionais
    const containerOpcionais = elemento('contener-opcionais-produto');
    if (containerOpcionais) {
        containerOpcionais.className = novaQuantidade > 0 ? 'visivel' : 'escondido';
    }
    
    // Atualizar container de subtotal
    const containerSubtotal = elemento('container-subtotal-produto');
    if (containerSubtotal) {
        containerSubtotal.className = novaQuantidade > 0 ? 'visivel' : 'escondido';
    }
    
    // Atualizar badge no cardápio
    atualizarBadgeQuantidade();
    
    // Verificar botões - ADICIONAR ESTA CHAMADA
    verificarVisibilidadeBotoesModal();
    
    // Recalcular subtotal
    atualizarSubtotalProduto();
}

function renderizarModalProduto(produto) {
    const container = elemento('corpo-modal-produto');
    if (!container) return;

    // Determinar opcionais ativos
    const opcionaisParaExibir = obterOpcionaisAtivos(produto);
    
    // Renderizar HTML corrigido
    container.innerHTML = `
        <!-- Status de Adicionado -->
        <div id="status-adicionado-produto" class="${produtoAtual.quantidade > 0 ? 'visivel' : 'escondido'}">
            <i class="fas fa-check-circle"></i> Item adicionado ao carrinho
        </div>
        
        <!-- Imagem do Produto (tamanho corrigido) -->
        <div class="imagem-produto-container">
            <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto-modal">
        </div>

        <!-- Informações do Produto -->
        <div class="info-produto-modal">
            <h2 class="nome-produto-modal">${produto.nome}</h2>
            <p class="descricao-produto-modal">${produto.descricao || ''}</p>
        </div>

        <!-- Controle de Quantidade -->
        <div class="controle-quantidade-produto">
            <div class="preco-produto">${formatarMoeda(produto.preco)}</div>
            <div class="controles-quantidade">
                <button class="botao-quantidade" onclick="alterarQuantidadeProduto(-1)">-</button>
                <span id="quantidade-produto-modal" class="quantidade-display">${produtoAtual.quantidade}</span>
                <button class="botao-quantidade" onclick="alterarQuantidadeProduto(1)">+</button>
            </div>
        </div>

        <!-- Opcionais (se houver) -->
        ${opcionaisParaExibir.length > 0 ? `
        <div id="contener-opcionais-produto" class="${produtoAtual.quantidade > 0 ? 'visivel' : 'escondido'}">
            <h4 class="titulo-opcionais"><i class="fas fa-list"></i> OPCIONAIS</h4>
            <div class="lista-opcionais">
                ${opcionaisParaExibir.map(opcional => `
                <div class="opcional-item">
                    <div class="opcional-info">
                        <div class="opcional-nome">${opcional.nome}</div>
                        <div class="opcional-preco">${formatarMoeda(opcional.preco)}</div>
                    </div>
                    <div class="controles-opcional">
                        <button class="botao-quantidade-pequeno" onclick="alterarQuantidadeOpcional('${opcional.nome}', ${opcional.preco}, -1)">-</button>
                        <span id="quantidade-opcional-${opcional.nome.replace(/\s+/g, '-')}" class="quantidade-opcional">
                            ${produtoAtual.opcionais[opcional.nome] ? produtoAtual.opcionais[opcional.nome].quantidade : 0}
                        </span>
                        <button class="botao-quantidade-pequeno" onclick="alterarQuantidadeOpcional('${opcional.nome}', ${opcional.preco}, 1)">+</button>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Subtotal -->
        <div id="container-subtotal-produto" class="${produtoAtual.quantidade > 0 ? 'visivel' : 'escondido'}">
            <div class="subtitulo-subtotal">SUBTOTAL DO ITEM</div>
            <div id="valor-subtotal-produto" class="valor-subtotal">${formatarMoeda(calcularSubtotalProduto())}</div>
        </div>
    `;

    // Atualizar visibilidade dos botões
    verificarVisibilidadeBotoesModal();
}

function obterOpcionaisAtivos(produto) {
    const opcionaisParaExibir = [];
    
    if (produto.opcionais_ativos && produto.opcionais_ativos.length > 0) {
        produto.opcionais_ativos.forEach(nomeOpcional => {
            for (let categoria in dadosIniciais.opcionais) {
                const opcionalEncontrado = dadosIniciais.opcionais[categoria].find(o => o.nome === nomeOpcional);
                if (opcionalEncontrado) {
                    opcionaisParaExibir.push(opcionalEncontrado);
                    break;
                }
            }
        });
    } else if (produto.opcionais && dadosIniciais.opcionais[produto.opcionais]) {
        opcionaisParaExibir.push(...dadosIniciais.opcionais[produto.opcionais]);
    }
    
    return opcionaisParaExibir;
}

// ===================== CONTROLE DE QUANTIDADE DO PRODUTO =====================
function alterarQuantidadeProduto(valor) {
    const novaQuantidade = produtoAtual.quantidade + valor;
    
    if (novaQuantidade < 0) return;
    
    produtoAtual.quantidade = novaQuantidade;
    
    // Atualizar display
    const quantidadeDisplay = elemento('quantidade-produto-modal');
    if (quantidadeDisplay) {
        quantidadeDisplay.textContent = novaQuantidade;
    }
    
    // Atualizar status
    const statusAdicionado = elemento('status-adicionado-produto');
    if (statusAdicionado) {
        statusAdicionado.className = novaQuantidade > 0 ? 'visivel' : 'escondido';
    }
    
    // Atualizar container de opcionais
    const containerOpcionais = elemento('contener-opcionais-produto');
    if (containerOpcionais) {
        containerOpcionais.className = novaQuantidade > 0 ? 'visivel' : 'escondido';
    }
    
    // Atualizar container de subtotal
    const containerSubtotal = elemento('container-subtotal-produto');
    if (containerSubtotal) {
        containerSubtotal.className = novaQuantidade > 0 ? 'visivel' : 'escondido';
    }
    
    // Atualizar badge no cardápio
    atualizarBadgeQuantidade();
    
    // Verificar botões
    verificarVisibilidadeBotoesModal();
    
    // Recalcular subtotal
    atualizarSubtotalProduto();
}

function atualizarBadgeQuantidade() {
    const badge = document.querySelector(
        `[onclick="configurarProduto(${produtoAtual.indiceSessao}, ${produtoAtual.indiceItem})"] .badge-quantidade`
    );
    
    if (badge) {
        if (produtoAtual.quantidade > 0) {
            badge.textContent = produtoAtual.quantidade;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function calcularSubtotalProduto() {
    const produto = dadosIniciais.secoes[produtoAtual.indiceSessao].itens[produtoAtual.indiceItem];
    let subtotal = produto.preco * produtoAtual.quantidade;
    
    // Adicionar opcionais
    for (let nomeOpcional in produtoAtual.opcionais) {
        const opcional = produtoAtual.opcionais[nomeOpcional];
        subtotal += opcional.quantidade * opcional.preco;
    }
    
    return subtotal;
}

function atualizarSubtotalProduto() {
    const elementoSubtotal = elemento('valor-subtotal-produto');
    if (elementoSubtotal) {
        elementoSubtotal.textContent = formatarMoeda(calcularSubtotalProduto());
    }
}

// ===================== CONTROLE DE BOTÕES DO MODAL =====================
function verificarVisibilidadeBotoesModal() {
    const botaoAdicionarSimples = elemento('botao-adicionar-simples');
    const botaoAdicionarIrCarrinho = elemento('botao-adicionar-e-ir-para-carrinho');
    
    if (!botaoAdicionarSimples || !botaoAdicionarIrCarrinho) return;
    
    // NOVA LÓGICA: 
    // - Se quantidade > 0: MOSTRA 2 BOTÕES
    // - Se quantidade = 0: MOSTRA 1 BOTÃO (desabilitado)
    
    if (produtoAtual.quantidade > 0) {
        // MOSTRA OS 2 BOTÕES
        botaoAdicionarSimples.style.display = 'block';
        botaoAdicionarIrCarrinho.style.display = 'block';
        
        // Texto do primeiro botão
        botaoAdicionarSimples.innerHTML = '<i class="fas fa-plus"></i> ADICIONAR MAIS';
        
        // Habilita ambos
        botaoAdicionarSimples.disabled = false;
        botaoAdicionarIrCarrinho.disabled = false;
    } else {
        // MOSTRA APENAS 1 BOTÃO (desabilitado)
        botaoAdicionarSimples.style.display = 'block';
        botaoAdicionarIrCarrinho.style.display = 'none';
        
        // Texto do botão único
        botaoAdicionarSimples.innerHTML = '<i class="fas fa-plus"></i> ADICIONAR AO CARRINHO';
        
        // Desabilita até escolher quantidade
        botaoAdicionarSimples.disabled = true;
    }
}

function adicionarItemAoCarrinho() {
    if (produtoAtual.quantidade === 0) {
        alert('Adicione pelo menos 1 item antes de continuar.');
        return;
    }
    
    sincronizarProdutoNoCarrinho();
    fecharModal('modal-produto');
    
    // Feedback visual
    mostrarNotificacao('Item adicionado ao carrinho!');
    
    // Atualizar botões
    verificarVisibilidadeBotoesModal();
}

function adicionarEIrParaCarrinho() {
    sincronizarProdutoNoCarrinho();
    fecharModal('modal-produto');
    abrirModalCarrinho();
}

function sincronizarProdutoNoCarrinho() {
    if (produtoAtual.quantidade > 0) {
        carrinho[produtoAtual.identificador] = { ...produtoAtual };
    } else {
        delete carrinho[produtoAtual.identificador];
    }
    
    salvarCarrinho();
    atualizarBarraCarrinho();
}   

// EXPORTAR FUNÇÕES PARA O ESCOPO GLOBAL
window.configurarProduto = configurarProduto;
window.alterarQuantidadeProduto = alterarQuantidadeProduto;
window.alterarQuantidadeOpcional = alterarQuantidadeOpcional;
window.adicionarItemAoCarrinho = adicionarItemAoCarrinho;
window.adicionarEIrParaCarrinho = adicionarEIrParaCarrinho;
window.obterOpcionaisAtivos = obterOpcionaisAtivos;