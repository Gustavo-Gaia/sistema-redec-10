console.log("🚀 REDEC extensão carregada (frame atual)");

const CNPJ_PADRAO = "28176998000441";

let tentativas = 0;
const MAX_TENTATIVAS = 30;

// ---------------- PEGAR RENAVAM ----------------
function pegarRenavam() {
  return new Promise((resolve) => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["renavam_sync"], (res) => {
          if (res?.renavam_sync) {
            console.log("📦 Renavam via chrome:", res.renavam_sync);
            resolve(res.renavam_sync);
          } else {
            const local = localStorage.getItem("renavam_sync");
            if (local) {
              console.log("💾 Renavam via localStorage:", local);
              resolve(local);
            } else {
              console.log("⚠️ Nenhum renavam encontrado");
              resolve(null);
            }
          }
        });
      } else {
        resolve(localStorage.getItem("renavam_sync"));
      }
    } catch (e) {
      resolve(null);
    }
  });
}

// ---------------- LOOP PRINCIPAL ----------------
const intervalo = setInterval(async () => {
  tentativas++;

  console.log(`🔎 [REDEC] Tentativa ${tentativas}`);

  const campoRenavam = document.querySelector("#MultasRenavam");
  const campoCnpj = document.querySelector("#MultasCpfcnpj");

  if (campoCnpj) {
    campoCnpj.value = CNPJ_PADRAO;
    campoCnpj.dispatchEvent(new Event("input", { bubbles: true }));
    campoCnpj.dispatchEvent(new Event("change", { bubbles: true }));
    console.log("✅ CNPJ preenchido");
  }

  if (campoRenavam) {
    const renavam = await pegarRenavam();

    if (renavam) {
      campoRenavam.value = renavam;
      campoRenavam.dispatchEvent(new Event("input", { bubbles: true }));
      campoRenavam.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("✅ Renavam preenchido");
    }
  }

  if (campoRenavam && campoCnpj) {
    console.log("🎉 SUCESSO TOTAL");
    exibirAviso("🤖 REDEC: Campos preenchidos automaticamente");
    clearInterval(intervalo);
  }

  if (tentativas >= MAX_TENTATIVAS) {
    console.log("❌ Timeout - campos não encontrados neste frame");
    clearInterval(intervalo);
  }

}, 1000);

// ---------------- AVISO ----------------
function exibirAviso(txt) {
  let div = document.getElementById("redec-aviso");

  if (!div) {
    div = document.createElement("div");
    div.id = "redec-aviso";
    div.style = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e293b;
      color: white;
      padding: 15px;
      border-radius: 12px;
      z-index: 99999;
      font-weight: bold;
    `;
    document.body.appendChild(div);
  }

  div.innerText = txt;
}
