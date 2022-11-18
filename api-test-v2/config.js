(function (win) {

  var isDebug = false;

  var im = {
    appkey: 'c9kqb3rdkbb8j',
    token: 'nekLWGiZCKTg3e28N0OSXzmYg6A8Uml0bNMUr8YzuEI=@',
    navi: 'http://navqa.cn.ronghub.com',
    cmpUrl: '',
    targetId: 'api_test_target',
    isPolling: false
  };

  if (!isDebug) {
    delete im.cmpUrl;
  }

  var config = {
    im: im,
    isDebug: isDebug,
    debugConf: {
      autoRun: false,
      isShowMsg: false
    }
  };

  win.RongIM = win.RongIM || {};
  win.RongIM = {
    config: config,
    components: {}
  };

})(window);