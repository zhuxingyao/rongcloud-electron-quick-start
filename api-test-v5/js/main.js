(function (win, dependencies, components) {
  var Vue = dependencies.Vue
  var iview = dependencies.iview
  var VueJsonPretty = dependencies.VueJsonPretty
  var RongIM = dependencies.RongIM
  var Service = RongIM.Service
  var utils = RongIM.Utils
  var ApiList = RongIM.ApiList
  var DefailtReadyApiQueue = RongIM.DefailtReadyApiQueue
  var DefaultConfig = RongIM.config.im
  var Config = utils.copy(DefaultConfig)
  var Storage = utils.Storage
  var StorageConfig = Storage.get(Storage.ConfigKey)
  var DefaultTargetId = Config.targetId
  var isDebug = RongIM.config.isDebug
  var debugConf = RongIM.config.debugConf

  DefailtReadyApiQueue.push([])

  var ValidStatus = [0, 1, 2, 6, 201, 202]
  var ValidErrorCode = [23424, 23427, 23426, 23423]
  var isStop = false

  var isStorageConfig = false
  if (StorageConfig && !isDebug) {
    isStorageConfig = true
    Config = utils.copy(StorageConfig)
  }
  var urlQueryConfig = utils.getRCUrlQuery()
  Config = utils.extend(Config, urlQueryConfig)

  var ReceiveMsgTextTpl = '监听到{typeName} ({conversationType})消息. 发送者: {senderUserId}'
  var StatusTextTpl = '链接状态: {statusName} ({status})'

  var OptBoxClass = 'rong-ready-box'
  var ApiBoxClass = 'rong-api-list'
  var ApiSourceClass = 'rong-api-source'

  var RunType = {
    OneByOne: { name: '逐个运行', prompt: 'Api 逐个执行' },
    LineByLine: { name: '逐行运行', prompt: '每行 Api 并行. 执行完一行后执行下一行' }
  }

  var vueInstance

  function runAllApi (allRefs, currentIndex, finishCallback) {
    var total = allRefs.length
    var isFinished = total === currentIndex || isStop
    if (isFinished) {
      return finishCallback && finishCallback()
    }
    var refList = allRefs[currentIndex]
    var deferArr = []
    utils.forEach(refList, function (instance) {
      deferArr.push(instance.run())
    })
    return utils.Defer.all(deferArr).then(function (result) {
      result = result[0]
      var isSuccess = result.isSuccess || ValidErrorCode.indexOf(result.data.result) !== -1
      if (isSuccess) {
        vueInstance.runInfo.successApiCount++
      } else {
        vueInstance.runInfo.failApiList.push(result.data)
      }
      currentIndex++
      runAllApi(allRefs, currentIndex, finishCallback)
    })
  }

  function runOneByOne (finishCallback) {
    var refs = vueInstance.$refs
    var allRefs = []
    utils.forEach(refs, function (subRefList) {
      utils.forEach(subRefList, function (ref) {
        allRefs.push([ref])
      })
    })
    runAllApi(allRefs, 0, finishCallback)
  }

  function runLineByLine (finishCallback) {
    var refs = vueInstance.$refs
    var allRefs = []
    utils.forEach(refs, function (ins) {
      allRefs.push(ins)
    })
    runAllApi(allRefs, 0, finishCallback)
  }

  function setConfig (config) {
    var currentTargetId = config.targetId
    vueInstance.globalConfig = config
    

    vueInstance.readyApiQueue = utils.deepMap(vueInstance.readyApiQueue, function (item, index) {
      if (item === DefaultTargetId) {
        item = currentTargetId
      }
      return item
    }) 
    setChannelId(config)
  }

  function setChannelId (config) {
    vueInstance.readyApiQueue.flat().forEach(item => {
      const paramsArr = item.params
      paramsArr.forEach(item => {
        if (item.name === 'channelId') {
          item.value = config.channelId
        }
      })
    })
  }

  function watchStatus (status) {
    var title = utils.tplEngine(StatusTextTpl, {
      status: status,
      statusName: utils.StatusName[status]
    })
    var output = vueInstance.addOutput(title, status, 0, [], {
      color: utils.TypeColor.STATUS
    })
    if (ValidStatus.indexOf(status) === -1) {
      vueInstance.runInfo.failApiList.push(output)
    }
    var isSuccess = utils.SuccessStatus.indexOf(status) !== -1
    var event = isSuccess ? vueInstance.$Message.success : vueInstance.$Message.error
    event.call(vueInstance.$Message, {
      background: true,
      content: title
    })
  }

  function onConnecting() {
    vueInstance.addOutput('监听链接', '正在链接', 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function onConnected() {
    vueInstance.addOutput('监听链接', '已经链接', 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function onDisconnect() {
    vueInstance.addOutput('监听链接', '链接断开', 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function onSuspend() {
    vueInstance.addOutput('链接失败', '内部断开，尝试内部重新链接', 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function watchMessage (messages) {
    if (RongIM.config.isDebug && !RongIM.config.debugConf.isShowMsg) {
      return
    }
    var title = '监听到' + messages.length + '条新消息'
    vueInstance.addOutput(title, messages, 0, [], {
      color: utils.TypeColor.MSG
    })
    console.log('Reveice Msg', utils.toJSON(messages))
  }

  function watchChatroom (info) {
    console.log(info)
    var str = ''
    if (Array.isArray(info.userChange)) {
      str = '监听到'
      info.userChange.forEach(user => {
        str += '聊天室' + user.chatroomId + '中的' + user.userId + (user.type === 0 ? '退出;\n' : '进入;\n')
      })
    }

    if (Array.isArray(info.updatedEntries)) {
      str += '监听到聊天室 KV 更新'
    }

    if (!str) {
      str = '监听到聊天室信息改变！'
    }
    vueInstance.addOutput(str, info, 0, [], {
      color: utils.TypeColor.MSG
    })
  }

  function innerEl (text) {
    var newEl = document.createElement('p')
    newEl.innerText = text
    newEl.style = 'border-bottom: 1px sloid #333'
    var exEl = document.getElementById('rong-ex-content')
    if (exEl) {
      var exElLen = exEl.childNodes.length
      if (exElLen == 0) {
        exEl.appendChild(newEl)
      } else {
        exEl.insertBefore(newEl, exEl.childNodes[exElLen - 1].nextSibling)
      }
    }
  }

  function watchExpansion (event) {
    console.warn(event)
    var updatedExpansion = event.updatedExpansion
    var deletedExpansion = event.deletedExpansion
    vueInstance.addOutput('监听到消息 KV 变更', event, 0, [], {
      color: utils.TypeColor.MSG
    })
    if (updatedExpansion) {
      var time = utils.timestampToString(updatedExpansion.updatedTime)
      var expansion = updatedExpansion.expansion
      var msgUId = updatedExpansion.messageUId
      innerEl(`${time}: 监听更新, msgUId: ${msgUId}, expansion: ${JSON.stringify(expansion)}`)
    }
    if (deletedExpansion) {
      var time = utils.timestampToString(deletedExpansion.updatedTime)
      var keys = deletedExpansion.deletedKeys
      var msgUId = deletedExpansion.messageUId
      innerEl(`${time}: 监听删除, keys: ${keys} | msgUId: ${msgUId}`)
    }
  }

  function watchTyping (event) {
    vueInstance.addOutput('监测到输入状态', event.status, 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function watchReadReciptReceived(event) {
    vueInstance.addOutput('监测单聊回执', event, 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function watchMessageReceiptRequest(event) {
    vueInstance.addOutput('监测群聊回执请求', event, 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function watchMessageReceiptResponse(event) {
    vueInstance.addOutput('监测群聊回执响应', event, 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function watchPullFinished(event) {
    vueInstance.addOutput('监测拉取完成响应', '', 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function watchTag() {
    vueInstance.addOutput('监测Tag改变', '', 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function watchConversationTag () {
    vueInstance.addOutput('监测会话Tag改变', '', 0, [], {
      color: utils.TypeColor.MSG
    });
  }
  function watchUltraGroupEnable (list) {
    vueInstance.addOutput('超级群会话', list, 0, [], {
      color: utils.TypeColor.MSG
    })
  }
  function watchUltraGroupMessageExpansionUpdated (list) {
    vueInstance.addOutput('超级群会话扩展消息', list, 0, [], {
      color: utils.TypeColor.MSG
    })
  }

  function watchUltraGroupMessageModified (list) {
    vueInstance.addOutput('超级群会话修改消息', list, 0, [], {
      color: utils.TypeColor.MSG
    })
  }

  function watchUltraGroupMessageRecalled (list) {
    vueInstance.addOutput('超级群会话撤回消息', list, 0, [], {
      color: utils.TypeColor.MSG
    })
  }

  function watchOperateStatus (status) {
    vueInstance.addOutput('超级群会话输入状态', status, 0, [], {
      color: utils.TypeColor.MSG
    })
  }

  function watchConversation (updateConvers) {
    vueInstance.addOutput('监测会话状态改变', updateConvers, 0, [], {
      color: utils.TypeColor.MSG
    });
  }

  function watchMessageBlocked (data) {
    vueInstance.addOutput('监听到敏感词回调', data, 0, [], {
      color: utils.TypeColor.MSG
    })
  }

  function autoRun () {
    Vue.nextTick(function () {
      runOneByOne(function () {
        vueInstance.runInfo.runCount++
        localStorage.removeItem('rong_servers')
        localStorage.removeItem('rong_fullnavi')
        vueInstance.outputList = []
        vueInstance.allOutputList = []
        !isStop && autoRun()
      })
    })
  }

  function loginSuccessEvent (userId, config) {
    vueInstance.$Message.success({
      background: true,
      content: '链接成功 ' + userId
    })
    vueInstance.currentUserId = userId
    vueInstance.isLogged = true
    if (isDebug && debugConf.autoRun) {
      Vue.nextTick(autoRun)
    }
  }

  function login (config) {
    setConfig(config)
    return Service.init(config, {
      status: watchStatus,
      connection: {
        onConnected: onConnected,
        onSuspend: onSuspend,
        onDisconnect: onDisconnect,
        onConnecting: onConnecting
      },
      messages: watchMessage,
      chatroom: watchChatroom,
      expansion: watchExpansion,
      onTypingStatusListener: watchTyping,
      onReadReceiptReceived: watchReadReciptReceived,
      onMessageReceiptRequest: watchMessageReceiptRequest,
      onMessageReceiptResponse: watchMessageReceiptResponse,
      pullFinished: watchPullFinished,
      tag: watchTag,
      conversationTag: watchConversationTag,
      ultraGroupEnable: watchUltraGroupEnable,
      operateStatus: watchOperateStatus,
      ultraGroupMessageExpansionUpdated: watchUltraGroupMessageExpansionUpdated,
      ultraGroupMessageModified: watchUltraGroupMessageModified,
      ultraGroupMessageRecalled: watchUltraGroupMessageRecalled,
      conversation: watchConversation,
      messageBlocked: watchMessageBlocked
    }).then(function (res) {
      if (res.code === 0 ) {
        Storage.set(Storage.ConfigKey, config)
        loginSuccessEvent(res.data.userId, config)
      } else {
        console.log(error)
        vueInstance.$Message.error({
          background: true,
          content: '链接失败 ' + JSON.stringify(error)
        })
        return utils.Defer.reject()
      }
    }).catch(function (error) {
      console.log(error)
      vueInstance.$Message.error({
        background: true,
        content: '链接失败 ' + JSON.stringify(error)
      })
      return utils.Defer.reject()
    })
  }

  function getApiListMethods () {
    return {
      addOutput: function (title, result, consumedTime, params, config) {
        config = config || {}
        var output = {
          id: utils.getIncreasNumber(),
          title: title,
          result: result,
          consumedTime: consumedTime,
          params: params,
          config: config
        }
        output.time = utils.timestampToString()
        vueInstance.allOutputList.push(output)
        vueInstance.outputList.push(output)
        return output
      },
      clearOutput: function () {
        vueInstance.outputList = []
      },
      showAllOutput: function () {
        vueInstance.outputList = vueInstance.allOutputList
      },
      toJSON: function (data) {
        return utils.toJSON(data)
      },
      showJSONAlert: function (data) {
        RongIM.dialog.jsonAlert({
          data: data
        })
      },
      runAllApi: function () {
        if (vueInstance.runType === 'OneByOne') {
          runOneByOne()
        } else {
          runLineByLine()
        }
      },
      startDragging: function () {
        setTimeout(function () {
          vueInstance.isDragging = true
        }, 100)
      }
    }
  }

  function getServiceMethods () {
    return {
      openUrl: utils.openUrl,
      reverse: utils.reverse,
      login: function (config) {
        var isEqualStorage = utils.isEqual(config, StorageConfig)
        var isEqualDefault = utils.isEqual(config, DefaultConfig)
        if (isStorageConfig && isEqualStorage && !isEqualDefault && !isDebug) {
          vueInstance.$Modal.confirm({
            title: '注意',
            content: '您目前使用的为上一次链接配置, 请确定配置是否可用 ?',
            onOk: function () {
              login(config)
            }
          })
        } else {
          return login(config)
        }
      },
      alarm: function () {
        if (!this.isAlarmMuted) {
          vueInstance.$refs.alarm.play()
        }
      },
      mute: function () {
        vueInstance.$refs.alarm.pause()
      },
      showMsgExpansion: function () {
        if (vueInstance.openMsgEx) {
          vueInstance.openMsgEx = false
        } else {
          vueInstance.openMsgEx = true
        }
        var data = vueInstance.exData
        data.joinBtn = true
        data.setBtn = data.showInputBtn = data.showId = data.showUId = data.showKey = data.showVal = data.showMsg = false
      },
      exJoin (type) {
        var data = vueInstance.exData
        data.type = type
        data.showInputBtn = data.showId = data.setBtn = true
        data.joinBtn = false
        data.exeEvent = () => {
          var type = data.type === 1 ? '单聊' : '群聊'
          var time = utils.timestampToString(new Date().getTime())
          innerEl(`时间:${time}加入${type}${data.targetId}成功`)
        }
      },
      setKey () {
        var data = vueInstance.exData
        data.showId = data.showMsg = false
        data.showUId = data.showKey = data.showVal = true

        var time = utils.timestampToString(new Date().getTime())
        data.exeEvent = () => {
          var type = data.type
          var targetId = data.targetId
          var msgUId = data.msgUId

          Service.updateMessageExpansion(type, targetId, msgUId, data.msgKeys, data.msgValues, data.canIncludeExpansion, true).then(() => {
            innerEl(`时间:${time}设置成功`)
          }, (rea) => {
            innerEl(`时间:${time}设置失败, ${JSON.stringify(rea)}`)
          })
        }
      },
      delKey () {
        var data = vueInstance.exData
        data.showId = data.showVal = data.showMsg = false
        data.showUId = data.showKey = true
        data.exeEvent = () => {
          var type = data.type
          var targetId = data.targetId
          var msgUId = data.msgUId
          var keys = data.msgKeys
          var time = utils.timestampToString(new Date().getTime())
          Service.removeMessageExpansion(type, targetId, keys, msgUId, data.canIncludeExpansion, true).then(() => {
            innerEl(`时间:${time}删除成功`)
          }, (rea) => {
            innerEl(`时间:${time}删除失败, ${JSON.stringify(rea)}`)
          })
        }
      },
      getList () {
        var data = vueInstance.exData
        data.exeEvent = () => {
          var type = data.type
          var targetId = data.targetId
          Service.getHistoryMessages(0, 20, type, targetId).then((list) => {
            RongIM.dialog.jsonAlert({
              data: list
            })
          }, rea => {

          })
        }
      },
      sendMsg () {
        var data = vueInstance.exData
        data.showId = data.showUId = data.showKey = data.showVal = false
        data.showMsg = true
        var data = vueInstance.exData
        data.exeEvent = () => {
          console.log('发送消息成功', data.msgContent)
        }
      },
      exConfirm () {
        var data = vueInstance.exData
        data.exeEvent()
      },
      exCancel () {
        // 置空
        console.log('取消成功')
      }

    }
  }

  Vue.use(iview)

  vueInstance = new Vue({
    el: '#app',
    data: function () {
      return {
        currentUserId: '',
        isLogged: false,
        readyApiQueue: DefailtReadyApiQueue,
        allOutputList: [],
        outputList: [],
        globalConfig: Config,
        RunType: RunType,
        runType: 'OneByOne',

        alertJSON: null,
        isDragging: false,
        isShowRunType: false,
        isShowOutList: false,

        isDebug: RongIM.config.isDebug,
        runInfo: {
          runCount: 0,
          successApiCount: 0,
          failApiList: []
        },
        isAlarmMuted: false,
        openMsgEx: false,
        exData: {
          title: 'sdfsdf',
          exeEvent: null,
          type: null,
          targetId: null,
          joinBtn: true,
          showInputBtn: false,
          setBtn: false,
          showId: false,
          showUId: false,
          showKey: false,
          showVal: false,
          showMsg: false,
          targetId: null,
          msgUId: null,
          msgKeys: null,
          msgValues: null,
          msgContent: null,
          canIncludeExpansion: true
        }
      }
    },
    computed: {
      apiList: function () {
        return ApiList
      },
      getConnectionStatus: function () {
        var self = this
        var getConnectionStatus = RongIM.Api.getConnectionStatus
        return getConnectionStatus
      },
      currentOutput: function () {
        var outputList = this.outputList
        if (outputList.length) {
          return outputList[outputList.length - 1]
        }
      },
      displayedOutputList: function () {
        if (isDebug) {
          return this.runInfo.failApiList
        } else {
          return this.outputList
        }
      }
    },
    watch: {
      'runInfo.failApiList': function (newList) {
        if (newList.length > 20) {
          this.alarm()
        }
      },
      isAlarmMuted: function (isMuted) {
        if (isMuted) {
          this.mute()
        }
      }
    },
    components: {
      apiBtn: components.apiBtn,
      login: components.login,
      apiExpansion: components.apiExpansion,
      prettyjson: Vue.component('prettyjson', VueJsonPretty.default)
    },
    mounted: function () {
      this.isPageLoaded = true
    },
    methods: utils.extend(getApiListMethods(), getServiceMethods())
  })

  RongIM.vueInstance = vueInstance;

  (function () {
    function start () {
      isStop = false
      if (vueInstance.isLogged) {
        autoRun()
      } else {
        vueInstance.login(vueInstance.globalConfig).then(autoRun)
      }
    }
    window.addEventListener('message', function (event) {
      var type = event.data
      if (type === 'start') {
        start()
      } else if (type === 'pause') {
        isStop = true
      }
    }, false)
  })()
})(window, {
  Vue: Vue,
  iview: iview,
  VueJsonPretty: VueJsonPretty,
  RongIM: RongIM
}, window.RongIM.components)
