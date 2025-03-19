var ElKitModal = (function (exports) {
  'use strict';

  class ElKitModal {
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
        maxHeight = "600px",
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

      this.config = { closingKeys, maxWidth, maxHeight, scrollableBody };

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
              `ElKitModal: No content found for selector ${sourceSelector}`
            );
            return;
          }

          const modalInstance = new ElKitModal({
            ...options,
            sourceSelector
          });

          modalInstance.open();
        }
      });
    }

    setup() {
      const allowedKeys = ["closingKeys", "maxWidth", "scrollableBody", "maxHeight"];

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

      if (this.config.maxHeight) {
        this.modalElem.style.setProperty(
          "--el-modal-max-height",
          this.config.maxHeight
        );
      }

      if(this.modalSource) {
        this.setContent(this.modalSource.innerHTML);
      }

    }

    setContent(content) {

      const modalContentElem = this.modalElem.querySelector(".el-modal-content");

      modalContentElem.replaceChildren();
      
      if(content) {
        modalContentElem.innerHTML = content;
      }
    }

    open() {
      if (this.modalElem) {
        this.modalElem.style.display = "flex";
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

  if (typeof window !== 'undefined') {
    window.ElKitModal = ElKitModal;
  }

  exports.ElKitModal = ElKitModal;

  return exports;

})({});
