// ===============================
// PROTEÇÃO DO PAINEL ADMIN
// ===============================

async function protectAdmin() {
    // Recupera sessão salva localmente
    const localSession = JSON.parse(localStorage.getItem("adminSession"));

    // Se não houver sessão local → volta para login
    if (!localSession) {
        window.location.href = "login.html";
        return;
    }

    // Confirma sessão válida com Supabase
    const { data, error } = await supabase.auth.getSession();

    if (!data.session) {
        localStorage.removeItem("adminSession");
        window.location.href = "login.html";
        return;
    }

    const user = data.session.user;

    // ===============================
    // 🔐 REGRA TEMPORÁRIA DE ADMIN
    // Somente este e-mail pode acessar o painel
    // ===============================
    const adminEmail = "cesmenezes1683@gmail.com";

    if (user.email !== adminEmail) {
        // Se não for admin, bloqueia acesso
        window.location.href = "login.html";
        return;
    }

    // Atualiza sessão local (garante dados atualizados)
    localStorage.setItem("adminSession", JSON.stringify(data.session));
}

protectAdmin();


// ===============================
// TOPBAR: Nome e Avatar
// ===============================

const adminSession = JSON.parse(localStorage.getItem("adminSession"));

if (adminSession) {
    const nome = adminSession.user.email; // Sem metadata por enquanto
    document.getElementById("topbar-username").innerText = "Olá, " + nome;

    // Avatar padrão (metadata será implementado depois)
    const avatarUrl = adminSession.user.user_metadata?.avatar_url;
    if (avatarUrl) {
        document.getElementById("topbar-avatar").src = avatarUrl;
    }
}


// ===============================
// LOGOUT
// ===============================

document.getElementById("menu-logout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("adminSession");
    window.location.href = "login.html";
});

