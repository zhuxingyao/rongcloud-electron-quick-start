(function (win, dependencies) {
  var RongIMLib = win.RongIMLib,
    RongIMClient = RongIMLib.RongIMClient;

  var RongIM = dependencies.RongIM,
    utils = RongIM.Utils,
    Service = RongIM.Service,
    config = RongIM.config.im,
    urlQueryConfig = utils.getUrlQuery();

  var MiniUnSupportEventList = [
    'sendRecallMessage', 'deleteRemoteMessages', 'clearRemoteHistoryMessages'
  ];

  var disconnect = {
    name: '断开链接',
    event: Service.disconnect,
    eventName: 'disconnect',
    desc: '断开链接',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/private/connection/disconnect/web.html',
    params: []
  };

  var reconnect = {
    name: '重新链接',
    event: Service.reconnect,
    eventName: 'reconnect',
    desc: '重新链接',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/connection/reconnect/web.html',
    params: [
      { name: '是否嗅探', type: 'boolean', value: true },
      { name: '嗅探 url', type: 'string', value: 'https://cdn.ronghub.com/RongIMLib-2.2.6.min.js?d=' + Date.now() },
      { name: '嗅探频率', type: 'string', value: '100,1000,3000,3000,3000' }
    ]
  };

  var changeUser = {
    name: '切换用户',
    evnet: utils.noop,
    eventName: 'logout',
    desc: '切换用户',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/connection/disconnect/web.html#logout',
    params: [
      { name: 'Token', type: 'string', value: '5JQlp5czM31GNl99DOZyI3xpRjANxKgfakOnYLFljI+TMvOF0hGaVtR1n9Qp4baLgKBGsyl3w5j4gAWBbNZ3nOKrvnVo8Ldl' }
    ]
  };

  var registerMessage = {
    name: '注册自定义消息',
    event: Service.registerMessage,
    eventName: 'registerMessageType',
    desc: '注册自定义消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#createcustom',
    params: [
      { name: 'messageType', type: 'string', value: 'PersonMessage' },
      { name: 'objectName', type: 'string', value: 's:person' },
      { name: '是否计数', type: 'boolean', value: true },
      { name: '是否存储', type: 'boolean', value: true },
      { name: '属性', type: 'string', value: 'name,age' },
    ]
  };

  var getConversationList = {
    name: '获取会话列表',
    event: Service.getConversationList,
    eventName: 'getConversationList',
    desc: '获取会话列表',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/getall/web.html',
    params: [
      { name: '数量', type: 'number', value: 1000 },
      { name: 'channelId', type: 'string', value: '' },
    ]
  };

  var removeConversation = {
    name: '删除会话列表',
    event: Service.removeConversation,
    eventName: 'removeConversation',
    desc: '删除会话列表',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/clearall/web.html',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var getConversation = {
    name: '获取指定会话',
    event: Service.getConversation,
    eventName: 'getConversation',
    desc: '获取会话列表',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/conversation/remove/',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var getHistoryMessages = {
    name: '获取历史消息',
    event: Service.getHistoryMessages,
    eventName: 'getHistoryMessages',
    desc: '获取历史消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/storage/web.html',
    params: [
      { name: '时间戳', type: 'number', value: 0 },
      { name: '数量', type: 'number', value: 20 },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' },
      { name: 'order', type: 'number', value: 0 }
    ]
  };

  var getRemoteHistoryMessages = {
    name: '获取远端历史消息(仅PC)',
    event: Service.getRemoteHistoryMessages,
    eventName: 'getRemoteHistoryMessages',
    desc: '获取远端历史消息',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/message-list/get-list',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '时间戳', type: 'number', value: 0 },
      { name: '数量', type: 'number', value: 20 },
      { name: 'channelId', type: 'string', value: '' },
      { name: 'order', type: 'number', value: 0 }
    ]
  };

  var deleteRemoteMessages = {
    name: '删除历史消息(按消息)',
    event: Service.deleteRemoteMessages,
    eventName: 'deleteRemoteMessages',
    desc: '按消息删除指定历史消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/delete/web.html#deletebyid',
    params: [
      { name: '消息 Uid', type: 'string', value: '', event: Service.getLastCacheMsgUId },
      { name: '发送时间', type: 'number', value: 0, event: Service.getLastCacheMsgSentTime },
      { name: '消息方向', type: 'number', value: 1, event: Service.getLastCacheMsgDirection },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var clearHistoryMessages = {
    name: '删除历史消息(按时间)',
    event: Service.clearHistoryMessages,
    eventName: 'clearRemoteHistoryMessages',
    desc: '按时间删除历史消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/delete/web.html#delete',
    params: [
      { name: '删除时间戳', type: 'number', value: Date.now()  },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var sendTextMessage = {
    name: '发送文字消息',
    event: Service.sendTextMessage,
    eventName: 'sendMessage',
    desc: '发送文字消息(TextMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#TxtMsg',
    params: [
      { name: '文字内容', type: 'string', value: '我是一条文字消息' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false },
      { name: '消息扩展', type: 'boolean', value: false },
      { name: '消息扩展 key', type: 'string', value: '多个以逗号分隔' },
      { name: '消息扩展 value', type: 'string', value: '多个以逗号分隔' },
      { name: '定向用户 Ids', type: 'string', value: ''},
      { name: 'channelId', type: 'string', value: '' },
      { name: '推送标题', type: 'string', value: '推送标题'},
      { name: '推送内容', type: 'string', value: '推送内容'},
      { name: '推送附加信息', type: 'string', value: '推送附加信息'},
      { name: 'iOS 禁用推送标题', type: 'boolean', value: false},
      { name: '是否强制推送', type: 'boolean', value: false},
      { name: 'iOS 通知分组 ID', type: 'string', value: 'threadId'},
      { name: 'iOS 通知覆盖 ID', type: 'string', value: 'apnsCollapseId'},
      { name: 'iOS 通知类型', type: 'string', value: 'RC:TxtMsg'},
      { name: 'iOS 通知richMediaUri', type: 'string', value: 'richMediaUri'},
      { name: 'Android 通知 ID', type: 'string', value: ''},
      { name: '小米 ChannelId', type: 'string', value: 'channelIdMi'},
      { name: '华为 ChannelId', type: 'string', value: 'channelIdHW'},
      { name: 'OPPO ChannelId', type: 'string', value: 'channelIdOPPO'},
      { name: 'VIVO 类型', type: 'string', value: 'typeVivo'},
      { name: 'FCM 通知分组 ID', type: 'string', value: 'collapse_key'},
      { name: 'FCM imageUrl', type: 'string', value: 'imageUrl'},
      { name: '推送模板id', type: 'string', value: 'templateId'},
    ]
  };

  var sendImageMessage = {
    name: '发送图片消息',
    event: Service.sendImageMessage,
    eventName: 'sendMessage',
    desc: '发送图片消息(ImageMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#ImgTextMsg',
    params: [
      { name: '缩略图', type: 'string', value: utils.getBase64Image() },
      { name: '原图 url', type: 'string', value: 'http://rongcloud.cn/images/newVersion/log_wx.png' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  };

  var sendFileMessage = {
    name: '发送文件消息',
    event: Service.sendFileMessage,
    eventName: 'sendMessage',
    desc: '发送文件消息(FileMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#FileMsg',
    params: [
      { name: '文件名', type: 'string', value: 'logo_wx' },
      { name: '文件大小', type: 'number', value: 2000000000 },
      { name: '文件类型', type: 'string', value: 'png' },
      { name: '文件 url', type: 'string', value: 'http://rongcloud.cn/images/newVersion/log_wx.png' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  };

  var sendVoiceMessage = {
    name: '发送语音消息',
    event: Service.sendVoiceMessage,
    eventName: 'sendMessage',
    desc: '发送语音消息(HQVoiceMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#HQVCMsg',
    params: [
      { name: '语音 url', type: 'string', value: 'https://rongcloud-audio.cn.ronghub.com/audio_amr__RC-2020-03-17_42_1584413950049.aac?e=1599965952&token=CddrKW5AbOMQaDRwc3ReDNvo3-sL_SO1fSUBKV3H:CDngyWj7ZApNmAfoecng7L_3SaU=' },
      { name: '语音时长', type: 'number', value: 7 },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  };

  var sendRecallMessage = {
    name: '发送撤回消息',
    event: Service.sendRecallMessage,
    eventName: 'sendRecallMessage',
    desc: '发送撤回消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgrecall/web.html',
    params: [
      { name: '消息 Uid', type: 'string', value: '', event: Service.getLastCacheMsgUId },
      { name: '发送时间', type: 'number', value: 0, event: Service.getLastCacheMsgSentTime },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false },
      { name: '推送标题', type: 'string', value: '推送标题'},
      { name: '推送内容', type: 'string', value: '推送内容'},
      { name: '推送附加信息', type: 'string', value: '推送附加信息'},
      { name: 'iOS 禁用推送标题', type: 'boolean', value: false},
      { name: '是否强制推送', type: 'boolean', value: false},
      { name: 'iOS 通知分组 ID', type: 'string', value: 'threadId'},
      { name: 'iOS 通知覆盖 ID', type: 'string', value: 'apnsCollapseId'},
      { name: 'iOS 通知类型', type: 'string', value: 'RC:TxtMsg'},
      { name: 'iOS 通知richMediaUri', type: 'string', value: 'richMediaUri'},
      { name: 'Android 通知 ID', type: 'string', value: ''},
      { name: '小米 ChannelId', type: 'string', value: 'channelIdMi'},
      { name: '华为 ChannelId', type: 'string', value: 'channelIdHW'},
      { name: 'OPPO ChannelId', type: 'string', value: 'channelIdOPPO'},
      { name: 'VIVO 类型', type: 'string', value: 'typeVivo'},
      { name: 'FCM 通知分组 ID', type: 'string', value: 'collapse_key'},
      { name: 'FCM imageUrl', type: 'string', value: 'imageUrl'},
      { name: '推送模板id', type: 'string', value: 'templateId'},

    ]
  };

  var sendAtMessage = {
    name: '发送 @ 消息',
    event: Service.sendAtMessage,
    eventName: 'sendMessage',
    desc: '发送 @ 消息',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web.html#at',
    params: [
      { name: '文字内容', type: 'string', value: '我是一条文本消息, 我 @ 了其他人' },
      { name: '@ 对象 id', type: 'string', value: config.targetId },
      { name: '会话类型', type: 'number', value: 3 },
      { name: '群组 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false }

    ]
  };

  var sendRegisterMessage = {
    name: '发送自定义消息',
    event: Service.sendRegisterMessage,
    eventName: 'sendMessage',
    desc: '发送自定义消息(RegisterMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web.html#send',
    params: [
      { name: '消息类型', type: 'string', value: 'PersonMessage' },
      { name: '属性值', type: 'string', value: 'name,age' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  };

  var sendLocationMessage = {
    name: '发送位置消息',
    event: Service.sendLocationMessage,
    eventName: 'sendMessage',
    desc: '发送位置消息(sendLocationMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web.html#LBSMsg',
    params: [
      { name: '位置缩略图', type: 'string', value: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABsSFBcUERsXFhceHBsgKE' },
      { name: '维度', type: 'number', value: 40.0317727 },
      { name: '经度', type: 'number', value: 116.4175057 },
      { name: '位置信息', type: 'string', value: '北苑路北辰·泰岳' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  };

  var sendRichContentMessage = {
    name: '发送富文本消息',
    event: Service.sendRichContentMessage,
    eventName: 'sendMessage',
    desc: '发送富文本(图文)消息(sendRichContentMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web.html#ImgTextMsg',
    params: [
      { name: '图文标题', type: 'string', value: '标题: 融云' },
      { name: '图文内容', type: 'string', value: '为用户提供 IM 即时通讯和音视频通讯云服务' },
      { name: '图片信息', type: 'string', value: 'https://www.rongcloud.cn/images/newVersion/log_wx.png' },
      { name: '图文链接', type: 'string', value: 'https://developer.rongcloud.cn' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  };

  var sendTypingStatusMessage = {
    name: '发送正在输入状态消息',
    event: Service.sendTypingStatusMessage,
    eventName: 'sendTypingStatusMessage',
    desc: '发送正在输入状态消息(sendTypingStatusMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/msgmanage/msgsend/web.html#TypSts',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息 ObjectName', type: 'string', value: 'RC:TxtMsg' },
      { name: '携带信息', type: 'string', value: '携带信息' },
      { name: '静默消息', type: 'boolean', value: false }
    ]
  };

  var sendReceiptRequestMessage = {
    name: '发送回执请求消息',
    event: Service.sendReceiptRequestMessage,
    eventName: 'sendMessage',
    desc: '发送回执请求消息(sendMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#TypSts',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'messageUId', type: 'string', value: '' }
    ]
  };

  var sendGIFMessage = {
    name: '发送 GIF 消息',
    event: Service.sendGIFMessage,
    eventName: 'sendGIFMessage',
    desc: '发送GIF消息(sendGIFMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#TypSts',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'gifDataSize', type: 'number', value: '66406' },
      { name: 'remoteUrl', type: 'string', value: 'https://rongcloud-image.cn.ronghub.com/image%2Fjpeg__RC-2020-08-27_8691_1598525784771?e=1614077785&token=livk5rb3__JZjCtEiMxXpQ8QscLxbNLehwhHySnX:NOCwaCQVKsI4FDyOiSIqZ4JCc00=' },
      { name: 'width', type: 'number', value: '293' },
      { name: 'height', type: 'number', value: '220' },
      { name: '扩展内容', type: 'string', value: '这是扩展内容' },
    ]
  };

  var sendSightMessage = {
    name: '发送小视频消息',
    event: Service.sendSightMessage,
    eventName: 'sendSightMessage',
    desc: '发送小视频消息(sendSightMessage)',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/msgmanage/msgsend/web.html#SightMsg',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'sightUrl', type: 'string', value: 'https://rongcloud-sight.ronghub.com/video%2Fmpeg4__RC-2020-08-27_1273_1598526477736.mp4?e=1614078478&token=CddrKW5AbOMQaDRwc3ReDNvo3-sL_SO1fSUBKV3H:gNDqYj26xfBvl6isug6mQlTbQHY=' },
      { name: 'content', type: 'string', value: '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' },
      { name: 'duration', type: 'string', value: '1' },
      { name: 'size', type: 'string', value: '171237' },
      { name: 'name', type: 'string', value: 'video_1598526477469.mp4' },
      { name: '扩展内容', type: 'string', value: '这是扩展内容' },
    ]
  };

  var sendCombineMessage = {
    name: '发送合并转发消息',
    event: Service.sendCombineMessage,
    eventName: 'sendCombineMessage',
    desc: '发送合并转发消息(sendCombineMessage)',
    doc: 'https://docs.rongcloud.cn/im/introduction/message_structure/#CombineMessage',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'nameList', type: 'string', value: 'namefcyKzDTEF, kdsdsw' },
      { name: 'remoteUrl', type: 'string', value: 'https://rongcloud-html-cn.ronghub.com/text%2Fhtml__RC-2020-08-27_9795_1598528235937?e=1614080236&token=CddrKW5AbOMQaDRwc3ReDNvo3-sL_SO1fSUBKV3H:X2W2DnUfnLq-XCv8lZtSFKTT8LQ=' },
      { name: 'summaryList', type: 'string', value: 'namefcyKzDTEF,那个????：[动态表情]' },
      { name: '扩展内容', type: 'string', value: '这是扩展内容' }
    ]
  };

  var sendTypingMessage = {
    name: '发送typing消息',
    event: Service.sendTypingMessage,
    eventName: 'sendTypingMessage',
    desc: '发送typing消息(sendTypingMessage)',
    doc: 'https://docs.rongcloud.cn/im/introduction/message_structure/#CombineMessage',
    params: [
      { name: '会话类型', type: 'number', value: 3 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' },
      { name: 'typing内容类型', type: 'string', value: 'RC:TxtMsg' }
    ]
  };


  var sendReferenceMessage = {
    name: '发送引用消息',
    event: Service.sendReferenceMessage,
    eventName: 'sendReferenceMessage',
    desc: '发送Reference消息(sendReferenceMessage)',
    doc: 'https://docs.rongcloud.cn/im/introduction/message_structure/#CombineMessage',
    params: [
      { name: '引用消息内容', type: 'string', value: '' },
      { name: '引用消息用户 ID', type: 'string', value: '' },
      { name: '引用消息类型', type: 'string', value: 'RC:TxtMsg' },
      { name: '消息内容', type: 'string', value: '为用户提供 IM 即时通讯和音视频通讯云服务' },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' },
    ]
  };

  var sendReadReceiptRequestMessage = {
    name: '发送群回执请求消息',
    event: Service.sendReadReceiptRequestMessage,
    eventName: 'sendMessage',
    desc: '发送群回执请求消息(sendReadReceiptRequestMessage)，',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/msgmanage/receipt/web.html',
    params: [
      { name: '会话类型', type: 'number', value: 3 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息 UId', type: 'string', value: '' }
    ]
  };

  var sendReadReceiptResponseMessage = {
    name: '发送群回执响应消息',
    event: Service.sendReadReceiptResponseMessage,
    eventName: 'sendMessage',
    desc: '发送群回执响应消息(sendReadReceiptResponseMessage), 导航开关grpRRVer为 0 可用',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/msgmanage/receipt/web.html',
    params: [
      { name: '会话类型', type: 'number', value: 3 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息 UId', type: 'string', value: '' },
      { name: '请求用户ID', type: 'string', value: '' },
    ]
  };

  var sendNewReadReceiptResponseMessage = {
    name: '（新）发送群回执响应消息',
    event: Service.sendNewReadReceiptResponseMessage,
    eventName: 'sendMessage',
    desc: '（新）发送群回执响应消息(sendNewReadReceiptResponseMessage), 导航开关grpRRVer为 1 可用',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/msgmanage/receipt/web.html',
    params: [
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息 UId(用‘,’分隔传多个)', type: 'string', value: '' },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var getMessageReader = {
    name: '获取已读列表',
    event: Service.getMessageReader,
    eventName: 'getMessageReader',
    desc: '获取已读列表(getMessageReader), 当导航开关为1时可用',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/msgmanage/receipt/web.html',
    params: [
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息 UId', type: 'string', value: '' },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var sendSyncReadStatusMessage = {
    name: '发送多端同步未读数',
    event: Service.sendSyncReadStatusMessage,
    eventName: 'sendSyncReadStatusMessage',
    desc: '清除本地会话未读数后调用该方法向其他端同步(sendSyncReadStatusMessage)',
    doc: 'https://docs.rongcloud.cn/v2/views/im/noui/guide/group/conversation/unreadcount/web.html#clearUnreadCount',
    params: [
      { name: '会话类型', type: 'number', value: 3 },
      { name: '会话id', type: 'string', value: 'group001' },
      { name: 'channelId', type: 'string', value: '' },
      { name: '时间（通知其他端该时间之前消息为已读, 使用message.sentTime）', type: 'number', value: '' }
    ]
  };

  var getUnreadCount = {
    name: '获取会话未读数',
    event: Service.getUnreadCount,
    eventName: 'getUnreadCount',
    desc: '获取指定会话未读数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web.html#one',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var getTotalUnreadCount = {
    name: '获取会话未读数总数',
    event: Service.getTotalUnreadCount,
    eventName: 'getTotalUnreadCount',
    desc: '获取会话未读总数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web.html',
    params: [
      { name: '会话类型(用‘,’分隔传多个)', type: 'string', value: '' },
      { name: '是否包含免打扰', type: 'boolean', value: true },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var clearUnreadCount = {
    name: '清除指定会话未读数',
    event: Service.clearUnreadCount,
    eventName: 'clearUnreadCount',
    desc: '清除指定会话未读数',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web.html#clear',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var clearAllUnreadCount = {
    name: '清除全部会话未读数',
    event: Service.clearAllUnreadCount,
    eventName: 'clearAllUnreadCount',
    desc: '清除全部会话未读数',
    doc: 'http://doc.rongcloud.cn/im/Web/2.X/guide/private/conversation/unreadcount/web#clearparams',
    params: []
  };

  var joinChatRoom = {
    name: '加入聊天室',
    event: Service.joinChatRoom,
    eventName: 'joinChatRoom',
    desc: '加入指定聊天室, 并拉取消息',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#join',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId },
      { name: '拉取消息数', type: 'number', value: 2 },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var quitChatRoom = {
    name: '退出聊天室',
    event: Service.quitChatRoom,
    eventName: 'quitChatRoom',
    desc: '退出聊天室',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#quit',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  };

  var getChatRoomInfo = {
    name: '获取聊天室信息',
    event: Service.getChatRoomInfo,
    eventName: 'getChatRoomInfo',
    desc: '获取聊天室信息',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#get',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId },
      { name: '获取人数', type: 'number', value: 20 },
      { name: '排序方式', type: 'number', value: 1 }
    ]
  };

  var setChatroomEntry = {
    name: '设置聊天室属性',
    event: Service.setChatroomEntry,
    eventName: 'setChatroomEntry',
    desc: '设置聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#_1',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey1' },
      { name: '属性 value', type: 'string', value: '我是一个聊天室 value' },
      { name: '是否退出清除', type: 'boolean', value: true },
      { name: '是否发送消息', type: 'boolean', value: true },
      { name: '附加信息', type: 'string', value: '我是消息中的附加信息' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  };

  var forceSetChatroomEntry = {
    name: '设置聊天室属性(强制)',
    event: Service.forceSetChatroomEntry,
    eventName: 'forceSetChatroomEntry',
    desc: '强制设置聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#_2',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey2' },
      { name: '属性 value', type: 'string', value: '我是一个聊天室 value' },
      { name: '是否退出清除', type: 'boolean', value: true },
      { name: '是否发送消息', type: 'boolean', value: true },
      { name: '附加信息', type: 'string', value: '我是消息中的附加信息' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  };

  var removeChatroomEntry = {
    name: '删除聊天室属性',
    event: Service.removeChatroomEntry,
    eventName: 'removeChatroomEntry',
    desc: '删除聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#_3',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey1' },
      { name: '是否发送消息', type: 'boolean', value: true },
      { name: '附加信息', type: 'string', value: '我是消息中的附加信息' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  };

  var forceRemoveChatroomEntry = {
    name: '删除聊天室属性(强制)',
    event: Service.forceRemoveChatroomEntry,
    eventName: 'forceRemoveChatroomEntry',
    desc: '强制删除聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#_4',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey2' },
      { name: '是否发送消息', type: 'boolean', value: true },
      { name: '附加信息', type: 'string', value: '我是消息中的附加信息' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  };

  var getChatroomEntry = {
    name: '获取聊天室属性',
    event: Service.getChatroomEntry,
    eventName: 'getChatroomEntry',
    desc: '获取指定聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#_5',
    params: [
      { name: '属性 key', type: 'string', value: 'chrmKey1' },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  };

  var getAllChatroomEntries = {
    name: '获取聊天室属性(所有)',
    event: Service.getAllChatroomEntries,
    eventName: 'getAllChatroomEntries',
    desc: '获取所有聊天室自定义属性',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/chatroom/#_6',
    params: [
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  };

  var sendChatroomMessage = {
    name: '发送聊天室消息',
    event: Service.sendChatroomMessage,
    eventName: 'sendMessage',
    desc: '发送聊天室消息, 以文本消息为例(TextMessage)',
    doc: 'https://docs.rongcloud.cn/im/imlib/web/message-send/#example',
    params: [
      { name: '文字内容', type: 'string', value: '我是一条聊天室的文字消息' },
      { name: '会话类型', type: 'number', value: 4 },
      { name: '聊天室 id', type: 'string', value: config.targetId }
    ]
  };

  var setConversationStatus = {
    name: '设置会话状态',
    event: Service.setConversationStatus,
    eventName: 'setConversationStatus',
    desc: '设置会话状态',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '免打扰', type: 'number', value: 1 },
      { name: '置顶', type: 'boolean', value: true },
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var updateMessageExpansion = {
    name: '设置消息扩展存储',
    event: Service.updateMessageExpansion,
    eventName: 'updateMessageExpansion',
    desc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '消息 Uid', type: 'string', value: '', event: Service.getLastCacheMsgUId },
      { name: 'key', type: 'string', value: '多个以逗号区分', event: Service.getLastCacheMsgUId },
      { name: 'value', type: 'string', value: '多个以逗号区分', event: Service.getLastCacheMsgUId },
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
      { name: '要移除的 keys', type: 'string', value: '', value: '' },
      { name: '消息 Uid', type: 'string', value: '', event: Service.getLastCacheMsgUId },
    ]
  }

  var getChatRoomHistoryMessages = {
    name: '获取聊天室历史消息',
    event: Service.getChatRoomHistoryMessages,
    eventName: 'getChatRoomHistoryMessages',
    desc: '',
    params: [
      { name: '聊天室 ID', type: 'string', value: config.targetId },
      { name: '获取数量', type: 'number', value: 20 },
      { name: '获取顺序', type: 'number', value: 0 }
    ]
  }

  var setDraft = {
    name: '设置会话草稿',
    event: Service.setDraft,
    eventName: 'setDraft',
    desc: '设置会话草稿',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clearcode',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '草稿内容', type: 'string', value: '这是会话草稿' },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var getDraft = {
    name: '获取会话草稿',
    event: Service.getDraft,
    eventName: 'setDraft',
    desc: '获取会话草稿',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clearcode',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '这是会话草稿' }
    ]
  };

  var deleteDraft = {
    name: '清除会话草稿',
    event: Service.deleteDraft,
    eventName: 'deleteDraft',
    desc: '清除会话草稿',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/group/conversation/unreadcount/web3.html#clearcode',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  };

  var getConversationUnreadCount = {
    name: '按会话类型获取会话未读数',
    event: Service.getConversationUnreadCount,
    eventName: 'getConversationUnreadCount',
    desc: '按会话类型获取会话未读数（应用层兼容）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '会话类型', type: 'string', value: '1,3' },
    ]
  };

  var clearConversations = {
    name: '按会话类型清除会话(仅PC)',
    event: Service.clearConversations,
    eventName: 'clearConversations',
    desc: '按会话类型清除会话（应用层兼容）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '会话类型', type: 'string', value: '1,3' }
    ]
  };

  var clearTotalUnreadCount = {
    name: '清除所有会话未读数',
    event: Service.clearTotalUnreadCount,
    eventName: 'clearTotalUnreadCount',
    desc: '清除所有会话未读数（应用层兼容）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [

    ]
  };

  var sendReceiptResponse = {
    name: 'sendReceiptResponse',
    event: Service.sendReceiptResponse,
    eventName: 'sendReceiptResponse',
    desc: '设置会话状态',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId }
    ]
  };

  var insertMessage = {
    name: '向本地插入消息(仅PC)',
    event: Service.insertMessage,
    eventName: 'insertMessage',
    desc: '向本地插入消息',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: '对方 id', type: 'string', value: config.targetId },
      { name: '发送方 id', type: 'string', value: '' },
      { name: '消息类型', type: 'string', value: 'RC:TxtMsg' },
      { name: '消息内容', type: 'string', value: '消息内容' },
      { name: '消息方向', type: 'number', value: 1 },
      { name: 'channelId', type: 'string', value: '' }
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
      { name: 'channelId', type: 'string', value: '' }
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
      { name: 'channelId', type: 'string', value: '' }
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
      { name: 'channelId', type: 'string', value: '' }
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
      { name: 'channelId', type: 'string', value: '' }
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
      { name: 'channelId', type: 'string', value: '' },
    ]
  }

  var clearConversations = {
    name: '通过会话类型删除会话(仅PC)',
    event: Service.clearConversations,
    eventName: 'clearConversations',
    desc: '通过会话类型删除会话',
    doc: '',
    params: [
      { name: '会话类型', type: 'string', value: '1,2,3' },
      { name: 'channelId', type: 'string', value: '' }
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
      { name: 'channelId', type: 'string', value: '' },
    ]
  }

  var getConversationNotificationStatus = {
    name: '获取会话免打扰状态(仅PC)',
    event: Service.getConversationNotificationStatus,
    eventName: 'getConversationNotificationStatus',
    desc: '获取会话免打扰状态',
    doc: '',
    params: [
      { name: '会话类型', type: 'number', value: 1 },
      { name: 'targetId', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' }
    ]
  }

  var createTag = {
    name: '创建标签',
    event: Service.createTag,
    eventName: 'createTag',
    desc: '创建标签',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001'},
      { name: '标签名称', type: 'string', value: '热门'},
    ]
  }

  var updateTag = {
    name: '修改标签',
    event: Service.updateTag,
    eventName: 'updateTag',
    desc: '修改标签',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001'},
      { name: '标签名称', type: 'string', value: '热门修改啦'},
    ]
  }

  var removeTag = {
    name: '删除标签',
    event: Service.removeTag,
    eventName: 'removeTag',
    desc: '删除标签',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001'},
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

  var addTagForConversations = {
    name: '添加会话到指定标签',
    event: Service.addTagForConversations,
    eventName: 'addTagForConversations',
    desc: '添加会话到指定标签（“多个会话”有值时会忽略单个会话，确保数据结构正确，数据结构为：[{"targetId": "'+config.targetId+'","type": 1,"channelId": ""}]）',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001'},
      { name: '会话id', type: 'string', value: config.targetId},
      { name: '会话类型', type: 'number', value: 1},
      { name: 'channelId', type: 'string', value: ''},
      { name: '多个会话', type: 'string', value: ''},
    ]
  }

  var removeTagForConversations = {
    name: '从多个会话中批量删除指定标签',
    event: Service.removeTagForConversations,
    eventName: 'removeTagForConversations',
    desc: '从多个会话中批量删除指定标签（“多个会话”有值时会忽略单个会话，确保数据结构正确，数据结构为：[{"targetId": "'+config.targetId+'","type": 1,"channelId": ""}]）',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001'},
      { name: '会话id', type: 'string', value: config.targetId},
      { name: '会话类型', type: 'number', value: 1},
      { name: 'channelId', type: 'string', value: ''},
      { name: '多个会话', type: 'string', value: ''},
    ]
  }

  var removeTagsForConversation = {
    name: '从单一会话中批量删除标签',
    event: Service.removeTagsForConversation,
    eventName: 'removeTagsForConversation',
    desc: '从单一会话中批量删除标签',
    doc: '',
    params: [
      { name: '标签id(多个以,隔开)', type: 'string', value: 'tag_id_001'},
      { name: '会话id', type: 'string', value: config.targetId},
      { name: '会话类型', type: 'number', value: 1},
      { name: 'channelId', type: 'string', value: ''},
    ]
  }

  var getConversationListByTag = {
    name: '分页获取标签下会话列表',
    event: Service.getConversationListByTag,
    eventName: 'getConversationListByTag',
    desc: 'web端count含义和协议栈不一样，代表从前count数量中查找携带该标签的会话',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001'},
      { name: 'count', type: 'number', value: 20},
      { name: 'startTime', type: 'number', value: 0},
    ]
  }

  var getUnreadCountByTag = {
    name: '根据标签获取未读消息数',
    event: Service.getUnreadCountByTag,
    eventName: 'getUnreadCountByTag',
    desc: '根据标签获取未读消息数',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001'},
      { name: '是否包含免打扰', type: 'boolean', value: false},
    ]
  }

  var setConversationStatusInTag = {
    name: '设置标签中会话置顶',
    event: Service.setConversationStatusInTag,
    eventName: 'setConversationStatusInTag',
    desc: '设置标签中会话置顶',
    doc: '',
    params: [
      { name: '标签id', type: 'string', value: 'tag_id_001'},
      { name: '会话id', type: 'string', value: config.targetId},
      { name: '会话类型', type: 'number', value: 1},
      { name: 'channelId', type: 'string', value: ''},
      { name: '是否置顶', type: 'boolean', value: true},
    ]
  }

  var getTagsForConversation = {
    name: '获取会话下的标签',
    event: Service.getTagsForConversation,
    eventName: 'getTagsForConversation',
    desc: '获取会话下的标签',
    doc: '',
    params: [
      { name: '会话id', type: 'string', value: config.targetId},
      { name: '会话类型', type: 'number', value: 1},
      { name: 'channelId', type: 'string', value: ''},
    ]
  }

  var getFirstUnreadMessage = {
    name: '获取第一个未读消息(仅PC)',
    event: Service.getFirstUnreadMessage,
    eventName: 'getFirstUnreadMessage',
    desc: '获取第一个未读消息（cpp专属）',
    doc: 'https://docs.rongcloud.cn/v3/views/im/noui/guide/private/conversation/notify/web.html',
    params: [
      { name: '会话类型', type: 'number', value: '1' },
      { name: '会话id', type: 'string', value: config.targetId },
      { name: 'channelId', type: 'string', value: '' },
    ]
  };

  var getServerTime = {
    name: '获取服务器时间',
    event: Service.getServerTime,
    eventName: 'getServerTime',
    desc: '获取服务器时间',
    doc: '',
    params: []
  };

  var setMessageReceivedStatus = {
    name: '设置消息的接受状态(仅PC)',
    event: Service.setMessageReceivedStatus,
    eventName: 'setMessageReceivedStatus',
    desc: '设置消息的接受状态',
    doc: '',
    params: [
      { name: 'messageId', type: 'number', value: 1 },
      { name: '接受状态', type: 'number', value: 1 },
    ]
  };

  win.RongIM = win.RongIM || {};

  var DefailtReadyApiQueue = [
    [disconnect, reconnect, getServerTime],
    [registerMessage, sendRegisterMessage],
    [getConversationList, removeConversation, getConversation, getUnreadCount, getTotalUnreadCount, clearUnreadCount, clearAllUnreadCount, setConversationStatus, setDraft, getDraft, deleteDraft],
    [getConversationUnreadCount, sendSyncReadStatusMessage],
    [createTag, updateTag, getTagList, addTagForConversations, removeTagForConversations, removeTagsForConversation, getConversationListByTag, getUnreadCountByTag, setConversationStatusInTag, getTagsForConversation, removeTag],
    [sendTextMessage, sendImageMessage, sendRecallMessage, sendFileMessage, sendVoiceMessage, sendRegisterMessage, sendAtMessage, sendLocationMessage, sendRichContentMessage, sendTypingStatusMessage, sendReceiptRequestMessage, sendGIFMessage, sendSightMessage, sendCombineMessage, sendTypingMessage, sendReferenceMessage],
    [sendReadReceiptRequestMessage, sendReadReceiptResponseMessage, sendReceiptResponse, sendNewReadReceiptResponseMessage, getMessageReader],
    [getHistoryMessages, getRemoteHistoryMessages, deleteRemoteMessages, clearHistoryMessages, getFirstUnreadMessage],
    [joinChatRoom, getChatRoomInfo, sendChatroomMessage, quitChatRoom],
    [setChatroomEntry, getChatroomEntry, forceSetChatroomEntry, getAllChatroomEntries, removeChatroomEntry, forceRemoveChatroomEntry],
    [updateMessageExpansion, removeMessageExpansion],
    [insertMessage, getLocalMessage, getUnreadMentionedMessage, searchMessageByContent, deleteLocalMessagesByTimestamp, clearMessages],
    [searchConversationByContent, clearConversations, clearUnreadCountByTimestamp, getConversationNotificationStatus]
  ];
  urlQueryConfig.isMini && utils.forEach(DefailtReadyApiQueue, function (list, i) {
    utils.forEach(list, function (item, j) {
      if (MiniUnSupportEventList.indexOf(item.eventName) !== -1) {
        list.splice(j, 1);
      }
    }, { isReverse: true })
  });
  win.RongIM.DefailtReadyApiQueue = DefailtReadyApiQueue;

  win.RongIM.ApiList = [
    getConversationList
  ];

  window.RongIM.Api = {
    changeUser: changeUser
  }

})(window, {
  RongIM: RongIM
});