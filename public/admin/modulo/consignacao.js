let vendedorSelecionado = null;

// Carregar vendedores
async function carregarVendedores() {
    const { data } = await supabase.from("vendedores").select("*");

    const select = document.getElementById("vendedorSelect");
    select.innerHTML = "";

    data.forEach(v => {
        select.innerHTML += `<option value="${v.id}">${v.nome}</option>`;
    });

    vendedorSelecionado = select.value;
    carregarConsignado();
}

// Carregar produtos
async function carregarProdutos() {
    const { data } = await supabase.from("produtos").select("*");

    const select = document.getElementById("produtoSelect");
    select.innerHTML = "";

    data.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
    });
}

// Enviar para consignação
document.getElementById("btnEnviar").addEventListener("click", async () => {
    const produto_id = document.getElementById("produtoSelect").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);

    // Atualizar estoque central
    await supabase.rpc("ajustar_estoque", {
        prod_id: produto_id,
        qtd: -quantidade
    });

    // Registrar consignação
    await supabase.from("consignacao").insert({
        vendedor_id: vendedorSelecionado,
        produto_id,
        quantidade
    });

    // Registrar movimentação
    await supabase.from("movimentacoes_consignacao").insert({
        vendedor_id: vendedorSelecionado,
        produto_id,
        tipo: "envio",
        quantidade
    });

    alert("Produto enviado para consignação!");
    carregarConsignado();
});

// Registrar devolução
document.getElementById("btnDevolver").addEventListener("click", async () => {
    const produto_id = document.getElementById("produtoSelect").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);

    // Atualizar estoque central
    await supabase.rpc("ajustar_estoque", {
        prod_id: produto_id,
        qtd: quantidade
    });

    // Registrar devolução
    await supabase.from("consignacao").insert({
        vendedor_id: vendedorSelecionado,
        produto_id,
        quantidade: -quantidade
    });

    // Registrar movimentação
    await supabase.from("movimentacoes_consignacao").insert({
        vendedor_id: vendedorSelecionado,
        produto_id,
        tipo: "devolucao",
        quantidade
    });

    alert("Devolução registrada!");
    carregarConsignado();
});

// Carregar estoque consignado do vendedor
async function carregarConsignado() {
    const { data } = await supabase
        .from("consignacao")
        .select("*, produtos(nome)")
        .eq("vendedor_id", vendedorSelecionado);

    const tbody = document.querySelector("#tabelaConsignado tbody");
    tbody.innerHTML = "";

    data.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.produtos.nome}</td>
                <td>${c.quantidade}</td>
            </tr>
        `;
    });
}

document.getElementById("vendedorSelect").addEventListener("change", (e) => {
    vendedorSelecionado = e.target.value;
    carregarConsignado();
});

carregarVendedores();
carregarProdutos();
