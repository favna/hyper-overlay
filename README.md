<div align="center">

  <p>
  <h1>Hyper Overlay</h1>
  </p>

  <p>
   <a href="https://depfu.com/repos/Favna/hyper-overlay"><img src="https://img.shields.io/depfu/Favna/hyper-overlay.svg?style=for-the-badge" alt="Depfu" /></a><!--
--><a href="https://github.com/Favna/hyper-overlay/blob/master/LICENSE.md"><img src="https://img.shields.io/github/license/favna/hyper-overlay.svg?style=for-the-badge" alt="License"></a><!--
--><a href="https://www.npmjs.com/package/hyper-overlay"><img src="https://img.shields.io/node/v/hyper-overlay.svg?style=for-the-badge" alt="Node Version"></a>
  </p>
  <p>
<a href="https://twitter.com/Favna_"><img src="https://img.shields.io/twitter/follow/espadrine.svg?style=for-the-badge&label=Follow" alt="Twitter Follow"></a><!--
--><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XMAYCF9SDHZ34"><img src="https://img.shields.io/badge/Donate-PayPal-547ab8.svg?style=for-the-badge" alt="donate" title="Donate with PayPal" /></a><!--
--><a href="https://www.patreon.com/bePatron?u=9336537"><img src="https://i.imgur.com/05PzBRU.png" alt="patreon badge" title="Become a Patron"></a>
  </p>

  <p>
    <a href="https://discord.gg/zdt5yQt"><img src="https://canary.discordapp.com/api/guilds/246821351585742851/widget.png?style=banner2" alt="Join Discord Server"/></a>
  </p>
</div>

<div align="center">
<p>
<img src="https://cloud.githubusercontent.com/assets/924158/17121698/d122bcaa-52ab-11e6-876c-25a267d00e89.gif" title="homeMacOS" alt="homeMacOS"/><img src="https://raw.githubusercontent.com/Favna/hyper-overlay/readme-improvements/assets/home.gif" title="homeWin" alt="homeWin"/>
</p>
</div>

---

A complete and customizable solution for a permanent / dropdown / hotkey / overlay window in your Hyper Terminal, accessible via hotkeys and/or toolbar icon (tray).

This has been forked from [hyperterm-overlay](https://github.com/rickgbw/hyperterm-overlay) which appears to have been deserted and aims to fix some of the issues on that GitHub repository.

**Important:** Designed for Hyper >= 2.0.0

## Install

Option 1 (using hyper's package manager):

Use `hyper i hyper-overlay`

Option 2 (manual):

Edit your `~/.hyper.js` (`Cmd|Control+,`) and insert the `hyper-overlay` in your `plugins` array:
```js
plugins: [
  'hyper-overlay'
],
```

## Configuration

Add `overlay` in your `~/.hyper.js` config.
The configuration below shows all possibilities with their respective default values.

```js
module.exports = {
  config: {
    // other configs...
    overlay: {
      alwaysOnTop: true,
      animate: true,
      hasShadow: false,
      hideDock: false,
      hideOnBlur: false,
      hotkeys: ['Control+Space'], // On MacOS hotkey is default to Option + Space!
      position: 'top',
      primaryDisplay: false,
      resizable: true,
      size: {
        width: 0.4,
        height: 0.4
      },
      startAlone: false,
      startup: false,
      tray: true,
      unique: false
    }
  },
  // ...
};
```

### alwaysOnTop
- Value: true or false
- Default: true
- Makes Hyper Overlay window stay always on top.

### animate
- Value: true or false
- Default: true
- Enable animation when show and hide the window.

### hasShadow
- Value: true or false
- Default: false
- Controls the default macOS window shadows.

### hideOnBlur
- Value: true or false
- Default: false
- Hides the Hyper Overlay when it loses focus.

### hideDock
- Value: true or false
- Default: false
- Removes the Hyper dock icon. It works only when the `unique` option is activated.

### hotkeys
- Value: array of hotkey strings
- Default: ['Option+Space'] on MacOS or ['Control+Space'] on Windows
- Specify one or more hotkeys to show and hide the Hyper Overlay (see: [`Accelerator`](https://github.com/electron/electron/blob/master/docs/api/accelerator.md))

### position
- Value: `top`, `bottom`, `left`, `right`, `topRight`, `topLeft`, `bottomRight`, `bottomLeft`, `center`
- Default: 'top'
- Choose where Hyper Overlay will be positioned

### primaryDisplay
- Value: true or false
- Default: false
- Show Hyper Overlay only on primary display.

### resizable
- Value: true or false
- Default: true
- Allow the Hyper Overlay be resizable.

<div align="center">
  <p>
    <img src="https://cloud.githubusercontent.com/assets/924158/17121469/5281a916-52aa-11e6-92f5-fa1c3dff75c8.gif" title="resizeMacOS" alt="resizeMacOS"/><img src="https://raw.githubusercontent.com/Favna/hyper-overlay/readme-improvements/assets/resize.gif" title="resizeWin" alt="resizeWin"/>
  </p>
</div>

### size
- Value: float or number
- Default: 0.4
- The size of Hyper Overlay when it is showing.
 The possible values are a `number` or a `float`.
 If is a number, it represents the size um pixels.
 Else, if is a float, it means the percentage of the screen.

### startAlone
- Value: true or false
- Default: false
- Makes Hyper Overlay the unique window displayed when started.
- Other windows started will be default Hyper windows.

### startup
- Value: true or false
- Default: true
- Open Hyper Overlay on Hyper startup.

### tray
- Value: true or false
- Default: true
- Add icon to the system notification area, for access Hyper Overlay.

<div align="center">
  <p>
    <img src="https://cloud.githubusercontent.com/assets/924158/17121470/5294b02e-52aa-11e6-9bca-9d70f186c60b.gif" title="trayMacOS" alt="trayMacOS"/><img src="https://raw.githubusercontent.com/Favna/hyper-overlay/readme-improvements/assets/hideonblur.gif" title="trayWin" alt="trayWin"/>
  </p>
</div>

### unique
- Value: true or false
- Default: false
- Makes Hyper Overlay the unique window of Hyper. Any other window will be removed.

## Licence

[MIT](LICENSE.md)


## Buy me a donut

This project is open source and always will be, even if I don't get donations. That said, I know there are people out there that may still want to donate just to show their appreciation so this is for you guys. Thanks in advance!

I accept donations through PayPal, BitCoin, Ethereum and LiteCoin. You can use the buttons below to donate through your method of choice

|Donate With|QR|Address|
|:---:|:---:|:---:|
<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=C8VGUHM3SWY7U"><img src="https://favna.xyz/images/ribbonhost/paypaldonate.png"></a>|<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=C8VGUHM3SWY7U"><img src="https://favna.xyz/images/ribbonhost/paypalqr.png" width="128"></a>|[Donate with PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=C8VGUHM3SWY7U)|
<img src="https://favna.xyz/images/ribbonhost/bitcoindonate.png">|<img src="https://favna.xyz/images/ribbonhost/bitcoinqr.png" width="128">|<a href="bitcoin:1E643TNif2MTh75rugepmXuq35Tck4TnE5?amount=0.01&label=Favna%27%20Ribbon%20Discord%20Bot">1E643TNif2MTh75rugepmXuq35Tck4TnE5</a>|
<img src="https://favna.xyz/images/ribbonhost/ethereumdonate.png">|<img src="https://favna.xyz/images/ribbonhost/ethereumqr.png" width="128">|<a href="ethereum:0xF653F666903cd8739030D2721bF01095896F5D6E?amount=0.01&label=Favna%27%20Ribbon%20Discord%20Bot">0xF653F666903cd8739030D2721bF01095896F5D6E</a>|
<img src="https://favna.xyz/images/ribbonhost/litecoindonate.png">|<img src="https://favna.xyz/images/ribbonhost/litecoinqr.png" width="128">|<a href="litecoin:LZHvBkaJqKJRa8N7Dyu41Jd1PDBAofCik6?amount=0.01&label=Favna%27%20Ribbon%20Discord%20Bot">LZHvBkaJqKJRa8N7Dyu41Jd1PDBAofCik6</a>|
