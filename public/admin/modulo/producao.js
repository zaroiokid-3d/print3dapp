// Carregar produtos
async function carregarProdutos() {
    const { data } = await supabase.from("produtos").select("*");

    const select = document.getElementById("produtoSelect");
    select.innerHTML = "";

    data.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
    });
}

// Iniciar produção
document.getElementById("btnIniciar").addEventListener("click", async () => {
    const produto_id = document.getElementById("produtoSelect").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);

    const { error } = await supabase.from("producao").insert({
        produto_id,
        quantidade,
        status: "em_producao",
        data_inicio: new Date().toISOString()
    });

    if (error) return alert("Erro ao iniciar produção");

    alert("Produção iniciada!");
    carregarProducao();
});

// Carregar produções em andamento
async function carregarProducao() {
    const { data } = await supabase
        .from("producao")
        .select("*, produtos(nome)")
        .eq("status", "em_producao");

    const tbody = document.querySelector("#tabelaProducao tbody");
    tbody.innerHTML = "";

    data.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.produtos.nome}</td>
                <td>${p.quantidade}</td>
                <td>${p.status}</td>
                <td>${new Date(p.data_inicio).toLocaleString()}</td>
                <td><button onclick="finalizar('${p.id}', ${p.quantidade})">Finalizar</button></td>
            </tr>
        `;
    });
}

// Finalizar produção
async function finalizar(id, quantidade) {
    // Atualizar estoque
    await supabase.rpc("incrementar_estoque", {
        qtd: quantidade,
        prod_id: id
    });

    // Atualizar status
    await supabase.from("producao").update({
        status: "concluido",
        data_fim: new Date().toISOString()
    }).eq("id", id);

    alert("Produção concluída!");
    carregarProducao();
}

carregarProdutos();
carregarProducao();
