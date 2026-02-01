// ============================================
// INICIALIZAÇÃO PRINCIPAL - PÃO DO CISO
// ============================================

function inicializarSistema() {
    console.log('Inicializando sistema Pão do Ciso...');
    
    // Carregar estado salvo
    if (typeof carregarCarrinhoSalvo === 'function') {
        carregarCarrinhoSalvo();
    } else {
        console.error('Função carregarCarrinhoSalvo não encontrada!');
    }
    
    // Inicializar componentes
    if (typeof renderizarCardapio === 'function') {
        renderizarCardapio();
    }
    
    if (typeof atualizarBarraCarrinho === 'function') {
        atualizarBarraCarrinho();
    }
    
    if (typeof configurarEventosGerais === 'function') {
        configurarEventosGerais();
    }
    
    if (typeof configurarEventosCEP === 'function') {
        configurarEventosCEP();
    }
    
    if (typeof adicionarEstilosNotificacoes === 'function') {
        adicionarEstilosNotificacoes();
    }
    
    // Configurar barra do carrinho
    const barraCarrinho = elemento('barra-carrinho');
    if (barraCarrinho) {
        barraCarrinho.addEventListener('click', function() {
            if (typeof abrirModalCarrinho === 'function') {
                abrirModalCarrinho();
            } else {
                console.error('Função abrirModalCarrinho não encontrada!');
            }
        });
    }
    
    console.log('✅ Sistema Pão do Ciso inicializado com sucesso!');
}

// INICIALIZAR QUANDO O DOM CARREGAR
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, verificando dependências...');
    
    // Verificar se dados iniciais estão carregados
    if (!window.dadosIniciais) {
        console.error('❌ Dados iniciais não carregados. Verifique dados.js');
        // Mostrar mensagem de erro para o usuário
        const container = document.getElementById('container-aplicativo');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:#cc0000;">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem; margin-bottom:20px;"></i>
                    <h2>Erro ao carregar o cardápio</h2>
                    <p>Por favor, recarregue a página ou entre em contato com o suporte.</p>
                </div>
            `;
        }
        return;
    }
    
    // Verificar funções essenciais
    if (!window.elemento) {
        console.warn('Função elemento não encontrada, criando fallback...');
        window.elemento = id => document.getElementById(id);
    }
    
    if (!window.formatarMoeda) {
        console.warn('Função formatarMoeda não encontrada, criando fallback...');
        window.formatarMoeda = valor => {
            return parseFloat(valor || 0).toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL'
            });
        };
    }
    
    // Inicializar sistema
    setTimeout(() => {
        inicializarSistema();
    }, 100);
});

// EXPORTAR FUNÇÕES GLOBAIS
window.inicializarSistema = inicializarSistema;