// Cadastrar loja
document.getElementById("btnCadastrarLoja").addEventListener("click", async () => {
    const nome = document.getElementById("nomeLoja").value;
    const endereco = document.getElementById("enderecoLoja").value;

    if (!nome || !endereco) {
        alert("Preencha todos os campos");
        return;
    }

    const { error } = await supabase.from("lojas").insert({
        nome,
        endereco,
        ativo: true
    });

    if (error) {
        alert("Erro ao cadastrar loja");
        return;
    }

    alert("Loja cadastrada!");
    carregarLojas();
});

// Carregar lista de lojas
async function carregarLojas() {
    const { data } = await supabase.from("lojas").select("*");

    const tbody = document.querySelector("#tabelaLojas tbody");
    tbody.innerHTML = "";

    data.forEach(l => {
        tbody.innerHTML += `
            <tr>
                <td>${l.nome}</td>
                <td>${l.endereco}</td>
                <td>${l.ativo ? "Ativa" : "Inativa"}</td>
                <td>
                    <button onclick="toggleLoja('${l.id}', ${l.ativo})">
                        ${l.ativo ? "Desativar" : "Ativar"}
                    </button>
                </td>
            </tr>
        `;
    });
}

// Ativar / Desativar loja
async function toggleLoja(id, statusAtual) {
    await supabase.from("lojas").update({
        ativo: !statusAtual
    }).eq("id", id);

    carregarLojas();
}

carregarLojas();
