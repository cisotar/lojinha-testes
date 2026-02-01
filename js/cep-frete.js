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
async function buscarEnderecoPorCodigoPostal(cep) {
    // Validar CEP
    if (!cep || cep.length !== 8 || !/^\d+$/.test(cep)) {
        mostrarErroCEP('CEP inválido. Digite 8 números.');
        return;
    }
    
    // Mostrar indicador de carregamento
    mostrarCarregamentoCEP(true);
    
    try {
        // Fazer requisição para ViaCEP
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        
        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status}`);
        }
        
        const dados = await resposta.json();
        
        // Verificar se CEP foi encontrado
        if (dados.erro) {
            mostrarErroCEP('CEP não encontrado. Verifique o número digitado.');
            return;
        }
        
        // Preencher campos com os dados retornados
        preencherCamposEndereco(dados);
        
        // Calcular frete baseado no bairro
        if (dados.bairro) {
            calcularFretePorBairro(dados.bairro);
        }
        
        // Feedback de sucesso
        mostrarSucessoCEP('Endereço encontrado!');
        
        // Focar no campo de número
        setTimeout(() => {
            const campoNumero = elemento('numero-residencia-cliente');
            if (campoNumero) {
                campoNumero.focus();
            }
        }, 300);
        
    } catch (erro) {
        console.error('Erro ao buscar CEP:', erro);
        mostrarErroCEP('Erro ao buscar endereço. Tente novamente.');
        
        // Permitir preenchimento manual
        habilitarCamposManuais();
        
    } finally {
        // Esconder indicador de carregamento
        mostrarCarregamentoCEP(false);
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
function calcularFretePorBairro(nomeBairro) {
    // NOTA: Você precisa adicionar 'entrega' ao seus dadosIniciais!
    // Exemplo em dados.js:
    // "entrega": {
    //   "taxaGeral": 8.00,
    //   "bairros": [
    //     { "nome": "Centro", "valor": 5.00 },
    //     { "nome": "Jardins", "valor": 7.00 }
    //   ]
    // }
    
    if (!dadosIniciais.entrega) {
        console.warn('Dados de entrega não configurados em dados.js');
        // Usar taxa padrão
        estadoAplicativo.taxaEntrega = 8.00;
        estadoAplicativo.bairroEntrega = 'Taxa padrão';
        atualizarDisplayFrete(8.00, nomeBairro);
        return;
    }
    
    const dadosEntrega = dadosIniciais.entrega;
    let taxaEntrega = dadosEntrega.taxaGeral || 8.00; // Taxa padrão
    
    // Normalizar nome do bairro (remover acentos, converter para minúsculas)
    const nomeBairroNormalizado = normalizarTexto(nomeBairro);
    
    // Buscar bairro na lista
    const bairroEncontrado = dadosEntrega.bairros?.find(b => 
        normalizarTexto(b.nome) === nomeBairroNormalizado
    );
    
    // Se encontrar, usar taxa específica
    if (bairroEncontrado) {
        taxaEntrega = bairroEncontrado.valor;
        estadoAplicativo.bairroEntrega = bairroEncontrado.nome;
        console.log(`Frete para ${bairroEncontrado.nome}: R$ ${taxaEntrega.toFixed(2)}`);
    } else {
        // Usar taxa geral
        estadoAplicativo.bairroEntrega = 'Outro bairro';
        console.log(`Frete para bairro não cadastrado: R$ ${taxaEntrega.toFixed(2)} (taxa geral)`);
    }
    
    // Atualizar estado da aplicação
    estadoAplicativo.taxaEntrega = taxaEntrega;
    
    // Atualizar interface
    atualizarDisplayFrete(taxaEntrega, nomeBairro);
    
    // Atualizar resumo do carrinho se estiver aberto
    if (typeof atualizarResumoFinanceiroCarrinho === 'function') {
        atualizarResumoFinanceiroCarrinho();
    }
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .trim();
}

function atualizarDisplayFrete(taxa, bairro) {
    // Atualizar card de informação de frete
    const cardFrete = elemento('informacao-frete');
    const valorFreteElemento = elemento('valor-frete');
    
    if (cardFrete && valorFreteElemento) {
        cardFrete.style.display = 'flex';
        valorFreteElemento.textContent = formatarMoeda(taxa);
        
        // Adicionar tooltip com o bairro
        cardFrete.title = `Frete calculado para: ${bairro}`;
    }
    
    // Atualizar no modal de pagamento se estiver aberto
    const taxaPagamentoElemento = elemento('taxa-entrega-pagamento');
    if (taxaPagamentoElemento) {
        taxaPagamentoElemento.textContent = formatarMoeda(taxa);
    }
}

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
            
            // Restaurar campos de leitura
            if (id === 'logradouro-cliente' || id === 'bairro-cliente' || id === 'cidade-cliente') {
                campo.readOnly = true;
                campo.classList.add('campo-leitura');
                campo.placeholder = 'Será preenchido automaticamente';
            }
            
            // Habilitar campo de número
            if (id === 'numero-residencia-cliente') {
                campo.disabled = true;
                campo.placeholder = 'Digite o CEP primeiro';
            }
        }
    });
    
    // Ocultar card de frete
    const cardFrete = elemento('informacao-frete');
    if (cardFrete) {
        cardFrete.style.display = 'none';
    }
}

// ===================== EXPORTAÇÃO DE FUNÇÕES =====================
window.formatarCodigoPostal = formatarCodigoPostal;
window.buscarEnderecoPorCodigoPostal = buscarEnderecoPorCodigoPostal;
window.calcularFretePorBairro = calcularFretePorBairro;
window.obterDadosEnderecoCliente = obterDadosEnderecoCliente;
window.limparEnderecoCliente = limparEnderecoCliente;
window.validarEnderecoCompleto = validarEnderecoCompleto;
window.configurarEventosCEP = configurarEventosCEP;