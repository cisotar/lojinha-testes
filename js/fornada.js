// ============================================
// CONFIGURAÇÃO DE FORNADA - PÃO DO CISO
// ============================================

function configurarDatasFornada() {
    console.log('⚙️ Configurando datas da fornada...');
    
    // Verifica se temos dados de fornada
    if (!window.dadosIniciais || !window.dadosIniciais.fornada) {
        console.error('❌ Dados da fornada não encontrados!');
        return;
    }
    
    const { dataISO, diasAntecedencia, horaLimite } = window.dadosIniciais.fornada;
    
    try {
        // Parse da data da fornada
        const dataFornada = new Date(dataISO);
        
        // Data limite para pedidos (data da fornada menos dias de antecedência)
        const dataLimite = new Date(dataFornada);
        dataLimite.setDate(dataFornada.getDate() - diasAntecedencia);
        
        // Formatar datas para exibição SEM ANO
        const formatarDataSemAno = (data) => {
            return data.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long'
                // Removemos o 'year: 'numeric' para não mostrar o ano
            });
        };
        
        const dataFornadaFormatada = formatarDataSemAno(dataFornada);
        const dataLimiteFormatada = formatarDataSemAno(dataLimite);
        
        console.log('📅 Datas formatadas (sem ano):', {
            fornada: dataFornadaFormatada,
            limite: dataLimiteFormatada + ' às ' + horaLimite
        });
        
        // Atualizar elementos no banner
        const elementoDataFornada = document.getElementById('texto-data-fornada');
        const elementoLimitePedido = document.getElementById('texto-limite-pedido');
        
        if (elementoDataFornada) {
            elementoDataFornada.innerHTML = `<i class="fas fa-calendar-alt"></i> PRÓXIMA FORNADA: ${dataFornadaFormatada.toUpperCase()}`;
        }
        
        if (elementoLimitePedido) {
            elementoLimitePedido.textContent = `Pedidos até: ${dataLimiteFormatada} às ${horaLimite}`;
        }
        
        // Atualizar elementos no modal
        const elementoDataFornadaModal = document.getElementById('data-fornada-modal');
        const elementoLimiteFornadaModal = document.getElementById('limite-fornada-modal');
        
        if (elementoDataFornadaModal) {
            elementoDataFornadaModal.textContent = dataFornadaFormatada;
        }
        
        if (elementoLimiteFornadaModal) {
            elementoLimiteFornadaModal.textContent = dataLimiteFormatada + ' às ' + horaLimite;
        }
        
        console.log('✅ Datas da fornada configuradas com sucesso!');
        
        // VERIFICAR SE JÁ PASSOU DO PRAZO
        const agora = new Date();
        const dataLimiteComHora = new Date(dataLimite);
        
        // Extrair hora da string horaLimite (ex: "12h")
        const hora = parseInt(horaLimite.replace('h', ''), 10) || 12;
        dataLimiteComHora.setHours(hora, 0, 0, 0);
        
        if (agora > dataLimiteComHora) {
            console.warn('⚠️ Prazo da fornada já expirou!');
            desabilitarFornada();
        } else {
            console.log('✅ Fornada ainda disponível para pedidos!');
            habilitarFornada();
        }
        
    } catch (error) {
        console.error('❌ Erro ao configurar datas da fornada:', error);
    }
}

function desabilitarFornada() {
    const bannerFornada = document.querySelector('.banner-fornada');
    if (bannerFornada) {
        bannerFornada.style.opacity = '0.6';
        bannerFornada.style.cursor = 'not-allowed';
        bannerFornada.onclick = null;
        
        // Atualizar texto do banner
        const elementoDataFornada = document.getElementById('texto-data-fornada');
        if (elementoDataFornada) {
            elementoDataFornada.innerHTML = `<i class="fas fa-exclamation-triangle"></i> FORNADA ENCERRADA`;
        }
        
        const elementoLimitePedido = document.getElementById('texto-limite-pedido');
        if (elementoLimitePedido) {
            elementoLimitePedido.textContent = 'Próxima data em breve!';
        }
    }
}

function habilitarFornada() {
    const bannerFornada = document.querySelector('.banner-fornada');
    if (bannerFornada) {
        bannerFornada.style.opacity = '1';
        bannerFornada.style.cursor = 'pointer';
        bannerFornada.onclick = function() {
            if (typeof abrirModal === 'function') {
                abrirModal('modal-informacoes-fornada');
            }
        };
    }
}

function desabilitarFornada() {
    const bannerFornada = document.querySelector('.banner-fornada');
    if (bannerFornada) {
        bannerFornada.style.opacity = '0.6';
        bannerFornada.style.cursor = 'not-allowed';
        bannerFornada.onclick = null;
        
        // Atualizar texto do banner
        const elementoDataFornada = document.getElementById('texto-data-fornada');
        if (elementoDataFornada) {
            elementoDataFornada.innerHTML = `<i class="fas fa-exclamation-triangle"></i> FORNADA ENCERRADA`;
        }
        
        const elementoLimitePedido = document.getElementById('texto-limite-pedido');
        if (elementoLimitePedido) {
            elementoLimitePedido.textContent = 'Próxima data em breve!';
        }
    }
}

function habilitarFornada() {
    const bannerFornada = document.querySelector('.banner-fornada');
    if (bannerFornada) {
        bannerFornada.style.opacity = '1';
        bannerFornada.style.cursor = 'pointer';
        bannerFornada.onclick = function() {
            if (typeof abrirModal === 'function') {
                abrirModal('modal-informacoes-fornada');
            }
        };
    }
}

// EXPORTAR FUNÇÕES
window.configurarDatasFornada = configurarDatasFornada;
window.desabilitarFornada = desabilitarFornada;
window.habilitarFornada = habilitarFornada;