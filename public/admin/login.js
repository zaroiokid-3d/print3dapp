// login.js

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Autenticação no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Credenciais inválidas");
        return;
    }

    // Salva sessão local
    localStorage.setItem("adminSession", JSON.stringify(data.session));

    // Redireciona para o painel
    window.location.href = "dashboard.html";
});
