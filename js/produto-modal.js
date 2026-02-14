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
    
    if (opcionaisParaExibir.length === 0 || produtoAtual.quantidade <= 0) {
        return '';
    }

    const itensHTML = opcionaisParaExibir.map(opcional => {
        const qtdAtual = produtoAtual.opcionais[opcional.nome] ? produtoAtual.opcionais[opcional.nome].quantidade : 0;
        const idOpcional = opcional.nome.replace(/\s+/g, '-');
        
        return `
            <div class="opcional-item-moldura">
                <div class="opcional-texto-lado-a-lado">
                    <span class="opcional-nome">${opcional.nome}</span>
                    <span class="opcional-preco">${formatarMoeda(opcional.preco)}</span>
                </div>
                <div class="controles-opcional">
                    <button class="botao-quantidade-pequeno" onclick="alterarQuantidadeOpcional('${opcional.nome}', ${opcional.preco}, -1)">-</button>
                    <span id="quantidade-opcional-${idOpcional}" class="quantidade-opcional">${qtdAtual}</span>
                    <button class="botao-quantidade-pequeno" onclick="alterarQuantidadeOpcional('${opcional.nome}', ${opcional.preco}, 1)">+</button>
                </div>
            </div>`;
    }).join('');

    return `
        <div id="contener-opcionais-produto" class="visivel">
            <h4 class="titulo-opcionais"><i class="fas fa-list"></i> ADICIONAR OPCIONAIS</h4>
            <div class="moldura-agrupadora-opcionais">
                ${itensHTML}
            </div>
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

// FUNÇÃO PRINCIPAL REESCRITA - VERSÃO COMPACTA
function renderizarModalProduto(produto) {
    console.log('🔄 Renderizando Modal Padronizado para:', produto.nome);
    
    const container = elemento('corpo-modal-produto');
    if (!container) return;

    container.innerHTML = `
        <div class="imagem-produto-container">
            <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto-modal">
        </div>

        <div id="status-no-carrinho" class="${produtoAtual.quantidade > 0 ? 'visivel' : 'escondido'}" 
             style="text-align: center; color: #4b6b35; font-weight: bold; font-size: 0.85rem; padding: 10px 0; background-color: #f0f7ed; border-bottom: 1px solid #e0eadd;">
            <i class="fas fa-check-circle"></i> Item adicionado ao carrinho de compras
        </div>
        
        <div class="moldura-padrao-modal">
            <h2 class="nome-produto-modal">${produto.nome}</h2>
            <p class="descricao-produto-modal">${produto.descricao || ''}</p>
        </div>
        
        <div class="moldura-padrao-modal">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: bold; font-size: 1rem; color: #000;">Quantidade</span>
                    <span style="font-size: 0.9rem; color: #666;">${formatarMoeda(produto.preco)}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="botao-quantidade-pequeno" 
                            onclick="alterarQuantidadeProduto(-1)"
                            style="width: 30px; height: 30px; border-radius: 50%; border: none; background-color: #332616; color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">-</button>
                    
                    <span id="quantidade-produto-modal" 
                          style="font-weight: bold; font-size: 1rem; min-width: 20px; text-align: center;">${produtoAtual.quantidade}</span>
                    
                    <button class="botao-quantidade-pequeno" 
                            onclick="alterarQuantidadeProduto(1)"
                            style="width: 30px; height: 30px; border-radius: 50%; border: none; background-color: #332616; color: white; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">+</button>
                </div>
            </div>
        </div>
        
        <div id="secao-opcionais-dinamica">
            ${gerarHTMLSecaoOpcionais(produto)}
        </div>
        
        <div id="container-subtotal-produto" class="moldura-padrao-modal ${produtoAtual.quantidade > 0 ? 'visivel' : 'escondido'}" style="background-color: #e8e8e8 !important;">
            <div class="linha-flex-modal">
                <span class="subtitulo-subtotal">SUBTOTAL DO ITEM</span>
                <span id="valor-subtotal-produto" class="valor-subtotal">${formatarMoeda(calcularSubtotalProduto())}</span>
            </div>
        </div>
    `;

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
    
    // Garantimos que a conta seja feita e o mínimo seja 0
    const novaQuantidade = Math.max(0, (produtoAtual.quantidade || 0) + valor);

    // Se a quantidade for a mesma (ex: clicar no menos quando já está em 0), interrompe
    if (novaQuantidade === produtoAtual.quantidade) return;

    produtoAtual.quantidade = novaQuantidade;
    console.log(`✅ Nova quantidade definida: ${produtoAtual.quantidade}`);

    // Regra: Se zerar o produto, limpa os opcionais
    if (produtoAtual.quantidade === 0) {
        console.log('🗑️ Produto zerado. Resetando opcionais.');
        produtoAtual.opcionais = {};
    }

    // 1. Atualiza o número no modal (O display central)
    const elementoQtd = document.getElementById('quantidade-produto-modal');
    if (elementoQtd) {
        elementoQtd.textContent = produtoAtual.quantidade;
    }

    // 2. ATUALIZA A VISIBILIDADE DOS OPCIONAIS
    // Em vez de "redesenhar" o HTML, vamos apenas chamar a função de renderizar o modal inteiro novamente.
    // É a forma mais segura de garantir que tudo (opcionais, preços, botões) se ajuste ao novo número.
    const produtoBase = dadosIniciais.secoes[produtoAtual.indiceSessao].itens[produtoAtual.indiceItem];
    renderizarModalProduto(produtoBase);

    // 3. Sincroniza com o carrinho global
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
    const containerSubtotal = document.getElementById('container-subtotal-produto');
    const statusCarrinho = document.getElementById('status-no-carrinho');
    
    const btnBege = document.getElementById('botao-adicionar-simples');
    const btnVerde = document.getElementById('botao-adicionar-e-ir-para-carrinho');

    console.log(`👁️ Verificando visibilidade. Qtd atual: ${qtd}`);

    // 1. Controle da Notificação Permanente e do Subtotal
    if (qtd > 0) {
        // Se tem item, mostra subtotal e mensagem de confirmação
        if (containerSubtotal) {
            containerSubtotal.classList.remove('escondido');
            containerSubtotal.classList.add('visivel');
        }
        if (statusCarrinho) {
            statusCarrinho.classList.remove('escondido');
            statusCarrinho.classList.add('visivel');
            statusCarrinho.style.display = 'block';
        }
    } else {
        // Se zerou, esconde ambos para evitar confusão
        if (containerSubtotal) {
            containerSubtotal.classList.remove('visivel');
            containerSubtotal.classList.add('escondido');
        }
        if (statusCarrinho) {
            statusCarrinho.classList.remove('visivel');
            statusCarrinho.classList.add('escondido');
            statusCarrinho.style.display = 'none';
        }
    }

    // 2. Controle dos Botões (Mantendo IDs e classes originais)
    if (btnVerde) {
        // Botão verde de "Abrir Carrinho" só aparece se houver itens
        btnVerde.style.display = (qtd > 0) ? 'flex' : 'none';
    }

    if (btnBege) {
        // Botão bege de "Continuar Comprando" sempre visível para permitir fechar
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

// FUNÇÃO AUXILIAR PARA GARANTIR ALINHAMENTO PERFEITO
function ajustarAlinhamentoOpcionais() {
    const opcionaisItems = document.querySelectorAll('.opcional-item');
    
    opcionaisItems.forEach(item => {
        const controles = item.querySelector('.controles-opcional');
        const info = item.querySelector('.opcional-info');
        
        if (controles && info) {
            // Forçar alinhamento vertical centralizado
            controles.style.display = 'flex';
            controles.style.alignItems = 'center';
            controles.style.justifyContent = 'center';
        }
    });
    
    console.log('✅ Alinhamento dos opcionais ajustado.');
}

// ===================== EXPORTAÇÕES GLOBAIS =====================

// Função de alinhamento visual
window.ajustarAlinhamentoOpcionais = ajustarAlinhamentoOpcionais;

// Funções de controle do modal e produto
window.configurarProduto = configurarProduto;
window.renderizarModalProduto = renderizarModalProduto; // Adicionado para segurança
window.alterarQuantidadeProduto = alterarQuantidadeProduto;

// Funções de lógica de opcionais e HTML
window.gerarHTMLSecaoOpcionais = gerarHTMLSecaoOpcionais; 
window.obterOpcionaisAtivos = obterOpcionaisAtivos;

// Funções de ação do carrinho
window.adicionarItemAoCarrinho = adicionarItemAoCarrinho;
window.adicionarEIrParaCarrinho = adicionarEIrParaCarrinho;
window.removerItemDoCarrinho = removerItemDoCarrinho;

console.log('✅ Exportações de produto-modal.js concluídas com sucesso.');

