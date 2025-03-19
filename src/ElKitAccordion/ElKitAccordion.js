export class ElKitAccordion {
  #accordion;
  #items;
  #alwaysOpen;
  #collapseOthers;
  #onOpen;
  #onClose;

  constructor({
    selector,
    alwaysOpen = [],
    collapseOthers = true,
    openIndexes = [],
    onOpen = () => {},
    onClose = () => {}
  }) {
    this.#accordion = document.querySelector(selector);
    if (!this.#accordion) {
      console.error("Accordion container not found");
      return;
    }

    this.#items = [...this.#accordion.children].filter(item =>
      item.classList.contains("accordion-item")
    );
    this.#alwaysOpen = new Set(alwaysOpen.map(index => this.#items[index]).filter(Boolean));

    this.#collapseOthers = collapseOthers;
    this.#onOpen = onOpen;
    this.#onClose = onClose;

    this.#init(openIndexes);
    this.#observeChanges();
  }

  #init(openIndexes) {
    this.#accordion.addEventListener("click", (evt) => {
      const item = evt.target.closest(".accordion-item");
      if (item) this.toggle(item);
    });

    openIndexes.forEach(index => {
      if (this.#items[index]) {
        this.open(this.#items[index]);
      }
    });
  }

  toggle(item) {
    const isOpen = item.classList.contains("active");

    if (!isOpen && this.#collapseOthers) {
      this.#closeExcept([item, ...this.#alwaysOpen]);
    }

    isOpen ? this.close(item) : this.open(item);
  }

  open(item) {
    const content = item.querySelector(".el-accordion-content-wrapper");
    if (!content) return;

    item.classList.add("active");
    content.style.maxHeight = content.scrollHeight + "px";
    this.#onOpen(item);
  }

  close(item) {
    if (this.#alwaysOpen.has(item)) return;

    const content = item.querySelector(".el-accordion-content-wrapper");
    if (!content) return;

    item.classList.remove("active");
    content.style.maxHeight = null;
    this.#onClose(item);
  }

  #closeExcept(exceptions = [...this.#alwaysOpen]) {
    this.#items.forEach(item => {
      if (!exceptions.includes(item) && item.classList.contains("active")) {
        this.close(item);
      }
    });
  }

  addQuestion(question, answer) {
    const item = document.createElement("div");
    item.classList.add("accordion-item");
    item.innerHTML = `
      <div class="accordion-header">${question}</div>
      <div class="el-accordion-content-wrapper"><div class="el-accordion-content"><p>${answer}</p></div></div>
    `;

    this.#accordion.appendChild(item);
  }

  removeQuestion(index) {
    if (index >= 0 && index < this.#items.length) {
      this.#items[index].remove();
    }
  }

  #observeChanges() {
    const observer = new MutationObserver(() => {
      this.#items = [...this.#accordion.children].filter(item => item.classList.contains("accordion-item"));
    });

    observer.observe(this.#accordion, { childList: true });
  }
}
