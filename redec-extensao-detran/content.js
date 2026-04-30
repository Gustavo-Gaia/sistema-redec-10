console.log("🚀 REDEC extensão carregada");

const CNPJ_PADRAO = "28176998000441";

// ---------------- PREENCHER CAMPOS ----------------
const intervalo = setInterval(() => {
  const campoRenavam =
    document.querySelector("#MultasRenavam");

  const campoCnpj =
    document.querySelector("#MultasCpfcnpj");

  if (campoCnpj) {
    campoCnpj.value = CNPJ_PADRAO;
    campoCnpj.dispatchEvent(new Event("input", { bubbles: true }));
    console.log("✅ CNPJ preenchido");
  }

  if (campoRenavam) {
    pegarRenavam((renavam) => {
      if (renavam) {
        campoRenavam.value = renavam;
        campoRenavam.dispatchEvent(new Event("input", { bubbles: true }));
        console.log("✅ Renavam preenchido");
      }
    });
  }

  if (campoRenavam && campoCnpj) {
    exibirAviso("🤖 Campos preenchidos automaticamente");
    clearInterval(intervalo);
  }

}, 1000);

// ---------------- PEGAR RENAVAM ----------------
function pegarRenavam(callback) {
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get(["renavam_sync"], (res) => {
      if (res?.renavam_sync) {
        console.log("📦 Renavam via chrome:", res.renavam_sync);
        callback(res.renavam_sync);
      } else {
        const local = localStorage.getItem("renavam_sync");
        if (local) {
          console.log("💾 Renavam via localStorage:", local);
          callback(local);
        } else {
          console.log("⚠️ Nenhum renavam encontrado");
        }
      }
    });
  } else {
    const local = localStorage.getItem("renavam_sync");
    if (local) {
      console.log("💾 Renavam via localStorage:", local);
      callback(local);
    }
  }
}

// ---------------- AVISO ----------------
function exibirAviso(txt) {
  let div = document.getElementById("redec-aviso");

  if (!div) {
    div = document.createElement("div");
    div.id = "redec-aviso";
    div.style =
      "position:fixed;top:20px;right:20px;background:#1e293b;color:white;padding:15px;border-radius:12px;z-index:99999;font-weight:bold;";
    document.body.appendChild(div);
  }

  div.innerText = txt;
}
