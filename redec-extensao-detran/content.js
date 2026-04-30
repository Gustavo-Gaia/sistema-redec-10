console.log("🚀 REDEC extensão carregada");

const CNPJ_PADRAO = "28176998000441";
const API_URL = "https://sistema-redec-10.vercel.app/api/viaturas/sync-multas";

// ---------------- PEGAR RENAVAM ----------------
function obterRenavam(callback) {
  // tenta via chrome.storage
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get(["renavam_sync"], (result) => {
      if (result?.renavam_sync) {
        console.log("✅ Renavam via chrome.storage:", result.renavam_sync);
        callback(result.renavam_sync);
      } else {
        // fallback localStorage
        const renavam = localStorage.getItem("renavam_sync");
        if (renavam) {
          console.log("✅ Renavam via localStorage:", renavam);
          callback(renavam);
        } else {
          console.log("⚠️ Nenhum renavam encontrado");
        }
      }
    });
  } else {
    // ambiente fora da extensão
    const renavam = localStorage.getItem("renavam_sync");
    if (renavam) {
      console.log("✅ Renavam via localStorage:", renavam);
      callback(renavam);
    }
  }
}

// ---------------- PREENCHER CAMPOS ----------------
obterRenavam((renavam) => {
  const intervalo = setInterval(() => {
    const campoRenavam =
      document.querySelector("#MultasRenavam") ||
      document.querySelector("input[name='renavam']");

    const campoCnpj =
      document.querySelector("#MultasCpfcnpj") ||
      document.querySelector("input[name='cnpj']");

    if (campoRenavam && campoCnpj) {
      campoRenavam.value = renavam;
      campoCnpj.value = CNPJ_PADRAO;

      // dispara eventos (IMPORTANTE por causa do mask)
      campoRenavam.dispatchEvent(new Event("input", { bubbles: true }));
      campoCnpj.dispatchEvent(new Event("input", { bubbles: true }));

      console.log("✅ Campos preenchidos automaticamente");

      exibirAviso("🤖 Campos preenchidos! Resolva o captcha.");

      clearInterval(intervalo);
    }
  }, 1000);
});

// ---------------- OBSERVAR RESULTADO ----------------
const observer = new MutationObserver(() => {
  if (document.body.innerText.includes("Auto de Infração")) {
    enviarDadosParaOSistema();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// ---------------- ENVIAR DADOS ----------------
async function enviarDadosParaOSistema() {
  if (window.sincronizado) return;

  const multas = [];
  const renavamIdentificado =
    document.body.innerText.match(/Renavam:\s*(\d+)/)?.[1];

  const tabelas = [...document.querySelectorAll("table")]
    .filter((t) => t.innerText.includes("Auto de Infração"));

  tabelas.forEach((t) => {
    const texto = t.innerText;

    const getField = (label) =>
      texto.match(new RegExp(`${label}:\\s*([^\\n]+)`))?.[1]?.trim();

    const auto = getField("Auto de Infração");

    if (auto) {
      multas.push({
        numero_auto: auto,
        data_infracao: getField("Data da Infração"),
        valor: getField("Valor a ser pago R\\$"),
        local: getField("Local da Infração"),
        orgao: getField("Órgão Emissor"),
      });
    }
  });

  window.sincronizado = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        multas,
        renavam: renavamIdentificado,
      }),
    });

    if (res.ok) {
      exibirAviso("✅ Multas sincronizadas!");
      localStorage.removeItem("renavam_sync");

      if (chrome?.storage) {
        chrome.storage.local.remove("renavam_sync");
      }
    } else {
      exibirAviso("❌ Erro ao salvar no sistema");
    }
  } catch (err) {
    exibirAviso("❌ Erro de conexão");
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
