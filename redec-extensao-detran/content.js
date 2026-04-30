// content.js
console.log("🚀 REDEC: Iniciando script de preenchimento...");

const CNPJ_PADRAO = "28176998000441";

function log(msg) {
    console.log(`🔎 [REDEC] ${msg}`);
}

// Função para forçar a atualização do valor no framework do site (React/Angular/Vue)
function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
    
    // Dispara os eventos necessários para o site "notar" a mudança
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
}

async function preencherFormulario() {
    // Seletores exatos baseados no sistema do Detran-RJ
    const campoCnpj = document.getElementById("MultasCpfcnpj") || document.querySelector("input[id*='Cpfcnpj']");
    const campoRenavam = document.getElementById("MultasRenavam") || document.querySelector("input[id*='Renavam']");

    if (campoCnpj) {
        log("Campo CNPJ encontrado.");
        setNativeValue(campoCnpj, CNPJ_PADRAO);
    }

    if (campoRenavam) {
        log("Campo Renavam encontrado.");
        chrome.storage.local.get(["renavam_sync"], (res) => {
            if (res.renavam_sync) {
                setNativeValue(campoRenavam, res.renavam_sync);
                log("Renavam preenchido com sucesso.");
            }
        });
    }
}

// Executa em loop curto para garantir que pegue o carregamento do iframe
const timer = setInterval(() => {
    preencherFormulario();
}, 1000);

// Para o loop após 15 segundos para poupar memória
setTimeout(() => clearInterval(timer), 15000);
