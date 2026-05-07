let filamentoSelecionado = null;

// Cadastrar filamento
document.getElementById("btnCadastrar").addEventListener("click", async () => {
    const material = document.getElementById("material").value;
    const cor = document.getElementById("cor").value;
    const pesoTotal = parseFloat(document.getElementById("pesoTotal").value);

    if (!material || !cor || !pesoTotal) {
        alert("Preencha todos os campos");
        return;
    }

    const { error } = await supabase.from("filamentos").insert({
        material,
        cor,
        peso_total: pesoTotal,
        peso_restante: pesoTotal,
        ativo: true
    });

    if (error) {
        alert("Erro ao cadastrar filamento");
        return;
    }

    alert("Filamento cadastrado!");
    carregarFilamentos();
});

// Carregar lista de filamentos
async function carregarFilamentos() {
    const { data } = await supabase.from("filamentos").select("*");

    const tbody = document.querySelector("#tabelaFilamentos tbody");
    tbody.innerHTML = "";

    data.forEach(f => {
        tbody.innerHTML += `
            <tr>
                <td>${f.material}</td>
                <td>${f.cor}</td>
                <td>${f.peso_total} g</td>
                <td>${f.peso_restante} g</td>
                <td>${f.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                    <button onclick="abrirModal('${f.id}', '${f.material} - ${f.cor}')">Ajustar</button>
                </td>
            </tr>
        `;
    });
}

// Abrir modal
function abrirModal(id, nome) {
    filamentoSelecionado = id;
    document.getElementById("filamentoNome").innerText = nome;
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

    // Atualizar peso restante
    await supabase.rpc("ajustar_filamento", {
        filamento_id: filamentoSelecionado,
        qtd: operador
    });

    // Registrar movimentação
    await supabase.from("movimentacoes_filamentos").insert({
        filamento_id: filamentoSelecionado,
        tipo,
        quantidade: qtd,
        motivo
    });

    fecharModal();
    carregarFilamentos();
    alert("Ajuste realizado!");
});

carregarFilamentos();
