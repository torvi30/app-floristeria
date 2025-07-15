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

  const cartContainer = document.getElementById("cart-container");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const openCartButton = document.getElementById("open-cart-button");
  const closeCartButton = document.getElementById("close-cart-button");
  const checkoutButton = document.getElementById("checkout-button");
  const customerNameInput = document.getElementById("customer-name");
  const customerPhoneInput = document.getElementById("customer-phone");

  let cart = []; // Array para almacenar los productos en el carrito

  // Function to close the cart
  closeCartButton.addEventListener("click", () => {
    cartContainer.classList.add("hidden");
    openCartButton.classList.remove("hidden");
  });

  // Function to open the cart
  openCartButton.addEventListener("click", () => {
    cartContainer.classList.remove("hidden");
    openCartButton.classList.add("hidden");
  });

  // Función para actualizar el carrito
  function updateCart() {
    cartItems.innerHTML = ""; // Clear the cart display
    let total = 0;

    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "flex justify-between items-center border-b pb-2";
      li.innerHTML = `
        <div class="flex items-center">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
          <div>
            <p class="font-bold">${item.name}</p>
            <p class="text-sm text-gray-600">${item.type}</p>
            <p class="text-sm text-gray-600">
            ${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
            </p>
            <div class="flex items-center mt-2">
              <button class="decrease-quantity text-gray-500 px-2" data-index="${index}">-</button>
              <span class="quantity text-gray-700 mx-2">${item.quantity}</span>
              <button class="increase-quantity text-gray-500 px-2" data-index="${index}">+</button>
            </div>
          </div>
        </div>
        <button class="text-red-500 font-bold delete-item" data-index="${index}">Eliminar</button>
      `;
      cartItems.appendChild(li);
      total += item.price * item.quantity;
    });

    cartTotal.textContent = `Total: ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}`;

    // Add event listeners to "Eliminar" buttons
    const deleteButtons = cartItems.querySelectorAll(".delete-item");
    deleteButtons.forEach(button => {
      button.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent interference with other events
        const index = parseInt(button.dataset.index, 10);
        cart.splice(index, 1); // Remove the item from the cart
        updateCart(); // Update the cart display
      });
    });

    // Add event listeners to quantity buttons
    const increaseButtons = cartItems.querySelectorAll(".increase-quantity");
    const decreaseButtons = cartItems.querySelectorAll(".decrease-quantity");

    increaseButtons.forEach(button => {
      button.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent interference with other events
        const index = parseInt(button.dataset.index, 10);
        if (cart[index].quantity < cart[index].stock) {
          cart[index].quantity += 1;
          updateCart();
        }
      });
    });

    decreaseButtons.forEach(button => {
      button.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent interference with other events
        const index = parseInt(button.dataset.index, 10);
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
          updateCart();
        }
      });
    });
  }

  function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      if (existingProduct.quantity < existingProduct.stock) {
        existingProduct.quantity += 1;
      }
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCart();
  }

  // Function to handle "Agregar Carrito" buttons
  function handleAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll(".add-to-cart-button");
    addToCartButtons.forEach(button => {
      button.addEventListener("click", () => {
        const product = JSON.parse(button.dataset.product);
        addToCart(product);
        cartContainer.classList.remove("hidden");
        openCartButton.classList.add("hidden");
      });
    });
  }

  function fetchAndDisplayProducts(type = "") {
    const container = document.getElementById("cards-container");
    container.innerHTML = ""; // Clear existing products

    const url = type ? `https://api-floristeria.onrender.com/api/products/?type=${type}` : "https://api-floristeria.onrender.com/api/products/";

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
              <p class="text-3xl text-gray-900">
                ${property.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
              </p>
              <p class="font-bold text-gray-700">${property.name}</p>
              <p class="text-gray-700">${property.description}</p>
            </div>
            <div class="flex p-4 border-t border-gray-300 text-gray-700">
              <p class="flex-1"><span class="text-gray-900 font-bold">${property.stock}</span> Stock</p>
              <button class="add-to-cart-button px-4 py-2 bg-custom-dark-brown text-white text-xs font-bold uppercase rounded" 
                data-product='${JSON.stringify(property)}'>Agregar Carrito</button>
            </div>
          `;
          container.appendChild(card);
        });
        handleAddToCartButtons();
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

  // Función para finalizar la compra
  checkoutButton.addEventListener("click", () => {
    const customerName = customerNameInput.value.trim() || "customer_name"; // Valor predeterminado si está vacío
    const customerPhone = customerPhoneInput.value.trim() || "customer_phone"; // Valor predeterminado si está vacío

    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "No hay productos en el carrito para finalizar la compra.",
      });
      return;
    }

    const cartDetails = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      unit_price: parseFloat(item.price.toFixed(2)),
      subtotal: parseFloat((item.quantity * item.price).toFixed(2)),
    }));

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = {
      customer_name: customerName,
      customer_phone: customerPhone,
      total_price: parseFloat(total.toFixed(2)),
      status: "pending",
      order_detail: cartDetails,
    };

    // Enviar el pedido al backend
    fetch("https://api-floristeria.onrender.com/api/orders/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })
      .then(response => response.json())
      .then(data => {
        // Obtener el número de pedido (ajusta el campo según tu backend)
        const pedidoId = data.id || data.order_number || 1; // Cambia esto si tu backend usa otro campo
        const pedidoNumero = pedidoId.toString().padStart(6, '0'); // Ejemplo: 000001

        // Construir el detalle de la compra en HTML
        const detalleHTML = `
          <h3>Detalle de tu compra:</h3>
          <ul style="text-align:left;">
            ${cart.map(item => `
              <li>
                <strong>${item.name}</strong> (${item.quantity} x ${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })})
              </li>
            `).join("")}
          </ul>
          <p><strong>Total:</strong> ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</p>
          <p><strong>Número de pedido:</strong> ${pedidoNumero}</p>
        `;

        Swal.fire({
          icon: "success",
          title: "Pedido confirmado",
          html: detalleHTML,
          showCancelButton: true,
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar"
        }).then(result => {
          if (result.isConfirmed) {
            // Redirigir a WhatsApp con el número de pedido
            const mensaje = `Hola, mi número de pedido es ${pedidoNumero}`;
            const telefono = "573225466673";
            const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
            window.location.href = url;
          }
          // Si cancela, no hace nada
        });

        cart = []; // Vaciar el carrito
        updateCart(); // Actualizar la vista del carrito
        customerNameInput.value = ""; 
        customerPhoneInput.value = "";
      })
      .catch(error => {
        console.error("Error al enviar el pedido:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al procesar tu pedido. Inténtalo nuevamente.",
        });
      });
  });

  function validateCustomerFields() {
    if (customerNameInput.value.trim() && customerPhoneInput.value.trim()) {
      checkoutButton.disabled = false;
    } else {
      checkoutButton.disabled = true;
    }
  }

  customerNameInput.addEventListener("input", validateCustomerFields);
  customerPhoneInput.addEventListener("input", validateCustomerFields);

  // Initial fetch
  // Leer parámetro de la URL y buscar automáticamente si existe
  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type');
  if (typeParam) {
    searchInput.value = typeParam;
    fetchAndDisplayProducts(typeParam);
  } else {
    fetchAndDisplayProducts();
  }

  document.getElementById('search-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('search-button').click();
    }
  });

  // Navbar funcionalidad sin recargar la página
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      // Quitar clase activa de todos
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      // Agregar clase activa al seleccionado
      this.classList.add('active');
      // Poner el valor en el input y buscar
      searchInput.value = this.dataset.type;
      searchButton.click();
    });
  });
});
