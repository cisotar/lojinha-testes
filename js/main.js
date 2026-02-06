// ============================================
// INICIALIZAÇÃO PRINCIPAL - PÃO DO CISO
// ============================================
function inicializarSistema() {
    console.log('Inicializando sistema Pão do Ciso...');
    
    // 1. CARREGAR CARRINHO PRIMEIRO (IMPORTANTE!)
    if (typeof carregarCarrinhoSalvo === 'function') {
        carregarCarrinhoSalvo();
    }
    
    // 2. DEPOIS RENDERIZAR CARDÁPIO
    if (typeof renderizarCardapio === 'function') {
        renderizarCardapio();
    }
    
    // 3. DEPOIS ATUALIZAR BARRA
    if (typeof atualizarBarraCarrinho === 'function') {
        atualizarBarraCarrinho();
    }
    
    // 4. RESTANTE DO CÓDIGO...
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
            }
        });
    }
    
    // 🔥 PASSO 8: VERIFICAÇÃO DO ADDRESSMANAGER
    // Adicione esta parte NO FINAL da função, antes do console.log final:
    console.log('🔍 Verificando AddressManager...');
    
    // Verificação após um pequeno delay (para garantir que todos scripts carregaram)
    setTimeout(() => {
        if (window.AddressManager) {
            console.log('✅ AddressManager carregado com sucesso!');
            console.log('📋 Métodos disponíveis:', Object.keys(window.AddressManager));
            
            // Testa cada método individualmente
            const metodos = ['init', 'validar', 'getEndereco', 'formatarCEP'];
            metodos.forEach(metodo => {
                if (typeof window.AddressManager[metodo] === 'function') {
                    console.log(`   ✓ ${metodo}(): OK`);
                } else {
                    console.warn(`   ✗ ${metodo}(): Não encontrado`);
                }
            });
        } else {
            console.error('❌ AddressManager NÃO foi carregado!');
            console.warn('⚠️ Verifique:');
            console.warn('   1. O arquivo address-manager.js existe em js/');
            console.warn('   2. Foi adicionado antes de dados-cliente.js no HTML');
            console.warn('   3. Não há erros de sintaxe no arquivo');
        }
    }, 500); // 500ms de delay
    
    // ===================== RECUPERAÇÃO DE CARRINHO =====================
    setTimeout(() => {
        console.log('🔄 Timer de recuperação disparado...');
        if (window.iniciarRecuperacaoCarrinho) {
            console.log('✅ Função encontrada, executando...');
            window.iniciarRecuperacaoCarrinho();
        } else {
            console.log('⚠️ Função não encontrada');
        }
    }, 800);

    console.log('✅ Sistema inicializado. Carrinho:', carrinho);
}

// Mantenha esta linha no final do arquivo (não modifique)
window.inicializarSistema = inicializarSistema;

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