// protect.js — versão corrigida

async function protectAdmin() {
    // Aguarda Supabase carregar
    if (!window.supabase) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const localSession = JSON.parse(localStorage.getItem("adminSession"));

    if (!localSession) {
        window.location.href = "login.html";
        return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
        localStorage.removeItem("adminSession");
        window.location.href = "login.html";
        return;
    }

    const user = data.session.user;
    const adminEmail = "cesmenezes1683@gmail.com";

    if (user.email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
        localStorage.removeItem("adminSession");
        window.location.href = "login.html";
        return;
    }

    localStorage.setItem("adminSession", JSON.stringify(data.session));
}

protectAdmin();
