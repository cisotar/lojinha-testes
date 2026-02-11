// ============================================
// SISTEMA DE CEP E CÁLCULO DE FRETE
// ============================================

// ===================== FORMATAÇÃO DE CEP =====================
function formatarCodigoPostal(input) {
    // Remover tudo que não é número
    let valor = input.value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    if (valor.length > 8) {
        valor = valor.substring(0, 8);
    }
    
    // Aplicar máscara: 00000-000
    if (valor.length > 5) {
        valor = valor.substring(0, 5) + '-' + valor.substring(5);
    }
    
    // Atualizar valor do campo
    input.value = valor;
    
    // Atualizar variável
    enderecoCliente.cep = valor.replace(/\D/g, '');
    
    // Buscar automaticamente quando tiver 8 dígitos
    if (enderecoCliente.cep.length === 8) {
        buscarEnderecoPorCodigoPostal(enderecoCliente.cep);
        
        // Feedback visual
        input.classList.add('campo-valido');
        input.classList.remove('campo-invalido');
    } else if (enderecoCliente.cep.length === 0) {
        input.classList.remove('campo-valido', 'campo-invalido');
    } else {
        input.classList.add('campo-invalido');
        input.classList.remove('campo-valido');
    }
}

// ===================== BUSCA DE ENDEREÇO VIA CEP =====================
async function buscarEnderecoPorCodigoPostal(cepCru) {
    // 1. LIMPEZA: Remove hífens/pontos
    const cep = String(cepCru).replace(/\D/g, '');
    
    console.log("🚀 [Debug] Iniciando busca para o CEP:", cep);

    if (!cep || cep.length !== 8) {
        console.warn("⚠️ [Debug] CEP inválido ou incompleto detectado:", cep);
        return;
    }

    if (typeof mostrarCarregamentoCEP === 'function') {
        console.log("⏳ [Debug] Ativando loading...");
        mostrarCarregamentoCEP(true);
    }

    try {
        console.log("🌐 [Debug] Chamando API ViaCEP...");
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            console.error("❌ [Debug] API retornou erro: CEP não encontrado.");
            alert("CEP não encontrado.");
            return;
        }

        console.log("✅ [Debug] Dados recebidos da API:", dados);

        // 2. ATUALIZAÇÃO DO CARRINHO (IMPORTANTE: Primeiro renderizar)
        // Chamamos primeiro para que o HTML base seja criado no DOM
        if (typeof renderizarCarrinho === 'function') {
            console.log("🔄 [Debug] Chamando renderizarCarrinho() antes do cálculo...");
            renderizarCarrinho();
        }

        // 3. PREENCHIMENTO E CÁLCULO (Agora com os elementos já no DOM)
        if (typeof preencherCamposEndereco === 'function') {
            console.log("📝 [Debug] Preenchendo campos de endereço...");
            preencherCamposEndereco(dados);
        }

        if (dados.bairro && typeof calcularFretePorBairro === 'function') {
            console.log(`🚚 [Debug] Aplicando frete e notificações para: ${dados.bairro}`);
            // Esta função agora vai encontrar os elementos e mostrar o bairro e a taxa
            calcularFretePorBairro(dados.bairro);
        }

        // Foco e destaque
        setTimeout(() => {
            const campoNome = document.getElementById('nome-cliente');
            if (campoNome) {
                console.log("🎯 [Debug] Movendo foco para o campo Nome.");
                campoNome.focus();
            }
        }, 1500);

    } catch (erro) {
        console.error('❌ [Debug] Erro catastrófico na busca:', erro);
    } finally {
        if (typeof mostrarCarregamentoCEP === 'function') {
            mostrarCarregamentoCEP(false);
            console.log("🏁 [Debug] Processo de busca finalizado.");
        }
    }
}

function preencherCamposEndereco(dados) {
    // Atualizar variável global
    enderecoCliente = {
        ...enderecoCliente,
        logradouro: dados.logradouro || '',
        bairro: dados.bairro || '',
        cidade: dados.localidade || '',
        estado: dados.uf || ''
    };
    
    // Preencher campos no formulário
    const campoLogradouro = elemento('logradouro-cliente');
    const campoBairro = elemento('bairro-cliente');
    const campoCidade = elemento('cidade-cliente');
    
    if (campoLogradouro) {
        campoLogradouro.value = dados.logradouro || '';
        campoLogradouro.classList.add('campo-valido');
    }
    
    if (campoBairro) {
        campoBairro.value = dados.bairro || '';
        campoBairro.classList.add('campo-valido');
    }
    
    if (campoCidade) {
        campoCidade.value = dados.localidade ? `${dados.localidade}/${dados.uf}` : '';
        campoCidade.classList.add('campo-valido');
    }
    
    // Habilitar campo de número
    const campoNumero = elemento('numero-residencia-cliente');
    if (campoNumero) {
        campoNumero.disabled = false;
        campoNumero.placeholder = 'Digite o número';
    }
}

// ===================== CÁLCULO DE FRETE POR BAIRRO =====================
// 1. Função que DEFINE o valor (chamada quando o bairro é identificado)
function calcularFretePorBairro(nomeBairro) {
    if (!nomeBairro) return;

    const bairros = window.dadosIniciais.entrega.bairros;
    const bairroEncontrado = bairros.find(b => 
        b.nome.toLowerCase().trim() === nomeBairro.toLowerCase().trim()
    );

    const taxaCalculada = bairroEncontrado ? bairroEncontrado.taxa : window.dadosIniciais.entrega.taxaGeral;

    // 1. Salva nos estados globais (Essencial para os cálculos financeiros)
    enderecoCliente.taxaEntrega = taxaCalculada;
    window.taxaEntregaGlobal = taxaCalculada;
    if(window.estadoAplicativo) window.estadoAplicativo.taxaEntrega = taxaCalculada;

    // --- 2. FORÇAR EXIBIÇÃO NO CARRINHO (Notificação do Bairro e Taxa) ---
    const divNotificacao = document.getElementById('notificacao-bairro-carrinho');
    const spanBairro = document.getElementById('nome-bairro-info');
    if (divNotificacao && spanBairro) {
        spanBairro.textContent = nomeBairro;
        divNotificacao.style.display = 'block'; 
    }

    const elementoValor = document.getElementById('valor-frete-carrinho');
    const divResultado = document.getElementById('resultado-frete-carrinho');
    if (elementoValor && divResultado) {
        elementoValor.textContent = formatarMoeda(taxaCalculada);
        divResultado.style.display = 'block'; 
    }

    // --- 3. ATUALIZAÇÃO DO MODAL DE PAGAMENTO (Para o resumo final) ---
    const elTaxaPgto = document.getElementById('taxa-final-pagamento');
    const elBairroPgto = document.getElementById('bairro-final-pagamento');
    if (elTaxaPgto) elTaxaPgto.textContent = formatarMoeda(taxaCalculada);
    if (elBairroPgto) elBairroPgto.textContent = nomeBairro;

    // 4. Recalcula o Total (Soma produtos + frete)
    if (typeof atualizarResumoFinanceiroCarrinho === 'function') {
        atualizarResumoFinanceiroCarrinho();
    }
}

// 2. Função que CONSULTA o valor (será usada pelo carrinho e pagamento)
function obterTaxaEntregaAtual() {
    // Retorna o que estiver gravado no endereço ou a taxa geral como última opção
    return (enderecoCliente && enderecoCliente.taxaEntrega !== undefined) 
        ? enderecoCliente.taxaEntrega 
        : window.dadosIniciais.entrega.taxaGeral;
}

// Tornar global para que o carrinho.js consiga enxergar
window.obterTaxaEntregaAtual = obterTaxaEntregaAtual;

// ===================== VALIDAÇÃO DE ENDEREÇO =====================
function validarEnderecoCompleto() {
    const camposObrigatorios = [
        { id: 'codigo-postal-cliente', nome: 'CEP' },
        { id: 'logradouro-cliente', nome: 'Rua' },
        { id: 'bairro-cliente', nome: 'Bairro' },
        { id: 'numero-residencia-cliente', nome: 'Número' }
    ];
    
    const camposInvalidos = [];
    
    // Verificar cada campo obrigatório
    camposObrigatorios.forEach(campo => {
        const elementoCampo = elemento(campo.id);
        if (elementoCampo) {
            const valor = elementoCampo.value.trim();
            if (!valor) {
                camposInvalidos.push(campo.nome);
                elementoCampo.classList.add('campo-invalido');
            } else {
                elementoCampo.classList.remove('campo-invalido');
                elementoCampo.classList.add('campo-valido');
            }
        }
    });
    
    // Retornar resultado da validação
    if (camposInvalidos.length > 0) {
        return {
            valido: false,
            mensagem: `Preencha os campos obrigatórios: ${camposInvalidos.join(', ')}`,
            campos: camposInvalidos
        };
    }
    
    return {
        valido: true,
        mensagem: 'Endereço válido',
        dados: {
            ...enderecoCliente,
            numero: elemento('numero-residencia-cliente').value.trim(),
            complemento: elemento('complemento-residencia-cliente').value.trim(),
            referencia: elemento('ponto-referencia-entrega').value.trim()
        }
    };
}

function obterEnderecoFormatado() {
    const validacao = validarEnderecoCompleto();
    
    if (!validacao.valido) {
        return null;
    }
    
    const dados = validacao.dados;
    let enderecoFormatado = '';
    
    // Formatar endereço para exibição
    if (dados.logradouro && dados.numero) {
        enderecoFormatado += `${dados.logradouro}, ${dados.numero}`;
        
        if (dados.complemento) {
            enderecoFormatado += ` - ${dados.complemento}`;
        }
        
        if (dados.bairro) {
            enderecoFormatado += ` - ${dados.bairro}`;
        }
        
        if (dados.cidade) {
            enderecoFormatado += ` - ${dados.cidade}`;
        }
        
        if (dados.cep) {
            enderecoFormatado += ` (CEP: ${dados.cep})`;
        }
        
        if (dados.referencia) {
            enderecoFormatado += ` [Ref: ${dados.referencia}]`;
        }
    }
    
    return enderecoFormatado;
}

// ===================== INTERFACE E FEEDBACK =====================
function mostrarCarregamentoCEP(mostrar) {
    const campoCEP = elemento('codigo-postal-cliente');
    const containerCEP = campoCEP?.parentElement;
    
    if (!containerCEP) return;
    
    // Remover elementos existentes
    const loadingExistente = containerCEP.querySelector('.loading-cep');
    const sucessoExistente = containerCEP.querySelector('.sucesso-cep');
    const erroExistente = containerCEP.querySelector('.erro-cep');
    
    if (loadingExistente) loadingExistente.remove();
    if (sucessoExistente) sucessoExistente.remove();
    if (erroExistente) erroExistente.remove();
    
    if (mostrar) {
        const loading = document.createElement('div');
        loading.className = 'loading-cep';
        loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando endereço...';
        loading.style.cssText = `
            font-size: 0.75rem;
            color: var(--marrom-cafe);
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        containerCEP.appendChild(loading);
    }
}

function mostrarSucessoCEP(mensagem) {
    const campoCEP = elemento('codigo-postal-cliente');
    const containerCEP = campoCEP?.parentElement;
    
    if (!containerCEP) return;
    
    mostrarCarregamentoCEP(false);
    
    const sucesso = document.createElement('div');
    sucesso.className = 'sucesso-cep';
    sucesso.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    sucesso.style.cssText = `
        font-size: 0.75rem;
        color: var(--verde-sucesso);
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    containerCEP.appendChild(sucesso);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (sucesso.parentNode) {
            sucesso.parentNode.removeChild(sucesso);
        }
    }, 5000);
}

function mostrarErroCEP(mensagem) {
    const campoCEP = elemento('codigo-postal-cliente');
    const containerCEP = campoCEP?.parentElement;
    
    if (!containerCEP) return;
    
    mostrarCarregamentoCEP(false);
    
    // Destacar campo como inválido
    campoCEP.classList.add('campo-invalido');
    campoCEP.classList.remove('campo-valido');
    
    const erro = document.createElement('div');
    erro.className = 'erro-cep';
    erro.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${mensagem}`;
    erro.style.cssText = `
        font-size: 0.75rem;
        color: var(--vermelho-alerta);
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    containerCEP.appendChild(erro);
    
    // Habilitar campos manuais
    habilitarCamposManuais();
    
    // Remover após 10 segundos
    setTimeout(() => {
        if (erro.parentNode) {
            erro.parentNode.removeChild(erro);
        }
    }, 10000);
}

function habilitarCamposManuais() {
    const camposManuais = [
        'logradouro-cliente',
        'bairro-cliente',
        'cidade-cliente'
    ];
    
    camposManuais.forEach(id => {
        const campo = elemento(id);
        if (campo) {
            campo.readOnly = false;
            campo.classList.remove('campo-leitura');
            campo.placeholder = 'Preencha manualmente';
        }
    });
}

// ===================== CONFIGURAÇÃO DE EVENTOS =====================
function configurarEventosCEP() {
    // Configurar campo de CEP
    const campoCEP = elemento('codigo-postal-cliente');
    if (campoCEP) {
        campoCEP.addEventListener('input', function() {
            formatarCodigoPostal(this);
        });
        
        campoCEP.addEventListener('blur', function() {
            const cepNumeros = this.value.replace(/\D/g, '');
            if (cepNumeros.length === 8 && !enderecoCliente.logradouro) {
                buscarEnderecoPorCodigoPostal(cepNumeros);
            }
        });
    }
    
    // Configurar campo de bairro para recalcular frete
    const campoBairro = elemento('bairro-cliente');
    if (campoBairro) {
        campoBairro.addEventListener('change', function() {
            if (this.value.trim()) {
                enderecoCliente.bairro = this.value.trim();
                calcularFretePorBairro(this.value.trim());
            }
        });
        
        campoBairro.addEventListener('blur', function() {
            if (this.value.trim() && this.value !== enderecoCliente.bairro) {
                enderecoCliente.bairro = this.value.trim();
                calcularFretePorBairro(this.value.trim());
            }
        });
    }
    
    // Configurar campo de número para validar endereço completo
    const campoNumero = elemento('numero-residencia-cliente');
    if (campoNumero) {
        campoNumero.addEventListener('change', function() {
            enderecoCliente.numero = this.value.trim();
            if (this.value.trim() && enderecoCliente.bairro) {
                calcularFretePorBairro(enderecoCliente.bairro);
            }
        });
    }
}

// ===================== FUNÇÕES PÚBLICAS =====================
function obterDadosEnderecoCliente() {
    return {
        ...enderecoCliente,
        numero: elemento('numero-residencia-cliente')?.value.trim() || '',
        complemento: elemento('complemento-residencia-cliente')?.value.trim() || '',
        referencia: elemento('ponto-referencia-entrega')?.value.trim() || '',
        enderecoCompleto: obterEnderecoFormatado() || ''
    };
}

function limparEnderecoCliente() {
    enderecoCliente = {
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: '',
        numero: '',
        complemento: '',
        referencia: ''
    };
    
    // Limpar campos no formulário
    const campos = [
        'codigo-postal-cliente',
        'logradouro-cliente',
        'bairro-cliente',
        'cidade-cliente',
        'numero-residencia-cliente',
        'complemento-residencia-cliente',
        'ponto-referencia-entrega'
    ];
    
    campos.forEach(id => {
        const campo = elemento(id);
        if (campo) {
            campo.value = '';
            campo.classList.remove('campo-valido', 'campo-invalido');
            
            if (id === 'logradouro-cliente' || id === 'bairro-cliente' || id === 'cidade-cliente') {
                campo.readOnly = true;
                campo.classList.add('campo-leitura');
                campo.placeholder = 'Será preenchido automaticamente';
            }
            
            if (id === 'numero-residencia-cliente') {
                campo.disabled = true;
                campo.placeholder = 'Digite o CEP primeiro';
            }
        }
    });
    
    // --- LIMPEZA DAS NOTIFICAÇÕES DE FRETE ---
    const divNotificacao = document.getElementById('notificacao-bairro-carrinho');
    const divResultado = document.getElementById('resultado-frete-carrinho');
    if (divNotificacao) divNotificacao.style.display = 'none';
    if (divResultado) divResultado.style.display = 'none';

    window.taxaEntregaGlobal = 0;
}

// ===================== REMOVER DESTAQUE AO DIGITAR =====================
function configurarRemocaoDestaqueCampos() {
    const campoNumero = elemento('numero-residencia-cliente');
    if (campoNumero) {
        campoNumero.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('campo-invalido');
                this.style.border = '';
                this.style.backgroundColor = '';
            }
        });
    }
    
    // Pode adicionar para outros campos também se quiser
    const campoNome = elemento('nome-cliente');
    const campoWhatsapp = elemento('whatsapp-cliente');
    
    [campoNome, campoWhatsapp].forEach(campo => {
        if (campo) {
            campo.addEventListener('input', function() {
                this.classList.remove('campo-invalido');
                this.style.border = '';
                this.style.backgroundColor = '';
            });
        }
    });
}

// Chame esta função na inicialização (no main.js)
window.configurarRemocaoDestaqueCampos = configurarRemocaoDestaqueCampos;

// ===================== EXPORTAÇÃO DE FUNÇÕES =====================
window.formatarCodigoPostal = formatarCodigoPostal;
window.buscarEnderecoPorCodigoPostal = buscarEnderecoPorCodigoPostal;
window.calcularFretePorBairro = calcularFretePorBairro;
window.obterDadosEnderecoCliente = obterDadosEnderecoCliente;
window.limparEnderecoCliente = limparEnderecoCliente;
window.validarEnderecoCompleto = validarEnderecoCompleto;
window.configurarEventosCEP = configurarEventosCEP;