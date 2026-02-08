// address-manager.js - VERSÃO MELHORADA
window.AddressManager = {
    enderecoAtual: {},
    cepAnterior: '', // Para detectar quando CEP é removido
    
    init: function() {
        console.log('📍 AddressManager iniciando (versão melhorada)...');
        
        // Adiciona aviso informativo
        this.adicionarAvisoCEP();
        
        const campoCEP = document.getElementById('codigo-postal-cliente');
        if (campoCEP) {
            // Salva valor inicial
            this.cepAnterior = campoCEP.value;
            
            campoCEP.addEventListener('input', this.formatarCEP.bind(this));
            campoCEP.addEventListener('blur', this.validarEbuscarCEP.bind(this));
            
            // Monitora quando CEP é apagado
            campoCEP.addEventListener('change', this.verificarCEPRemovido.bind(this));
        }
        
        // Configura outros campos SEMPRE editáveis
        this.configurarCampoEditavel('logradouro-cliente', 'logradouro');
        this.configurarCampoEditavel('bairro-cliente', 'bairro');
        this.configurarCampoEditavel('cidade-cliente', 'cidade');
        this.configurarCampoEditavel('numero-residencia-cliente', 'numero');
        this.configurarCampoEditavel('complemento-residencia-cliente', 'complemento');
        this.configurarCampoEditavel('ponto-referencia-entrega', 'referencia');
        
        console.log('✅ AddressManager pronto (campos editáveis)');
    },
    
    adicionarAvisoCEP: function() {
        const containerCEP = document.getElementById('codigo-postal-cliente')?.parentElement;
        if (!containerCEP) return;
        
        // Remove aviso anterior se existir
        const avisoAnterior = containerCEP.querySelector('.aviso-cep');
        if (avisoAnterior) avisoAnterior.remove();
        
        // Adiciona novo aviso
        const aviso = document.createElement('small');
        aviso.className = 'aviso-cep';
        aviso.style.cssText = `
            display: block;
            margin-top: 5px;
            color: #666;
            font-size: 0.75rem;
            font-style: italic;
        `;
        aviso.innerHTML = '<i class="fas fa-info-circle"></i> Os dados do endereço podem ser preenchidos automaticamente por meio do CEP.';
        
        containerCEP.appendChild(aviso);
    },
    
    formatarCEP: function(event) {
        const input = event.target;
        let valor = input.value.replace(/\D/g, '');
        
        if (valor.length > 8) valor = valor.substring(0, 8);
        if (valor.length > 5) {
            valor = valor.substring(0, 5) + '-' + valor.substring(5);
        }
        
        input.value = valor;
        this.enderecoAtual.cep = valor.replace(/\D/g, '');
    },
    
    verificarCEPRemovido: function(event) {
        const cepAtual = event.target.value.replace(/\D/g, '');
        
        // Se tinha CEP antes e agora não tem mais
        if (this.cepAnterior.length === 8 && cepAtual.length < 8) {
            console.log('🗑️ CEP removido, limpando campos...');
            this.limparCamposEndereco();
        }
        
        this.cepAnterior = cepAtual;
    },
    
    limparCamposEndereco: function() {
        const camposParaLimpar = [
            'logradouro-cliente',
            'bairro-cliente', 
            'cidade-cliente'
        ];
        
        camposParaLimpar.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
                campo.placeholder = 'Preencha manualmente';
                campo.classList.remove('campo-valido', 'campo-invalido');
            }
        });
        
        // Atualiza estado
        this.enderecoAtual.logradouro = '';
        this.enderecoAtual.bairro = '';
        this.enderecoAtual.cidade = '';
    },
    
    validarEbuscarCEP: function(event) {
        const cep = event.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            this.buscarEndereco(cep);
        }
    },
    
    buscarEndereco: async function(cep) {
        console.log('🔍 AddressManager.buscarEndereco(): Buscando CEP:', cep);
        
        try {
            if (typeof buscarEnderecoPorCodigoPostal === 'function') {
                console.log('✅ Chamando buscarEnderecoPorCodigoPostal()...');
                await buscarEnderecoPorCodigoPostal(cep);
                // Após busca, garante que campos ficam editáveis
                this.tornarCamposEditaveis();
                console.log('✅ Endereço buscado e campos tornados editáveis');
            } else {
                console.error('❌ Função buscarEnderecoPorCodigoPostal não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro ao buscar CEP:', error);
        }
    },
    
    // address-manager.js - Modificar função tornarCamposEditaveis()
    tornarCamposEditaveis: function() {
        console.log('🔓 AddressManager.tornarCamposEditaveis(): Tornando campos editáveis...');
        
        const campos = [
            'logradouro-cliente',
            'bairro-cliente',
            'cidade-cliente'
        ];
        
        campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                // 🔥 MANTÉM a classe 'campo-leitura' para estilo, apenas remove readonly
                campo.readOnly = false;
                // NÃO REMOVE: campo.classList.remove('campo-leitura');
                campo.style.backgroundColor = ''; // Remove fundo cinza
                campo.placeholder = 'Pode editar este campo';
                console.log(`✅ Campo ${id} tornado editável (mantido estilo)`);
            }
        });
        
        // Habilita campo número
        const campoNumero = document.getElementById('numero-residencia-cliente');
        if (campoNumero) {
            campoNumero.disabled = false;
            campoNumero.placeholder = 'Digite o número (obrigatório)';
            console.log('✅ Campo número habilitado e tornado obrigatório');
        }
    },
    
    configurarCampoEditavel: function(idCampo, nomePropriedade) {
        const campo = document.getElementById(idCampo);
        if (campo) {
            // Remove qualquer atributo readonly/disabled
            campo.readOnly = false;
            campo.disabled = false;
            campo.classList.remove('campo-leitura');
            
            // Remove placeholder de leitura se existir
            if (idCampo === 'logradouro-cliente' || 
                idCampo === 'bairro-cliente' || 
                idCampo === 'cidade-cliente') {
                campo.placeholder = 'Digite ou será preenchido pelo CEP';
            }
            
            console.log(`✅ Campo ${idCampo} configurado como editável`);
            
            // Evento para atualizar estado
            campo.addEventListener('input', () => {
                this.enderecoAtual[nomePropriedade] = campo.value;
                console.log(`Campo ${idCampo} atualizado para:`, campo.value);
            });
            
            // Evento para validação visual
            campo.addEventListener('blur', () => {
                this.validarCampoIndividual(campo);
            });
        } else {
            console.warn(`⚠️ Campo ${idCampo} não encontrado para configuração`);
        }
    },
    
    validarCampoIndividual: function(campo) {
        const valor = campo.value.trim();
        
        if (valor) {
            campo.classList.add('campo-valido');
            campo.classList.remove('campo-invalido');
            console.log(`✅ Campo ${campo.id} válido: "${valor}"`);
        } else {
            campo.classList.remove('campo-valido');
            campo.classList.remove('campo-invalido');
            console.log(`ℹ️ Campo ${campo.id} vazio (não obrigatório)`);
        }
    },
    
    // 🔥 VALIDAÇÃO MODIFICADA: Apenas Rua, Cidade e Número obrigatórios
    validar: function() {
        console.log('🔍 AddressManager.validar(): Validando endereço...');
        
        const camposObrigatorios = [
            { id: 'logradouro-cliente', nome: 'Rua' },
            { id: 'cidade-cliente', nome: 'Cidade' },
            { id: 'numero-residencia-cliente', nome: 'Número' }
        ];
        
        let valido = true;
        let mensagensErro = [];
        
        camposObrigatorios.forEach(campo => {
            const elemento = document.getElementById(campo.id);
            const valor = elemento ? elemento.value.trim() : '';
            
            if (!valor) {
                elemento.classList.add('campo-invalido');
                valido = false;
                mensagensErro.push(campo.nome);
                console.log(`❌ Campo obrigatório faltando: ${campo.nome} (${campo.id})`);
            } else {
                elemento.classList.remove('campo-invalido');
                elemento.classList.add('campo-valido');
                console.log(`✅ Campo obrigatório preenchido: ${campo.nome} = "${valor}"`);
            }
        });
        
        // Campos NÃO obrigatórios apenas removem estilos de erro
        const camposOpcionais = [
            'codigo-postal-cliente',
            'bairro-cliente',
            'complemento-residencia-cliente',
            'ponto-referencia-entrega'
        ];
        
        camposOpcionais.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.classList.remove('campo-invalido');
            }
        });
        
        const resultado = {
            valido: valido,
            camposFaltantes: mensagensErro,
            mensagem: mensagensErro.length > 0 
                ? `Preencha: ${mensagensErro.join(', ')}` 
                : 'Endereço válido'
        };
        
        console.log('📊 Resultado da validação:', resultado);
        return resultado;
    },
    
    getEndereco: function() {
        const endereco = {
            cep: document.getElementById('codigo-postal-cliente')?.value || '',
            logradouro: document.getElementById('logradouro-cliente')?.value || '',
            bairro: document.getElementById('bairro-cliente')?.value || '',
            cidade: document.getElementById('cidade-cliente')?.value || '',
            numero: document.getElementById('numero-residencia-cliente')?.value || '',
            complemento: document.getElementById('complemento-residencia-cliente')?.value || '',
            referencia: document.getElementById('ponto-referencia-entrega')?.value || ''
        };
        
        console.log('📦 AddressManager.getEndereco():', endereco);
        return endereco;
    },
    
    // Nova função para limpar tudo
    limparTudo: function() {
        console.log('🗑️ AddressManager.limparTudo(): Limpando todos os campos...');
        
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
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
                campo.classList.remove('campo-valido', 'campo-invalido');
                
                // Restaura placeholders
                if (id === 'logradouro-cliente' || id === 'bairro-cliente' || id === 'cidade-cliente') {
                    campo.placeholder = 'Os dados podem ser preenchidos pelo CEP';
                }
                
                if (id === 'numero-residencia-cliente') {
                    campo.disabled = false;
                    campo.placeholder = 'Digite o número';
                }
                
                console.log(`✅ Campo ${id} limpo`);
            } 
        });
        
        this.enderecoAtual = {};
        this.cepAnterior = '';
        console.log('✅ Todos os campos limpos e estado resetado');
    },
    
    // 🔥 PRIMEIRA CORREÇÃO: Função para sincronizar CEP do carrinho para modal de dados
    sincronizarCEPComModalDados: function(cep) {
        console.log('🔄 AddressManager: Sincronizando CEP:', cep);
        
        const campoCEPDados = document.getElementById('codigo-postal-cliente');
        if (campoCEPDados) {
            // 1. Formatar o CEP para o campo
            let cepFormatado = cep.replace(/\D/g, '');
            if (cepFormatado.length > 5) {
                cepFormatado = cepFormatado.substring(0, 5) + '-' + cepFormatado.substring(5, 8);
            }
            
            // 2. Atualizar o valor do campo SILENCIOSAMENTE (sem disparar eventos)
            campoCEPDados.value = cepFormatado;
            this.enderecoAtual.cep = cep.replace(/\D/g, '');
            this.cepAnterior = this.enderecoAtual.cep;
            
            console.log('📝 CEP definido no campo:', cepFormatado);
            
            // 3. Em vez de disparar eventos de 'input' ou 'blur' (que causam o loop),
            // chamamos a busca de endereço DIRETAMENTE apenas uma vez.
            if (this.enderecoAtual.cep.length === 8) {
                console.log('🎯 Chamando busca direta para evitar loop...');
                this.buscarEndereco(this.enderecoAtual.cep);
            }
            
            return true;
        } else {
            console.error('❌ Campo CEP não encontrado no modal de dados');
            return false;
        }
    }
};