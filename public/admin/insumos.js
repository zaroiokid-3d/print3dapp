// ===============================
// CARREGAR USUÁRIO NO TOPO
// ===============================
async function carregarUsuario() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
        document.getElementById("topbar-username").innerText = data.user.email;
    }
}
carregarUsuario();

// ===============================
// BOTÃO DE SAIR
// ===============================
document.getElementById("menu-logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("adminSession");
    window.location.href = "../login.html";
});

// ===============================
// TEMA CLARO/ESCURO
// ===============================
const themeBtn = document.getElementById("toggle-theme");

function aplicarTema() {
    const tema = localStorage.getItem("tema") || "dark";
    document.body.classList.toggle("light", tema === "light");
    themeBtn.textContent = tema === "light" ? "🌙" : "☀️";
}

themeBtn.addEventListener("click", () => {
    const atual = localStorage.getItem("tema") || "dark";
    const novo = atual === "dark" ? "light" : "dark";
    localStorage.setItem("tema", novo);
    aplicarTema();
});

aplicarTema();

// ===============================
// CADASTRAR INSUMO
// ===============================
document.getElementById("btnCadastrar").addEventListener("click", async () => {

    const nome = document.getElementById("nome").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const quantidade_total = Number(document.getElementById("quantidade_total").value);
    const preco_total = Number(document.getElementById("preco_total").value);
    const frete = Number(document.getElementById("frete").value || 0);
    const juros = Number(document.getElementById("juros").value || 0);

    if (!nome || !quantidade_total || !preco_total) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    const custo_final = preco_total + frete + juros;
    const custo_unitario = custo_final / quantidade_total;

    const payload = {
        nome,
        categoria,
        quantidade_total,
        preco_total,
        frete,
        juros,
        custo_unitario
    };

    const { error } = await supabase.from("insumos").insert([payload]);

    if (error) {
        console.error(error);
        alert("Erro ao salvar insumo: " + error.message);
    } else {
        alert("Insumo cadastrado com sucesso!");
        carregarInsumos();
    }
});

// ===============================
// LISTAR INSUMOS
// ===============================
async function carregarInsumos() {
    const tabela = document.querySelector("#tabelaInsumos tbody");
    tabela.innerHTML = "<tr><td colspan='7'>Carregando...</td></tr>";

    const { data, error } = await supabase.from("insumos").select("*");

    if (error) {
        tabela.innerHTML = "<tr><td colspan='7'>Erro ao carregar.</td></tr>";
        return;
    }

    if (!data || data.length === 0) {
        tabela.innerHTML = "<tr><td colspan='7'>Nenhum registro encontrado.</td></tr>";
        return;
    }

    tabela.innerHTML = "";

    data.forEach(insumo => {
        tabela.innerHTML += `
            <tr>
                <td>${insumo.nome}</td>
                <td>${insumo.categoria || "-"}</td>
                <td>${insumo.quantidade_total}</td>
                <td>R$ ${insumo.preco_total.toFixed(2)}</td>
                <td>R$ ${insumo.frete.toFixed(2)}</td>
                <td>R$ ${insumo.juros.toFixed(2)}</td>
                <td>R$ ${insumo.custo_unitario.toFixed(4)}</td>
            </tr>
        `;
    });
}

carregarInsumos();
