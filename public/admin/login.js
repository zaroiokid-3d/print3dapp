// login.js

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error(error);
        alert("Credenciais inválidas");
        return;
    }

    localStorage.setItem("adminSession", JSON.stringify(data.session));

    window.location.href = "dashboard.html";
});
