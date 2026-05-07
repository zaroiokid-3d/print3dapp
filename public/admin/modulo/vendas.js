async function carregarVendas() {
    const { data } = await supabase
        .from("vendas")
        .select("*, vendedores(nome), produtos(nome)")
        .order("data", { ascending: false });

    const tbody = document.querySelector("#tabelaVendas tbody");
    tbody.innerHTML = "";

    data.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${v.vendedores.nome}</td>
                <td>${v.produtos.nome}</td>
                <td>${v.quantidade}</td>
                <td>R$ ${v.valor_total.toFixed(2)}</td>
                <td>${new Date(v.data).toLocaleString()}</td>
            </tr>
        `;
    });
}

carregarVendas();
async function registrarVenda(produtoId, quantidade, preco) {
    const vendedor = JSON.parse(localStorage.getItem("vendedorSession"));

    // Registrar venda
    const { data, error } = await supabase.from("vendas").insert({
        vendedor_id: vendedor.user.id,
        produto_id: produtoId,
        quantidade,
        valor_total: quantidade * preco
    });

    if (error) {
        alert("Erro ao registrar venda");
        return;
    }

    // Baixar do consignado
    await supabase.from("consignacao").insert({
        vendedor_id: vendedor.user.id,
        produto_id: produtoId,
        quantidade: -quantidade
    });

    // Registrar comissão (10%)
    await supabase.from("comissoes").insert({
        venda_id: data[0].id,
        vendedor_id: vendedor.user.id,
        valor: (quantidade * preco) * 0.10
    });

    alert("Venda registrada!");
}
