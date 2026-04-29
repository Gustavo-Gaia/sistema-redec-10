/* redec-extensao/content.js */

// 1. pegar dados enviados pelo seu sistema
chrome.storage.local.get(["renavam", "cnpj"], (data) => {
  if (!data.renavam) return;

  preencherCampos(data);
});

function preencherCampos({ renavam, cnpj }) {
  const intervalo = setInterval(() => {
    const campoRenavam = document.querySelector("input[name='renavam']");
    const campoCnpj = document.querySelector("input[name='cnpj']");

    if (campoRenavam && campoCnpj) {
      campoRenavam.value = renavam;
      campoCnpj.value = cnpj;

      clearInterval(intervalo);

      alert("Resolva o captcha e clique em consultar");
    }
  }, 1000);
}

// 2. detectar quando resultado aparecer
const observer = new MutationObserver(() => {
  if (document.body.innerText.includes("Auto de Infração")) {
    enviarMultas();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

function enviarMultas() {
  const multas = [];

  const renavam = document.body.innerText.match(/Renavam:\s*(\d+)/)?.[1];

  const tabelas = [...document.querySelectorAll("table")]
    .filter(t => t.innerText.includes("Auto de Infração"));

  tabelas.forEach(t => {
    const texto = t.innerText;

    const get = (label) =>
      texto.match(new RegExp(`${label}:\\s*([^\\n]+)`))?.[1]?.trim();

    const auto = get("Auto de Infração");

    if (auto) {
      multas.push({
        numero_auto: auto,
        data_infracao: get("Data da Infração"),
        valor: get("Valor a ser pago R\\$"),
        local: get("Local da Infração"),
        orgao: get("Órgão Emissor")
      });
    }
  });

  fetch("https://sistema-redec-10.vercel.app/api/viaturas/sync-multas", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ multas, renavam })
  });

  alert("Multas sincronizadas automaticamente!");
}
