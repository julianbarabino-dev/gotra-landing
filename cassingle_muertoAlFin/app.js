/**
 * ==========================================================================
 * GOTRA - PREVENTA CASSINGLE "MUERTO AL FIN" (10 COPIAS NUMERADAS)
 * Script de Control de Stock, Selección de Variantes, Acordeón y WhatsApp
 * ==========================================================================
 */

// CONFIGURACIÓN DE LA PREVENTA
const PREVENTA_CONFIG = {
    totalCopias: 10,
    copiasReservadas: 2, // MODIFICÁ ESTE NÚMERO A MEDIDA QUE SE CONFIRMEN VENTAS
    moneda: "ARS",
    
    // Variantes y Precios
    variantes: {
        transparente: {
            id: "transparente",
            nombre: "Cassette Transparente",
            precio: 22000,
            desc: "Cuerpo de plástico transparente"
        },
        negro: {
            id: "negro",
            nombre: "Cassette Negro (Edición Coleccionista)",
            precio: 25000,
            desc: "Cuerpo de plástico negro"
        }
    },
    
    // Datos Bancarios
    alias: "gotra.cassingle",
    cbu: "0000076500000000969792",
    titular: "Gotra (Cuenta Oficial)",
    
    // WhatsApp Oficial de la Banda (Código de país + área + número sin + ni guiones)
    whatsappNumero: "5491100000000"
};

document.addEventListener('DOMContentLoaded', () => {
    initPreventaData();
    initCopyButtons();
    initVariantAndQuantitySelectors();
    initStepAccordion();
    initFormHandling();
    initModalHandlers();
});

/**
 * 1. Inicializar Datos de Stock y Barra de Progreso GOAL
 */
function initPreventaData() {
    const { totalCopias, copiasReservadas, alias, cbu } = PREVENTA_CONFIG;
    const copiasDisponibles = Math.max(0, totalCopias - copiasReservadas);
    const porcentaje = Math.min(100, Math.round((copiasReservadas / totalCopias) * 100));

    // Elementos DOM
    const fillBar = document.getElementById('progress-bar-fill');
    const percentText = document.getElementById('goal-percent-text');
    const statSold = document.getElementById('stat-sold');
    const statRemaining = document.getElementById('stat-remaining');
    const statTotal = document.getElementById('stat-total');
    const scarcityMessage = document.getElementById('scarcity-message');
    const bankAlias = document.getElementById('bank-alias');
    const bankCbu = document.getElementById('bank-cbu');

    // Asignar Valores Bancarios
    if (bankAlias) bankAlias.textContent = alias;
    if (bankCbu) bankCbu.textContent = cbu;

    // Actualizar Estadísticas
    if (statSold) statSold.textContent = copiasReservadas;
    if (statRemaining) statRemaining.textContent = copiasDisponibles;
    if (statTotal) statTotal.textContent = totalCopias;
    if (percentText) percentText.textContent = `${porcentaje}%`;

    // Animar Barra de Progreso
    setTimeout(() => {
        if (fillBar) fillBar.style.width = `${porcentaje}%`;
    }, 200);

    // Mensaje Dinámico de Escasez para 10 copias
    if (scarcityMessage) {
        if (copiasDisponibles <= 0) {
            scarcityMessage.innerHTML = "<strong>SOLD OUT:</strong> Se han reservado las 10 copias de la tirada física.";
            const btnPrimary = document.querySelector('.btn-primary-cta');
            if (btnPrimary) {
                btnPrimary.textContent = "EDICIÓN AGOTADA";
                btnPrimary.style.opacity = "0.7";
                btnPrimary.style.pointerEvents = "none";
            }
        } else if (copiasDisponibles <= 3) {
            scarcityMessage.innerHTML = `<strong>ÚLTIMAS ${copiasDisponibles} COPIAS:</strong> La tirada ultra-limitada está próxima a agotarse.`;
        } else if (copiasDisponibles <= 6) {
            scarcityMessage.innerHTML = `<strong>Solo quedan ${copiasDisponibles} unidades disponibles</strong> para reserva inmediata.`;
        } else {
            scarcityMessage.textContent = `Quedan ${copiasDisponibles} copias disponibles de la tirada única de ${totalCopias} cassettes.`;
        }
    }

    recalcTotal();
}

/**
 * 2. Botones para Copiar al Portapapeles (Alias y CBU)
 */
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.btn-copy-tile, .btn-copy');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (!targetEl) return;

            const textToCopy = targetEl.textContent.trim();
            copyToClipboard(textToCopy);

            // Feedback visual en el botón
            btn.classList.add('is-copied');
            const textSpan = btn.querySelector('.copy-text');
            const originalText = textSpan ? textSpan.textContent : "Copiar";
            if (textSpan) textSpan.textContent = "¡Copiado!";

            showToast(`${targetId === 'bank-alias' ? 'Alias' : 'CVU'} copiado al portapapeles`);

            setTimeout(() => {
                btn.classList.remove('is-copied');
                if (textSpan) textSpan.textContent = originalText;
            }, 2500);
        });
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Error al copiar texto', err);
        }
        document.body.removeChild(textarea);
    }
}

/**
 * 3. Selector de Variantes y Cantidad de Copias
 */
function initVariantAndQuantitySelectors() {
    const variantRadios = document.querySelectorAll('input[name="variant"]');
    const quantityRadios = document.querySelectorAll('input[name="quantity"]');

    variantRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            recalcTotal();
        });
    });

    quantityRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            recalcTotal();
        });
    });
}

function getSelectedVariant() {
    const selectedVariantKey = document.querySelector('input[name="variant"]:checked')?.value || "transparente";
    return PREVENTA_CONFIG.variantes[selectedVariantKey] || PREVENTA_CONFIG.variantes.transparente;
}

function getSelectedQuantity() {
    const selectedQty = document.querySelector('input[name="quantity"]:checked')?.value || "1";
    return parseInt(selectedQty, 10) || 1;
}

function recalcTotal() {
    const variant = getSelectedVariant();
    const qty = getSelectedQuantity();
    const total = variant.precio * qty;

    const totalToPayEl = document.getElementById('total-to-pay');
    if (totalToPayEl) {
        totalToPayEl.textContent = `$${total.toLocaleString('es-AR')}`;
    }

    // Actualizar labels de cantidad de forma limpia y legible
    const qty1Box = document.getElementById('qty-1-label');
    const qty2Box = document.getElementById('qty-2-label');
    if (qty1Box) {
        qty1Box.textContent = `1 Copia ($${variant.precio.toLocaleString('es-AR')})`;
    }
    if (qty2Box) {
        qty2Box.textContent = `2 Copias ($${(variant.precio * 2).toLocaleString('es-AR')})`;
    }
}

/**
 * 4. Acordeón Desplegable de Pasos (1, 2, 3)
 */
function initStepAccordion() {
    const stepButtons = document.querySelectorAll('.accordion-step-btn');
    const nextButtons = document.querySelectorAll('.btn-step-next');

    // Click en cabeceras de paso
    stepButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepNum = btn.getAttribute('data-step');
            toggleStep(stepNum);
        });
    });

    // Botones "Continuar al siguiente paso"
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStepNum = btn.getAttribute('data-next');
            
            // Si pasa del paso 1 al 2, validamos datos de contacto
            if (nextStepNum === '2') {
                const nameInput = document.getElementById('fan-name');
                const whatsappInput = document.getElementById('fan-whatsapp');
                let valid = true;

                if (!nameInput.value.trim()) {
                    showError(nameInput);
                    valid = false;
                } else {
                    clearError(nameInput);
                }

                if (!whatsappInput.value.trim()) {
                    showError(whatsappInput);
                    valid = false;
                } else {
                    clearError(whatsappInput);
                }

                if (!valid) return;
            }

            openStepOnly(nextStepNum);
            
            // Scroll suave al paso abierto
            const targetStep = document.getElementById(`step-${nextStepNum}`);
            if (targetStep) {
                targetStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

function toggleStep(stepNum) {
    const stepEl = document.getElementById(`step-${stepNum}`);
    if (!stepEl) return;
    stepEl.classList.toggle('is-open');
}

function openStepOnly(stepNum) {
    for (let i = 1; i <= 3; i++) {
        const step = document.getElementById(`step-${i}`);
        if (step) {
            if (i.toString() === stepNum.toString()) {
                step.classList.add('is-open');
            } else {
                step.classList.remove('is-open');
            }
        }
    }
}

/**
 * 5. Procesamiento del Formulario y Armado de Enlace a WhatsApp
 */
function initFormHandling() {
    const form = document.getElementById('reservation-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validaciones
        const nameInput = document.getElementById('fan-name');
        const whatsappInput = document.getElementById('fan-whatsapp');
        const emailInput = document.getElementById('fan-email');
        
        let isValid = true;

        if (!nameInput.value.trim()) {
            showError(nameInput);
            isValid = false;
        } else {
            clearError(nameInput);
        }

        if (!whatsappInput.value.trim()) {
            showError(whatsappInput);
            isValid = false;
        } else {
            clearError(whatsappInput);
        }

        if (!isValid) {
            openStepOnly('1');
            const firstError = form.querySelector('.has-error');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const fanName = nameInput.value.trim();
        const fanWhatsapp = whatsappInput.value.trim();
        const fanEmail = emailInput.value.trim() || 'No especificado';
        
        const variant = getSelectedVariant();
        const qtyNumber = getSelectedQuantity();
        const totalAmount = formatCurrency(qtyNumber * variant.precio);

        // Estructura del mensaje de WhatsApp con variante explícita
        const waMessage = 
`Hola Gotra. Quiero reservar mi copia del Cassingle "Muerto al fin".

* Variante: ${variant.nombre} ($${variant.precio.toLocaleString('es-AR')})
* Cantidad: ${qtyNumber} ${qtyNumber === 1 ? 'copia' : 'copias'}
* Monto Total Transferido: ${totalAmount}
* Nombre: ${fanName}
* WhatsApp: ${fanWhatsapp}
* Email: ${fanEmail}
* Entrega: A coordinar (Envío a Sucursal Correo o Retiro CABA a partir del 15/10/2026)

--------------------------------------
Adjunto la captura del comprobante de transferencia bancaria.`;

        const encodedMessage = encodeURIComponent(waMessage);
        const waUrl = `https://wa.me/${PREVENTA_CONFIG.whatsappNumero}?text=${encodedMessage}`;

        // Asignar URL al botón fallback
        const fallbackLink = document.getElementById('fallback-wa-link');
        if (fallbackLink) fallbackLink.href = waUrl;

        // Abrir WhatsApp en nueva pestaña
        window.open(waUrl, '_blank');

        // Mostrar Modal de confirmación
        const modal = document.getElementById('success-overlay');
        if (modal) modal.classList.add('active');
    });
}

function showError(inputEl) {
    const parent = inputEl.closest('.input-group');
    if (parent) parent.classList.add('has-error');
}

function clearError(inputEl) {
    const parent = inputEl.closest('.input-group');
    if (parent) parent.classList.remove('has-error');
}

/**
 * 6. Modales y Toast
 */
function initModalHandlers() {
    const modal = document.getElementById('success-overlay');
    const btnClose = document.getElementById('btn-close-modal');

    if (btnClose && modal) {
        btnClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatCurrency(num) {
    return `$${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ARS`;
}
