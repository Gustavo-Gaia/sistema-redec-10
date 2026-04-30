console.log("🚀 REDEC extensão carregada");

const CNPJ_PADRAO = "28176998000441";
const MAX_TENTATIVAS = 20;
let tentativas = 0;

// ---------------- HELPERS ----------------
function log(...args) {
  console.log("🔎 [REDEC]", ...args);
}

function dispararEventos(el) {
  ["input", "change", "keyup", "blur"].forEach(evt => {
    el.dispatchEvent(new Event(evt, { bubbles: true }));
  });
}

function encontrarCampo(possibilidades) {
  for (const seletor of possibilidades) {
    const el = document.querySelector(seletor);
    if (el) return el;
  }
  return null;
}

// ---------------- RENAVAM ----------------
function obterRenavam() {
  return new Promise((resolve) => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["renavam_sync"], (res) => {
          if (res?.renavam_sync) {
            log("Renavam via chrome:", res.renavam_sync);
            return resolve(res.renavam_sync);
          }

          const local = localStorage.getItem("renavam_sync");
          if (local) {
            log("Renavam via localStorage:", local);
            return resolve(local);
          }

          resolve(null);
        });
      } else {
        const local = localStorage.getItem("renavam_sync");
        resolve(local || null);
      }
    } catch (e) {
      resolve(null);
    }
  });
}

// ---------------- PREENCHIMENTO ----------------
async function tentarPreencher() {
  tentativas++;

  const campoCnpj = encontrarCampo([
    "#MultasCpfcnpj",
    "input[name='cnpj']",
    "input[id*='cnpj']",
    "input[placeholder*='CNPJ']"
  ]);

  const campoRenavam = encontrarCampo([
    "#MultasRenavam",
    "input[name='renavam']",
    "input[id*='renavam']",
    "input[placeholder*='Renavam']"
  ]);

  // 🔥 CNPJ (SEMPRE tenta)
  if (campoCnpj) {
    if (campoCnpj.value !== CNPJ_PADRAO) {
      campoCnpj.value = CNPJ_PADRAO;
      dispararEventos(campoCnpj);
      log("✅ CNPJ preenchido");
    }
  }

  // 🔥 RENAVAM (se existir)
  if (campoRenavam && !campoRenavam.value) {
    const renavam = await obterRenavam();

    if (renavam) {
      campoRenavam.value = renavam;
      dispararEventos(campoRenavam);
      log("✅ Renavam preenchido");
    } else {
      log("⚠️ Renavam não encontrado");
    }
  }

  // 🔥 SUCESSO
  if (campoCnpj || campoRenavam) {
    exibirAviso("🤖 Campos preenchidos automaticamente");
    return true;
  }

  // 🔥 RETRY CONTROLADO
  if (tentativas < MAX_TENTATIVAS) {
    log(`⏳ Tentativa ${tentativas}... aguardando DOM`);
    return false;
  }

  log("❌ Não encontrou os campos após várias tentativas");
  return true;
}

// ---------------- OBSERVER (DOM DINÂMICO) ----------------
const observer = new MutationObserver(() => {
  tentarPreencher();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// ---------------- LOOP INICIAL ----------------
const intervalo = setInterval(async () => {
  const finalizou = await tentarPreencher();

  if (finalizou) {
    clearInterval(intervalo);
  }
}, 800);

// ---------------- AVISO VISUAL ----------------
function exibirAviso(txt) {
  let div = document.getElementById("redec-aviso");

  if (!div) {
    div = document.createElement("div");
    div.id = "redec-aviso";
    div.style = `
      position:fixed;
      top:20px;
      right:20px;
      background:#1e293b;
      color:white;
      padding:12px 16px;
      border-radius:10px;
      z-index:999999;
      font-weight:bold;
      box-shadow:0 5px 15px rgba(0,0,0,0.4);
      border:2px solid #3b82f6;
      font-size:13px;
    `;
    document.body.appendChild(div);
  }

  div.innerText = txt;
}
