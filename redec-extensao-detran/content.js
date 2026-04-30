/* redec-extensao-detran/content.js */

const CNPJ_PADRAO = "28176998000441";
const API_URL = "https://sistema-redec-10.vercel.app/api/viaturas/sync-multas";

// ---------------- UTIL ----------------
function preencherCampo(input, valor) {
  if (!input) return;

  input.focus();
  input.value = valor;

  // dispara eventos para burlar máscaras (jquery.mask)
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new Event("keyup", { bubbles: true }));

  // fallback caso o site use jQuery internamente
  if (window.$) {
    try {
      window.$(input).val(valor).trigger("input").trigger("change");
    } catch {}
  }
}

function exibirAviso(txt, tipo = "info") {
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
      padding:15px;
      border-radius:12px;
      z-index:99999;
      font-weight:bold;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
      border: 2px solid #3b82f6;
      max-width:300px;
      font-size:13px;
    `;
    document.body.appendChild(div);
  }

  if (tipo === "erro") div.style.border = "2px solid #ef4444";
  if (tipo === "sucesso") div.style.border = "2px solid #22c55e";

  div.innerText = txt;
}

// ---------------- PREENCHIMENTO ----------------
chrome.storage.local.get(["renavam_sync"], (result) => {
  if (!result.renavam_sync) return;

  exibirAviso("🤖 REDEC 10: Preparando preenchimento...");

  const intervalo = setInterval(() => {
    // ⚠️ IDs corretos do DETRAN
    const campoRenavam = document.querySelector("#MultasRenavam");
    const campoCnpj = document.querySelector("#MultasCnpj");

    if (campoRenavam && campoCnpj) {
      preencherCampo(campoRenavam, result.renavam_sync);
      preencherCampo(campoCnpj, CNPJ_PADRAO);

      clearInterval(intervalo);

      exibirAviso(
        "🤖 REDEC 10: Campos preenchidos.\nResolva o Captcha e clique em Consultar."
      );
    }
  }, 800);
});

// ---------------- OBSERVADOR ----------------
const observer = new MutationObserver(() => {
  if (window.sincronizado) return;

  const texto = document.body.innerText;

  if (texto.includes("Auto de Infração") || texto.includes("Nada Consta")) {
    enviarDadosParaOSistema();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// ---------------- EXTRAÇÃO + ENVIO ----------------
async function enviarDadosParaOSistema() {
  if (window.sincronizado) return;

  window.sincronizado = true;

  exibirAviso("🔎 REDEC 10: Lendo dados do DETRAN...");

  try {
    const multas = [];

    const renavamIdentificado =
      document.body.innerText.match(/Renavam:\s*(\d+)/)?.[1] || null;

    const tabelas = [...document.querySelectorAll("table")].filter((t) =>
      t.innerText.includes("Auto de Infração")
    );

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
          orgao: getField("Órgão Emissor")
        });
      }
    });

    // mesmo sem multas, envia (para limpar no backend)
    const payload = {
      multas,
      renavam: renavamIdentificado
    };

    exibirAviso("📡 REDEC 10: Enviando dados para o sistema...");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Falha na API");

    const resposta = await res.json();

    exibirAviso(
      `✅ Sincronizado!\nNovas: ${resposta.resumo?.novas || 0}\nRemovidas: ${resposta.resumo?.removidas || 0}`,
      "sucesso"
    );

    chrome.storage.local.remove("renavam_sync");

  } catch (err) {
    console.error(err);
    exibirAviso("❌ Erro ao sincronizar com o sistema.", "erro");
    window.sincronizado = false; // permite tentar novamente
  }
}
