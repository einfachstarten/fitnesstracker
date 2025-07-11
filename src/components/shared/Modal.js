export class Modal {
  constructor(content) {
    this.content = content;
    this.element = null;
  }

  open() {
    this.element = document.createElement('div');
    this.element.className = 'modal';
    this.element.appendChild(this.content);
    document.body.appendChild(this.element);
  }

  close() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
