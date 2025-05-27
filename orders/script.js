document.addEventListener("DOMContentLoaded", () => {
    const ordersTableBody = document.getElementById("orders-table-body");

    // Cargar el sidebar
    function loadSidebar() {
        fetch("../shared/sidebar.html")
            .then(response => response.text())
            .then(html => {
                document.getElementById("sidebar-container").innerHTML = html;
            })
            .catch(error => console.error("Error cargando el sidebar:", error));
    }

    // Función para obtener las órdenes
    function fetchOrders() {
        fetch("http://127.0.0.1:8000/api/orders")
            .then(response => response.json())
            .then(orders => {
                ordersTableBody.innerHTML = ""; // Limpiar la tabla
                orders.forEach(order => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${order.id}</td>
                        <td>${order.customer_name}</td>
                        <td>${order.customer_phone}</td>
                        <td>$${order.total_price.toFixed(2)}</td>
                        <td>${order.status}</td>
                        <td>
                            <button class="btn btn-primary btn-sm edit-order" data-id="${order.id}">Editar</button>
                            <button class="btn btn-danger btn-sm delete-order" data-id="${order.id}">Eliminar</button>
                        </td>
                        <td>
                            <button class="btn btn-secondary btn-sm print-invoice" data-id="${order.id}">Ver</button>
                        </td>
                    `;
                    ordersTableBody.appendChild(row);
                });
                // Agregar eventos a los botones de imprimir factura
                document.querySelectorAll(".print-invoice").forEach(button => {
                    button.addEventListener("click", (event) => {
                        const orderId = event.target.dataset.id;
                        printInvoice(orderId);
                    });
                });

                // Agregar eventos a los botones de editar y eliminar
                addEventListeners();
            })
            .catch(error => console.error("Error fetching orders:", error));
    }

    // Función para agregar eventos a los botones
    function addEventListeners() {
        document.querySelectorAll(".edit-order").forEach(button => {
            button.addEventListener("click", (event) => {
                const orderId = event.target.dataset.id;
                editOrder(orderId);
            });
        });

        document.querySelectorAll(".delete-order").forEach(button => {
            button.addEventListener("click", (event) => {
                const orderId = event.target.dataset.id;
                deleteOrder(orderId);
            });
        });
    }

    // Función para editar una orden
    function editOrder(orderId) {
        Swal.fire({
            title: "Editar Orden",
            text: `¿Deseas editar la orden con ID: ${orderId}?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Editar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí puedes implementar la lógica para editar la orden
                Swal.fire({
                    icon: "success",
                    title: "Editar",
                    text: `Orden con ID ${orderId} lista para editar.`,
                });
            }
        });
    }

        // Función para imprimir la factura
    function printInvoice(orderId) {
        fetch(`http://127.0.0.1:8000/api/orders/${orderId}`)
            .then(response => response.json())
            .then(order => {
                const invoiceWindow = window.open("", "Invoice", "width=600,height=400");
                const invoiceContent = `
                    <h1>Factura</h1>
                    <p><strong>ID de Orden:</strong> ${order.id}</p>
                    <p><strong>Cliente:</strong> ${order.customer_name}</p>
                    <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
                    <p><strong>Estado:</strong> ${order.status}</p>
                    <hr>
                    <h2>Detalles</h2>
                    <table border="1" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th>Producto ID</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.order_detail.map(detail => `
                                <tr>
                                    <td>${detail.product_id}</td>
                                    <td>${detail.quantity}</td>
                                    <td>$${detail.unit_price.toFixed(2)}</td>
                                    <td>$${detail.subtotal.toFixed(2)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                    <hr>
                    <p><strong>Total:</strong> $${order.total_price.toFixed(2)}</p>
                    <p>Gracias por su compra.</p>
                `;
                invoiceWindow.document.write(invoiceContent);
                invoiceWindow.document.close();
            })
            .catch(error => console.error("Error fetching order details:", error));
    }


    // Función para eliminar una orden
    function deleteOrder(orderId) {
        Swal.fire({
            title: "Eliminar Orden",
            text: `¿Estás seguro de que deseas eliminar la orden con ID: ${orderId}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://127.0.0.1:8000/api/orders/${orderId}`, {
                    method: "DELETE",
                })
                    .then(response => {
                        if (response.ok) {
                            Swal.fire({
                                icon: "success",
                                title: "Eliminada",
                                text: "La orden ha sido eliminada con éxito.",
                            });
                            fetchOrders(); // Recargar la tabla
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "No se pudo eliminar la orden.",
                            });
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting order:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Ocurrió un error al intentar eliminar la orden.",
                        });
                    });
            }
        });
    }

    // Inicializar la página
    function init() {
        loadSidebar();
        fetchOrders();
    }

    init();
});