function loginOrLogout() {
  localStorage.removeItem("authToken");
  window.location.href = "/";
}

function monitorAuthToken() {
  window.addEventListener("storage", (event) => {
    if (event.key === "authToken" && !event.newValue) {
      window.location.href = "/";
    }
  });

  // Initial check in case the token is already missing
  if (!localStorage.getItem("authToken")) {
    window.location.href = "/";
  }
}

// Call the function to start monitoring
monitorAuthToken();