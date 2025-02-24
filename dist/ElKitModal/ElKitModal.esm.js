class ElkitModal {
  constructor({
    wrapperSelector = ".el-modal-wrapper",
    modalSelector = ".el-modal",
    contentSelector = ".el-modal-content",
    sourceSelector,
    openSelector,
    closeSelector = '.el-modal-close, .el-modal-wrapper',
    config: {
      closingKeys = ["Escape"],
      maxWidth = "800px",
      scrollableBody = false
    } = {},
    onOpen,
    onClose,
  }) {
    this.wrapperElem = document.querySelector(wrapperSelector);
    this.modalElem = document.querySelector(modalSelector);
    this.modalContentElem = document.querySelector(contentSelector);

    this.modalSource = document.querySelector(sourceSelector);
    this.closers = document.querySelectorAll(closeSelector);
    this.openers = document.querySelectorAll(openSelector);

    this.config = { closingKeys, maxWidth, scrollableBody };

    this.onOpen = onOpen || (() => {});
    this.onClose = onClose || (() => {});

    this.setup();

    if (this.openers) {
      this.openers.forEach((opener) => {
        opener.addEventListener("click", () => this.open());
      });
    }

    if (this.closers) {
      this.closers.forEach((closer) => {
        closer.addEventListener("click", () => this.close());
      });
    }

    document.addEventListener("keydown", (event) => {
      const closingKeys = this.config.closingKeys;
      if (closingKeys.includes(event.key)) {
        this.close();
      }
    });

    if (this.modalElem) {
      this.modalElem.addEventListener("click", (evt) => {
        evt.stopPropagation();
      });
    }

  }

  static bindEvents(options = {}) {

    if(this._eventsBound) return;

    this._eventsBound = true;

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-el-modal]");
      if (trigger) {
        let sourceSelector = trigger.dataset.elModal?.trim();
        if (!sourceSelector) {
          console.warn(
            "ElkitModal: No valid sourceSelector found on trigger",
            trigger
          );
          return;
        }

        let sourceElem = document.querySelector(sourceSelector);
        if (!sourceElem) {
          console.warn(
            `ElkitModal: No content found for selector ${sourceSelector}`
          );
          return;
        }

        const modalInstance = new ElkitModal({
          ...options,
          sourceSelector
        });

        modalInstance.open();
      }
    });
  }

  setup() {
    const allowedKeys = ["closingKeys", "maxWidth", "scrollableBody"];

    const invalidKeys = Object.keys(this.config).filter(
      (key) => !allowedKeys.includes(key)
    );

    if (invalidKeys.length > 0) {
      console.warn(
        `Ignored invalid config keys: ${invalidKeys.join(", ")} for ElkitModal`
      );
    }

    this.config = Object.fromEntries(
      Object.entries(this.config).filter(([key]) => allowedKeys.includes(key))
    );

    if (this.config.maxWidth) {
      this.modalElem.style.setProperty(
        "--el-modal-max-width",
        this.config.maxWidth
      );
    }

    if(this.modalSource) {

      console.log(`The source was set!`);

      this.setContent(this.modalSource.innerHTML);
    }

  }

  setContent(content) {

    const modalContentElem = this.modalElem.querySelector(".el-modal-content");

    // Using replaceChildren()
    modalContentElem.replaceChildren();
    
    if(content) {
      modalContentElem.innerHTML = content;
    }
  }

  open() {
    if (this.modalElem) {
      this.modalElem.style.display = "block";
      this.wrapperElem.style.display = "flex";

      if(!this.config.scrollableBody) {
        document.body.style.overflow = "hidden";
      }

      this.onOpen();
    }
  }

  close() {
    if (this.modalElem) {
      this.modalElem.style.display = "none";
      this.wrapperElem.style.display = "none";

      if(!this.config.scrollableBody) {
        document.body.style.overflow = "";
      }

      this.setContent("");

      this.onClose();
    }
  }
}

export { ElkitModal };
