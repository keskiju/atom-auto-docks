'use babel';

import { CompositeDisposable } from 'atom';

import config from './config';

export default {
  config,
  subscriptions: null,
  isFullMode: false,
  isFullScreen: false,
  resizeListener: null,

  // Settings
  toggleLeftDock: true,
  toggleRightDock: false,
  toggleBottomDock: false,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    // Listen for config changes
    this.subscribeConfig('toggleLeftDock');
    this.subscribeConfig('toggleRightDock');
    this.subscribeConfig('toggleBottomDock');

    // Listen for commands
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-auto-docks:toggle': () => this.onToggleCommand()
    }));

    // Listen window resize
    this.resizeListener = e => {
      this.onWindowResize();
    };
    window.addEventListener('resize', this.resizeListener);
  },

  deactivate() {
    this.subscriptions.dispose();
    window.removeEventListener('resize', this.resizeListener);
  },

  subscribeConfig(name) {
    this[name] = atom.config.get(`atom-auto-docks.${name}`);
    this.subscriptions.add(
      atom.config.observe(`atom-auto-docks.${name}`, val => {
        this[name] = val;
      })
    );
  },

  onWindowResize() {
    const isFullMode = atom.isMaximized() || atom.isFullScreen();
    if (isFullMode !== this.isFullMode) {
      this.toggleDocks(isFullMode);
    }
    this.isFullMode = isFullMode;
    this.isFullScreen = atom.isFullScreen();
  },

  onToggleCommand() {
    // TODO support toggle command in non-maximized mode
    if (atom.isMaximized() || atom.isFullScreen()) {
      const show =
        (!this.toggleLeftDock || !atom.workspace.getLeftDock().isVisible()) &&
        (!this.toggleRightDock || !atom.workspace.getRightDock().isVisible()) &&
        (!this.toggleBottomDock || !atom.workspace.getBottomDock().isVisible());
      this.toggleDocks(show);
      this.manualToggleTimemillis = new Date().getTime();
    }
  },

  toggleDocks(show) {
    if (show) {
      this.toggleLeftDock && atom.workspace.getLeftDock().show();
      this.toggleRightDock && atom.workspace.getRightDock().show();
      this.toggleBottomDock && atom.workspace.getBottomDock().show();
    } else {
      this.toggleLeftDock && atom.workspace.getLeftDock().hide();
      this.toggleRightDock && atom.workspace.getRightDock().hide();
      this.toggleBottomDock && atom.workspace.getBottomDock().hide();
    }
  }
};
