async function protectAdmin() {
    const session = JSON.parse(localStorage.getItem("adminSession"));

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (!data.session) {
        window.location.href = "login.html";
    }
}

protectAdmin();

// Exibir nome e avatar do usuário na topbar
const adminSession = JSON.parse(localStorage.getItem("adminSession"));

if (adminSession) {
    const nome = adminSession.user.user_metadata?.nome || adminSession.user.email;
    document.getElementById("topbar-username").innerText = "Olá, " + nome;

    const avatarUrl = adminSession.user.user_metadata?.avatar_url;
    if (avatarUrl) {
        document.getElementById("topbar-avatar").src = avatarUrl;
    }
}

// Logout
document.getElementById("btnLogout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("adminSession");
    window.location.href = "../index.html";
});
