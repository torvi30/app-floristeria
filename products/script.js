document.addEventListener("DOMContentLoaded", () => {
  // Load the sidebar
  fetch("../shared/sidebar.html")
    .then(response => response.text())
    .then(html => {
      document.getElementById("sidebar-container").innerHTML = html;
    })
    .catch(error => console.error("Error cargando el navbar:", error));

  // Add search functionality
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const clearButton = document.getElementById("clear-button");

  function fetchAndDisplayProducts(type = "") {
    const container = document.getElementById("cards-container");
    container.innerHTML = ""; // Clear existing products

    const url = type ? `http://127.0.0.1:8000/api/products/?type=${type}` : "http://127.0.0.1:8000/api/products/";

    fetch(url)
      .then(response => response.json())
      .then(properties => {
        properties.forEach(property => {
          const card = document.createElement("div");
          card.className = "bg-white shadow-xl rounded-lg overflow-hidden";
          card.innerHTML = `
            <div class="bg-cover bg-center h-56 p-4" style="background-image: url(${property.image})"></div>
            <div class="p-4">
              <p class="uppercase tracking-wide text-sm font-bold text-gray-700">${property.type}</p>
              <p class="text-3xl text-gray-900">${property.price}</p>
              <p class="font-bold text-gray-700">${property.name}</p>
              <p class="text-gray-700">${property.description}</p>
            </div>
            <div class="flex p-4 border-t border-gray-300 text-gray-700">
              <p class="flex-1"><span class="text-gray-900 font-bold">${property.stock}</span> Stock</p>
              <button class="px-4 py-2 bg-blue-500 text-white text-xs font-bold uppercase rounded">Add to cart</button>
            </div>
          `;
          container.appendChild(card);
        });
      })
      .catch(error => console.error("Error fetching products:", error));
  }

  searchButton.addEventListener("click", () => {
    const type = searchInput.value.trim();
    fetchAndDisplayProducts(type);
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    fetchAndDisplayProducts();
  });

  // Initial fetch
  fetchAndDisplayProducts();
});
