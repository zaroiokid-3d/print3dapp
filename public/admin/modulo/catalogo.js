// Cadastrar produto
document.getElementById("btnCadastrar").addEventListener("click", async () => {
    const nome = document.getElementById("nome").value;
    const categoria = document.getElementById("categoria").value;
    const preco = parseFloat(document.getElementById("preco").value);

    if (!nome || !categoria || !preco) {
        alert("Preencha todos os campos");
        return;
    }

    const { error } = await supabase.from("produtos").insert({
        nome,
        categoria,
        preco,
        ativo: true
    });

    if (error) {
        alert("Erro ao cadastrar produto");
        return;
    }

    alert("Produto cadastrado!");
    carregarProdutos();
});

// Carregar lista de produtos
async function carregarProdutos() {
    const { data } = await supabase.from("produtos").select("*");

    const tbody = document.querySelector("#tabelaProdutos tbody");
    tbody.innerHTML = "";

    data.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.nome}</td>
                <td>${p.categoria}</td>
                <td>R$ ${p.preco.toFixed(2)}</td>
                <td>${p.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                    <button onclick="toggleProduto('${p.id}', ${p.ativo})">
                        ${p.ativo ? "Desativar" : "Ativar"}
                    </button>
                </td>
            </tr>
        `;
    });
}

// Ativar / Desativar produto
async function toggleProduto(id, statusAtual) {
    await supabase.from("produtos").update({
        ativo: !statusAtual
    }).eq("id", id);

    carregarProdutos();
}

carregarProdutos();
