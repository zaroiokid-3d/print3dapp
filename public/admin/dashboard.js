// public/admin/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard carregado");

    const tituloModulo = document.getElementById("titulo-modulo");
    const container = document.getElementById("modulo-container");

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
    // TOPO: usuário e menu
    // ===============================
    async function carregarUsuario() {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error(error);
            return;
        }
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
    // SIDEBAR: troca de módulos
    // ===============================
    document.querySelectorAll(".sidebar li").forEach(item => {
        item.addEventListener("click", () => {
            const modulo = item.getAttribute("data-module");
            carregarModulo(modulo);
        });
    });

    async function carregarModulo(modulo) {
        tituloModulo.innerText = modulo.toUpperCase();

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
                container.innerHTML = "<p>Módulo não encontrado.</p>";
        }
    }

    // ===============================
    // MÓDULOS COM FORMULÁRIOS
    // ===============================

    // PRODUÇÃO (fila_impressao)
    async function carregarProducao() {
        container.innerHTML = `
            <h2>Produção (Fila de Impressão)</h2>
            <form id="form-producao" class="form-modulo">
                <input type="number" name="catalogo_peca_id" placeholder="ID Peça (catalogo_pecas)" required />
                <input type="number" name="vendedor_id" placeholder="ID Vendedor" required />
                <input type="number" name="loja_id" placeholder="ID Loja" required />
                <input type="number" name="quantidade" placeholder="Quantidade" required />
                <input type="text" name="status" placeholder="Status (ex: PENDENTE)" required />
                <button type="submit">Adicionar à fila</button>
            </form>
            <div id="lista-producao"></div>
        `;

        const form = document.getElementById("form-producao");
        const lista = document.getElementById("lista-producao");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                catalogo_peca_id: Number(formData.get("catalogo_peca_id")),
                vendedor_id: Number(formData.get("vendedor_id")),
                loja_id: Number(formData.get("loja_id")),
                quantidade: Number(formData.get("quantidade")),
                status: formData.get("status")
            };

            const { error } = await supabase.from("fila_impressao").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar produção: " + error.message);
            } else {
                form.reset();
                carregarListaProducao(lista);
            }
        });

        carregarListaProducao(lista);
    }

    async function carregarListaProducao(listaEl) {
        const { data, error } = await supabase.from("fila_impressao").select(`
            id, quantidade, status,
            catalogo_pecas (nome),
            vendedores (nome),
            lojas (nome_loja)
        `);
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar produção.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "catalogo_pecas.nome", "quantidade", "status", "vendedores.nome", "lojas.nome_loja"]);
    }

    // ESTOQUE CENTRAL (estoque_pecas)
    async function carregarEstoque() {
        container.innerHTML = `
            <h2>Estoque Central</h2>
            <form id="form-estoque" class="form-modulo">
                <input type="number" name="catalogo_peca_id" placeholder="ID Peça (catalogo_pecas)" required />
                <input type="number" name="quantidade_disponivel" placeholder="Quantidade disponível" required />
                <button type="submit">Adicionar ao estoque</button>
            </form>
            <div id="lista-estoque"></div>
        `;

        const form = document.getElementById("form-estoque");
        const lista = document.getElementById("lista-estoque");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                catalogo_peca_id: Number(formData.get("catalogo_peca_id")),
                quantidade_disponivel: Number(formData.get("quantidade_disponivel"))
            };

            const { error } = await supabase.from("estoque_pecas").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar estoque: " + error.message);
            } else {
                form.reset();
                carregarListaEstoque(lista);
            }
        });

        carregarListaEstoque(lista);
    }

    async function carregarListaEstoque(listaEl) {
        const { data, error } = await supabase.from("estoque_pecas").select(`
            id, quantidade_disponivel,
            catalogo_pecas (nome)
        `);
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar estoque.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "catalogo_pecas.nome", "quantidade_disponivel"]);
    }

    // CONSIGNAÇÃO (consignacao)
    async function carregarConsignacao() {
        container.innerHTML = `
            <h2>Consignação</h2>
            <form id="form-consignacao" class="form-modulo">
                <input type="number" name="loja_id" placeholder="ID Loja" required />
                <input type="number" name="catalogo_peca_id" placeholder="ID Peça (catalogo_pecas)" required />
                <input type="number" name="quantidade_entregue" placeholder="Quantidade entregue" required />
                <input type="number" name="quantidade_vendida" placeholder="Quantidade vendida" value="0" />
                <button type="submit">Registrar consignação</button>
            </form>
            <div id="lista-consignacao"></div>
        `;

        const form = document.getElementById("form-consignacao");
        const lista = document.getElementById("lista-consignacao");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                loja_id: Number(formData.get("loja_id")),
                catalogo_peca_id: Number(formData.get("catalogo_peca_id")),
                quantidade_entregue: Number(formData.get("quantidade_entregue")),
                quantidade_vendida: Number(formData.get("quantidade_vendida") || 0)
            };

            const { error } = await supabase.from("consignacao").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar consignação: " + error.message);
            } else {
                form.reset();
                carregarListaConsignacao(lista);
            }
        });

        carregarListaConsignacao(lista);
    }

    async function carregarListaConsignacao(listaEl) {
        const { data, error } = await supabase.from("consignacao").select(`
            id, quantidade_entregue, quantidade_vendida,
            lojas (nome_loja),
            catalogo_pecas (nome)
        `);
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar consignação.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "lojas.nome_loja", "catalogo_pecas.nome", "quantidade_entregue", "quantidade_vendida"]);
    }

    // VENDAS (vendas_externas)
    async function carregarVendas() {
        container.innerHTML = `
            <h2>Vendas</h2>
            <form id="form-vendas" class="form-modulo">
                <input type="number" name="vendedor_id" placeholder="ID Vendedor" required />
                <input type="number" name="loja_id" placeholder="ID Loja" required />
                <input type="number" name="catalogo_peca_id" placeholder="ID Peça (catalogo_pecas)" required />
                <input type="number" name="quantidade" placeholder="Quantidade" required />
                <input type="number" step="0.01" name="valor_total" placeholder="Valor total" required />
                <button type="submit">Registrar venda</button>
            </form>
            <div id="lista-vendas"></div>
        `;

        const form = document.getElementById("form-vendas");
        const lista = document.getElementById("lista-vendas");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                vendedor_id: Number(formData.get("vendedor_id")),
                loja_id: Number(formData.get("loja_id")),
                catalogo_peca_id: Number(formData.get("catalogo_peca_id")),
                quantidade: Number(formData.get("quantidade")),
                valor_total: Number(formData.get("valor_total"))
            };

            const { error } = await supabase.from("vendas_externas").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar venda: " + error.message);
            } else {
                form.reset();
                carregarListaVendas(lista);
            }
        });

        carregarListaVendas(lista);
    }

    async function carregarListaVendas(listaEl) {
        const { data, error } = await supabase.from("vendas_externas").select(`
            id, quantidade, valor_total,
            vendedores (nome),
            lojas (nome_loja),
            catalogo_pecas (nome)
        `);
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar vendas.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "vendedores.nome", "lojas.nome_loja", "catalogo_pecas.nome", "quantidade", "valor_total"]);
    }

    // VENDEDORES
    async function carregarVendedores() {
        container.innerHTML = `
            <h2>Vendedores</h2>
            <form id="form-vendedores" class="form-modulo">
                <input type="text" name="nome" placeholder="Nome" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="checkbox" name="is_admin" /> Admin
                <input type="checkbox" name="ativo" checked /> Ativo
                <button type="submit">Adicionar vendedor</button>
            </form>
            <div id="lista-vendedores"></div>
        `;

        const form = document.getElementById("form-vendedores");
        const lista = document.getElementById("lista-vendedores");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                nome: formData.get("nome"),
                email: formData.get("email"),
                is_admin: formData.get("is_admin") === "on",
                ativo: formData.get("ativo") === "on"
            };

            const { error } = await supabase.from("vendedores").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar vendedor: " + error.message);
            } else {
                form.reset();
                carregarListaVendedores(lista);
            }
        });

        carregarListaVendedores(lista);
    }

    async function carregarListaVendedores(listaEl) {
        const { data, error } = await supabase.from("vendedores").select("*");
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar vendedores.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "nome", "email", "is_admin", "ativo"]);
    }

    // LOJAS
    async function carregarLojas() {
        container.innerHTML = `
            <h2>Lojas</h2>
            <form id="form-lojas" class="form-modulo">
                <input type="text" name="nome_loja" placeholder="Nome da loja" required />
                <input type="text" name="responsavel" placeholder="Responsável" required />
                <input type="text" name="telefone" placeholder="Telefone" />
                <input type="number" name="vendedor_id" placeholder="ID Vendedor responsável" />
                <button type="submit">Adicionar loja</button>
            </form>
            <div id="lista-lojas"></div>
        `;

        const form = document.getElementById("form-lojas");
        const lista = document.getElementById("lista-lojas");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                nome_loja: formData.get("nome_loja"),
                responsavel: formData.get("responsavel"),
                telefone: formData.get("telefone"),
                vendedor_id: formData.get("vendedor_id") ? Number(formData.get("vendedor_id")) : null
            };

            const { error } = await supabase.from("lojas").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar loja: " + error.message);
            } else {
                form.reset();
                carregarListaLojas(lista);
            }
        });

        carregarListaLojas(lista);
    }

    async function carregarListaLojas(listaEl) {
        const { data, error } = await supabase.from("lojas").select(`
            id, nome_loja, responsavel, telefone,
            vendedores (nome)
        `);
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar lojas.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "nome_loja", "responsavel", "telefone", "vendedores.nome"]);
    }

    // CATÁLOGO (catalogo_pecas)
    async function carregarCatalogo() {
        container.innerHTML = `
            <h2>Catálogo de Peças</h2>
            <form id="form-catalogo" class="form-modulo">
                <input type="text" name="nome" placeholder="Nome da peça" required />
                <input type="number" step="0.01" name="peso_g" placeholder="Peso (g)" required />
                <input type="number" step="0.01" name="preco_venda" placeholder="Preço de venda" required />
                <input type="number" name="tempo_minutos" placeholder="Tempo de impressão (min)" required />
                <button type="submit">Adicionar peça</button>
            </form>
            <div id="lista-catalogo"></div>
        `;

        const form = document.getElementById("form-catalogo");
        const lista = document.getElementById("lista-catalogo");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                nome: formData.get("nome"),
                peso_g: Number(formData.get("peso_g")),
                preco_venda: Number(formData.get("preco_venda")),
                tempo_minutos: Number(formData.get("tempo_minutos"))
            };

            const { error } = await supabase.from("catalogo_pecas").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar peça: " + error.message);
            } else {
                form.reset();
                carregarListaCatalogo(lista);
            }
        });

        carregarListaCatalogo(lista);
    }

    async function carregarListaCatalogo(listaEl) {
        const { data, error } = await supabase.from("catalogo_pecas").select("*");
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar catálogo.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "nome", "peso_g", "preco_venda", "tempo_minutos"]);
    }

    // FILAMENTOS
    async function carregarFilamentos() {
        container.innerHTML = `
            <h2>Filamentos</h2>
            <form id="form-filamentos" class="form-modulo">
                <input type="text" name="tipo" placeholder="Tipo (PLA, PETG...)" required />
                <input type="text" name="cor" placeholder="Cor" required />
                <input type="number" step="0.01" name="peso_atual_g" placeholder="Peso atual (g)" required />
                <input type="number" step="0.0001" name="custo_por_grama" placeholder="Custo por grama" required />
                <button type="submit">Adicionar filamento</button>
            </form>
            <div id="lista-filamentos"></div>
        `;

        const form = document.getElementById("form-filamentos");
        const lista = document.getElementById("lista-filamentos");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                tipo: formData.get("tipo"),
                cor: formData.get("cor"),
                peso_atual_g: Number(formData.get("peso_atual_g")),
                custo_por_grama: Number(formData.get("custo_por_grama"))
            };

            const { error } = await supabase.from("filamentos").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar filamento: " + error.message);
            } else {
                form.reset();
                carregarListaFilamentos(lista);
            }
        });

        carregarListaFilamentos(lista);
    }

    async function carregarListaFilamentos(listaEl) {
        const { data, error } = await supabase.from("filamentos").select("*");
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar filamentos.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "tipo", "cor", "peso_atual_g", "custo_por_grama"]);
    }

    // INSUMOS
    async function carregarInsumos() {
        container.innerHTML = `
            <h2>Insumos</h2>
            <form id="form-insumos" class="form-modulo">
                <input type="text" name="nome" placeholder="Nome do insumo" required />
                <input type="text" name="categoria" placeholder="Categoria" />
                <input type="number" name="quantidade" placeholder="Quantidade" required />
                <input type="number" step="0.01" name="valor_unitario_compra" placeholder="Valor unitário de compra" required />
                <button type="submit">Adicionar insumo</button>
            </form>
            <div id="lista-insumos"></div>
        `;

        const form = document.getElementById("form-insumos");
        const lista = document.getElementById("lista-insumos");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                nome: formData.get("nome"),
                categoria: formData.get("categoria"),
                quantidade: Number(formData.get("quantidade")),
                valor_unitario_compra: Number(formData.get("valor_unitario_compra"))
            };

            const { error } = await supabase.from("insumos").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar insumo: " + error.message);
            } else {
                form.reset();
                carregarListaInsumos(lista);
            }
        });

        carregarListaInsumos(lista);
    }

    async function carregarListaInsumos(listaEl) {
        const { data, error } = await supabase.from("insumos").select("*");
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar insumos.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "nome", "categoria", "quantidade", "valor_unitario_compra"]);
    }

    // COMISSÕES
    async function carregarComissoes() {
        container.innerHTML = `
            <h2>Comissões</h2>
            <form id="form-comissoes" class="form-modulo">
                <input type="number" name="vendedor_id" placeholder="ID Vendedor" required />
                <input type="number" name="venda_externa_id" placeholder="ID Venda Externa" required />
                <input type="number" step="0.01" name="valor_comissao" placeholder="Valor da comissão" required />
                <input type="text" name="status_pagamento" placeholder="Status pagamento (PENDENTE/PAGO)" required />
                <button type="submit">Registrar comissão</button>
            </form>
            <div id="lista-comissoes"></div>
        `;

        const form = document.getElementById("form-comissoes");
        const lista = document.getElementById("lista-comissoes");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                vendedor_id: Number(formData.get("vendedor_id")),
                venda_externa_id: Number(formData.get("venda_externa_id")),
                valor_comissao: Number(formData.get("valor_comissao")),
                status_pagamento: formData.get("status_pagamento")
            };

            const { error } = await supabase.from("comissoes").insert([payload]);
            if (error) {
                console.error(error);
                alert("Erro ao salvar comissão: " + error.message);
            } else {
                form.reset();
                carregarListaComissoes(lista);
            }
        });

        carregarListaComissoes(lista);
    }

    async function carregarListaComissoes(listaEl) {
        const { data, error } = await supabase.from("comissoes").select(`
            id, valor_comissao, status_pagamento,
            vendedores (nome),
            vendas_externas (valor_total)
        `);
        if (error) {
            console.error(error);
            listaEl.innerHTML = "<p>Erro ao carregar comissões.</p>";
            return;
        }
        renderTabela(listaEl, data, ["id", "vendedores.nome", "vendas_externas.valor_total", "valor_comissao", "status_pagamento"]);
    }

    // CONFIGURAÇÕES
    async function carregarConfiguracoes() {
        container.innerHTML = `
            <h2>Configurações</h2>
            <p>Área reservada para ajustes futuros.</p>
        `;
    }

    // ===============================
    // RENDERIZAÇÃO DE TABELA GENÉRICA
    // ===============================
    function renderTabela(containerEl, data, colunas) {
        if (!data || data.length === 0) {
            containerEl.innerHTML = "<p>Nenhum registro encontrado.</p>";
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
        containerEl.innerHTML = html;
    }

    // Se quiser, pode carregar um módulo padrão ao abrir:
    // carregarModulo("filamentos");
});
