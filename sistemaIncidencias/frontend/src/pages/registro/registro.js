const API_URL = "http://localhost:3000/api";
let areas = [];

async function getAreas() {
    try {
        const response = await fetch(`${API_URL}/areas`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ocurrió un error al recuperar las áreas', error);
        return [];
    }
}

function poblarSelectAreas() {
    const select = document.getElementById('area');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Selecciona un área</option>';
    areas.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id_area;
        opt.textContent = a.descripcion;
        select.appendChild(opt);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    areas = await getAreas();

    poblarSelectAreas();

    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const rol = document.getElementById("rol").value;
        const area = document.getElementById("area").value;

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden. Por favor, inténtelo de nuevo.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    usuario: email,
                    contrasenia: password,
                    rol,
                    area
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.mensaje || "No se pudo registrar el usuario.");
                return;
            }

            alert("Usuario registrado exitosamente. Ahora puede iniciar sesión.");
            window.location.href = "../../index.html";
        } catch (error) {
            console.error("🚀 ~ register ~ error:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
});

//En un caso real el propio USER NO DEBERIA, poder elegir rol y area. Un admin tiene que hacer eso.