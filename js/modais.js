// ============================================
// GERENCIAMENTO DE MODAIS
// ============================================

function abrirModal(id) {
    const modal = elemento(id);
    const overlay = elemento('overlay-modal');
    
    if (modal) {
        modal.style.display = 'block';
    }
    
    if (overlay) {
        overlay.style.display = 'block';
    }
    
    // Adicionar classe ao body para prevenir scroll
    document.body.style.overflow = 'hidden';
}

function fecharModal(id) {
    const modal = elemento(id);
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Verificar se ainda há modais abertos
    const modaisAbertos = document.querySelectorAll('.modal[style*="display: block"]');
    const overlay = elemento('overlay-modal');
    
    if (modaisAbertos.length === 0 && overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function fecharTodosModais() {
    const overlay = elemento('overlay-modal');
    const todosModais = document.querySelectorAll('.modal');
    
    todosModais.forEach(modal => {
        modal.style.display = 'none';
    });
    
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    document.body.style.overflow = 'auto';
}

function configurarEventosGerais() {
    // Prevenir que cliques dentro do modal fechem ele
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    // Configurar máscara do WhatsApp
    const inputWhatsApp = elemento('whatsapp-cliente');
    if (inputWhatsApp) {
        inputWhatsApp.addEventListener('input', (e) => {
            e.target.value = formatarWhatsApp(e.target.value);
        });
    }
    
    // Configurar overlay para fechar modais
    const overlay = elemento('overlay-modal');
    if (overlay) {
        overlay.addEventListener('click', () => {
            fecharTodosModais();
        });
    }
}

// EXPORTAR FUNÇÕES
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.fecharTodosModais = fecharTodosModais;
window.configurarEventosGerais = configurarEventosGerais;