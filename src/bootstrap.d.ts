declare namespace bootstrap {
  class Modal {
    constructor(element: HTMLElement);
    show(): void;
    hide(): void;
    static getInstance(element: HTMLElement): Modal;
  }
}
