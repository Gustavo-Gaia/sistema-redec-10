// content.js
console.log("🚀 REDEC: modo storage inteligente");

const CNPJ_PADRAO = "28176998000441";
let renavamCache = null;

// ---------------- CAPTURA NO FRAME PRINCIPAL ----------------
if (window === window.top) {
  const params = new URLSearchParams(window.location.search);
  const renavam = params.get("renavam");

  if (renavam) {
    chrome.storage.local.set({ renavam_temp: renavam });
    console.log("📦 Renavam salvo:", renavam);
  }
}

// ---------------- BUSCA DO STORAGE (UMA VEZ SÓ) ----------------
function carregarRenavam() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["renavam_temp"], (res) => {
      resolve(res?.renavam_temp || null);
    });
  });
}

// ---------------- LOOP PRINCIPAL ----------------
async function iniciar() {
  renavamCache = await carregarRenavam();

  let tentativas = 0;
  const MAX = 20;

  const interval = setInterval(() => {
    tentativas++;

    const campoRenavam = document.querySelector("#MultasRenavam");
    const campoCnpj = document.querySelector("#MultasCpfcnpj");

    if (!campoRenavam && !campoCnpj) return;

    // CNPJ
    if (campoCnpj && campoCnpj.value !== CNPJ_PADRAO) {
      campoCnpj.value = CNPJ_PADRAO;
      campoCnpj.dispatchEvent(new Event("input", { bubbles: true }));
      campoCnpj.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("✅ CNPJ preenchido");
    }

    // RENAVAM
    if (campoRenavam && renavamCache && campoRenavam.value !== renavamCache) {
      campoRenavam.value = renavamCache;
      campoRenavam.dispatchEvent(new Event("input", { bubbles: true }));
      campoRenavam.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("✅ Renavam preenchido");
    }

    // SUCESSO
    if (
      campoCnpj?.value &&
      campoRenavam?.value
    ) {
      console.log("🎉 SUCESSO TOTAL");
      clearInterval(interval);
    }

    // TIMEOUT
    if (tentativas >= MAX) {
      console.log("❌ Timeout");
      clearInterval(interval);
    }

  }, 800);
}

iniciar();
