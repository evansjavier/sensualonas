document.addEventListener('DOMContentLoaded', function () {

  // Función reutilizable para configurar un carrusel arrastrable
  function setupDraggableSlider(selector) {
    const slider = document.querySelector(selector);
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;
    let hasDragged = false; //  Bandera para detectar el arrastre

    // Variables para la inercia
    let velocity = 0;
    let lastX = 0;
    let frame;
    const friction = 0.95; // Factor de fricción (más cercano a 1, más largo se desliza)

    const startDragging = (e) => {
      isDown = true;
      hasDragged = false; //  Reiniciar la bandera en cada clic
      slider.classList.add('active');
      slider.classList.remove('snapping');
      cancelAnimationFrame(frame); // Detener cualquier animación de inercia en curso

      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      
      // Inicializar variables de velocidad
      velocity = 0;
      lastX = e.pageX;
    };

    const stopDragging = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('active');

      // Si estábamos en overscroll, rebotar
      if (slider.style.transform && slider.style.transform !== 'translateX(0px)') {
        slider.classList.add('snapping');
        slider.style.transform = 'translateX(0)';
        return;
      }
      
      // Iniciar la animación de inercia si la velocidad es significativa
      if (Math.abs(velocity) > 1) {
        frame = requestAnimationFrame(inertiaLoop);
      }
    };

    const onDrag = (e) => {
      if (!isDown) return;
      e.preventDefault();
      hasDragged = true; // Marcar que se ha arrastrado

      const x = e.pageX;
      const walk = x - startX;
      let newScrollLeft = scrollLeft - walk;

      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

      // Permitir scroll normal hasta los límites, solo aplicar rebote si se intenta pasar el límite
      if (newScrollLeft < 0) {
        slider.scrollLeft = 0;
        // Rebote solo si ya está en el borde
        const overscroll = newScrollLeft;
        const dampenedOverscroll = -overscroll / 3;
        slider.style.transform = `translateX(${dampenedOverscroll}px)`;
      } else if (newScrollLeft > maxScrollLeft) {
        slider.scrollLeft = maxScrollLeft;
        const overscroll = newScrollLeft - maxScrollLeft;
        const dampenedOverscroll = -overscroll / 3;
        slider.style.transform = `translateX(${dampenedOverscroll}px)`;
      } else {
        slider.scrollLeft = newScrollLeft;
        slider.style.transform = 'translateX(0)';
      }

      // Calcular velocidad instantánea
      const currentVelocity = x - lastX;
      velocity = 0.8 * currentVelocity + 0.2 * velocity; // Suavizado de la velocidad
      lastX = x;
    };

    const inertiaLoop = () => {
      slider.scrollLeft -= velocity;
      velocity *= friction;

      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

      // Corregir el scroll si se pasa del borde izquierdo
      if (slider.scrollLeft < 0) {
        slider.scrollLeft = 0;
        cancelAnimationFrame(frame);
        return;
      }

      // Corregir el scroll si se pasa del borde derecho
      if (slider.scrollLeft > maxScrollLeft) {
        slider.scrollLeft = maxScrollLeft;
        cancelAnimationFrame(frame);
        return;
      }

      // Detener si la velocidad es muy baja
      if (Math.abs(velocity) > 0.5) {
        frame = requestAnimationFrame(inertiaLoop);
      } else {
        cancelAnimationFrame(frame);
      }
    };

    slider.addEventListener('mousedown', startDragging);
    slider.addEventListener('mouseup', stopDragging);
    slider.addEventListener('mouseleave', stopDragging);
    slider.addEventListener('mousemove', onDrag);
    
    // Prevenir el clic en los enlaces después de arrastrar
    // Delegación de eventos para enlaces (soporta elementos agregados dinámicamente)
    slider.addEventListener('click', (e) => {
      if (hasDragged && e.target.closest('a')) {
        e.preventDefault();
      }
    });
    slider.addEventListener('dragstart', (e) => {
      if (e.target.closest('a')) {
        e.preventDefault();
      }
    });
    
    slider.addEventListener('transitionend', () => {
      slider.classList.remove('snapping');
    });
  }

  // Aplicar la funcionalidad a ambos carruseles
  setupDraggableSlider('.row-estados-chicas');
  setupDraggableSlider('.profile-row-large');

});
