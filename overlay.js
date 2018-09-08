// dependencies
const electron = require('electron'),
  path = require('path');

// check if platform is Mac
const isMac = process.platform === 'darwin', // eslint-disable-line one-var
  {BrowserWindow, globalShortcut, Tray, Menu, nativeImage} = electron;

class Overlay {
  constructor () {
    this._app = null;
    this._win = null;
    this._creatingWindow = false;
    this._decoratingWindow = false;
    this._animating = false;
    this._config = {};
    this._tray = null;
    this._trayAnimation = null;
    this._lastFocus = null;
    this._forceStartup = false;

    // store tray images
    this._trayImage = nativeImage.createFromPath(path.join(__dirname, 'assets/traystatic.png'));
    this._trayPressedImage = nativeImage.createFromPath(path.join(__dirname, 'assets/trayhover.png'));
  }

  // app started
  registerApp (app) {
    let startup = false;

    // subscribe for config changes only on first time
    if (!this._app) {
      app.config.subscribe(() => {
        if (this._win) {
          this._refreshConfig(true);
        }
      });
      startup = true;
    }

    // load user configs
    this._app = app;

    // creating the overlay window
    this._create(() => {
      // open on startup
      if ((startup && this._config.startup) || this._forceStartup) {
        this.show();
      }
    });
  }

  // checks if new window could be created
  registerWindow (win) {
    if (!this._creatingWindow && this._config.unique) {
      win.close();
    } else if (this._decoratingWindow) {
      this._decoratingWindow = false;
    }
  }

  // creating a new overlay window
  _create (fn) {
    if (this._win) {
      return;
    }

    this._creatingWindow = true;
    this._decoratingWindow = true;

    this._app.createWindow((win) => {
      this._win = win;

      // apply configurations
      this._refreshConfig();

      this._setConfigs(win);

      // hide window when loses focus
      win.on('blur', () => {
        if (this._config.hideOnBlur) {
          this.hide();
        }
      });

      // store the new size selected
      win.on('resize', () => {
        if (this._config.resizable && !this._creatingWindow && !this._animating) {
          switch (this._config.position) {
          case 'top':
          case 'bottom':
            this._config.size.height = win.getSize()[1];
            break;
          case 'right':
          case 'left':
            this._config.size.width = win.getSize()[0];
            break;
          case 'topLeft':
          case 'topRight':
          case 'bottomLeft':
          case 'bottomRight':
          case 'center':
          default:
            this._config.size.width = win.getSize()[0];
            this._config.size.height = win.getSize()[1];
            break;
          }
        }
      });

      // permanent window
      win.on('closed', () => {
        this._win = null;
        this._clearTrayAnimation();
      });

      // forces hide initially
      win.hide();

      // activate terminal
      win.rpc.emit('termgroup add req');

      // callback
      this._creatingWindow = false;
      if (fn) {
        fn();
      }
    });
  }

  // apply user overlay window configs
  _refreshConfig (reapply) {
    // get user configs
    const userConfig = this._app.config.getConfig().overlay;

    // comparing old and new configs
    if (userConfig) {
      // hide dock icon or not, check before apply
      if (userConfig.unique && userConfig.hideDock) {
        this._app.dock.hide();
      } else if (this._config.unique && this._config.hideDock) {
        this._app.dock.show();
      }

      // removing the initial windows of Hyper
      if ((userConfig.unique && !this._config.unique) || (userConfig.startAlone && !reapply)) {
        this._app.getWindows().forEach((win) => {
          if (win !== this._win) {
            win.close();
          }
        });
      }
    }

    // default configuration
    this._config = {
      alwaysOnTop: true,
      animate: true,
      hasShadow: false,
      hideDock: false,
      hideOnBlur: false,
      hotkeys: {
        open: isMac ? ['Option+Space'] : ['Control+Space'],
        close: isMac ? ['Option+Escape'] : ['Shift+Escape']
      },
      position: 'top',
      primaryDisplay: false,
      resizable: true,
      size: {
        width: 0.4,
        height: 0.4
      },
      visibleOnAllWorkspaces: false,
      startAlone: false,
      startup: false,
      tray: true,
      unique: false
    };

    // replacing user preferences
    if (userConfig) {
      Object.assign(this._config, userConfig);
    }

    // registering the hotkeys
    globalShortcut.unregisterAll();
    for (const hotkey of this._config.hotkeys.open) {
      globalShortcut.register(hotkey, () => this.interact());
    }

    for (const hotkey of this._config.hotkeys.close) {
      globalShortcut.register(hotkey, () => this.hide());
    }

    // tray icon
    let trayCreated = false;

    if (this._config.tray && !this._tray) {
      // prevent destroy / create bug
      this._tray = new Tray(this._trayImage);
      this._tray.setToolTip('Open Hyper Overlay');
      this._tray.setPressedImage(this._trayPressedImage);
      this._tray.on('click', () => this.interact());
      trayCreated = true;
    } else if (!this._config.tray && this._tray) {
      this._clearTrayAnimation();
      this._tray.destroy();
      this._tray = null;
    }

    if (reapply && this._win) {
      this._setConfigs(this._win);
      this._endBounds(this._win);
      // animate tray
      if (this._win.isVisible() && trayCreated) {
        this._animateTray();
      }
    }
  }

  // change windows settings for the overlay window
  _setConfigs (win) {
    win.setHasShadow(this._config.hasShadow);
    win.setResizable(this._config.resizable);
    win.setAlwaysOnTop(this._config.alwaysOnTop);
    if (this._config.visibleOnAllWorkspaces) {
      win.setVisibleOnAllWorkspaces(true);
    }
  }

  // get current display
  _getDisplay () {
    const {screen} = electron,
      display = !this._config.primaryDisplay ? screen.getDisplayNearestPoint(screen.getCursorScreenPoint()) : screen.getPrimaryDisplay();

    return display;
  }

  _startBounds () {
    const {x, y, width, height} = this._getDisplay().workArea;
    let heightSize = null,
      widthSize = null;

    switch (this._config.position) {
    case 'topLeft':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y, width: widthSize, height: heightSize}, this._config.animate);
      break;
    case 'bottomLeft':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y: y + height, width: widthSize, height: heightSize}, this._config.animate);
      break;
    case 'topRight':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x: x + width - 1, y, width: widthSize, height: heightSize}, this._config.animate);
      break;
    case 'bottomRight':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x: x + width - 1, y: y + height, width: widthSize, height: heightSize}, this._config.animate);
      break;
    case 'center':
      this._win.setBounds({x: Math.abs(width / 4), y: Math.abs(height / 4), width: Math.abs(width / 2), height: Math.abs(height / 2)}, this._config.animate);
      break;
    case 'left':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y, width: widthSize, height}, this._config.animate);
      break;
    case 'right':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x: x + width - 1, y, width: widthSize, height}, this._config.animate);
      break;
    case 'bottom':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y: y + height, width, height: heightSize}, this._config.animate);
      break;
    default:
    case 'top':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y, width, height: heightSize}, this._config.animate);
      break;
    }
  }

  // set window bounds according to config
  _endBounds () {
    const {x, y, width, height} = this._getDisplay().workArea;
    let heightSize = null,
      widthSize = null;

    // end position
    switch (this._config.position) {
    case 'topLeft':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y, width: widthSize, height: heightSize}, this._config.animate);
      break;
    case 'bottomLeft':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y: y + height - heightSize, width: widthSize, height: heightSize}, this._config.animate);
      break;
    case 'topRight':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x: width - widthSize, y, width: widthSize, height: heightSize}, this._config.animate);
      break;
    case 'bottomRight':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x: width - widthSize, y: y + height - heightSize, width: widthSize, height: heightSize}, this._config.animate);
      break;
    case 'center':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x: width / 4, y: height / 4, width: width / 2, height: height / 2}, this._config.animate);
      break;
    case 'left':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      this._win.setBounds({x, y, width: widthSize, height}, this._config.animate);
      break;
    case 'bottom':
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y: y + height - heightSize, width, height: heightSize}, this._config.animate);
      break;
    case 'right':
      widthSize = this._config.size.width > 1 ? this._config.size.width : Math.round(width * this._config.size.width);
      this._win.setBounds({x: width - widthSize, y, width: widthSize, height}, this._config.animate);
      break;
    default:
    case 'top':
      heightSize = this._config.size.height > 1 ? this._config.size.height : Math.round(height * this._config.size.height);
      this._win.setBounds({x, y, width, height: heightSize}, this._config.animate); 
      break;
    }
  }

  // tray animation when overlay window is open
  _animateTray () {
    if (!this._config.tray || !this._tray) {
      return;
    }

    // tool tip
    this._tray.setToolTip('Close Hyper Overlay');

    if (isMac) {
      if (this._trayAnimation) {
        clearInterval(this._trayAnimation);
      }

      this._trayAnimation = setInterval(() => {
        if (this._tray) {
          this._tray.setImage(this._trayImage);
        }
      }, 400);
    }
  }

  // finish tray animation
  _clearTrayAnimation () {
    if (this._trayAnimation) {
      clearInterval(this._trayAnimation);
    }

    if (this._tray) {
      this._tray.setToolTip('Open Hyper Overlay');
      if (isMac) {
        this._tray.setImage(this._trayImage);
      }
    }
  }

  // setting initial configuration for the new window
  decorateBrowserOptions (config) {
    if (this._decoratingWindow) {
      return Object.assign({}, config, {
        titleBarStyle: '',
        frame: false,
        minWidth: 0,
        minHeight: 0,
        maximizable: false,
        minimizable: false,
        movable: false,
        show: false
      });
    }

    return config;
  }

  // open or close overlay window
  interact () {
    if (!this._win) {
      // re-create overlay window and show
      this._create(() => this.show());

      return;
    }

    if (!this._win.isVisible()) {
      this.show();
    } else {
      this.hide();
    }
  }

  // show the overlay window
  show () {
    if (!this._win || this._animating || this._win.isVisible()) {
      return;
    }

    // store internal window focus
    this._lastFocus = BrowserWindow.getFocusedWindow();

    // set window initial bounds (for animation)
    if (this._config.animate) {
      this._animating = true;
      setTimeout(() => {
        this._animating = false;
      }, 250);
      this._startBounds();
    }

    // show and focus window
    this._win.show();
    this._win.focus();

    // set end bounds
    this._endBounds();

    this._animateTray();
  }

  // hides the overlay window
  hide () {
    if (!this._win || this._animating || !this._win.isVisible()) {
      return;
    }

    // search for the better previous windows focus
    const findFocus = () => {
      if (this._win.isFocused()) {
        // chose internal or external focus
        if (this._lastFocus && this._lastFocus.sessions && this._lastFocus.sessions.size) {
          this._lastFocus.focus();
        } else if (isMac) {
          Menu.sendActionToFirstResponder('hide:');
        }
      }
    };

    // control the animation
    if (this._config.animate) {
      this._animating = true;

      // animation end bounds
      this._startBounds();

      setTimeout(() => {
        this._animating = false;
        findFocus();
        this._win.blur();
        this._win.hide();
      }, 250);
    } else {
      // close without animation
      findFocus();
      this._win.blur();
      this._win.hide();
    }

    this._clearTrayAnimation();
  }

  // unload everything applied
  destroy () {
    if (this._tray) {
      this._tray.destroy();
      this._tray = null;
    }
    if (this._win) {
      // open again if is a plugin reload
      this._forceStartup = this._win.isVisible();
      this._win.close();
      this._win = null;
    }
    globalShortcut.unregisterAll();
    this._creatingWindow = false;
    this._decoratingWindow = false;
    this._animating = false;
    this._config = {};
    this._lastFocus = null;
  }
}

module.exports = new Overlay();