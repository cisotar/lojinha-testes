// ============================================
// SISTEMA DE NOTIFICAÇÕES - PÃO DO CISO
// ============================================

function mostrarNotificacao(mensagem) {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao';
    notificacao.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${mensagem}</span>
    `;
    
    // Estilos
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--verde-sucesso);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 3000);
}

// Adicionar estilos CSS dinâmicos para notificações
function adicionarEstilosNotificacoes() {
    const estilosDinamicos = document.createElement('style');
    estilosDinamicos.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .tag-esgotado {
            background: #ffcccc;
            color: #cc0000;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .btn-adicionar {
            background: var(--verde-militar);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .btn-adicionar:hover {
            background: #3a5a24;
            transform: scale(1.1);
        }
        
        .carrinho-vazio {
            text-align: center;
            padding: 40px 20px;
        }
        
        .titulo-carrinho {
            text-align: center;
            font-weight: 900;
            text-transform: uppercase;
            color: var(--marrom-cafe);
            margin-bottom: 20px;
            letter-spacing: 1px;
        }
        
        .lista-itens-carrinho {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #eee;
            margin-bottom: 15px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .item-carrinho {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .item-carrinho:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .info-item-carrinho {
            flex-grow: 1;
        }
        
        .nome-quantidade-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
        }
        
        .quantidade-item {
            font-weight: 900;
            color: #222;
            min-width: 25px;
        }
        
        .nome-item {
            font-weight: 900;
            color: #222;
            font-size: 0.95rem;
        }
        
        .opcional-carrinho {
            font-size: 0.8rem;
            color: #666;
            margin-left: 35px;
            margin-bottom: 2px;
        }
        
        .subtotal-item {
            font-weight: bold;
            color: var(--verde-militar);
            font-size: 0.9rem;
            margin-top: 4px;
            margin-left: 35px;
        }
        
        .botao-remover-item {
            background: #ffeded;
            color: #cc0000;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .opcoes-carrinho {
            margin-bottom: 20px;
        }
        
        .grupo-cupom {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .campo-cupom {
            flex-grow: 1;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .botao-aplicar-cupom {
            background: var(--marrom-cafe);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 900;
            font-size: 0.75rem;
            cursor: pointer;
            white-space: nowrap;
        }
        
        .grupo-entrega {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #eee;
        }
        
        .titulo-entrega {
            font-size: 0.75rem;
            font-weight: 900;
            color: #444;
            margin-bottom: 10px;
            text-transform: uppercase;
            text-align: center;
        }
        
        .opcoes-entrega {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .opcao-entrega {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            border: 2px solid #ccc;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 900;
            font-size: 0.7rem;
            background: white;
            transition: all 0.3s;
        }
        
        .opcao-entrega.selecionada {
            border-color: var(--marrom-cafe);
            background: #fdfaf7;
        }
        
        .opcao-entrega input[type="radio"] {
            display: none;
        }
        
        .informacao-taxa {
            border: 2px dashed var(--borda-nav);
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            font-size: 0.85rem;
            font-weight: bold;
            color: var(--marrom-detalhe);
        }
        
        .detalhes-resumo {
            padding: 5px 15px;
            margin-bottom: 10px;
        }
        
        .linha-resumo {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: #666;
            margin-bottom: 5px;
        }
        
        .linha-resumo.desconto {
            color: #cc0000;
        }
        
        .total-geral-carrinho {
            background: #ffeded;
            padding: 15px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 1px solid #ffcccc;
            margin-bottom: 20px;
        }
        
        .rotulo-total {
            font-size: 0.7rem;
            color: #cc0000;
            letter-spacing: 1px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .valor-total {
            font-size: 1.6rem;
            font-weight: 900;
            color: #cc0000;
        }
        
        .botoes-carrinho {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
    `;
    document.head.appendChild(estilosDinamicos);
}

// EXPORTAR FUNÇÕES
window.mostrarNotificacao = mostrarNotificacao;
window.adicionarEstilosNotificacoes = adicionarEstilosNotificacoes;