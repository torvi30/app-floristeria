function loginOrLogout() {
  localStorage.removeItem("authToken");
  window.location.href = "../login/index.html";
}

function monitorAuthToken() {
  window.addEventListener("storage", (event) => {
    if (event.key === "authToken" && !event.newValue) {
      window.location.href = "../login/index.html";
    }
  });

  // Initial check in case the token is already missing
  if (!localStorage.getItem("authToken")) {
    window.location.href = "../login/index.html";
  }
}

// Call the function to start monitoring
monitorAuthToken();