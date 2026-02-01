// ============================================
// FUNÇÕES UTILITÁRIAS - PÃO DO CISO
// ============================================

// UTILITÁRIOS (APENAS SE NÃO EXISTIREM)
if (!window.elemento) {
    window.elemento = id => document.getElementById(id);
}

if (!window.formatarMoeda) {
    window.formatarMoeda = valor => {
        return parseFloat(valor || 0).toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        });
    };
}

// FUNÇÕES DE FORMATAÇÃO
function formatarWhatsApp(valor) {
    let numeros = valor.replace(/\D/g, '');
    if (numeros.length > 11) numeros = numeros.substring(0, 11);
    
    if (numeros.length > 0) {
        numeros = numeros.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
    }
    
    return numeros;
}

function formatarCEP(valor) {
    let numeros = valor.replace(/\D/g, '');
    if (numeros.length > 8) numeros = numeros.substring(0, 8);
    
    if (numeros.length > 5) {
        numeros = numeros.substring(0, 5) + '-' + numeros.substring(5);
    }
    
    return numeros;
}

function calcularTotalCarrinho() {
    let total = 0;
    
    Object.values(window.carrinho).forEach(item => {
        if (window.dadosIniciais?.secoes?.[item.indiceSessao]?.itens?.[item.indiceItem]) {
            const produto = window.dadosIniciais.secoes[item.indiceSessao].itens[item.indiceItem];
            total += produto.preco * item.quantidade;
            
            // Adicionar opcionais
            Object.values(item.opcionais || {}).forEach(opcional => {
                total += opcional.quantidade * opcional.preco;
            });
        }
    });
    
    return total;
}

// FUNÇÕES DE VALIDAÇÃO
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length === 11;
}

// EXPORTAR FUNÇÕES
window.elemento = window.elemento;
window.formatarMoeda = window.formatarMoeda;
window.formatarWhatsApp = formatarWhatsApp;
window.formatarCEP = formatarCEP;
window.calcularTotalCarrinho = calcularTotalCarrinho;
window.validarEmail = validarEmail;
window.validarTelefone = validarTelefone;