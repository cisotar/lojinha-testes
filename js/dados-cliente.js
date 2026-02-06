// ============================================
// VALIDAÇÃO DE DADOS DO CLIENTE - PÃO DO CISO
// ============================================

function validarDadosCliente() {
    const nome = elemento('nome-cliente').value.trim();
    const whatsapp = elemento('whatsapp-cliente').value.trim();
    
    if (!nome || nome.length < 3) {
        alert('Por favor, digite seu nome completo.');
        elemento('nome-cliente').focus();
        return;
    }
    
    const whatsappNumeros = whatsapp.replace(/\D/g, '');
    if (whatsappNumeros.length !== 11) {
        alert('Por favor, digite um WhatsApp válido com DDD (11 dígitos).');
        elemento('whatsapp-cliente').focus();
        return;
    }
    
    if (estadoAplicativo.modoEntrega === 'entrega') {
        if (estadoAplicativo.cepCalculado) {
            const campoCEP = elemento('codigo-postal-cliente');
            if (campoCEP && !campoCEP.value) {
                campoCEP.value = estadoAplicativo.cepCalculado.substring(0,5) + '-' + estadoAplicativo.cepCalculado.substring(5);
                
                setTimeout(() => {
                    buscarEnderecoPorCodigoPostal(estadoAplicativo.cepCalculado);
                }, 500);
            }
        }
        
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

window.diagnosticarCep = diagnosticarCep;

// EXPORTAR FUNÇÕES
window.validarDadosCliente = validarDadosCliente;
// window.testarAddressManager = testarAddressManager;
