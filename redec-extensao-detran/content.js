// content.js
console.log("🚀 REDEC: Sincronizador via URL carregado");

const CNPJ_PADRAO = "28176998000441";
let tentativas = 0;
const MAX_TENTATIVAS = 20;

// ---------------- FUNÇÃO PARA PEGAR DADO DA URL ----------------
function obterRenavamDaURL() {
    try {
        // Buscamos o parâmetro na URL principal (a que aparece no navegador)
        const urlPrincipal = window.top.location.href;
        const urlObj = new URL(urlPrincipal);
        const renavam = urlObj.searchParams.get("renavam");
        
        if (renavam) {
            console.log("✅ Renavam capturado da URL:", renavam);
            return renavam;
        }
    } catch (e) {
        console.error("❌ Erro ao ler URL principal:", e);
    }
    return null;
}

// ---------------- LOOP DE PREENCHIMENTO ----------------
const intervalo = setInterval(() => {
    tentativas++;
    
    // Seleciona os campos (id exato do Detran-RJ)
    const campoRenavam = document.querySelector("#MultasRenavam");
    const campoCnpj = document.querySelector("#MultasCpfcnpj");

    // Se encontrou ao menos um dos campos
    if (campoCnpj || campoRenavam) {
        
        // 1. Preenche o CNPJ (sempre o mesmo)
        if (campoCnpj && campoCnpj.value !== CNPJ_PADRAO) {
            campoCnpj.value = CNPJ_PADRAO;
            campoCnpj.dispatchEvent(new Event("input", { bubbles: true }));
            campoCnpj.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("✅ CNPJ preenchido");
        }

        // 2. Preenche o Renavam (vindo da URL)
        if (campoRenavam) {
            const renavam = obterRenavamDaURL();
            if (renavam && campoRenavam.value !== renavam) {
                campoRenavam.value = renavam;
                campoRenavam.dispatchEvent(new Event("input", { bubbles: true }));
                campoRenavam.dispatchEvent(new Event("change", { bubbles: true }));
                console.log("✅ Renavam preenchido");
            }
        }

        // Se ambos estiverem preenchidos, podemos parar o loop
        if (campoCnpj?.value === CNPJ_PADRAO && (campoRenavam ? campoRenavam.value.length > 0 : true)) {
            exibirAviso("🤖 Campos preenchidos via REDEC 10");
            clearInterval(intervalo);
        }
    }

    if (tentativas >= MAX_TENTATIVAS) {
        clearInterval(intervalo);
        console.log("⏳ Fim das tentativas de busca de campos.");
    }
}, 1000);

// ---------------- AVISO VISUAL ----------------
function exibirAviso(txt) {
    let div = document.getElementById("redec-aviso");
    if (!div) {
        div = document.createElement("div");
        div.id = "redec-aviso";
        div.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0f172a;
            color: #3b82f6;
            padding: 12px 20px;
            border-radius: 12px;
            z-index: 999999;
            font-weight: bold;
            font-family: sans-serif;
            border: 2px solid #3b82f6;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(div);
    }
    div.innerText = txt;
}
