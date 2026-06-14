document.addEventListener("DOMContentLoaded", function() {

    // ==========================================
    // 0. CONTROL DE SESIÓN Y ROLES DE USUARIO
    // ==========================================
    let rolUsuario = localStorage.getItem('user_role'); 

    function controlarBotonSesion() {
        const contenedorSesion = document.getElementById('menu-sesion-item'); 
        if (!contenedorSesion) return; 

        if (rolUsuario) { 
            contenedorSesion.innerHTML = `
                <button id="btn-logout" title="Cerrar Sesión (${rolUsuario})" style="background:transparent; border:none; cursor:pointer; padding: 5px; display: flex; align-items: center; justify-content: center;">
                    <img src="Imagenes/salida.png" alt="Salir" style="width: 36px; height: 36px; object-fit: contain; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                </button>
            `; 
            
            document.getElementById('btn-logout').addEventListener('click', function() {
                localStorage.removeItem('user_role'); 
                localStorage.removeItem('productos_tienda'); 
                window.location.reload(); 
            });
        } else {
            contenedorSesion.innerHTML = `
                <button id="btn-abrir-login" style="background:transparent; border:none; cursor:pointer; font-weight:600; text-transform:uppercase; font-size:0.85rem; font-family: inherit;">Iniciar Sesión</button>
            `; 

            document.getElementById('btn-abrir-login').addEventListener('click', () => {
                document.getElementById('modal-login').classList.add('activo'); 
            });
        }
    }

    const btnCerrarModal = document.getElementById('btn-cerrar-modal'); 
    if (btnCerrarModal) { 
        btnCerrarModal.addEventListener('click', () => {
            document.getElementById('modal-login').classList.remove('activo'); 
        });
    }

    const formLoginModal = document.getElementById('form-login-modal'); 
    if (formLoginModal) { 
        formLoginModal.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const user = document.getElementById('modal-username').value.trim(); 
            const pass = document.getElementById('modal-password').value; 
            const errorTxt = document.getElementById('modal-error-login'); 

            if (user === 'admin' && pass === 'admin123') { 
                localStorage.setItem('user_role', 'admin'); 
                document.getElementById('modal-login').classList.remove('activo'); 
                window.location.reload(); 
            } else if (user === 'cliente' && pass === 'cliente123') { 
                localStorage.setItem('user_role', 'cliente'); 
                document.getElementById('modal-login').classList.remove('activo'); 
                window.location.reload(); 
            } else {
                errorTxt.style.display = 'block'; 
            }
        });
    }

    controlarBotonSesion(); 

    const panelAdmin = document.getElementById('panel-admin'); 
    if (panelAdmin) { 
        panelAdmin.style.display = (rolUsuario === 'admin') ? 'block' : 'none'; 
    }


    // ==========================================
    // 1. DINAMISMO DEL CATÁLOGO Y PRECIOS EDITABLES
    // ==========================================
    const productosIniciales = [
        { id: "p1", nombre: "Vestido Oscuro", precio: 59.90, img: "Imagenes/vestidosc.png" }, 
        { id: "p2", nombre: "Camisa Eleganpi", precio: 35.00, img: "Imagenes/eleganpi.png" }, 
        { id: "p3", nombre: "Chaqueta Minimal", precio: 89.00, img: "Imagenes/chaqueta.png" }, 
        { id: "p4", nombre: "Conjunto Urbano", precio: 45.50, img: "Imagenes/conjuntourb.avif" } 
    ];

    let listaProductos = JSON.parse(localStorage.getItem('productos_tienda')) || productosIniciales; 

    function pintarProductosDinamicos() {
        const contenedor = document.getElementById('catalogo'); 
        if (!contenedor) return; 

        contenedor.innerHTML = ''; 

        listaProductos.forEach(prod => {
            const article = document.createElement('article'); 
            
            let bloquePrecio = ''; 
            let bloqueBotonesAdmin = ''; 

            if (rolUsuario === 'admin') { 
                bloquePrecio = `
                    <div style="margin: 10px 0; display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size:0.75rem; font-weight:bold; color:#666;">Precio Base:</label>
                        <input type="number" step="0.01" class="input-precio-admin" data-id="${prod.id}" value="${parseFloat(prod.precio).toFixed(2)}" style="width: 100%; padding: 6px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-weight: bold;">
                    </div>
                `; 
                bloqueBotonesAdmin = `
                    <div style="display:flex; flex-direction:column; gap:5px; width:100%; margin-top:auto;">
                        <button class="btn-descuento-admin" data-id="${prod.id}" style="background: #eab308; color: black; border: none; padding: 10px; font-weight: bold; cursor: pointer;">🏷️ Descuento</button>
                        <button class="btn-eliminar-admin" data-id="${prod.id}" style="background: #ef4444; color: white; border: none; padding: 10px; font-weight: bold; cursor: pointer;">❌ Eliminar</button>
                    </div>
                `; 
            } else {
                bloquePrecio = `<p class="precio">S/ ${parseFloat(prod.precio).toFixed(2)}</p>`; 
                bloqueBotonesAdmin = `<button class="btn-agregar" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${prod.precio}" data-img="${prod.img}">Añadir al carrito</button>`; 
            }

            article.innerHTML = `
                <img src="${prod.img}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                ${bloquePrecio}
                ${bloqueBotonesAdmin}
            `; 
            contenedor.appendChild(article);
        });

        asociarEventosBotones(); 
    }

    function adaptarPaginasEstaticas() {
        if (rolUsuario === 'admin') { 
            const productosEstaticos = document.querySelectorAll('article'); 
            
            productosEstaticos.forEach((producto, index) => {
                const botonOriginal = producto.querySelector('button'); 
                const elementoPrecio = producto.querySelector('.precio'); 
                
                let precioActual = elementoPrecio ? parseFloat(elementoPrecio.innerText.replace('S/', '').trim()) : 0; 

                if (elementoPrecio) { 
                    elementoPrecio.innerHTML = `
                        <div style="margin: 10px 0; display: flex; flex-direction: column; gap: 5px; text-align:center;">
                            <label style="font-size:0.75rem; font-weight:bold; color:#666;">Precio Base:</label>
                            <input type="number" step="0.01" class="input-precio-estatico" value="${precioActual.toFixed(2)}" style="width: 80px; padding: 6px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-weight: bold; margin: 0 auto;">
                        </div>
                    `; 
                }

                if (botonOriginal) { 
                    const contenedorAcciones = document.createElement('div'); 
                    contenedorAcciones.style.cssText = "display:flex; flex-direction:column; gap:5px; width:100%; margin-top:auto;"; 
                    
                    contenedorAcciones.innerHTML = `
                        <button class="btn-desc-estatico" style="background: #eab308; color: black; border: none; padding: 10px; font-weight: bold; cursor: pointer;">🏷️ Descuento</button>
                        <button class="btn-eliminar-estatico" style="background: #ef4444; color: white; border: none; padding: 10px; font-weight: bold; cursor: pointer;">❌ Eliminar</button>
                    `; 

                    contenedorAcciones.querySelector('.btn-desc-estatico').addEventListener('click', () => {
                        const inputPrecio = producto.querySelector('.input-precio-estatico'); 
                        let precioBase = parseFloat(inputPrecio.value); 
                        let pct = prompt("Porcentaje de descuento:", "10"); 
                        if (pct !== null && !isNaN(pct) && pct > 0) { 
                            let nuevoPrecio = precioBase - (precioBase * (parseFloat(pct) / 100)); 
                            inputPrecio.value = nuevoPrecio.toFixed(2); 
                        }
                    });

                    contenedorAcciones.querySelector('.btn-eliminar-estatico').addEventListener('click', () => {
                        producto.remove(); 
                    });

                    botonOriginal.replaceWith(contenedorAcciones); 
                }
            });
        }
    }

    pintarProductosDinamicos(); 
    adaptarPaginasEstaticas(); 


    // ==========================================
    // 2. BUSCADOR EN TIEMPO REAL
    // ==========================================
    const buscador = document.getElementById('inputBuscador'); 
    if (buscador) { 
        buscador.addEventListener('input', () => {
            const textoUsuario = buscador.value.toLowerCase().trim(); 
            const tarjetasProductos = document.querySelectorAll('#catalogo article, .catalogo article, main article');

            tarjetasProductos.forEach(producto => {
                const h3 = producto.querySelector('h3'); 
                if (!h3) return; 

                const nombreProducto = h3.innerText.toLowerCase(); 
                if (nombreProducto.includes(textoUsuario)) { 
                    producto.style.display = "flex"; 
                } else {
                    producto.style.display = "none"; 
                }
            });
        });
    }


    // ==========================================
    // 4. LÓGICA INTEGRADA DEL CARRITO Y BOTONES
    // ==========================================
    let carrito = JSON.parse(localStorage.getItem('carritoSublym')) || []; 
    const contadorCarrito = document.getElementById('cart-count'); 

    function actualizarContador() {
        if (contadorCarrito) { 
            const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0); 
            contadorCarrito.innerText = totalItems; 
        }
    }

    function asociarEventosBotones() {
        const botonesAgregar = document.querySelectorAll('.btn-agregar'); 
        botonesAgregar.forEach(boton => { boton.replaceWith(boton.cloneNode(true)); }); 
        
        document.querySelectorAll('.btn-agregar').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id'); 
                const nombre = e.target.getAttribute('data-nombre'); 
                const precio = parseFloat(e.target.getAttribute('data-precio')); 
                const img = e.target.getAttribute('data-img'); 

                const productoExistente = carrito.find(item => item.nombre === nombre); 

                if (productoExistente) { 
                    productoExistente.cantidad++; 
                } else {
                    carrito.push({ id, nombre, precio, img, cantidad: 1 }); 
                }

                localStorage.setItem('carritoSublym', JSON.stringify(carrito)); 
                actualizarContador(); 
                
                const textoOriginal = e.target.innerText; 
                e.target.innerText = "¡Añadido!"; 
                setTimeout(() => { e.target.innerText = textoOriginal; }, 800); 
            });
        });

        const inputsPrecioAdmin = document.querySelectorAll('.input-precio-admin'); 
        inputsPrecioAdmin.forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id'); 
                const nuevoPrecio = parseFloat(e.target.value); 
                if(!isNaN(nuevoPrecio) && nuevoPrecio >= 0) { 
                    let producto = listaProductos.find(p => p.id === id); 
                    if(producto) { 
                        producto.precio = nuevoPrecio; 
                        localStorage.setItem('productos_tienda', JSON.stringify(listaProductos)); 
                    }
                }
            });
        });

        const botonesDescuentoAdmin = document.querySelectorAll('.btn-descuento-admin'); 
        botonesDescuentoAdmin.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id'); 
                let producto = listaProductos.find(p => p.id === id); 
                if(producto) { 
                    let porcentaje = prompt(`Descuento para "${producto.nombre}":`, "10"); 
                    if (porcentaje !== null && !isNaN(porcentaje) && porcentaje > 0) { 
                        producto.precio = producto.precio - (producto.precio * (parseFloat(porcentaje) / 100)); 
                        localStorage.setItem('productos_tienda', JSON.stringify(listaProductos)); 
                        pintarProductosDinamicos(); 
                    }
                }
            });
        });

        const botonesEliminarAdmin = document.querySelectorAll('.btn-eliminar-admin'); 
        botonesEliminarAdmin.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id'); 
                listaProductos = listaProductos.filter(p => p.id !== id); 
                localStorage.setItem('productos_tienda', JSON.stringify(listaProductos)); 
                pintarProductosDinamicos(); 
            });
        });
    }

    actualizarContador(); 


    // ==========================================
    // 5. CONTROL DEL CARRUSEL DE IMÁGENES
    // ==========================================
    const carruselContainer = document.querySelector('.carrusel-pista'); 
    const imagenesCarrusel = document.querySelectorAll('.carrusel-item img');
    const btnAnterior = document.querySelector('.flecha.anterior'); 
    const btnSiguiente = document.querySelector('.flecha.siguiente'); 

    let indiceActual = 0;

    if (carruselContainer && imagenesCarrusel.length > 0 && btnAnterior && btnSiguiente) {
        
        function actualizarCarrusel() {
            const desplazamiento = indiceActual * -100;
            carruselContainer.style.transform = `translateX(${desplazamiento}%)`;
            carruselContainer.style.transition = "transform 0.5s ease-in-out";
        }

        btnSiguiente.addEventListener('click', () => {
            indiceActual++;
            if (indiceActual >= imagenesCarrusel.length) {
                indiceActual = 0; 
            }
            actualizarCarrusel();
        });

        btnAnterior.addEventListener('click', () => {
            indiceActual--;
            if (indiceActual < 0) {
                indiceActual = imagenesCarrusel.length - 1; 
            }
            actualizarCarrusel();
        });

        setInterval(() => {
            btnSiguiente.click();
        }, 5000);
    }


    // ==========================================
    // 6. INTERACCIÓN DE LA BARRA DE BÚSQUEDA DESPLEGABLE
    // ==========================================
    const btnAbrirBuscador = document.getElementById('btn-abrir-buscador');
    const btnCerrarBuscador = document.getElementById('btn-cerrar-buscador');
    const barraBusqueda = document.getElementById('barra-busqueda-desplegable');

    if (btnAbrirBuscador && btnCerrarBuscador && barraBusqueda) {
        btnAbrirBuscador.addEventListener('click', () => {
            barraBusqueda.classList.add('activo');
            if(buscador) buscador.focus(); // Enfoca el input automáticamente
        });

        btnCerrarBuscador.addEventListener('click', () => {
            barraBusqueda.classList.remove('activo');
            if(buscador) {
                buscador.value = ''; // Limpia el texto al cerrar
                buscador.dispatchEvent(new Event('input')); // Muestra todos los productos de nuevo
            }
        });
    }

});
