document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Credenciais inválidas");
        return;
    }

    // Salva sessão
    localStorage.setItem("adminSession", JSON.stringify(data.session));

    // Redireciona
    window.location.href = "dashboard.html";
});
