class ElKitTooltip {
  #message;
  #config;
  #target;

  constructor({
    target,
    message,
    config = {},
    onShow = () => {},
    onDestroy = () => {},
  }) {
    this.#target = target;
    this.#message = message;

    this.#config = {
      position: "top",
      delay: 300,
      ...config,
    };
    this.tooltipElement = null;

    this.onShow = onShow;
    this.onDestroy = onDestroy;
  }

  static ensureContainer() {
    let container = document.querySelector(".elkit-tooltip-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "elkit-tooltip-container";
      document.body.appendChild(container);
    }
    return container;
  }

  show() {
    const container = ElKitTooltip.ensureContainer();
    this.tooltipElement = document.createElement("div");
    this.tooltipElement.className = `elkit-tooltip elkit-tooltip-${
      this.#config.position
    }`;
    this.tooltipElement.innerHTML = `<span>${this.#message}</span>`;
    container.appendChild(this.tooltipElement);

    const rect = this.#target.getBoundingClientRect();
    this.positionTooltip(rect);

    this.tooltipElement.classList.add("active-tooltip");

    this.onShow();
  }

  positionTooltip(rect) {
    const { position } = this.#config;
    const tooltip = this.tooltipElement;

    const tooltipArrowSize = parseFloat(getComputedStyle(tooltip).getPropertyValue(`--eltip-arrow-size`).trim());

    // Possible Bug: Tooltips go out of window when they are in extreme positions. Could apply restrictions but then they will likely cover the elements they are tool-tipping.
    switch (position) {
      case "bottom":
        tooltip.style.top = `${rect.bottom + window.scrollY + Math.floor(tooltipArrowSize * 1.2)}px`;
        tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        tooltip.style.transform = "translateX(-50%)";
        break;
      case "left":
        tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
        tooltip.style.left = `${
          rect.left + window.scrollX - tooltip.offsetWidth - Math.floor(tooltipArrowSize * 1.2)
        }px`;
        tooltip.style.transform = "translateY(-50%)";
        break;
      case "right":
        tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
        tooltip.style.left = `${rect.right + window.scrollX + Math.floor(tooltipArrowSize * 1.2)}px`;
        tooltip.style.transform = "translateY(-50%)";
        break;
      default:
        tooltip.style.top = `${
          rect.top + window.scrollY - tooltip.offsetHeight - Math.floor(tooltipArrowSize * 1.2)
        }px`;
        tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
        tooltip.style.transform = "translateX(-50%)";
    }
  }

  destroy() {
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.onDestroy();
    }
  }

  static bindEvents() {
    if (this._eventsBound) return;
    this._eventsBound = true;

    document.addEventListener("mouseenter", (event) => {
      const target = event.target.closest("[data-elkit-tooltip]");
      if (target && !target.tooltipInstance) {
        target.tooltipInstance = new ElKitTooltip({
          target,
          message: target.getAttribute("data-elkit-tooltip"),
          config: { position: target.getAttribute("data-eltip-position") || "top" }
        });

        target.tooltipInstance.show();
      }

      if (target) {
        clearTimeout(target._tooltipTimeout);
      }
    }, true);

    document.addEventListener("mouseout", (event) => {
      const target = event.target.closest("[data-elkit-tooltip]");
      if (target && target.tooltipInstance) {
        clearTimeout(target._tooltipTimeout);

        // const { tooltipElement } = target.tooltipInstance;
        
        // This does not work because there is a gap between the tooltip and the triggering element. This means that the relatedTarget is body.
        // if (event.relatedTarget && (tooltipElement === event.relatedTarget || tooltipElement?.contains(event.relatedTarget))) {
        //   return;
        // }

        target._tooltipTimeout = setTimeout(() => {
          if (target.tooltipInstance) {
            target.tooltipInstance.destroy();
            target.tooltipInstance = null;
          }
        }, 200);
      }
    }, true);
  }
}

export { ElKitTooltip as default };
