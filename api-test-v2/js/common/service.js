(function (win) {
  var RongIMLib = win.RongIMLib,
    RongIM = win.RongIM,
    RongIMClient = RongIMLib.RongIMClient,
    utils = RongIM.Utils;

  var sendMsgTimeout = RongIM.config.isDebug ? 300 : 0;

  var selfUserId;

  // var logger = RongIMClient.createLogger('TEST', 'IM')

  // 缓存消息, 用作撤回、删除等操作的参数
  var CacheMsg = {
    eventEmitter: new utils.EventEmitter(),
    _list: [],
    set: function (msg) {
      this._list.push(msg);
      this.eventEmitter.emit('msgChanged');
    },
    remove: function (msg) {
      var list = this._list;
      utils.forEach(list, function (child, index) {
        if (child.messageUId === msg.messageUId) {
          list.splice(index, 1);
        }
      }, { isReverse: true });
      this.eventEmitter.emit('msgChanged');
    },
    getLast: function () {
      var list = this._list, length = list.length;
      var msg = {};
      if (length) {
        msg = list[length - 1];
      }
      return msg;
    }
  };

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
    watcher = watcher || {};
    return utils.defered(function (resolve, reject) {
      var appkey = config.appkey;
      var token = config.token;
      config = utils.clearUndefKey(config);
      config = utils.copy(config);
      // config.cmpUrl = 'wsap-cn.ronghub.com';

      /*
        初始化
        文档: https://docs.rongcloud.cn/im/imlib/web/init/
       */
      config.isPolling && (config.connectionType = 'comet')
      config.logLevel = 0
      config.typingExpireTime = 5000
      config.checkCA = false
      RongIMClient.init(appkey, '', config);
      RongIMClient.setConnectionStatusListener({
        onChanged: function (status) {
          // 不处理的状态码
          var unHandleStatus = [];
          if (unHandleStatus.indexOf(status) === -1) {
            watcher.status(status);
          }
        }
      });
      RongIMClient.setOnReceiveMessageListener({
        onReceived: watcher.message
      });

      RongIMClient.setConversationStatusListener && RongIMClient.setConversationStatusListener({
        onChanged: watcher.conversationStatus
      });

      RongIMClient.setMessageExpansionListener && RongIMClient.setMessageExpansionListener({
        onUpdated: watcher.watchUpdatedExpansion,
        onDeleted: watcher.watchDeletedExpansion
      })

      RongIMClient.setTagListener && RongIMClient.setTagListener({
        onChanged: watcher.watchTagChange
      });

      RongIMClient.setPullOffLineFinished && RongIMClient.setPullOffLineFinished({
        onFinished: watcher.watchFinished
      });

      RongIMClient.setConversationTagListener && RongIMClient.setConversationTagListener({
        onChanged: watcher.watchConversationTagChange
      });

      RongIMClient.setTypingStatusListener && RongIMClient.setTypingStatusListener({
        onChanged: watcher.watchTypingChange
      })

      RongIMClient.setTypingStatusListener && RongIMClient.setTypingStatusListener({
        onChanged: watcher.watchTypingChange
      })

      /*
        链接
        文档: https://docs.rongcloud.cn/im/imlib/web/connect/
       */
      RongIMClient.connect(token, {
        onSuccess: function (userId) {
          selfUserId = userId;
          resolve(userId);
        },
        onTokenIncorrect: function () {
          reject('Token 错误');
        },
        onError: reject
      });
    });
  }

  /**
   * 断开链接
   * 文档: https://docs.rongcloud.cn/im/imlib/web/connect/#disconnect
   */
  function disconnect() {
    return utils.defered(function (resolve) {
      RongIMClient.getInstance().disconnect();
      resolve();
    });
  }

  function changeUser(config, watcher) {
    RongIMClient.getInstance().clearCache();
    RongIMClient.getInstance().logout();
    return init(config, watcher);
  }

  /**
   * 重新链接
   * 文档: https://docs.rongcloud.cn/im/imlib/web/connect/#reconnect
   */
  function reconnect(isAuto, url, rate) {
    rate = rate.split(',');
    utils.forEach(rate, function (rate, index) {
      rate[index] = Number(rate);
    });
    var config = {
      auto: isAuto,
      url: url,
      rate: rate
    };
    return utils.defered(function (resolve, reject) {
      var callback = {
        onSuccess: resolve,
        onTokenIncorrect: () => {
          reject('token incorrect')
        },
        onError: (err) => {
          reject('error:', err)
        } // 注: 此处因网络还不可用导致重连失败后, 可调用 reconnect(config) 继续重连
      };
      RongIMClient.reconnect(callback, config);
    });
  }

  /**
   * 获取会话列表
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/get-list/
   *
   * @param {number} count 获取会话的数量
   */
  function getConversationList(count, channelId) {
    // logger.reportLog(1, 'A-TEST-O', `getConversationList -> ${count}`)
    return utils.defered(function (resolve, reject) {
      const instance = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      instance.getConversationList({
        onSuccess: resolve,
        onError: reject
      }, null, count);
    });
  }

  /**
   * 删除会话列表
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/remove/
   */
  function removeConversation(conversationType, targetId, channelId) {
    conversationType = Number(conversationType);
    return utils.defered(function (resolve, reject) {
      const instance = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      instance.removeConversation(conversationType, targetId, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function getConversation(conversationType, targetId, channelId) {
    conversationType = Number(conversationType);
    return utils.defered(function (resolve, reject) {
      const instance = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      instance.getConversation(conversationType, targetId, {
        onSuccess: (data) => {
          if (data) {
            resolve(data)
          } else {
            resolve('会话不存在')
          }
        },
        onError: reject
      });
    });
  }

  /**
   * 获取历史消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-list/get-list/
   *
   * @param {number} timestrap 时间戳
   * @param {number} count 数量
   */
  function getHistoryMessages(timestrap, count, conversationType, targetId, channelId, order) {
    // logger.reportLog(1, 'A-TEST-O', `getHistoryMessages -> ${conversationType} ${targetId} ${timestrap} ${count}`)
    conversationType = Number(conversationType);
    return utils.defered(function (resolve, reject) {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      client.getHistoryMessages(conversationType, targetId, timestrap, count, {
        onSuccess: (data, hasMore) => {
          resolve({
            hasMore: hasMore,
            list: data
          })
        },
        onError: reject
      }, '', order);
    });
  }

  /**
   * 获取远端历史消息
  */
  function getRemoteHistoryMessages(conversationType, targetId, timestamp, count, channelId, order) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      client.getRemoteHistoryMessages(conversationType, targetId, timestamp, count, {
        onSuccess: (data, hasMore) => {
          resolve({
            hasMore: hasMore,
            list: data
          })
        },
        onError: reject
      }, '', order);
    })
  }

  /**
   * 按时间删除历史消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-list/remove-list/#_1
   *
   * @param {number} timestrap 时间戳
   */
  function clearHistoryMessages(timestamp, conversationType, targetId, channelId) {
    conversationType = Number(conversationType);
    var params = {
      conversationType: conversationType,
      targetId: targetId,
      timestamp: timestamp
    };

    const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
    return utils.defered(function (resolve, reject) {
      client.clearRemoteHistoryMessages(params, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  /**
   * 按消息删除历史消息
   * @param {string} messageUId 消息在 server 的唯一标识
   * @param {number} sentTime 消息发送时间
   * @param {number} messageDirection 消息方向
   */
  function deleteRemoteMessages(messageUId, sentTime, messageDirection, conversationType, targetId, channelId) {
    conversationType = Number(conversationType);
    if (!messageUId || !sentTime) {
      return utils.Defer.reject('请先发送消息, 再进行删除历史消息操作');
    }

    var deleteMsg = {
      messageUId: messageUId,
      sentTime: sentTime,
      messageDirection: messageDirection
    };
    var messages = [deleteMsg];
    const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
    return utils.defered(function (resolve, reject) {
      client.deleteRemoteMessages(conversationType, targetId, messages, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }


  /**
   * 获取指定会话未读数
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/unreadcount/#get-one
   *
   * @param {number} conversationType 会话类型
   * @param {string} targetId 目标 id (对方 id、群组 id、聊天室 id 等)
   */
  function getUnreadCount(conversationType, targetId, channelId) {
    conversationType = Number(conversationType);
    return utils.defered(function (resolve, reject) {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      client.getUnreadCount(conversationType, targetId, {
        onSuccess: (data) => {
          resolve(data.toString())
        },
        onError: reject
      });
    });
  }

  /**
   * 获取所有会话未读数
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/unreadcount/#get-all
   */
  function getTotalUnreadCount(conversationTypes, includeMuted, channelId) {
    console.log('getTotalUnreadCount---', conversationTypes, includeMuted, channelId)
    return utils.defered(function (resolve, reject) {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      // client.getTotalUnreadCount({
      //   onSuccess: (data) => {
      //     resolve(data.toString())
      //   },
      //   onError: reject
      // });
      client.getTotalUnreadCount({
        onSuccess: (data) => {
          resolve(data.toString())
        },
        onError: reject
      }, conversationTypes, includeMuted)
    });
  }

  /**
   * 清除指定会话未读数
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/unreadcount/#clear
   */
  function clearUnreadCount(conversationType, targetId, channelId) {
    conversationType = Number(conversationType);
    return utils.defered(function (resolve, reject) {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      client.clearUnreadCount(conversationType, targetId, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  /**
   * 清除全部会话未读数
   * 文档: https://docs.rongcloud.cn/im/imlib/web/conversation/unreadcount/#clear
   */
  function clearAllUnreadCount() {
    return utils.defered(function (resolve, reject) {
      const client = RongIMClient.getInstance()
      client.clearAllUnreadCount({
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function sendMessage(conversationType, targetId, msg, disableNotification, canIncludeExpansion, key, val, userIds, channelId, ...args) {
    conversationType = Number(conversationType);
    let expansion = {};
    !utils.isEmpty(key) && (key = key.split(','));
    !utils.isEmpty(val) && (val = val.split(','));
    !utils.isEmpty(key) && key.forEach((item, idx) => {
      expansion[item] = val[idx];
    })
    return utils.defered(function (resolve, reject) {
      let callbacks = {
        onSuccess: function (message) {
          CacheMsg.set(message);
          resolve(message);
        },
        onError: reject
      };
      let config = {
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
      };
      if (userIds) {
        config.userIds = userIds
      }
      // logger.reportLog(1, 'A-TEST-O', `sendmessage -> ${conversationType} ${targetId} ${JSON.stringify(msg)} ${JSON.stringify(config)}`)
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      setTimeout(function () { // 开发者忽略 setTimeout
        client.sendMessage(conversationType, targetId, msg, callbacks, null, null, null, null, config);
      }, sendMsgTimeout);
    });
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
   */
  function sendTextMessage(text, conversationType, targetId, disableNotification, canIncludeExpansion, key, val, userIds, channelId, ...args) {
    var content = {
      content: text, // 文本内容
      // user: {
      //   id: 'tst',
      //   name: 'lee',
      //   portraitUri: 'https://docs.rongcloud.cn/im/imlib/web/message-send/#text'
      // }
    };
    if (userIds) {
      userIds = userIds.split(',')
    }
    var msg = new RongIMLib.TextMessage(content);
    return sendMessage(conversationType, targetId, msg, disableNotification, canIncludeExpansion, key, val, userIds, channelId, ...args);
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
  function sendImageMessage(base64, imageUri, conversationType, targetId, disableNotification) {
    var content = {
      content: base64, // 压缩后的 base64 略缩图, 用来快速展示图片
      imageUri: imageUri // 上传到服务器的 url. 用来展示高清图片
    };
    var msg = new RongIMLib.ImageMessage(content);
    return sendMessage(conversationType, targetId, msg, disableNotification);
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
  function sendFileMessage(fileName, fileSize, fileType, fileUrl, conversationType, targetId, disableNotification) {
    var content = {
      name: fileName, // 文件名
      size: fileSize, // 文件大小
      type: fileType, // 文件类型
      fileUrl: fileUrl // 文件地址
    };
    var msg = new RongIMLib.FileMessage(content);
    return sendMessage(conversationType, targetId, msg, disableNotification);
  }

  /**
   * 高质量语音消息: https://docs.rongcloud.cn/im/introduction/message_structure/#hqvoice_message
   * 注意事项:
   *   融云不提供声音录制的方法. remoteUrl 的生成需开发者实现
   *
   * @param {string} remoteUrl 语音上传后的 url
   * @param {number} duration 语音时长
   */
  function sendVoiceMessage(remoteUrl, duration, conversationType, targetId, disableNotification) {
    var content = {
      remoteUrl: remoteUrl, // 音频 url, 建议格式: aac
      duration: duration // 音频时长
    };
    var msg = new RongIMLib.HQVoiceMessage(content);
    return sendMessage(conversationType, targetId, msg, disableNotification);
  }

  /**
   * 撤回消息: https://docs.rongcloud.cn/im/imlib/web/message-send/#recall
   * 注意事项:
   *   消息撤回操作服务器端没有撤回时间范围的限制，由客户端决定
   *
   * @param {string} messageUId 撤回的消息 Uid
   * @param {number} sentTime 撤回的消息 sentTime
   */
  function sendRecallMessage(messageUId, sentTime, conversationType, targetId, disableNotification, ...args) {
    if (!messageUId || !sentTime) {
      return utils.Defer.reject('请先发送消息, 再进行撤回操作');
    }
    var recallMessage = {
      messageUId: messageUId,
      sentTime: sentTime,
      senderUserId: selfUserId,
      conversationType: conversationType,
      targetId: targetId,
      content: {
        content: '消息内容',
        extra: '额外信息'
      }
    };

    var config = {
      disableNotification,
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
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().sendRecallMessage(recallMessage, callbacks, config);
    })
  }

  /**
   * 发送 @ 消息(此处以文本消息举例)
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#example
   *
   * @param {string} text 文字内容
   * @param {string} methiondId @ 对象的 id
   */
  function sendAtMessage(text, methiondId, conversationType, targetId, disableNotification) {
    conversationType = Number(conversationType);

    var isMentioned = true;

    var mentioneds = new RongIMLib.MentionedInfo();
    mentioneds.type = RongIMLib.MentionedType.PART;
    mentioneds.userIdList = [methiondId]; // @ 人 id 列表

    var content = {
      content: text,
      mentionedInfo: mentioneds
    };
    var msg = new RongIMLib.TextMessage(content);
    let config = {
      disableNotification: disableNotification
    };
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().sendMessage(conversationType, targetId, msg, {
        onSuccess: resolve,
        onError: reject
      }, isMentioned, null, null, null, config);
    });
  }

  /**
   * 注册自定义消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#custom
   *
   * @param {string} messageName 注册消息的 Web 端类型名
   * @param {string} objectName 注册消息的唯一名称. 注: 此名称需多端一致
   * @param {boolean} isCounted 是否计数
   * @param {boolean} isPersited 是否存储
   * @param {Array<string>} props 消息包含的字段集合
   */
  function registerMessage(messageName, objectName, isCounted, isPersited, props) {
    var mesasgeTag = new RongIMLib.MessageTag(isCounted, isPersited); //true true 保存且计数，false false 不保存不计数。
    props = props.split(','); // 将字符串截取为数组. 此处为 Demo 逻辑, 与融云无关
    RongIMClient.registerMessageType(messageName, objectName, mesasgeTag, props);
    return utils.Defer.resolve();
  }

  /**
   * 发送自定义消息
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#custom
   *
   * @param {string} messageType 注册消息的 Web 端类型名
   * @param {*} props 消息包含的字段集合
   */
  function sendRegisterMessage(messageType, props, conversationType, targetId, disableNotification) {
    // var content = props.split(',');
    let content;
    const reg = /^{|}$/g
    const regArr = /^\[|\]$/g
    if (regArr.test(props)) {
      content = props.replace(regArr, '')
      content = content.split(',')
    } else if (reg.test(props)) {
      let obj = {}
      let isoK = true
      content = props.replace(reg, '')
      content = content.split(',')
      content.forEach(item => {
        const newI = item.split(":")
        newI.length > 1 ? (obj[newI[0]] = newI[1]) : (isoK = false)
      })
      isoK ? (content = obj) : (content = props)
    } else {
      content = props
    }

    if (!RongIMClient.RegisterMessage[messageType]) {
      return Promise.reject('请先调用注册自定义消息接口')
    }
    var msg = new RongIMClient.RegisterMessage[messageType](content);
    return sendMessage(conversationType, targetId, msg, disableNotification);
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
  function sendLocationMessage(base64, latitude, longitude, poi, conversationType, targetId, disableNotification) {
    var msg = new RongIMLib.LocationMessage({
      latitude: latitude,
      longitude: longitude,
      poi: poi,
      content: base64
    });

    return sendMessage(conversationType, targetId, msg, disableNotification);
  }

  /**
   * 发送GIF消息
   * 文档: https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#StkMsg
   */
  function sendGIFMessage(conversationType, targetId, gifDataSize, remoteUrl, width, height, extra) {
    var msg = new RongIMLib.GIFMessage({
      gifDataSize,
      remoteUrl,
      width,
      height,
      extra,
    });
    return sendMessage(conversationType, targetId, msg);
  }

  /**
   * 发送小视频消息
   * 文档: https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#SightMsg
   */
  function sendSightMessage(conversationType, targetId, sightUrl, content, duration, size, name, extra) {
    var msg = new RongIMLib.SightMessage({
      sightUrl, content, duration, size, name, extra
    });
    return sendMessage(conversationType, targetId, msg);
  }

  /**
   * 发送合并转发消息
   * 文档: https://docs.rongcloud.cn/im/introduction/message_structure/#CombineMessage
   */
  function sendCombineMessage(conversationType, targetId, nameList, remoteUrl, summaryList, extra) {
    nameList = nameList.split(',');
    summaryList = summaryList.split(',');
    var msg = new RongIMLib.RCCombineMessage({
      conversationType, nameList, remoteUrl, summaryList, extra
    });
    return sendMessage(conversationType, targetId, msg);
  }

  /**
   * 发送typing消息
   * 文档: https://docs.rongcloud.cn/im/introduction/message_structure/#CombineMessage
   */
  function sendTypingMessage(conversationType, targetId, channelId, typingType) {
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      client.sendTypingStatusMessage(conversationType, targetId, typingType, callbacks);
    })
  }

  /**
   * 发送多端同步未读数
   * 文档: https://docs.rongcloud.cn/im/introduction/message_structure/#CombineMessage
   */
  function sendSyncReadStatusMessage(conversationType, targetId, channelId, timestamp) {
    var msg = new RongIMLib.SyncReadStatusMessage({
      lastMessageSendTime: timestamp
    })
    return sendMessage(conversationType, targetId, msg, false, null, null, null, null, channelId)
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
  function sendRichContentMessage(title, content, imageUri, url, conversationType, targetId, disableNotification) {
    var msg = new RongIMLib.RichContentMessage({
      title: title,
      content: content,
      imageUri: imageUri,
      url: url
    });

    return sendMessage(conversationType, targetId, msg, disableNotification);
  }

  /**
   * 发送正在输入状态消息
   * @param {number} conversationType
   * @param {string} targetId
   * @param {string} data
   * @param {string} typingContentType
  */

  function sendTypingStatusMessage(conversationType, targetId, typingContentType, data, disableNotification) {
    var msg = new RongIMLib.TypingStatusMessage({ typingContentType: typingContentType, data: data });
    return sendMessage(conversationType, targetId, msg, disableNotification);
  }

  /**
   * 发送引用消息
   * 文档: https://docs.rongcloud.cn/im/introduction/message_structure/#CombineMessage
   */
  function sendReferenceMessage(referenceContent, referMsgUserId, referenceMsgType, content, conversationType, targetId, channelId) {
    var msg = new RongIMLib.ReferenceMessage({
      content,
      referMsgUserId,
      referMsg: {
        content: referenceContent
      }
    })
    return sendMessage(conversationType, targetId, msg, false, null, null, null, null, channelId)
  }

  function sendReceiptRequestMessage(conversationType, targetId, messageUId) {
    var msg = new RongIMLib.ReadReceiptRequestMessage({
      messageUId: messageUId
    });
    var conversationType = conversationType;
    return sendMessage(conversationType, targetId, msg, false);
  }

  /**
   * 发送群回执请求消息
  */
  function sendReadReceiptRequestMessage(conversationType, targetId, messageUId) {
    var msg = new RongIMLib.ReadReceiptRequestMessage({
      // messageUId 为消息的唯一标识，通过 message.messageUId 可取到
      messageUId: messageUId
    });
    return sendMessage(conversationType, targetId, msg)
  }

  /**
   * 发送群回执响应消息
  */
  function sendReadReceiptResponseMessage(conversationType, targetId, messageUId, requestUserId) {
    var msg = new RongIMLib.ReadReceiptResponseMessage({
      receiptMessageDic: {
        // userId01 为具体的用户 Id， messageUId 为 ReadReceiptRequestMessage 消息中的 messageUId
        [requestUserId]: [messageUId]
      }
    });
    return sendMessage(conversationType, targetId, msg)
  }

  /**
  * 发送群回执响应消息（新）
 */
  function sendNewReadReceiptResponseMessage(targetId, messageUId, channelId) {
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      messageUId = messageUId.split(',')
      client.sendReadReceiptMessage(messageUId, targetId, callbacks);
    })
  }

  // 获取已读列表
  function getMessageReader(targetId, messageUid, channelId) {
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      client.getMessageReader(messageUid, targetId, callbacks)
    })
  }

  /**
   * 加入聊天室
   * 文档: https://docs.rongcloud.cn/im/imlib/web/chatroom/#join
   *
   * @param {string} chatRoomId 聊天室 id
   * @param {number} count 拉取消息数量
   */
  function joinChatRoom(chatRoomId, count) {
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().joinChatRoom(chatRoomId, count, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  /**
   * 退出聊天室
   * 文档: https://docs.rongcloud.cn/im/imlib/web/chatroom/#quit
   *
   * @param {string} chatRoomId 聊天室 id
   */
  function quitChatRoom(chatRoomId) {
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().quitChatRoom(chatRoomId, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  /**
   * 获取聊天室历史消息
   * 文档: https://docs.rongcloud.cn/v2/views/im/noui/guide/chatroom/msgmanage/storage/web.html
  */
  function getChatRoomHistoryMessages(chatRoomId, count, order) {
    return new Promise((resolve, reject) => {
      RongIMClient.getInstance().getChatRoomHistoryMessages(chatRoomId, count, order, {
        onSuccess: function (list, hasMore) {
          resolve({
            list: list,
            hasMore: hasMore
          })
        },
        onError: function (error) {
          // 请检查: 是否开通聊天室消息云存储服务
          reject(error)
        }
      });
    })
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
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().getChatRoomInfo(chatRoomId, count, order, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  /**
   * 发送聊天室消息(以文本消息为例)
   * 文档: https://docs.rongcloud.cn/im/imlib/web/message-send/#text
   *
   * @param {string} text 文字内容
   */
  function sendChatroomMessage(text, conversationType, targetId) {
    var content = {
      content: text // 文本内容
    };
    var msg = new RongIMLib.TextMessage(content);
    return sendMessage(conversationType, targetId, msg);
  }

  function setChatroomEntry(key, value, isAutoDelete, isSendNotification, extra, chatRoomId) {
    var entry = {
      key: key,
      value: value,
      notificationExtra: extra,
      isAutoDelete: isAutoDelete,
      isSendNotification: isSendNotification
    };
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().setChatroomEntry(chatRoomId, entry, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function forceSetChatroomEntry(key, value, isAutoDelete, isSendNotification, extra, chatRoomId) {
    var entry = {
      key: key,
      value: value,
      notificationExtra: extra,
      isAutoDelete: isAutoDelete,
      isSendNotification: isSendNotification
    };
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().forceSetChatroomEntry(chatRoomId, entry, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function removeChatroomEntry(key, isSendNotification, extra, chatRoomId) {
    var entry = {
      key: key,
      notificationExtra: extra,
      isSendNotification: isSendNotification
    };
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().removeChatroomEntry(chatRoomId, entry, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function forceRemoveChatroomEntry(key, isSendNotification, extra, chatRoomId) {
    var entry = {
      key: key,
      notificationExtra: extra,
      isSendNotification: isSendNotification
    };
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().forceRemoveChatroomEntry(chatRoomId, entry, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function getChatroomEntry(key, chatRoomId) {
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().getChatroomEntry(chatRoomId, key, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function getAllChatroomEntries(chatRoomId) {
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().getAllChatroomEntries(chatRoomId, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function setConversationStatus(notificationStatus, isTop, conversationType, targetId, channelId) {
    return utils.defered(function (resolve, reject) {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      client.setConversationStatus(conversationType, targetId, {
        notificationStatus: notificationStatus,
        isTop: isTop
      }, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function updateMessageExpansion(conversationType, targetId, messageUId, keys, values, canIncludeExpansion, isTest) {

    return utils.defered(function (resolve, reject) {
      if (utils.isEmpty(keys)) {
        reject('keys 值不能为空')
      }
      let expansion = {};
      keys && (keys = keys.split(','));
      values && (values = values.split(','));
      if (keys.length !== values.length) {
        reject('key value 应成对设置')
      }
      keys.forEach((item, idx) => {
        expansion[item] = values[idx];
      })
      let message;
      if (isTest) {
        message = {
          canIncludeExpansion,
          messageUId,
          conversationType,
          targetId
        }
      } else {
        message = CacheMsg.getLast();
        if (utils.isEmpty(message)) {
          reject('请先发送一条消息');
        }
      }
      RongIMClient.getInstance().updateMessageExpansion(expansion, message, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function removeMessageExpansion(conversationType, targetId, keys, messageUId, canIncludeExpansion, isTest) {
    return utils.defered(function (resolve, reject) {
      keys && (keys = keys.split(','));
      let message = CacheMsg.getLast();
      if (isTest) {
        message = {
          canIncludeExpansion,
          messageUId,
          conversationType,
          targetId
        }
      } else {
        message = CacheMsg.getLast();
        if (utils.isEmpty(message)) {
          reject('请先发送一条消息');
        }
      }
      RongIMClient.getInstance().removeMessageExpansionForKey(keys, message, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function removeMessageAllExpansion(conversationType, targetId, messageUId) {
    return utils.defered(function (resolve, reject) {
      let message = {
        canIncludeExpansion,
        messageUId,
        targetId,
        messageUId
      }
      RongIMClient.getInstance().removeMessageAllExpansion(message, {
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  /**
   * 设置会话草稿
  */
  function setDraft(conversationType, targetId, draft, channelId) {
    const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
    conversationType = Number(conversationType);
    client.saveTextMessageDraft(conversationType, targetId, draft)
    return Promise.resolve()
  }

  /**
   * 获取会话草稿
  */
  function getDraft(conversationType, targetId, channelId) {
    const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
    conversationType = Number(conversationType);
    const draft = client.getTextMessageDraft(conversationType, targetId)
    return Promise.resolve(draft)
  }

  /**
   * 删除会话草稿
  */
  function deleteDraft(conversationType, targetId, channelId) {
    const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
    conversationType = Number(conversationType);
    client.clearTextMessageDraft(conversationType, targetId)
    return Promise.resolve()
  }

  function getLastCacheMsgUId() {
    return CacheMsg.getLast().messageUId;
  }
  function getLastCacheMsgSentTime() {
    return CacheMsg.getLast().sentTime;
  }
  function getLastCacheMsgDirection() {
    return CacheMsg.getLast().messageDirection;
  }

  function sendReceiptResponse(conversationType, targetId) {
    return utils.defered(function (resolve, reject) {
      RongIMClient.getInstance().sendReceiptResponse(conversationType, targetId, {
        onSuccess: resolve,
        onError: reject
      })
    })
  }

  function getConversationUnreadCount(conversationTypes) {
    conversationTypes = conversationTypes || '1'
    const targetTypes = conversationTypes.split(',')
    return new Promise((resolve, reject) => {
      // 1、调用 `getConversationList` 方法获取所有会话
      var count = 1000;
      var callback = {
        onSuccess: function (list) {
          console.log('获取会话列表成功', list);
          // 2、根据返回的会话列表中 `conversationType` 方法字段筛选出目标会话
          const targetSessions = list.filter(item => {
            return targetTypes.indexOf(item.conversationType.toString()) > -1
          })
          // 3、根据筛选出的会话计算未读数
          let targetUnreadCount = 0
          targetSessions.forEach(item => {
            targetUnreadCount += item.unreadMessageCount
          })
          resolve(targetUnreadCount)
        },
        onError: reject
      }
      RongIMClient.getInstance().getConversationList(callback, null, count);
    })
  }

  function clearConversations(conversationTypes) {
    conversationTypes = conversationTypes || '1'
    const targetTypes = conversationTypes.split(',')
    return new Promise((resolve, reject) => {
      // 1、调用 `getConversationList` 方法获取所有会话
      var count = 1000;
      var callback = {
        onSuccess: function (list) {
          console.log('获取会话列表成功', list);
          // 2、根据返回的会话列表中 `conversationType` 方法字段筛选出目标会话
          const targetSessions = list.filter(item => {
            return targetTypes.indexOf(item.conversationType.toString()) > -1;
          })
          // 3、循环调用 `removeConversation` 方法删除会话
          const targetUnreadCount = 0
          targetSessions.forEach(session => {
            RongIMClient.getInstance().removeConversation(session.conversationType, session.targetId, { onSuccess: function () { }, onError: function () { } });
          })
          resolve()
        },
        onError: reject
      }
      RongIMClient.getInstance().getConversationList(callback, null, count);
    })
  }

  /**
   * @deprecated 已废弃
   */
  function clearTotalUnreadCount() {
    return new Promise((resolve, reject) => {
      // 1、调用 `getConversationList` 方法获取所有会话
      var count = 1000;
      var callback = {
        onSuccess: function (list) {
          console.log('获取会话列表成功', list);
          // 2、循环调用 `clearUnreadCount` 方法清除未读数
          list.forEach(conver => {
            RongIMClient.getInstance().clearUnreadCount(conver.conversationType, conver.targetId, { onSuccess: function () { }, onError: function () { } })
          })
        },
        onError: reject
      }
      RongIMClient.getInstance().getConversationList(callback, null, count);
    })
  }

  /**
   * 创建标签
   */
  function createTag(tagId, tagName) {
    var tag = {
      tagId,
      tagName
    };

    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().createTag(tag, callbacks);
    })
  }

  /**
   * 修改标签
   */
  function updateTag(tagId, tagName) {
    var tag = {
      tagId,
      tagName
    };

    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().updateTag(tag, callbacks);
    })
  }

  /**
   * 删除标签
   */
  function removeTag(tagId) {
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().removeTag(tagId, callbacks);
    })
  }

  /**
   * 获取标签列表
   */
  function getTagList() {
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().getTagList(callbacks);
    })
  }

  /**
   * 添加会话到指定标签
   */
  function addTagForConversations(tagId, targetId, type, channelId, multiConversation) {
    var conList = multiConversation.trim() ? JSON.parse(multiConversation) : [{
      targetId,
      type,
      channelId
    }];

    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().addTagForConversations(tagId, conList, callbacks);
    })
  }

  /**
   * 从多个会话中批量删除指定标签
   */
  function removeTagForConversations(tagId, targetId, type, channelId, multiConversation) {
    var conList = multiConversation.trim() ? JSON.parse(multiConversation) : [{
      targetId,
      type,
      channelId
    }];

    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().removeTagForConversations(tagId, conList, callbacks);
    })
  }

  /**
   * 从单一会话中批量删除标签
   */
  function removeTagsForConversation(tagId, targetId, type, channelId) {
    var con = {
      targetId,
      type,
      channelId
    };
    var _tagId = tagId.split(',')
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().removeTagsForConversation(con, _tagId, callbacks);
    })
  }

  /**
   * 分页获取标签下会话列表
   */
  function getConversationListByTag(tagId, count, startTime) {
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().getConversationListByTag(tagId, count, startTime, callbacks);
    })
  }

  /**
   * 根据标签获取未读消息数
   */
  function getUnreadCountByTag(tagId, containMuted) {
    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: (data) => { resolve(data.toString()) },
        onError: reject
      }
      RongIMClient.getInstance().getUnreadCountByTag(tagId, containMuted, callbacks);
    })
  }

  /**
   * 设置标签中会话置顶
   */
  function setConversationStatusInTag(tagId, targetId, type, channelId, isTop) {
    var con = {
      targetId,
      type,
      channelId
    };

    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().setConversationStatusInTag(tagId, con, { isTop }, callbacks);
    })
  }

  /**
   * 获取会话下的标签
   */
  function getTagsForConversation(targetId, type, channelId) {
    var con = {
      targetId,
      type,
      channelId: channelId || ''
    };

    return utils.defered(function (resolve, reject) {
      var callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().getTagsForConversation(con, callbacks);
    })
  }

  /**
   * =========== 协议栈独有接口 ============
  */
  /**
   * 向本地插入消息
  */
  function insertMessage(conversationType, targetId, senderUserId, objectName, content, direction, channelId) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const msg = {
        senderUserId,
        objectName,
        content: {
          content
        },
        messageDirection: direction,
        channelId
      }
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      client.insertMessage(conversationType, targetId, msg, callbacks)
    })
  }
  /**
   * 获取本地消息
  */
  function getMessage(messageId) {
    return new Promise((resolve, reject) => {
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      RongIMClient.getInstance().getMessage(messageId, callbacks)
    })
  }

  /**
   * 获取会话下所有未读的 @ 消息
  */
  function getUnreadMentionedMessage(conversationType, targetId, channelId) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const msg = client.getUnreadMentionedMessages(conversationType, targetId)
      resolve(msg)
    })
  }

  /**
   * 按内容搜索会话内的消息
  */
  function searchMessageByContent(conversationType, targetId, keyword, timestamp, count, channelId) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const callbacks = {
        onSuccess: (data, matchedCount) => {
          resolve(data)
          console.log('searchMessageByContent', matchedCount)
        },
        onError: reject
      }
      client.searchMessageByContent(conversationType, targetId, keyword, timestamp, count, 1, callbacks)
    })
  }

  /**
   * 通过时间戳删除删除本地消息
  */
  function deleteLocalMessagesByTimestamp(conversationType, targetId, timestamp, channelId) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      client.deleteLocalMessagesByTimestamp(conversationType, targetId, timestamp, false, callbacks)
    })
  }

  /**
   * 清空会话下本地历史消息
  */
  function clearMessages(conversationType, targetId, channelId) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      client.clearMessages(conversationType, targetId, callbacks)
    })
  }

  /**
   * 通过关键字搜索会话
  */
  function searchConversationByContent(keyword, converTypes, customMessageTypes, channelId) {
    return new Promise((resolve, reject) => {
      let types;
      let msgTypes;
      if (!utils.isEmpty(converTypes)) {
        types = converTypes.split(',')
      }
      if (!utils.isEmpty(customMessageTypes)) {
        msgTypes = customMessageTypes.split(',')
      }
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      client.searchConversationByContent(keyword, callbacks, types, msgTypes)
    })
  }

  /**
   * 通过会话类型删除会话
  */
  function clearConversations(converTypes, channelId) {
    return new Promise((resolve, reject) => {
      let types
      if (!utils.isEmpty(converTypes)) {
        types = converTypes.split(',')
      }
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      client.clearConversations(callbacks, types)
    })
  }

  /**
   * 删除时间戳前的未读消息数量
  */
  function clearUnreadCountByTimestamp(conversationType, targetId, timestamp, channelId) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      client.clearUnreadCountByTimestamp(conversationType, targetId, timestamp, callbacks)
    })
  }

  /**
   * 获取会话免打扰状态
  */
  function getConversationNotificationStatus(conversationType, targetId, channelId) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      client.getConversationNotificationStatus(conversationType, targetId, callbacks)
    })
  }

  function getFirstUnreadMessage(conversationType, targetId, channelId) {
    return new Promise((resolve, reject) => {
      const client = channelId ? RongIMClient.getInstance().getChannel(channelId) : RongIMClient.getInstance()
      const callbacks = {
        onSuccess: resolve,
        onError: reject
      }
      client.getFirstUnreadMessage(conversationType, targetId, callbacks)
    })
  }

  /**
   * 获取服务器时间
   */
  function getServerTime  () {
    return Promise.resolve(RongIMClient.getInstance().getServerTime())
  }

  win.RongIM = win.RongIM || {};
  win.RongIM.Service = {
    init: init,
    disconnect: disconnect,
    reconnect: reconnect,
    getServerTime,

    registerMessage: registerMessage,
    sendRegisterMessage: sendRegisterMessage,

    getConversationList: getConversationList,
    removeConversation: removeConversation,
    getConversation: getConversation,

    getRemoteHistoryMessages: getRemoteHistoryMessages,
    getHistoryMessages: getHistoryMessages,
    clearHistoryMessages: clearHistoryMessages,
    deleteRemoteMessages: deleteRemoteMessages,

    sendTextMessage: sendTextMessage,
    sendImageMessage: sendImageMessage,
    sendFileMessage: sendFileMessage,
    sendVoiceMessage: sendVoiceMessage,
    sendAtMessage: sendAtMessage,
    sendLocationMessage: sendLocationMessage,
    sendRichContentMessage: sendRichContentMessage,
    sendRecallMessage: sendRecallMessage,
    sendTypingStatusMessage: sendTypingStatusMessage,
    sendReceiptRequestMessage: sendReceiptRequestMessage,
    sendGIFMessage: sendGIFMessage,
    sendSightMessage: sendSightMessage,
    sendCombineMessage: sendCombineMessage,
    sendReadReceiptRequestMessage: sendReadReceiptRequestMessage,
    sendReadReceiptResponseMessage: sendReadReceiptResponseMessage,
    getMessageReader: getMessageReader,
    sendNewReadReceiptResponseMessage: sendNewReadReceiptResponseMessage,
    sendTypingMessage: sendTypingMessage,
    sendSyncReadStatusMessage: sendSyncReadStatusMessage,
    sendReferenceMessage: sendReferenceMessage,

    getUnreadCount: getUnreadCount,
    getTotalUnreadCount: getTotalUnreadCount,
    clearUnreadCount: clearUnreadCount,
    clearAllUnreadCount,
    getConversationUnreadCount,
    clearConversations,
    clearTotalUnreadCount,
    getFirstUnreadMessage,

    joinChatRoom: joinChatRoom,
    quitChatRoom: quitChatRoom,
    getChatRoomInfo: getChatRoomInfo,
    sendChatroomMessage: sendChatroomMessage,
    setChatroomEntry: setChatroomEntry,
    forceSetChatroomEntry: forceSetChatroomEntry,
    removeChatroomEntry: removeChatroomEntry,
    forceRemoveChatroomEntry: forceRemoveChatroomEntry,
    getChatroomEntry: getChatroomEntry,
    getAllChatroomEntries: getAllChatroomEntries,

    getLastCacheMsgSentTime: getLastCacheMsgSentTime,
    getLastCacheMsgUId: getLastCacheMsgUId,
    getLastCacheMsgDirection: getLastCacheMsgDirection,
    setConversationStatus: setConversationStatus,
    msgEmitter: CacheMsg.eventEmitter,

    changeUser: changeUser,
    updateMessageExpansion,
    removeMessageExpansion,
    removeMessageAllExpansion,
    getChatRoomHistoryMessages,
    setDraft,
    getDraft,
    deleteDraft,
    sendReceiptResponse,
    // 标签相关
    createTag,
    updateTag,
    removeTag,
    getTagList,
    addTagForConversations,
    removeTagForConversations,
    removeTagsForConversation,
    getConversationListByTag,
    getUnreadCountByTag,
    setConversationStatusInTag,
    getTagsForConversation,

    // 协议栈独有接口
    insertMessage,
    getMessage,
    getUnreadMentionedMessage,
    searchMessageByContent,
    deleteLocalMessagesByTimestamp,
    clearMessages,
    searchConversationByContent,
    clearConversations,
    clearUnreadCountByTimestamp,
    getConversationNotificationStatus,
  };

})(window);