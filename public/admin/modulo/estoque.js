let produtoSelecionado = null;

// Carregar tabela de estoque
async function carregarEstoque() {
    const { data } = await supabase.from("produtos").select("*");

    const tbody = document.querySelector("#tabelaEstoque tbody");
    tbody.innerHTML = "";

    data.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.nome}</td>
                <td>${p.estoque_central}</td>
                <td>${p.estoque_consignado}</td>
                <td>${p.estoque_producao}</td>
                <td><button onclick="abrirModal('${p.id}', '${p.nome}')">Ajustar</button></td>
            </tr>
        `;
    });
}

// Abrir modal
function abrirModal(id, nome) {
    produtoSelecionado = id;
    document.getElementById("produtoNome").innerText = nome;
    document.getElementById("ajusteModal").classList.remove("hidden");
}

// Fechar modal
function fecharModal() {
    document.getElementById("ajusteModal").classList.add("hidden");
}

// Confirmar ajuste
document.getElementById("confirmarAjuste").addEventListener("click", async () => {
    const qtd = parseInt(document.getElementById("ajusteQtd").value);
    const tipo = document.getElementById("ajusteTipo").value;
    const motivo = document.getElementById("ajusteMotivo").value;

    if (!qtd || qtd <= 0) return alert("Quantidade inválida");

    // Atualizar estoque
    const operador = tipo === "entrada" ? qtd : -qtd;

    await supabase.rpc("ajustar_estoque", {
        prod_id: produtoSelecionado,
        qtd: operador
    });

    // Registrar movimentação
    await supabase.from("movimentacoes_estoque").insert({
        produto_id: produtoSelecionado,
        tipo,
        quantidade: qtd,
        motivo
    });

    fecharModal();
    carregarEstoque();
    alert("Ajuste realizado!");
});

carregarEstoque();
