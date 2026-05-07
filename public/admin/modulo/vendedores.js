// Hash simples de senha (não é criptografia forte, mas funciona no Supabase)
function hashSenha(senha) {
    return btoa(senha); // Base64
}

// Cadastrar vendedor
document.getElementById("btnCadastrar").addEventListener("click", async () => {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos");
        return;
    }

    const senha_hash = hashSenha(senha);

    const { error } = await supabase.from("vendedores").insert({
        nome,
        email,
        senha_hash,
        ativo: true
    });

    if (error) {
        alert("Erro ao cadastrar vendedor");
        return;
    }

    alert("Vendedor cadastrado!");
    carregarVendedores();
});

// Carregar lista de vendedores
async function carregarVendedores() {
    const { data } = await supabase.from("vendedores").select("*");

    const tbody = document.querySelector("#tabelaVendedores tbody");
    tbody.innerHTML = "";

    data.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${v.nome}</td>
                <td>${v.email}</td>
                <td>${v.ativo ? "Ativo" : "Inativo"}</td>
                <td>
                    <button onclick="toggleStatus('${v.id}', ${v.ativo})">
                        ${v.ativo ? "Desativar" : "Ativar"}
                    </button>
                </td>
            </tr>
        `;
    });
}

// Ativar / Desativar vendedor
async function toggleStatus(id, statusAtual) {
    await supabase.from("vendedores").update({
        ativo: !statusAtual
    }).eq("id", id);

    carregarVendedores();
}

carregarVendedores();
