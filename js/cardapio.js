// ============================================
// RENDERIZAÇÃO DO CARDÁPIO - PÃO DO CISO
// ============================================

// ===================== FUNÇÕES AUXILIARES MODULARIZADAS =====================

function criarCardProduto(sessao, indiceSessao, item, indiceItem) {
    const identificador = `item-${indiceSessao}-${indiceItem}`;
    const quantidadeNoCarrinho = carrinho[identificador]?.quantidade || 0;
    
    // 1. Definir se o item está bloqueado
    const estaEsgotado = !!item.esgotado; 
    
    console.log(`   📦 Criando card: "${item.nome}" - ${quantidadeNoCarrinho} no carrinho ${estaEsgotado ? '[ESGOTADO]' : ''}`);
    
    const card = document.createElement('div');
    // 2. Adiciona a classe 'esgotado' que o CSS vai usar para o overlay e carimbo
    card.className = `card ${estaEsgotado ? 'esgotado' : ''}`;
    card.dataset.sessao = indiceSessao;
    card.dataset.item = indiceItem;
    card.dataset.identificador = identificador;
    
    card.innerHTML = `
        <div class="card-imagem-wrapper">
            ${quantidadeNoCarrinho > 0 ? `
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
                ${!estaEsgotado ? '<button class="btn-adicionar" type="button">+</button>' : ''}
            </div>
        </div>
    `;
    
    // 3. Evento de clique: Só adicionamos se NÃO estiver esgotado
    if (!estaEsgotado) {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-adicionar')) {
                configurarProduto(indiceSessao, indiceItem);
            }
        });
        
        const btnAdicionar = card.querySelector('.btn-adicionar');
        if (btnAdicionar) {
            btnAdicionar.addEventListener('click', (e) => {
                e.stopPropagation();
                adicionarRapido(indiceSessao, indiceItem);
            });
        }
    } else {
        // Se estiver esgotado, garantimos que o cursor seja o de proibido
        card.style.cursor = 'not-allowed';
    }
    
    return card;
}

function criarSecaoProdutos(sessao, indiceSessao) {
    const itensVisiveis = sessao.itens.filter(item => item.visivel !== false);
    if (itensVisiveis.length === 0) return null;
    
    console.log(`📁 Criando seção ${indiceSessao} - "${sessao.nome}": ${itensVisiveis.length} itens`);
    
    const secaoDiv = document.createElement('div');
    secaoDiv.innerHTML = `
        <div class="titulo-secao-wrapper">
            <div class="linha-solida"></div>
            <h2 class="titulo-secao">${sessao.nome}</h2>
            <div class="linha-solida"></div>
        </div>
        <div class="grid-produtos"></div>
    `;
    
    const grid = secaoDiv.querySelector('.grid-produtos');
    let cardsCriados = 0;
    
    sessao.itens.forEach((item, indiceItem) => {
        if (item.visivel === false) return;
        
        const card = criarCardProduto(sessao, indiceSessao, item, indiceItem);
        grid.appendChild(card);
        cardsCriados++;
    });
    
    console.log(`   ✅ ${cardsCriados} cards criados na seção "${sessao.nome}"`);
    return secaoDiv;
}

// ===================== RENDERIZAÇÃO DO CARDÁPIO (OTIMIZADA) =====================

function renderizarCardapio() {
    console.log("🎯 RENDERIZANDO CARDÁPIO COMPLETO");
    console.log("Carrinho atual:", carrinho);
    console.log("Quantidade de itens no carrinho:", Object.keys(carrinho).length);
    
    const container = elemento('container-aplicativo');
    if (!container || !dadosIniciais.secoes) {
        console.error("❌ Container ou dados iniciais não encontrados");
        return;
    }

    console.log(`📊 Renderizando ${dadosIniciais.secoes.length} seções`);
    
    // Usar DocumentFragment para reduzir reflows
    const fragment = document.createDocumentFragment();
    
    dadosIniciais.secoes.forEach((sessao, indiceSessao) => {
        const secaoElement = criarSecaoProdutos(sessao, indiceSessao);
        if (secaoElement) {
            fragment.appendChild(secaoElement);
        }
    });
    
    // Limpar e adicionar tudo de uma vez
    container.innerHTML = '';
    container.appendChild(fragment);
    
    console.log("✅ Renderização do cardápio concluída");
    atualizarDatasFornada();
}

// Função para renderizar APENAS UM CARD específico (para atualizações)
function atualizarCardUnico(indiceSessao, indiceItem) {
    console.log(`🎯 ATUALIZANDO CARD ÚNICO: seção ${indiceSessao}, item ${indiceItem}`);
    
    const seletor = `.card[data-sessao="${indiceSessao}"][data-item="${indiceItem}"]`;
    const card = document.querySelector(seletor);
    
    if (!card) {
        console.log(`❌ Card não encontrado para atualização: ${seletor}`);
        return;
    }
    
    const sessao = dadosIniciais.secoes[indiceSessao];
    const item = sessao.itens[indiceItem];
    
    if (!item || item.visivel === false) {
        console.log(`❌ Item não disponível para atualização`);
        return;
    }
    
    // Substituir apenas este card
    const novoCard = criarCardProduto(sessao, indiceSessao, item, indiceItem);
    card.parentNode.replaceChild(novoCard, card);
    
    console.log(`✅ Card atualizado: ${item.nome}`);
}

// Função para atualizar APENAS OS BADGES sem re-renderizar tudo - VERSÃO CORRIGIDA
function atualizarBadgesAposRemocao() {
    console.log("🔄 ATUALIZANDO BADGES APÓS REMOÇÃO (VERSÃO CORRIGIDA)");
    
    // 1. Primeiro: Coletar todos os identificadores que DEVEM ter badge
    const itensComQuantidadePositiva = Object.keys(carrinho).filter(id => carrinho[id].quantidade > 0);
    console.log(`📊 Itens que DEVEM ter badge: ${itensComQuantidadePositiva.length}`);
    
    // 2. Para cada item que DEVE ter badge, atualize-o
    itensComQuantidadePositiva.forEach(identificador => {
        const item = carrinho[identificador];
        const match = identificador.match(/item-(\d+)-(\d+)/);
        if (match) {
            const indiceSessao = parseInt(match[1]);
            const indiceItem = parseInt(match[2]);
            atualizarBadgeNoCard(indiceSessao, indiceItem);
        }
    });
    
    // 3. AGORA A PARTE CRÍTICA: Remover badges de itens que NÃO estão mais no carrinho
    //    ou estão com quantidade = 0
    const todosBadgesNoDOM = document.querySelectorAll('.badge-quantidade');
    console.log(`🔍 Verificando ${todosBadgesNoDOM.length} badges no DOM...`);
    
    todosBadgesNoDOM.forEach(badge => {
        const card = badge.closest('.card');
        if (!card) return;
        
        const identificador = card.dataset.identificador;
        if (!identificador) return;
        
        const quantidadeNoCarrinho = carrinho[identificador]?.quantidade || 0;
        
        // Se NÃO está no carrinho OU quantidade = 0, REMOVER badge
        if (!carrinho[identificador] || quantidadeNoCarrinho === 0) {
            console.log(`🗑️ Removendo badge obsoleto: ${identificador}`);
            badge.remove();
        }
    });
    
    // 4. Verificação final
    setTimeout(() => {
        const badgesRestantes = document.querySelectorAll('.badge-quantidade').length;
        console.log(`✅ Badges após limpeza: ${badgesRestantes}`);
    }, 100);
}

// ===================== DATAS DA FORNADA =====================
function atualizarDatasFornada() {
    console.log("📅 Atualizando datas da fornada...");
    
    if (!dadosIniciais.fornada) {
        console.warn("⚠️ Dados da fornada não encontrados");
        return;
    }

    const datas = calcularDatasFornada(dadosIniciais.fornada);
    console.log("📅 Datas calculadas:", datas);
    
    const elementoData = elemento('texto-data-fornada');
    const elementoLimite = elemento('texto-limite-pedido');
    
    if (elementoData) {
        elementoData.innerHTML = `
            <i class="fas fa-calendar-alt"></i> PRÓXIMA FORNADA: ${datas.fornada}
        `;
        console.log(`✅ Data da fornada atualizada: ${datas.fornada}`);
    } else {
        console.warn("⚠️ Elemento 'texto-data-fornada' não encontrado");
    }
    
    if (elementoLimite) {
        elementoLimite.textContent = `Pedidos até: ${datas.limite}`;
        console.log(`✅ Limite de pedido atualizado: ${datas.limite}`);
    } else {
        console.warn("⚠️ Elemento 'texto-limite-pedido' não encontrado");
    }
}

function calcularDatasFornada(infoFornada) {
    console.log("📅 Calculando datas da fornada:", infoFornada);
    
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

    const resultado = {
        fornada: `${diaFornada}, ${dataFornadaFormatada}`,
        limite: `${diaLimite}, ${dataLimiteFormatada} às ${infoFornada.horaLimite}`
    };
    
    console.log("📅 Resultado do cálculo:", resultado);
    return resultado;
}

// ===================== FUNÇÕES RÁPIDAS DE ADIÇÃO =====================

// Função para validar dados do produto
function validarProduto(produto) {
    console.log("🔍 Validando produto:", produto);
    
    if (!produto) {
        console.error("❌ Produto não definido");
        return false;
    }
    
    if (!produto.nome || produto.nome.trim() === '') {
        console.error("❌ Produto sem nome");
        return false;
    }
    
    if (!produto.preco || typeof produto.preco !== 'number') {
        console.error("❌ Produto sem preço válido:", produto.preco);
        return false;
    }
    
    console.log("✅ Produto validado com sucesso");
    return true;
}

// Função para verificar disponibilidade do produto
function verificarDisponibilidade(indiceSessao, indiceItem) {
    console.log(`🔍 Verificando disponibilidade: seção ${indiceSessao}, item ${indiceItem}`);
    
    if (!dadosIniciais.secoes?.[indiceSessao]?.itens?.[indiceItem]) {
        console.error(`❌ Produto não encontrado: seção ${indiceSessao}, item ${indiceItem}`);
        return false;
    }
    
    const produto = dadosIniciais.secoes[indiceSessao].itens[indiceItem];
    console.log(`📦 Produto encontrado: "${produto.nome}"`, {
        esgotado: produto.esgotado,
        visivel: produto.visivel
    });
    
    if (produto.esgotado) {
        console.warn(`⚠️ Produto esgotado: "${produto.nome}"`);
        mostrarNotificacao('Este produto está esgotado!', 'error');
        return false;
    }
    
    if (produto.visivel === false) {
        console.warn(`⚠️ Produto não está visível: "${produto.nome}"`);
        return false;
    }
    
    console.log(`✅ Produto disponível: "${produto.nome}"`);
    return true;
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo = 'info') {
    console.log(`💬 Exibindo notificação [${tipo}]: ${mensagem}`);
    
    // Remover notificações antigas
    const notificacaoAntiga = document.querySelector('.notificacao-flutuante');
    if (notificacaoAntiga) {
        console.log("🗑️ Removendo notificação anterior");
        notificacaoAntiga.remove();
    }
    
    // Criar nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-flutuante notificacao-${tipo}`;
    notificacao.innerHTML = `
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notificacao);
    console.log(`✅ Notificação criada: "${mensagem}"`, notificacao);
    
    // Animação de entrada
    setTimeout(() => {
        notificacao.classList.add('ativo');
        console.log(`🎬 Animação de entrada ativada para notificação`);
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        console.log(`⏰ Removendo notificação: "${mensagem}"`);
        notificacao.classList.remove('ativo');
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.remove();
                console.log(`🗑️ Notificação removida do DOM`);
            }
        }, 300);
    }, 3000);
}

// ÚNICA VERSÃO DA FUNÇÃO adicionarRapido (a versão otimizada)
function adicionarRapido(indiceSessao, indiceItem) {
    console.log(`🛒 ADICIONAR RÁPIDO: seção ${indiceSessao}, item ${indiceItem}`);
    
    // Validação
    if (!verificarDisponibilidade(indiceSessao, indiceItem)) {
        console.error(`❌ Produto não disponível: seção ${indiceSessao}, item ${indiceItem}`);
        return;
    }
    
    const produto = dadosIniciais.secoes[indiceSessao].itens[indiceItem];
    console.log(`📦 Produto para adicionar: "${produto.nome}"`);
    
    if (!validarProduto(produto)) {
        console.error(`❌ Validação do produto falhou: "${produto.nome}"`);
        mostrarNotificacao('Erro ao adicionar produto', 'error');
        return;
    }
    
    const identificador = `item-${indiceSessao}-${indiceItem}`;
    console.log(`🔑 Identificador do produto: ${identificador}`);
    
    // Adiciona ao carrinho
    if (!carrinho[identificador]) {
        console.log(`🆕 Criando novo item no carrinho: ${identificador}`);
        carrinho[identificador] = {
            identificador: identificador,
            indiceSessao: indiceSessao,
            indiceItem: indiceItem,
            quantidade: 1,
            opcionais: {},
            precoUnitario: produto.preco,
            nome: produto.nome
        };
    } else {
        carrinho[identificador].quantidade += 1;
        console.log(`🔢 Incrementando quantidade: ${identificador} = ${carrinho[identificador].quantidade}`);
    }
    
    console.log(`🛒 Estado atual do carrinho:`, carrinho);
    
    salvarCarrinho();
    console.log(`💾 Carrinho salvo no localStorage`);
    
    atualizarBarraCarrinho();
    console.log(`📊 Barra do carrinho atualizada`);
    
    atualizarBadgeNoCard(indiceSessao, indiceItem);
    
    // Feedback visual
    mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`, 'success');
}

function atualizarBadgeNoCard(indiceSessao, indiceItem) {
    const identificador = `item-${indiceSessao}-${indiceItem}`;
    const quantidade = carrinho[identificador]?.quantidade || 0;
    
    console.log(`🔍 DIAGNÓSTICO: atualizarBadgeNoCard chamada`);
    console.log(`   Identificador: ${identificador}`);
    console.log(`   Quantidade no carrinho: ${quantidade}`);
    console.log(`   Produto: ${dadosIniciais.secoes[indiceSessao]?.itens[indiceItem]?.nome || 'Desconhecido'}`);
    console.log(`🔄 ATUALIZAR BADGE: ${identificador}, quantidade: ${quantidade}`, {
        carrinhoItem: carrinho[identificador]
    });
    
    // Usar data attributes para encontrar o card específico
    const seletor = `[data-sessao="${indiceSessao}"][data-item="${indiceItem}"]`;
    console.log(`   Seletor usado: ${seletor}`);
    console.log(`🔍 Buscando card com seletor: ${seletor}`);
    
    const card = document.querySelector(seletor);
        console.log(`   Card encontrado? ${!!card}`);
    if (card) {
        console.log(`   Nome do card: ${card.querySelector('.card-nome')?.textContent}`);
    } else {
        console.log(`   ❌ Card NÃO encontrado com seletor: ${seletor}`);
    }

    if (!card) {
        console.error(`❌ Card não encontrado: seção ${indiceSessao}, item ${indiceItem}`);
        console.log(`   Todos os cards no DOM:`, document.querySelectorAll('[data-sessao]').length);
        return;
    }
    
    console.log(`✅ Card encontrado:`, card);
    
    const badge = card.querySelector('.badge-quantidade');
        console.log(`   Badge encontrado no card? ${!!badge}`);
    if (badge) {
        console.log(`   Texto atual do badge: "${badge.textContent}"`);
    }    
    console.log(`🔍 Badge atual:`, badge);
    
    if (!badge && quantidade > 0) {
        console.log(`   AÇÃO: Criando novo badge (não existia)`);
        // Criar badge se não existir
        console.log(`🆕 Criando novo badge para ${identificador}: quantidade ${quantidade}`);
        const imagemWrapper = card.querySelector('.card-imagem-wrapper');
        if (imagemWrapper) {
            const novoBadge = document.createElement('div');
            novoBadge.className = 'badge-quantidade';
            novoBadge.textContent = quantidade;
            
            // 🔥 IMPORTANTE: Definir o estilo display: flex
            novoBadge.style.display = 'flex';
            
            // Adicionar animação
            novoBadge.classList.add('updated');
            setTimeout(() => {
                novoBadge.classList.remove('updated');
            }, 300);
            
            imagemWrapper.appendChild(novoBadge);
            console.log(`✅ Badge criado e adicionado:`, novoBadge);
            console.log(`✅ Estilo do badge:`, novoBadge.style.cssText);
        } else {
            console.error(`❌ Não encontrou .card-imagem-wrapper no card`);
        }
    } else if (badge) {
        if (quantidade > 0) {
            console.log(`✏️ Atualizando badge existente: ${quantidade}`);
            console.log(`   AÇÃO: Atualizando badge existente de "${badge.textContent}" para "${quantidade}"`);
            badge.textContent = quantidade;
            badge.style.display = 'flex';
            
            // Adicionar animação de atualização
            badge.classList.add('updated');
            setTimeout(() => {
                badge.classList.remove('updated');
            }, 300);
        } else {
            console.log(`🗑️ Removendo badge (quantidade = 0)`);
            console.log(`   AÇÃO: Removendo badge do card`);
            badge.remove();
        }
    } else {
        console.log(`ℹ️ Nenhuma ação necessária para badge (quantidade: ${quantidade})`);
    }
    
    console.log(`✅ Badge atualizado para ${identificador}: ${quantidade}`);
}

// ===================== FUNÇÃO DE DIAGNÓSTICO =====================
function diagnosticarBadges() {
    console.log("=== 🩺 DIAGNÓSTICO COMPLETO DE BADGES ===");
    
    // 1. Carrinho atual
    console.log("📦 CARRINHO ATUAL:");
    const itensCarrinho = Object.keys(carrinho);
    
    if (itensCarrinho.length === 0) {
        console.log("   (Carrinho vazio)");
    } else {
        itensCarrinho.forEach(id => {
            const item = carrinho[id];
            console.log(`   ${id}: ${item.nome || 'Sem nome'} - ${item.quantidade} un.`);
        });
    }
    
    // 2. Itens que DEVEM ter badge (quantidade > 0)
    const itensComBadge = itensCarrinho.filter(id => carrinho[id].quantidade > 0);
    console.log(`🎯 Itens que DEVEM ter badge: ${itensComBadge.length}`);
    
    // 3. Badges no DOM
    const badgesDOM = document.querySelectorAll('.badge-quantidade');
    console.log(`🏷️ Badges visíveis no DOM: ${badgesDOM.length}`);
    
    if (badgesDOM.length === 0) {
        console.log("   (Nenhum badge visível)");
    } else {
        badgesDOM.forEach((badge, i) => {
            const card = badge.closest('.card');
            const nomeProduto = card?.querySelector('.card-nome')?.textContent || 'Desconhecido';
            const identificador = card?.dataset?.identificador || 'Sem ID';
            console.log(`   Badge ${i+1}: "${badge.textContent}" em "${nomeProduto}" (${identificador})`);
        });
    }
    
    // 4. Comparação
    console.log(`📊 COMPARAÇÃO: ${itensComBadge.length} itens no carrinho vs ${badgesDOM.length} badges visíveis`);
    
    if (itensComBadge.length === badgesDOM.length) {
        console.log("✅ CORRESPONDÊNCIA PERFEITA!");
    } else {
        console.log(`⚠️ DESCASAMENTO: Esperados ${itensComBadge.length}, encontrados ${badgesDOM.length}`);
    }
    
    console.log("=== FIM DIAGNÓSTICO ===");
    return { itensComBadge, badgesDOM };
}

// EXPORTAR FUNÇÕES
window.renderizarCardapio = renderizarCardapio;
window.atualizarDatasFornada = atualizarDatasFornada;
window.adicionarRapido = adicionarRapido;
window.calcularDatasFornada = calcularDatasFornada;
window.atualizarBadgeNoCard = atualizarBadgeNoCard;
window.validarProduto = validarProduto;
window.verificarDisponibilidade = verificarDisponibilidade;
window.mostrarNotificacao = mostrarNotificacao;
window.atualizarCardUnico = atualizarCardUnico;
window.atualizarBadgesAposRemocao = atualizarBadgesAposRemocao;
window.diagnosticarBadges = diagnosticarBadges;

console.log("✅ cardapio.js carregado e funções exportadas");