export class MigrationController {
  static shouldUseNewArchitecture() {
    const forceNew = localStorage.getItem('fitness_use_new_architecture');
    if (forceNew === 'true') return true;
    if (forceNew === 'false') return false;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === '1') {
      localStorage.setItem('fitness_use_new_architecture', 'true');
      return true;
    }

    const userId = localStorage.getItem('fitness_user_id');
    if (userId) {
      const hash = this.simpleHash(userId);
      return hash % 100 < 20;
    }

    return false;
  }

  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash &= hash;
    }
    return Math.abs(hash);
  }

  static redirectToCorrectVersion() {
    const path = window.location.pathname;
    if (path.includes('custom-tracker.html') || path.includes('index-new.html')) {
      window.location.href = './index.html';
    }
  }
}

