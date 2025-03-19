class ElKitToast {
  #message;
  #type;
  #config;

  constructor({
    message,
    type,
    config = {},
    onShow = () => {},
    onDestroy = () => {},
  }) {
    this.#message = message;
    this.#type = type;

    this.#config = {
      duration: 3000,
      position: "top-right",
      dismissible: true,
      ...config,
    };
    this.toastElement = null;

    this.onShow = onShow;
    this.onDestroy = onDestroy;
  }

  static ensureContainer(position) {
    let container = document.querySelector(
      `.elkit-toast-container[data-position="${position}"]`
    );
    if (!container) {
      container = document.createElement("div");
      container.className = `elkit-toast-container elkit-toast-${position}`;
      container.setAttribute("data-position", position);
      document.body.appendChild(container);
    }
    return container;
  }

  show() {
    const container = ElKitToast.ensureContainer(this.#config.position);
    this.toastElement = document.createElement("div");
    this.toastElement.className = `elkit-toast elkit-toast-${this.#type}`;
    this.toastElement.innerHTML = `
            <span>${this.#message}</span>
            ${
              this.#config.dismissible
                ? '<button class="elkit-toast-close">&times;</button>'
                : ""
            }
        `;

    container.appendChild(this.toastElement);

    this.onShow();

    if (this.#config.dismissible) {
      this.toastElement
        .querySelector(".elkit-toast-close")
        .addEventListener("click", () => this.destroy());
    } 

    if (this.#config.duration > 0) {
      setTimeout(() => this.destroy(), this.#config.duration);
    }
  }

  destroy() {
    if (this.toastElement) {
      this.toastElement.classList.add("elkit-toast-hide");

      this.onDestroy();

      setTimeout(() => {
        this.toastElement.remove();
      }, 500);
    }
  }
}

export { ElKitToast };
