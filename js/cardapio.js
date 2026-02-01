// ============================================
// RENDERIZAÇÃO DO CARDÁPIO - PÃO DO CISO
// ============================================

function renderizarCardapio() {
    const container = elemento('container-aplicativo');
    if (!container || !dadosIniciais.secoes) return;

    let html = '';
    
    dadosIniciais.secoes.forEach((sessao, indiceSessao) => {
        // Pular seções sem itens visíveis
        const itensVisiveis = sessao.itens.filter(item => item.visivel !== false);
        if (itensVisiveis.length === 0) return;

        html += `
            <div class="titulo-secao-wrapper">
                <div class="linha-solida"></div>
                <h2 class="titulo-secao">${sessao.nome}</h2>
                <div class="linha-solida"></div>
            </div>
            <div class="grid-produtos">`;

        sessao.itens.forEach((item, indiceItem) => {
            // Pular itens não visíveis
            if (item.visivel === false) return;

            const identificador = `item-${indiceSessao}-${indiceItem}`;
            const quantidadeNoCarrinho = carrinho[identificador] ? carrinho[identificador].quantidade : 0;
            const mostrarBadge = quantidadeNoCarrinho > 0;

            html += `
                <div class="card" onclick="configurarProduto(${indiceSessao}, ${indiceItem})">
                    <div class="card-imagem-wrapper">
                        ${mostrarBadge ? `
                        <div class="badge-quantidade" style="display: flex;">
                            ${quantidadeNoCarrinho}
                        </div>
                        ` : ''}
                        <img src="${item.imagem}" alt="${item.nome}" loading="lazy">
                    </div>
                    
                    <div class="card-content">
                        <div class="card-nome">${item.nome}</div>
                        <hr class="divisor-card">
                        <div class="card-desc">${item.descricao || ''}</div>
                        <div class="card-footer">
                            <span class="card-preco">${formatarMoeda(item.preco)}</span>
                            ${item.esgotado ? 
                            '<span class="tag-esgotado">ESGOTADO</span>' : 
                            '<button class="btn-adicionar" onclick="event.stopPropagation(); adicionarRapido(${indiceSessao}, ${indiceItem})">+</button>'}
                        </div>
                    </div>
                </div>`;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
    atualizarDatasFornada();
}

// ===================== DATAS DA FORNADA =====================
function atualizarDatasFornada() {
    if (!dadosIniciais.fornada) return;

    const datas = calcularDatasFornada(dadosIniciais.fornada);
    
    const elementoData = elemento('texto-data-fornada');
    const elementoLimite = elemento('texto-limite-pedido');
    
    if (elementoData) {
        elementoData.innerHTML = `
            <i class="fas fa-calendar-alt"></i> PRÓXIMA FORNADA: ${datas.fornada}
        `;
    }
    
    if (elementoLimite) {
        elementoLimite.textContent = `Pedidos até: ${datas.limite}`;
    }
}

function calcularDatasFornada(infoFornada) {
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Data da Fornada
    const dataFornada = new Date(infoFornada.dataISO + 'T12:00:00');
    const diaFornada = diasSemana[dataFornada.getDay()];
    const dataFornadaFormatada = `${dataFornada.getDate().toString().padStart(2, '0')}/${(dataFornada.getMonth() + 1).toString().padStart(2, '0')}`;

    // Data Limite
    const dataLimite = new Date(dataFornada);
    dataLimite.setDate(dataFornada.getDate() - infoFornada.diasAntecedencia);
    const diaLimite = diasSemana[dataLimite.getDay()];
    const dataLimiteFormatada = `${dataLimite.getDate().toString().padStart(2, '0')}/${(dataLimite.getMonth() + 1).toString().padStart(2, '0')}`;

    return {
        fornada: `${diaFornada}, ${dataFornadaFormatada}`,
        limite: `${diaLimite}, ${dataLimiteFormatada} às ${infoFornada.horaLimite}`
    };
}

// ===================== FUNÇÕES RÁPIDAS DE ADIÇÃO =====================
function adicionarRapido(indiceSessao, indiceItem) {
    const produto = dadosIniciais.secoes[indiceSessao].itens[indiceItem];
    const identificador = `item-${indiceSessao}-${indiceItem}`;

    if (produto.esgotado) {
        alert('Este produto está esgotado!');
        return;
    }

    // Adiciona ao carrinho
    if (!carrinho[identificador]) {
        carrinho[identificador] = {
            identificador: identificador,
            indiceSessao: indiceSessao,
            indiceItem: indiceItem,
            quantidade: 1,
            opcionais: {}
        };
    } else {
        carrinho[identificador].quantidade += 1;
    }

    salvarCarrinho();
    atualizarBarraCarrinho();
    
    // Atualiza badge no card
    const badge = document.querySelector(`[onclick="configurarProduto(${indiceSessao}, ${indiceItem})"] .badge-quantidade`);
    if (badge) {
        badge.textContent = carrinho[identificador].quantidade;
        badge.style.display = 'flex';
    }

    // Feedback visual
    mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`);
}

// EXPORTAR FUNÇÕES
window.renderizarCardapio = renderizarCardapio;
window.atualizarDatasFornada = atualizarDatasFornada;
window.adicionarRapido = adicionarRapido;
window.calcularDatasFornada = calcularDatasFornada;