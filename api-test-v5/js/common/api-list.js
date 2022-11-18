(function (win, dependencies) {
  var RongIM = dependencies.RongIM
  var utils = RongIM.Utils
  var Service = RongIM.Service
  var config = RongIM.config.im
  var urlQueryConfig = utils.getUrlQuery()

  var MiniUnSupportEventList = [
    'sendRecallMessage', 'deleteRemoteMessages', 'clearRemoteHistoryMessages'
  ]

  var getServerTime = {
    name: '获取服务器时间',
    event: Service.getServerTime,
    eventName: 'getServerTime',
    desc: '获取服务器时间',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/connection/disconnect/web3.html',
    params: []
  }

  var disconnect = {
    name: '断开链接',
    event: Service.disconnect,
    eventName: 'disconnect',
    desc: '断开链接',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/connection/disconnect/web3.html',
    params: []
  }

  var reconnect = {
    name: '重新链接',
    event: Service.reconnect,
    eventName: 'reconnect',
    desc: '重新链接',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/connection/reconnect/web3.html',
    params: [
      { name: 'token', type: 'string', value: '自定义token' },
      // { name: '嗅探 url', type: 'string', value: 'https://cdn.ronghub.com/RongIMLib-2.2.6.min.js?d=' + Date.now() },
      // { name: '嗅探频率', type: 'string', value: '100,1000,3000,3000,3000' }
    ]
  }

  var getConnectionStatus = {
    name: '获取链接状态',
    event: Service.getConnectionStatus,
    eventName: 'getConnectionStatus',
    desc: '获取链接状态',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/connection/disconnect/web3.html#logout'
  }

  var registerMessage = {
    name: '注册自定义消息',
    event: Service.registerMessage,
    eventName: 'registerMessageType',
    desc: '注册自定义消息',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/message-send/#custom-register',
    params: [
      { name: 'messageType', type: 'string', value: 's:person' },
      { name: '是否存储', type: 'boolean', value: true },
      { name: '是否计数', type: 'boolean', value: true },
      { name: '属性', type: 'string', value: 'name,age' }
    ]
  }

  var sendRegisterMessage = {
    name: '发送自定义消息',
    event: Service.sendRegisterMessage,
    eventName: 'sendMessage',
    desc: '发送自定义消息(RegisterMessage)',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/message-send/#custom-send',
    params: [
      { name: '消息类型', type: 'string', value: 's:person' },
      { name: '属性值', type: 'string', value: 'name,age' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  }

  var getConversationList = {
    name: '获取会话列表',
    event: Service.getConversationList,
    eventName: 'getConversationList',
    desc: '获取会话列表',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/getall/web3.html',
    params: [
      { name: '数量', type: 'number', value: 1000 },
      { name: '时间戳', type: 'number', value: 0 },
      { name: '时间戳前/后', type: 'number', value: 0 },
      { name: '拉远端', type: 'boolean', value: true }
    ]
  }

  var removeConversation = {
    name: '删除会话列表',
    event: Service.removeConversation,
    eventName: 'removeConversation',
    desc: '删除会话列表',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/clear/web3.html',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getHistoryMessages = {
    name: '获取历史消息',
    event: Service.getHistoryMessages,
    eventName: 'getHistoryMessages',
    desc: '获取历史消息, 排序参数 0为升序，1为降序',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/storage/web3.html',
    params: [
      { name: '时间戳', type: 'number', value: 0 },
      { name: '数量', type: 'number', value: 20 },
      { name: '排序', type: 'number', value: 1 },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }
  var getRemoteHistoryMessages = {
    name: '获取远程历史消息（pc）',
    event: Service.getRemoteHistoryMessages,
    eventName: 'getRemoteHistoryMessages',
    desc: '获取远程历史消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/storage/web3.html',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '时间戳', type: 'number', value: 0 },
      { name: '数量', type: 'number', value: 20 },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getFirstUnreadMessage = {
    name: '获取第一个未读消息（pc）',
    event: Service.getFirstUnreadMessage,
    eventName: 'getFirstUnreadMessage',
    desc: '获取第一个未读消息（cpp专属）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '会话类型', type: 'number', value: '1' },
      { name: '会话id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var setConversationStatus = {
    name: '设置会话状态',
    event: Service.setConversationStatus,
    eventName: 'setConversationStatus',
    desc: '设置会话状态',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web3.html',
    params: [
      { name: '免打扰', type: 'number', value: 1 },
      { name: '置顶', type: 'boolean', value: true },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var setConversationNotificationStatus = {
    name: '设置会话通知免打扰状态（旧）',
    event: Service.setConversationNotificationStatus,
    eventName: 'setConversationNotificationStatus',
    desc: '设置会话通知免打扰状态（旧）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web3.html',
    params: [
      { name: '免打扰', type: 'number', value: 1 },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }
  var setConversationNotificationLevel = {
    name: '设置会话通知免打扰状态（新）',
    event: Service.setConversationNotificationLevel,
    eventName: 'setConversationNotificationLevel',
    desc: '设置会话通知免打扰状态（新）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web3.html',
    params: [
      { name: '免打扰', type: 'number', value: 5 },
      { name: '会话类型', type: 'number', value: 10 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getBlockedConversationList = {
    name: '获取免打扰会话列表（仅web）',
    event: Service.getBlockedConversationList,
    eventName: 'getBlockedConversationList',
    desc: '获取免打扰会话列表',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web3.html',
    params: []
  }

  var setConversationToTop = {
    name: '设置会话置顶状态',
    event: Service.setConversationToTop,
    eventName: 'setConversationToTop',
    desc: '设置会话置顶状态',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web3.html',
    params: [
      { name: '置顶', type: 'boolean', value: true },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getTopConversationList = {
    name: '获取置顶会话列表(仅web)',
    event: Service.getTopConversationList,
    eventName: 'getTopConversationList',
    desc: '获取置顶会话列表',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web3.html',
    params: []
  }

  var deleteRemoteMessages = {
    name: '删除历史消息(按消息)',
    event: Service.deleteRemoteMessages,
    eventName: 'deleteRemoteMessages',
    desc: '按消息删除指定历史消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/delete/web3.html#deletebyid',
    params: [
      { name: '消息 Uid', type: 'string', value: '', event: Service.getLastCacheMsgUId },
      { name: '发送时间', type: 'number', value: 0, event: Service.getLastCacheMsgSentTime },
      { name: '消息方向', type: 'number', value: 1, event: Service.getLastCacheMsgDirection },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var clearHistoryMessages = {
    name: '删除历史消息(按时间)',
    event: Service.clearHistoryMessages,
    eventName: 'clearRemoteHistoryMessages',
    desc: '按时间删除历史消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/delete/web3.html#deletebyid',
    params: [
      { name: '删除时间戳', type: 'number', value: Date.now() },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var sendTextMessage = {
    name: '发送文字消息',
    event: Service.sendTextMessage,
    eventName: 'sendMessage',
    desc: '发送文字消息(TextMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web3.html#TxtMsg',
    params: [
      { name: '文字内容', type: 'string', value: '我是一条文字消息' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false },
      { name: '消息扩展', type: 'boolean', value: true },
      { name: '消息扩展 key,多个以","隔开', type: 'string', value: 'aa' },
      { name: '消息扩展 value,多个以","隔开', type: 'string', value: '11' },
      { name: '定向用户 Ids', type: 'string', value: '' },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '推送标题', type: 'string', value: '推送标题' },
      { name: '推送内容', type: 'string', value: '推送内容' },
      { name: '推送附加信息', type: 'string', value: '推送附加信息' },
      { name: 'iOS 禁用推送标题', type: 'boolean', value: false },
      { name: '是否强制推送', type: 'boolean', value: false },
      { name: 'iOS 通知分组 ID', type: 'string', value: 'threadId' },
      { name: 'iOS 通知覆盖 ID', type: 'string', value: 'apnsCollapseId' },
      { name: 'iOS 通知类型', type: 'string', value: 'RC:TxtMsg' },
      { name: 'iOS 通知richMediaUri', type: 'string', value: 'richMediaUri' },
      { name: 'Android 通知 ID', type: 'string', value: '' },
      { name: '小米 ChannelId', type: 'string', value: 'channelIdMi' },
      { name: '华为 ChannelId', type: 'string', value: 'channelIdHW' },
      { name: 'OPPO ChannelId', type: 'string', value: 'channelIdOPPO' },
      { name: 'VIVO 类型', type: 'string', value: 'typeVivo' },
      { name: 'FCM 通知分组 ID', type: 'string', value: 'collapse_key' },
      { name: 'FCM imageUrl', type: 'string', value: 'imageUrl' },
      { name: '推送模板id', type: 'string', value: 'templateId' }
    ]
  }

  var sendImageMessage = {
    name: '发送图片消息',
    event: Service.sendImageMessage,
    eventName: 'sendMessage',
    desc: '发送图片消息(ImageMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web3.html#ImgTextMsg',
    params: [
      { name: '缩略图', type: 'string', value: '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oIqCtEXZdtphdSJsrH4QTjLqhtKCtdMhkt5rQxoa3QCgQWREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQQdQtK0ywtklbJG5+VXVc0DT1K3TqFpTtvA2z4Do2WfDSrhU13UqVe7HQvsgfA1zWOOKjnYjnnrUrbWGzdbpf6jDjrXu6D0/DT8FmSeiehERVRERAREQEREBERAREQEREBERAREQEREBERAREQEREEEE6GiijtxwpPgtG02W2yzSGK2GONwoG0zbpmDz+SDdo7ccJR244URtc2Noe7E4DN1KVVkEUduOEo7ccKUQRR244SjtxwpRBFHbjhKO3HClEEUduOEo7ccKUQRR244SjtxwpRBFHbjhKO3HClEEUduOEo7ccKUQRR244SjtxwpRBFHbjhKO3HClEEUduOEo7ccKUQRR244SjtxwpRBFHbjhKO3HClEEUduOEo7ccKUQD4Ii07VLbmOlFngY8BowEnU8oNxF8ya0XuC8RWSI4Wijia4jlWgqNM9f87mKfrMBADKd70OWn5oM6LFG6Qvo4CnzWVAREQEREBERAREQEREBERAREQEREBERAREQEREBERAOoUoiAiIgIiIC+VaLymiksrWtjImjxuqDkaeGaIgXfeU1qbZS9sY6wcXYQcqGmWazR22R0sTS1lHuAOR/gr+qIg30REBERAREQEREBERAREQEREBERAREQEREH//Z' },
      { name: '原图 url', type: 'string', value: 'https://nfsprodrcx.cn.ronghub.com/v3/BGSPKH501EG0K6MI/base64.png?token=Um9uZ2Nsb3VkMTQyMDIwMDMxNzAzMzk1OTM2MDBtZXNzYWdlOzs7MjczMTk5NDg4OA==' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  }

  var sendGIFMessage = {
    name: '发送 GIF 消息',
    event: Service.sendGIFMessage,
    eventName: 'sendGIFMessage',
    desc: '发送GIF消息(sendGIFMessage)',
    doc: 'http://doc.rongcloud.cn/im/Web/2.X/guide/private/msgmanage/msgsend/web#StkMsg',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: 'gifDataSize', type: 'number', value: '66406' },
      { name: 'remoteUrl', type: 'string', value: 'https://rongcloud-image.cn.ronghub.com/image%2Fjpeg__RC-2020-08-27_8691_1598525784771?e=1614077785&token=livk5rb3__JZjCtEiMxXpQ8QscLxbNLehwhHySnX:NOCwaCQVKsI4FDyOiSIqZ4JCc00=' },
      { name: 'width', type: 'number', value: '293' },
      { name: 'height', type: 'number', value: '220' },
      { name: '扩展内容', type: 'string', value: '这是扩展内容' }
    ]
  }

  var sendFileMessage = {
    name: '发送文件消息',
    event: Service.sendFileMessage,
    eventName: 'sendMessage',
    desc: '发送文件消息(FileMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web3.html#FileMsg',
    params: [
      { name: '文件名', type: 'string', value: 'logo_wx' },
      { name: '文件大小', type: 'number', value: 20000 },
      { name: '文件类型', type: 'string', value: 'png' },
      { name: '文件 url', type: 'string', value: 'http://rongcloud.cn/images/newVersion/log_wx.png' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  }

  var sendVoiceMessage = {
    name: '发送语音消息',
    event: Service.sendVoiceMessage,
    eventName: 'sendMessage',
    desc: '发送语音消息(HQVoiceMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web3.html#HQVCMsg',
    params: [
      { name: '语音 url', type: 'string', value: 'https://rongcloud-audio.cn.ronghub.com/audio_amr__RC-2020-03-17_42_1584413950049.aac?e=1599965952&token=CddrKW5AbOMQaDRwc3ReDNvo3-sL_SO1fSUBKV3H:CDngyWj7ZApNmAfoecng7L_3SaU=' },
      { name: '语音类型', type: 'string', value: 'aac' },
      { name: '语音时长', type: 'number', value: 6 },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  }

  var sendRecallMessage = {
    name: '发送撤回消息',
    event: Service.sendRecallMessage,
    eventName: 'sendRecallMessage',
    desc: '发送撤回消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgrecall/web3.html',
    params: [
      { name: '消息 Uid', type: 'string', value: '', event: Service.getLastCacheMsgUId },
      { name: '发送时间', type: 'number', value: 0, event: Service.getLastCacheMsgSentTime },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false },
      { name: '推送标题', type: 'string', value: '推送标题' },
      { name: '推送内容', type: 'string', value: '推送内容' },
      { name: '推送附加信息', type: 'string', value: '推送附加信息' },
      { name: 'iOS 禁用推送标题', type: 'boolean', value: false },
      { name: '是否强制推送', type: 'boolean', value: false },
      { name: 'iOS 通知分组 ID', type: 'string', value: 'threadId' },
      { name: 'iOS 通知覆盖 ID', type: 'string', value: 'apnsCollapseId' },
      { name: 'iOS 通知类型', type: 'string', value: 'RC:TxtMsg' },
      { name: 'iOS 通知richMediaUri', type: 'string', value: 'richMediaUri' },
      { name: 'Android 通知 ID', type: 'string', value: '' },
      { name: '小米 ChannelId', type: 'string', value: 'channelIdMi' },
      { name: '华为 ChannelId', type: 'string', value: 'channelIdHW' },
      { name: 'OPPO ChannelId', type: 'string', value: 'channelIdOPPO' },
      { name: 'VIVO 类型', type: 'string', value: 'typeVivo' },
      { name: 'FCM 通知分组 ID', type: 'string', value: 'collapse_key' },
      { name: 'FCM imageUrl', type: 'string', value: 'imageUrl' },
      { name: '推送模板id', type: 'string', value: 'templateId' },
      { name: 'content 内的用户信息', type: 'string', value: '{"name":"lili"}' },
      { name: 'content 内的extra', type: 'string', value: 'extraInfo' },
      { name: 'isDelete（移动端使用, true不显示小灰条）', type: 'boolean', value: false },
    ]
  }

  var sendAtMessage = {
    name: '发送 @ 消息',
    event: Service.sendAtMessage,
    eventName: 'sendMessage',
    desc: '发送 @ 消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web3.html#at',
    params: [
      { name: '文字内容', type: 'string', value: '我是一条文本消息, 我 @ 了其他人' },
      { name: '@ 对象 id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 3 },
      { name: '群组 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '@ 类型(1:所有 2:个人)', type: 'number', value: 2 },
      { name: 'mentioned Content', type: 'string', value: '' },
    ]
  }

  var sendAtMessageByErrorParamField = {
    name: '发送 @ 消息 ErrorParams',
    event: Service.sendAtMessageByErrorParamField,
    eventName: 'sendMessage',
    desc: '发送 @ 消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web3.html#at',
    params: [
      { name: '文字内容', type: 'string', value: '我是一条文本消息, 我 @ 了其他人' },
      { name: '@ 对象 id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 3 },
      { name: '群组 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  }

  var sendLocationMessage = {
    name: '发送位置消息',
    event: Service.sendLocationMessage,
    eventName: 'sendMessage',
    desc: '发送位置消息(sendLocationMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web3.html#LBSMsg',
    params: [
      { name: '位置缩略图', type: 'string', value: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKEIrKCUlKFE6PTBCYFVlZF9VXVtqeJmBanGQc1tdhbWGkJ6jq62rZ4C8ybqmx5moq6T/2wBDARweHigjKE4rK06kbl1upKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKT/wAARCADwAZgDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAIDAQQF/8QAQRAAAgIBAwEFBQQIBAUFAQAAAQIAAxEEEiExEzJBUXEUImGBkQVSobEVIzNCU2LB0TRykuEkVXOi8ENjZJOkZf/EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAHxEBAQEBAQACAwEBAAAAAAAAAAERAjEhQQMTcRIy/9oADAMBAAIRAxEAPwD3YQhKohCEAhCEAhCEAhCbtbyP0gZCNtb7phsbygLCaVI6iZAIQm9TiBkYIx8MesYKEG5jFZyenAgN2YHVofqx8ZOECm5B0X8IdqPBZOEYKdr/AC/jN9x/gZKEYGZCvxEWOLCOvIjYVxxwYCMLRUDTs3k/v5xj5TnX7RCUhr1O7cVIQeI9Z2rwoE8rU0sbLqzXdtNm9WRNw5HM3xJfii/6W0/3LPoP7zpWxb6FtUEA8jPWeR7J/Lqf/o/3nsVKE0iKAQAgHIwZe+eZ4EhCE5ghCEAl5CWHSSjG7p9I8WancHpIjB4j4xLn7Opn8QOPWMSAxyfjAtwdpBOOBmFjmyXoZAVKL7u9j1OOfzhTZvVHLuzYHCr/AF/3hWMUEMVJCn3scA+vnEV2XvBxXncCAeT5emZt0d0IiPlFLYDEcjym7l85hzavfPpNfoD8YoILjHlGfuH6wghCEKJJuplZJu8ZYzWQhCVGQhNAJ6CG2Qj9m3wikEdRAyEJoGTgdYGR1rJ68RjtrHTJiF2br0gPlE4HJi9o3wiQgP2jfCBsbziQgUVw3usIrLtOIucc+UpaMlQPGAnU4lABWMnkwwKxnqZMkk5MALFjkzIQgEIQgEIQgEIQgEIDkkAgkdQDyJu0+R+kBkswcN084g02dZ7SLD0xt8JuDnGJinoyMCPgeDHngbV0e0U7C5TnOZhPuqgJIUYyepjNsfOGG4DJGecRI34wEIEgYyQMnAycZMIBCEIBLDoJGWXuj0ko2CdPmYRGfs0dsZxziRFIYBGCBFY52kHAMMH7xlGlVOMgcdOJz6E4WxCclXIl8H7xnHV7v2jauTgjP5GWNT5ld0IuPifrDb8T9TMsmgRkYiEYBIJ4+MeUKvKibMXxHkZsiiSbvGVkm78sSjb8YRoRphAMkCJrdWNJUAmDYegP5mVq7/ynN9pLVX2eosrNhB27c4B6nmb5y9fKuX9Laj7lf0P953aLVDV1EOALB1A/MTy/1XZ9p7Hbszndv49M4nofZq1WdpqK6zWSdu3OQOh4nXvnnPCrkYJEk2rSm0p2V1jYz7i5wJ0ON1uPhzODUEj7QfbqVo9xe8Ac/WcEbXq7CpN2m1BYsT7tXQeAlqLlvDbVdSpwQ4wZDc//ADOr/Qn94aRTYupXttxZ8dooHl4QA6u3fcyUiylOh3hcY6nzMd9Um+gLbWm/O8Eg7fd8fnItStlwpGw1Vd6wcYH3T5xrKl1FnbVVIVTke6B2pzz8pBZdQi0dpdbXwdpKHcCflJJ9o0G20PcNmRs90+XPh5yo1GlpqDqyVox6KuOfiAJCrXaddTexuwHK4O084HPhKGT7Ro7ewPcOzG3Z7p8ufCX1erupXtKqA9e3dvLY/DrOenX6ZNVqHNvusE2kqecA58In2iy2U9pXdad4yFDYXA6nEg6TqLK69+pQZLBVWrk8zF1al0Vqb03ttBdMDP1kMYFQL3FxegZbWzjr0nVrOun/AOuv5GBJ77u1sCtpkRG2g2kgniZ7Rf8Ax9B/rM0VvY2oCV0uwt/9UZGMTm7O2u+7NGlOCoI2EgZHhA7NPbbZc1dvZHChg1WcHM6Cp8JCldmtZSFUilchRgA5PSdMCcJRuknLFEPA4xnwzGUeM1uhOMkeHnJo8+ntrNZdXZ2BBCiwAtyMeH1kex0q6O6w1hmR2Ue8eOePGX09IW657uHXbYWB6Hkn+0VHOipS8g4sHvrnBzyR+eIRfT21JpVNO+5a8KdiknPoZypqwmhRf1lbAjBIxuG7nHnO3TL2NQaxhljvds8ZM4ltrs0SIASyMOdvAy3nKKJqbG1lj6ekvlAPf93HXmWFtr6NLUVd+AxXHUeImWpqDqrDSFG5ANzg48emPGU0hzp1VR+zJTPnjxkErrFtTSuhyrXKR+MobWOpFVeMLzYT4eQ9Zz2INQ+3TYVKSW3Dozzp07V2Vl61CknLr4hvHMopCEIUSq90SUqndElDSdoYq4UZJWUmfvj0MiJ0lmoQnHBwPylYP3D8OYQCcbjb9p1n7y/3nZOXVLi6iz+cLLG+fXVCEJGWTU5UQgnQjyMIz98/WbMbvD0mwCTbvykm3flhWwhCQIDggjwktdRdq1VazWKxzznOeZSAJByDibly7Fc3smr9k9mzRs88nPXMroaLtIrLYazWeeM5zxLdo/w+kFBdveOcS3u2YHHClz1M8+5LDrGf2QXgoOWIAH1nc5LNgcgQFbHrxMI4dr/8rq/1p/aPpEZRfvoNYZs7B5Y8MTs2IveMO0Ud0QORUur0aYqGcgtWF/dJ6To2WC7Bx2RXg9NpjGxj8InXrzKJpbbXSc6ffdu2kqAA383pNp7YFnts3M37q91fSPCMVKw6ity9ZNqE5NZ6j0P9Jmqq36e51RjY6AEdT6S0deklRHWVWW11rUcMtitnj3fjzJPp9SbKS2o7VVsDEbAuPjOyEg862l3uuDaI3LvyCbNngPrF9kH/ACv/APRPTPSEo49HW6ah92nNKhAFG7cOp8Z2QhIAjMUqY0IAvSbMHQQgQfTCyx2LnbZt3KB1AzxmaNMpsNlp7RugBHCjyAloQOYaOtFZDl6ichG5CmPZUllRqYYQ+A4xLNyDJzUVD2TjHtOq/wDt/wBo1mjU6eutXdah3lB72fMysoTmmESRVRQqAKo6ASVmnD2dojtVZ4svj6jxloQrZkIQCVTuiSla+7FDTD3l9ZsxunzEyGYZUj4RQcgGNEXuj4cQhpza/wDYBvusDOmQ1ozpbB8P6yz1rn2LwiVndWjeagx5EExe8Zsz98fSED+B8jNg/dMyBsm/eEpJv3hEK2EIQJwHPTmV2IvX8YGwAe6JrVKKyevEf3a1k9zMQCesa09BIgNvkIuXbxMEHOY0BCuJkpFYY9IlUsIQlBCEIBKDgRB1EeSghCEiA+EIeMIBCEIBA9DCB6QCE0AmNt+MBITSCJkAiHgx4rdZYFlFwaj8JOUq7pEtVOEIQCEIQCUr7snKV9DFDxW7p9I0yZDRR4j4zU7g9Jn7zfWEbJ3jNFg/lP5SkwjIwfGFS0rbtNWf5cS05tAc6VR5Ej8Z0y31evRMPgfIzZjcqZENEXuiODkZijqR8YRsR+8I8R+CDEKITN3whKEhCEqnqGWz5THOWJjJ7qFvOTA6CBRRgQhCZQQhCArDHpFlIjDEsqshCaAScASgXvCPBa2BzxNII6yVGQhCQHiYQEIBCEIBNAycTJq96Bz/AGk5TTqA+xXbaxxngg5nn6RhVepquyWsCY29Vz1nf9p5NVQVQx7UYB6HrPOzZV+salAEvySOCCP3fSd+P+WL692IRg4nBd9pXCxqFoCWjBJZshR8pzLq9SbmUaoPYg95GrAH4c/jPP1ZLldueLZsevMfwkdJqRqaydux1OHU+Blm6SxkkpV1MnHq7/ymqFIwSJk1uHPrMgEIQgEpX4ycevxiikIQmQJ3fmZh7/qIJ+96wbvD6QjYQhCubR4AuT7thnTObTjbqtQvxBnTLfV69EIQkQJ3R8OJh75+Ignj6wbvD0MI2JZ4R4lnhEKSEZekJdTCQhNUZOOflK0569WzO6Gu5k34RlT3cDjr6xa9Wz7LA+mVCOUa7nP04kNO4S9wfbFrTopHCjH7wlFsNI09deouKHgnsfDHh7v95EdCarfp7rAFzXuHDbgcDPXictX2ja9la7tO25gCqhs8n48SjJWdPentDYLh7CyEEA446fCciXICgbWMQCNw7RyCPLG3+sDrbWaoMzey4ROHXtBnPhL2vY1VaBTVbacYByVHic+n5zxm7HeuPZ8c5x2mPn4/SdlyaZdFQGCBnyFYFsKM8nnmBbWazFdbUvtHaEbmzg49Ooi6bW2X6hay1LqQSdgYEcfGZcKzUG0916pjC4Yqg/DJPpJ0otrVg36o3YIb38bPPw/CB6XXiLZqk077GrsxkDft93n4x074/rF+0U36KweIGfpNTNyqo2opUkNdWCOoLCA1FDEKLqyT0AYTxdRWbbmsRq8Phv2ijkjnxj6HTt7XWWNeAc8OpP4GdP1zN0x7BGDiZGfqIp6TggHSEIQCEAwJIDAkdQD0grBlDKQwPQg5EAgenHWbiGD5QJajTpq1UOzrt5wp6yP6Jo+/Z9R/adW3I5EMHzM1OrEyPGetdLqtRWAxxh1zyWGP7gzlprvreu8ovvE7wM5w3n6cT1/tKkGg3A7bK+6fP4fOcD35pRq+9ZwvwPx9Jx6l3+vTxZef46/s3B1OoZemFUn4jP8AcTvPIM4NOyU1itOg6nxJ8zOiu0HksAPMnE3Jkcert1SNWffERXRyQjoxHUBgYy94es2jbO+Yse3vD0iQCEIQCPX1MSPX1MUUhCZMgXvH5Qf931gO/wDKa/T5iEEIQhXMox9oP/MgP9J0zms419R+8hH9Z0y1b9CEISIxe80G6r6wHfPpNfoPWEESzoI8SzpEKxYTF6wloWPV3/lElKuplVx2U3tqNQQ1a12DHPJPu4+Ua2uweyisAsmRnBwDt8fhLk5JMcdJEcqJqK1usZVstswNtbbQAOOpnI+n1jIV2ajkY51KkflPVhA8ldPrlCgLeFAwQNQB9PKdrLqbUrO2uphkHf77D0M6YQOG6vUJljl8DmxFy5+Cjwi00v2TNUhrcWbq1fr0AOfWehJxAdOR1lWPaVMFAJIIw3TPxkoDIOQcGVSaTTfqf+Joq358EHSC0PXrty1VLSB1CgHp9ZXtH+H0mglu8Zb1RucnMD0hA9DMIJK+/scfqrbM/wANc4lYlt1dK7rXCj4+MDn0T9pfqX2MmWXhxgjiS0Wpc6Wqqio2Mo94nhV585XRWC2/UuAwBZcBhg9IaWwU/ZaWEZCoTj5yjNVSl+srV03gVsQucZMh7J//AC//ANErqK69VqQHXIWndjPQk8Tm9m06abT3umQf2g3HJHn8oHVpdIq27m0PYlRkN2u7n0lPtFqhpttpXk+7v3Yz8uZHR6RDcNQtIrrAygLEk/HrLmqyioppiPeYlmsbO3MDxn7IsoHs4Gclh2mPQ5nLcRuevNbKp9wDdjnnjx4wevnPXewaenUVrcr2MNwsU+8eehlhut1Vl+mepXHu7DyXx4nyg1B9Kg+zTZntCQuMcDqI3YbAT+i1wPO4GW1NXbNSLWtQ2HBRLPdBAz5RbdMVvpq9q1JWzduzZ5CA2lZiVZdEtSOO+HXp9MzpnKNOKrq6lv1OMEj9ZwMY4xidR5zKqlvhJyl3UScQEIQgEevvRI9Xf+UBrLEprL2NhR4yH6R0n8X/ALT/AGkftOmy2ysGxUp8SxAwf6zz/ZW/i09cftB9Z1445s+aPdqdLlFlbZU9DGfuGcH2ZTZVZYBYr0+BUg5P9J3tyCPhOfUkuRBCYORmbMK5tSduo07fzEfWdM5tcdqVv92wGdMt8W+QQhCRGDvj0M1+6frM/eX1mtyp9IQRLOkYciY/diFIvWEwdYS1IyUr4UmTlF/Yn5y1pOUk5SSghCEiCEIQCIepjxG6mWKyEISgmg4MyECkIqnwjEgTKAdBFaqtnV2QFl6EjpGXkQgJXVsuts3Z7Qg4x0wMTn/R1WNvaXdnnPZ7/d+k64QJLQqtawY7rep8hjHEXT6OqgDguwGNzc8fDyl4QIV6YU2BqrHSvxr6j/aVsRLUKOoZT1EaGIHLboQ/upYK6jjci1jn5yl2lpvO50w33l4Mt6wgT1FC3hcu6FTkFDgyJ0Clgx1OpJXoe06fhOqB4EDlr0wruFnbWvgEYsO7rLryw9ZkavviaVtp94D4RIznLmLAIQhAIyHDiLGXvCByfbNidktWff3BsY8OZx/8J7B/8j5+f06T2wSOvIm7x/4Jvn8mTB5/2NYnZNVn39xbGPDiegOcxWYkccCPM9df6uoRe6PSNFXp8zGmFc+uGdK/wwfxl1O5Qw8RmT1K7tPYP5TDTNu09Z/lEv0v0rCEJEYfA/GNEbp8xHhCKw2jkdJjkbeojbl8j9IblHgfpAlkecJTen/ghNamJSg/Yycov7I/OK0nKScoOgkoIQhIghCEAiv4RpjdICQhCaUQhCAQhA8AnygMp5xGkkYOodc4PPMqORJQQkjqqFJBs5HHQzPbNP8AxPwMZTFoQhIghCEAik4PEaIeplgYMPHiYzZ4EWEuKJSrxMnKLxUT5xQh5OfOZCEAi2OK13MGPBPCk/kOI0jqveCJsVy5IANYY5x4ZIxA1dTWaRa25QVBwVP0BxzGovV3RSGSwjJRlPH4TnoU1g1Csq1YXJStA3wOSxEmtlqO9w7Ut2orOQmMZHHr6cSI7L/tDT1F0Ng7RfDaesj+lKPZt29e22Z27TjdjpOjV3CunG3L2e6qE9SZlpWqqqg15Wz9WQD0GICV/aGmtVV7Ub2HI2nrMs+1tKqgo+85HGCP6S9V9TOaaiTsHJHIHwzOW46i9rNnZGmrAPaZ7w5J4gM32ppVI2vuy3PBGB59J0UaqjUEil9xHJ4InH2up1TVhUpyqrb7+4YPPkZ16S2y1H7UIGRyp2Zxx6wLMNylT4jEhoTnSp8Mj8Z0Tm0Q2pYv3bCI+mp46YQhIhW6fOPEbpNssWpNzZx8BCMXp8zB+6YtNi2oSucAkciYXdndFQELjJLY/pAyEViyldyDDMF4b/aE0mNjK+MJjvk8+XEWI7FXTC554itHjr0iDpzNBxFDwmbhNyD4zKCEIQCB6QhAnCaepmTSiEIQCY3db0M2DA7W9DA56XtFKAU5GODvAzOip2K++mw56ZzE04/UJ6QvJWlyMggdZb8qSm7YHXs7G988quR1hqL91Dr2VoyOpXiDI1YRhbafeHBbiMENt1v62xQCMBWx4R8ejoXoIhci9UwMFSYmnG+llclhuK8nwkzpKu3UCs7NpzyesmRHXMmIi1qFQYAmzKA9JOVAyYwUDwlghCdBAPUSTpt5HSVSSjjFYEQDJAj2n3gIE4QhAJDVJvs064U5c99cjofCXmgkdCYHJpxWH1B31iv3PerOxfHyP9YaeiuwO2XK9sWU7zggY5+M68nzMM88wjn1lIF1VxYsxuQDP7o8hJayuwtS2rtXszZgqowBx5z0HrSzbvGdrBh6ia6K67XUMPIjImRyG+tbKKNK9eGY7gmDgYkGrS6xaNIzAAbbXB4I8j5meglNVZzXUiHzVQI9YABwAOT0Eo4LsV610F66f9Uu1jjHBPnH0DAPbWri1R7zWDxYzqtqrscdpWj4HG5QZqIlYwiKo8lGIDTn0nW//qtOic2k79//AFDH01PK6YQhIhW7seI3dM2xO0TbuZfipwYRHTdLcfxGk3U9s29EbIB3dkW/rKU6cVtuFlh5OQW4Ms2dpxjPxGYHLtQMvCKdwwewYc/WEcqWK7mGAc4C45+sJRsesAk5AOOREj1H3vWVSnqfWNtHlMfhjGXoJKM2iGwec2EiF2kdDN94fGbCBm7zE0EHxh1mFfKUY/WLNIImSxRCEIAyhlKsMg9ZL2Wj+H+JlYS6Jey0fw/xM0UVBWVV27hg4MpCNpqQ01IIIUgg5zma2nqdyzLkn4yuD5GZG00Uota7FyBnPMpJzQSJmwPCYG85oOZEDVpbUUcZVuonm2M+j9probaFZWHGeD6/Keoh8Jw6xV9tVRbsa1QpBrDA8+OZ1/HfpY4v0jq/4v8A2j+09PQWWX6Tfa24knBxjic92jNNTWPdXtXy06zq0rj2NGDbhg4O0L4+Qmu7zefiBq++IWHLmbV3vlMfvH1nILCEIBCEIBCEIFpswdBNmQQTofWExOresIG749DNmN3h85sAnNpP2moH/uGdM5tJ+11H+eWeNTyumEISIV+6fSPEbun0jwhV6H1P5wgvj6mbCowgesJazGTQcEHymQlaUtHQzE6TQN1WPKKvWRDTnv1qUuyGu1tgBYquQM/OdE8/U/tdSD3Cat58l5zIOhtYAcDTalh5ivI/OZXrVe5auwvVj95MYHn16RLm1DW6g13italBC7Ac8Z6zamZtYrcFjpgefPMotXqEc2Bv1bVn3gx6Dz9IrayhbUQWVkMDlt4wuJz22WPptWty1h0UDKA8gjPjJO9HtFJGhsAw2V7Ee908PGB6JtU1M9WLceCsDk+UKrEvrFicg/hOXSFzRcdOio3bHC2AjAwPAR6qzq6KrTZZSSORU20dYFK37Q2AKRscr1zmJqNVVptgsPeP0Hiek5tHQlpu26q8EWHhbMEjzMrrx2OmpHbMNto/WN7xHXn4wNTXaey4Vq+crndg9fLGJg1qPxTVbb8QMD6yent7XUWt7R2+KT72zbjnpCnU3pTQnspO5QFPagZ4/CUehtEA9KPtaxA/kSMzE7y5GPMZkftKpfZ3tVALFIO4DmJNuVXZMZQ3UTw9XqLl1L7brApOQAxHB5jaG6+3V1qbrCM5ILE8Tp+q5umPWKYMUjHWVfqIs5aicI+0E8cTjXWo4ylGpYea15H5y6rq3Ecxt6MwZ0G4dCR0kmtVXqVgwNvQY6cZ5jQKsysCCNwPhiTbwAAAA4A8JJtTXXelJLb36YHEa61aq2tfO1RzgcwiiHDibYMN6yVVi3VLZWcqenwjC5LrHRQQayAc/GFEJzLrkZdy06gr94V8fnLVW13JurYMPygPCEIBCEIFl7omzF7omzIJi9WmzF7x9BCBuq+s2Y/7vrNgE5tL+21H+edM5tL+31H+eWeNTyumEISIVu6fSb2i9p2fjjMxu6fST2L7X0/d3dfHMIqPH1mzB1PrNhUm7xhB+8YS1ksIQlaPUfeI85hG1vSYDtIMe0cgwM3CcNxta/VJVUH3oqklsbeDOuGBknAyepxyYwcz6W0do3tS1Vsqq2VBzgY8ek2hqzrcJYrqmnClgeOs6CAQQQCD1BGQZtSVoCERUz12qBmRHn2Xo66rqouA7MsMBsDHWabbmsrsOo0OUBAG8+M9EorLtZQV8iOIns2n/gVf6BA5tJetddzW2VljYWxWc5zjGJOm4pp00pdaXUYdnIGPTznelVdedlaLnyUCD1V2ftK0fH3lBgclo03Zp2GoqrsrHuMHH0MXUtZetHZ2jtMg7a1DDI6nPwzOr2XT/wACr/QJRFVF2ooVfIDAgebqK9WlljNa1hKbFIrGGB8PhyZ02J2dmkTwUkfRZ1wgTBwQfKPeFfTuCCVKnu9flFZfETFYr05HlKrm0dAvoDi7U1gHAHaflxNq/V/aAp36h8DOWfKnjynX2w+6Yby3HSavfo1jlvSZCE5o0dZ5mgt1C6ULXpe0XJ97tAM8+U9MdZ5+l9r09Iq9k3YJOe1USimqH/F6TjHvN+U6PXic+pS9n01qU7mTJZN4GMgeMy5tXbTYg0uxiuAe1U/+cQOYtVdRfcbUWxm3ICwBAXp/WX1dgt+zHsHRlB/ESy6ahFC9jWdoxkoOZznTWjR6ihVBBbNfvDkZBxKNUeyagDpRd/2t/vLaIZ1WrH86/lGtqW2o1P0Ix6RPsym6pru3xuYjByDnHjIE+zf8GnqfzgRs+0ht47Sslh8QesTTjV6ekVeygkE+8bQPwlqKXWxrrmDWsMe70UeQlFoQhCiEIQKp3RGip3RGmQTB3z6TZg749IRr9B6wg/dhAJzaX/Ean/MP6zpnNpv8Tqf8w/rLPGp5XTCEJEY3dPpNCjdvx72MZ+Exu6fSMOkIUdT6zZg6t6zYVN+9CFnWEqEhKnbYgdCDkZBHjJSqJTvVfEScpUeSPOKJwmsMMRMgEdRgQUeJmyVBCEJAQhCAQhCAQhCARWXxEaECc0HBzNYYOYs0qkJiHwmzKCEIQCEIQMYZ5ESUisMGWKWMhwwiwlD2DD+sSWZd4BziL2X834QJwlOy/m/CHZfzfhGicJTsv5vwh2X834QNr7saYqFfHPym4Oeox6TKCZ+8JpB8CPpDb056QB+4fSE08gxR0EDZzaf/ABOp9VnTOej/ABWo9V/KWNTyuiEISIxu6fSMOkVu6fSMOkIUdW9ZswdW9ZsKSzwhCzpCVH//2Q==' },
      { name: '维度', type: 'number', value: 40.03190424323978 },
      { name: '经度', type: 'number', value: 116.41731465378871 },
      { name: '位置信息', type: 'string', value: '奥运村街道麦当劳(上品奥运村店)上品+(奥运村店)' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  }

  var sendRichContentMessage = {
    name: '发送富文本消息',
    event: Service.sendRichContentMessage,
    eventName: 'sendMessage',
    desc: '发送富文本(图文)消息(sendRichContentMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web3.html#ImgTextMsg',
    params: [
      { name: '图文标题', type: 'string', value: '标题: 融云' },
      { name: '图文内容', type: 'string', value: '为用户提供 IM 即时通讯和音视频通讯云服务' },
      { name: '图片信息', type: 'string', value: 'https://www.rongcloud.cn/images/newVersion/log_wx.png' },
      { name: '图文链接', type: 'string', value: 'https://developer.rongcloud.cn' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  }

  var sendReferenceMessage = {
    name: '发送引用消息',
    event: Service.sendReferenceMessage,
    eventName: 'sendReferenceMessage',
    desc: '发送引用消息(sendReferenceMessage)',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/message-send/#rich-content',
    params: [
      { name: '引用消息内容', type: 'string', value: '' },
      { name: '引用消息用户 ID', type: 'string', value: '' },
      { name: '引用消息类型', type: 'string', value: 'RC:TxtMsg' },
      { name: '消息内容', type: 'string', value: '为用户提供 IM 即时通讯和音视频通讯云服务' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  }

  var sendSightMessage = {
    name: '发送小视频消息',
    event: Service.sendSightMessage,
    eventName: 'sendSightMessage',
    desc: '发送小视频消息(sendSightMessage)',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/message-send/#rich-content',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: 'sightUrl', type: 'string', value: 'http://gz.bcebos.com/v1/rongcloud-file/4__RC-2021-9-6_11_1630923296342eee607d8-2949-478b-87ad-8c3a3c5dfe37' },
      { name: 'content', type: 'string', value: '/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA8KADAAQAAAABAAAAhwAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAhwDwAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMADw8PDw8PGg8PGiQaGhokMSQkJCQxPjExMTExPks+Pj4+Pj5LS0tLS0tLS1paWlpaWmlpaWlpdnZ2dnZ2dnZ2dv/bAEMBEhMTHhweNBwcNHtURVR7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e//dAAQAD//aAAwDAQACEQMRAD8AuAVIBTQKkAoGKBTwKAKkApjFAqQUgFSDmgQAelPAoAxT8Z5oATHrTgKUe9OA9KQCcU8CgA0/HtQAmKMU/FGKAG4oxTsUuKAGYpMVJikxQBHimkVLimGgCEioiV9RTJ7y2iyHkGfQc/yrCMsXTPP1quR9jnq11DQ3sDvTCqVmDU40AQxsccVbt7lLoEoCNvXNU6ckrtGkakZbMeVT1qMrHUxFQkVBZGVT3qIhO9SGmEUARkR+9MIj96cRUZoGf//Q0BUgFMFSCgoUglSB1xVCXzo5FRWYDZz1PPOa0hTBNHxz+lUhMqb7ltmCfmA+nX274q9FJkRxkjLIWOCcjp+PenrLGBnPtUweM5I7cUgMu2dndcuTuBJG7px25P6ils5JjMfNZgo5zk46d61UkRmKr1FTb1BI7jHA96GCM+Bw0rDzWwQeGwCT7DAIxUNjLJJcAO5IYE4zWusiMdueevSnM6IVVu/SgCGaQNbGSN9mehx/jiqNtPP9ndozuYdF649+pP51qxSxODsPT8KDcwqSrE5XrxQBSE26JlV22ADDjk7uu0evWod9ysLQyOcoq5wMnOeRkeorZVg6hl6GnUgMCKRzE/zs3QDBYgZOM8fnilR5dkoaU8AFSSVB55x6en1rf5pKAMjTS5Zt7NwBhWJz25wa1jS0h6UCuU7u6jtY978k9F9a5i5v7i4+8dq/3RwKuazu+0gnptGK5xJAN3mAkE9B6V6eHox5eY4K1STk4kokBY47etOEpPTFWra3jlAaT51AIGCQcHp+RqnHBNHKylM/TmtVOLbRjbsy4TKTlSAB2xWnpjEiX6isk207EkJJz7Vs6ZG6JJ5iFckdR7VzVrcrOijfmReJNZ95vJUKM9c4qbULk2ts0qLuboPxptvu8lfMYliATn3riasrs6pR5lymPJcCJ9y4yvar8Nwtwm5PxHpXPXZK3JHHLHIqzprN9pKjpt5/pXTKglC5hTk4y5TZIqIipyKiIrmOo//R0RUgqMVIMUxkgoEUfpQKyTqrqxGwcH1rSEHL4SJTUdzbWKP+6Km8tPT9awxqdxjIh4/HvSNq06Y3RAZ6ZJqvYTZPtoI3hGgO4DmpNiHqKzrC8a73blC7cdPetMVEo8rsyoyuroVUQdAOKeVDEFhnHSmigswZQoyD19qmw7kioqjAGKXyoiSSoJPWlFOpDFGAMCjNJThSASlopKYC5pDjFFIelAmZF7El0mM8MuQw96zbTRIjzM+fYdf1qG3vjEdknKfyrVSWOQbo2B+ldz56a5UzhjKMncdPbWlpAWVQDwNx60+wkSSE7CDhscVBcr58JikJK5qOxVbFGiTLAtu5rBwurt6miaU79DWNRmoTdD+7TDdD+7WfIzfnj3C4dYomlf7qjJqGNg4DLyCMg1HPN5sTRsvDAg/jVG3UwQ+WjHHuc0/Yr4nuDrdEVL3TAZDLE/zE5wamtIktgxJ7ZZqSa4jjyCckdhWVNcPLx0X0rqUZSXK2c7mou6OhjfzIxJ/e5pDSQDEEY/2RTjXG9zrT0P/Svg1KDUIqQUxkwrKbSmZi3mAZOelaYNSjFXCo47ESgpbmWNMmxjzv50p0mRvvSg49jWuMVIMVft5E+xiVbCzNoWywbdjp7VpjFRgU8A1lKXM7suK5VZElKKaM08Uhig08Gm0opAKRRS0tMAoNFFADaQ0+koEcDKMdOucU+13C5QEYOa37/SvOJlt+GPJXpk+orMt4rg38Yug2c4yR/XvXqRqqUHY8x0XGVmajdMVSu5WgQOvc4rba2H8JrG1aFkgUk5+b+lctKSckjpqRai2Zn9pS/wB1aadRl/urVUqPSoZOBxXZyRfQ4+eXc0I72SWRYyBg1e6DFZdvHGb2NIW3Kcc++OfSuh+zqPvEmuetyxaOqkpNHK3A3Tv9ar45x19K0pbWeS5kESHG48ngVoW1gkB8yQ7n/QVbqqKJjSlJkyKVRVPYAUGpTUZrgbud6R//07gNPBqEVIDTGTg1KDVcGpAaALINSA+1V1JqUE0gJxipRVdS3fFSgn0oAlFSc1EvvTxigCQU4UwGnigBaWkpaBC0UUtADaWlpKAEwKaRTqaaAGGql1bR3SBJM4BzxVw1GcU02ndCaT0Zhto0HZ2H5VCdFi/56N+QreNRE1r7efcz9jDsZcGmQW8glDMWXpmrjVITUTVEpuWsi4wSVkRmmGnmojSGMNRNUhNRNQM//9S0KeKjFPFAyQGpAag+lIm/5lck+h/CnYC8DUqms5FPTc1WIztJOSc+tIZeDCpARVdTTwefxoEWgaeDWbELoXDF2zH2GPyqY53nDsOc4/pQ1YSdzQBpwNVI32rhmJPrirCuG6dqQyXNLkUzPNVbh7lWQQg49hnn3ppX0E3Yv8UcVWlDMVIcpjqB3pEbaQWcsMdxSGWuKOKYHDdKUnigAOKYSKgunmWFmgGXGMd/rUELzvbFpTtbJwSMcdiRVculyebWxcJFRkiqx83J/eDnoPp1qQyp0zUlCkioiRTyahY/zpiGkiojiqq3EzTmNlwuSAdp6fXpSSebvO2QAE8CrcWtxJ3JzioyRUAMit88g69Kk3g8A5qRjTg1Gac1MJpgf//VsilzTadQMcKeKjzTs0ASg1KDVcGpAaALANSg1XBqQGgZZBqQVXBqUGgRYBp4NQA1IDSAmFKKjyAMmlyBQBLmjPvUeaM0APzRmoywXrxSBgenNADzTCaQmmFqAAmozSk1GTTACTURpSajJpgISaianE1ETQIa1RmnE1GTQA00wmlJphNAH//WsUUlFAx1OplKDQA5huGOlNEX+0admnA0XCxJGNi7c5qcGq4NSA0AKkRXHzVKEk4w+KYGqUNRcLEsaOrAlyQO1WgaqhqlDUDG3EC3Aw3cYqRolcEH2/SlBpc0XFYci7Cx65p+aZupM0AQSRSM5YMcf596Io3R8sxIx0PSpiaQmi4rDy1VJkkdgUbGKmJphagZAY5M53Hv39ajMchOdx6+tWCaYTTuKwgyFAPNMJpSajJpDK22XBBOPpTGWQgjOPxqcmmE1VxWIxuyd1ITSk1GTSACaYTQTTc0Af/XlpaSloKClzSUUgH5pwNMpwoEPzTgaZThTAkBqQGohTxSGTK1ShqgWpRQBMGpwaox0pw60AO3UFqb3oamIdupu6im0hgWpuaDSUCGlqYTS03tTAaTTCacelMNADCajJp5qM0CGk0wmnGmmmAw0hpaaaBn/9k=' },
      { name: 'duration', type: 'number', value: 100 },
      { name: 'size', type: 'number', value: '为用户提供 IM 即时通讯和音视频通讯云服务' },
      { name: 'name', type: 'string', value: '123' }
    ]
  }

  var sendSyncReadStatusMessage = {
    name: '发送多端同步阅读状态',
    event: Service.sendSyncReadStatusMessage,
    eventName: 'sendSyncReadStatusMessage',
    desc: '发送多端同步阅读状态',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/message-send/#rich-content',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '最后一条消息时间', type: 'number', value: 0 }
    ]
  }

  var getUnreadCount = {
    name: '获取指定会话未读数(支持超级群)',
    event: Service.getUnreadCount,
    eventName: 'getUnreadCount',
    desc: '获取指定会话未读数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clear',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getTotalUnreadCount = {
    name: '获取会话未读数总数(不支持超级群)',
    event: Service.getTotalUnreadCount,
    eventName: 'getTotalUnreadCount',
    desc: '获取会话未读总数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#total',
    params: [
      { name: '包含免打扰', type: 'boolean', value: true }
    ]
  }

  var clearUnreadCount = {
    name: '清除会话未读数',
    event: Service.clearUnreadCount,
    eventName: 'clearUnreadCount',
    desc: '清除指定会话未读数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clearcode',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var clearAllUnreadCount = {
    name: '清除全部会话未读数',
    event: Service.clearAllUnreadCount,
    eventName: 'clearAllUnreadCount',
    desc: '清除全部会话未读数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clearcode',
    params: []
  }

  var getConversationUnreadCountByType = {
    name: '按会话类型获取会话未读数(不支持超级群)',
    event: Service.getConversationUnreadCountByType,
    eventName: '',
    desc: '按会话类型获取会话未读数（应用层兼容）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '会话类型', type: 'string', value: '1,3' }
    ]
  }

  var clearTotalUnreadCount = {
    name: '清除所有会话未读数',
    event: Service.clearTotalUnreadCount,
    eventName: 'clearTotalUnreadCount',
    desc: '清除所有会话未读数（应用层兼容）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
    ]
  }

  var getUnreadMentionedCount = {
    name: '获取群会话 @ 未读数(支持超级群)(仅web)',
    event: Service.getUnreadMentionedCount,
    eventName: 'getUnreadMentionedCount',
    desc: '获取群会话 @ 未读数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '会话类型', type: 'number', value: 3 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getAllUnreadMentionedCount = {
    name: '获取所有群会话 @ 未读数(不支持超级群)(仅web)',
    event: Service.getAllUnreadMentionedCount,
    eventName: 'getAllUnreadMentionedCount',
    desc: '获取所有群会话 @ 未读数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
    ]
  }

  var setDraft = {
    name: '设置会话草稿(仅web)',
    event: Service.setDraft,
    eventName: 'setDraft',
    desc: '设置会话草稿',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clearcode',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '草稿内容', type: 'string', value: '这是会话草稿' },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getDraft = {
    name: '获取会话草稿(仅web)',
    event: Service.getDraft,
    eventName: 'setDraft',
    desc: '获取会话草稿',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clearcode',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var deleteDraft = {
    name: '清除会话草稿(仅web)',
    event: Service.deleteDraft,
    eventName: 'deleteDraft',
    desc: '清除会话草稿',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clearcode',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var joinChatRoom = {
    name: '加入聊天室',
    event: Service.joinChatRoom,
    eventName: 'joinChatRoom',
    desc: '加入指定聊天室, 并拉取消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/basic/join/web3.html',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId },
      { name: '拉取消息数', type: 'number', value: 2 }
    ]
  }

  var joinExistChatRoom = {
    name: '加入已存在的聊天室',
    event: Service.joinExistChatRoom,
    eventName: 'joinExistChatRoom',
    desc: '加入已存在的聊天室，若聊天室不存在，则加入失败',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/basic/join/web3.html#jion-exist',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId },
      { name: '拉取消息数', type: 'number', value: 2 }
    ]
  }

  var quitChatRoom = {
    name: '退出聊天室',
    event: Service.quitChatRoom,
    eventName: 'quitChatRoom',
    desc: '退出聊天室',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/basic/quit/web3.html',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  }

  var getChatRoomInfo = {
    name: '获取聊天室信息',
    event: Service.getChatRoomInfo,
    eventName: 'getChatRoomInfo',
    desc: '获取聊天室信息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/basic/info/web3.html',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId },
      { name: '获取人数', type: 'number', value: 20 },
      { name: '排序方式', type: 'number', value: 1 }
    ]
  }

  var getChatRoomHistoryMessages = {
    name: '获取聊天室历史消息',
    event: Service.getChatRoomHistoryMessages,
    eventName: 'getChatRoomHistoryMessages',
    desc: '获取聊天室历史消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/msgmanage/storage/web3.html',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId },
      { name: '获取时间', type: 'number', value: 0 },
      { name: '获取个数', type: 'number', value: 20 },
      { name: '排序方式', type: 'number', value: 0 }
    ]
  }

  var setChatRoomEntry = {
    name: '设置聊天室属性',
    event: Service.setChatRoomEntry,
    eventName: 'setChatRoomEntry',
    desc: '设置聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/key/set/web3.html',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey1' },
      { name: '属性 value', type: 'string', value: '我是一个聊天室 value' },
      { name: '是否退出清除', type: 'boolean', value: true },
      { name: '是否发送消息', type: 'boolean', value: true },
      { name: '附加信息', type: 'string', value: '我是消息中的附加信息' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  }

  var setChatRoomEntries = {
    name: '批量设置聊天室属性',
    event: Service.setChatRoomEntries,
    eventName: 'setChatRoomEntries',
    desc: '批量设置聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/key/set/web3.html',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId },
      { name: '自定义kv属性集合', type: 'string', value: '[{"key": "x", "value": "1"},{"key": "y", "value": "2"},{"key": "z", "value": "3"}]' },
      { name: '是否退出清除', type: 'boolean', value: true }
    ]
  }

  var forceSetChatRoomEntry = {
    name: '设置聊天室属性(强制)',
    event: Service.forceSetChatRoomEntry,
    eventName: 'forceSetChatRoomEntry',
    desc: '强制设置聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/key/set/web3.html#force',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey2' },
      { name: '属性 value', type: 'string', value: '我是一个聊天室 value' },
      { name: '是否退出清除', type: 'boolean', value: true },
      { name: '是否发送消息', type: 'boolean', value: true },
      { name: '附加信息', type: 'string', value: '我是消息中的附加信息' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  }

  var removeChatRoomEntry = {
    name: '删除聊天室属性',
    event: Service.removeChatRoomEntry,
    eventName: 'removeChatRoomEntry',
    desc: '删除聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/key/remove/web3.html#del',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey1' },
      { name: '是否发送消息', type: 'boolean', value: true },
      { name: '附加信息', type: 'string', value: '我是消息中的附加信息' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  }

  var removeChatRoomEntries = {
    name: '批量删除聊天室属性',
    event: Service.removeChatRoomEntries,
    eventName: 'removeChatRoomEntries',
    desc: '删除聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/key/remove/web3.html#del',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId },
      { name: '聊天室kv属性', type: 'string', value: '["x", "y", "z"]' }
    ]
  }

  var forceRemoveChatRoomEntry = {
    name: '删除聊天室属性(强制)',
    event: Service.forceRemoveChatRoomEntry,
    eventName: 'forceRemoveChatRoomEntry',
    desc: '强制删除聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/key/remove/web3.html#forcedel',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey2' },
      { name: '是否发送消息', type: 'boolean', value: true },
      { name: '附加信息', type: 'string', value: '我是消息中的附加信息' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  }

  var getChatRoomEntry = {
    name: '获取聊天室属性',
    event: Service.getChatRoomEntry,
    eventName: 'getChatRoomEntry',
    desc: '获取指定聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/key/query/web3.html',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey1' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  }

  var getAllChatRoomEntries = {
    name: '获取聊天室属性(所有)',
    event: Service.getAllChatRoomEntries,
    eventName: 'getAllChatRoomEntries',
    desc: '获取所有聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/chatroom/manage/key/query/web3.html#getall',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  }

  var updateMessageExpansion = {
    name: '设置消息扩展存储',
    event: Service.updateMessageExpansion,
    eventName: 'updateMessageExpansion',
    desc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '消息 Uid', type: 'string', value: '', event: Service.getLastCacheMsgUId },
      { name: 'key', type: 'string', value: '多个以逗号区分', event: Service.getLastCacheMsgUId },
      { name: 'value', type: 'string', value: '多个以逗号区分', event: Service.getLastCacheMsgUId }
    ]
  }
  var removeMessageExpansion = {
    name: '删除消息扩展存储',
    event: Service.removeMessageExpansion,
    eventName: 'removeMessageExpansion',
    desc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '要移除的 keys', type: 'string', value: '' },
      { name: '消息 Uid', type: 'string', value: '', event: Service.getLastCacheMsgUId }
    ]
  }

  var sendImageMessageByUpload = {
    name: '发送图片消息（上传）',
    event: Service.sendImageMessageByUpload,
    eventName: 'sendImageMessage',
    desc: '上传图片，然后发送图片消息',
    params: [
      { name: '图片', type: 'file', value: '' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId},
      { name: '静默消息', type: 'boolean', value: false },
      { name: '缩略图最大高', type: 'number', value: 160 },
      { name: '缩略图最大宽', type: 'number', value: 160 },
      { name: '缩略图质量', type: 'number', value: 1 },
      { name: '缩略图缩放', type: 'number', value: 1 },
      { name: '是否可在浏览器预览（false 为直接下载）', type: 'boolean', value: false },
    ]
  }

  var sendFileMessageByUpload = {
    name: '发送文件消息（上传）',
    event: Service.sendFileMessageByUpload,
    eventName: 'sendFileMessageByUpload',
    desc: '通过上传方式发送文件消息',
    params: [
      { name: '文件', type: 'file', value: '' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false },
      { name: '是否可在浏览器预览（false 为直接下载）', type: 'boolean', value: false },
    ]
  }

  var sendHQVoiceMessageByUpload = {
    name: '发送高清声音消息（上传）',
    event: Service.sendHQVoiceMessageByUpload,
    eventName: 'sendImageMessage',
    desc: '通过上传方式发送声音消息',
    params: [
      { name: '文件', type: 'file', value: '' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false },
      { name: '是否可在浏览器预览（false 为直接下载）', type: 'boolean', value: false },
    ]
  }

  var sendSightMessageByUpload = {
    name: '发送短视频消息（上传）',
    event: Service.sendSightMessageByUpload,
    eventName: 'sendImageMessage',
    desc: '通过上传方式发送短视频消息',
    params: [
      { name: '文件', type: 'file', value: '' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false },
      { name: '缩略图', type: 'string', value: '/9j/4AAQSkZJRgABAQAASABIAAD/4QBYRXhpZgAATU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA8KADAAQAAAABAAAAhwAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAhwDwAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMADw8PDw8PGg8PGiQaGhokMSQkJCQxPjExMTExPks+Pj4+Pj5LS0tLS0tLS1paWlpaWmlpaWlpdnZ2dnZ2dnZ2dv/bAEMBEhMTHhweNBwcNHtURVR7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e3t7e//dAAQAD//aAAwDAQACEQMRAD8AuAVIBTQKkAoGKBTwKAKkApjFAqQUgFSDmgQAelPAoAxT8Z5oATHrTgKUe9OA9KQCcU8CgA0/HtQAmKMU/FGKAG4oxTsUuKAGYpMVJikxQBHimkVLimGgCEioiV9RTJ7y2iyHkGfQc/yrCMsXTPP1quR9jnq11DQ3sDvTCqVmDU40AQxsccVbt7lLoEoCNvXNU6ckrtGkakZbMeVT1qMrHUxFQkVBZGVT3qIhO9SGmEUARkR+9MIj96cRUZoGf//Q0BUgFMFSCgoUglSB1xVCXzo5FRWYDZz1PPOa0hTBNHxz+lUhMqb7ltmCfmA+nX274q9FJkRxkjLIWOCcjp+PenrLGBnPtUweM5I7cUgMu2dndcuTuBJG7px25P6ils5JjMfNZgo5zk46d61UkRmKr1FTb1BI7jHA96GCM+Bw0rDzWwQeGwCT7DAIxUNjLJJcAO5IYE4zWusiMdueevSnM6IVVu/SgCGaQNbGSN9mehx/jiqNtPP9ndozuYdF649+pP51qxSxODsPT8KDcwqSrE5XrxQBSE26JlV22ADDjk7uu0evWod9ysLQyOcoq5wMnOeRkeorZVg6hl6GnUgMCKRzE/zs3QDBYgZOM8fnilR5dkoaU8AFSSVB55x6en1rf5pKAMjTS5Zt7NwBhWJz25wa1jS0h6UCuU7u6jtY978k9F9a5i5v7i4+8dq/3RwKuazu+0gnptGK5xJAN3mAkE9B6V6eHox5eY4K1STk4kokBY47etOEpPTFWra3jlAaT51AIGCQcHp+RqnHBNHKylM/TmtVOLbRjbsy4TKTlSAB2xWnpjEiX6isk207EkJJz7Vs6ZG6JJ5iFckdR7VzVrcrOijfmReJNZ95vJUKM9c4qbULk2ts0qLuboPxptvu8lfMYliATn3riasrs6pR5lymPJcCJ9y4yvar8Nwtwm5PxHpXPXZK3JHHLHIqzprN9pKjpt5/pXTKglC5hTk4y5TZIqIipyKiIrmOo//R0RUgqMVIMUxkgoEUfpQKyTqrqxGwcH1rSEHL4SJTUdzbWKP+6Km8tPT9awxqdxjIh4/HvSNq06Y3RAZ6ZJqvYTZPtoI3hGgO4DmpNiHqKzrC8a73blC7cdPetMVEo8rsyoyuroVUQdAOKeVDEFhnHSmigswZQoyD19qmw7kioqjAGKXyoiSSoJPWlFOpDFGAMCjNJThSASlopKYC5pDjFFIelAmZF7El0mM8MuQw96zbTRIjzM+fYdf1qG3vjEdknKfyrVSWOQbo2B+ldz56a5UzhjKMncdPbWlpAWVQDwNx60+wkSSE7CDhscVBcr58JikJK5qOxVbFGiTLAtu5rBwurt6miaU79DWNRmoTdD+7TDdD+7WfIzfnj3C4dYomlf7qjJqGNg4DLyCMg1HPN5sTRsvDAg/jVG3UwQ+WjHHuc0/Yr4nuDrdEVL3TAZDLE/zE5wamtIktgxJ7ZZqSa4jjyCckdhWVNcPLx0X0rqUZSXK2c7mou6OhjfzIxJ/e5pDSQDEEY/2RTjXG9zrT0P/Svg1KDUIqQUxkwrKbSmZi3mAZOelaYNSjFXCo47ESgpbmWNMmxjzv50p0mRvvSg49jWuMVIMVft5E+xiVbCzNoWywbdjp7VpjFRgU8A1lKXM7suK5VZElKKaM08Uhig08Gm0opAKRRS0tMAoNFFADaQ0+koEcDKMdOucU+13C5QEYOa37/SvOJlt+GPJXpk+orMt4rg38Yug2c4yR/XvXqRqqUHY8x0XGVmajdMVSu5WgQOvc4rba2H8JrG1aFkgUk5+b+lctKSckjpqRai2Zn9pS/wB1aadRl/urVUqPSoZOBxXZyRfQ4+eXc0I72SWRYyBg1e6DFZdvHGb2NIW3Kcc++OfSuh+zqPvEmuetyxaOqkpNHK3A3Tv9ar45x19K0pbWeS5kESHG48ngVoW1gkB8yQ7n/QVbqqKJjSlJkyKVRVPYAUGpTUZrgbud6R//07gNPBqEVIDTGTg1KDVcGpAaALINSA+1V1JqUE0gJxipRVdS3fFSgn0oAlFSc1EvvTxigCQU4UwGnigBaWkpaBC0UUtADaWlpKAEwKaRTqaaAGGql1bR3SBJM4BzxVw1GcU02ndCaT0Zhto0HZ2H5VCdFi/56N+QreNRE1r7efcz9jDsZcGmQW8glDMWXpmrjVITUTVEpuWsi4wSVkRmmGnmojSGMNRNUhNRNQM//9S0KeKjFPFAyQGpAag+lIm/5lck+h/CnYC8DUqms5FPTc1WIztJOSc+tIZeDCpARVdTTwefxoEWgaeDWbELoXDF2zH2GPyqY53nDsOc4/pQ1YSdzQBpwNVI32rhmJPrirCuG6dqQyXNLkUzPNVbh7lWQQg49hnn3ppX0E3Yv8UcVWlDMVIcpjqB3pEbaQWcsMdxSGWuKOKYHDdKUnigAOKYSKgunmWFmgGXGMd/rUELzvbFpTtbJwSMcdiRVculyebWxcJFRkiqx83J/eDnoPp1qQyp0zUlCkioiRTyahY/zpiGkiojiqq3EzTmNlwuSAdp6fXpSSebvO2QAE8CrcWtxJ3JzioyRUAMit88g69Kk3g8A5qRjTg1Gac1MJpgf//VsilzTadQMcKeKjzTs0ASg1KDVcGpAaALANSg1XBqQGgZZBqQVXBqUGgRYBp4NQA1IDSAmFKKjyAMmlyBQBLmjPvUeaM0APzRmoywXrxSBgenNADzTCaQmmFqAAmozSk1GTTACTURpSajJpgISaianE1ETQIa1RmnE1GTQA00wmlJphNAH//WsUUlFAx1OplKDQA5huGOlNEX+0admnA0XCxJGNi7c5qcGq4NSA0AKkRXHzVKEk4w+KYGqUNRcLEsaOrAlyQO1WgaqhqlDUDG3EC3Aw3cYqRolcEH2/SlBpc0XFYci7Cx65p+aZupM0AQSRSM5YMcf596Io3R8sxIx0PSpiaQmi4rDy1VJkkdgUbGKmJphagZAY5M53Hv39ajMchOdx6+tWCaYTTuKwgyFAPNMJpSajJpDK22XBBOPpTGWQgjOPxqcmmE1VxWIxuyd1ITSk1GTSACaYTQTTc0Af/XlpaSloKClzSUUgH5pwNMpwoEPzTgaZThTAkBqQGohTxSGTK1ShqgWpRQBMGpwaox0pw60AO3UFqb3oamIdupu6im0hgWpuaDSUCGlqYTS03tTAaTTCacelMNADCajJp5qM0CGk0wmnGmmmAw0hpaaaBn/9k=' },
      { name: '时长', type: 'number', value: 20 },
      { name: '名字', type: 'string', value: '123' },
      { name: '是否可在浏览器预览（false 为直接下载）', type: 'boolean', value: false },
    ]
  }

  var sendCombineMessageByUpload = {
    name: '发送合并消息（上传）',
    event: Service.sendCombineMessageByUpload,
    eventName: 'sendImageMessage',
    desc: '通过上传方式发送合并消息',
    params: [
      { name: '文件', type: 'file', value: '' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '静默消息', type: 'boolean', value: false },

      { name: '前4条消息的用户名字', type: 'string', value: '' },
      { name: '简介', type: 'string', value: '123' },
      { name: '合并消息的会话类型', type: 'number', value: 1 },
      { name: '是否可在浏览器预览（false 为直接下载）', type: 'boolean', value: false },
    ]
  }

  var sendReadReceiptRequestMessage = {
    name: '发送群回执请求消息',
    event: Service.sendReadReceiptRequestMessage,
    eventName: 'sendMessage',
    desc: '发送群回执请求消息(sendReadReceiptRequestMessage)，',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/msgmanage/receipt/web.html',
    params: [
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息 UId', type: 'string', value: '' },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var sendReadReceiptResponseMessage = {
    name: '发送群回执响应消息',
    event: Service.sendReadReceiptResponseMessage,
    eventName: 'sendMessage',
    desc: '发送群回执响应消息(sendReadReceiptResponseMessageV2), 导航开关grpRRVer为 0 可用',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/msgmanage/receipt/web.html',
    params: [
      { name: '群组 id', type: 'string', value: config.targetId },
      { name: '消息列表', type: 'text', value: '{"y2":["BUAP-QKH3-AFUC-035A"]}' },
      { name: 'channelId', type: 'string', value: config.channelId},
    ]
  }

  var sendNewReadReceiptResponseMessage = {
    name: '（新）发送群回执响应消息',
    event: Service.sendNewReadReceiptResponseMessage,
    eventName: 'sendMessage',
    desc: '（新）发送群回执响应消息(sendReadReceiptResponseMessageV2), 导航开关grpRRVer为 1 可用',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/msgmanage/receipt/web.html',
    params: [
      { name: '群组 id', type: 'string', value: config.targetId },
      { name: '消息列表', type: 'text', value: '{"y2":["BUAP-QKH3-AFUC-035A"]}' },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getMessageReader = {
    name: '获取已读列表',
    event: Service.getMessageReader,
    eventName: 'getMessageReader',
    desc: '获取已读列表(getMessageReader), 当导航开关为1时可用',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/msgmanage/receipt/web.html',
    params: [
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息 UId', type: 'string', value: '' },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var sendReadReceiptMessage = {
    name: '发送单聊已读回执',
    event: Service.sendReadReceiptMessage,
    eventName: 'sendReadReceiptMessage',
    desc: '发送单聊已读回执',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息UId', type: 'string', value: '' },
      { name: '消息发送时间', type: 'number', value: '' },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var createTag = {
    name: '创建标签',
    event: Service.createTag,
    eventName: 'createTag',
    desc: '创建标签',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' },
      { name: '标签名称', type: 'string', value: '热门' }
    ]
  }

  var updateTag = {
    name: '修改标签',
    event: Service.updateTag,
    eventName: 'updateTag',
    desc: '修改标签',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' },
      { name: '标签名称', type: 'string', value: '热门修改啦' }
    ]
  }

  var removeTag = {
    name: '删除标签',
    event: Service.removeTag,
    eventName: 'removeTag',
    desc: '删除标签',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' }
    ]
  }

  var getTagList = {
    name: '获取标签列表',
    event: Service.getTagList,
    eventName: 'getTagList',
    desc: '获取标签列表',
    doc: '',
    params: []
  }

  var addConversationsToTag = {
    name: '添加会话到指定标签',
    event: Service.addConversationsToTag,
    eventName: 'addConversationsToTag',
    desc: '添加会话到指定标签（“多个会话”有值时会忽略单个会话，确保数据结构正确，数据结构为：[{"targetId": "' + config.targetId + '","type": 1,"channelId": ""}]）',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' },
      { name: '会话id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '多个会话', type: 'string', value: '' }
    ]
  }

  var removeTagForConversations = {
    name: '从多个会话中批量删除指定标签',
    event: Service.removeTagForConversations,
    eventName: 'removeTagForConversations',
    desc: '从多个会话中批量删除指定标签（“多个会话”有值时会忽略单个会话，确保数据结构正确，数据结构为：[{"targetId": "' + config.targetId + '","type": 1,"channelId": ""}]）',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' },
      { name: '会话id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '多个会话', type: 'string', value: '' }
    ]
  }

  var removeTagsForConversation = {
    name: '从单一会话中批量删除标签',
    event: Service.removeTagsForConversation,
    eventName: 'removeTagsForConversation',
    desc: '从单一会话中批量删除标签',
    doc: '',
    params: [
      { name: '标签id(多个以,隔开)', type: 'string', value: 'tag_id_001' },
      { name: '会话id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var removeConversationsFromTag = {
    name: '删除指定标签中的会话',
    event: Service.removeConversationsFromTag,
    eventName: 'removeConversationsFromTag',
    desc: '删除指定标签中的会话',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' },
      { name: '会话id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '多个会话', type: 'string', value: '' }
    ]
  }

  var getConversationsFromTagByPage = {
    name: '分页获取标签下会话列表',
    event: Service.getConversationsFromTagByPage,
    eventName: 'getConversationsFromTagByPage',
    desc: 'web端count含义和协议栈不一样，代表从前count数量中查找携带该标签的会话',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' },
      { name: 'count', type: 'number', value: 20 },
      { name: 'startTime', type: 'number', value: 0 }
    ]
  }

  var getUnreadCountByTag = {
    name: '根据标签获取未读消息数',
    event: Service.getUnreadCountByTag,
    eventName: 'getUnreadCountByTag',
    desc: '根据标签获取未读消息数',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' },
      { name: '是否包含免打扰', type: 'boolean', value: false }
    ]
  }

  var setConversationToTopInTag = {
    name: '设置标签中会话置顶',
    event: Service.setConversationToTopInTag,
    eventName: 'setConversationToTopInTag',
    desc: '设置标签中会话置顶',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001' },
      { name: '会话id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '是否置顶', type: 'boolean', value: true }
    ]
  }

  var getTagsFromConversation = {
    name: '获取会话下的标签',
    event: Service.getTagsFromConversation,
    eventName: 'getTagsFromConversation',
    desc: '获取会话下的标签',
    doc: '',
    params: [
      { name: '会话id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var insertMessage = {
    name: '向本地插入消息(仅PC)',
    event: Service.insertMessage,
    eventName: 'insertMessage',
    desc: '向本地插入消息',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: '发送方 id', type: 'string', value: '' },
      { name: '消息类型', type: 'string', value: 'RC:TxtMsg' },
      { name: '消息内容', type: 'string', value: '消息内容' },
      { name: '消息方向', type: 'number', value: 1 }
    ]
  }

  var getLocalMessage = {
    name: '获取本地消息(仅PC)',
    event: Service.getMessage,
    eventName: 'getMessage',
    desc: '获取本地消息',
    doc: '',
    params: [
      { name: '消息 ID', type: 'number', value: 1 }
    ]
  }

  var getUnreadMentionedMessage = {
    name: '获取未读 @ 消息(仅PC)',
    event: Service.getUnreadMentionedMessage,
    eventName: 'getUnreadMentionedMessage',
    desc: '获取会话下所有未读的 @ 消息',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var searchMessageByContent = {
    name: '按内容搜索会话内的消息(仅PC)',
    event: Service.searchMessageByContent,
    eventName: 'searchMessageByContent',
    desc: '按内容搜索会话内的消息',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '关键字', type: 'string', value: '' },
      { name: '获取时间', type: 'number', value: 0 },
      { name: '数量', type: 'number', value: 10 },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var deleteLocalMessagesByTimestamp = {
    name: '删除时间戳前的本地消息(仅PC)',
    event: Service.deleteLocalMessagesByTimestamp,
    eventName: 'deleteLocalMessagesByTimestamp',
    desc: '从本地消息数据库中删除某一会话指定时间之前的消息数据',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '时间戳', type: 'number', value: 0 },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var clearMessages = {
    name: '清空会话的本地历史消息(仅PC)',
    event: Service.clearMessages,
    eventName: 'clearMessages',
    desc: '清空会话的本地历史消息',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var searchConversationByContent = {
    name: '通过关键字搜索会话(仅PC)',
    event: Service.searchConversationByContent,
    eventName: 'searchConversationByContent',
    desc: '通过关键字搜索会话',
    doc: '',
    params: [
      { name: '关键字', type: 'string', value: '' },
      { name: '会话类型', type: 'string', value: '1,2,3' },
      { name: '自定义消息类型', type: 'string', value: '' },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var clearUnreadCountByTimestamp = {
    name: '通过时间戳清除未读数(仅PC)',
    event: Service.clearUnreadCountByTimestamp,
    eventName: 'clearUnreadCountByTimestamp',
    desc: '通过时间戳清除未读数',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'targetId', type: 'string', value: config.targetId },
      { name: '时间戳', type: 'number', value: 0 },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getConversationNotificationStatus = {
    name: '获取会话免打扰状态(旧)',
    event: Service.getConversationNotificationStatus,
    eventName: 'getConversationNotificationStatus',
    desc: '获取会话免打扰状态(旧)',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'targetId', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var setUltraGroupDefaultNotificationLevel = {
    name: '设置指定超级群默认通知配置',
    event: Service.setUltraGroupDefaultNotificationLevel,
    eventName: 'setUltraGroupDefaultNotificationLevel',
    desc: "设置超级群默认通知配置 options: { targetId: 'xxx' }, channelId 不传或传 '', 设置超级群指定频道默认通知配置 options: { targetId: 'xxx', channelId: 'xxx' }",
    doc: '',
    params: [
      { name: 'targetId', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId },
      { name: 'notificationLevel', type: 'number', value: 2 }
    ]
  }

  var getUltraGroupDefaultNotificationLevel = {
    name: '查询指定超级群默认通知配置',
    event: Service.getUltraGroupDefaultNotificationLevel,
    eventName: 'getUltraGroupDefaultNotificationLevel',
    desc: '查询指定超级群默认通知配置',
    doc: '',
    params: [
      { name: 'targetId', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var getUltraGroupUnreadCountByTargetId = {
    name: '获取指定超级群所有频道未读数',
    event: Service.getUltraGroupUnreadCountByTargetId,
    eventName: 'getUltraGroupUnreadCountByTargetId',
    desc: '获取指定超级群所有频道未读数',
    doc: '',
    params: [
      { name: 'targetId', type: 'string', value: config.targetId },
    ]
  }

  var getAllUltraGroupUnreadCount = {
    name: '获取超级群类型所有未读数',
    event: Service.getAllUltraGroupUnreadCount,
    eventName: 'getAllUltraGroupUnreadCount',
    desc: '获取超级群类型所有未读数',
    doc: '',
    params: []
  }

  var getAllUltraGroupUnreadMentionedCount = {
    name: '获取超级群类型所有 @ 消息未读数',
    event: Service.getAllUltraGroupUnreadMentionedCount,
    eventName: 'getAllUltraGroupUnreadMentionedCount',
    desc: '获取超级群类型所有 @ 消息未读数',
    doc: '',
    params: []
  }


  var getConversationNotificationLevel = {
    name: '获取会话免打扰状态(新)',
    event: Service.getConversationNotificationLevel,
    eventName: 'getConversationNotificationLevel',
    desc: '获取会话免打扰状态(新)',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 10 },
      { name: 'targetId', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: config.channelId }
    ]
  }

  var setMessageReceivedStatus = {
    name: '设置消息的接受状态(仅PC)',
    event: Service.setMessageReceivedStatus,
    eventName: 'setMessageReceivedStatus',
    desc: '设置消息的接受状态',
    doc: '',
    params: [
      { name: 'messageId', type: 'number', value: 1 },
      { name: '接受状态', type: 'number', value: 1 }
    ]
  }

  var getUltraGroupList = {
    name: '获取超级群会话列表',
    event: Service.getUltraGroupList,
    eventName: 'getUltraGroupList',
    desc: '获取超级群会话列表',
    params: [],
    doc: ''
  }
  var getBlockUltraGroupList = {
    name: '获取超级群免打扰会话列表',
    event: Service.getBlockUltraGroupList,
    eventName: 'getBlockUltraGroupList',
    desc: '获取超级群免打扰会话列表',
    params: [],
    doc: ''
  }

  var updateExpansionForUltraGroupMessage = {
    name: '修改消息的扩展',
    event: Service.updateExpansionForUltraGroupMessage,
    eventName: 'updateExpansionForUltraGroupMessage',
    desc: '修改消息的扩展',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '会话 Id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string' },
      { name: 'messageUId', type: 'string' },
      { name: '消息发送时间', type: 'number' },
      { name: '消息扩展', type: 'boolean', value: false },
      { name: '消息扩展 key', type: 'string', value: '多个以逗号分隔' },
      { name: '消息扩展 value', type: 'string', value: '多个以逗号分隔' }
    ],
    doc: ''
  }
  var removeExpansionForUltraGroupMessage = {
    name: '删除消息的扩展',
    event: Service.removeExpansionForUltraGroupMessage,
    eventName: 'removeExpansionForUltraGroupMessage',
    desc: '删除消息的扩展',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '会话 Id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string' },
      { name: 'messageUId', type: 'string' },
      { name: '消息发送时间', type: 'number' },
      { name: '消息扩展', type: 'boolean', value: false },
      { name: '需要删除的扩展 key', type: 'string', value: '多个以逗号分隔' }
    ],
    doc: ''
  }
  var removeAllExpansionForUltraGroupMessage = {
    name: '删除消息所有扩展',
    event: Service.removeAllExpansionForUltraGroupMessage,
    eventName: 'removeAllExpansionForUltraGroupMessage',
    desc: '删除消息所有扩展',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '会话 Id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string' },
      { name: 'messageUId', type: 'string' },
      { name: '消息发送时间', type: 'number' },
      { name: '消息扩展', type: 'boolean', value: false }
    ],
    doc: ''
  }
  var modifyMessage = {
    name: '修改超级群消息',
    event: Service.modifyMessage,
    eventName: 'modifyMessage',
    desc: '修改超级群消息',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '会话 Id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string' },
      { name: 'messageUId', type: 'string' },
      { name: '消息发送时间', type: 'number' },
      { name: '内容(json 字符串)', type: 'string', value: '{"content":{"key":"value","user":{"id":"非必填","name":"非必填","portraitUri":"非必填","extra":"非必填"},"extra":"非必填"}}' }
    ],
    doc: ''
  }
  var sendUltraGroupTypingStatus = {
    name: '发送正在输入中消息',
    event: Service.sendUltraGroupTypingStatus,
    eventName: 'sendUltraGroupTypingStatus',
    desc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '会话 Id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string' },
      { name: '操作类型', type: 'number', value: 0 }
    ],
    doc: ''
  }

  var getUltraGroupMessageListByMessageUId = {
    name: '根据消息 ID 批量查询消息',
    event: Service.getUltraGroupMessageListByMessageUId,
    eventName: 'getUltraGroupMessageListByMessageUId',
    desc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '会话 Id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string' },
      { name: '消息数组', type: 'string', value: '[{"messageUId":"aaa","sendTime":12345},{"messageUId":"bbb","sendTime":12345}]' }
    ],
    doc: ''
  }
  var getUltraGroupUnreadMentionedCountByTargetId = {
    name: '获取指定超级群所有子频道的 @ 消息未读数',
    event: Service.getUltraGroupUnreadMentionedCountByTargetId,
    eventName: 'getUltraGroupUnreadMentionedCountByTargetId',
    desc: '',
    params: [
      { name: '会话 Id', type: 'string', value: config.targetId }],
    doc: ''
  }

  win.RongIM = win.RongIM || {}

  var DefailtReadyApiQueue = [
    [disconnect, reconnect, getServerTime],
    [getConversationList, removeConversation, setConversationNotificationStatus, setConversationNotificationLevel, getConversationNotificationStatus, getConversationNotificationLevel, setConversationToTop, getBlockedConversationList, getTopConversationList, getUnreadCount, getTotalUnreadCount, clearUnreadCount, clearAllUnreadCount, getConversationUnreadCountByType, clearTotalUnreadCount, getUnreadMentionedCount, getAllUnreadMentionedCount],
    [setDraft, getDraft, deleteDraft],
    [sendTextMessage, sendImageMessage, sendGIFMessage, sendRecallMessage, sendFileMessage, sendVoiceMessage, sendAtMessage, sendLocationMessage, sendRichContentMessage, sendReferenceMessage, sendSightMessage, sendSyncReadStatusMessage],
    [sendImageMessageByUpload, sendFileMessageByUpload, sendHQVoiceMessageByUpload, sendSightMessageByUpload],
    [registerMessage, sendRegisterMessage],
    [getUltraGroupList, setUltraGroupDefaultNotificationLevel, getUltraGroupDefaultNotificationLevel, getBlockUltraGroupList, getUltraGroupUnreadMentionedCountByTargetId, sendUltraGroupTypingStatus, getUltraGroupMessageListByMessageUId, updateExpansionForUltraGroupMessage, removeExpansionForUltraGroupMessage, removeAllExpansionForUltraGroupMessage, modifyMessage, getUltraGroupUnreadCountByTargetId, getAllUltraGroupUnreadCount, getAllUltraGroupUnreadMentionedCount ],
    [getHistoryMessages, getRemoteHistoryMessages, deleteRemoteMessages, clearHistoryMessages, getFirstUnreadMessage],
    [joinChatRoom, joinExistChatRoom, getChatRoomInfo, getChatRoomHistoryMessages, setChatRoomEntry, setChatRoomEntries, getChatRoomEntry, forceSetChatRoomEntry, getAllChatRoomEntries, removeChatRoomEntry, removeChatRoomEntries, forceRemoveChatRoomEntry, quitChatRoom],
    [updateMessageExpansion, removeMessageExpansion],
    [sendReadReceiptRequestMessage, sendReadReceiptResponseMessage, sendReadReceiptMessage, sendNewReadReceiptResponseMessage, getMessageReader],
    [createTag, updateTag, getTagList, addConversationsToTag, removeTagForConversations, removeTagsForConversation, removeConversationsFromTag, getConversationsFromTagByPage, getUnreadCountByTag, setConversationToTopInTag, getTagsFromConversation, removeTag],
    [insertMessage, getLocalMessage, getUnreadMentionedMessage, searchMessageByContent, deleteLocalMessagesByTimestamp, clearMessages, setMessageReceivedStatus],
    [searchConversationByContent, clearUnreadCountByTimestamp]
  ]
  urlQueryConfig.isMini && utils.forEach(DefailtReadyApiQueue, function (list, i) {
    utils.forEach(list, function (item, j) {
      if (MiniUnSupportEventList.indexOf(item.eventName) !== -1) {
        list.splice(j, 1)
      }
    }, { isReverse: true })
  })
  win.RongIM.DefailtReadyApiQueue = DefailtReadyApiQueue

  win.RongIM.ApiList = [
    getConversationList
  ]

  window.RongIM.Api = {
    getConnectionStatus: getConnectionStatus
  }
})(window, {
  RongIM: RongIM
})
