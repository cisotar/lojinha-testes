// ============================================
// VALIDAÇÃO DE DADOS DO CLIENTE - PÃO DO CISO
// ============================================
function validarDadosCliente() {
    const nome = elemento('nome-cliente').value.trim();
    const whatsapp = elemento('whatsapp-cliente').value.trim();
    
    // Validações básicas
    if (!nome || nome.length < 3) {
        alert('Por favor, digite seu nome completo.');
        elemento('nome-cliente').focus();
        return;
    }
    
    // SALVAMENTO OBRIGATÓRIO (Chama a função que salva no localStorage)
    if (typeof salvarDadosCliente === 'function') {
        salvarDadosCliente();
    }

    if (estadoAplicativo.modoEntrega === 'entrega') {
        if (!window.AddressManager || !window.AddressManager.validar().valido) {
            alert('Por favor, preencha todos os campos de endereço obrigatórios.');
            return;
        }
        enderecoCliente = window.AddressManager.getEndereco();
    }
    
    fecharModal('modal-dados-cliente');
    abrirModalPagamento();
} 

// ===================== FUNÇÃO DE TESTE DO ADDRESSMANAGER =====================
/*function testarAddressManager() {
    console.log('🧪 TESTANDO AddressManager...');
    
    // Verifica se o AddressManager foi carregado
    if (!window.AddressManager) {
        alert('❌ AddressManager não foi carregado!\nVerifique se o arquivo address-manager.js está incluído.');
        return;
    }
    
    // Testa os métodos principais
    console.log('1. Método getEndereco():', window.AddressManager.getEndereco());
    console.log('2. Método validar():', window.AddressManager.validar());
    
    // Preenche automaticamente com dados de teste
    const camposTeste = {
        'codigo-postal-cliente': '01001-000',
        'logradouro-cliente': 'Praça da Sé',
        'bairro-cliente': 'Sé',
        'cidade-cliente': 'São Paulo/SP',
        'numero-residencia-cliente': '123',
        'complemento-residencia-cliente': 'Sobreloja',
        'ponto-referencia-entrega': 'Em frente à catedral'
    };
    
    // Preenche cada campo
    Object.keys(camposTeste).forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = camposTeste[id];
            // Dispara evento de change para atualizar o AddressManager
            campo.dispatchEvent(new Event('change'));
        }
    });
    
    // Feedback para o usuário
    const enderecoTeste = window.AddressManager.getEndereco();
    console.log('✅ Dados de teste preenchidos:', enderecoTeste);
    
    // Mostra mensagem amigável
    const mensagem = `✅ DADOS DE TESTE PREENCHIDOS:\n\n` +
                    `CEP: ${enderecoTeste.cep || 'Não preenchido'}\n` +
                    `Rua: ${enderecoTeste.logradouro || 'Não preenchido'}\n` +
                    `Bairro: ${enderecoTeste.bairro || 'Não preenchido'}\n` +
                    `Número: ${enderecoTeste.numero || 'Não preenchido'}\n\n` +
                    `Agora clique em "ESCOLHER PAGAMENTO" para testar a validação.`;
    
    alert(mensagem);
}

// Exporta a função para uso global
window.testarAddressManager = testarAddressManager;*/

// ===================== SALVAR E CARREGAR DADOS DO CLIENTE =====================
function salvarDadosCliente() {
    const nomeCampo = elemento('nome-cliente');
    const telefoneCampo = elemento('whatsapp-cliente');
    const cepCampo = elemento('codigo-postal-cliente');
    const ruaCampo = elemento('logradouro-cliente');
    const bairroCampo = elemento('bairro-cliente');
    const numeroCampo = elemento('numero-residencia-cliente');

    if (!nomeCampo || !telefoneCampo) return;
    
    const dados = {
        nome: nomeCampo.value.trim(),
        telefone: telefoneCampo.value.trim(),
        endereco: {
            cep: cepCampo ? cepCampo.value.trim() : '',
            rua: ruaCampo ? ruaCampo.value.trim() : '',
            bairro: bairroCampo ? bairroCampo.value.trim() : '',
            numero: numeroCampo ? numeroCampo.value.trim() : ''
        },
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem('dados_cliente_pao_do_ciso', JSON.stringify(dados));
    console.log('💾 Dados do cliente e endereço salvos no LocalStorage');
}

function carregarDadosCliente() {
    console.log('📂 Tentando recuperar dados do LocalStorage...');
    try {
        const dadosSalvos = localStorage.getItem('dados_cliente_pao_do_ciso');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            console.log('✅ Dados encontrados:', dados);

            if (dados.nome) document.getElementById('nome-cliente').value = dados.nome;
            if (dados.telefone) document.getElementById('whatsapp-cliente').value = dados.telefone;
            
            // Se houver endereço salvo e estivermos em modo entrega
            if (dados.endereco) {
                if (dados.endereco.cep) document.getElementById('codigo-postal-cliente').value = dados.endereco.cep;
                if (dados.endereco.rua) document.getElementById('logradouro-cliente').value = dados.endereco.rua;
                if (dados.endereco.bairro) document.getElementById('bairro-cliente').value = dados.endereco.bairro;
                if (dados.endereco.numero) document.getElementById('numero-residencia-cliente').value = dados.endereco.numero;
            }
            return true;
        }
        console.log('ℹ️ Nenhum dado salvo anteriormente.');
    } catch (error) {
        console.error('❌ Erro no carregamento de dados:', error);
    }
    return false;
}   


// ===================== DIAGNOSTICAR PROBLEMA DE CEP =====================
function diagnosticarCep() {
    console.log("=== 🩺 DIAGNÓSTICO CEP ===");
    console.log("1. CEP no estado:", estadoAplicativo.cepCalculado);
    console.log("2. Modo entrega:", estadoAplicativo.modoEntrega);
    console.log("3. Endereço salvo:", enderecoCliente);
    console.log("4. Campos visíveis no modal:");
    
    const campos = ['codigo-postal-cliente', 'logradouro-cliente', 'bairro-cliente', 'cidade-cliente'];
    campos.forEach(id => {
        const campo = elemento(id);
        if (campo) {
            console.log(`   ${id}: "${campo.value}"`);
        }
    });
    console.log("=== FIM DIAGNÓSTICO ===");
}

// ===================== EXPORTAR FUNÇÕES GLOBAIS =====================
window.diagnosticarCep = diagnosticarCep;
window.validarDadosCliente = validarDadosCliente;
window.salvarDadosCliente = salvarDadosCliente;
window.carregarDadosCliente = carregarDadosCliente;

// Função de debug/teste (manter comentada para produção)
// window.testarAddressManager = testarAddressManager;