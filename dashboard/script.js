document.addEventListener("DOMContentLoaded", () => {
  const productTableBody = document.getElementById("productTableBody");

  // Load the sidebar
  fetch("../shared/sidebar.html")
    .then(response => response.text())
    .then(html => {
        document.getElementById("sidebar-container").innerHTML = html;
    })
    .catch(error => console.error("Error cargando el navbar:", error));

  // Fetch and populate product data
  function fetchAndPopulateProducts() {
    productTableBody.innerHTML = ""; // Clear the table body
    fetch("http://127.0.0.1:8000/api/products/")
      .then(response => response.json())
      .then(products => {
        products.forEach(product => {
          const row = document.createElement("tr");

          // Image column
          row.innerHTML += `<td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px;"></td>`;
          // Other columns
          row.innerHTML += `<td>${product.type}</td>`;
          row.innerHTML += `<td>${product.name}</td>`;
          row.innerHTML += `<td>${product.description}</td>`;
          row.innerHTML += `<td>${product.price}</td>`;
          row.innerHTML += `<td>${product.stock}</td>`;
          row.innerHTML += `<td>${product.is_active ? "Sí" : "No"}</td>`;
          // Edit button
          row.innerHTML += `<td><button class="btn btn-warning btn-sm edit-button" data-id="${product.id}">Editar</button></td>`;
          // Delete button
          row.innerHTML += `<td><button class="btn btn-danger btn-sm delete-button" data-id="${product.id}">Eliminar</button></td>`;

          productTableBody.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll(".edit-button").forEach(button => {
          button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");
            handleEditProduct(productId);
          });
        });

        document.querySelectorAll(".delete-button").forEach(button => {
          button.addEventListener("click", (event) => {
            const productId = event.target.getAttribute("data-id");
            handleDeleteProduct(productId);
          });
        });
      })
      .catch(error => console.error("Error fetching products:", error));
  }

  // Initial fetch and populate
  fetchAndPopulateProducts();

  // Ensure the Create Product Button is functional
  const createProductButton = document.getElementById("createProductButton");
  const createProductModalInstance = new bootstrap.Modal(document.getElementById("createProductModal"));
  createProductButton.addEventListener("click", () => {
    createProductModalInstance.show();
  });

  // Handle Create Product Form Submission
  const createProductForm = document.getElementById("createProductForm");
  createProductForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newProduct = {
      image: document.getElementById("productImage").value,
      type: document.getElementById("productType").value,
      name: document.getElementById("productName").value,
      description: document.getElementById("productDescription").value,
      price: parseFloat(document.getElementById("productPrice").value),
      stock: parseInt(document.getElementById("productStock").value, 10),
      is_active: document.getElementById("productIsActive").value === "true",
    };

    fetch("http://127.0.0.1:8000/api/products/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    })
      .then((response) => {
        if (response.ok) {
          Swal.fire("Éxito", "Producto creado exitosamente", "success");
          createProductForm.reset();
          createProductModalInstance.hide(); // Close the modal properly
          fetchAndPopulateProducts(); // Refresh the table body
        } else {
          throw new Error("Error al crear el producto");
        }
      })
      .catch((error) => {
        Swal.fire("Error", error.message, "error");
      });
  });

  // Function to handle editing a product
  function handleEditProduct(productId) {
    // Fetch product details
    fetch(`http://127.0.0.1:8000/api/products/${productId}`)
      .then(response => response.json())
      .then(product => {
        // Populate the edit form with product data
        document.getElementById("editProductId").value = product.id;
        document.getElementById("editProductImage").value = product.image;
        document.getElementById("editProductType").value = product.type;
        document.getElementById("editProductName").value = product.name;
        document.getElementById("editProductDescription").value = product.description;
        document.getElementById("editProductPrice").value = product.price;
        document.getElementById("editProductStock").value = product.stock;
        document.getElementById("editProductIsActive").value = product.is_active.toString();

        // Show the edit modal
        const editProductModal = new bootstrap.Modal(document.getElementById("editProductModal"));
        editProductModal.show();
      })
      .catch(error => {
        Swal.fire("Error", "No se pudo cargar el producto para editar.", "error");
        console.error("Error fetching product:", error);
      });
  }

  // Handle Edit Product Form Submission
  const editProductForm = document.getElementById("editProductForm");
  editProductForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const productId = document.getElementById("editProductId").value;
    const updatedProduct = {
      image: document.getElementById("editProductImage").value,
      type: document.getElementById("editProductType").value,
      name: document.getElementById("editProductName").value,
      description: document.getElementById("editProductDescription").value,
      price: parseFloat(document.getElementById("editProductPrice").value),
      stock: parseInt(document.getElementById("editProductStock").value, 10),
      is_active: document.getElementById("editProductIsActive").value === "true",
    };

    fetch(`http://127.0.0.1:8000/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    })
      .then(response => {
        if (response.ok) {
          Swal.fire("Éxito", "Producto actualizado exitosamente", "success");
          editProductForm.reset();
          document.querySelector("#editProductModal .btn-close").click();
          fetchAndPopulateProducts(); // Refresh the table body
        } else {
          throw new Error("Error al actualizar el producto");
        }
      })
      .catch(error => {
        Swal.fire("Error", error.message, "error");
      });
  });

  // Function to handle deleting a product
  function handleDeleteProduct(productId) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el producto permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://127.0.0.1:8000/api/products/${productId}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
              // Optionally, refresh the product list or remove the row from the table
              document.querySelector(`button[data-id="${productId}"]`).closest("tr").remove();
            } else {
              throw new Error("Error al eliminar el producto");
            }
          })
          .catch((error) => {
            Swal.fire("Error", error.message, "error");
          });
      }
    });
  }
});