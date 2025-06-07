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
        // Primero obtenemos los datos actuales de la orden
        fetch(`http://127.0.0.1:8000/api/orders/${orderId}`)
            .then(response => response.json())
            .then(order => {
                Swal.fire({
                    title: "Editar Orden",
                    html: `
                        <input id="swal-customer-name" class="swal2-input" placeholder="Nombre" value="${order.customer_name}">
                        <input id="swal-customer-phone" class="swal2-input" placeholder="Teléfono" value="${order.customer_phone}">
                        <select id="swal-status" class="swal2-input">
                            <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pendiente</option>
                            <option value="completed" ${order.status === "completed" ? "selected" : ""}>Completada</option>
                            <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Cancelada</option>
                        </select>
                    `,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: "Guardar",
                    cancelButtonText: "Cancelar",
                    preConfirm: () => {
                        const customer_name = document.getElementById('swal-customer-name').value.trim();
                        const customer_phone = document.getElementById('swal-customer-phone').value.trim();
                        const status = document.getElementById('swal-status').value;
                        if (!customer_name || !customer_phone) {
                            Swal.showValidationMessage('Nombre y teléfono son obligatorios');
                            return false;
                        }
                        return { customer_name, customer_phone, status };
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Enviar PUT al backend
                        fetch(`http://127.0.0.1:8000/api/orders/${orderId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                customer_name: result.value.customer_name,
                                customer_phone: result.value.customer_phone,
                                status: result.value.status,
                                order_detail: order.order_detail // Se envía igual, no se edita aquí
                            })
                        })
                        .then(response => {
                            if (response.ok) {
                                Swal.fire({
                                    icon: "success",
                                    title: "Actualizada",
                                    text: "La orden ha sido actualizada con éxito."
                            });
                            fetchOrders();
                        } else {
                            console.log("Error updating order:", response.statusText);
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "No se pudo actualizar la orden."
                            });
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Ocurrió un error al actualizar la orden."
                        });
                    });
                }
            });
        })
        .catch(error => {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo cargar la orden para editar."
            });
        });
    }

        // Función para imprimir la factura
    function printInvoice(orderId) {
        fetch(`http://127.0.0.1:8000/api/orders/${orderId}`)
            .then(response => response.json())
            .then(async order => {
                // Obtener los nombres de los productos
                const productNames = {};
                await Promise.all(order.order_detail.map(async detail => {
                    try {
                        const res = await fetch(`http://127.0.0.1:8000/api/products/${detail.product_id}`);
                        const product = await res.json();
                        productNames[detail.product_id] = product.name;
                    } catch {
                        productNames[detail.product_id] = "Producto desconocido";
                    }
                }));

                const invoiceWindow = window.open("", "Invoice", "width=700,height=600");
                const invoiceContent = `
                    <div style="text-align: center;">
                        <img src="../imgicon/logo.png" alt="Logo" style="height: 200px; margin-bottom: 10px;">
                        <p style="margin: 0;">Calle 28 # 28-20, Marinilla, Antioquia</p>
                        <p style="margin: 0;">Teléfono: 123 456 7890</p>
                        <hr>
                    </div>
                    <h2>Factura</h2>
                    <p><strong>Orden:</strong> ${order.id}</p>
                    <p><strong>Cliente:</strong> ${order.customer_name}</p>
                    <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
                    <p><strong>Estado:</strong> ${order.status}</p>
                    <hr>
                    <h3>Detalles</h3>
                    <table border="1" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.order_detail.map(detail => `
                                <tr>
                                    <td>${productNames[detail.product_id]}</td>
                                    <td>${detail.quantity}</td>
                                    <td>$${detail.unit_price.toFixed(2)}</td>
                                    <td>$${detail.subtotal.toFixed(2)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                    <hr>
                    <p><strong>Total:</strong> $${order.total_price.toFixed(2)}</p>
                    <br>
                    <div style="background: #f9f9f9; padding: 10px; border-radius: 6px;">
                        <strong>¡Gracias por su compra!</strong>
                        <p>Esperamos que disfrute nuestros productos. Su satisfacción es nuestra prioridad.</p>
                    </div>
                    <br>
                    <div style="font-size: 0.95em;">
                        <strong>Condiciones del servicio:</strong>
                        <ol>
                            <li>Los productos deben ser revisados al momento de la entrega.</li>
                            <li>No se aceptan devoluciones después de 24 horas.</li>
                            <li>Para cualquier reclamo, conserve esta factura.</li>
                        </ol>
                    </div>
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