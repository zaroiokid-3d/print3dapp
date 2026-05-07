let insumoSelecionado = null;

// Cadastrar insumo
document.getElementById("btnCadastrar").addEventListener("click", async () => {
    const nome = document.getElementById("nome").value;
    const categoria = document.getElementById("categoria").value;
    const unidade = document.getElementById("unidade").value;

    if (!nome || !categoria || !unidade) {
        alert("Preencha todos os campos");
        return;
    }

    const { error } = await supabase.from("insumos").insert({
        nome,
        categoria,
        unidade,
        ativo: true
    });

    if (error) {
        alert("Erro ao cadastrar insumo");
        return;
    }

    alert("Insumo cadastrado!");
    carregarInsumos();
});

// Carregar lista de insumos
async function carregarInsumos() {
    const { data } = await supabase.from("insumos").select("*");

    const tbody = document.querySelector("#tabelaInsumos tbody");
    tbody.innerHTML = "";

    data.forEach(i => {
        tbody.innerHTML += `
            <tr>
                <td>${i.nome}</td>
                <td>${i.categoria}</td>
                <td>${i.quantidade}</td>
                <td>${i.unidade}</td>
                <td>${i.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                    <button onclick="abrirModal('${i.id}', '${i.nome}')">Ajustar</button>
                </td>
            </tr>
        `;
    });
}

// Abrir modal
function abrirModal(id, nome) {
    insumoSelecionado = id;
    document.getElementById("insumoNome").innerText = nome;
    document.getElementById("ajusteModal").classList.remove("hidden");
}

// Fechar modal
function fecharModal() {
    document.getElementById("ajusteModal").classList.add("hidden");
}

// Confirmar ajuste
document.getElementById("confirmarAjuste").addEventListener("click", async () => {
    const qtd = parseFloat(document.getElementById("ajusteQtd").value);
    const tipo = document.getElementById("ajusteTipo").value;
    const motivo = document.getElementById("ajusteMotivo").value;

    if (!qtd || qtd <= 0) return alert("Quantidade inválida");

    const operador = tipo === "entrada" ? qtd : -qtd;

    // Atualizar quantidade
    await supabase.rpc("ajustar_insumo", {
        insumo_id: insumoSelecionado,
        qtd: operador
    });

    // Registrar movimentação
    await supabase.from("movimentacoes_insumos").insert({
        insumo_id: insumoSelecionado,
        tipo,
        quantidade: qtd,
        motivo
    });

    fecharModal();
    carregarInsumos();
    alert("Ajuste realizado!");
});

carregarInsumos();
