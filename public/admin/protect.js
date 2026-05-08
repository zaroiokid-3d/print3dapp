async function protectAdmin() {
    // Recupera sessão local
    const localSession = JSON.parse(localStorage.getItem("adminSession"));

    if (!localSession) {
        window.location.href = "login.html";
        return;
    }

    // Valida sessão com Supabase
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
        localStorage.removeItem("adminSession");
        window.location.href = "login.html";
        return;
    }

    const user = data.session.user;

    // Admin permitido
    const adminEmail = "cesmenezes1683@gmail.com";

    if (user.email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
        localStorage.removeItem("adminSession");
        window.location.href = "login.html";
        return;
    }

    // Atualiza sessão local
    localStorage.setItem("adminSession", JSON.stringify(data.session));
}

protectAdmin();
