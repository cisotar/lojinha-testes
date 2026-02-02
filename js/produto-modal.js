// ============================================
// MODAL DE PRODUTO - PÃO DO CISO
// ============================================

function configurarProduto(indiceSessao, indiceItem) {
    const produto = dadosIniciais.secoes[indiceSessao].itens[indiceItem];
    const identificador = `item-${indiceSessao}-${indiceItem}`;

    if (produto.esgotado) {
        alert('Este produto está esgotado no momento.');
        return;
    }

    // Configurar produto atual
    produtoAtual = {
        identificador: identificador,
        indiceSessao: indiceSessao,
        indiceItem: indiceItem,
        quantidade: 0, // MUDAR DE 1 PARA 0
        opcionais: {}
    };

    renderizarModalProduto(produto);
    abrirModal('modal-produto');
}

function renderizarModalProduto(produto) {
    console.log('🔄 renderizarModalProduto chamado para:', produto.nome);
    
    const container = elemento('corpo-modal-produto');
    if (!container) {
        console.error('❌ Container do modal não encontrado!');
        return;
    }

    // Determinar opcionais ativos
    const opcionaisParaExibir = obterOpcionaisAtivos(produto);
    
    // Renderizar HTML corrigido
    container.innerHTML = `
        <!-- Status de Adicionado -->
        <!-- <div id="status-adicionado-produto" class="${produtoAtual.quantidade > 0 ? 'visivel' : 'escondido'}">
            <i class="fas fa-check-circle"></i> Item adicionado ao carrinho
        </div> -->
        
        <!-- Imagem do Produto com Badge -->
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

    console.log('✅ Modal renderizado. Verificando elementos...');
    console.log('Número de containers de imagem:', container.querySelectorAll('.imagem-produto-container').length);
    console.log('Número de imagens:', container.querySelectorAll('.imagem-produto-modal').length);
    console.log('Número de badges:', container.querySelectorAll('.badge-quantidade').length);

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
    
    // PERMITE 0, MAS NÃO NEGATIVO
    if (novaQuantidade < 0) return;
    
    produtoAtual.quantidade = novaQuantidade;
    
    // Atualizar display
    const quantidadeDisplay = elemento('quantidade-produto-modal');
    if (quantidadeDisplay) {
        quantidadeDisplay.textContent = novaQuantidade;
    }

    // ✅ ETAPA 1.2: ATUALIZAR BADGE SOBRE A IMAGEM
    const badgeImagem = elemento('badge-quantidade-modal');
    if (badgeImagem) {
        if (novaQuantidade > 0) {
            badgeImagem.textContent = novaQuantidade;
            badgeImagem.style.display = 'flex';
        } else {
            badgeImagem.style.display = 'none';
        }
    }
    
    // ✅ SE QUANTIDADE FOR 0, LIMPAR OPCIONAIS
    if (novaQuantidade === 0) {
        produtoAtual.opcionais = {};
        
        // Zerar contadores visuais dos opcionais
        const contadoresOpcionais = document.querySelectorAll('.quantidade-opcional');
        contadoresOpcionais.forEach(contador => {
            contador.textContent = '0';
        });
    }
    
    // ✅ ATUALIZAR VISIBILIDADE BASEADA NA QUANTIDADE
    const statusAdicionado = elemento('status-adicionado-produto');
    const containerOpcionais = elemento('contener-opcionais-produto');
    const containerSubtotal = elemento('container-subtotal-produto');
    
    if (novaQuantidade > 0) {
        // Mostrar tudo
        if (statusAdicionado) statusAdicionado.classList.remove('escondido');
        if (containerOpcionais) containerOpcionais.classList.remove('escondido');
        if (containerSubtotal) containerSubtotal.classList.remove('escondido');
    } else {
        // Esconder tudo
        if (statusAdicionado) statusAdicionado.classList.add('escondido');
        if (containerOpcionais) containerOpcionais.classList.add('escondido');
        if (containerSubtotal) containerSubtotal.classList.add('escondido');
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
    
    // Lógica corrigida:
    // Botão "Ver Carrinho" aparece quando:
    // 1. Quantidade do produto atual for maior que 0
    // 2. E já houver algo no carrinho global
    
    const temItensNoCarrinho = Object.keys(carrinho).length > 0;
    const mostrarBotaoIrCarrinho = produtoAtual.quantidade > 0 && temItensNoCarrinho;
    
    if (mostrarBotaoIrCarrinho) {
        botaoAdicionarIrCarrinho.style.display = 'block';
        botaoAdicionarSimples.innerHTML = '<i class="fas fa-plus"></i> ADICIONAR MAIS';
    } else {
        botaoAdicionarIrCarrinho.style.display = 'none';
        botaoAdicionarSimples.innerHTML = '<i class="fas fa-plus"></i> ADICIONAR AO CARRINHO';
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
    
    // ATUALIZAR BADGE NO CARD TAMBÉM
    if (typeof atualizarBadgeNoCard === 'function') {
        atualizarBadgeNoCard(produtoAtual.indiceSessao, produtoAtual.indiceItem);
    }
}

function removerItemDoCarrinho(identificador) {
    delete carrinho[identificador];
    salvarCarrinho();
    renderizarCarrinho();
    atualizarBarraCarrinho();
    // Atualizar apenas badges, não re-renderizar tudo
    if (typeof atualizarBadgesAposRemocao === 'function') {
        atualizarBadgesAposRemocao();
    }
}

// EXPORTAR FUNÇÕES
window.configurarProduto = configurarProduto;
window.alterarQuantidadeProduto = alterarQuantidadeProduto;
window.adicionarItemAoCarrinho = adicionarItemAoCarrinho;
window.adicionarEIrParaCarrinho = adicionarEIrParaCarrinho;
window.obterOpcionaisAtivos = obterOpcionaisAtivos;
window.removerItemDoCarrinho = removerItemDoCarrinho;