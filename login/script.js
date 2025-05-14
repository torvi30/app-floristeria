const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");

signupBtn.onclick = (() => {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
});

loginBtn.onclick = (() => {
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
});

signupLink.onclick = (() => {
  signupBtn.click();
  return false;
});

// Validar que las contraseñas coincidan
function validatePasswordMatch(password, confirmPassword) {
  return password === confirmPassword;
}

// Función para registrar un usuario en la base de datos
async function registerUser(email, username, password ) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/register/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      cleanValues()
      Swal.fire("Registro exitoso", "Usuario registrado correctamente", "success");
    } else {
      Swal.fire("Error", "Error al registrar el usuario. Intente nuevamente.", "error");
    }
  } catch (error) {
    Swal.fire("Error", "Error en la solicitud de registro. Intente nuevamente.", "error");
  }
}

// Función para iniciar sesión
async function loginUser(username, password) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Guardar token o estado de autenticación en localStorage
      localStorage.setItem("authToken", data.token);
      // Redirigir al dashboard
      window.location.href = "http://127.0.0.1:5500/floristeria/dashboard/index.html?#";
    } else {
      Swal.fire("Error", "Credenciales incorrectas. Intente nuevamente.", "error");
    }
  } catch (error) {
    Swal.fire("Error", "Error en la solicitud de inicio de sesión. Intente nuevamente.", "error");
  }
}

// Función para verificar si el usuario está autenticado
function checkAuthentication() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    // Redirigir al login si no está autenticado
    window.location.href = "http://127.0.0.1:5500/floristeria/login/index.html";
  }
}

// Manejar el evento de registro
function handleSignup(event) {
  event.preventDefault();

  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (password !== confirmPassword) {
    Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
    return;
  }

  // Llamar a la función para registrar el usuario
  registerUser(email, username, password);
}

// Manejar el evento de inicio de sesión
function cleanValues() {
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-password").value = "";
  document.getElementById("signup-email").value = "";
  document.getElementById("signup-confirm-password").value = "";
}

// Manejar el evento de inicio de sesión
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  // Llamar a la función para iniciar sesión
  loginUser(username, password);
}
