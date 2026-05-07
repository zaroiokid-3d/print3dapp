const supabaseClient = supabase;


let vendedorAtual = null;

// LOGIN
document.getElementById("btn-login").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("login-msg");

  msg.textContent = "";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg.textContent = "Erro ao entrar: " + error.message;
    return;
  }

  await carregarVendedorAtual();
});

// LOGOUT
document.getElementById("btn-logout").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  vendedorAtual = null;
  document.getElementById("app-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
});

// TABS
document.querySelectorAll(".tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    const tabId = "tab-" + btn.dataset.tab;
    document.getElementById(tabId).classList.add("active");
  });
});

// CARREGAR VENDEDOR LOGADO
async function carregarVendedorAtual() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data, error } = await supabaseClient
    .from("vendedores")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    document.getElementById("login-msg").textContent = "Usuário sem perfil de vendedor.";
    return;
  }

  vendedorAtual = data;
  document.getElementById("vendedor-nome").textContent = `Olá, ${data.nome}`;
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("app-section").classList.remove("hidden");

  await Promise.all([
    carregarLojas(),
    carregarProdutos(),
    carregarComissoes()
  ]);
}

// LOJAS
async function carregarLojas() {
  const { data, error } = await supabaseClient
    .from("lojas")
    .select("*")
    .eq("vendedor_id", vendedorAtual.id);

  const lista = document.getElementById("lista-lojas");
  const selectVenda = document.getElementById("venda-loja");
  const selectPedido = document.getElementById("pedido-loja");

  lista.innerHTML = "";
  selectVenda.innerHTML = "";
  selectPedido.innerHTML = "";

  if (error || !data || data.length === 0) {
    lista.innerHTML = "<p>Nenhuma loja cadastrada.</p>";
    return;
  }

  data.forEach(loja => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${loja.nome_loja}</strong><br>${loja.endereco || ""}`;
    lista.appendChild(div);

    const opt1 = document.createElement("option");
    opt1.value = loja.id;
    opt1.textContent = loja.nome_loja;
    selectVenda.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = loja.id;
    opt2.textContent = loja.nome_loja;
    selectPedido.appendChild(opt2);
  });
}

// PRODUTOS
async function carregarProdutos() {
  const { data, error } = await supabaseClient
    .from("catalogo_pecas")
    .select("*")
    .eq("ativo", true);

  const selectVenda = document.getElementById("venda-produto");
  const selectPedido = document.getElementById("pedido-produto");

  selectVenda.innerHTML = "";
  selectPedido.innerHTML = "";

  if (error || !data || data.length === 0) {
    selectVenda.innerHTML = "<option>Nenhum produto</option>";
    selectPedido.innerHTML = "<option>Nenhum produto</option>";
    return;
  }

  data.forEach(prod => {
    const opt1 = document.createElement("option");
    opt1.value = prod.id;
    opt1.textContent = prod.nome;
    selectVenda.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = prod.id;
    opt2.textContent = prod.nome;
    selectPedido.appendChild(opt2);
  });
}

// REGISTRAR VENDA
document.getElementById("btn-salvar-venda").addEventListener("click", async () => {
  const loja_id = document.getElementById("venda-loja").value;
  const catalogo_id = document.getElementById("venda-produto").value;
  const quantidade = parseInt(document.getElementById("venda-quantidade").value || "1", 10);
  const valor_total = parseFloat(document.getElementById("venda-valor").value || "0");
  const msg = document.getElementById("venda-msg");

  msg.textContent = "";

  const { error } = await supabaseClient.from("vendas_externas").insert({
    vendedor_id: vendedorAtual.id,
    loja_id,
    catalogo_id,
    quantidade,
    valor_total
  });

  if (error) {
    msg.textContent = "Erro ao registrar venda: " + error.message;
    return;
  }

  msg.textContent = "Venda registrada com sucesso!";
  await carregarComissoes();
});

// PEDIDO DE IMPRESSÃO
document.getElementById("btn-salvar-pedido").addEventListener("click", async () => {
  const loja_id = document.getElementById("pedido-loja").value;
  const catalogo_id = document.getElementById("pedido-produto").value;
  const quantidade = parseInt(document.getElementById("pedido-quantidade").value || "1", 10);
  const msg = document.getElementById("pedido-msg");

  msg.textContent = "";

  const { error } = await supabaseClient.from("fila_impressao").insert({
    vendedor_id: vendedorAtual.id,
    loja_id,
    catalogo_id,
    quantidade,
    status: "Pendente"
  });

  if (error) {
    msg.textContent = "Erro ao solicitar impressão: " + error.message;
    return;
  }

  msg.textContent = "Pedido de impressão enviado!";
});

// COMISSÕES
async function carregarComissoes() {
  const { data, error } = await supabaseClient
    .from("comissoes")
    .select(`
      id, valor_comissao, status_pagamento,
      vendas_externas (valor_total, data_venda)
    `)
    .eq("vendedor_id", vendedorAtual.id);

  const lista = document.getElementById("lista-comissoes");
  lista.innerHTML = "";

  if (error || !data || data.length === 0) {
    lista.innerHTML = "<p>Nenhuma comissão encontrada.</p>";
    return;
  }

  let total = 0;

  data.forEach(c => {
    total += c.valor_comissao || 0;
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <strong>R$ ${c.valor_comissao?.toFixed(2) || "0,00"}</strong><br>
      Venda: R$ ${c.vendas_externas?.valor_total?.toFixed(2) || "0,00"}<br>
      Status: ${c.status_pagamento}
    `;
    lista.appendChild(div);
  });

  const resumo = document.createElement("p");
  resumo.innerHTML = `<strong>Total em comissões: R$ ${total.toFixed(2)}</strong>`;
  lista.appendChild(resumo);
}

// AUTOLOGIN SE JÁ TIVER SESSÃO
(async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (user) {
    await carregarVendedorAtual();
  }
})();
