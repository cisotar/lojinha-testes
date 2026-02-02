// ============================================
// MODAL DE PRODUTO - PÃO DO CISO
// ============================================

// produto-modal.js

function configurarProduto(indiceSessao, indiceItem) {
    const produto = dadosIniciais.secoes[indiceSessao].itens[indiceItem];
    const identificador = `item-${indiceSessao}-${indiceItem}`;

    if (produto.esgotado) {
        alert('Este produto está esgotado no momento.');
        return;
    }

    // --- LÓGICA DE RECUPERAÇÃO DO CARRINHO ---
    // Verificamos se este identificador já existe no objeto global 'carrinho'
    const itemExistente = carrinho[identificador];

    if (itemExistente) {
        // Se já existe, usamos uma cópia profunda (JSON) para não alterar 
        // o carrinho diretamente antes do utilizador clicar em "Confirmar"
        produtoAtual = JSON.parse(JSON.stringify(itemExistente));
        console.log(`✅ Produto recuperado do carrinho: ${produto.nome} (Qtde: ${produtoAtual.quantidade})`);
    } else {
        // Se não existe, criamos o objeto novo com quantidade inicial 1
        produtoAtual = {
            identificador: identificador,
            indiceSessao: indiceSessao,
            indiceItem: indiceItem,
            quantidade: 0, 
            opcionais: {}
        };
        console.log(`📝 Iniciando novo produto no modal: ${produto.nome}`);
    }
    // ----------------------------------------

    renderizarModalProduto(produto);
    abrirModal('modal-produto');
}

// --- NOVAS FUNÇÕES MODULARIZADAS PARA O MODAL ---

function gerarHTMLImagemProduto(produto) {
    return `
        <div class="imagem-produto-container">
            <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto-modal">
        </div>
    `;
}

function gerarHTMLInfoProduto(produto) {
    return `
        <div class="info-produto-modal">
            <h2 class="nome-produto-modal">${produto.nome}</h2>
            <p class="descricao-produto-modal">${produto.descricao || ''}</p>
        </div>
    `;
}

function gerarHTMLControleQuantidade(produto) {
    return `
        <div class="controle-quantidade-produto">
            <div class="preco-produto">${formatarMoeda(produto.preco)}</div>
            <div class="controles-quantidade">
                <button class="botao-quantidade" onclick="alterarQuantidadeProduto(-1)">-</button>
                <span id="quantidade-produto-modal" class="quantidade-display">${produtoAtual.quantidade}</span>
                <button class="botao-quantidade" onclick="alterarQuantidadeProduto(1)">+</button>
            </div>
        </div>
    `;
}

function gerarHTMLSecaoOpcionais(produto) {
    const opcionaisParaExibir = obterOpcionaisAtivos(produto);
    if (opcionaisParaExibir.length === 0) return '';

    const listaHTML = opcionaisParaExibir.map(opcional => {
        const qtdAtual = produtoAtual.opcionais[opcional.nome] ? produtoAtual.opcionais[opcional.nome].quantidade : 0;
        const idOpcional = opcional.nome.replace(/\s+/g, '-');
        return `
            <div class="opcional-item">
                <div class="opcional-info">
                    <div class="opcional-nome">${opcional.nome}</div>
                    <div class="opcional-preco">${formatarMoeda(opcional.preco)}</div>
                </div>
                <div class="controles-opcional">
                    <button class="botao-quantidade-pequeno" onclick="alterarQuantidadeOpcional('${opcional.nome}', ${opcional.preco}, -1)">-</button>
                    <span id="quantidade-opcional-${idOpcional}" class="quantidade-opcional">${qtdAtual}</span>
                    <button class="botao-quantidade-pequeno" onclick="alterarQuantidadeOpcional('${opcional.nome}', ${opcional.preco}, 1)">+</button>
                </div>
            </div>`;
    }).join('');

    return `
        <div id="contener-opcionais-produto" class="${produtoAtual.quantidade > 0 ? 'visivel' : 'escondido'}">
            <h4 class="titulo-opcionais"><i class="fas fa-list"></i> OPCIONAIS</h4>
            <div class="lista-opcionais">${listaHTML}</div>
        </div>
    `;
}

function gerarHTMLSubtotal() {
    const subtotal = calcularSubtotalProduto();
    console.log(`💰 Renderizando Subtotal centralizado: ${formatarMoeda(subtotal)}`);
    
    return `
        <div id="container-subtotal-produto" class="container-subtotal-modal ${produtoAtual.quantidade > 0 ? 'visivel' : 'escondido'}" style="text-align: center; width: 100%; margin-top: 20px;">
            <div class="subtitulo-subtotal" style="display: block; width: 100%;">SUBTOTAL DO ITEM</div>
            <div id="valor-subtotal-produto" class="valor-subtotal" style="display: block; width: 100%; font-weight: bold;">${formatarMoeda(subtotal)}</div>
        </div>
    `;
}

// --- FUNÇÃO PRINCIPAL REESCRITA ---

function renderizarModalProduto(produto) {
    console.log('🔄 Renderizando Modal (Modularizado) para:', produto.nome);
    
    const container = elemento('corpo-modal-produto');
    if (!container) return console.error('❌ Container do modal não encontrado!');

    // Montagem do HTML usando as funções auxiliares
    container.innerHTML = `
        ${gerarHTMLImagemProduto(produto)}
        ${gerarHTMLInfoProduto(produto)}
        ${gerarHTMLControleQuantidade(produto)}
        ${gerarHTMLSecaoOpcionais(produto)}
        ${gerarHTMLSubtotal()}
    `;

    console.log('✅ Modal renderizado com sucesso.');
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
// produto-modal.js

function alterarQuantidadeProduto(valor) {
    console.log(`--- ALTERANDO QUANTIDADE PRODUTO ---`);
    const novaQuantidade = produtoAtual.quantidade + valor;

    if (novaQuantidade < 0) return;

    produtoAtual.quantidade = novaQuantidade;
    console.log(`✅ Nova quantidade definida: ${produtoAtual.quantidade}`);

    // CORREÇÃO PONTO 1: Se zerar o produto, limpa os dados e a TELA dos opcionais
    if (produtoAtual.quantidade === 0) {
        console.log('🗑️ Produto zerado. Resetando interface de opcionais.');
        
        // Limpa os dados
        produtoAtual.opcionais = {};
        
        // Limpa a interface: busca todos os spans de quantidade de opcional e bota 0
        const displaysOpcionais = document.querySelectorAll('.quantidade-opcional');
        displaysOpcionais.forEach(span => {
            span.textContent = '0';
        });
    }

    // 1. Atualiza a interface do modal (produto principal)
    const elementoQtd = elemento('quantidade-produto-modal');
    if (elementoQtd) elementoQtd.textContent = produtoAtual.quantidade;

    // 2. Atualiza visibilidade e subtotal
    verificarVisibilidadeBotoesModal();
    
    const subtotal = calcularSubtotalProduto();
    const elementoSubtotal = elemento('valor-subtotal-produto');
    if (elementoSubtotal) elementoSubtotal.textContent = formatarMoeda(subtotal);

    // 3. Sincroniza com o carrinho
    sincronizarProdutoNoCarrinho();
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
// produto-modal.js

// produto-modal.js

function verificarVisibilidadeBotoesModal() {
    const qtd = produtoAtual.quantidade;
    const containerOpcionais = document.getElementById('contener-opcionais-produto');
    const containerSubtotal = document.getElementById('container-subtotal-produto');
    
    // IDs REAIS do seu index.html
    const btnBege = document.getElementById('botao-adicionar-simples');
    const btnVerde = document.getElementById('botao-adicionar-e-ir-para-carrinho');

    console.log(`👁️ Ajustando botões do modal de produto. Qtd: ${qtd}`);

    // 1. Visibilidade de detalhes (opcionais e subtotal)
    if (qtd > 0) {
        if (containerOpcionais) containerOpcionais.classList.replace('escondido', 'visivel');
        if (containerSubtotal) containerSubtotal.classList.replace('escondido', 'visivel');
    } else {
        if (containerOpcionais) containerOpcionais.classList.replace('visivel', 'escondido');
        if (containerSubtotal) containerSubtotal.classList.replace('visivel', 'escondido');
    }

        // 3. BOTÃO BEGE (RETROCEDER): Continuar Comprando
    if (btnBege) {
        btnBege.className = 'botao-acao botao-bege';
        btnBege.innerHTML = '<i class="fas fa-arrow-left"></i> CONTINUAR COMPRANDO';
        // Ação de apenas fechar o modal
        btnBege.onclick = function() { fecharModal('modal-produto'); };
        btnBege.style.display = 'flex';
    }

    // 2. BOTÃO VERDE (AVANÇAR): Abrir Carrinho
    if (btnVerde) {
        btnVerde.className = 'botao-acao botao-verde-militar'; // Aplicando sua nova cor militar
        btnVerde.innerHTML = '<i class="fas fa-shopping-basket"></i> ABRIR CARRINHO DE COMPRAS';
        btnVerde.style.display = (qtd > 0) ? 'flex' : 'none';
    }

    // 3. BOTÃO BEGE (RETROCEDER): Continuar Comprando
    if (btnBege) {
        btnBege.className = 'botao-acao botao-bege';
        btnBege.innerHTML = '<i class="fas fa-arrow-left"></i> CONTINUAR COMPRANDO';
        // Ação de apenas fechar o modal
        btnBege.onclick = function() { fecharModal('modal-produto'); };
        btnBege.style.display = 'flex';
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
    console.log(`🔄 Sincronizando "${produtoAtual.identificador}" com o carrinho...`);

    if (produtoAtual.quantidade > 0) {
        // Adiciona ou atualiza no carrinho (cópia profunda para segurança)
        carrinho[produtoAtual.identificador] = JSON.parse(JSON.stringify(produtoAtual));
        console.log(`✅ Item atualizado no carrinho. Qtd: ${produtoAtual.quantidade}`);
    } else {
        // Se a quantidade é 0, removemos completamente do objeto carrinho
        delete carrinho[produtoAtual.identificador];
        console.log(`🗑️ Item removido do carrinho (quantidade zero).`);
    }

    // Salva no LocalStorage e atualiza os elementos visuais externos
    salvarCarrinho();
    atualizarBarraCarrinho();
    
    // Atualiza o badge no card do cardápio sem recarregar a página
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