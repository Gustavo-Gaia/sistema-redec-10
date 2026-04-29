/* redec-extensao-detran/content.js */

const CNPJ_PADRAO = "28176998000441";
const API_URL = "https://sistema-redec-10.vercel.app/api/viaturas/sync-multas";

// 1. Tenta preencher os campos assim que a página carrega
chrome.storage.local.get(["renavam_sync"], (result) => {
  if (result.renavam_sync) {
    const intervalo = setInterval(() => {
      const campoRenavam = document.querySelector("input[name='renavam']");
      const campoCnpj = document.querySelector("input[name='cnpj']");

      if (campoRenavam && campoCnpj) {
        campoRenavam.value = result.renavam_sync;
        campoCnpj.value = CNPJ_PADRAO;
        clearInterval(intervalo);
        
        // Criar um aviso visual na tela do DETRAN
        exibirAviso("🤖 REDEC 10: Campos preenchidos. Resolva o Captcha e clique em Consultar.");
      }
    }, 1000);
  }
});

// 2. Monitora se o resultado da consulta apareceu na tela
const observer = new MutationObserver(() => {
  if (document.body.innerText.includes("Auto de Infração")) {
    enviarDadosParaOSistema();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

async function enviarDadosParaOSistema() {
  // Evitar envios duplicados na mesma sessão
  if (window.sincronizado) return;

  const multas = [];
  const renavamIdentificado = document.body.innerText.match(/Renavam:\s*(\d+)/)?.[1];

  const tabelas = [...document.querySelectorAll("table")].filter(t => t.innerText.includes("Auto de Infração"));

  tabelas.forEach(t => {
    const texto = t.innerText;
    const getField = (label) => texto.match(new RegExp(`${label}:\\s*([^\\n]+)`))?.[1]?.trim();

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

  if (multas.length >= 0) {
    window.sincronizado = true;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multas, renavam: renavamIdentificado })
      });
      
      if (res.ok) {
        exibirAviso("✅ Sucesso! Multas sincronizadas com o REDEC 10.");
        chrome.storage.local.remove("renavam_sync");
      }
    } catch (err) {
      exibirAviso("❌ Erro ao conectar com o sistema REDEC 10.");
    }
  }
}

function exibirAviso(txt) {
  let div = document.getElementById("redec-aviso");
  if (!div) {
    div = document.createElement("div");
    div.id = "redec-aviso";
    div.style = "position:fixed; top:20px; right:20px; background:#1e293b; color:white; padding:15px; border-radius:12px; z-index:99999; font-weight:bold; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); border: 2px solid #3b82f6;";
    document.body.appendChild(div);
  }
  div.innerText = txt;
}
