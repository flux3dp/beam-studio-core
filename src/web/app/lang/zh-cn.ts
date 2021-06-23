import { ILang } from 'interfaces/ILang';

export default {
  general: {
    wait: '处理中，请稍待',
    choose_folder: '选择档案夹',
  },
  buttons: {
    next: '下一步',
  },
  topbar: {
    untitled: '无标题',
    titles: {
      settings: '偏好设定',
    },
    export: 'GO',
    preview: '相机预览',
    borderless: '(开盖模式)',
    tag_names: {
      rect: '矩形',
      ellipse: '椭圆',
      path: '路径',
      polygon: '多边形',
      image: '影像',
      text: '文本',
      line: '線段',
      g: '群组',
      multi_select: '多个物件',
      use: '汇入物件',
      svg: 'SVG 物件',
      dxf: 'DXF 物件',
    },
    alerts: {
      start_preview_timeout: '#803 启动相机预览时超时，请重新开启您的机器或是 Beam Studio ，如果此错误持续发生，请参考<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/360001111355">此则引导</a>。',
      fail_to_start_preview: '#803 启动相机预览失败，请重新开启您的机器或是 Beam Studio，如果此错误持续发生，请参考<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/360001111355">此则引导</a>。',
      fail_to_connect_with_camera: '#803 与机器相机建立连线时失败，请重新开启您的机器或是 Beam Studio ，如果此错误持续发生，请参考<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/360001111355">此則引導</a>。',
      power_too_high: '功率过高',
      power_too_high_msg: '激光管在高功率（70％ 以上）下耗损较快，使用低功率可以延长雷试管使用寿命。\n输入「知道了」以继续。',
      power_too_high_confirm: '知道了',
    },
    hint: {
      polygon: '按下 + / - 键以增加 / 减少边数。',
    },
    menu: {
      preferences: '偏好设定',
      hide: '隐藏 Beam Studio',
      hideothers: '隐藏其他',
      service: '服务',
      quit: '离开',
      window: '视窗',
      minimize: '最小化',
      close: '关闭视窗',
      file: '档案',
      edit: '编辑',
      help: '说明',
      open: '打开',
      recent: '最近使用',
      samples: '范例',
      import_hello_beamo: 'beamo 范例',
      import_hello_beambox: 'Beambox 范例',
      import_material_testing_old: '材质雕刻测试 - 经典',
      import_material_testing_simple_cut: '材质切割测试 - 简易',
      import_material_testing_cut: '材质切割测试档',
      import_material_testing_engrave: '材质雕刻测试',
      import_material_testing_line: '材质线段测试',
      import_acrylic_focus_probe: '压克力对焦尺 - 3mm',
      export_to: '汇出成...',
      export_flux_task: 'FLUX 工作',
      export_BVG: 'BVG',
      export_SVG: 'SVG',
      export_PNG: 'PNG',
      export_JPG: 'JPG',
      save_scene: '储存',
      save_as: '另存新档',
      about_beam_studio: '关于 Beam Studio',
      undo: '复原',
      redo: '重做',
      cut: '剪下',
      copy: '复制',
      paste: '贴上',
      paste_in_place: '粘贴到原位置',
      group: '群組化',
      ungroup: '解散群組',
      delete: '删除',
      duplicate: '重製',
      offset: '位移複製',
      scale: '縮放',
      rotate: '旋轉',
      reset: '重設',
      align_center: '置中',
      photo_edit: '影像',
      svg_edit: 'SVG',
      path: '路径',
      decompose_path: '解散非连续路径',
      optimization: '最佳化',
      object: '物件',
      layer_setting: '图层',
      layer_color_config: '颜色设定',
      image_sharpen: '鋭化',
      image_crop: '裁剪',
      image_invert: '色彩反转',
      image_stamp: '生成印章斜角',
      image_vectorize: '向量化',
      image_curve: '曲线',
      arrangement_optimization: '排列最佳化',
      align_to_edges: '贴齐端点',
      document_setting: '文件设定',
      clear_scene: '清除场景',
      machines: '机器',
      add_new_machine: '新增或设定机器',
      help_center: '说明中心',
      show_start_tutorial: '显示新手教学',
      show_ui_intro: '显示界面介绍',
      questionnaire: '问卷回馈',
      change_logs: '更新日志',
      contact: '联络我们',
      tutorial: 'Delta Family 打印教学',
      forum: '社群论坛',
      software_update: '软件更新',
      bug_report: '错误回报',
      dev_tool: '侦错工具',
      dashboard: '仪表版',
      machine_info: '机器资讯',
      network_testing: '检测网路设定',
      toolhead_info: '工具頭資訊',
      change_material: '更換線料',
      run_leveling: '校正平台',
      commands: '指令',
      update_firmware: '韌體更新',
      update_delta: '機器韌體',
      update_toolhead: '工具头资讯',
      using_beam_studio_api: '使用 Beam Studio API',
      set_as_default: '设为预设',
      calibrate_origin: '回归原点',
      calibrate_beambox_camera: '校正相机',
      calibrate_beambox_camera_borderless: '校正相机 (开盖模组）',
      calibrate_diode_module: '校正二极管激光模组',
      movement_test: '执行运动测试',
      turn_on_laser: '打开扫描雷射',
      auto_leveling_clean: '校正平台（清除原始资料）',
      set_toolhead_temperature: '设定列印工具头温度',
      manage_account: '管理我的帐号',
      sign_in: '登入',
      sign_out: '登出',
      account: '帐号',
      my_account: '我的帐号',
      download_log: '汇出机器日志',
      download_log_canceled: '取消日志下载',
      download_log_error: '不明错误发生，请稍候再试一次',
      log: {
        network: 'Network',
        hardware: 'Hardware',
        discover: 'Discover',
        usb: 'USB',
        usblist: 'USB List',
        camera: 'Camera',
        cloud: 'Cloud',
        player: 'Player',
        robot: 'Robot',
      },
      link: {
        help_center: 'https://helpcenter.flux3dp.com/',
        contact_us: 'https://flux3dp.zendesk.com/hc/en-us/requests/new',
        forum: 'https://www.facebook.com/groups/flux.laser/',
        downloads: 'https://flux3dp.com/downloads/',
        beam_studio_api: 'https://github.com/flux3dp/beam-studio/wiki/Beam-Studio-Easy-API',
      },
      view: '检视',
      zoom_in: '放大',
      zoom_out: '缩小',
      fit_to_window: '配合视窗尺寸',
      zoom_with_window: '自动配合视窗尺寸',
      borderless_mode: '开盖模式',
      show_grids: '显示格线',
      show_rulers: '显示尺规',
      show_layer_color: '显示图层颜色',
      anti_aliasing: '抗锯齿',
      disassemble_use: '解散图档',
    },
  },
  support: {
    no_webgl: '您的系统不支持 WebGL，建议您使用其他电脑开启 Mozu Studio',
    no_vcredist: '请安装 Visual C++ Redistributable 2015<br/>可以在flux3dp.com找到',
  },
  generic_error: {
    UNKNOWN_ERROR: '[UE] 请重启 Beam Studio',
    OPERATION_ERROR: '[OE] 机器发生状态冲突，请再试一次',
    SUBSYSTEM_ERROR: '[SE] 固件执行雕刻程序错误，请尝试重新启动机器',
    UNKNOWN_COMMAND: '[UC] 请更新机器固件',
    RESOURCE_BUSY: '[RB] 请重新启动 Delta, 或再试一次',
  },
  device_selection: {
    no_beambox: '#801 我们在网路上找不到您的机器，\n请参考<a target="_blank" href="https://support.flux3dp.com/hc/zh-tw/articles/360001683556">此指南</a>排除连线问题！',
  },
  update: {
    release_note: '版本消息:',
    firmware: {
      caption: '有新的机器固件更新',
      message_pattern_1: '"%s" 有新的固件更新。',
      message_pattern_2: '%s 固件 v%s 可使用 - 你的版本为 v%s.',
      latest_firmware: {
        caption: '固件更新',
        message: '固件已经是最新版本',
        still_update: '文件更新',
        cant_get_latest: '无法取得最新版本固件资讯。',
      },
      confirm: '上传',
      upload_file: '固件上传',
      update_success: '固件更新上传成功',
      update_fail: '#822 更新失败',
    },
    software: {
      checking: '检查更新中',
      switch_version: '版本切换',
      check_update: '检查更新',
      caption: 'Beam Studio 有新的软件更新',
      downloading: '正在背景下载中，您可以按确定以继续您的工作。',
      install_or_not: '已准备好更新，是否重新启动以套用更新？',
      switch_or_not: '已准备完成，是否重新启动以切换？',
      available_update: 'Beam Studio v%s 现可提供下载，你的版本为 v%s，是否要下载更新？',
      available_switch: 'Beam Studio v%s 现可提供切换，你的版本为 v%s，是否要切换至此此版本？',
      not_found: 'Beam Studio 已是最新版本。',
      no_response: '无法连接到伺服器，请确认您目前的网路状态。',
      switch_version_not_found: '無法找到可切換的版本',
      yes: '是',
      no: '否',
    },
    updating: '更新中...',
    skip: '跳过此版本',
    preparing: '准备中...',
    later: '稍候',
    download: '在线更新',
    cannot_reach_internet: '#823 服务器无法连接<br/>请确认网络连接',
    install: '下载',
    upload: '上传',
  },
  topmenu: {
    version: '版本',
    ok: '确定',
    file: {
      label: '文件',
      import: '导入',
      save_fcode: '导出工作',
      save_scene: '导出场景',
      save_svg: '汇出 SVG',
      save_png: '汇出 PNG',
      save_jpg: '汇出 JPG',
      converting: '转换成图片...',
      all_files: '所有文件',
      svg_files: 'SVG',
      png_files: 'PNG',
      jpg_files: 'JPG',
      scene_files: 'Beam Studio 场景',
      fcode_files: 'FLUX Code',
      clear_recent: '清除历史纪录',
      path_not_exit: '此路径似乎已不存在于电脑中，请确认是否有更改档案位置。',
    },
    device: {
      download_log_canceled: '取消日志下载',
      download_log_error: '不明错误发生，请稍候再试一次',
      log: {
        usblist: 'USB 清单',
      },
      network_test: '网路检测',
    },
  },
  initialize: {
    // generic strings
    next: '下一步',
    start: '开始设置',
    skip: '跳过',
    cancel: '取消',
    confirm: '确认',
    connect: '连接',
    back: '返回',
    retry: '重试',
    no_machine: '目前没有机器或已设置过连接，跳过此步骤',

    // specific caption/content
    select_language: '请选择你想使用的语言',
    select_machine_type: '请选择您的机种',
    select_connection_type: '请选择您的连接方式',
    connection_types: {
      wifi: 'Wi-Fi',
      wired: '有线网路',
      ether2ether: '网路线直连',
    },
    connect_wifi: {
      title: '连接 Wi-Fi',
      tutorial1: '1. 到机器控制面板 > 点击 「网路」 > 「设定 Wi-Fi」。',
      tutorial2: '2. 选择并连接您想使用的 Wi-Fi 。',
      what_if_1: '机器找不到我想使用的 Wi-Fi',
      what_if_1_content: '1. Wi-Fi 加密方式需为 WPA2 或无密码。 \n2. 加密方式可由 Wi-Fi 路由器设定，如果路由器不支援 WPA2，可联系客服购买，如果不确定路由器是否支援，可以将型号传给客服询问。',
      what_if_2: '机器找不到任何 Wi-Fi',
      what_if_2_content: '1. 确认您的 Wi-Fi 接收器是否有着实插上。 \n2. 如果面板上没有出现无线网路硬体位置，请联系客服。 \n3. Wi-Fi 频道为 2.4Ghz (不支援 5Ghz)。',
    },
    connect_wired: {
      title: '连接有线网路',
      tutorial1: '1. 请将您的机器以乙太网路线与路由器连接。',
      tutorial2: '2. 在触控面板点击「网路」以获得有线网路 IP 。',
      what_if_1: '机器显示的有线网路 IP 是空的',
      what_if_1_content: '1. 确认您的乙太网路线是否有着实插上。 \n2. 如果面板上没有出现有线网路硬体位置，请联系客服。',
      what_if_2: '机器显示的 IP 开头为 169',
      what_if_2_content: '1. IP 地址为 169.254 开头通常为 DHCP 设定问题，需要联系网路服务提供商或是网路设定者来协助。 \n2. 如果工作环境的网路是由电脑直接 PPPoE 连网，请改由路由器直接 PPPoE 联网，并在路由器中开启DHCP 功能。',
    },
    connect_ethernet: {
      title: '网路线直连',
      tutorial1: '1. 将您的机器与您的电脑以乙太网路线连接。',
      tutorial2_1: '2. 依照',
      tutorial2_a_text: '这篇文章',
      tutorial2_a_href_mac: 'https://support.flux3dp.com/hc/zh-tw/articles/360001517076',
      tutorial2_a_href_win: 'https://support.flux3dp.com/hc/zh-tw/articles/360001507715',
      tutorial2_2: '使您的电脑同时扮演路由器的角色。',
      tutorial3: '3. 點選 下一步。',
    },
    connect_machine_ip: {
      enter_ip: '请输入您的机器 IP',
      check_ip: '确认 IP',
      invalid_ip: 'IP 错误：',
      invalid_format: '格式不符合',
      starts_with_169254: '由 169.254 开头',
      unreachable: '无法连接至指定 IP',
      check_connection: '确认机器连线',
      check_firmware: '确认韧体版本',
      check_camera: '确认相机',
      retry: '重试',
      finish_setting: '结束设定',
    },
    connecting: '连接中',
    setting_completed: {
      start: '开始使用',
      great: '欢迎使用 Beam Studio',
      setup_later: '您可以随时从选单 >「机器」>「新增或设定机器」来设定连线。',
      back: '回到 Wi-Fi 设置',
      ok: '开始使用',
    },
  },
  menu: {
    mm: '毫米',
    inches: '英吋',
  },
  settings: {
    on: '开',
    off: '关',
    low: '低',
    high: '正常',
    caption: '设置',
    tabs: {
      general: '一般',
      device: '机器',
    },
    ip: '机器 IP 位址',
    guess_poke: '自动搜寻机器 IP',
    auto_connect: '自动选择唯一机器',
    wrong_ip_format: 'IP格式错误',
    reset: '重置所有设置',
    default_machine: '默认机器',
    default_machine_button: '无',
    remove_default_machine_button: '删除',
    confirm_remove_default: '将会删除默认机器',
    reset_now: '重置所有设置',
    confirm_reset: '确认要重置 Beam Studio?',
    language: '语言',
    notifications: '显示桌面通知',
    check_updates: '自动检查',
    autosave_enabled: '自动储存',
    autosave_path: '档案夹',
    autosave_interval: '储存间隔',
    autosave_number: '自动储存数',
    autosave_path_not_correct: '找不到指定的路径',
    preview_movement_speed: '相机预览移动速度',
    preview_movement_speed_hl: '相机预览移动速度（二极管激光启用时）',
    default_units: '预设单位',
    default_font_family: '预设字体',
    default_font_style: '预设字型',
    fast_gradient: '速度优化',
    vector_speed_constraint: '限制上限速度 (20 mm/s)',
    loop_compensation: '封闭路径补偿',
    blade_radius: '旋转刀半径',
    blade_precut_switch: '旋转刀预切',
    blade_precut_position: '预切位置',
    default_beambox_model: '预设文件设定',
    guides_origin: '参考线座标',
    guides: '参考线',
    image_downsampling: '点阵图预览品质',
    anti_aliasing: '抗锯齿',
    continuous_drawing: '连续绘制',
    trace_output: '向量化及影像描图输出',
    single_object: '单一物件',
    grouped_objects: '多个物件群组',
    simplify_clipper_path: '路径计算优化',
    mask: '工作范围剪裁',
    text_path_calc_optimization: '路径计算优化',
    font_substitute: '自动替换字体',
    default_borderless_mode: '开盖模式预设',
    default_enable_autofocus_module: '自动对焦预设',
    default_enable_diode_module: '二极管激光预设',
    diode_offset: '二极管激光偏移值',
    share_with_flux: '与 FLUX 分享',
    none: '无',
    close: '关闭',
    enabled: '启用',
    disabled: '不启用',
    cancel: '取消',
    done: '套用',
    groups: {
      general: '一般',
      update: '软体更新',
      connection: '连线',
      autosave: '自动储存',
      camera: '相机',
      editor: '编辑器',
      path: '路径 (线段)',
      engraving: '雕刻 (扫描)',
      mask: '工作范围剪裁',
      text_to_path: '文本',
      modules: '扩充模组',
      privacy: '隐私',
    },
    notification_on: '开启',
    notification_off: '关闭',
    update_latest: '稳定版',
    update_beta: 'Beta',
    help_center_urls: {
      connection: 'https://support.flux3dp.com/hc/en-us/sections/360000302135',
      image_downsampling: 'https://support.flux3dp.com/hc/en-us/articles/360004494995',
      anti_aliasing: 'https://support.flux3dp.com/hc/en-us/articles/360004408956',
      continuous_drawing: 'https://support.flux3dp.com/hc/en-us/articles/360004406496',
      simplify_clipper_path: 'https://support.flux3dp.com/hc/en-us/articles/360004407276',
      fast_gradient: 'https://support.flux3dp.com/hc/en-us/articles/360004496235',
      vector_speed_constraint: 'https://support.flux3dp.com/hc/en-us/articles/360004496495',
      loop_compensation: 'https://support.flux3dp.com/hc/en-us/articles/360004408856',
      mask: 'https://support.flux3dp.com/hc/en-us/articles/360004408876',
      font_substitute: 'https://support.flux3dp.com/hc/en-us/articles/360004496575',
      default_borderless_mode: 'https://support.flux3dp.com/hc/zh-tw/articles/360001104076',
      default_enable_autofocus_module: 'https://support.flux3dp.com/hc/en-us/articles/360001574536',
      default_enable_diode_module: 'https://support.flux3dp.com/hc/en-us/articles/360001568035',
    },
  },
  beambox: {
    tag: {
      g: '群组',
      use: '汇入图档',
      image: '图片',
      text: '文字',
    },
    context_menu: {
      cut: '剪切',
      copy: '复制',
      paste: '粘贴',
      paste_in_place: '粘贴到原位置',
      duplicate: '重製',
      delete: '删除',
      group: '组合',
      ungroup: '取消组合元素',
      move_front: '移至顶部',
      move_up: '向上移动',
      move_down: '向下移动',
      move_back: '移至底部',
    },
    popup: {
      select_import_method: '选择分层方式:',
      touchpad: '触摸板',
      mouse: '鼠标',
      layer_by_layer: '依图层分层',
      layer_by_color: '依颜色分层',
      nolayer: '不分层',
      loading_image: '载入图片中，请稍候...',
      no_support_text: 'Beam Studio 目前不支持由外部导入文本标签，请由矢量绘图软件将文本转成路径后再导入。',
      speed_too_high_lower_the_quality: '在此雕刻分辨率使用过高速度，可能导致渐层雕刻較差品质。',
      too_fast_for_path: '含有路径物件的图层速度过快，可能导致切割时位置误差。\n不建议超过在切割路径时超过 20mm/s。',
      too_fast_for_path_and_constrain: '以下图层： %s\n含有向量路径物件且速度超过 20mm/s，为维持雕刻的精度，向量路径速度将被限制在 20mm/s，您可以在偏好设定解除此限制。',
      both_power_and_speed_too_high: '激光管在高功率下耗损较快，使用低功率可以延长雷试管使用寿命。\n同时在此雕刻分辨率使用过高速度，可能导致渐层雕刻較差品质。',
      should_update_firmware_to_continue: '#814 您的固件版本不支持最新的软件改善。为了更良好的使用经验与雕刻品质，请先更新手机切膜机的固件以继续。 (主菜单 > 机器 > [ Your手机切膜机] > 固件更新)',
      more_than_two_object: '太多物件，只支援两物件操作',
      not_support_object_type: '不支援的物件类型',
      select_first: '请先选取物件以继续',
      select_at_least_two: '请选取两个物件以继续',
      import_file_contain_invalid_path: '#808 汇入的SVG档案中含有不存在的图片路径，请确认档案中所有连结之图片皆存在，或改将图片嵌入档案中。',
      import_file_error_ask_for_upload: '读取 SVG 档时发生错误，是否愿意上传档案回报错误给开发团队？',
      upload_file_too_large: '#819 档案大小过大，请联络客服。',
      successfully_uploaded: '档案已成功上传。',
      upload_failed: '#819 档案上传失败。',
      or_turn_off_borderless_mode: '或是关闭开盖模式',
      svg_1_1_waring: '此档案标示之 SVG 版本为 1.1 版，可能有潜在的不相容风险。',
      svg_image_path_waring: '此档案内含有以路径读取的图片，可能会有读取失败的风险。请在做图汇出 SVG 时，当点阵图相关选项改成嵌入。',
      dxf_version_waring: '此 DXF 档版本非 2013 版，可能有潜在的不相容风险。',
      dont_show_again: '别再显示此提醒',
      convert_to_path_fail: '转换成路径失败。',
      save_unsave_changed: '请问是否要储存未储存的变更，否则变更将会遗失？',
      dxf_bounding_box_size_over: '图像超出工作范围，请在 CAD 软体中将图像放置于原点附近，或确定图档单位是否正确设定。',
      progress: {
        uploading: '上传中',
        calculating: '计算中',
      },
      backend_connect_failed_ask_to_upload: '#802 连接后端程式时持续发生错误，请问您是否要将错误报告上传到云端?',
      pdf2svg: {
        error_when_converting_pdf: '#824 将 PDF 转换成 SVG 时发生错误：',
        error_pdf2svg_not_found: '#825 无法找到 pdf2svg 指令，请使用您的套件管理装置安装 pdf2svg（e.g., "yum install pdf2svg" or "apt-get install pdf2svg"）。',
      },
      ungroup_use: '正要解散外部汇入的 DXF 或是 SVG ，在含有物件较多的情况，可能会需要等一阵子，是否确定解散？',
      vectorize_shading_image: '渐层影像在向量化时将花费较多时间，且容易有杂点，请将影像渐层关闭后再执行。',
      change_workarea_before_preview: '%s 的工作范围与目前设定的工作范围不相符，是否要切换目前的工作范围？',
      bug_report: '错误回报',
      sentry: {
        title: '我们一起让 Beam Studio 变得更好',
        message: '请问您是否同意在遇到错误时将相关资讯自动上传给开发团队？',
      },
      questionnaire: {
        caption: '协助我们填写问卷',
        message: '协助我们填写问券，让产品变得更好。',
        unable_to_get_url: '无法透过网路取得目前最新问卷的连结，请确认您的网路连线状况。',
        no_questionnaire_available: '目前没有可供填写的问卷。',
      },
    },
    zoom_block: {
      fit_to_window: '配合视窗尺寸',
    },
    time_est_button: {
      calculate: '预估时间',
      estimate_time: '预计所需时间：',
    },
    left_panel: {
      unpreviewable_area: '非相机预览范围',
      diode_blind_area: '非雕刻范围',
      borderless_blind_area: '非雕刻范围',
      borderless_preview: '开盖模式相机预览',
      rectangle: '长方形',
      ellipse: '椭圆形',
      line: '线段',
      image: '图片',
      text: '文本',
      label: {
        cursor: '选取',
        photo: '图片',
        text: '文字',
        line: '线段',
        rect: '方块',
        oval: '椭圆',
        polygon: '多边形',
        pen: '钢笔',
        shapes: '图形',
        array: '阵列',
        preview: '相机预览',
        trace: '影像描图',
        end_preview: '结束预览',
        clear_preview: '清除预览',
      },
    },
    right_panel: {
      tabs: {
        layers: '图层',
        objects: '物件',
        path_edit: '路径编辑',
      },
      layer_panel: {
        layer1: '默认图层',
        layer_bitmap: '位图层',
        layer_engraving: '雕刻图层',
        layer_cutting: '切割图层',
        move_elems_to: '移动到：',
        notification: {
          dupeLayerName: '图层名称与现有图层重复，请使用别的名称。',
          newName: '新图层名称',
          enterUniqueLayerName: '请输入一个唯一的图层名称',
          enterNewLayerName: '请输入新的图层名称',
          layerHasThatName: '图层已经采用了该名称',
          QmoveElemsToLayer: '您确定移动所选元素到图层\'%s\'吗?',
        },
        layers: {
          layer: '图层',
          layers: '图层',
          del: '删除图层',
          move_down: '向下移动图层',
          new: '新建图层',
          rename: '重命名图层',
          move_up: '向上移动图层',
          dupe: '复制图层',
          lock: '锁定图层',
          merge_down: '向下合并',
          merge_all: '全部合并',
          merge_selected: '合并选取图层',
          move_elems_to: '移动元素至:',
          move_selected: '移动元素至另一个图层',
        },
      },
      laser_panel: {
        preset_setting: '参数调整（%s）',
        multi_layer: '多个图层',
        parameters: '選擇參數',
        strength: '功率',
        speed: '速度',
        speed_contrain_warning: '矢量路径速度将被限制在 20mm/s，您可以在偏好设定解除此限制。',
        repeat: '运行次数',
        add_on: '扩充模组',
        focus_adjustment: '对焦调整',
        height: '物件高度',
        z_step: '每次递降',
        diode: '二极体雷射',
        times: '次',
        cut: '切割',
        engrave: '雕刻',
        more: '管理',
        delete: '删除',
        reset: '恢复预设',
        sure_to_reset: '这将会重置所有的预设参数，并保留您的自订参数，确定要继续进行吗？',
        apply: '套用',
        cancel: '取消',
        save: '储存参数',
        save_and_exit: '保存并退出',
        name: '名称',
        default: '预设',
        customized: '自订参数清单',
        inuse: '使用中',
        export_config: '汇出参数',
        new_config_name: '新参数名称',
        sure_to_load_config: '将要读取预设参数的排序与使用状况，并覆盖所有同名的自订参数，确定要继续进行吗？',
        custom_preset: '自订',
        various_preset: '多个参数',
        dropdown: {
          parameters: '选择参数',
          save: '新增目前参数',
          export: '汇出参数',
          import: '汇入参数',
          more: '管理',
          mm: {
            wood_3mm_cutting: '木板 - 3mm 切割',
            wood_5mm_cutting: '木板 - 5mm 切割',
            wood_engraving: '木板 - 刻印',
            acrylic_3mm_cutting: '压克力 - 3mm 切割',
            acrylic_5mm_cutting: '压克力 - 5mm 切割',
            acrylic_engraving: '压克力 - 刻印',
            leather_3mm_cutting: '皮革 - 3mm 切割',
            leather_5mm_cutting: '皮革 - 5mm 切割',
            leather_engraving: '皮革 - 刻印',
            fabric_3mm_cutting: '布料 - 3mm 切割',
            fabric_5mm_cutting: '布料 - 5mm 切割',
            fabric_engraving: '布料 - 刻印',
            rubber_bw_engraving: '印章垫 - 刻印',
            glass_bw_engraving: '玻璃 - 刻印',
            metal_bw_engraving: '不锈钢喷剂 - 刻印',
            stainless_steel_bw_engraving_diode: '不锈钢 - 刻印（二极体雷射）',
          },
          inches: {
            wood_3mm_cutting: '木板 - 0.1\'\' 切割',
            wood_5mm_cutting: '木板 - 0.2\'\' 切割',
            wood_engraving: '木板 - 刻印',
            acrylic_3mm_cutting: '压克力 - 0.1\'\' 切割',
            acrylic_5mm_cutting: '压克力 - 0.2\'\' 切割',
            acrylic_engraving: '压克力 - 刻印',
            leather_3mm_cutting: '皮革 - 0.1\'\' 切割',
            leather_5mm_cutting: '皮革 - 0.2\'\' 切割',
            leather_engraving: '皮革 - 刻印',
            fabric_3mm_cutting: '布料 - 0.1\'\' 切割',
            fabric_5mm_cutting: '布料 - 0.2\'\' 切割',
            fabric_engraving: '布料 - 刻印',
            rubber_bw_engraving: '印章垫 - 刻印',
            glass_bw_engraving: '玻璃 - 刻印',
            metal_bw_engraving: '不锈钢喷剂 - 刻印',
            stainless_steel_bw_engraving_diode: '不锈钢 - 刻印（二极体雷射）',
          },
        },
        laser_speed: {
          text: '激光速度',
          unit: 'mm/s',
          fast: '快',
          slow: '慢',
          min: 1,
          max: 300,
          step: 0.1,
        },
        power: {
          text: '激光強度',
          high: '强',
          low: '弱',
          min: 1,
          max: 100,
          step: 0.1,
        },
        para_in_use: '此参数已在使用中。',
        do_not_adjust_default_para: '无法调整预设参数。',
        existing_name: '已存在此名称的自订参数。',
      },
      object_panel: {
        zoom: '缩放',
        group: '群组',
        ungroup: '解散群组',
        hdist: '水平均分',
        vdist: '垂直均分',
        left_align: '靠左对齐',
        center_align: '置中对齐',
        right_align: '靠右对齐',
        top_align: '顶端对齐',
        middle_align: '中线对齐',
        bottom_align: '底部对齐',
        union: '相加',
        subtract: '相减',
        intersect: '相交',
        difference: '相异',
        hflip: '水平翻转',
        vflip: '垂直翻转',
        option_panel: {
          fill: '填充',
          rounded_corner: '圆角',
          font_family: '字体',
          font_style: '字型',
          font_size: '字级',
          letter_spacing: '字距',
          line_spacing: '行距',
          vertical_text: '直书',
          shading: '渐层',
          threshold: '曝光阈值',
        },
        actions_panel: {
          replace_with: '替换影像',
          trace: '向量化',
          grading: '曲线',
          sharpen: '鋭化',
          crop: '裁剪',
          bevel: '生成斜角',
          invert: '色彩反转',
          convert_to_path: '转换为路径',
          wait_for_parsing_font: '解析字体中...',
          offset: '位移複製',
          array: '阵列',
          decompose_path: '解散非连续路径',
          disassemble_use: '解散图档',
          disassembling: '解散中...',
          ungrouping: '解散群组中...',
        },
        path_edit_panel: {
          node_type: '节点类型',
        },
      },
    },
    bottom_right_panel: {
      convert_text_to_path_before_export: '部分字体在不同系统间有差异，输出前请将字体转换成路径，以确保文本正确显示。转换文本至路径中...',
      retreive_image_data: '撷取影像资料中...',
      export_file_error_ask_for_upload: '汇出工作时发生错误，是否愿意上传工作场景回报错误给开发团队？',
    },
    image_trace_panel: {
      apply: '套用',
      back: '上一步',
      cancel: '取消',
      next: '下一步',
      brightness: '曝光',
      contrast: '对比',
      threshold: '临界值',
      okay: '完成',
      tuning: '描图参数',
    },
    photo_edit_panel: {
      apply: '套用',
      back: '上一步',
      cancel: '取消',
      next: '下一步',
      sharpen: '锐化',
      sharpness: '鋭化强度',
      radius: '鋭化半径',
      crop: '裁剪',
      curve: '曲线',
      start: '开始',
      processing: '处理中',
      invert: '色彩反转',
      okay: '完成',
      compare: '原图比较',
      phote_edit: '影像编辑',
    },
    document_panel: {
      document_settings: '文件设定',
      engrave_parameters: '雕刻参数',
      workarea: '工作范围',
      rotary_mode: '旋转轴',
      borderless_mode: '开盖模式',
      engrave_dpi: '雕刻分辨率',
      enable_diode: '二极管激光',
      enable_autofocus: '自动对焦',
      add_on: '扩充模组',
      low: '低',
      medium: '中',
      high: '高',
      ultra: '极高',
      enable: '啟用',
      disable: '关闭',
      cancel: '取消',
      save: '储存',
    },
    object_panels: {
      wait_for_parsing_font: '解析字体中...',
      text_to_path: {
        font_substitute_pop: '文字:『%s』中含有当前字体:『%s』不支援的字元: %s，\n将替换成以下字体:『%s』。',
        check_thumbnail_warning: '转换文字时出现字体不支援的情形，请在送出工作前，再次检查预览图确认文字是否如预期转换。',
        error_when_parsing_text: '将文本转换为路径时出错：\n%s',
        use_current_font: '使用当前字体',
      },
      lock_desc: '缩放时固定比例 (SHIFT)',
    },
    tool_panels: {
      cancel: '取消',
      confirm: '确认',
      grid_array: '生成阵列',
      array_dimension: '阵列维度',
      rows: '列',
      columns: '行',
      array_interval: '阵列间隔',
      dx: '宽',
      dy: '高',
      offset: '偏移物件',
      nest: '排列最佳化',
      _offset: {
        direction: '偏移物件',
        inward: '向內',
        outward: '向外',
        dist: '偏移距离',
        corner_type: '边角',
        sharp: '尖角',
        round: '圆角',
        fail_message: '生成偏移物件失败',
        not_support_message: '选取物件中含有不支援的类型：\n图片、群组、文字、汇入图档。',
      },
      _nest: {
        start_nest: '开始排列',
        stop_nest: '停止排列',
        end: '结束',
        spacing: '间距',
        rotations: '旋转方向数距',
        no_element: '没有物件可以进行排列。',
      },
    },
    network_testing_panel: {
      network_testing: '网路检测',
      local_ip: '本机 IP 位置：',
      insert_ip: '目标 IP 位置：',
      empty_ip: '#818 请先输入目标 IP 位置',
      start: '检测',
      end: '結束',
      testing: '网路检测中...',
      invalid_ip: '#818 错误的 IP 位置',
      ip_startswith_169: '#843 目标 IP 开头为 169.254',
      connection_quality: '连接质量',
      average_response: '平均回覆时间',
      test_completed: '检测完成',
      test_fail: '检测失敗',
      cannot_connect_1: '#840 无法与目标 IP 建立连线',
      cannot_connect_2: '#840 无法与目标 IP 建立连线，请确认是否与目标 IP 在同一网路',
      network_unhealthy: '#841 连接质量 < 70 或平均回覆时间 > 100ms',
      device_not_on_list: '#842 列表上看不到机器，连接质量 > 70 且平均回覆时间 < 100ms',
      hint_device_often_on_list: '列表上经常找不到机器？',
      link_device_often_on_list: 'https://support.flux3dp.com/hc/zh-tw/articles/360001841636',
      hint_connect_failed_when_sending_job: '送出工作时出现无法连接？',
      link_connect_failed_when_sending_job: 'https://support.flux3dp.com/hc/zh-tw/articles/360001841656',
      hint_connect_camera_timeout: '启动相机预览时超时？',
      link_connect_camera_timeout: 'https://support.flux3dp.com/hc/zh-tw/articles/360001791895',
      cannot_get_local: '无法取得本地 IP 位置',
      fail_to_start_network_test: '#817 無法開始网路检测。',
      linux_permission_hint: '此问题通常是因为权限不足而发生，请在终端机以 "sudo beam-studio --no-sandbox" 以获得权​​限进行网路检测。',
    },
    layer_color_config_panel: {
      layer_color_config: '图层颜色参数设定',
      color: '颜色',
      power: '功率',
      speed: '速度',
      repeat: '执行次数',
      add: '新增',
      save: '储存',
      cancel: '取消',
      default: '回复预设',
      add_config: '新增颜色',
      in_use: '此颜色已在使用中。',
      no_input: '请输入颜色色码。',
      sure_to_reset: '您将会失去所有自订颜色参数，确定要回复到预设值？',
      sure_to_delete: '确定要删除这项颜色参数。',
    },
    rating_panel: {
      title: '喜欢 Beam Studio 吗？',
      description: '如果您喜欢 Beam Studio，请给我们评分，我们将不胜感激。',
      dont_show_again: '别再显示此提醒',
      thank_you: '谢谢您',
    },
    svg_editor: {
      unnsupported_file_type: 'Beam Studio 不直接支持此文件格式。请先输出成图片档或 SVG 格式',
      unable_to_fetch_clipboard_img: '无法读取复制连结中的档案',
    },
    units: {
      walt: 'W',
      mm: 'mm',
    },
  },
  flux_id_login: {
    connection_fail: '#847 无法连接至 FLUX 会员中心。',
    login_success: '登入成功',
    login: '登入',
    unlock_shape_library: '登入使用百万图形资源',
    email: '电子信箱',
    password: '密码',
    remember_me: '记住我',
    forget_password: '忘记密码',
    register: '注册 FLUX 帐号',
    offline: '离线使用',
    work_offline: '我要离线使用',
    incorrect: '信箱或密码输入错误',
    not_verified: '信箱尚未认证。',
    new_to_flux: '还不是会员？免费注册新帐号',
    signup_url: 'https://tw-store.flux3dp.com/my-account/#sign-up',
    lost_password_url: 'https://tw-store.flux3dp.com/my-account/lost-password/',
  },
  noun_project_panel: {
    login_first: '请先登入会员，完成后即可启用。',
    enjoy_shape_library: '新增百万图形资源，请尽情使用。',
    shapes: '形状',
    elements: '元素',
    recent: '最近使用',
    search: '搜寻',
    clear: '清除',
    export_svg_title: '无法汇出 SVG',
    export_svg_warning: '专案中含有受知识产权法律的保护的Noun Project 物件，因此汇出时Beam Studio 会自动帮您排除这类型之物件，您仍可以透过储存场景(.beam 档) 的方式保留您的专案，请问是否要继续汇出？',
    learn_more: '更多资讯',
  },
  change_logs: {
    change_log: '更改日志：',
    added: '新增：',
    fixed: '修正：',
    changed: '更改：',
    see_older_version: '查看之前版本',
    help_center_url: 'https://support.flux3dp.com/hc/zh-tw/sections/360000421876',
  },
  select_device: {
    select_device: '选择机器',
    auth_failure: '#811 认证失败',
    unable_to_connect: '#810 无法与机器创建稳定连接',
  },
  device: {
    pause: '暂停',
    paused: '已暂停',
    pausing: '正在暂停',
    select_printer: '选择成型机',
    retry: '重试',
    status: '状态',
    busy: '忙碌中',
    ready: '待命中',
    reset: '重设(kick)',
    abort: '取消工作',
    start: '开始',
    please_wait: '请稍待...',
    quit: '中断链接',
    completing: '完成中',
    aborted: '已终止',
    completed: '已完成',
    aborting: '取消工作中',
    starting: '启动中',
    preparing: '准备中',
    resuming: '恢复中',
    scanning: '扫描',
    occupied: '机器被占用',
    running: '工作中',
    uploading: '上传中',
    processing: '处理中',
    disconnectedError: {
      caption: '机器连接中断',
      message: '请确认 %s 的网络连接是否正常',
    },
    unknown: '未知状态',
    pausedFromError: '发生错误暂停',
    model_name: '型号',
    IP: 'IP',
    serial_number: '序号',
    firmware_version: '固件版本',
    UUID: 'UUID',
    select: '选择',
    deviceList: '机器列表',
    disable: '关闭',
    enable: '开启',
  },
  monitor: {
    monitor: 'MONITOR',
    go: '开始',
    start: '开始',
    pause: '暂停',
    stop: '停止',
    record: 'RECORD',
    camera: '相机',
    connecting: '连接中，请稍候',
    HARDWARE_ERROR_MAINBOARD_ERROR: '#401 主板没有回应。请联系 FLUX 客服。', // Deprecated in FW 3.3.1
    HARDWARE_ERROR_SUBSYSTEM_ERROR: '#402 子系统没有回应。请联系 FLUX 客服。', // Deprecated in FW 3.3.1
    HARDWARE_ERROR_PUMP_ERROR: '#900 水冷未开，请联系客服 (02) 2651-3171',
    HARDWARE_ERROR_DOOR_OPENED: '#901 门盖开启，将门盖关上以继续',
    HARDWARE_ERROR_OVER_TEMPERATURE: '#902 水温过高，请稍后再继续',
    HARDWARE_ERROR_BOTTOM_OPENED: '#903 底盖开启，将底盖关上以继续',
    USER_OPERATION_ROTARY_PAUSE: '请切换旋转轴马达开关',
    RESOURCE_BUSY: '机器忙碌中\n如果机器没有在进行动作， 请重新启动机器',
    DEVICE_ERROR: '固件发生错误\n请重新启动机器', // Deprecated in FW 3.3.1
    NO_RESPONSE: '#905 连接主板时发生错误\n请重新启动机器。',
    SUBSYSTEM_ERROR: '#402 子系统没有回应。请联系 FLUX 客服。',
    HARDWARE_FAILURE: '固件发生错误\n请重新启动机器', // Deprecated in FW 3.3.1
    MAINBOARD_OFFLINE: '#905 连接主板时发生错误\n请重新启动机器。',
    bug_report: '下载错误回报档案',
    processing: '处理中',
    savingPreview: '正在产生预览图',
    hour: '小时',
    minute: '分',
    second: '秒',
    left: '完成',
    temperature: '温度',
    forceStop: '是否强制停止现在工作?',
    upload: '上传',
    download: '下载',
    relocate: '重新定位',
    cancel: '取消',
    prepareRelocate: '准备重新定位中',
    extensionNotSupported: '上传文件不支持此文件格式',
    fileExistContinue: '文件已存在，是否要覆盖？',
    confirmGToF: 'GCode 上传后会自动转档成 FCode，是否继续？',
    confirmFileDelete: '是否确定要删除这个文件？',
    ask_reconnect: '与机器的连线中断，是否尝试重新连接？',
    task: {
      EXTRUDER: '打印',
      PRINT: '打印',
      LASER: '激光雕刻',
      DRAW: '数位绘图',
      CUT: '贴纸切割',
      VINYL: '贴纸切割',
      BEAMBOX: '激光雕刻',
      'N/A': '自由模式',
    },
  },
  alert: {
    caption: '错误',
    duplicated_preset_name: '重复的默认名称',
    info: '消息',
    warning: '警告',
    error: '错误',
    oops: '哎呀',
    retry: '重试',
    abort: '放弃',
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
    ok: '确定',
    ok2: '好',
    yes: ' 是',
    no: '否',
    stop: '停止',
    save: '储存',
    dont_save: '不要储存',
  },
  caption: {
    connectionTimeout: '连接逾时',
  },
  message: {
    connecting: '连接中...',
    connectingMachine: '连接 %s 中...',
    tryingToConenctMachine: '连接机器中...',
    connected: '已连接',
    authenticating: '密码验证中...',
    enteringRawMode: '正在进入基本动作模式...',
    endingRawMode: '正在结束基本动作模式...',
    enteringLineCheckMode: '正在进入可靠传输模式...',
    endingLineCheckMode: '正在结束可靠传输模式...',
    exitingRotaryMode: '正在结束旋转轴模式...',
    turningOffFan: '正在关闭抽气风扇...',
    turningOffAirPump: '正在关闭空气帮浦...',
    gettingLaserSpeed: '正在取得雷射头移动速度...',
    settingLaserSpeed: '正在设定雷射头移动速度...',
    retrievingCameraOffset: '正在取得相机参数...',
    connectingCamera: '正在连接相机...',
    homing: '归零中...',
    connectionTimeout: '#805 连接机器逾时，请确认你的网路状态和机器的 Wi-Fi 讯号符号。',
    device_not_found: {
      caption: '找不到默认机器',
      message: '#812 请确认默认机器的 Wi-Fi 指示灯，或取消设置默认机器',
    },
    device_busy: {
      caption: '机器忙碌中',
      message: '机器正在进行另外一项工作，请稍候再试。如果机器持续没有回应，请将机器重新启动。',
    },
    device_is_used: '机器正被使用中，是否要终止现在任务？',
    monitor_too_old: {
      caption: '固件需要更新',
      content: '#814 请按照<a target="_blank" href="http://helpcenter.flux3dp.com/hc/zh-tw/articles/216251077">此说明</a>安装最新固件版本',
    },
    unknown_error: '#821 无法与机器创建连接，请使用“功能表 > 说明 > 错误回报”',
    unknown_device: '#826 无法与机器创建连接，请确认 USB 有连接于机器',
    unsupport_osx_version: '目前系统版本 MacOS X %s 较旧，部分功能可能无法使用，请更新到最新版。',
    unsupport_win_version: '目前系统版本 %s 较旧，部分功能可能无法使用，请更新到最新版。',
    need_password: '需要密码与机器创建连接',
    unavailableWorkarea: '#804 目前设定的工作范围超过目标机器的工作范围。请确认选择的机器型号，或从 编辑 > 文件设定 更改工作范围。',
    please_enter_dpi: '请输入该文件的 dpi',
    auth_error: '#820 认证失败：请将 Beam Studio 以及机器韧体更新至最新版。',
    usb_unplugged: 'USB 连接逾时，请确认与机器的连接',
    uploading_fcode: '正在上传 fcode',
    cant_connect_to_device: '#827 无法链接机器，请确认机器是否开启，以及与机器的链接方式',
    unable_to_find_machine: '无法连接到机器 ',
    disconnected: '连接不稳，请确认机器连接状况并稍后再试一次',
    unable_to_start: '#830 无法开始工作，如果持续发生，请附上错误回报，与我们联系:\n',
    camera: {
      camera_cable_unstable: '侦测到相机传输照片时不稳定，仍能正常进行相机预览，但可能会有预览速度较慢或超时的问题。<a target="_blank" href="https://support.flux3dp.com/hc/zh-tw/articles/360001791895">了解更多</a>',
      fail_to_transmit_image: '#845 相机传输照片异常，请将机器重新开机。如果问题持续发生，请与我们联系。',
      ws_closed_unexpectly: '#844 与机器相机的连线无预期的中断。',
      continue_preview: '继续预览',
      abort_preview: '中断预览',
    },
  },
  machine_status: {
    '-10': '動作模式',
    '-2': '扫描中',
    '-1': '维护中',
    0: '待命中',
    1: '初始化',
    2: 'ST_TRANSFORM',
    4: '启动中',
    6: '回复中',
    16: '工作中',
    18: '回复中',
    32: '已暂停',
    36: '已暂停',
    38: '暂停中',
    48: '已暂停',
    50: '暂停中',
    64: '已完成',
    66: '完成中',
    68: '准备中',
    128: '已中断',
    UNKNOWN: '-',
  },
  camera_calibration: {
    update_firmware_msg1: '您的固件版本不支援此功能。请先更新 Beambox 的固件至 v',
    update_firmware_msg2: '以上以继续。 (主选单 > 机器 > [ Your Beambox ] > 固件更新',
    camera_calibration: '相机校正',
    back: '上一步',
    next: '下一步',
    skip: '跳過',
    cancel: '取消',
    finish: '完成',
    do_engraving: '执行切割',
    start_engrave: '开始绘制校正图片',
    ask_for_readjust: '是否需要跳过切割步骤，进行拍照及校正？',
    please_goto_beambox_first: '请先选择 Beambox 功能，再进行校正',
    please_place_paper: '请将干净 A4 白纸放在工作区域的左上角',
    please_refocus: {
      beambox: '请旋转升降平台旋钮，直到轻触焦距螺丝或焦距尺，完成对焦后，转回对焦尺。',
      beamo: '请转开焦距固定环，调整雷射头至平台轻触焦距尺，完成对焦后，旋紧固定环、转回对焦尺。',
      beamo_af: '请双击自动对焦套件侧边按钮，使探针轻触雕刻材料。',
    },
    without_af: '无自动对焦',
    with_af: '有自动对焦',
    dx: '水平位移',
    dy: '垂直位移',
    rotation_angle: '旋转角度',
    x_ratio: '水平比例',
    y_ratio: '垂直比例',
    show_last_config: '显示前次校正结果',
    use_last_config: '汇入前次校正数值',
    taking_picture: '截取图片中...',
    analyze_result_fail: '校正失败<br/>请确认:<br/>1. 校正图片完整画在 A4 纸上<br/>2. 已旋转升降平台旋钮，直到轻触焦距螺丝，完成对焦',
    drawing_calibration_image: '绘制校正图片中...',
    calibrate_done: '校正相机完成<br/>使用时请正确对焦以取得良好的预览效果。',
    hint_red_square: '请将红框对齐切割出来的方块',
    hint_adjust_parameters: '由这些参数来调整红框的位置，旋转与大小',
  },
  diode_calibration: {
    update_firmware_msg1: '您的固件版本不支援此功能。请先更新 Beambox 的固件至 v',
    update_firmware_msg2: '以上以继续。 (主选单 > 机器 > [ Your Beambox ] > 固件更新',
    diode_calibration: '二极管激光模组校正',
    back: '上一步',
    next: '下一步',
    skip: '跳過',
    cancel: '取消',
    finish: '完成',
    do_engraving: '执行切割',
    start_engrave: '开始绘制校正图片',
    ask_for_readjust: '是否需要跳过切割步骤，进行拍照及校正？',
    please_do_camera_calibration_and_focus: {
      beambox: '校正二极管激光需要使用相机校正参数，请确认您的机器已进行过相机校正。并请旋转升降平台旋钮，直到轻触焦距螺丝或焦距尺，完成对焦',
      beamo: '校正二极管激光需要使用相机校正参数，请确认您的机器已进行过相机校正。并请转开焦距固定环，调整雷射头至平台轻触焦距尺，完成对焦',
    },
    please_place_paper: '请将干净 A4 白纸放在工作区域的左上角',
    dx: '水平位移',
    dy: '垂直位移',
    drawing_calibration_image: '绘制校正图片中...',
    taking_picture: '截取图片中...',
    calibrate_done: '校正完成<br/>二极管激光模组偏移值已自动储存。',
    hint_red_square: '请将红框对齐切割出来的方块',
    hint_adjust_parameters: '由这些参数来调整红框的位置',
  },
  input_machine_password: {
    require_password: '"%s" 需要密码',
    connect: '连接',
    password: '密码',
  },
  tutorial: {
    skip: '跳过教学',
    welcome: '欢迎使用',
    suggest_calibrate_camera_first: '提醒您：\n第一次使用请先进行相机校正。并在每次使用时将平台对焦，以取得最好的效果。',
    camera_calibration_failed: '相机校正失败',
    ask_retry_calibration: '请问是否重新执行相机校正？',
    skipped_camera_calibration: '已跳过相机校正引导，您可从随时从上方选单「机器」>「您的机器名称」>「校正相机」进行相机校正。',
    needNewUserTutorial: '请问您是否需要 Beam Studio 的教学？',
    needNewInterfaceTutorial: '请问是否需要为您介绍 Beam Studio 的新介面？',
    next: '下一步',
    look_for_machine: '寻找机器中',
    unable_to_find_machine: '无法找到可用于新手教学的机器，是否进行要进行连线设定、重试或是跳过教学？',
    skip_tutorial: '已跳过新手教学，您可以在「说明」>「显示新手教学」再次启动新手教学。',
    set_connection: '连线设定',
    retry: '重试',
    newUser: {
      draw_a_circle: '画一个圆',
      drag_to_draw: '拖曳以生成图形',
      infill: '设定填充',
      switch_to_layer_panel: '切换到图层面板',
      set_preset_wood_engraving: '設定參數：木板 - 刻印',
      set_preset_wood_cut: '設定參數：木板 - 切割',
      add_new_layer: '新增图层',
      draw_a_rect: '画一个方形',
      switch_to_preview_mode: '切换到相机预览模式',
      preview_the_platform: '预览工作平台',
      end_preview_mode: '结束相机预览模式',
      put_wood: '1. 放进木板',
      adjust_focus: '2. 调整焦距',
      close_cover: '3. 将门盖关上',
      send_the_file: '送出工作',
      end_alert: '请问您是否确定要结束教学？',
      please_select_wood_engraving: '请选择「木板 - 刻印」参数。',
      please_select_wood_cutting: '请选择「木板 - 切割」参数。',
    },
    newInterface: {
      camera_preview: '相机预览',
      select_image_text: '选取、图片、文字工具',
      basic_shapes: '基本几何形状',
      pen_tool: '钢笔工具',
      add_new_layer: '新增图层',
      rename_by_double_click: '双击以重新命名',
      drag_to_sort: '拖曳以排序',
      layer_controls: '右键点击以呼叫图层控制功能：\n复制、合并、锁定、删除图层',
      switch_between_layer_panel_and_object_panel: '在图层面板与物件面板间切换',
      align_controls: '排列控制项',
      group_controls: '群组、解散群组',
      shape_operation: '几何图形操作',
      flip: '翻转',
      object_actions: '物件操作',
      end_alert: '请问您是否确定要结束新介面介绍？',
    },
    links: {
      adjust_focus_bm: 'https://flux3dp.zendesk.com/hc/zh-tw/articles/360001684196',
      adjust_focus_bb: 'https://support.flux3dp.com/hc/zh-tw/articles/360001683675',
    },
    tutorial_complete: '介绍完毕，开始创作吧！',
  },
} as ILang;
