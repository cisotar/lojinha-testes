// ============================================
// VALIDAÇÃO DE DADOS DO CLIENTE - PÃO DO CISO
// ============================================

function validarDadosCliente() {
    const nome = elemento('nome-cliente').value.trim();
    const whatsapp = elemento('whatsapp-cliente').value.trim();
    
    // Validação básica
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
    
    // Se for entrega, validar endereço
    if (estadoAplicativo.modoEntrega === 'entrega') {
        const cep = elemento('codigo-postal-cliente').value.replace(/\D/g, '');
        const logradouro = elemento('logradouro-cliente').value.trim();
        const bairro = elemento('bairro-cliente').value.trim();
        const numero = elemento('numero-residencia-cliente').value.trim();
        
        if (cep.length !== 8 || !logradouro || !bairro || !numero) {
            alert('Para entrega, preencha todos os campos de endereço obrigatórios.');
            return;
        }
        
        // Calcular frete se ainda não calculado
        if (!estadoAplicativo.taxaEntrega) {
            calcularFretePorBairro(bairro);
        }
    }
    
    // Prosseguir para pagamento
    fecharModal('modal-dados-cliente');
    abrirModalPagamento();
}

// EXPORTAR FUNÇÕES
window.validarDadosCliente = validarDadosCliente;