// PROTOTIPE - Lógica de Interacción y Animaciones de Landing Page

// ============================================================
// SCOPE GLOBAL: Constantes accesibles en todos los IIFEs
// ============================================================
const heroCopies = {
  'Ferretería': {
    emoji: '🔩',
    area: 'Mostrador',
    h1: 'Detén las fugas de inventario y optimiza las ventas de tu Ferretería',
    desc: 'Visualiza el stock de tubos, controla alertas de recompra y busca tornillos al instante desde un catálogo digital rápido.',
    pillRec: 'Las ferreterías que digitalizan sus catálogos eliminan un 90% del tiempo de búsqueda en mostrador.'
  },
  'Restaurante': {
    emoji: '🍽️',
    area: 'Servicio de Mesa',
    h1: 'Lleva las comandas y la caja diaria de tu Restaurante sin descuadres',
    desc: 'Registra pedidos desde mesas en el celular, envía comandas a cocina de inmediato y haz cierres de caja ciegos y seguros.',
    pillRec: 'Los restaurantes con comandas digitales aceleran el servicio de mesa un 35% y previenen fugas en caja.'
  },
  'Taller Mecánico': {
    emoji: '🔧',
    area: 'Taller',
    h1: 'Controla las órdenes de trabajo y repuestos de tu Taller Mecánico',
    desc: 'Registra placas vehiculares, asigna tareas a mecánicos, descuenta stock de repuestos y gestiona abonos al instante.',
    pillRec: 'Tener una ficha histórica de vehículos y abonos elimina malentendidos con clientes y optimiza horas de mecánicos.'
  },
  'Peluquería': {
    emoji: '✂️',
    area: 'Salón y Agenda',
    h1: 'Organiza la agenda y comisiones de estilistas en tu Peluquería',
    desc: 'Elimina las citas duplicadas o solapadas. Calcula de forma automática la comisión de cada profesional al final del día.',
    pillRec: 'La asignación automatizada de turnos reduce horas muertas y agiliza el pago de comisiones semanales.'
  },
  'Tienda de Barrio': {
    emoji: '🛒',
    area: 'Caja Diaria',
    h1: 'Controla los fiados y caducidades de tu Tienda de Barrio',
    desc: 'Registra ventas con código de barras en segundos, lleva el saldo exacto de tus clientes y recibe alertas de productos por vencer.',
    pillRec: 'Llevar un control automatizado de deudas de fiados recupera hasta un 15% de ingresos perdidos por olvidos.'
  },
  'Farmacia': {
    emoji: '💊',
    area: 'Inventario',
    h1: 'Administra lotes, vencimientos y stock crítico en tu Farmacia',
    desc: 'Busca genéricos de forma ágil en mostrador, controla fechas de vencimiento de lotes y mantén el stock al día automáticamente.',
    pillRec: 'El control automatizado de lotes y alertas de caducidad evita pérdidas económicas severas por stock vencido.'
  },
  'Emprendimiento': {
    emoji: '🌱',
    area: 'Canal de Ventas',
    h1: 'Automatiza tus pedidos por chat y el control de envíos de tu Emprendimiento',
    desc: 'Centraliza solicitudes de redes sociales, genera guías de envío en segundos y mantén tu inventario sincronizado con tu catálogo online.',
    pillRec: 'Digitalizar el flujo de pedidos agiliza los despachos de e-commerce y previene roturas de stock en ofertas.'
  },
  'Negocio Familiar': {
    emoji: '🏠',
    area: 'Administración',
    h1: 'Separa tus finanzas personales de las de tu Negocio Familiar',
    desc: 'Lleva la contabilidad unificada de ingresos y egresos, registra gastos operativos y organiza el tiempo de trabajo familiar.',
    pillRec: 'Separar los gastos personales de los de la caja del día evita la descapitalización invisible de los negocios familiares.'
  }
};

const leadMagnets = {
  'Ferretería': 'Actualizaciones automáticas del sistema + soporte técnico gratuito incluido 🎁',
  'Restaurante': 'Actualizaciones automáticas del sistema + soporte técnico gratuito incluido 🎁',
  'Taller Mecánico': 'Actualizaciones automáticas del sistema + soporte técnico gratuito incluido 🎁',
  'Peluquería': 'Actualizaciones automáticas del sistema + soporte técnico gratuito incluido 🎁',
  'Tienda de Barrio': 'Actualizaciones automáticas del sistema + soporte técnico gratuito incluido 🎁',
  'Farmacia': 'Actualizaciones automáticas del sistema + soporte técnico gratuito incluido 🎁',
  'Emprendimiento': 'Actualizaciones automáticas del sistema + soporte técnico gratuito incluido 🎁',
  'Negocio Familiar': 'Actualizaciones automáticas del sistema + soporte técnico gratuito incluido 🎁'
};


document.addEventListener('DOMContentLoaded', () => {


      
      // 1. Selector de Tema Claro/Oscuro con Persistencia
      const themeToggleBtn = document.getElementById('theme-toggle');

      themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.add('theme-transition');
        const docClass = document.documentElement.classList;
        if (docClass.contains('dark')) {
          docClass.remove('dark');
          localStorage.setItem('theme', 'light');
        } else {
          docClass.add('dark');
          localStorage.setItem('theme', 'dark');
        }
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transition');
        }, 300);
      });

      // 2. Menú Hamburguesa Móvil
      const menuHamburger = document.getElementById('menu-hamburger');
      const navbarMenu = document.getElementById('navbar-menu');
      
      menuHamburger.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
        menuHamburger.classList.toggle('active');
      });

      // Cerrar menú móvil al dar clic a cualquier enlace
      navbarMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navbarMenu.classList.remove('active');
          menuHamburger.classList.remove('active');
        });
      });

      // 3. Scroll Reveal Animaciones Suaves
      const revealElements = document.querySelectorAll('.reveal');
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -12% 0px', // Dispara ligeramente antes de entrar
        threshold: 0.05
      };

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.id === 'negocio-organizado') {
              startOrganizedCounters();
            }
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      function startOrganizedCounters() {
        const counters = [
          { id: 'counter-ventas', target: 850000, prefix: '$', suffix: '', isCurrency: true },
          { id: 'counter-inventario', target: 98, prefix: '', suffix: '%', isCurrency: false },
          { id: 'counter-clientes', target: 24, prefix: '', suffix: '', isCurrency: false }
        ];

        counters.forEach(c => {
          const el = document.getElementById(c.id);
          if (!el) return;
          
          let start = 0;
          const duration = 1800; // 1.8 seconds
          const startTime = performance.now();

          function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(start + easeProgress * c.target);

            if (c.isCurrency) {
              el.textContent = c.prefix + currentValue.toLocaleString('es-CO');
            } else {
              el.textContent = c.prefix + currentValue + c.suffix;
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              if (c.isCurrency) {
                el.textContent = c.prefix + c.target.toLocaleString('es-CO');
              } else {
                el.textContent = c.prefix + c.target + c.suffix;
              }
            }
          }
          requestAnimationFrame(animate);
        });
      }

      revealElements.forEach(el => revealObserver.observe(el));
      
      // Forzar visibilidad del Hero al inicio inmediatamente
      setTimeout(() => {
        document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('visible'));
      }, 100);

      // 4. Modales de Términos de Servicio y Privacidad
      const openTerminos = document.getElementById('open-terminos');
      const openPrivacidad = document.getElementById('open-privacidad');
      const modalTerminos = document.getElementById('modal-terminos');
      const modalPrivacidad = document.getElementById('modal-privacidad');
      
      function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        
        // Enfocar primer elemento interactivo o el modal
        const closeBtn = modal.querySelector('[data-close]');
        if (closeBtn) closeBtn.focus();
      }
      
      function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
      }
      
      if (openTerminos) {
        openTerminos.addEventListener('click', (e) => {
          e.preventDefault();
          openModal(modalTerminos);
        });
      }
      
      if (openPrivacidad) {
        openPrivacidad.addEventListener('click', (e) => {
          e.preventDefault();
          openModal(modalPrivacidad);
        });
      }
      
      // Cerrar modales mediante clicks en elementos [data-close] o el overlay
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.querySelectorAll('[data-close]').forEach(btn => {
          btn.addEventListener('click', () => closeModal(modal));
        });
        
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModal(modal);
          }
        });
      });
      
      // 5. Modal Dinámico Interactable del Dashboard
      const dashboardModal = document.getElementById('dashboard-modal');
      const dashboardTitle = document.getElementById('dashboard-modal-title');
      const dashboardBody = document.getElementById('dashboard-modal-body');
      
      const dashboardTemplates = {
        ventas: {
          title: `📈 Ventas del Mes`,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
          render: (container) => {
            container.innerHTML = `
              <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.4; margin: 0 0 0.8rem 0;">
                Monitorea el rendimiento financiero de tu negocio en tiempo real. Pasa el cursor o presiona las barras para ver las ventas diarias.
              </p>
              
              <!-- KPIs Rápidos -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin-bottom: 0.8rem;">
                <div style="background: rgba(16, 185, 129, 0.04); padding: 0.6rem; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.12); text-align: center;">
                  <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; font-weight: 500; margin-bottom: 0.1rem;">Ventas Hoy</span>
                  <strong style="font-size: 1.1rem; color: var(--color-success); font-family: var(--font-titles); font-weight: 700;">$450,000</strong>
                </div>
                <div style="background: rgba(37, 99, 235, 0.04); padding: 0.6rem; border-radius: 10px; border: 1px solid rgba(37, 99, 235, 0.12); text-align: center;">
                  <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; font-weight: 500; margin-bottom: 0.1rem;">Clientes Hoy</span>
                  <strong style="font-size: 1.1rem; color: var(--color-primary); font-family: var(--font-titles); font-weight: 700;">18</strong>
                </div>
                <div style="background: rgba(100, 116, 139, 0.04); padding: 0.6rem; border-radius: 10px; border: 1px solid rgba(100, 116, 139, 0.12); text-align: center;">
                  <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; font-weight: 500; margin-bottom: 0.1rem;">Caja Chica</span>
                  <strong style="font-size: 1.1rem; color: var(--color-text-main); font-family: var(--font-titles); font-weight: 700;">$50,000</strong>
                </div>
              </div>

              <!-- Gráfico de Ventas Interactivo -->
              <div style="background: rgba(100, 116, 139, 0.02); padding: 0.8rem 1rem; border-radius: 12px; border: 1px solid var(--color-border); position: relative; margin-bottom: 0.8rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                  <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-main);">Facturación Semanal</span>
                  <span id="chart-tooltip" style="font-size: 0.74rem; font-weight: 700; color: var(--color-primary); background: var(--color-primary-light); padding: 0.15rem 0.5rem; border-radius: 4px; transition: all 0.2s;">
                    Selecciona una barra
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 95px; padding: 0 0.2rem; gap: 0.5rem;">
                  <!-- Barra Lunes -->
                  <div class="interactive-bar" data-val="$320,000" data-day="Lunes" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; height: 100%; cursor: pointer; justify-content: flex-end;">
                    <div style="background: linear-gradient(to top, var(--color-primary) 0%, #60a5fa 100%); width: 100%; border-radius: 4px 4px 0 0; transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s; height: 0;" data-height="65%"></div>
                    <span style="font-size: 0.65rem; font-weight: 600; color: var(--color-text-muted);">Lun</span>
                  </div>
                  <!-- Barra Martes -->
                  <div class="interactive-bar" data-val="$410,000" data-day="Martes" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; height: 100%; cursor: pointer; justify-content: flex-end;">
                    <div style="background: linear-gradient(to top, var(--color-primary) 0%, #60a5fa 100%); width: 100%; border-radius: 4px 4px 0 0; transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s; height: 0;" data-height="82%"></div>
                    <span style="font-size: 0.65rem; font-weight: 600; color: var(--color-text-muted);">Mar</span>
                  </div>
                  <!-- Barra Miércoles -->
                  <div class="interactive-bar" data-val="$380,000" data-day="Miércoles" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; height: 100%; cursor: pointer; justify-content: flex-end;">
                    <div style="background: linear-gradient(to top, var(--color-primary) 0%, #60a5fa 100%); width: 100%; border-radius: 4px 4px 0 0; transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s; height: 0;" data-height="76%"></div>
                    <span style="font-size: 0.65rem; font-weight: 600; color: var(--color-text-muted);">Mié</span>
                  </div>
                  <!-- Barra Jueves -->
                  <div class="interactive-bar" data-val="$450,000" data-day="Jueves" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; height: 100%; cursor: pointer; justify-content: flex-end;">
                    <div style="background: linear-gradient(to top, var(--color-primary) 0%, #60a5fa 100%); width: 100%; border-radius: 4px 4px 0 0; transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s; height: 0;" data-height="90%"></div>
                    <span style="font-size: 0.65rem; font-weight: 600; color: var(--color-text-muted);">Jue</span>
                  </div>
                  <!-- Barra Viernes -->
                  <div class="interactive-bar" data-val="$520,000" data-day="Viernes" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; height: 100%; cursor: pointer; justify-content: flex-end;">
                    <div style="background: linear-gradient(to top, var(--color-success) 0%, #34d399 100%); width: 100%; border-radius: 4px 4px 0 0; transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s; height: 0;" data-height="100%"></div>
                    <span style="font-size: 0.65rem; font-weight: 700; color: var(--color-success);">Vie</span>
                  </div>
                </div>
              </div>

              <!-- Context Box -->
              <div style="padding: 0.8rem; border-radius: 10px; background: rgba(37, 99, 235, 0.04); border: 1px solid rgba(37, 99, 235, 0.08); font-size: 0.82rem; line-height: 1.4; color: var(--color-text-muted);">
                💡 <strong>Control de Caja:</strong> Este módulo elimina el cuadre manual al cierre del día, te permite delegar operaciones de caja con auditoría de movimientos y previene fugas de dinero (robos hormiga).
              </div>
            `;

            // Trigger chart animations
            setTimeout(() => {
              container.querySelectorAll('.interactive-bar div').forEach(barEl => {
                barEl.style.height = barEl.getAttribute('data-height');
              });
            }, 100);

            // Add tooltip event listeners
            const tooltip = container.querySelector('#chart-tooltip');
            container.querySelectorAll('.interactive-bar').forEach(barNode => {
              function showVal() {
                const val = barNode.getAttribute('data-val');
                const day = barNode.getAttribute('data-day');
                tooltip.textContent = `${day}: ${val}`;
                tooltip.style.color = 'var(--color-primary)';
                container.querySelectorAll('.interactive-bar div').forEach(d => d.style.opacity = '0.5');
                barNode.querySelector('div').style.opacity = '1';
              }
              barNode.addEventListener('mouseenter', showVal);
              barNode.addEventListener('click', showVal);
              barNode.addEventListener('mouseleave', () => {
                tooltip.textContent = 'Selecciona una barra';
                container.querySelectorAll('.interactive-bar div').forEach(d => d.style.opacity = '1');
              });
            });
          }
        },
        tareas: {
          title: `📋 Lista de Control de Procesos`,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-square"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
          render: (container) => {
            container.innerHTML = `
              <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.4; margin: 0 0 0.8rem 0;">
                Asegura que tu equipo cumpla los estándares diarios de apertura, operación y cierre. Marca las tareas para ver la productividad.
              </p>
              
              <!-- Checklist -->
              <div style="background: rgba(100, 116, 139, 0.02); padding: 0.8rem 1rem; border-radius: 12px; border: 1px solid var(--color-border); margin-bottom: 0.8rem;">
                <div id="todo-list" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.8rem;">
                  <!-- Item 1 -->
                  <label class="todo-item" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.6rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; user-select: none; transition: background-color 0.2s;">
                    <input type="checkbox" checked style="width: 15px; height: 15px; accent-color: var(--color-success);" />
                    <span style="font-size: 0.82rem; font-weight: 500; color: var(--color-text-main); text-decoration: line-through; opacity: 0.6; transition: all 0.2s;">
                      Revisar cuadre de caja inicial (Apertura)
                    </span>
                  </label>
                  <!-- Item 2 -->
                  <label class="todo-item" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.6rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; user-select: none; transition: background-color 0.2s;">
                    <input type="checkbox" checked style="width: 15px; height: 15px; accent-color: var(--color-success);" />
                    <span style="font-size: 0.82rem; font-weight: 500; color: var(--color-text-main); text-decoration: line-through; opacity: 0.6; transition: all 0.2s;">
                      Verificar stock de insumos críticos
                    </span>
                  </label>
                  <!-- Item 3 -->
                  <label class="todo-item" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.6rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; user-select: none; transition: background-color 0.2s;">
                    <input type="checkbox" style="width: 15px; height: 15px; accent-color: var(--color-success);" />
                    <span style="font-size: 0.82rem; font-weight: 500; color: var(--color-text-main); transition: all 0.2s;">
                      Conciliar ventas del día antes de cerrar (Cierre)
                    </span>
                  </label>
                </div>

                <!-- Input agregar tarea -->
                <div style="display: flex; gap: 0.4rem;">
                  <input type="text" id="new-task-input" placeholder="Nueva tarea operativa..." style="flex: 1; padding: 0.5rem 0.6rem; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text-main); outline: none; font-size: 0.82rem; transition: border-color 0.2s;" />
                  <button type="button" id="add-task-btn" style="padding: 0.5rem 1rem; border-radius: 8px; border: none; background: var(--color-primary); color: #fff; font-weight: 600; font-size: 0.82rem; cursor: pointer; transition: background-color 0.2s;">
                    Agregar
                  </button>
                </div>
              </div>

              <!-- Context Box -->
              <div style="padding: 0.8rem; border-radius: 10px; background: rgba(37, 99, 235, 0.04); border: 1px solid rgba(37, 99, 235, 0.08); font-size: 0.82rem; line-height: 1.4; color: var(--color-text-muted);">
                📋 <strong>Estandariza tu Operación:</strong> Centraliza las rutinas de tu equipo. Este módulo te permite delegar tareas críticas con la tranquilidad de que se cumplan, obteniendo alertas en tiempo real.
              </div>
            `;

            // Function to bind checkbox behavior
            const todoList = container.querySelector('#todo-list');
            
            function bindCheckbox(item) {
              const chk = item.querySelector('input');
              const text = item.querySelector('span');
              chk.addEventListener('change', () => {
                if (chk.checked) {
                  text.style.textDecoration = 'line-through';
                  text.style.opacity = '0.6';
                  item.style.background = 'var(--color-bg)';
                } else {
                  text.style.textDecoration = 'none';
                  text.style.opacity = '1';
                  item.style.background = 'var(--color-surface)';
                }
              });
            }

            todoList.querySelectorAll('.todo-item').forEach(bindCheckbox);

            // Add new task behavior
            const input = container.querySelector('#new-task-input');
            const addBtn = container.querySelector('#add-task-btn');

            function addTask() {
              const val = input.value.trim();
              if (!val) return;
              
              const newLabel = document.createElement('label');
              newLabel.className = 'todo-item';
              newLabel.style.display = 'flex';
              newLabel.style.alignItems = 'center';
              newLabel.style.gap = '0.6rem';
              newLabel.style.padding = '0.5rem 0.6rem';
              newLabel.style.background = 'var(--color-surface)';
              newLabel.style.border = '1px solid var(--color-border)';
              newLabel.style.borderRadius = '8px';
              newLabel.style.cursor = 'pointer';
              newLabel.style.userSelect = 'none';
              newLabel.style.opacity = '0';
              newLabel.style.transform = 'translateY(10px)';
              newLabel.style.transition = 'all 0.3s ease';

              newLabel.innerHTML = `
                <input type="checkbox" style="width: 15px; height: 15px; accent-color: var(--color-success);" />
                <span style="font-size: 0.82rem; font-weight: 500; color: var(--color-text-main); transition: all 0.2s;">
                  ${val}
                </span>
              `;

              todoList.appendChild(newLabel);
              bindCheckbox(newLabel);
              
              // Animate fade-in
              setTimeout(() => {
                newLabel.style.opacity = '1';
                newLabel.style.transform = 'translateY(0)';
              }, 10);

              input.value = '';
              input.focus();
            }

            addBtn.addEventListener('click', addTask);
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') addTask();
            });
          }
        },
        pedidos: {
          title: `📦 Monitor de Pedidos del Día`,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
          render: (container) => {
            container.innerHTML = `
              <p style="font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.4; margin: 0 0 0.8rem 0;">
                Administra tus ventas y entregas en tiempo real. Presiona la etiqueta de estado para alternar su fase (Pendiente ➔ En Proceso ➔ Entregado).
              </p>
              
              <!-- Lista de Pedidos -->
              <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.8rem;">
                <!-- Pedido 1 -->
                <div class="order-row" style="background: rgba(100, 116, 139, 0.02); padding: 0.6rem 0.8rem; border-radius: 10px; border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                  <div>
                    <strong style="font-size: 0.82rem; color: var(--color-text-main); display: block;">Pedido #1042</strong>
                    <span style="font-size: 0.72rem; color: var(--color-text-muted);">Carlos Gómez • Total: $85,000</span>
                  </div>
                  <button type="button" class="status-btn" data-status="proceso" style="padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.7rem; font-weight: 700; cursor: pointer; border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.08); color: #d97706; outline: none; transition: all 0.2s;">
                    En Proceso
                  </button>
                </div>
                <!-- Pedido 2 -->
                <div class="order-row" style="background: rgba(100, 116, 139, 0.02); padding: 0.6rem 0.8rem; border-radius: 10px; border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                  <div>
                    <strong style="font-size: 0.82rem; color: var(--color-text-main); display: block;">Pedido #1041</strong>
                    <span style="font-size: 0.72rem; color: var(--color-text-muted);">María Restrepo • Total: $120,000</span>
                  </div>
                  <button type="button" class="status-btn" data-status="entregado" style="padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.7rem; font-weight: 700; cursor: pointer; border: 1px solid var(--color-success); background: var(--color-success-light); color: var(--color-success); outline: none; transition: all 0.2s;">
                    Entregado
                  </button>
                </div>
                <!-- Pedido 3 -->
                <div class="order-row" style="background: rgba(100, 116, 139, 0.02); padding: 0.6rem 0.8rem; border-radius: 10px; border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                  <div>
                    <strong style="font-size: 0.82rem; color: var(--color-text-main); display: block;">Pedido #1040</strong>
                    <span style="font-size: 0.72rem; color: var(--color-text-muted);">Taller El Sol • Total: $340,000</span>
                  </div>
                  <button type="button" class="status-btn" data-status="pendiente" style="padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.7rem; font-weight: 700; cursor: pointer; border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.08); color: #dc2626; outline: none; transition: all 0.2s;">
                    Pendiente
                  </button>
                </div>
              </div>

              <!-- Context Box -->
              <div style="padding: 0.8rem; border-radius: 10px; background: rgba(37, 99, 235, 0.04); border: 1px solid rgba(37, 99, 235, 0.08); font-size: 0.82rem; line-height: 1.4; color: var(--color-text-muted);">
                📦 <strong>Evita Retrasos y Pérdidas:</strong> Centraliza el seguimiento de despachos. Evita pedidos perdidos, demoras en envíos o confusiones de precios al delegar la toma de pedidos a tus vendedores.
              </div>
            `;

            // Function to handle status toggling
            const statusConfig = {
              pendiente: {
                label: 'Pendiente',
                border: '1px solid #ef4444',
                bg: 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
                next: 'proceso'
              },
              proceso: {
                label: 'En Proceso',
                border: '1px solid #f59e0b',
                bg: 'rgba(245, 158, 11, 0.08)',
                color: '#d97706',
                next: 'entregado'
              },
              entregado: {
                label: 'Entregado',
                border: '1px solid var(--color-success)',
                bg: 'var(--color-success-light)',
                color: 'var(--color-success)',
                next: 'pendiente'
              }
            };

            container.querySelectorAll('.status-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                const currentStatus = btn.getAttribute('data-status');
                const nextStatus = statusConfig[currentStatus].next;
                const config = statusConfig[nextStatus];

                btn.setAttribute('data-status', nextStatus);
                btn.textContent = config.label;
                btn.style.border = config.border;
                btn.style.background = config.bg;
                btn.style.color = config.color;

                // Microconfetti if changed to delivered!
                if (nextStatus === 'entregado') {
                  const rect = btn.getBoundingClientRect();
                  createConfettiAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
                }
              });
            });

            // Helper to generate micro-confetti
            function createConfettiAt(x, y) {
              const body = document.body;
              for (let i = 0; i < 15; i++) {
                const p = document.createElement('div');
                p.className = 'cta-particle';
                p.style.left = x + 'px';
                p.style.top = y + 'px';
                p.style.background = `hsl(${Math.random() * 360}, 90%, 60%)`;
                
                const angle = Math.random() * Math.PI * 2;
                const speed = 30 + Math.random() * 50;
                const tx = Math.cos(angle) * speed;
                const ty = Math.sin(angle) * speed;
                
                p.style.setProperty('--bx', tx + 'px');
                p.style.setProperty('--by', ty + 'px');
                p.style.animation = 'ctaBurst 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards';
                
                body.appendChild(p);
                setTimeout(() => p.remove(), 700);
              }
            }
          }
        }
      };

      // Bind clicks to SVG mini-modules
      document.querySelectorAll('.svg-card-interactive[data-dashboard-module]').forEach(moduleBtn => {
        const modKey = moduleBtn.getAttribute('data-dashboard-module');
        
        function handleOpen(e) {
          if (e && e.target && (
            e.target.closest('.svg-todo-item') ||
            e.target.closest('.svg-interactive-status') ||
            e.target.closest('.svg-chart-dot-hit')
          )) {
            return; // No abrir el modal si se hizo clic en un control interactivo
          }
          const tpl = dashboardTemplates[modKey];
          if (!tpl) return;

          dashboardTitle.innerHTML = `${tpl.icon} <span>${tpl.title}</span>`;
          tpl.render(dashboardBody);

          const containerNode = dashboardModal.querySelector('.modal-container');

          if (window.innerWidth <= 768) {
            containerNode.style.setProperty('--origin-x', 'center');
            containerNode.style.setProperty('--origin-y', 'center');
            dashboardModal.style.setProperty('--click-x', '50%');
            dashboardModal.style.setProperty('--click-y', '50%');
            openModal(dashboardModal);
            return;
          }

          const rect = moduleBtn.getBoundingClientRect();

          // Medición precisa forzando visualización sin transición
          containerNode.style.transition = 'none';
          dashboardModal.style.opacity = '0';
          dashboardModal.style.display = 'flex';
          dashboardModal.classList.add('active');
          const containerRect = containerNode.getBoundingClientRect();
          dashboardModal.classList.remove('active');
          dashboardModal.style.display = '';
          dashboardModal.style.opacity = '';
          containerNode.offsetHeight; // force reflow
          containerNode.style.transition = ''; // restaurar transición

          if (rect && containerRect && containerRect.width > 0) {
            const clickX = rect.left + rect.width / 2;
            const clickY = rect.top + rect.height / 2;
            
            // Relativas al contenedor para el transform-origin
            const relX = clickX - containerRect.left;
            const relY = clickY - containerRect.top;
            containerNode.style.setProperty('--origin-x', `${relX}px`);
            containerNode.style.setProperty('--origin-y', `${relY}px`);
            
            // Absolutas respecto al viewport para el gradiente del overlay
            dashboardModal.style.setProperty('--click-x', `${clickX}px`);
            dashboardModal.style.setProperty('--click-y', `${clickY}px`);
          } else {
            containerNode.style.setProperty('--origin-x', 'center');
            containerNode.style.setProperty('--origin-y', 'center');
            dashboardModal.style.setProperty('--click-x', '50%');
            dashboardModal.style.setProperty('--click-y', '50%');
          }

          // Abre el modal con la animación
          openModal(dashboardModal);
        }

        moduleBtn.addEventListener('click', handleOpen);
        moduleBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen(e);
          }
        });
      });

      // === INTERACTIVIDAD DEL MINI-DASHBOARD INLINE EN HERO ===
      (function() {
        const wrapper = document.querySelector('.hero-illustration-wrapper');
        const hint = document.querySelector('.svg-interactive-hint');
        if (!wrapper) return;

        let userInteracted = false;

        function hideHint() {
          if (hint && !hint.classList.contains('hidden')) {
            hint.classList.add('hidden');
          }
        }

        function markInteraction(e) {
          if (e && e.isTrusted === false) return; // Evitar que clics programáticos apaguen la interactividad
          userInteracted = true;
          hideHint();
        }

        // Registrar interacción global en el contenedor para apagar la guía
        wrapper.addEventListener('click', markInteraction, { capture: true });
        wrapper.addEventListener('touchstart', markInteraction, { passive: true });

        // 1. Módulo Ventas: Hover en puntos del gráfico SVG
        const guides = wrapper.querySelectorAll('.svg-chart-guide');
        const dotHits = wrapper.querySelectorAll('.svg-chart-dot-hit');
        const chartTooltip = wrapper.querySelector('#svg-chart-tooltip');
        const chartTooltipText = chartTooltip ? chartTooltip.querySelector('text') : null;
        const chartDots = wrapper.querySelectorAll('.svg-chart-dot, .svg-chart-dot-growing');

        dotHits.forEach((hit, idx) => {
          hit.addEventListener('mouseenter', (e) => {
            markInteraction(e);
            const val = hit.getAttribute('data-val');
            const cx = parseFloat(hit.getAttribute('cx'));
            const cy = parseFloat(hit.getAttribute('cy'));

            if (chartTooltip && chartTooltipText) {
              chartTooltipText.textContent = val;
              // Centrar el tooltip arriba del punto (ancho del rect es 56, alto es 18)
              chartTooltip.setAttribute('transform', `translate(${cx - 28}, ${cy - 26})`);
              chartTooltip.style.opacity = '1';
            }

            if (guides[idx]) guides[idx].style.opacity = '0.35';
            if (chartDots[idx]) {
              chartDots[idx].setAttribute('r', '6');
            }
          });

          hit.addEventListener('mouseleave', () => {
            if (chartTooltip) chartTooltip.style.opacity = '0';
            if (guides[idx]) guides[idx].style.opacity = '0';
            if (chartDots[idx]) {
              const origR = '4';
              chartDots[idx].setAttribute('r', origR);
            }
          });
        });

        // 2. Módulo Lista de Control: Clic directo en checkboxes del SVG
        const todoItems = wrapper.querySelectorAll('.svg-todo-item');
        todoItems.forEach(item => {
          item.addEventListener('mouseenter', markInteraction);
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            markInteraction(e);

            const isChecked = item.getAttribute('data-checked') === 'true';
            item.setAttribute('data-checked', isChecked ? 'false' : 'true');
          });
        });

        // Helper para lanzar micro-confeti
        function createConfettiAt(x, y) {
          const body = document.body;
          for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            p.className = 'cta-particle';
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.background = `hsl(${Math.random() * 360}, 90%, 60%)`;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 50;
            const tx = Math.cos(angle) * speed;
            const ty = Math.sin(angle) * speed;
            
            p.style.setProperty('--bx', tx + 'px');
            p.style.setProperty('--by', ty + 'px');
            p.style.animation = 'ctaBurst 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards';
            
            body.appendChild(p);
            setTimeout(() => p.remove(), 700);
          }
        }

        // 3. Módulo Últimos Pedidos: Toggle del badge de estado
        const statusConfig = {
          pendiente: {
            text: 'Pendiente',
            fill: 'rgba(239, 68, 68, 0.08)',
            stroke: '#ef4444',
            color: '#dc2626',
            next: 'proceso'
          },
          proceso: {
            text: 'En Proceso',
            fill: 'rgba(245, 158, 11, 0.08)',
            stroke: '#f59e0b',
            color: '#d97706',
            next: 'entregado'
          },
          entregado: {
            text: 'Entregado',
            fill: 'var(--color-success-light)',
            stroke: 'var(--color-success)',
            color: 'var(--color-success)',
            next: 'pendiente'
          }
        };

        const statusGroup = wrapper.querySelector('.svg-interactive-status');
        if (statusGroup) {
          statusGroup.addEventListener('mouseenter', markInteraction);
          statusGroup.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            markInteraction(e);

            const current = statusGroup.getAttribute('data-status') || 'entregado';
            const config = statusConfig[current];
            const nextStatus = config.next;
            const nextConfig = statusConfig[nextStatus];

            statusGroup.setAttribute('data-status', nextStatus);

            const rect = statusGroup.querySelector('.status-rect');
            const text = statusGroup.querySelector('.status-text');

            if (rect) {
              rect.setAttribute('fill', nextConfig.fill);
              rect.setAttribute('stroke', nextConfig.stroke);
            }
            if (text) {
              text.setAttribute('fill', nextConfig.color);
              text.textContent = nextConfig.text;
            }

            // Confeti si pasa a Entregado
            if (nextStatus === 'entregado') {
              const rectGeom = statusGroup.getBoundingClientRect();
              createConfettiAt(rectGeom.left + rectGeom.width / 2, rectGeom.top + rectGeom.height / 2);
            }
          });
        }

        // 4. Attraction Loop (Animación autómata inicial al cargar la página)
        setTimeout(() => {
          if (userInteracted) return;

          // Paso A: Marcar el tercer checkbox de control
          const task3 = wrapper.querySelector('.svg-todo-item[data-index="3"]');
          if (task3 && !userInteracted) {
            task3.setAttribute('data-checked', 'true');
            setTimeout(() => {
              if (!userInteracted) {
                task3.setAttribute('data-checked', 'false');
              }
            }, 1200);
          }

          // Paso B: Mostrar tooltip de la gráfica durante 1.2 segundos
          const dot2 = wrapper.querySelector('.svg-chart-dot-hit[data-index="2"]');
          if (dot2 && !userInteracted) {
            const enterEvt = new Event('mouseenter');
            const leaveEvt = new Event('mouseleave');
            dot2.dispatchEvent(enterEvt);
            setTimeout(() => {
              if (!userInteracted) {
                dot2.dispatchEvent(leaveEvt);
              }
            }, 1200);
          }

          // Paso C: Ciclar estados de Pedidos hasta volver a Entregado con confeti
          if (statusGroup && !userInteracted) {
            setTimeout(() => {
              if (userInteracted) return;
              statusGroup.dispatchEvent(new Event('click')); // Entregado -> Pendiente
              
              setTimeout(() => {
                if (userInteracted) return;
                statusGroup.dispatchEvent(new Event('click')); // Pendiente -> En Proceso
                
                setTimeout(() => {
                  if (userInteracted) return;
                  statusGroup.dispatchEvent(new Event('click')); // En Proceso -> Entregado (Confeti!)
                }, 1000);
              }, 1000);
            }, 1500);
          }

        }, 2200);
      })();
      
      // Close dynamic dashboard modal
      const closeDashboardModal = document.getElementById('close-dashboard-modal');
      if (closeDashboardModal) {
        closeDashboardModal.addEventListener('click', () => closeModal(dashboardModal));
      }

      // Cerrar con la tecla Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeModal(modalTerminos);
          closeModal(modalPrivacidad);
          closeModal(dashboardModal);
        }
      });

    });

// ==========================================
// ANIMACIONES Y MEJORAS PREMIUM EXTENDIDAS
// ==========================================
// === SCROLL PROGRESS BAR ===
    (function() {
      const bar = document.getElementById('scroll-progress-bar');
      if (!bar) return;
      function updateBar() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
      }
      window.addEventListener('scroll', updateBar, { passive: true });
    })();

    // === PARALLAX 3D / 2.5D INTERACTIVO EN MOCKUP HERO ===
    (function() {
      const wrapper = document.querySelector('.hero-illustration-wrapper');
      const svg = document.querySelector('.hero-illustration');
      if (!wrapper || !svg || window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const cards = svg.querySelectorAll('.svg-card-interactive');
      
      wrapper.addEventListener('mouseenter', () => {
        svg.style.animation = 'none'; // Detener flotación básica
        svg.style.transition = 'none';
        cards.forEach(c => c.style.transition = 'none');
      });

      wrapper.addEventListener('mousemove', e => {
        const rect = wrapper.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2); // De -1 a 1
        const dy = (e.clientY - cy) / (rect.height / 2); // De -1 a 1

        // Rotación 3D del plano de la ventana principal (sin transición para respuesta inmediata)
        svg.style.transform = `perspective(1000px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg)`;

        // Desplazamiento Parallax 2.5D en sub-tarjetas
        cards.forEach(card => {
          const mod = card.getAttribute('data-dashboard-module');
          let factor = 0;
          if (mod === 'ventas') factor = 14;      // Capa superior
          else if (mod === 'tareas') factor = 9;   // Capa intermedia
          else if (mod === 'pedidos') factor = 4;  // Capa inferior
          
          card.style.transform = `translate(${dx * factor}px, ${dy * factor}px) scale(1.02)`;
        });
      });

      wrapper.addEventListener('mouseleave', () => {
        svg.style.transition = 'transform 0.5s ease-out';
        svg.style.transform = '';
        cards.forEach(card => {
          card.style.transition = 'transform 0.5s ease-out';
          card.style.transform = '';
        });
        
        // Esperar que termine la transición de regreso y reactivar flotación
        setTimeout(() => {
          if (!wrapper.matches(':hover')) {
            svg.style.animation = 'floatIllustration 6s ease-in-out infinite';
          }
        }, 500);
      });
    })();

    // === WHATSAPP FAB — Aparece tras 1.5s ===
    (function() {
      const fab = document.getElementById('whatsapp-fab');
      if (!fab) return;
      setTimeout(() => fab.classList.add('fab-visible'), 1500);
    })();

    // === HERO H1 — WORD BY WORD ===
    (function() {
      const h1 = document.querySelector('#hero h1');
      if (!h1) return;
      const text = h1.textContent;
      const words = text.split(' ');
      h1.innerHTML = words.map((word, i) =>
        `<span class="word-span" style="animation-delay:${i * 0.07}s">${word}</span>`
      ).join(' ');
    })();

    document.addEventListener('DOMContentLoaded', () => {

      // === SCROLL SUAVE PREMIUM CON OFFSET Y PREVENCIÓN DE ADVERTENCIAS FILE:// ===
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href');
          if (targetId === '#') return; // Ignorar enlace vacío a tope de página
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const headerEl = document.querySelector('header');
            const navbarHeight = headerEl ? headerEl.offsetHeight : 80;
            const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight + 2;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });

            // Cambiar la URL limpia sin causar warnings de origen cruzado en local (protocolo file://)
            if (window.location.protocol !== 'file:') {
              history.pushState(null, null, targetId);
            }
          }
        });
      });

      // === NAVBAR ACTIVE SECTION OBSERVER ===
      const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
      const sectionIds = ['rubros','problema','solucion','beneficios','testimonios','como-funciona','soporte'];
      const sectionEls = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

      if (sectionEls.length > 0) {
        const navObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              navLinks.forEach(a => a.classList.remove('nav-active'));
              const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
              if (active) active.classList.add('nav-active');
            }
          });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
        sectionEls.forEach(el => navObserver.observe(el));
      }

      // === 3D TILT EN CARDS — solo desktop ===
      if (window.innerWidth > 768) {
        document.querySelectorAll('.glass-card:not(.testimonial-card):not(.faq-item), .rubro-card').forEach(card => {
          card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
          });
          card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            
            const isLarge = card.classList.contains('before-after-card');
            const maxRot = isLarge ? 1.5 : 4;
            const perspectiveVal = isLarge ? 2000 : 900;
            const scale = isLarge ? 1.01 : (card.classList.contains('rubro-card') ? 1.03 : 1.025);
            
            card.style.transform = `perspective(${perspectiveVal}px) rotateX(${-dy * maxRot}deg) rotateY(${dx * maxRot}deg) translateY(-6px) scale(${scale})`;
          });
          card.addEventListener('mouseleave', () => {
            card.style.transition = '';
            card.style.transform = '';
          });
        });
      }

      // === 3D TILT EN MÓVILES (GIROSCOPIO CON CALIBRACIÓN DINÁMICA Y AUTO-DECAY) ===
      if (window.innerWidth <= 768) {
        const mobileTargetCards = document.querySelectorAll('.glass-card:not(.testimonial-card):not(.faq-item), .rubro-card');
        if (mobileTargetCards.length > 0) {
          const visibleCards = new Set();
          
          // IntersectionObserver para registrar solo tarjetas visibles en el viewport y ahorrar batería
          const mobileTiltObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                visibleCards.add(entry.target);
                entry.target.style.transition = 'transform 0.3s ease-out';
              } else {
                visibleCards.delete(entry.target);
                entry.target.style.transform = '';
                entry.target.style.transition = '';
              }
            });
          }, { threshold: 0.1 });
          
          mobileTargetCards.forEach(card => mobileTiltObserver.observe(card));
          
          let lastMobileUpdate = 0;
          let mobileTiltRAF = null;
          
          // Referencia móvil auto-adaptativa
          let baselineBeta = null;
          let baselineGamma = null;
          
          window.addEventListener('deviceorientation', (e) => {
            const now = Date.now();
            if (now - lastMobileUpdate < 33) return; // Limitar actualizaciones a ~30Hz
            lastMobileUpdate = now;
            
            if (visibleCards.size === 0) return;
            
            const beta = e.beta;   // Eje X: delante/atrás (-180 a 180)
            const gamma = e.gamma; // Eje Y: izq/der (-90 a 90)
            
            if (beta === null || gamma === null) return;
            
            // Inicializar o auto-adaptar lentamente la baseline (filtro paso bajo)
            if (baselineBeta === null || baselineGamma === null) {
              baselineBeta = beta;
              baselineGamma = gamma;
            } else {
              // Convergencia lenta: el punto neutro se ajusta gradualmente a la postura actual del usuario
              baselineBeta = baselineBeta * 0.96 + beta * 0.04;
              baselineGamma = baselineGamma * 0.96 + gamma * 0.04;
            }
            
            // Calcular desviación respecto a la referencia móvil
            const diffBeta = beta - baselineBeta;
            const diffGamma = gamma - baselineGamma;
            
            // Rango seguro máximo de inclinación dinámica
            const clBeta = Math.max(-15, Math.min(15, diffBeta));
            const clGamma = Math.max(-15, Math.min(15, diffGamma));
            
            // Mapeo sutil a rotaciones 3D de un máximo de 6 grados
            const rotX = (-clBeta / 15) * 6;
            const rotY = (clGamma / 15) * 6;
            
            if (mobileTiltRAF) cancelAnimationFrame(mobileTiltRAF);
            
            mobileTiltRAF = requestAnimationFrame(() => {
              visibleCards.forEach(card => {
                const isLarge = card.classList.contains('before-after-card');
                const scale = card.classList.contains('rubro-card') ? 1.01 : (isLarge ? 1.005 : 1);
                
                // Reducir la rotación un 65% en la tarjeta antes-después (que es muy ancha) para evitar la distorsión
                const factor = isLarge ? 0.35 : 1;
                const rX = rotX * factor;
                const rY = rotY * factor;
                const perspectiveVal = isLarge ? 2000 : 800;
                
                card.style.transform = `perspective(${perspectiveVal}px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg) scale(${scale})`;
              });
            });
          });
        }
      }

    });

    // ==========================================
    // INYECCIÓN DE LAS 10 ANIMACIONES PREMIUM
    // ==========================================

    // 1. HERO CANVAS PARTICLES
    (function() {
      const canvas = document.getElementById('hero-canvas');
      if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Desactivar en pantallas móviles para ahorrar CPU / GPU y batería (INP)
      if (window.innerWidth < 768) {
        canvas.style.display = 'none';
        return;
      }
      const ctx = canvas.getContext('2d');
      const hero = document.getElementById('hero');
      if (!hero) return;
      let W, H, particles = [];
      const COUNT = 40, MAX_DIST = 100;
      function resize() {
        W = canvas.width = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
      }
      function mkParticle() {
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          r: Math.random() * 2 + 1
        };
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });
      for (let i = 0; i < COUNT; i++) particles.push(mkParticle());
      let mx = -999, my = -999;
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
      }, { passive: true });
      hero.addEventListener('mouseleave', () => {
        mx = -999;
        my = -999;
      });

      let isVisible = true;
      let animId = null;

      function draw() {
        if (!isVisible) {
          animId = null;
          return;
        }
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
          const dx = p.x - mx, dy = p.y - my, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            p.vx += (dx / dist) * 0.03;
            p.vy += (dy / dist) * 0.03;
          }
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(37, 99, 235, 0.28)';
          ctx.fill();
        });
        particles.forEach((a, i) => {
          particles.slice(i + 1).forEach(b => {
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < MAX_DIST) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(37, 99, 235, ${(1 - d / MAX_DIST) * 0.18})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });
        });
        animId = requestAnimationFrame(draw);
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            if (!animId) {
              animId = requestAnimationFrame(draw);
            }
          } else {
            if (animId) {
              cancelAnimationFrame(animId);
              animId = null;
            }
          }
        });
      }, { threshold: 0.05 });
      observer.observe(hero);
    })();

    // 2. RUBROS STAGGER + RIPPLE + MOBILE TOUCH HINTS
    (function() {
      const grid = document.querySelector('.rubros-grid');
      if (!grid) return;
      const cards = grid.querySelectorAll('.rubro-card');
      let triggered = false;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            grid.classList.add('stagger-in');
            // Hint táctil/visual en móviles: un amago de deslizamiento del overlay
            if (window.innerWidth <= 768 && !triggered) {
              triggered = true;
              cards.forEach((card, idx) => {
                setTimeout(() => {
                  card.classList.add('active');
                  setTimeout(() => {
                    card.classList.remove('active');
                  }, 1200);
                }, idx * 200); // Secuencia staggered
              });
            }
            obs.unobserve(grid);
          }
        });
      }, { threshold: 0.2 });
      obs.observe(grid);
      
      cards.forEach(card => {
        // Efecto Ripple al presionar
        card.addEventListener('pointerdown', e => {
          const rect = card.getBoundingClientRect();
          const rip = document.createElement('span');
          rip.className = 'rubro-ripple';
          const size = Math.max(rect.width, rect.height);
          rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
          card.appendChild(rip);
          rip.addEventListener('animationend', () => rip.remove());
        });

        // Soporte Táctil en Móvil (Alternar clase active al hacer click/tap)
        card.addEventListener('click', e => {
          if (window.innerWidth <= 768) {
            const isActive = card.classList.contains('active');
            // Limpiar las demás
            cards.forEach(c => c.classList.remove('active'));
            if (!isActive) {
              card.classList.add('active');
            }
          }
        });
      });

      // Cerrar el overlay si se toca en cualquier otra parte del documento en móvil
      document.addEventListener('click', e => {
        if (window.innerWidth <= 768 && !e.target.closest('.rubro-card')) {
          cards.forEach(c => c.classList.remove('active'));
        }
      });
    })();

    // 3. DOLOR COUNTER (#problema)
    (function() {
      const badge = document.getElementById('dolor-badge');
      const counter = document.getElementById('dolor-count');
      if (!badge || !counter) return;
      const h = new Date().getHours() + new Date().getMinutes() / 60;
      let val = h * 0.125; // Distribución aprox de 3h de trabajo manual diario acumulado
      counter.textContent = val.toFixed(2);
      let started = false;
      const parent = badge.closest('.section-header');
      if (!parent) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !started) {
            started = true;
            badge.style.display = 'inline-flex';
            setInterval(() => {
              val += 0.003;
              counter.textContent = val.toFixed(2);
            }, 1000);
          }
        });
      }, { threshold: 0.3 });
      obs.observe(parent);
    })();

    // 4. MORPHING TEXTO (#solucion)
    (function() {
      const h3 = document.querySelector('#solucion h3');
      if (!h3) return;
      const words = ['tu ferretería', 'tu restaurante', 'tu taller', 'tu tienda', 'tu emprendimiento', 'tu negocio'];
      let idx = 0;
      const span = document.createElement('span');
      span.className = 'morph-highlight morph-in';
      span.textContent = words[0];
      h3.innerHTML = 'Una herramienta adaptada a ';
      h3.appendChild(span);
      h3.appendChild(document.createTextNode('.'));
      setInterval(() => {
        span.classList.remove('morph-in');
        span.classList.add('morph-out');
        setTimeout(() => {
          idx = (idx + 1) % words.length;
          span.textContent = words[idx];
          span.classList.remove('morph-out');
          span.classList.add('morph-in');
        }, 380);
      }, 2500);
    })();

    // 5. TYPEWRITER (#beneficios)
    (function() {
      const h2 = document.querySelector('#beneficios .section-header h2');
      if (!h2) return;
      const text = h2.textContent;
      
      // Separar texto en caracteres envueltos en spans con opacidad 0
      h2.innerHTML = text.split('').map(char => 
        `<span class="typewriter-char" style="opacity: 0; transition: opacity 0.15s ease;">${char}</span>`
      ).join('');

      let done = false;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !done) {
            done = true;
            const chars = h2.querySelectorAll('.typewriter-char');
            let idx = 0;
            const t = setInterval(() => {
              if (idx < chars.length) {
                chars[idx].style.opacity = '1';
                idx++;
              } else {
                clearInterval(t);
              }
            }, 30);
            obs.unobserve(h2);
          }
        });
      }, { threshold: 0.2 });
      obs.observe(h2);
    })();

    // 6. CONFETTI (#negocio-organizado)
    (function() {
      function fireConfetti(card) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const colors = ['#2563eb', '#25d366', '#f59e0b', '#10b981'];
        const cx = card.offsetWidth / 2, cy = card.offsetHeight / 2;
        for (let i = 0; i < 8; i++) {
          const p = document.createElement('div');
          p.className = 'confetti-particle';
          const angle = (i / 8) * Math.PI * 2;
          const dist = 50 + Math.random() * 30;
          const tx = Math.cos(angle) * dist;
          const ty = Math.sin(angle) * dist;
          p.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};--tx:translate(${tx}px,${ty}px);`;
          card.appendChild(p);
          p.addEventListener('animationend', () => p.remove());
        }
      }
      const cards = document.querySelectorAll('.organizado-card');
      if (!cards.length) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const card = e.target;
            setTimeout(() => fireConfetti(card), 2000);
            obs.unobserve(card);
          }
        });
      }, { threshold: 0.5 });
      cards.forEach(c => obs.observe(c));
    })();

    // 7. TESTIMONIALS CAROUSEL DOTS (mobile) & AUTO-FLIP HINT
    (function() {
      const grid = document.getElementById('testimonials-grid');
      const dots = document.querySelectorAll('#testimonials-dots .t-dot');
      if (!grid || !dots.length) return;
      
      grid.addEventListener('scroll', () => {
        const idx = Math.round(grid.scrollLeft / grid.offsetWidth);
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      }, { passive: true });
      
      dots.forEach(d => d.addEventListener('click', () => {
        const i = parseInt(d.dataset.index);
        grid.scrollTo({ left: i * grid.offsetWidth, behavior: 'smooth' });
      }));

      // Hint de volteo dinámico en móviles al entrar al viewport
      const section = document.getElementById('testimonios');
      const cards = document.querySelectorAll('.testimonial-card');
      if (!section || !cards.length) return;
      let triggered = false;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !triggered) {
            triggered = true;
            // Ejecutar el amago de giro secuencial (stagger) en móvil
            if (window.innerWidth <= 768) {
              cards.forEach((card, idx) => {
                setTimeout(() => {
                  card.classList.add('hint-flip');
                  setTimeout(() => {
                    card.classList.remove('hint-flip');
                  }, 1200);
                }, idx * 250);
              });
            }
            obs.unobserve(section);
          }
        });
      }, { threshold: 0.15 });
      obs.observe(section);
    })();

    // 8. STEPS ACTIVATION (#como-funciona)
    (function() {
      const steps = document.querySelectorAll('.step-card');
      if (!steps.length) return;
      const stepObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('step-lit');
            stepObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.6 });
      steps.forEach(s => stepObs.observe(s));
    })();

    // 9. SOPORTE PING BADGE
    (function() {
      const badge = document.getElementById('soporte-badge');
      const text = document.getElementById('soporte-badge-text');
      if (!badge || !text) return;
      const h = new Date().getHours();
      const online = h >= 7 && h < 20;
      if (!online) {
        badge.classList.add('offline');
        text.textContent = 'Respuesta rápida · Soporte activo vía WhatsApp';
      }
    })();

    // 10. CTA PARTICLE BURST
    (function() {
      const ctaBtn = document.querySelector('#cta .btn-primary');
      if (!ctaBtn) return;
      const colors = ['#25d366', '#2563eb', '#10b981', '#f59e0b'];
      ctaBtn.addEventListener('click', e => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = ctaBtn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 + window.scrollX;
        const cy = rect.top + rect.height / 2 + window.scrollY;
        const n = window.innerWidth > 768 ? 16 : 8;
        for (let i = 0; i < n; i++) {
          const p = document.createElement('div');
          p.className = 'cta-particle';
          const angle = (i / n) * Math.PI * 2;
          const dist = 60 + Math.random() * 40;
          const bx = Math.cos(angle) * dist;
          const by = Math.sin(angle) * dist;
          p.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};--bx:translate(${bx}px,${by}px);`;
          document.body.appendChild(p);
          p.addEventListener('animationend', () => p.remove());
        }
      });
    })();

    // 11. CONFIGURADOR DIÁGNOSTICO EXPRESS CRO (32 nicho/dolor combinaciones dinámicas y Custom Selects)
    (function() {
      // Base de retos y dolores específicos e investigados por rubro
      const baseRetos = {
        'Ferretería': [
          { value: 'Precios', label: '🏷️ Pérdida de ventas por precios desactualizados' },
          { value: 'Tornilleria', label: '🔩 Dificultad para controlar stock de tornillos e ítems pequeños' },
          { value: 'FiadosObra', label: '📝 Desorden en fiados a maestros de obra sin soporte firmado' },
          { value: 'Despachos', label: '🚚 Descoordinación en despachos y entregas de materiales a obras' }
        ],
        'Restaurante': [
          { value: 'Comandas', label: '🍳 Fugas por comandas perdidas o confusas con cocina' },
          { value: 'Mermas', label: '🗑️ Desperdicios elevados e ingredientes vencidos en despensa' },
          { value: 'Reservas', label: '📅 Mesas vacías en días flojos y falta de reservas organizadas' },
          { value: 'Cuentas', label: '💳 Lentitud al cobrar y dividir cuentas entre varios clientes' }
        ],
        'Taller Mecánico': [
          { value: 'Confianza', label: '🚗 Desconfianza del cliente sobre repuestos instalados' },
          { value: 'Bodega', label: '🔧 Pérdida de repuestos costosos y falta de stock en bodega' },
          { value: 'Autorizaciones', label: '📱 Vehículos retenidos esperando aprobación de presupuestos' },
          { value: 'Mantenimiento', label: '⏰ Olvido de mantenimientos preventivos recurrentes de clientes' }
        ],
        'Peluquería': [
          { value: 'Ausencias', label: '📅 Ausencias a última hora de clientes que olvidan su cita' },
          { value: 'Comisiones', label: '💰 Errores y disputas al calcular comisiones de estilistas' },
          { value: 'Tintes', label: '🧴 Pérdida de control de consumo interno de insumos y tintes' },
          { value: 'Fidelizacion', label: '💳 Falta de recompra y venta de paquetes de servicios' }
        ],
        'Tienda de Barrio': [
          { value: 'Fila Mostrador', label: '⚡ Lentitud en el cobro en horas pico y clientes que se van' },
          { value: 'Fuga Hormiga', label: '🐀 Fugas hormiga en estanterías por falta de auditorías rápidas' },
          { value: 'Cuaderno Fiados', label: '📒 Olvidar o perder cuentas del cuaderno de fiados tradicional' },
          { value: 'Pagos Digitales', label: '📱 Pérdida de ventas por no aceptar transferencias fácilmente' }
        ],
        'Farmacia': [
          { value: 'Vencimientos', label: '💊 Medicamentos vencidos en estanterías que son pérdida total' },
          { value: 'Equivalentes', label: '🔍 Pérdida de tiempo buscando alternativas genéricas equivalentes' },
          { value: 'Cuadre Caja', label: '💵 Errores en el cuadre al manejar efectivo y múltiples apps' },
          { value: 'Pacientes', label: '📅 Olvido de seguimiento a pacientes con tratamientos crónicos' }
        ],
        'Emprendimiento': [
          { value: 'Stock Redes', label: '📲 Clientes que preguntan stock por chat y no respondes a tiempo' },
          { value: 'Pedidos Chat', label: '📝 Tiempo perdido transcribiendo pedidos y datos de envío de chats' },
          { value: 'Tracking', label: '📈 No saber qué red social (Instagram, TikTok) trae más ventas' },
          { value: 'Rentabilidad', label: '💰 Pérdidas ocultas por no calcular fletes y costos por producto' }
        ],
        'Negocio Familiar': [
          { value: 'Caja Familiar', label: '💵 Faltantes al final del día por no saber quién retiró efectivo' },
          { value: 'Diferencia Precios', label: '🏷️ Confusión y diferencias de precios entre familiares al cobrar' },
          { value: 'Dividir Ganancias', label: '📈 Discusiones para repartir ganancias netas de forma equitativa' },
          { value: 'Falta Insumos', label: '🛒 Compras duplicadas o insumos agotados por falta de coordinación' }
        ]
      };

      // Base de recomendaciones específicas correspondientes
      const recomendadoras = {
        'Ferretería': {
          'Precios': {
            txt: "Recomendamos un visor de precios digital en mostrador sincronizado con tu base de datos central. Tus clientes sabrán el precio real al instante y tú podrás actualizar listas masivas en un solo clic.",
            msg: "Hola PROTOTIPE, tengo una Ferretería y nuestro mayor reto son los Precios Desactualizados. Quiero ver la solución de visor digital y actualización masiva."
          },
          'Tornilleria': {
            txt: "Recomendamos un buscador predictivo ultra-rápido por keywords asociadas (ej. 'cincado', '3/8') con agrupamiento de existencias mínimas y control de stock rápido por cajas.",
            msg: "Hola PROTOTIPE, tengo una Ferretería y nos cuesta controlar el stock de tornillos y piezas pequeñas. Quisiera saber cómo simplificar el inventario de miles de ítems."
          },
          'FiadosObra': {
            txt: "Recomendamos un tarjetero de fiados con firma táctil digital del maestro de obra en tablet al retirar materiales, enviando un recibo del abono y saldo al instante por WhatsApp.",
            msg: "Hola PROTOTIPE, tengo una Ferretería y quiero digitalizar los fiados a maestros con firma táctil y envíos de cobro por WhatsApp."
          },
          'Despachos': {
            txt: "Recomendamos un programador de despachos de materiales pesados por vehículo y ruta, con alertas automáticas de WhatsApp al cliente ('Tu pedido va en camino con el conductor Juan').",
            msg: "Hola PROTOTIPE, tengo una Ferretería y quiero organizar las rutas de despacho de cemento/ladrillos y notificar a los clientes."
          }
        },
        'Restaurante': {
          'Comandas': {
            txt: "Recomendamos un monitor de cocina digital (KDS) táctil de semáforo que ordena los platos según tiempo de espera, eliminando las comandas de papel traspapeladas.",
            msg: "Hola PROTOTIPE, tengo un Restaurante y queremos implementar comandas digitales a cocina para eliminar el papel y fugas de pedidos."
          },
          'Mermas': {
            txt: "Recomendamos control digital de materias primas con desglose de recetas por porción. La app deduce la cantidad exacta de ingredientes por plato vendido y reporta mermas.",
            msg: "Hola PROTOTIPE, tengo un Restaurante y quiero auditar el inventario de ingredientes por porciones y registrar mermas."
          },
          'Reservas': {
            txt: "Recomendamos un portal digital de autogestión de reservas de mesas que valida la capacidad en tiempo real y envía recordatorios de confirmación vía WhatsApp.",
            msg: "Hola PROTOTIPE, tengo un Restaurante y quiero una agenda digital para que mis clientes reserven mesas con confirmación por WhatsApp."
          },
          'Cuentas': {
            txt: "Recomendamos un punto de venta (POS) móvil con divisor inteligente de cuentas. Registra pagos mixtos (Nequi, tarjeta, efectivo) y separa la cuenta por persona al instante.",
            msg: "Hola PROTOTIPE, tengo un Restaurante y quiero agilizar el cobro y la división de cuentas en mesa."
          }
        },
        'Taller Mecánico': {
          'Confianza': {
            txt: "Recomendamos una ficha digital del vehículo que asocia fotos del antes/después y el empaque del repuesto nuevo, enviando un reporte estético en PDF firmado por WhatsApp.",
            msg: "Hola PROTOTIPE, tengo un Taller y quiero enviar fichas de diagnóstico digital con fotos del daño a mis clientes por WhatsApp."
          },
          'Bodega': {
            txt: "Recomendamos inventario de repuestos críticos controlado por código de barras de celular, donde ningún mecánico puede retirar aceites o repuestos sin asignarlos a una orden de trabajo.",
            msg: "Hola PROTOTIPE, tengo un Taller y quiero bloquear la salida de repuestos de bodega si no están asociados a una orden de trabajo."
          },
          'Autorizaciones': {
            txt: "Recomendamos un cotizador en caliente que envía el presupuesto del trabajo en un link móvil interactivo para que el cliente firme su autorización táctil desde su celular.",
            msg: "Hola PROTOTIPE, tengo un Taller y quiero que mis clientes aprueben presupuestos digitalmente con firma remota por WhatsApp."
          },
          'Mantenimiento': {
            txt: "Recomendamos telemetría de kilometraje estimada por la app que dispara recordatorios automáticos al WhatsApp del cliente al cumplirse los 5,000 km desde su última revisión.",
            msg: "Hola PROTOTIPE, tengo un Taller y me interesaría activar alertas automáticas de mantenimiento periódico según kilometraje del cliente."
          }
        },
        'Peluquería': {
          'Ausencias': {
            txt: "Recomendamos agenda interactiva integrada con bots que envían un aviso de confirmación 24h antes y liberan automáticamente la hora si el cliente cancela, optimizando tu agenda.",
            msg: "Hola PROTOTIPE, tengo una Peluquería y quiero reducir las citas perdidas con recordatorios automáticos y liberación de turnos por WhatsApp."
          },
          'Comisiones': {
            txt: "Recomendamos un panel de cálculo automático de comisiones parametrizables (ej. 40% estilista, 60% salón) que descuenta consumibles internos en tiempo real.",
            msg: "Hola PROTOTIPE, tengo una Peluquería y quiero liquidar comisiones diarias de mi equipo sin errores manuales."
          },
          'Tintes': {
            txt: "Recomendamos control de stock por rendimiento de mililitros de tintes y keratinas, restando la dosis aplicada a la ficha técnica del servicio del cliente.",
            msg: "Hola PROTOTIPE, tengo una Peluquería y quiero controlar el rendimiento interno de tintes y tratamientos."
          },
          'Fidelizacion': {
            txt: "Recomendamos tarjetas de lealtad digitales integradas (acumulación de puntos por corte/servicio) e historial de tonos y tratamientos de cada cliente.",
            msg: "Hola PROTOTIPE, tengo una Peluquería y quiero implementar un sistema de puntos de lealtad e historial de mis clientes."
          }
        },
        'Tienda de Barrio': {
          'Fila Mostrador': {
            txt: "Recomendamos venta express en mostrador basada en buscador por voz o teclado numérico rápido con soporte para múltiples cajeros en simultáneo.",
            msg: "Hola PROTOTIPE, tengo una Tienda y quiero agilizar la fila de cobro con un mostrador express digital."
          },
          'Fuga Hormiga': {
            txt: "Recomendamos auditoría rápida de estanterías mediante escaneo móvil de inventario rotativo, detectando mermas sospechosas y diferencias de stock al instante.",
            msg: "Hola PROTOTIPE, tengo una Tienda y quiero hacer auditorías de inventario rotativas desde el celular."
          },
          'Cuaderno Fiados': {
            txt: "Recomendamos el cuaderno de fiados digitalizado. Puedes buscar al vecino por nombre, registrar compras y enviar un botón de cobro amable a su WhatsApp con un clic.",
            msg: "Hola PROTOTIPE, tengo una Tienda y quiero digitalizar el cuaderno de fiados para cobrar por WhatsApp."
          },
          'Pagos Digitales': {
            txt: "Recomendamos un visor de transferencias unificado en el mostrador. Genera el código QR por el valor exacto de la compra y confirma la transacción de forma visual.",
            msg: "Hola PROTOTIPE, tengo una Tienda y quiero generar códigos QR de Nequi/Daviplata por el valor exacto de la venta."
          }
        },
        'Farmacia': {
          'Vencimientos': {
            txt: "Recomendamos un semáforo inteligente de lotes que avisa automáticamente 90 y 60 días antes del vencimiento, sugiriendo promociones de salida rápida en mostrador.",
            msg: "Hola PROTOTIPE, tengo una Farmacia y quiero alertas semafóricas de fechas de vencimiento de medicamentos."
          },
          'Equivalentes': {
            txt: "Recomendamos un vademécum de equivalencias integrado. Al buscar un medicamento agotado, la app sugiere genéricos alternativos con el mismo principio activo y dosis en pantalla.",
            msg: "Hola PROTOTIPE, tengo una Farmacia y quiero ver el buscador de medicamentos equivalentes y genéricos para no perder ventas."
          },
          'Cuadre Caja': {
            txt: "Recomendamos arqueo de caja inteligente por turnos de empleados que concilia de forma separada el dinero físico de las transferencias electrónicas registradas.",
            msg: "Hola PROTOTIPE, tengo una Farmacia y quiero cuadrar cajas por turno cruzando efectivo vs transferencias."
          },
          'Pacientes': {
            txt: "Recomendamos un sistema de fidelización de pacientes crónicos que avisa automáticamente cuándo el cliente debe reabastecer sus pastillas para el mes.",
            msg: "Hola PROTOTIPE, tengo una Farmacia y quiero alertar a pacientes crónicos cuando deban renovar sus medicamentos."
          }
        },
        'Emprendimiento': {
          'Stock Redes': {
            txt: "Recomendamos un catálogo en la nube autogestionable sincronizado con tu inventario. Si un producto se agota en tu bodega, se deshabilita del catálogo digital de inmediato.",
            msg: "Hola PROTOTIPE, tengo un Emprendimiento y quiero evitar que me pidan productos agotados por Instagram sincronizando mi inventario."
          },
          'Pedidos Chat': {
            txt: "Recomendamos el carrito de compras express para WhatsApp. Tu cliente arma su pedido, llena su dirección de entrega y el sistema te lo envía formateado en un solo chat.",
            msg: "Hola PROTOTIPE, tengo un Emprendimiento y quiero un carrito web que ordene los datos y me los envíe listos a WhatsApp."
          },
          'Tracking': {
            txt: "Recomendamos cupones digitales de descuento y URLs de seguimiento parametrizadas para identificar si tu venta proviene de Instagram, TikTok o Facebook Ads.",
            msg: "Hola PROTOTIPE, tengo un Emprendimiento y quiero medir de qué red social vienen mis clientes de WhatsApp."
          },
          'Rentabilidad': {
            txt: "Recomendamos un calculador integrado de fletes y costo de empaque que añade el valor del envío dinámico según la ciudad y te muestra la ganancia neta real.",
            msg: "Hola PROTOTIPE, tengo un Emprendimiento y quiero calcular automáticamente envíos y márgenes de ganancia neto."
          }
        },
        'Negocio Familiar': {
          'Caja Familiar': {
            txt: "Recomendamos el libro diario multifamiliar de caja con doble factor de confirmación para retiros de efectivo comunes (pago a proveedores, compras de víveres).",
            msg: "Hola PROTOTIPE, tenemos un Negocio Familiar y queremos registrar y firmar los retiros de caja para compras familiares."
          },
          'Diferencia Precios': {
            txt: "Recomendamos un catálogo de precios fijos compartido con acceso multi-usuario en el celular de cada miembro de la familia, eliminando diferencias al cobrar.",
            msg: "Hola PROTOTIPE, tenemos un Negocio Familiar y queremos que todos los familiares cobren con el mismo catálogo de precios."
          },
          'Dividir Ganancias': {
            txt: "Recomendamos un informe financiero familiar con división de utilidades transparente tras restar costos fijos, insumos y fondo de ahorro común del negocio.",
            msg: "Hola PROTOTIPE, tenemos un Negocio Familiar y queremos ver reportes de ganancias netas para repartir utilidades limpiamente."
          },
          'Falta Insumos': {
            txt: "Recomendamos una lista compartida inteligente de reabastecimiento familiar. Si alguien compra un insumo, lo tacha y notifica al resto en tiempo real en sus celulares.",
            msg: "Hola PROTOTIPE, tenemos un Negocio Familiar y queremos una lista de compras coordinada en tiempo real para evitar insumos repetidos o faltantes."
          }
        }
      };

      const selectNicho = document.getElementById('config-nicho');
      const selectDolor = document.getElementById('config-dolor');
      const textRecommendation = document.getElementById('config-recommendation');
      const btnCta = document.getElementById('config-cta-btn');
      const resultBox = document.getElementById('config-result-box');

      // Elementos de Colapso/Despliegue
      const triggerCard = document.getElementById('configurador-trigger');
      const calculatorContainer = document.getElementById('configurador-calculator');
      const closeBtn = document.getElementById('config-close-btn');

      // Elementos Custom Selects
      const customNichoTrigger = document.getElementById('custom-select-nicho-trigger');
      const customNichoOptions = document.getElementById('custom-options-nicho');
      const customDolorTrigger = document.getElementById('custom-select-dolor-trigger');
      const customDolorOptions = document.getElementById('custom-options-dolor');

      // Nuevos elementos para entrada personalizada
      const dolorWrapper = document.getElementById('custom-select-dolor-wrapper');
      const writeWrapper = document.getElementById('custom-reto-write-wrapper');
      const textareaCustomDolor = document.getElementById('config-dolor-custom');

      // Control del Colapso/Despliegue
      if (triggerCard && calculatorContainer) {
        triggerCard.addEventListener('click', () => {
          triggerCard.style.display = 'none';
          calculatorContainer.classList.add('visible');
        });
      }

      if (closeBtn && triggerCard && calculatorContainer) {
        closeBtn.addEventListener('click', () => {
          calculatorContainer.classList.remove('visible');
          setTimeout(() => {
            triggerCard.style.display = 'flex';
          }, 300);
        });
      }

      // Función para actualizar la propuesta
      
      // Mapeo de Pérdidas y Montos Estimados por Nicho (CRO & Psicología del Dolor)
      const leakMapping = {
    'Ferretería': {
      'Precios': { amount: 450000, pct: 55 },
      'Tornilleria': { amount: 650000, pct: 75 },
      'FiadosObra': { amount: 700000, pct: 80 },
      'Despachos': { amount: 500000, pct: 60 }
    },
    'Restaurante': {
      'Comandas': { amount: 750000, pct: 85 },
      'Mermas': { amount: 600000, pct: 70 },
      'Reservas': { amount: 450000, pct: 50 },
      'Cuentas': { amount: 550000, pct: 65 }
    },
    'Taller Mecánico': {
      'Confianza': { amount: 600000, pct: 70 },
      'Bodega': { amount: 800000, pct: 90 },
      'Autorizaciones': { amount: 500000, pct: 60 },
      'Mantenimiento': { amount: 450000, pct: 50 }
    },
    'Peluquería': {
      'Ausencias': { amount: 350000, pct: 40 },
      'Comisiones': { amount: 450000, pct: 55 },
      'Tintes': { amount: 300000, pct: 35 },
      'Fidelizacion': { amount: 400000, pct: 45 }
    },
    'Tienda de Barrio': {
      'Fila Mostrador': { amount: 450000, pct: 55 },
      'Fuga Hormiga': { amount: 500000, pct: 60 },
      'Cuaderno Fiados': { amount: 700000, pct: 80 },
      'Pagos Digitales': { amount: 350000, pct: 40 }
    },
    'Farmacia': {
      'Vencimientos': { amount: 900000, pct: 95 },
      'Equivalentes': { amount: 400000, pct: 45 },
      'Cuadre Caja': { amount: 550000, pct: 60 },
      'Pacientes': { amount: 300000, pct: 35 }
    },
    'Emprendimiento': {
      'Stock Redes': { amount: 500000, pct: 60 },
      'Pedidos Chat': { amount: 600000, pct: 70 },
      'Tracking': { amount: 400000, pct: 50 },
      'Rentabilidad': { amount: 700000, pct: 80 }
    },
    'Negocio Familiar': {
      'Caja Familiar': { amount: 400000, pct: 45 },
      'Diferencia Precios': { amount: 550000, pct: 65 },
      'Dividir Ganancias': { amount: 600000, pct: 70 },
      'Falta Insumos': { amount: 500000, pct: 60 }
    }
  };

      function updateConfigurador() {
        if (!selectNicho || !selectDolor || !textRecommendation || !btnCta || !resultBox) return;
        
        const nicho = selectNicho.value;
        const modeRadio = document.querySelector('input[name="reto-tipo"]:checked');
        const mode = modeRadio ? modeRadio.value : 'select';
        
        resultBox.classList.add('update-anim');
        
        // Elementos del simulador de pérdidas
        const leakBox = document.getElementById('calculator-leak-box');
        const leakFill = document.getElementById('calculator-leak-bar-fill');
        const leakAmount = document.getElementById('calculator-leak-amount');
        const calcAreaSpan = document.getElementById('calculator-area-name');
        if (calcAreaSpan && heroCopies[nicho]) {
          calcAreaSpan.textContent = heroCopies[nicho].area || 'Negocio';
        }
        
        setTimeout(() => {
          if (mode === 'select') {
            const dolor = selectDolor.value;
            const match = recomendadoras[nicho]?.[dolor];
            if (match) {
              textRecommendation.textContent = match.txt;
              btnCta.href = `https://api.whatsapp.com/send?phone=573167527660&text=${encodeURIComponent(match.msg)}`;
              
              // Animación del simulador de pérdidas
              const leakData = leakMapping[nicho]?.[dolor];
              if (leakData && leakBox && leakFill && leakAmount) {
                leakBox.classList.add('active');
                const formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(leakData.amount);
                leakAmount.textContent = `Pérdida mensual estimada en mostrador: ${formatted} COP (~ ${leakData.pct}% de fuga de eficiencia)`;
                leakFill.style.width = '0%';
                setTimeout(() => {
                  leakFill.style.width = `${leakData.pct}%`;
                }, 50);

                // Actualizar Anclaje de Precios (P2)
                const anchoringBox = document.getElementById('price-anchoring-box');
                const anchoringSaving = document.getElementById('anchoring-saving-amount');
                if (anchoringBox && anchoringSaving) {
                  anchoringBox.style.display = 'flex';
                  const saving = Math.max(0, leakData.amount - 80000);
                  const formattedSaving = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(saving);
                  anchoringSaving.textContent = `${formattedSaving} COP / mes`;
                }

                // Actualizar Progreso de Eficiencia Digital (P4)
                const efficiencyBox = document.getElementById('efficiency-progress-box');
                const efficiencyBar = document.getElementById('efficiency-progress-bar-fill');
                if (efficiencyBox && efficiencyBar) {
                  efficiencyBox.style.display = 'block';
                  efficiencyBar.style.width = '20%';
                  efficiencyBar.textContent = '20%';
                  setTimeout(() => {
                    efficiencyBar.style.width = '85%';
                    efficiencyBar.textContent = '85% 🔥';
                  }, 200);
                }
              } else if (leakBox) {
                leakBox.classList.remove('active');
              }
            } else {
              textRecommendation.textContent = "Te sugerimos un sistema a medida personalizado para optimizar tus flujos de trabajo. ¡Consúltanos gratis!";
              btnCta.href = `https://api.whatsapp.com/send?phone=573167527660&text=Hola,%20quiero%20cotizar%20un%20sistema%20personalizado%20para%20mi%20negocio.`;
              if (leakBox) leakBox.classList.remove('active');
            }
          } else {
            const customText = textareaCustomDolor ? textareaCustomDolor.value.trim() : '';
            if (customText) {
              textRecommendation.textContent = `Analizaremos tu flujo de trabajo para diseñar una solución a medida enfocada en resolver tu necesidad específica: "${customText}".`;
              const msg = `Hola PROTOTIPE, tengo un negocio de tipo ${nicho} y mi mayor reto es: ${customText}. Quisiera cotizar una herramienta a medida que resuelva esto.`;
              btnCta.href = `https://api.whatsapp.com/send?phone=573167527660&text=${encodeURIComponent(msg)}`;
            } else {
              textRecommendation.textContent = "Por favor describe tu mayor dolor o necesidad diaria arriba para generar tu recomendación personalizada.";
              btnCta.href = `https://api.whatsapp.com/send?phone=573167527660&text=${encodeURIComponent("Hola PROTOTIPE, tengo un negocio de tipo " + nicho + " y me gustaría cotizar una solución personalizada.")}`;
            }
            if (leakBox && leakFill && leakAmount) {
              leakBox.classList.add('active');
              leakAmount.textContent = `Pérdida mensual promedio en procesos manuales: $500.000 COP`;
              leakFill.style.width = '0%';
              setTimeout(() => {
                leakFill.style.width = '60%';
              }, 50);

              // Actualizar Anclaje de Precios en modo manual (P2)
              const anchoringBox = document.getElementById('price-anchoring-box');
              const anchoringSaving = document.getElementById('anchoring-saving-amount');
              if (anchoringBox && anchoringSaving) {
                anchoringBox.style.display = 'flex';
                const formattedSaving = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(420000);
                anchoringSaving.textContent = `${formattedSaving} COP / mes`;
              }

              // Actualizar Progreso de Eficiencia Digital en modo manual (P4)
              const efficiencyBox = document.getElementById('efficiency-progress-box');
              const efficiencyBar = document.getElementById('efficiency-progress-bar-fill');
              if (efficiencyBox && efficiencyBar) {
                efficiencyBox.style.display = 'block';
                efficiencyBar.style.width = '20%';
                efficiencyBar.textContent = '20%';
                setTimeout(() => {
                  efficiencyBar.style.width = '85%';
                  efficiencyBar.textContent = '85% 🔥';
                }, 200);
              }
            }
          }
          resultBox.classList.remove('update-anim');
        }, 180);
      }

      // Alternar modo de reto (lista o entrada manual)
      function toggleRetoMode(mode) {
        if (mode === 'select') {
          if (dolorWrapper) dolorWrapper.style.display = 'block';
          if (writeWrapper) writeWrapper.style.display = 'none';
        } else {
          if (dolorWrapper) dolorWrapper.style.display = 'none';
          if (writeWrapper) writeWrapper.style.display = 'block';
          if (textareaCustomDolor) textareaCustomDolor.focus();
        }
        updateConfigurador();
      }

      // Poblado dinámico del Custom Select del Nicho
      function inicializarCustomNicho() {
        if (!selectNicho || !customNichoOptions || !customNichoTrigger) return;
        
        customNichoOptions.innerHTML = '';
        customNichoOptions.setAttribute('role', 'listbox');
        const options = Array.from(selectNicho.options);
        
        options.forEach(opt => {
          const div = document.createElement('div');
          div.className = `custom-option ${opt.selected ? 'selected' : ''}`;
          div.setAttribute('data-value', opt.value);
          div.setAttribute('tabindex', '0');
          div.setAttribute('role', 'option');
          div.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
          div.textContent = opt.textContent;
          
          div.addEventListener('click', () => {
            customNichoOptions.querySelectorAll('.custom-option').forEach(item => {
              item.classList.remove('selected');
              item.setAttribute('aria-selected', 'false');
            });
            div.classList.add('selected');
            div.setAttribute('aria-selected', 'true');
            
            selectNicho.value = opt.value;
            customNichoTrigger.querySelector('span').textContent = opt.textContent;
            customNichoOptions.parentElement.classList.remove('open');
            
            // Disparar cambio nativo
            selectNicho.dispatchEvent(new Event('change'));
          });
          
          customNichoOptions.appendChild(div);
        });

        // Evento toggle
        customNichoTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          if (customDolorOptions) customDolorOptions.parentElement.classList.remove('open');
          customNichoOptions.parentElement.classList.toggle('open');
        });
      }

      // Repoblar retos (select nativo y custom select) según Nicho
      function repoblarDolores(nichoValue) {
        if (!selectDolor || !customDolorOptions || !customDolorTrigger) return;
        
        // 1. Repoblar Select Nativo
        selectDolor.innerHTML = '';
        const retos = baseRetos[nichoValue] || [];
        
        retos.forEach((reto, idx) => {
          const opt = document.createElement('option');
          opt.value = reto.value;
          opt.textContent = reto.label;
          if (idx === 0) opt.selected = true;
          selectDolor.appendChild(opt);
        });

        // 2. Repoblar Custom Dropdown
        customDolorOptions.innerHTML = '';
        customDolorOptions.setAttribute('role', 'listbox');
        retos.forEach((reto, idx) => {
          const div = document.createElement('div');
          div.className = `custom-option ${idx === 0 ? 'selected' : ''}`;
          div.setAttribute('data-value', reto.value);
          div.setAttribute('tabindex', '0');
          div.setAttribute('role', 'option');
          div.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
          div.textContent = reto.label;
          
          div.addEventListener('click', () => {
            customDolorOptions.querySelectorAll('.custom-option').forEach(item => {
              item.classList.remove('selected');
              item.setAttribute('aria-selected', 'false');
            });
            div.classList.add('selected');
            div.setAttribute('aria-selected', 'true');
            
            selectDolor.value = reto.value;
            customDolorTrigger.querySelector('span').textContent = reto.label;
            
            customDolorOptions.parentElement.classList.remove('open');
            selectDolor.dispatchEvent(new Event('change'));
          });
          
          customDolorOptions.appendChild(div);
        });

        // Actualizar trigger label
        if (retos.length > 0) {
          customDolorTrigger.querySelector('span').textContent = retos[0].label;
        }
      }

      // Evento toggle para Dolor
      if (customDolorTrigger && customDolorOptions) {
        customDolorTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          if (customNichoOptions) customNichoOptions.parentElement.classList.remove('open');
          customDolorOptions.parentElement.classList.toggle('open');
        });
      }

      // Configuración de Navegación Accesible por Teclado
      function setupKeyboardNavigation(trigger, optionsContainer, nativeSelect) {
        // Abrir / Cerrar con Enter o Space
        trigger.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const isOpen = optionsContainer.parentElement.classList.toggle('open');
            if (isOpen) {
              const selectedOpt = optionsContainer.querySelector('.custom-option.selected');
              if (selectedOpt) {
                selectedOpt.focus();
              } else {
                const firstOpt = optionsContainer.querySelector('.custom-option');
                if (firstOpt) firstOpt.focus();
              }
            }
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            optionsContainer.parentElement.classList.add('open');
            const firstOpt = optionsContainer.querySelector('.custom-option');
            if (firstOpt) firstOpt.focus();
          }
        });

        // Navegar opciones con Flechas, Confirmar o Cancelar
        optionsContainer.addEventListener('keydown', (e) => {
          const options = Array.from(optionsContainer.querySelectorAll('.custom-option'));
          const activeIndex = options.indexOf(document.activeElement);

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (activeIndex + 1) % options.length;
            options[nextIndex].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (activeIndex - 1 + options.length) % options.length;
            options[prevIndex].focus();
          } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex !== -1) {
              options[activeIndex].click();
              trigger.focus();
            }
          } else if (e.key === 'Escape') {
            e.preventDefault();
            optionsContainer.parentElement.classList.remove('open');
            trigger.focus();
          }
        });
      }

      // Prevenir Scroll Chaining en Listas Desplegables
      function preventScrollChaining(el) {
        if (!el) return;
        
        el.addEventListener('wheel', (e) => {
          const scrollTop = el.scrollTop;
          const scrollHeight = el.scrollHeight;
          const height = el.clientHeight;
          const delta = e.deltaY;
          
          if (delta > 0 && scrollTop + height >= scrollHeight) {
            e.preventDefault();
          } else if (delta < 0 && scrollTop <= 0) {
            e.preventDefault();
          }
        }, { passive: false });

        el.addEventListener('touchstart', (e) => {
          el.startY = e.touches[0].pageY;
        }, { passive: true });

        el.addEventListener('touchmove', (e) => {
          const scrollTop = el.scrollTop;
          const scrollHeight = el.scrollHeight;
          const height = el.clientHeight;
          const touchY = e.touches[0].pageY;
          const delta = el.startY - touchY;
          
          if (delta > 0 && scrollTop + height >= scrollHeight) {
            if (e.cancelable) e.preventDefault();
          } else if (delta < 0 && scrollTop <= 0) {
            if (e.cancelable) e.preventDefault();
          }
        }, { passive: false });
      }

      // Cierre global al hacer click fuera
      document.addEventListener('click', () => {
        if (customNichoOptions) customNichoOptions.parentElement.classList.remove('open');
        if (customDolorOptions) customDolorOptions.parentElement.classList.remove('open');
      });

      // Inicialización y eventos
      if (selectNicho && selectDolor) {
        inicializarCustomNicho();
        
        selectNicho.addEventListener('change', () => {
          repoblarDolores(selectNicho.value);
          updateConfigurador();
        });

        selectDolor.addEventListener('change', updateConfigurador);

        // Listeners para los toggles de modo de reto
        document.querySelectorAll('input[name="reto-tipo"]').forEach(radio => {
          radio.addEventListener('change', (e) => {
            toggleRetoMode(e.target.value);
          });
        });

        if (textareaCustomDolor) {
          textareaCustomDolor.addEventListener('input', updateConfigurador);
        }
        
        repoblarDolores(selectNicho.value);
        updateConfigurador();

        // Inicializar navegación por teclado
        setupKeyboardNavigation(customNichoTrigger, customNichoOptions, selectNicho);
        setupKeyboardNavigation(customDolorTrigger, customDolorOptions, selectDolor);

        // Prevenir scroll chaining
        preventScrollChaining(customNichoOptions);
        preventScrollChaining(customDolorOptions);
      }
    })();

    // 12. FAQ SINGLE-OPEN ACCORDIONS (CRO)
    (function() {
      const faqItems = document.querySelectorAll('.faq-item details');
      faqItems.forEach(detail => {
        detail.addEventListener('toggle', () => {
          if (detail.open) {
            faqItems.forEach(other => {
              if (other !== detail && other.open) {
                other.removeAttribute('open');
              }
            });
          }
        });
      });
    })();

    // === CAPTURA DE LEADS Y REDIRECCIÓN DE WHATSAPP (CORE-070) ===
    (function() {
      const leadModal = document.getElementById('lead-modal');
      const leadForm = document.getElementById('lead-form');
      const leadName = document.getElementById('lead-name');
      const leadPhone = document.getElementById('lead-phone');
      const leadEmail = document.getElementById('lead-email');
      
      if (!leadModal || !leadForm) return;

      let pendingWhatsAppUrl = '';

      // Auto-limitar caracteres del teléfono en tiempo real (solo números, espacios, guiones y +)
      if (leadPhone) {
        leadPhone.addEventListener('input', function() {
          this.value = this.value.replace(/[^0-9+\s\-]/g, '');
        });
      }

      function openLeadModal(triggerElement) {
        // Pre-rellenar desde localStorage si existen datos guardados
        const savedName = localStorage.getItem('prototipe_lead_name');
        const savedPhone = localStorage.getItem('prototipe_lead_phone');
        const savedEmail = localStorage.getItem('prototipe_lead_email');

        if (savedName) leadName.value = savedName;
        if (savedPhone) leadPhone.value = savedPhone;
        if (savedEmail && savedEmail !== 'No registra') {
          leadEmail.value = savedEmail;
        }

        const containerNode = leadModal.querySelector('.modal-container');
        
        // Cargar recurso de regalo (Lead Magnet de reciprocidad) para todos los tamaños de pantalla
        const selectedNichoVal = document.getElementById('config-nicho')?.value || 'Ferretería';
        const giftBadge = document.getElementById('lead-gift-badge');
        if (giftBadge) {
          giftBadge.style.display = 'inline-flex';
          giftBadge.innerHTML = `🎁 Incluye de regalo: ${leadMagnets[selectedNichoVal] || 'Asesoría de Digitalización'}`;
        }
        
        if (window.innerWidth <= 768) {
          containerNode.style.setProperty('--origin-x', 'center');
          containerNode.style.setProperty('--origin-y', 'center');
          leadModal.style.setProperty('--click-x', '50%');
          leadModal.style.setProperty('--click-y', '50%');
          leadModal.classList.add('active');
          leadModal.setAttribute('aria-hidden', 'false');
          document.body.classList.add('modal-open');
          return;
        }

        // Medición precisa forzando visualización sin transición
        containerNode.style.transition = 'none';
        leadModal.style.opacity = '0';
        leadModal.style.display = 'flex';
        leadModal.classList.add('active');
        const containerRect = containerNode.getBoundingClientRect();
        leadModal.classList.remove('active');
        leadModal.style.display = '';
        leadModal.style.opacity = '';
        containerNode.offsetHeight; // force reflow
        containerNode.style.transition = ''; // restaurar transición

        if (triggerElement) {
          const rect = triggerElement.getBoundingClientRect();
          if (rect && containerRect && containerRect.width > 0) {
            const clickX = rect.left + rect.width / 2;
            const clickY = rect.top + rect.height / 2;
            
            const relX = clickX - containerRect.left;
            const relY = clickY - containerRect.top;
            containerNode.style.setProperty('--origin-x', `${relX}px`);
            containerNode.style.setProperty('--origin-y', `${relY}px`);
            
            leadModal.style.setProperty('--click-x', `${clickX}px`);
            leadModal.style.setProperty('--click-y', `${clickY}px`);
          }
        } else {
          containerNode.style.setProperty('--origin-x', 'center');
          containerNode.style.setProperty('--origin-y', 'center');
          leadModal.style.setProperty('--click-x', '50%');
          leadModal.style.setProperty('--click-y', '50%');
        }

        leadModal.classList.add('active');
        leadModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        
        setTimeout(() => {
          if (!leadName.value) {
            leadName.focus();
          } else if (!leadPhone.value) {
            leadPhone.focus();
          } else {
            leadEmail.focus();
          }
        }, 150);
      }

      function closeLeadModal() {
        leadModal.classList.remove('active');
        leadModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
      }

      // Interceptar clics en cualquier enlace wa.me o api.whatsapp.com
      document.addEventListener('click', function(e) {
        const anchor = e.target.closest('a');
        if (anchor && anchor.href && (anchor.href.includes('wa.me') || anchor.href.includes('api.whatsapp.com'))) {
          e.preventDefault();
          pendingWhatsAppUrl = anchor.href;
          
          // Resetear el formulario solo si no hay datos persistidos
          if (!localStorage.getItem('prototipe_lead_name')) {
            leadForm.reset();
          }
          
          openLeadModal(anchor);
        }
      });

      // Cerrar con Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && leadModal.classList.contains('active')) {
          closeLeadModal();
        }
      });

      // Procesar envío del formulario
      // Lógica para omitir el registro e ir directo a WhatsApp (Bypass CRO)
      const bypassBtn = document.getElementById('bypass-lead-btn');
      if (bypassBtn) {
        bypassBtn.addEventListener('click', function() {
          closeLeadModal();
          window.open(pendingWhatsAppUrl, '_blank');
        });
      }

      leadForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = leadName.value.trim();
        const phone = leadPhone.value.trim();
        const email = leadEmail.value.trim() || 'No registra';

        // Guardar en localStorage para próximas interacciones
        localStorage.setItem('prototipe_lead_name', name);
        localStorage.setItem('prototipe_lead_phone', phone);
        localStorage.setItem('prototipe_lead_email', email);

        let originalMessage = '';
        try {
          const urlObj = new URL(pendingWhatsAppUrl);
          const textParam = urlObj.searchParams.get('text');
          if (textParam) {
            originalMessage = decodeURIComponent(textParam);
          }
        } catch (err) {
          console.error('Error parseando URL de WhatsApp:', err);
        }

        if (!originalMessage) {
          originalMessage = 'Hola, quiero solicitar asesoría personalizada.';
        }

        // Construir mensaje estructurado amigable e identificable
        const selectedNichoVal = document.getElementById('config-nicho')?.value || 'Ferretería';
        const giftText = leadMagnets[selectedNichoVal] || 'Asesoría Gratis 🎁';
        const finalMessage = `\ud83d\udce2 [Prototype Web]\n${originalMessage}\n\n\ud83d\udc64 Nombre: ${name}\n\u2709\ufe0f Correo: ${email}\n\ud83d\udcde Contacto: ${phone}\n\n\ud83c\udf81 Solicito de regalo: ${giftText}`;

        // Obtener el número de teléfono desde la URL original
        let waNumber = '573167527660'; // Número de soporte por defecto
        try {
          const urlObj = new URL(pendingWhatsAppUrl);
          const phoneParam = urlObj.searchParams.get('phone');
          if (phoneParam) {
            waNumber = phoneParam.replace(/[^0-9]/g, '');
          } else {
            const pathPhone = urlObj.pathname.replace(/[^0-9]/g, '');
            if (pathPhone) {
              waNumber = pathPhone;
            }
          }
        } catch (err) {
          const phoneMatch = pendingWhatsAppUrl.match(/(?:wa\.me\/|phone=)([0-9]+)/);
          if (phoneMatch && phoneMatch[1]) {
            waNumber = phoneMatch[1];
          }
        }

        // Construir URL final de redirección utilizando la API directa para evitar problemas de codificación de emojis en wa.me
        const finalUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(finalMessage)}`;

        // Mostrar estado de carga visual en el botón de submit (anti-double-click)
        const submitBtn = leadForm.querySelector('button[type="submit"]');
        const cancelBtn = leadForm.querySelector('button[data-close]');
        const originalBtnHTML = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        if (cancelBtn) cancelBtn.disabled = true;
        
        submitBtn.innerHTML = `
          <span>Redirigiendo...</span>
          <svg class="modal-spin-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin-left: 8px;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style="opacity: 0.75;"></path>
          </svg>
        `;

        setTimeout(() => {
          closeLeadModal();
          submitBtn.disabled = false;
          if (cancelBtn) cancelBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
          window.open(finalUrl, '_blank');
        }, 800);
      });
    })();

    // === BOTONES MAGNÉTICOS PREMIUM (CRO) ===
    (function() {
      if (window.innerWidth <= 768) return;
      document.querySelectorAll('a.btn-primary, a.btn-secondary, .whatsapp-fab').forEach(btn => {
        if (btn.tagName === 'BUTTON') return;
        if (btn.id === 'config-cta-btn') return;
        if (btn.closest('.modal-overlay, .modal-footer, .lead-modal-container')) return;
        const isWhatsApp = btn.classList.contains('whatsapp-fab');
        const wrapper = document.createElement('div');
        wrapper.className = isWhatsApp ? 'btn-magnetic-wrapper whatsapp-fab-wrapper' : 'btn-magnetic-wrapper';
        if (isWhatsApp) {
          wrapper.style.cssText = 'position: fixed; bottom: calc(2rem - 20px); right: calc(2rem - 20px); z-index: 500; width: 98px; height: 98px; display: flex; align-items: center; justify-content: center; pointer-events: auto;';
          btn.style.cssText = 'position: relative; bottom: 0; right: 0; z-index: 1; margin: 0; pointer-events: auto;';
          setTimeout(() => btn.classList.add('fab-visible'), 1500);
        }
        const glow = document.createElement('div');
        glow.className = 'btn-magnetic-glow';
        if (isWhatsApp) {
          glow.style.background = 'radial-gradient(circle, rgba(37, 211, 102, 0.25) 0%, transparent 70%)';
        }
        btn.parentNode.insertBefore(wrapper, btn);
        wrapper.appendChild(glow);
        wrapper.appendChild(btn);
        wrapper.addEventListener('mousemove', e => {
          const rect = wrapper.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px) scale(1.02)`;
          btn.style.transition = 'none';
          glow.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
          glow.style.opacity = '1';
          const glowColor = isWhatsApp ? 'rgba(37, 211, 102, 0.3)' : 'rgba(37, 99, 235, 0.3)';
          glow.style.setProperty('background', `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, ${glowColor} 0%, transparent 70%)`);
        });
        wrapper.addEventListener('mouseleave', () => {
          btn.style.transform = '';
          btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
          glow.style.transform = '';
          glow.style.opacity = '0';
          glow.style.transition = 'transform 0.4s ease, opacity 0.3s ease';
        });
        wrapper.addEventListener('click', e => {
          if (e.target !== btn) { btn.click(); }
        });
      });
    })();

    // === REGISTRO DE SERVICE WORKER PARA CACHÉ OFFLINE ===
    if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
      window.addEventListener('load', () => {
        try {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
            .catch(err => {
              if (err.message && err.message.includes('protocol')) return;
              console.error('Fallo al registrar el Service Worker:', err);
            });
        } catch (e) {}
      });
    }


  // ==========================================================================
  // MOTOR DE PERSONALIZACIÓN DINÁMICA CONTEXTUAL Y MODAL DE BIENVENIDA (CRO)
  // ==========================================================================
  (function() {
    const rubroCards = document.querySelectorAll('.rubro-card');
    const heroTitle = document.querySelector('#hero h1');
    const heroDesc = document.querySelector('.hero-desc');
    const selectNicho = document.getElementById('config-nicho');
    const customNichoTrigger = document.getElementById('custom-select-nicho-trigger');
    
    // Elementos del Modal Flotante Contextual
    const nicheModal = document.getElementById('nicho-context-modal');
    const modalEmoji = document.getElementById('nicho-modal-emoji');
    const modalTitle = document.getElementById('nicho-modal-title');
    const modalRec = document.getElementById('nicho-modal-recommendation');
    const modalCalcBtn = document.getElementById('nicho-modal-calc-btn');
    
    function closeNicheModal() {
      if (!nicheModal) return;
      nicheModal.classList.remove('active');
      nicheModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    // Registrar eventos para cerrar el modal si existe
    if (nicheModal) {
      nicheModal.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', closeNicheModal);
      });

      nicheModal.addEventListener('click', (e) => {
        if (e.target === nicheModal) {
          closeNicheModal();
        }
      });
    }

    if (rubroCards.length) {
      rubroCards.forEach(card => {
        card.addEventListener('click', () => {
          const rubro = card.getAttribute('data-rubro');
          if (!rubro || !heroCopies[rubro]) return;

          const data = heroCopies[rubro];

          // 1. Modificar copies del Hero en segundo plano (sin saltar)
          if (heroTitle && heroDesc) {
            heroTitle.textContent = data.h1;
            heroDesc.textContent = data.desc;
          }

          // 2. Sincronizar con la calculadora
          if (selectNicho) {
            selectNicho.value = rubro;
            selectNicho.dispatchEvent(new Event('change'));
            
            if (customNichoTrigger) {
              const emoji = data.emoji || '🔩';
              customNichoTrigger.querySelector('span').textContent = `${emoji} ${rubro}`;
            }
          }

          // 3. Desplazar carrusel/testimonio al nicho correspondiente si aplica
          const testGrid = document.getElementById('testimonials-grid');
          if (testGrid) {
            const matchingTestimonial = Array.from(testGrid.children).find(child => {
              return child.getAttribute('aria-label')?.toLowerCase().includes(rubro.toLowerCase()) ||
                     child.textContent.toLowerCase().includes(rubro.toLowerCase());
            });

            if (matchingTestimonial) {
              const parentLeft = testGrid.getBoundingClientRect().left;
              const childLeft = matchingTestimonial.getBoundingClientRect().left;
              const offset = childLeft - parentLeft + testGrid.scrollLeft;
              
              testGrid.scrollTo({
                left: offset,
                behavior: 'smooth'
              });
              
              matchingTestimonial.style.transform = 'scale(1.03)';
              setTimeout(() => {
                matchingTestimonial.style.transform = '';
              }, 800);
            }
          }

          // 4. Poblar y Mostrar el Modal Flotante Premium de Contexto si está en el DOM
          if (nicheModal) {
            if (modalEmoji) modalEmoji.textContent = data.emoji;
            if (modalTitle) modalTitle.textContent = `Nicho Seleccionado: ${rubro}`;
            if (modalRec) modalRec.textContent = data.pillRec;
            
            const modalAreaSpan = document.getElementById('nicho-modal-area-name');
            if (modalAreaSpan) modalAreaSpan.textContent = data.area || 'Negocio';

            nicheModal.classList.add('active');
            nicheModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
          } else {
            // Plan de contingencia si el modal no se cargó debido a la caché: scroll suave directo a la calculadora
            const triggerCard = document.getElementById('configurador-trigger');
            const calculatorContainer = document.getElementById('configurador-calculator');
            const targetElement = document.getElementById('configurador-nicho') || calculatorContainer || triggerCard;
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
      });

      // Lógica para el botón del modal flotante hacia la calculadora
      if (modalCalcBtn) {
        modalCalcBtn.addEventListener('click', () => {
          closeNicheModal();

          const triggerCard = document.getElementById('configurador-trigger');
          const calculatorContainer = document.getElementById('configurador-calculator');
          if (triggerCard && calculatorContainer && !calculatorContainer.classList.contains('visible')) {
            triggerCard.style.display = 'none';
            calculatorContainer.classList.add('visible');
          }

          const targetElement = document.getElementById('configurador-nicho') || calculatorContainer || triggerCard;
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const box = document.getElementById('configurador-calculator') || triggerCard;
            if (box) {
              box.style.transform = 'scale(1.02)';
              box.style.boxShadow = '0 0 20px rgba(37,99,235,0.4)';
              setTimeout(() => {
                box.style.transform = '';
                box.style.boxShadow = '';
              }, 1000);
            }
          }
        });
      }
    }
  })();