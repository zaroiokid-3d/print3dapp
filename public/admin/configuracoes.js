async function carregarConfiguracoes() {
    const { data } = await supabase.from("configuracoes").select("*");

    const get = chave => data.find(c => c.chave === chave)?.valor;

    document.getElementById("percentualComissao").value = parseFloat(get("percentual_comissao")) * 100;
    document.getElementById("pesoPadrao").value = get("peso_padrao_consumo");
    document.getElementById("nomeEmpresa").value = get("nome_empresa");
    document.getElementById("emailSuporte").value = get("email_suporte");
    document.getElementById("temaDashboard").value = get("tema_dashboard");
}

async function salvarConfiguracoes() {
    const updates = [
        { chave: "percentual_comissao", valor: (parseFloat(document.getElementById("percentualComissao").value) / 100).toString() },
        { chave: "peso_padrao_consumo", valor: document.getElementById("pesoPadrao").value },
        { chave: "nome_empresa", valor: document.getElementById("nomeEmpresa").value },
        { chave: "email_suporte", valor: document.getElementById("emailSuporte").value },
        { chave: "tema_dashboard", valor: document.getElementById("temaDashboard").value }
    ];

    for (const item of updates) {
        await supabase.from("configuracoes").update({ valor: item.valor }).eq("chave", item.chave);
    }

    alert("Configurações salvas!");
}

document.getElementById("btnSalvar").addEventListener("click", salvarConfiguracoes);

carregarConfiguracoes();
