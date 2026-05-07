async function carregarComissoes() {
    const { data, error } = await supabase
        .from("comissoes")
        .select("*, vendedores(nome)")
        .order("data", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    const pendentes = document.querySelector("#tabelaPendentes tbody");
    const pagas = document.querySelector("#tabelaPagas tbody");

    pendentes.innerHTML = "";
    pagas.innerHTML = "";

    data.forEach(c => {
        const linha = `
            <tr>
                <td>${c.vendedores.nome}</td>
                <td>R$ ${c.valor.toFixed(2)}</td>
                <td>${new Date(c.data).toLocaleString()}</td>
                ${
                    c.pago
                    ? ""
                    : `<td><button onclick="pagar('${c.id}')">Pagar</button></td>`
                }
            </tr>
        `;

        if (c.pago) {
            pagas.innerHTML += linha;
        } else {
            pendentes.innerHTML += linha;
        }
    });
}

async function pagar(id) {
    await supabase.from("comissoes").update({
        pago: true
    }).eq("id", id);

    alert("Comissão marcada como paga!");
    carregarComissoes();
}

carregarComissoes();
