console.log("🚀 REDEC extensão carregada");

const CNPJ_PADRAO = "28176998000441";
const API_URL = "https://sistema-redec-10.vercel.app/api/viaturas/sync-multas";

// ===============================
// 1. PREENCHIMENTO AUTOMÁTICO
// ===============================
chrome.storage.local.get(["renavam_sync"], (result) => {
  const renavam = result.renavam_sync;

  if (!renavam) {
    console.log("⚠️ Nenhum renavam encontrado no storage");
    return;
  }

  console.log("🔎 Renavam encontrado:", renavam);

  const intervalo = setInterval(() => {
    const campoRenavam = document.querySelector("#MultasRenavam");
    const campoCnpj = document.querySelector("#MultasCpfcnpj");

    if (campoRenavam && campoCnpj) {
      console.log("✅ Inputs encontrados");

      // Preencher
      campoRenavam.value = renavam;
      campoCnpj.value = CNPJ_PADRAO;

      // 🔥 DISPARAR EVENTOS (ESSENCIAL)
      ["input", "change", "keyup"].forEach(evt => {
        campoRenavam.dispatchEvent(new Event(evt, { bubbles: true }));
        campoCnpj.dispatchEvent(new Event(evt, { bubbles: true }));
      });

      clearInterval(intervalo);

      exibirAviso("🤖 REDEC: Campos preenchidos. Resolva o captcha.");
    } else {
      console.log("⏳ Aguardando inputs...");
    }
  }, 1000);
});

// ===============================
// 2. OBSERVER (RESULTADO)
// ===============================
const observer = new MutationObserver(() => {
  if (document.body.innerText.includes("Auto de Infração")) {
    console.log("📄 Resultado detectado");
    enviarDadosParaOSistema();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// ===============================
// 3. ENVIO PARA API
// ===============================
async function enviarDadosParaOSistema() {
  if (window.sincronizado) return;

  const multas = [];

  const renavamIdentificado =
    document.body.innerText.match(/Renavam:\s*(\d+)/)?.[1];

  const tabelas = [...document.querySelectorAll("table")]
    .filter(t => t.innerText.includes("Auto de Infração"));

  tabelas.forEach(t => {
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

  console.log("🚓 Multas encontradas:", multas);

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
      exibirAviso("✅ Multas sincronizadas com sucesso!");
      chrome.storage.local.remove("renavam_sync");
    } else {
      exibirAviso("⚠️ Erro ao enviar para API");
    }
  } catch (err) {
    console.error(err);
    exibirAviso("❌ Falha na conexão com REDEC");
  }
}

// ===============================
// 4. AVISO VISUAL
// ===============================
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
      box-shadow: 0 10px 15px rgba(0,0,0,0.5);
      border: 2px solid #3b82f6;
    `;
    document.body.appendChild(div);
  }

  div.innerText = txt;
}
