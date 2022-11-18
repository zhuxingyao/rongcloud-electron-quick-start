(function (win) {
  var RongIMLib = win.RongIMLib
  var RongIM = win.RongIM
  var utils = RongIM.Utils

  // var sendMsgTimeout = RongIM.config.isDebug ? 300 : 0;

  var selfUserId

  // 缓存消息, 用作撤回、删除等操作的参数
  var CacheMsg = {
    eventEmitter: new utils.EventEmitter(),
    _list: [],
    set: function (msg) {
      this._list.push(msg)
      this.eventEmitter.emit('msgChanged')
    },
    remove: function (msg) {
      var list = this._list
      utils.forEach(list, function (child, index) {
        if (child.messageUId === msg.messageUId) {
          list.splice(index, 1)
        }
      }, { isReverse: true })
      this.eventEmitter.emit('msgChanged')
    },
    getLast: function () {
      var list = this._list; var length = list.length
      var msg = {}
      if (length) {
        msg = list[length - 1]
      }
      return msg
    }
  }

  /**
   * 初始化以及链接
   * @param {object} config
   * @param {string} config.appkey 融云颁发的 appkey
   * @param {string} config.token 融云颁发的 token(代表某一个用户)
   * @param {Object} watcher
   * @param {Object} watcher.status 监听链接状态的变化
   * @param {Object} watcher.message 监听消息的接收
   */
  function init(config, watcher) {
    watcher = watcher || {}
    config = utils.clearUndefKey(config)
    config = utils.copy(config)
    var navi = config.navi
    if (config.isPolling) {
      config.connectType = 'comet'
    }
    if (navi) {
      var navigators
      navi = navi.replace(/\s/g, '')
      if (navi.indexOf(',') !== -1) {
        navigators = navi.split(',')
      } else {
        navigators = [navi]
      }
      config.navigators = navigators
    }
    config.logLevel = 0
    // config.logStdout = (logLevel, content) => {
    //   console.log(`${logLevel} | ${content}`)
    // }
    // config.customCMP = ['120.92.13.84:80']
    // config.isDebug = true;
    RongIM.config.im = config
    RongIMLib.init(config)
    const Events = RongIMLib.Events
    RongIMLib.addEventListener(Events.CONVERSATION, function (event) {
      console.log('watch conversation', event)
      const updateConvers = event.conversationList.map(item => {
          return item.conversation
      })
      watcher.conversation(updateConvers)
    })
    RongIMLib.addEventListener(Events.MESSAGES, function (event) {
      var messages = event.messages
      // var hasMore = event.hasMore
      watcher.messages(messages)
      const conversationType = RongIMLib.ConversationType.PRIVATE;
      const targetId = "2";

      RongIMLib.getUnreadCount({ conversationType, targetId }).then(res => {
        if (res.code === 0) {
          console.log('getUnreadCount',res.code, res.data)
        }
      }).catch(error => {
        console.log(error)
      }) 
      console.warn('received messages', event)
    })

    RongIMLib.addEventListener(Events.CONNECTING, watcher.connection.onConnecting)
    RongIMLib.addEventListener(Events.CONNECTED, watcher.connection.onConnected)
    RongIMLib.addEventListener(Events.DISCONNECT, watcher.connection.onDisconnect)
    RongIMLib.addEventListener(Events.SUSPEND, watcher.connection.onSuspend)
    RongIMLib.addEventListener(Events.MESSAGE_BLOCKED, watcher.messageBlocked)
    RongIMLib.addEventListener(Events.CHATROOM, function (event) {
      console.warn('chatroom', event)
      // var updatedEntries = event.updatedEntries;
      watcher.chatroom(event)
    })
    RongIMLib.addEventListener(Events.EXPANSION, function (event) {
      console.warn('----msg expansion----', event)
      watcher.expansion(event)
    })
    RongIMLib.addEventListener(Events.TYPING_STATUS, function (event) {
      console.warn('typingStatus', event)
      watcher.onTypingStatusListener(event)
    })
    RongIMLib.addEventListener(Events.READ_RECEIPT_RECEIVED, function (event) {
      console.warn('readReceiptReceived', event)
      watcher.onReadReceiptReceived(event)
    })
    RongIMLib.addEventListener(Events.MESSAGE_RECEIPT_REQUEST, function (event) {
      console.warn('messageReceiptRequest', event)
      watcher.onMessageReceiptRequest(event)
    })

    RongIMLib.addEventListener(Events.MESSAGE_RECEIPT_RESPONSE, function (event) {
      console.warn('messageReceiptResponse', event)
      watcher.onMessageReceiptResponse(event)
    })

    RongIMLib.addEventListener(Events.PULL_OFFLINE_MESSAGE_FINISHED, function () {
      console.warn('pullFinished')
      watcher.pullFinished()
    })

    RongIMLib.addEventListener(Events.TAG, function (event) {
      console.warn('tag')
      watcher.tag(event)
    })

    RongIMLib.addEventListener(Events.CONVERSATION_TAG, function (event) {
      console.warn('conversationTag', event)
      watcher.conversationTag(event)
    })

    RongIMLib.addEventListener(Events.ULTRA_GROUP_ENABLE, function (list) {
      console.warn('ultra group list', list)
      watcher.ultraGroupEnable(list)
    })
    RongIMLib.addEventListener(Events.ULTRA_GROUP_MESSAGE_EXPANSION_UPDATED, function (list) {
      console.log('update ultra group message for expansion', list)
      watcher.ultraGroupMessageExpansionUpdated(list)
    })
    RongIMLib.addEventListener(Events.ULTRA_GROUP_MESSAGE_MODIFIED, function (list) {
      console.warn('modify ultra group message', list)
      watcher.ultraGroupMessageModified(list)
    })
    RongIMLib.addEventListener(Events.ULTRA_GROUP_MESSAGE_RECALLED, function (list) {
      console.warn('recall ultra group message', list)
      watcher.ultraGroupMessageRecalled(list)
    })
    RongIMLib.addEventListener(Events.OPERATE_STATUS, function (status) {
      console.warn('ultra group typing status', status)
      watcher.operateStatus(status)
    })
    if (!config.customCMP) {
      delete config.customCMP
    }

    return RongIMLib.connect(config.token)
  }

  /**
   * 断开链接
   * 文档: https://docs.rongcloud.cn/im/imlib/web/connect/#disconnect
   */
  function disconnect() {
    return RongIMLib.disconnect()
  }

  function getConnectionStatus() {
    return Promise.resolve(RongIMLib.getConnectionStatus())
  }

  function getServerTime() {
    return Promise.resolve({code: 0, data: RongIMLib.getServerTime()})
  }

  /**
   * 重新链接
   * 文档: https://docs.rongcloud.cn/im/imlib/web/connect/#reconnect
   */
  function reconnect(token = '') {
    token = token || RongIM.config.im.token
    token = token === '自定义token' ? RongIM.config.im.token : token
    return RongIMLib.connect(token)
  }

  /**
   * 获取会话列表
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/get-list/
   *
   * @param {number} count 获取会话的数量
   * @param {number} startTime 获取起始时间
   * @param {number} order 获取顺序
   */
  function getConversationList(count, startTime, order, pullRemote) {
    return RongIMLib.getConversationList({
      count: count,
      startTime: startTime,
      order: order,
      force: pullRemote
    })
  }

  /**
   * 删除会话列表
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/remove/
   */
  function removeConversation(conversationType, targetId, channelId) {
    conversationType = Number(conversationType)
    return RongIMLib.removeConversation({
      conversationType,
      targetId: targetId,
      channelId
    })
  }

  /**
   * 获取历史消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-list/get-list/
   *
   * @param {number} timestamp 时间戳
   * @param {number} count 数量
   */
  function getHistoryMessages(timestamp, count, order, conversationType, targetId, channelId) {
    conversationType = Number(conversationType)
    count = Number(count)
    timestamp = Number(timestamp)
    order = Number(order)

    return RongIMLib.getHistoryMessages({
      conversationType,
      targetId: targetId,
      channelId
    }, {
      timestamp,
      count,
      order
    })
  }

  function getRemoteHistoryMessages(conversationType, targetId, timestamp, count, channelId) {
    conversationType = Number(conversationType)
    count = Number(count)
    timestamp = Number(timestamp)

    return RongIMLib.getRemoteHistoryMessages({
      conversationType,
      targetId,
      channelId
    }, {
      timestamp,
      count
    })
  }

  function getFirstUnreadMessage(conversationType, targetId, channelId) {
    channelId = channelId || ''
    return RongIMLib.getFirstUnreadMessage({
      conversationType,
      targetId,
      channelId
    });
  }

  /**
   * 按时间删除历史消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-list/remove-list/#_1
   *
   * @param {number} timestrap 时间戳
   */
  function clearHistoryMessages(timestamp, conversationType, targetId, channelId) {
    conversationType = Number(conversationType)
    timestamp = Number(timestamp)

    return RongIMLib.clearHistoryMessages({
      conversationType,
      targetId: targetId,
      channelId
    }, timestamp)
  }

  /**
   * 按消息删除历史消息
   * @param {string} messageUId 消息在 server 的唯一标识
   * @param {number} sentTime 消息发送时间
   * @param {number} messageDirection 消息方向
   */
  function deleteRemoteMessages(messageUId, sentTime, messageDirection, conversationType, targetId, channelId) {
    var lastMsg = CacheMsg.getLast() || {}
    conversationType = Number(conversationType) || lastMsg.conversationType
    sentTime = Number(sentTime) || lastMsg.sentTime
    messageDirection = Number(messageDirection) || lastMsg.direction

    var deleteMsg = {
      messageUId: messageUId,
      sentTime: sentTime,
      messageDirection: messageDirection
    }

    return RongIMLib.deleteMessages({
      conversationType,
      targetId: targetId,
      channelId
    }, [
      deleteMsg
    ])
  }

  /**
   * 获取指定会话未读数
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/unreadcount/#get-one
   *
   * @param {number} conversationType 会话类型
   * @param {string} targetId 目标 id (对方 id、群组 id、聊天室 id 等)
   */
  function getUnreadCount(conversationType, targetId, channelId) {
    conversationType = Number(conversationType)
    return RongIMLib.getUnreadCount({
      conversationType,
      targetId: targetId,
      channelId
    })
  }

  /**
   * 获取所有会话未读数
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/unreadcount/#get-all
   */
  async function getTotalUnreadCount(isIncludeMute) {
    return RongIMLib.getTotalUnreadCount(isIncludeMute)
  }

  /**
   * 清除指定会话未读数
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/unreadcount/#clear
   */
  function clearUnreadCount(conversationType, targetId, channelId) {
    conversationType = Number(conversationType)
    return RongIMLib.clearMessagesUnreadStatus({
      conversationType,
      targetId: targetId,
      channelId
    })
  }

  /**
   * 清除全部会话未读数
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/unreadcount/#clear
   */
  function clearAllUnreadCount() {
    return RongIMLib.clearAllMessagesUnreadStatus()
  }

  function getConversationUnreadCountByType(conversationTypes) {
    conversationTypes = conversationTypes || '1'
    let targetTypes = conversationTypes.split(',')
    targetTypes = targetTypes.map(type => Number(type))

    return RongIMLib.getTotalUnreadCount(true, targetTypes).then(({code, data}) => {
      return {code, data}
    })
  }

  function clearTotalUnreadCount() {
    return RongIMLib.getConversationList({count: 1000}).then(({code, data}) => {
      const all = [];
      data && data.forEach(conver => {
        if (conver.conversationType && conver.targetId) {
          all.push(RongIMLib.clearMessagesUnreadStatus({
            conversationType: conver.conversationType,
            targetId: conver.targetId,
            channelId: conver.channelId
          }))
        }
      })
      return Promise.all(all)
    }).then(res => {
      return Promise.resolve({code: 0, data: res})
    })
  }

  /**
   * 设置会话草稿
  */
  function setDraft(conversationType, targetId, draft, channelId) {
    conversationType = Number(conversationType)
    return RongIMLib.saveTextMessageDraft({
      conversationType,
      targetId: targetId,
      channelId
    }, draft)
  }

  /**
   * 获取会话草稿
  */
  function getDraft(conversationType, targetId, channelId) {
    conversationType = Number(conversationType)
    return RongIMLib.getTextMessageDraft({
      conversationType,
      targetId: targetId,
      channelId
    })
  }

  /**
   * 删除会话草稿
  */
  function deleteDraft(conversationType, targetId, channelId) {
    conversationType = Number(conversationType)
    return RongIMLib.clearTextMessageDraft({
      conversationType,
      targetId: targetId,
      channelId
    })
  }

  /**
   * 发送文本消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#text
   * 注意事项:
   *    1: 单条消息整体不得大于128K
   *    2: conversationType 类型是 number，targetId 类型是 string
   *
   * @param {string} text 文字内容
   * @param {number} conversationType 会话类型
   * @param {string} targetId 目标 id (对方 id、群组 id、聊天室 id 等)
   * @param {booleam} disableNotification 是否推送消息
   */
  function sendTextMessage(text, conversationType, targetId, disableNotification, canIncludeExpansion, key, val, userIds, channelId, ...args) {
    conversationType = Number(conversationType);
    let expansion = {};
    !utils.isEmpty(key) && (key = key.split(','));
    !utils.isEmpty(val) && (val = val.split(','));
    !utils.isEmpty(key) && key.forEach((item, idx) => {
      expansion[item] = val[idx];
    })
    expansion = expansion || { key: 'value' }
    const options = {
      // isStatusMessage: isStatusMessage,
      disableNotification: disableNotification,
      canIncludeExpansion,
      expansion,
      pushConfig: {
        pushTitle: args[0],
        pushContent: args[1],
        pushData: args[2],
        disablePushTitle: args[3],
        forceShowDetailContent: args[4],
        iOSConfig: {
          threadId: args[5],
          apnsCollapseId: args[6],
          category: args[7],
          richMediaUri: args[8]
        },
        androidConfig: {
          notificationId: args[9],
          channelIdMi: args[10],
          channelIdHW: args[11],
          channelIdOPPO: args[12],
          typeVivo: args[13],
          googleConfig: {
            collapseKey: args[14],
            imageUrl: args[15],
          }
        },
        templateId: args[16]
      }
    }
    if (userIds) {
      options.userIds = userIds
    }
    return RongIMLib.sendTextMessage({
      conversationType,
      targetId,
      channelId
    }, {
      content: text
    }, options)
  }

  /**
   * 发送图片消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#image
   * 注意事项:
   *    1. 略缩图(content 字段)必须是 base64 字符串, 类型必须为 jpg
   *    2. base64 略缩图必须不带前缀
   *    3. base64 字符串大小不可超过 100 k
   *    4. 可通过 FileReader 或者 canvas 对图片进行压缩, 生成压缩后的 base64 字符串
   * imageUri 为上传至服务器的原图 url, 用来展示高清图片
   * 上传图片需开发者实现. 可参考上传插件: https://docs.rongcloud.cn/im/imlib/web/plugin/upload
   *
   * @param {string} base64 图片 base64 缩略图
   * @param {string} imageUri 图片上传后的 url
   */
  function sendImageMessage(base64, imageUri, conversationType, targetId, channelId, disableNotification) {
    var content = {
      content: base64, // 压缩后的 base64 略缩图, 用来快速展示图片
      imageUri: imageUri // 上传到服务器的 url. 用来展示高清图片
    }
    const message = new RongIMLib.ImageMessage(content)
    return RongIMLib.sendMessage({
      conversationType,
      targetId,
      channelId
    }, message, {
      disableNotification
    })
  }

  /**
   * 发送图片消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#image
   * @param {string} conversationType 会话类型
   * @param {string} targetId
   * @param {string} gifDataSize 图片 base64 缩略图
   * @param {string} remoteUrl 图片上传后的 url
   * @param {string} width 图片 base64 缩略图
   * @param {string} height 图片上传后的 url
   * @param {string} extra 图片上传后的 url
   */
  function sendGIFMessage(conversationType, targetId, channelId, gifDataSize, remoteUrl, width, height, extra) {
    // var content = {
    //   gifDataSize,
    //   remoteUrl,
    //   width,
    //   height,
    //   extra
    // }

    const message = new RongIMLib.GIFMessage({
      gifDataSize,
      remoteUrl,
      width,
      height,
      extra
    })

    return RongIMLib.sendMessage({
      conversationType,
      targetId,
      channelId
    }, message)
  }

  /**
   * 发送文件消息
   * 文档：https://docs.rongcloud.cn/im/imlib/web/message-send/#file
   *
   * @param {string} fileName 文件名
   * @param {string} fileSize 文件大小
   * @param {string} fileType 文件类型
   * @param {string} fileUrl 文件上传后的 url
   */
  function sendFileMessage(fileName, fileSize, fileType, fileUrl, conversationType, targetId, channelId, disableNotification) {
    var content = {
      name: fileName, // 文件名
      size: fileSize, // 文件大小
      type: fileType, // 文件类型
      fileUrl: fileUrl // 文件地址
    }

    const message = new RongIMLib.FileMessage(content)

    return RongIMLib.sendMessage({
      conversationType,
      targetId,
      channelId
    }, message, {
      disableNotification
    })
  }

  /**
   * 高质量语音消息: https://docs.rongcloud.cn/im/introduction/message_structure/#hqvoice_message
   * 注意事项:
   *   融云不提供声音录制的方法. remoteUrl 的生成需开发者实现
   *
   * @param {string} remoteUrl 语音上传后的 url
   * @param {number} duration 语音时长
   */
  function sendVoiceMessage(remoteUrl, type, duration, conversationType, targetId, channelId, disableNotification) {
    // var content = {
    //   remoteUrl: remoteUrl, // 音频 url, 建议格式: aac
    //   duration: duration, // 音频时长
    //   type: type
    // }

    const message = new RongIMLib.HQVoiceMessage({
      remoteUrl: remoteUrl, // 音频 url, 建议格式: aac
      duration: duration, // 音频时长
      type: type
    })
    return RongIMLib.sendMessage({
      conversationType,
      targetId,
      channelId
    }, message, {
      disableNotification
    })
  }

  /**
   * 撤回消息: https://docs.rongcloud.cn/im/imlib/web/message-send/#recall
   * 注意事项:
   *   消息撤回操作服务器端没有撤回时间范围的限制，由客户端决定
   *
   * @param {string} messageUId 撤回的消息 Uid
   * @param {number} sentTime 撤回的消息 sentTime
   */
  // BKE3-39Q0-4ME7-QRCS
  // 1599619898624
  function sendRecallMessage(messageUId, sentTime, conversationType, targetId, channelId, disableNotification, ...args) {
    if (!messageUId || !sentTime) {
      return utils.Defer.reject('请先发送消息, 再进行撤回操作');
    }

    var option = {
      disableNotification,
      messageUId: messageUId,
      sentTime: sentTime,
      pushConfig: {
        pushTitle: args[0],
        pushContent: args[1],
        pushData: args[2],
        disablePushTitle: args[3],
        forceShowDetailContent: args[4],
        iOSConfig: {
          threadId: args[5],
          apnsCollapseId: args[6],
          category: args[7],
          richMediaUri: args[8]
        },
        androidConfig: {
          notificationId: args[9],
          channelIdMi: args[10],
          channelIdHW: args[11],
          channelIdOPPO: args[12],
          typeVivo: args[13],
          googleConfig: {
            collapseKey: args[14],
            imageUrl: args[15],
          }
        },
        templateId: args[16]
      },
      user: args[17] ? JSON.parse(args[17]) : undefined,
      extra: args[18],
      isDelete: args[19]
    }

    return RongIMLib.recallMessage({
      conversationType,
      targetId: targetId,
      channelId
    }, option)
  }

  /**
   * 发送 @ 消息(此处以文本消息举例)
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#example
   *
   * @param {string} text 文字内容
   * @param {string} methiondId @ 对象的 id
   */
  function sendAtMessage(text, methiondId, conversationType, targetId, disableNotification, channelId, mentionedType, mentionedContent) {
    conversationType = Number(conversationType)

    if (![1,2].includes(mentionedType)) {
      return Promise.reject('The value of mentionedType must be 1 or 2')
    }

    var isMentioned = true

    var content = {
      content: text,
      mentionedInfo: {
        type: mentionedType,
        userIdList: [methiondId],
        mentionedContent
      }
    }

    const message = new RongIMLib.TextMessage(content)

    return RongIMLib.sendMessage({
      conversationType,
      targetId: targetId,
      channelId
    }, message, {
      isMentioned: isMentioned,
      disableNotification
    });
  }

  // 测试错误参数下发送 @  消息
  function sendAtMessageByErrorParamField(text, methiondId, conversationType, targetId, disableNotification) {
    conversationType = Number(conversationType)

    var isMentioned = true

    var content = {
      content: text
    }
    const message = new RongIMLib.TextMessage(content)

    return RongIMLib.sendMessage({
      conversationType,
      targetId: targetId
    }, message, {
      isMentiond: isMentioned,
      mentiondUserIdList: [methiondId], // @ 人 id 列表
      mentiondType: 1,
      disableNotification
    });
  }

  /**
   * 注册自定义消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#custom
   *
   * @param {string} messageName 注册消息的 Web 端类型名
   * @param {string} messageType 注册消息的唯一名称. 注: 此名称需多端一致
   * @param {boolean} isCounted 是否计数
   * @param {boolean} isPersited 是否存储
   * @param {Array<string>} props 消息包含的字段集合
   */
  function registerMessage(messageType, isPersited, isCounted, props) {
    // var mesasgeTag = new RongIMLib.MessageTag(isCounted, isPersited); //true true 保存且计数，false false 不保存不计数。
    // props = props.split(','); // 将字符串截取为数组. 此处为 Demo 逻辑, 与融云无关
    // RongIMClient.registerMessageType(messageName, messageType, mesasgeTag, props);
    // 废弃此概念

    props = props.split(','); // 将字符串截取为数组. 此处为 Demo 逻辑, 与融云无关
    RongIMLib.registerMessageType(messageType, isPersited, isCounted, props)
    return utils.Defer.resolve()
  }

  /**
   * 发送自定义消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#custom
   *
   * @param {string} messageType 注册消息的 Web 端类型名
   * @param {*} props 消息包含的字段集合
   */
  function sendRegisterMessage(messageType, props, conversationType, targetId, channelId, disableNotification) {
    var content = {}
    props && (props = props.split(','))
    props.forEach(item => {
      content[item] = item
    })

    const message = new RongIMLib.BaseMessage(
      messageType,
      {
        content: content
      }
    )

    return RongIMLib.sendMessage({
      conversationType,
      targetId: targetId,
      channelId
    }, message, {
      disableNotification
    })
  }

  /**
   * 发送位置消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#location
   * 注意事项:
   *   1. 缩略图必须是base64码的jpg图, 而且不带前缀"data:image/jpeg;base64,", 不得超过100K
   *   2. 需要开发者做显示效果, 一般显示逻辑: 图片加链接, 传入经纬度并跳转进入地图网站
   *
   * @param {string} base64 位置缩略图
   * @param {number} latitude 维度
   * @param {number} longitude 经度
   * @param {string} poi 位置信息
   */
  function sendLocationMessage(base64, latitude, longitude, poi, conversationType, targetId, channelId, disableNotification) {
    // var content = {
    //   latitude: latitude,
    //   longitude: longitude,
    //   poi: poi,
    //   content: base64
    // }

    const message = new RongIMLib.LocationMessage({
      latitude: latitude,
      longitude: longitude,
      poi: poi,
      content: base64
    })
    return RongIMLib.sendMessage({
      conversationType,
      targetId: targetId,
      channelId
    }, message, {
      disableNotification
    })
  }

  /**
   * 发送引用消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#location
   * 注意事项:
   *
   * @param {string} referContent 引用消息内容
   * @param {number} referMsgUserId 引用消息用户 ID
   * @param {number} objName 引用消息类型
   * @param {string} content 消息内容
   */
  function sendReferenceMessage(referContent, referMsgUserId, objName, content, conversationType, targetId, channelId, disableNotification) {
    // var content = {
    //   referMsg: {
    //     content: referContent
    //   },
    //   referMsgUserId: referMsgUserId,
    //   objName: objName,
    //   content: content
    // }

    const message = new RongIMLib.ReferenceMessage({
      referMsgUserId,
      referMsg: {
        content: referContent
      },
      content,
      objName
    })

    return RongIMLib.sendMessage({
      conversationType,
      targetId: targetId,
      channelId
    }, message, {
      disableNotification
    })
  }

  /**
   * 发送富文本(图文)消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#rich-content
   *
   * @param {string} title 图文标题
   * @param {number} content 图文内容
   * @param {number} imageUri 显示图片的 url(图片信息)
   * @param {string} url 点击图文后打开的 url
   */
  function sendRichContentMessage(title, content, imageUri, url, conversationType, targetId, channelId, disableNotification) {
    // content = {
    //   title: title,
    //   content: content,
    //   imageUri: imageUri,
    //   url: url
    // }

    const message = new RongIMLib.RichContentMessage({
      title: title,
      content: content,
      imageUri: imageUri,
      url: url
    })

    return RongIMLib.sendMessage({
      conversationType,
      targetId: targetId,
      channelId
    }, message, {
      disableNotification
    })
  }

  /**
   * 发送小视频消息
  */
  function sendSightMessage(conversationType, targetId, channelId, sightUrl, content, duration, size, name) {
    // content = {
    //   sightUrl: sightUrl,
    //   content: content,
    //   duration: duration,
    //   size: size,
    //   name: name
    // }
    const message = new RongIMLib.SightMessage({
      sightUrl: sightUrl,
      content: content,
      duration: duration,
      size: size,
      name: name
    })
    return RongIMLib.sendMessage({
      conversationType,
      targetId: targetId,
      channelId
    }, message)
  }

  function sendImageMessageByUpload(file, conversationType, targetId, channelId, disableNotification, maxHeight, maxWidth, quality, scale, isPreview) {
    if (!file) {
      alert('需要选择一个图片');
      return Promise.reject('需要选择一个图片');
    }

    return RongIMLib.sendImageMessage({
      conversationType,
      targetId,
      channelId
    }, {
      file
    }, {
      onProgress: function (progress) {
        console.log(progress)
      }
    }, {
      disableNotification,
      thumbnailConfig: {
        maxHeight, maxWidth, quality, scale
      },
      contentDisposition: isPreview ? 'inline' : 'attachment'
    });
  }

  function sendFileMessageByUpload(file, conversationType, targetId, channelId, disableNotification, isPreview) {
    if (!file) {
      alert('需要选择一个文件');
      return Promise.reject('需要选择一个文件');
    }

    return RongIMLib.sendFileMessage({
      conversationType,
      targetId,
      channelId
    }, {
      file
    }, {
      onProgress: function (progress) {
        console.log(progress)
      }
    }, {
      disableNotification,
      contentDisposition: isPreview ? 'inline' : 'attachment'
    }
    );
  }

  function sendHQVoiceMessageByUpload(file, conversationType, targetId, channelId, disableNotification, isPreview) {
    if (!file) {
      alert('需要选择一个声音文件');
      return Promise.reject('需要选择一个声音文件');
    }

    return RongIMLib.sendHQVoiceMessage({
      conversationType,
      targetId,
      channelId
    }, {
      file
    }, {
      onProgress: function (progress) {
        console.log(progress)
      }
    }, {
      disableNotification,
      contentDisposition: isPreview ? 'inline' : 'attachment'
    });
  }

  function sendSightMessageByUpload(file, conversationType, targetId, channelId, disableNotification, thumbnail, duration, name, isPreview) {
    if (!file) {
      alert('需要选择一个短视频');
      return Promise.reject('需要选择一个短视频文件');
    }

    return RongIMLib.sendSightMessage({
      conversationType,
      targetId,
      channelId
    }, {
      file,
      duration,
      name,
      thumbnail
    }, {
      onProgress: function (progress) {
        console.log(progress)
      }
    }, {
      disableNotification,
      contentDisposition: isPreview ? 'inline' : 'attachment'
    });
  }

  function sendCombineMessageByUpload(file, conversationType, targetId, channelId, disableNotification, nameList, summaryList, ctype, isPreview) {
    if (!file) {
      alert('需要选择一个HTML文件');
      return Promise.reject('需要选择一个HTML文件');
    }
    nameList = nameList.split(',')
    summaryList = summaryList.split(',')
    return RongIMLib.sendCombineMessage({
      conversationType,
      targetId,
      channelId
    }, {
      file,
      nameList,
      summaryList,
      conversationType: ctype
    }, {
      onProgress: function (progress) {
        console.log(progress)
      }
    }, {
      disableNotification
    }, {
      isPreview
    });
  }

  /**
   * 加入聊天室
   * 文档: https://docs.rongcloud.cn/im/imlib/web/chatroom/#join
   *
   * @param {string} chatRoomId 聊天室 id
   * @param {number} count 拉取消息数量
   */
  function joinChatRoom(chatRoomId, count) {
    return RongIMLib.joinChatRoom(chatRoomId, {
      count: count
    })
  }

  /**
   * 加入已存在的聊天室
   * 文档: https://docs.rongcloud.cn/im/imlib/web/chatroom/#join
   *
   * @param {string} chatRoomId 聊天室 id
   * @param {number} count 拉取消息数量
   */
  function joinExistChatRoom(chatRoomId, count) {
    return RongIMLib.joinExistChatRoom(chatRoomId, {
      count: count
    })
  }

  /**
   * 退出聊天室
   * 文档: https://docs.rongcloud.cn/im/imlib/web/chatroom/#quit
   *
   * @param {string} chatRoomId 聊天室 id
   */
  function quitChatRoom(chatRoomId) {
    return RongIMLib.quitChatRoom(chatRoomId)
  }

  /**
   * 获取聊天室信息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/chatroom/#get
   *
   * @param {string} chatRoomId 聊天室 id
   * @param {string} count 获取人数
   * @param {string} order 排序方式
   */
  function getChatRoomInfo(chatRoomId, count, order) {
    return RongIMLib.getChatRoomInfo(chatRoomId, {
      count: count,
      order: order
    })
  }

  function getChatRoomHistoryMessages(chatRoomId, timestrap, count, order) {
    return RongIMLib.getChatroomHistoryMessages(chatRoomId, {
      timestamp: timestrap,
      count: count,
      order: order
    })
  }

  function setChatRoomEntry(key, value, isAutoDelete, isSendNotification, extra, chatRoomId) {
    var entry = {
      key: key,
      value: value,
      notificationExtra: extra,
      isAutoDelete: isAutoDelete,
      isSendNotification: isSendNotification
    }
    return RongIMLib.setChatRoomEntry(chatRoomId, entry)
  }

  function setChatRoomEntries(chatRoomId, entries, isAutoDelete) {
    try {
      entries = JSON.parse(entries)
    } catch (e) {
      alert('自定义kv属性集合输入错误')
      throw e
    }
    const options = {
      entries,
      isAutoDelete
    }
    return RongIMLib.setChatRoomEntries(chatRoomId, options)
  }

  function forceSetChatRoomEntry(key, value, isAutoDelete, isSendNotification, extra, chatRoomId) {
    var entry = {
      key: key,
      value: value,
      notificationExtra: extra,
      isAutoDelete: isAutoDelete,
      isSendNotification: isSendNotification
    }
    return RongIMLib.forceSetChatRoomEntry(chatRoomId, entry)
  }

  function removeChatRoomEntry(key, isSendNotification, extra, chatRoomId) {
    var entry = {
      key: key,
      notificationExtra: extra,
      isSendNotification: isSendNotification
    }
    return RongIMLib.removeChatRoomEntry(chatRoomId, entry)
  }

  function removeChatRoomEntries(chatRoomId, entries) {
    try {
      entries = JSON.parse(entries)
    } catch (e) {
      alert('自定义kv属性集合输入错误')
      throw e
    }
    return RongIMLib.removeChatRoomEntries(chatRoomId, {
      entries,
    })
  }

  function forceRemoveChatRoomEntry(key, isSendNotification, extra, chatRoomId) {
    var entry = {
      key: key,
      notificationExtra: extra,
      isSendNotification: isSendNotification
    }
    return RongIMLib.forceRemoveChatRoomEntry(chatRoomId, entry)
  }

  function getChatRoomEntry(key, chatRoomId) {
    return RongIMLib.getChatRoomEntry(chatRoomId, key)
  }

  function getAllChatRoomEntries(chatRoomId) {
    return RongIMLib.getAllChatRoomEntries(chatRoomId)
  }

  function setConversationNotificationStatus(isNotification, conversationType, targetId, channelId) {
    return RongIMLib.setConversationNotificationStatus({
      conversationType,
      targetId,
      channelId
    }, isNotification);
  }

  function setConversationNotificationLevel(isNotification, conversationType, targetId, channelId) {
    return RongIMLib.setConversationNotificationLevel({
      conversationType,
      targetId,
      channelId
    }, isNotification);
  }

  function setConversationToTop(isTop, conversationType, targetId, channelId) {
    return RongIMLib.setConversationToTop({
      conversationType,
      targetId,
      channelId
    }, isTop);
  }

  function getBlockedConversationList() {
    return RongIMLib.getBlockedConversationList()
  }

  function getTopConversationList() {
    return RongIMLib.getTopConversationList()
  }

  function setMessageKV() {
    console.log('setMessageKV')
    return Promise.resolve('set message kv')
  }

  function updateMessageExpansion(conversationType, targetId, channelId, messageUId, key, value, canIncludeExpansion, isTest) {
    key && (key = key.split(','))
    value && (value = value.split(','))
    var expansion = {}
    key.forEach((item, idx) => {
      expansion[item] = value[idx]
    })
    isTest = true
    let message
    if (isTest) {
      message = {
        canIncludeExpansion: canIncludeExpansion == undefined ? true : canIncludeExpansion,
        messageUId,
        conversationType,
        targetId,
        channelId
      }
    } else {
      message = CacheMsg.getLast()
      if (utils.isEmpty(message)) {
        return utils.Defer.reject('请先发送一条消息')
      }
    }
    return RongIMLib.updateMessageExpansion(expansion, message)
  }

  function removeMessageExpansion(conversationType, targetId, channelId, keys, messageUId, canIncludeExpansion, isTest) {
    keys.length > 0 && (keys = keys.split(','))
    let message
    isTest = true
    if (isTest) {
      message = {
        canIncludeExpansion: canIncludeExpansion == undefined ? true : canIncludeExpansion,
        messageUId,
        conversationType,
        targetId,
        channelId
      }
    } else {
      message = CacheMsg.getLast()
      if (utils.isEmpty(message)) {
        return utils.Defer.reject('请先发送一条消息')
      }
    }
    return RongIMLib.removeMessageExpansionForKey(keys, message)
  }

  function getLastCacheMsgUId() {
    return CacheMsg.getLast().messageUId
  }
  function getLastCacheMsgSentTime() {
    return CacheMsg.getLast().sentTime
  }
  function getLastCacheMsgDirection() {
    return CacheMsg.getLast().direction
  }

  function sendReadReceiptMessage(targetId, messageUId, lastMessageSendTime, channelId) {
    if (!targetId || !messageUId || !lastMessageSendTime) {
      alert('参数不能为空')
      return
    }
    return RongIMLib.sendReadReceiptMessage(targetId, messageUId, lastMessageSendTime, channelId)
  }

  // 获取已读列表
  function getMessageReader(targetId, messageUid, channelId) {
    if (!targetId || !messageUid) {
      alert('参数不能为空')
      return
    }
    return RongIMLib.getMessageReader(targetId, messageUid, channelId)
  }

  /**
   * 发送群回执请求消息
   */
  function sendReadReceiptRequestMessage(targetId, messageUId, channelId) {
    if (!messageUId.trim()) {
      alert('需要设置消息id')
      return
    }
    return RongIMLib.sendReadReceiptRequest(targetId, messageUId, channelId)
  }

  /**
   * 发送群回执响应消息
   */
  function sendReadReceiptResponseMessage(targetId, messageList, channelId) {
    try{
      messageList = JSON.parse(messageList);
    } catch(e) {
      alert('messageList参数错误，应该为json')
      return
    }
    if (messageList && !Object.keys(messageList).length) {
      alert('需要设置消息列表')
      return
    }
    return RongIMLib.sendReadReceiptResponseV2(targetId, messageList, channelId)
  }

  /**
   * 发送群回执响应消息（新）
   */
  function sendNewReadReceiptResponseMessage(targetId, messageList, channelId) {
    return sendReadReceiptResponseMessage(targetId, messageList, channelId);
  }

  function sendSyncReadStatusMessage(conversationType, targetId, channelId, lastMessageSendTime) {
    channelId = channelId || ''
    return RongIMLib.sendSyncReadStatusMessage({
      conversationType,
      targetId,
      channelId
    }, lastMessageSendTime)
  }

  /**
   * 创建标签
   */
  function createTag(tagId, tagName) {
    return RongIMLib.addTag({
      tagId,
      tagName
    });
  }

  /**
   * 修改标签
   */
  function updateTag(tagId, tagName) {
    return RongIMLib.updateTag({
      tagId,
      tagName
    });
  }
  /**
   * 删除标签
   */
  function removeTag(tagId) {
    return RongIMLib.removeTag(tagId)
  }
  /**
   * 获取标签列表
   */
  function getTagList() {
    return RongIMLib.getTags()
  }

  /**
   * 添加会话到指定标签
   */
  function addConversationsToTag(tagId, targetId, type, channelId, multiConversation) {
    var conList = multiConversation.trim() ? JSON.parse(multiConversation) : [{
      targetId,
      conversationType: type,
      channelId
    }];

    return RongIMLib.addConversationsToTag(tagId, conList)
  }
  /**
   * 从多个会话中批量删除指定标签
   */
  function removeTagForConversations(tagId, targetId, type, channelId, multiConversation) {
    var conList = multiConversation.trim() ? JSON.parse(multiConversation) : [{
      targetId,
      conversationType: type,
      channelId
    }];

    return RongIMLib.removeTagFromConversations(tagId, conList)
  }
  /**
   * 从单一会话中批量删除标签
   */
  function removeTagsForConversation(tagId, targetId, type, channelId) {
    var con = {
      targetId,
      conversationType: type,
      channelId
    };
    var tagIds = tagId.split(',')
    return RongIMLib.removeTagsFromConversation(con, tagIds)
  }
  /**
   * 分页获取标签下会话列表
   */
  function getConversationsFromTagByPage(tagId, count, startTime) {
    return RongIMLib.getConversationsFromTagByPage(tagId, count, startTime)
  }

  /**
   * 根据标签获取未读消息数
   */
  function getUnreadCountByTag(tagId, containMuted) { 
    return RongIMLib.getUnreadCountByTag(tagId, containMuted)
  }

  /**
   * 设置标签中会话置顶
   */
  function setConversationToTopInTag(tagId, targetId, type, channelId, isTop) {
    var con = {
      targetId,
      conversationType: type,
      channelId
    };
    return RongIMLib.setConversationToTopInTag(tagId, con, isTop)
  }

  /**
   * 获取回话下的标签
   */
  function getTagsFromConversation(targetId, type, channelId) {
    var con = {
      targetId,
      conversationType: type,
      channelId: channelId || ''
    };
    return RongIMLib.getTagsFromConversation(con)
  }

  function removeConversationsFromTag(tagId, targetId, type, channelId, multiConversation) {
    var conList = multiConversation.trim() ? JSON.parse(multiConversation) : [{
      targetId,
      conversationType: type,
      channelId
    }];

    return RongIMLib.removeConversationsFromTag(tagId, conList)
  }

  /**
   * =========== 协议栈独有接口 ============
  */
  /**
   * 向本地插入消息
  */
   function insertMessage(conversationType, targetId, channelId, senderUserId, objectName, content, direction, channelId) {
    const msg = {
      senderUserId,
      messageType: objectName,
      content: {
        content
      },
      messageDirection: direction,
      channelId
    }
    return RongIMLib.insertMessage({conversationType, targetId, channelId}, msg)
  }
  /**
   * 获取本地消息
  */
  function getMessage(messageId) {
    return RongIMLib.getMessage(messageId)
  }

  /**
   * 获取会话下所有未读的 @ 消息
  */
  function getUnreadMentionedMessage(conversationType, targetId, channelId) {
    return new Promise((resolve, reject) => {
      const msg = RongIMLib.getUnreadMentionedMessages({conversationType, targetId, channelId})
      resolve(msg)
    })
  }

  /**
   * 按内容搜索会话内的消息
  */
  function searchMessageByContent(conversationType, targetId, keyword, timestamp, count, channelId) {
    return RongIMLib.searchMessages({conversationType, targetId, channelId}, keyword, timestamp, count, 1)
  }

  /**
   * 通过时间戳删除删除本地消息
  */
  function deleteLocalMessagesByTimestamp(conversationType, targetId, timestamp, channelId) {
    return RongIMLib.deleteLocalMessagesByTimestamp({conversationType, targetId, channelId}, timestamp, false)
  }

  /**
   * 清空会话下本地历史消息
  */
  function clearMessages(conversationType, targetId, channelId) {
    return RongIMLib.clearMessages({conversationType, targetId, channelId})

  }

  /**
   * 通过关键字搜索会话
  */
  function searchConversationByContent(keyword, converTypes, customMessageTypes, channelId) {
    let types;
    let msgTypes;
    if (!utils.isEmpty(converTypes)) {
      types = converTypes.split(',')
    }
    if (!utils.isEmpty(customMessageTypes)) {
      msgTypes = customMessageTypes.split(',')
    }
    return RongIMLib.searchConversationByContent(keyword, types, msgTypes, channelId)
  }

  /**
   * 删除时间戳前的未读消息数量
  */
  function clearUnreadCountByTimestamp(conversationType, targetId, timestamp, channelId) {
    return RongIMLib.clearUnreadCountByTimestamp({conversationType, targetId, channelId}, timestamp)
  }

  /**
   * 获取会话免打扰状态（旧）
  */
  function getConversationNotificationStatus(conversationType, targetId, channelId) {
    return RongIMLib.getConversationNotificationStatus({conversationType, targetId, channelId})
  }

  /**
   * 获取会话免打扰状态（新）
  */
  function getConversationNotificationLevel(conversationType, targetId, channelId) {
    return RongIMLib.getConversationNotificationLevel({conversationType, targetId, channelId})
  }
  /**
   * 查询指定超级群默认通知配置
  */
  function getUltraGroupDefaultNotificationLevel(targetId, channelId) {
    return RongIMLib.getUltraGroupDefaultNotificationLevel({targetId, channelId})
  }

  /**
   * 获取指定超级群所有频道未读数 
  */
  function getUltraGroupUnreadCountByTargetId(targetId) {
    return RongIMLib.getUltraGroupUnreadCountByTargetId(targetId)
  }

  /**
   * 获取超级群类型所有消息未读数 
  */
   function getAllUltraGroupUnreadCount(targetId) {
    return RongIMLib.getAllUltraGroupUnreadCount(targetId)
  }

  /**
   * 获取超级群类型所有 @ 消息未读数 
  */
   function getAllUltraGroupUnreadMentionedCount(targetId) {
    return RongIMLib.getAllUltraGroupUnreadMentionedCount(targetId)
  }

  /**
   * 查询指定超级群默认通知配置
  */
  function setUltraGroupDefaultNotificationLevel(targetId, channelId, notificationLevel) {
    return RongIMLib.setUltraGroupDefaultNotificationLevel({ targetId, channelId}, notificationLevel)
  }

  /**
   * 设置消息接受状态
   * @param {}} messageId 
   * @param {*} receivedStatus 
   * @returns 
   */
  function setMessageReceivedStatus(messageId, receivedStatus) {
    return RongIMLib.setMessageReceivedStatus(messageId, receivedStatus)
  }

  /**
   * 获取超级群会话列表
   */
  function getUltraGroupList() {
    return RongIMLib.getUltraGroupList()
  }
  /**
   * 获取超级群免打扰会话列表
   */
  function getBlockUltraGroupList() {
    return RongIMLib.getBlockUltraGroupList()
  }

  /**
   * 扩展消息
   */
  function updateExpansionForUltraGroupMessage(
    conversationType, 
    targetId, 
    channelId, 
    messageUId, 
    sendTime,
    canIncludeExpansion,
    keys,
    values) {
      if (!canIncludeExpansion) return Promise.resolve({msg: '消息扩展开关未开'})
      const keyArray = keys.split(',') || []
      const valueArray = values.split(',') || []
      let expansion = {}
      keyArray.forEach((item, index) => {
        if (valueArray.length > index) {
          expansion[item] = valueArray[index]
        }
      })
      
      const msg = {
        canIncludeExpansion,
        channelId,
        conversationType,
        targetId,
        messageUId,
        sentTime: sendTime
      }
      return RongIMLib.updateExpansionForUltraGroupMessage(expansion, msg)
  }

  /**
   * 删除消息的扩展
   */
  function removeExpansionForUltraGroupMessage(
    conversationType, 
    targetId, 
    channelId, 
    messageUId, 
    sendTime,
    canIncludeExpansion,
    deleteKeys) {
      if(!canIncludeExpansion) return
      const keyArray = deleteKeys.split(',')
      const msg = {
        canIncludeExpansion,
        channelId,
        conversationType,
        targetId,
        messageUId,
        sentTime: sendTime
      }
      return RongIMLib.removeExpansionForUltraGroupMessage(keyArray, msg)
  }

  /**
   * 删除消息的所有扩展
   */
  function removeAllExpansionForUltraGroupMessage(
    conversationType, 
    targetId, 
    channelId,
    messageUId, 
    sendTime,
    canIncludeExpansion) {
      if(!canIncludeExpansion) return
      const msg = {
        canIncludeExpansion,
        channelId,
        conversationType,
        targetId,
        messageUId,
        sentTime: sendTime
      }
      return RongIMLib.removeAllExpansionForUltraGroupMessage(msg)
  }

  /**
   * 根据ID删除超级群会话
   */
  function modifyMessage(
    conversationType, 
    targetId, 
    channelId,
    messageUId, 
    sendTime,
    content) {
    const obj = JSON.parse(content)
    const msg = {
      channelId,
      conversationType,
      targetId,
      messageUId,
      sentTime: sendTime
    }
    return RongIMLib.modifyMessage(obj, msg)
  }

  /**
   * 正在输入中
   */
  function sendUltraGroupTypingStatus(conversationType, targetId, channelId) {
    return RongIMLib.sendUltraGroupTypingStatus({targetId, conversationType, channelId})
  }

   /**
   * 根据ID获取消息列表
   */
  function getUltraGroupMessageListByMessageUId(conversationType, targetId, channelId, messages) {
    const msgs = JSON.parse(messages)
    return RongIMLib.getUltraGroupMessageListByMessageUId({ conversationType, targetId, channelId }, msgs)
  }

  /**
   * 获取指定超级群所有子频道的未读数
   */
  function getUltraGroupUnreadMentionedCountByTargetId(targetId) {
    return RongIMLib.getUltraGroupUnreadMentionedCountByTargetId(targetId)
  }


  /**
   * 获取 @ 未读消息数
   */
  function getUnreadMentionedCount (conversationType, targetId, channelId) {
    return RongIMLib.getUnreadMentionedCount({
      conversationType, targetId, channelId
    })
  }

  /**
   * 获取所有 @ 未读消息数
   */
  function getAllUnreadMentionedCount () {
    return RongIMLib.getAllUnreadMentionedCount()
  }

  win.RongIM = win.RongIM || {}
  win.RongIM.Service = {
    init: init,
    disconnect: disconnect,
    reconnect: reconnect,
    getServerTime: getServerTime,

    registerMessage: registerMessage,
    sendRegisterMessage: sendRegisterMessage,

    getConversationList: getConversationList,
    removeConversation: removeConversation,

    getHistoryMessages: getHistoryMessages,
    getRemoteHistoryMessages: getRemoteHistoryMessages,
    clearHistoryMessages: clearHistoryMessages,
    deleteRemoteMessages: deleteRemoteMessages,
    getFirstUnreadMessage: getFirstUnreadMessage,

    sendTextMessage: sendTextMessage,
    sendImageMessage: sendImageMessage,
    sendGIFMessage: sendGIFMessage,
    sendFileMessage: sendFileMessage,
    sendVoiceMessage: sendVoiceMessage,
    sendAtMessage: sendAtMessage,
    sendAtMessageByErrorParamField: sendAtMessageByErrorParamField,
    sendLocationMessage: sendLocationMessage,
    sendRichContentMessage: sendRichContentMessage,
    sendRecallMessage: sendRecallMessage,
    sendReferenceMessage: sendReferenceMessage,
    sendSightMessage: sendSightMessage,
    sendSyncReadStatusMessage: sendSyncReadStatusMessage,

    sendImageMessageByUpload: sendImageMessageByUpload,
    sendFileMessageByUpload: sendFileMessageByUpload,
    sendHQVoiceMessageByUpload: sendHQVoiceMessageByUpload,
    sendSightMessageByUpload: sendSightMessageByUpload,
    sendCombineMessageByUpload: sendCombineMessageByUpload,

    getUnreadCount: getUnreadCount,
    getTotalUnreadCount: getTotalUnreadCount,
    clearUnreadCount: clearUnreadCount,
    clearAllUnreadCount,
    getConversationUnreadCountByType: getConversationUnreadCountByType,
    clearTotalUnreadCount: clearTotalUnreadCount,

    setDraft: setDraft,
    getDraft: getDraft,
    deleteDraft: deleteDraft,

    joinChatRoom: joinChatRoom,
    joinExistChatRoom: joinExistChatRoom,
    quitChatRoom: quitChatRoom,
    getChatRoomInfo: getChatRoomInfo,
    getChatRoomHistoryMessages: getChatRoomHistoryMessages,
    setChatRoomEntry: setChatRoomEntry,
    setChatRoomEntries: setChatRoomEntries,
    forceSetChatRoomEntry: forceSetChatRoomEntry,
    removeChatRoomEntry: removeChatRoomEntry,
    forceRemoveChatRoomEntry: forceRemoveChatRoomEntry,
    removeChatRoomEntries: removeChatRoomEntries,
    getChatRoomEntry: getChatRoomEntry,
    getAllChatRoomEntries: getAllChatRoomEntries,

    getLastCacheMsgSentTime: getLastCacheMsgSentTime,
    getLastCacheMsgUId: getLastCacheMsgUId,
    getLastCacheMsgDirection: getLastCacheMsgDirection,
    msgEmitter: CacheMsg.eventEmitter,

    getConnectionStatus: getConnectionStatus,

    // setConversationStatus: setConversationStatus,
    setConversationNotificationStatus: setConversationNotificationStatus,
    setConversationNotificationLevel,
    setConversationToTop: setConversationToTop,
    getTopConversationList: getTopConversationList,
    getBlockedConversationList: getBlockedConversationList,
    setMessageKV,
    updateMessageExpansion,
    removeMessageExpansion,

    sendReadReceiptMessage,
    getMessageReader,
    sendReadReceiptRequestMessage,
    sendReadReceiptResponseMessage,
    sendNewReadReceiptResponseMessage,

    createTag,
    updateTag,
    removeTag,
    getTagList,
    addConversationsToTag,
    removeTagForConversations,
    removeTagsForConversation,
    getConversationsFromTagByPage,
    getUnreadCountByTag,
    setConversationToTopInTag,
    getTagsFromConversation,
    removeConversationsFromTag,
    getUltraGroupList,
    getBlockUltraGroupList,
    updateExpansionForUltraGroupMessage,
    removeExpansionForUltraGroupMessage,
    removeAllExpansionForUltraGroupMessage,
    modifyMessage,
    sendUltraGroupTypingStatus,
    getUltraGroupMessageListByMessageUId,
    getUltraGroupUnreadMentionedCountByTargetId,
    // 协议栈独有接口
    insertMessage,
    getMessage,
    getUnreadMentionedMessage,
    searchMessageByContent,
    deleteLocalMessagesByTimestamp,
    clearMessages,
    searchConversationByContent,
    clearUnreadCountByTimestamp,
    getConversationNotificationStatus,
    getConversationNotificationLevel,
    setUltraGroupDefaultNotificationLevel,
    getUltraGroupDefaultNotificationLevel,
    getUltraGroupUnreadCountByTargetId,
    getAllUltraGroupUnreadCount,
    getAllUltraGroupUnreadMentionedCount,
    setMessageReceivedStatus,
    getUnreadMentionedCount,
    getAllUnreadMentionedCount
  }
})(window)
