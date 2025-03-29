
document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logoutButton");
  console.log("Logout button:", logoutButton);
  if (logoutButton) {
    console.log("Logout button found");
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      window.location.href = "/login/index.html";
    });
  }
});
