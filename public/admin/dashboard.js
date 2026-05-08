document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard carregado");

    // ===============================
    // TOPO: usuário e menu
    // ===============================
    async function carregarUsuario() {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (user) {
            document.getElementById("topbar-username").innerText = user.email;
        }
    }

    carregarUsuario();

    const avatar = document.getElementById("topbar-avatar");
    const dropdown = document.getElementById("dropdown-menu");
    const logoutBtn = document.getElementById("menu-logout");

    avatar.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
    });

    logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("adminSession");
        window.location.href = "login.html";
    });

    // ===============================
    // CARREGAMENTO DE MÓDULOS
    // ===============================
    document.querySelectorAll(".sidebar li").forEach(item => {
        item.addEventListener("click", () => {
            const modulo = item.getAttribute("data-module");
            carregarModulo(modulo);
        });
    });

    async function carregarModulo(modulo) {
        document.getElementById("titulo-modulo").innerText = modulo.toUpperCase();

        switch (modulo) {
            case "producao":
                return carregarProducao();
            case "estoque":
                return carregarEstoque();
            case "consignacao":
                return carregarConsignacao();
            case "vendas":
                return carregarVendas();
            case "vendedores":
                return carregarVendedores();
            case "lojas":
                return carregarLojas();
            case "catalogo":
                return carregarCatalogo();
            case "filamentos":
                return carregarFilamentos();
            case "insumos":
                return carregarInsumos();
            case "comissoes":
                return carregarComissoes();
            case "config":
                return carregarConfiguracoes();
            default:
                document.getElementById("modulo-container").innerHTML = "<p>Módulo não encontrado.</p>";
        }
    }

    // ===============================
    // MÓDULOS DO DASHBOARD
    // ===============================

    async function carregarProducao() {
        const { data, error } = await supabase.from("fila_impressao").select(`
            id, quantidade, status,
            catalogo_pecas (nome),
            vendedores (nome),
            lojas (nome_loja)
        `);

        if (error) {
            console.error(error);
        }

        renderTabela(data, ["id", "catalogo_pecas.nome", "quantidade", "status", "vendedores.nome", "lojas.nome_loja"]);
    }

    async function carregarEstoque() {
        const { data, error } = await supabase.from("estoque_pecas").select(`
            id, quantidade_disponivel,
            catalogo_pecas (nome)
        `);

        if (error) console.error(error);

        renderTabela(data, ["id", "catalogo_pecas.nome", "quantidade_disponivel"]);
    }

    async function carregarConsignacao() {
        const { data, error } = await supabase.from("consignacao").select(`
            id, quantidade_entregue, quantidade_vendida,
            lojas (nome_loja),
            catalogo_pecas (nome)
        `);

        if (error) console.error(error);

        renderTabela(data, ["id", "lojas.nome_loja", "catalogo_pecas.nome", "quantidade_entregue", "quantidade_vendida"]);
    }

    async function carregarVendas() {
        const { data, error } = await supabase.from("vendas_externas").select(`
            id, quantidade, valor_total,
            vendedores (nome),
            lojas (nome_loja),
            catalogo_pecas (nome)
        `);

        if (error) console.error(error);

        renderTabela(data, ["id", "vendedores.nome", "lojas.nome_loja", "catalogo_pecas.nome", "quantidade", "valor_total"]);
    }

    async function carregarVendedores() {
        const { data, error } = await supabase.from("vendedores").select("*");
        if (error) console.error(error);
        renderTabela(data, ["id", "nome", "email", "is_admin", "ativo"]);
    }

    async function carregarLojas() {
        const { data, error } = await supabase.from("lojas").select(`
            id, nome_loja, responsavel, telefone,
            vendedores (nome)
        `);

        if (error) console.error(error);

        renderTabela(data, ["id", "nome_loja", "responsavel", "telefone", "vendedores.nome"]);
    }

    async function carregarCatalogo() {
        const { data, error } = await supabase.from("catalogo_pecas").select("*");
        if (error) console.error(error);
        renderTabela(data, ["id", "nome", "peso_g", "preco_venda", "tempo_minutos"]);
    }

    async function carregarFilamentos() {
        const { data, error } = await supabase.from("filamentos").select("*");
        if (error) console.error(error);
        renderTabela(data, ["id", "tipo", "cor", "peso_atual_g", "custo_por_grama"]);
    }

    async function carregarInsumos() {
        const { data, error } = await supabase.from("insumos").select("*");
        if (error) console.error(error);
        renderTabela(data, ["id", "nome", "categoria", "quantidade", "valor_unitario_compra"]);
    }

    async function carregarComissoes() {
        const { data, error } = await supabase.from("comissoes").select(`
            id, valor_comissao, status_pagamento,
            vendedores (nome),
            vendas_externas (valor_total)
        `);

        if (error) console.error(error);

        renderTabela(data, ["id", "vendedores.nome", "vendas_externas.valor_total", "valor_comissao", "status_pagamento"]);
    }

    async function carregarConfiguracoes() {
        document.getElementById("modulo-container").innerHTML = "<p>Configurações em desenvolvimento.</p>";
    }

    // ===============================
    // RENDERIZAÇÃO DE TABELA
    // ===============================
    function renderTabela(data, colunas) {
        if (!data || data.length === 0) {
            document.getElementById("modulo-container").innerHTML = "<p>Nenhum registro encontrado.</p>";
            return;
        }

        let html = "<table><thead><tr>";

        colunas.forEach(c => html += `<th>${c}</th>`);
        html += "</tr></thead><tbody>";

        data.forEach(row => {
            html += "<tr>";
            colunas.forEach(c => {
                const partes = c.split(".");
                let valor = row;

                partes.forEach(p => valor = valor?.[p]);

                html += `<td>${valor ?? ""}</td>`;
            });
            html += "</tr>";
        });

        html += "</tbody></table>";

        document.getElementById("modulo-container").innerHTML = html;
    }

    // opcional: carregar um módulo padrão ao abrir
    // carregarModulo("filamentos");
});
