document.addEventListener("DOMContentLoaded", () => {
    
// Load the sidebar
 fetch("../shared/sidebar.html")
    .then(response => response.text())
    .then(html => {
        document.getElementById("sidebar-container").innerHTML = html;
    })
    .catch(error => console.error("Error cargando el navbar:", error));
})