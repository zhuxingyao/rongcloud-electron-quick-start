(function (win) {
  var isDebug = false

  var im = {
    appkey: '',
    token: '',
    navi: '',
    targetId: 'm-m',
    customCMP: '',
    isPolling: false,
    channelId: ''
  }

  if (!isDebug) {
    delete im.cmpUrl
  }

  var config = {
    im: im,
    isDebug: isDebug,
    debugConf: {
      autoRun: false,
      isShowMsg: false
    }
  }

  win.RongIM = win.RongIM || {}
  win.RongIM = {
    config: config,
    components: {}
  }
})(window)
