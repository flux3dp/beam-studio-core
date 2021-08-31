export interface ILang {
  general: {
    wait: string,
    choose_folder: string,
  },
  buttons: {
    next: string,
    back: string,
    done: string,
  },
  topbar: {
    untitled: string,
    titles: {
      settings: string,
    },
    export: string,
    preview: string,
    borderless: string,
    tag_names: {
      rect: string,
      ellipse: string,
      path: string,
      polygon: string,
      image: string,
      text: string,
      text_path: string,
      line: string,
      g: string,
      multi_select: string,
      use: string,
      svg: string,
      dxf: string,
    },
    alerts: {
      start_preview_timeout: string,
      fail_to_start_preview: string,
      fail_to_connect_with_camera: string,
      power_too_high: string,
      power_too_high_msg: string,
      power_too_high_confirm: string,
    },
    hint: {
      polygon: string,
    },
    menu: {
      preferences: string;
      hide: string;
      hideothers: string;
      service: string;
      quit: string;
      window: string;
      minimize: string;
      close: string;
      file: string;
      edit: string;
      help: string;
      open: string;
      samples: string;
      import_hello_beamo: string;
      import_hello_beambox: string;
      import_material_testing_old: string;
      import_material_testing_simple_cut: string;
      import_material_testing_cut: string;
      import_material_testing_engrave: string;
      import_material_testing_line: string;
      import_acrylic_focus_probe: string;
      export_to: string;
      export_flux_task: string;
      export_BVG: string;
      export_SVG: string;
      export_PNG: string;
      export_JPG: string;
      save_scene: string;
      save_as: string;
      about_beam_studio: string;
      undo: string;
      redo: string;
      cut: string;
      copy: string;
      paste: string;
      paste_in_place: string;
      group: string;
      ungroup: string;
      delete: string;
      duplicate: string;
      offset: string;
      scale: string;
      rotate: string;
      reset: string;
      align_center: string;
      photo_edit: string;
      svg_edit: string;
      path: string;
      decompose_path: string;
      optimization: string;
      object: string;
      layer_setting: string;
      layer_color_config: string;
      image_sharpen: string;
      image_crop: string;
      image_invert: string;
      image_stamp: string;
      image_vectorize: string;
      image_curve: string;
      arrangement_optimization: string;
      align_to_edges: string;
      document_setting: string;
      clear_scene: string;
      machines: string;
      add_new_machine: string;
      help_center: string;
      show_gesture_tutorial: string;
      show_start_tutorial: string;
      show_ui_intro: string;
      questionnaire: string;
      change_logs: string;
      contact: string;
      tutorial: string;
      forum: string;
      software_update: string;
      bug_report: string;
      dashboard: string;
      machine_info: string;
      network_testing: string;
      toolhead_info: string;
      change_material: string;
      run_leveling: string;
      commands: string;
      update_firmware: string;
      update_delta: string;
      update_toolhead: string;
      using_beam_studio_api: string;
      set_as_default: string;
      calibrate_origin: string;
      calibrate_beambox_camera: string;
      calibrate_beambox_camera_borderless: string;
      calibrate_diode_module: string;
      movement_test: string;
      turn_on_laser: string;
      auto_leveling_clean: string;
      set_toolhead_temperature: string;
      manage_account: string;
      sign_in: string;
      sign_out: string;
      account: string;
      my_account: string;
      download_log: string;
      download_log_canceled: string;
      download_log_error: string;
      log: {
        network: string;
        hardware: string;
        discover: string;
        usb: string;
        usblist: string;
        camera: string;
        cloud: string;
        player: string;
        robot: string;
      },
      link: {
        help_center: string;
        contact_us: string;
        forum: string;
        downloads: string;
        beam_studio_api: string;
      },
      view: string;
      zoom_in: string;
      zoom_out: string;
      fit_to_window: string;
      zoom_with_window: string;
      borderless_mode: string;
      show_grids: string;
      show_rulers: string;
      show_layer_color: string;
      anti_aliasing: string;
      disassemble_use: string;
    }
  },
  support: {
    no_webgl: string,
    no_vcredist: string,
  },
  generic_error: {
    UNKNOWN_ERROR: string,
    OPERATION_ERROR: string,
    SUBSYSTEM_ERROR: string,
    UNKNOWN_COMMAND: string,
    RESOURCE_BUSY: string,
  },
  device_selection: {
    no_beambox: string,
  },
  update: {
    release_note: string,
    firmware: {
      caption: string,
      message_pattern_1: string,
      message_pattern_2: string,
      latest_firmware: {
        caption: string,
        message: string,
        still_update: string,
        cant_get_latest: string,
      },
      confirm: string,
      upload_file: string,
      update_success: string,
      update_fail: string,
      too_old_for_web: string,
    },
    software: {
      checking: string,
      switch_version: string,
      check_update: string,
      caption: string,
      downloading: string,
      install_or_not: string,
      switch_or_not: string,
      available_update: string,
      available_switch: string,
      not_found: string,
      no_response: string,
      switch_version_not_found: string,
      yes: string,
      no: string,
    },
    updating: string,
    skip: string,
    preparing: string,
    later: string,
    download: string,
    cannot_reach_internet: string,
    install: string,
    upload: string,
  },
  topmenu: {
    version: string,
    credit: string,
    ok: string,
    file: {
      label: string,
      import: string,
      save_fcode: string,
      save_scene: string,
      save_svg: string,
      save_png: string,
      save_jpg: string,
      converting: string,
      all_files: string,
      svg_files: string,
      png_files: string,
      jpg_files: string,
      scene_files: string,
      fcode_files: string,
      clear_recent: string,
      path_not_exit: string,
    },
    device: {
      download_log_canceled: string,
      download_log_error: string,
      log: {
        usblist: string,
      },
      network_test: string,
    },
  },
  initialize: {
    // generic strings
    next: string,
    start: string,
    skip: string,
    cancel: string,
    confirm: string,
    connect: string,
    back: string,
    retry: string,
    no_machine: string,

    // specific caption/content
    select_language: string,
    select_machine_type: string,
    select_connection_type: string,
    connection_types: {
      wifi: string,
      wired: string,
      ether2ether: string,
      usb: string,
    },
    connect_wifi: {
      title: string,
      tutorial1: string,
      tutorial2: string,
      what_if_1: string,
      what_if_1_content: string,
      what_if_2: string,
      what_if_2_content: string,
    },
    connect_wired: {
      title: string,
      tutorial1: string,
      tutorial2: string,
      what_if_1: string,
      what_if_1_content: string,
      what_if_2: string,
      what_if_2_content: string,
    },
    connect_ethernet: {
      title: string,
      tutorial1: string,
      tutorial2_1: string,
      tutorial2_a_text: string,
      tutorial2_a_href_mac: string,
      tutorial2_a_href_win: string,
      tutorial2_2: string,
      tutorial3: string,
    },
    connect_machine_ip: {
      enter_ip: string,
      check_ip: string,
      invalid_ip: string,
      invalid_format: string,
      starts_with_169254: string,
      unreachable: string,
      check_connection: string,
      check_firmware: string,
      check_camera: string,
      retry: string,
      finish_setting: string,
    },
    connecting: string,
    setting_completed: {
      start: string,
      great: string,
      setup_later: string,
      back: string,
      ok: string,
    },
  },
  error_pages: {
    screen_size: string,
  },
  menu: {
    mm: string,
    inches: string,
  },
  settings: {
    on: string,
    off: string,
    low: string,
    high: string,
    caption: string,
    tabs: {
      general: string,
      device: string,
    },
    ip: string,
    guess_poke: string,
    auto_connect: string,
    wrong_ip_format: string,
    default_machine: string,
    default_machine_button: string,
    remove_default_machine_button: string,
    confirm_remove_default: string,
    reset: string,
    reset_now: string,
    confirm_reset: string,
    language: string,
    notifications: string,
    check_updates: string,
    autosave_enabled: string,
    autosave_path: string,
    autosave_interval: string,
    autosave_number: string,
    autosave_path_not_correct: string,
    preview_movement_speed: string,
    preview_movement_speed_hl: string,
    default_units: string,
    default_font_family: string,
    default_font_style: string,
    fast_gradient: string,
    vector_speed_constraint: string,
    loop_compensation: string,
    blade_radius: string,
    blade_precut_switch: string,
    blade_precut_position: string,
    default_beambox_model: string,
    guides_origin: string,
    guides: string,
    image_downsampling: string,
    anti_aliasing: string,
    continuous_drawing: string,
    trace_output: string,
    single_object: string,
    grouped_objects: string,
    simplify_clipper_path: string,
    mask: string,
    text_path_calc_optimization: string,
    font_substitute: string,
    default_borderless_mode: string,
    default_enable_autofocus_module: string,
    default_enable_diode_module: string,
    diode_offset: string,
    share_with_flux: string,
    none: string,
    close: string,
    enabled: string,
    disabled: string,
    cancel: string,
    done: string,
    groups: {
      general: string,
      update: string,
      connection: string,
      autosave: string,
      camera: string,
      editor: string,
      engraving: string,
      path: string,
      mask: string,
      text_to_path: string,
      modules: string,
      privacy: string,
    },
    notification_on: string,
    notification_off: string,
    update_latest: string,
    update_beta: string,
    help_center_urls: {
      connection: string,
      image_downsampling: string,
      anti_aliasing: string,
      continuous_drawing: string,
      simplify_clipper_path: string,
      fast_gradient: string,
      vector_speed_constraint: string,
      loop_compensation: string,
      mask: string,
      font_substitute: string,
      default_borderless_mode: string,
      default_enable_autofocus_module: string,
      default_enable_diode_module: string,
    },
  },
  beambox: {
    tag: {
      g: string,
      use: string,
      image: string,
      text: string,
    },
    context_menu: {
      cut: string,
      copy: string,
      paste: string,
      paste_in_place: string,
      duplicate: string,
      delete: string,
      group: string,
      ungroup: string,
      move_front: string,
      move_up: string,
      move_down: string,
      move_back: string,
    },
    popup: {
      select_import_method: string,
      touchpad: string,
      mouse: string,
      layer_by_layer: string,
      layer_by_color: string,
      nolayer: string,
      loading_image: string,
      no_support_text: string,
      speed_too_high_lower_the_quality: string,
      both_power_and_speed_too_high: string,
      too_fast_for_path: string,
      too_fast_for_path_and_constrain: string,
      should_update_firmware_to_continue: string,
      more_than_two_object: string,
      not_support_object_type: string,
      select_first: string,
      select_at_least_two: string,
      import_file_contain_invalid_path: string,
      import_file_error_ask_for_upload: string,
      upload_file_too_large: string,
      successfully_uploaded: string,
      upload_failed: string,
      or_turn_off_borderless_mode: string,
      svg_1_1_waring: string,
      svg_image_path_waring: string,
      dxf_version_waring: string,
      dont_show_again: string,
      convert_to_path_fail: string,
      save_unsave_changed: string,
      dxf_bounding_box_size_over: string,
      progress: {
        uploading: string,
        calculating: string,
      },
      backend_connect_failed_ask_to_upload: string,
      pdf2svg: {
        error_when_converting_pdf: string,
        error_pdf2svg_not_found: string,
      },
      ungroup_use: string,
      vectorize_shading_image: string,
      change_workarea_before_preview: string,
      bug_report: string,
      sentry: {
        title: string,
        message: string,
      },
      questionnaire: {
        caption: string,
        message: string,
        unable_to_get_url: string,
        no_questionnaire_available: string,
      },
    },
    zoom_block: {
      fit_to_window: string,
    },
    time_est_button: {
      calculate: string,
      estimate_time: string,
    },
    left_panel: {
      unpreviewable_area: string,
      diode_blind_area: string,
      borderless_blind_area: string,
      borderless_preview: string,
      rectangle: string,
      ellipse: string,
      line: string,
      image: string,
      text: string,
      label: {
        cursor: string,
        photo: string,
        text: string,
        line: string,
        rect: string,
        oval: string,
        polygon: string,
        pen: string,
        shapes: string,
        array: string,
        preview: string,
        trace: string,
        end_preview: string,
        clear_preview: string,
      },
    },
    right_panel: {
      tabs: {
        layers: string,
        objects: string,
        path_edit: string,
      },
      layer_panel: {
        layer1: string,
        layer_bitmap: string,
        layer_engraving: string,
        layer_cutting: string,
        move_elems_to: string,
        notification: {
          dupeLayerName: string,
          newName: string,
          enterUniqueLayerName: string,
          enterNewLayerName: string,
          layerHasThatName: string,
          QmoveElemsToLayer: string,
        },
        layers: {
          layer: string,
          layers: string,
          del: string,
          move_down: string,
          new: string,
          rename: string,
          move_up: string,
          dupe: string,
          lock: string,
          merge_down: string,
          merge_all: string,
          merge_selected: string,
          move_elems_to: string,
          move_selected: string,
        },
      },
      laser_panel: {
        preset_setting: string,
        multi_layer: string,
        parameters: string,
        strength: string,
        speed: string,
        speed_contrain_warning: string,
        repeat: string,
        add_on: string,
        focus_adjustment: string,
        height: string,
        z_step: string,
        diode: string,
        times: string,
        cut: string,
        engrave: string,
        more: string,
        delete: string,
        reset: string,
        sure_to_reset: string,
        apply: string,
        cancel: string,
        save: string,
        save_and_exit: string,
        name: string,
        default: string,
        customized: string,
        inuse: string,
        export_config: string,
        new_config_name: string,
        sure_to_load_config: string,
        custom_preset: string,
        various_preset: string,
        dropdown: {
          parameters: string,
          save: string,
          export: string,
          import: string,
          more: string,
          mm: {
            wood_3mm_cutting: string,
            wood_5mm_cutting: string,
            wood_engraving: string,
            acrylic_3mm_cutting: string,
            acrylic_5mm_cutting: string,
            acrylic_engraving: string,
            leather_3mm_cutting: string,
            leather_5mm_cutting: string,
            leather_engraving: string,
            fabric_3mm_cutting: string,
            fabric_5mm_cutting: string,
            fabric_engraving: string,
            rubber_bw_engraving: string,
            glass_bw_engraving: string,
            metal_bw_engraving: string,
            stainless_steel_bw_engraving_diode: string,
          },
          inches: {
            wood_3mm_cutting: string,
            wood_5mm_cutting: string,
            wood_engraving: string,
            acrylic_3mm_cutting: string,
            acrylic_5mm_cutting: string,
            acrylic_engraving: string,
            leather_3mm_cutting: string,
            leather_5mm_cutting: string,
            leather_engraving: string,
            fabric_3mm_cutting: string,
            fabric_5mm_cutting: string,
            fabric_engraving: string,
            rubber_bw_engraving: string,
            glass_bw_engraving: string,
            metal_bw_engraving: string,
            stainless_steel_bw_engraving_diode: string,
          },
        },
        laser_speed: {
          text: string,
          unit: string,
          fast: string,
          slow: string,
          min: number,
          max: number,
          step: number,
        },
        power: {
          text: string,
          high: string,
          low: string,
          min: number,
          max: number,
          step: number,
        },
        para_in_use: string,
        do_not_adjust_default_para: string,
        existing_name: string,
      },
      object_panel: {
        zoom: string,
        group: string,
        ungroup: string,
        hdist: string,
        vdist: string,
        left_align: string,
        center_align: string,
        right_align: string,
        top_align: string,
        middle_align: string,
        bottom_align: string,
        union: string,
        subtract: string,
        intersect: string,
        difference: string,
        hflip: string,
        vflip: string,
        option_panel: {
          fill: string,
          rounded_corner: string,
          sides: string,
          font_family: string,
          font_style: string,
          font_size: string,
          letter_spacing: string,
          line_spacing: string,
          vertical_text: string,
          start_offset: string,
          vertical_align: string,
          text_infill: string,
          path_infill: string,
          shading: string,
          threshold: string,
        },
        actions_panel: {
          replace_with: string,
          trace: string,
          grading: string,
          sharpen: string,
          crop: string,
          bevel: string,
          invert: string,
          convert_to_path: string,
          fetching_web_font: string,
          uploading_font_to_machine: string,
          wait_for_parsing_font: string,
          offset: string,
          array: string,
          decompose_path: string,
          disassemble_use: string,
          disassembling: string,
          ungrouping: string,
          create_textpath: string,
          detach_path: string,
          edit_path: string,
        },
        path_edit_panel: {
          node_type: string,
        },
      },
    },
    bottom_right_panel: {
      convert_text_to_path_before_export: string,
      retreive_image_data: string,
      export_file_error_ask_for_upload: string,
    },
    image_trace_panel: {
      apply: string,
      back: string,
      cancel: string,
      next: string,
      brightness: string,
      contrast: string,
      threshold: string,
      okay: string,
      tuning: string,
    },
    photo_edit_panel: {
      apply: string,
      back: string,
      cancel: string,
      next: string,
      sharpen: string,
      sharpness: string,
      radius: string,
      crop: string,
      curve: string,
      start: string,
      processing: string,
      invert: string,
      okay: string,
      compare: string,
      phote_edit: string,
    },
    document_panel: {
      document_settings: string,
      engrave_parameters: string,
      workarea: string,
      rotary_mode: string,
      borderless_mode: string,
      engrave_dpi: string,
      enable_diode: string,
      enable_autofocus: string,
      add_on: string,
      low: string,
      medium: string,
      high: string,
      ultra: string,
      enable: string,
      disable: string,
      cancel: string,
      save: string,
    },
    object_panels: {
      wait_for_parsing_font: string,
      text_to_path: {
        font_substitute_pop: string,
        check_thumbnail_warning: string,
        error_when_parsing_text: string,
        use_current_font: string,
      },
      lock_desc: string,
    },
    tool_panels: {
      cancel: string,
      confirm: string,
      grid_array: string,
      array_dimension: string,
      rows: string,
      columns: string,
      array_interval: string,
      dx: string,
      dy: string,
      offset: string,
      nest: string,
      _offset: {
        direction: string,
        inward: string,
        outward: string,
        dist: string,
        corner_type: string,
        sharp: string,
        round: string,
        fail_message: string,
        not_support_message: string,
      },
      _nest: {
        start_nest: string,
        stop_nest: string,
        end: string,
        spacing: string,
        rotations: string,
        no_element: string,
      }
    },
    network_testing_panel: {
      network_testing: string,
      local_ip: string,
      insert_ip: string,
      empty_ip: string,
      start: string,
      end: string,
      testing: string,
      invalid_ip: string,
      ip_startswith_169: string,
      connection_quality: string,
      average_response: string,
      test_completed: string,
      test_fail: string,
      cannot_connect_1: string,
      cannot_connect_2: string,
      network_unhealthy: string,
      device_not_on_list: string,
      hint_device_often_on_list: string,
      link_device_often_on_list: string,
      hint_connect_failed_when_sending_job: string,
      link_connect_failed_when_sending_job: string,
      hint_connect_camera_timeout: string,
      link_connect_camera_timeout: string,
      cannot_get_local: string,
      fail_to_start_network_test: string,
      linux_permission_hint: string,
    },
    layer_color_config_panel: {
      layer_color_config: string,
      color: string,
      power: string,
      speed: string,
      repeat: string,
      add: string,
      save: string,
      cancel: string,
      default: string,
      add_config: string,
      in_use: string,
      no_input: string,
      sure_to_reset: string,
      sure_to_delete: string,
    },
    rating_panel: {
      title: string,
      description: string,
      dont_show_again: string,
      thank_you: string,
    },
    svg_editor: {
      unnsupported_file_type: string,
      unable_to_fetch_clipboard_img: string,
    },
    units: {
      walt: string,
      mm: string,
    },
    path_preview: {
      play: string,
      pause: string,
      stop: string,
      play_speed: string,
      travel_path: string,
      invert: string,
      preview_info: string,
      size: string,
      estimated_time: string,
      cut_time: string,
      rapid_time: string,
      cut_distance: string,
      rapid_distance: string,
      current_position: string,
      remark: string,
      start_here: string,
      end_preview: string,
    },
  },
  flux_id_login: {
    connection_fail: string,
    login_success: string,
    login: string,
    unlock_shape_library: string,
    email: string,
    password: string,
    remember_me: string,
    forget_password: string,
    register: string,
    offline: string,
    work_offline: string,
    incorrect: string,
    not_verified: string,
    new_to_flux: string,
    signup_url: string,
    lost_password_url: string,
  },
  noun_project_panel: {
    login_first: string,
    enjoy_shape_library: string,
    shapes: string,
    elements: string,
    recent: string,
    search: string,
    clear: string,
    export_svg_title: string,
    export_svg_warning: string,
    learn_more: string,
  },
  change_logs: {
    change_log: string,
    added: string,
    fixed: string,
    changed: string,
    see_older_version: string,
    help_center_url: string,
  },
  select_device: {
    select_device: string,
    auth_failure: string,
    unable_to_connect: string,
  },
  device: {
    pause: string,
    paused: string,
    pausing: string,
    select_printer: string,
    retry: string,
    status: string,
    busy: string,
    ready: string,
    reset: string,
    abort: string,
    start: string,
    please_wait: string,
    quit: string,
    completing: string,
    aborted: string,
    completed: string,
    aborting: string,
    starting: string,
    preparing: string,
    resuming: string,
    scanning: string,
    occupied: string,
    running: string,
    uploading: string,
    processing: string,
    disconnectedError: {
      caption: string,
      message: string,
    },
    unknown: string,
    pausedFromError: string,
    model_name: string,
    IP: string,
    serial_number: string,
    firmware_version: string,
    UUID: string,
    select: string,
    deviceList: string,
    disable: string,
    enable: string,
  },
  monitor: {
    monitor: string,
    go: string,
    start: string,
    pause: string,
    stop: string,
    record: string,
    camera: string,
    connecting: string,
    HARDWARE_ERROR_MAINBOARD_ERROR: string,
    HARDWARE_ERROR_SUBSYSTEM_ERROR: string,
    HARDWARE_ERROR_PUMP_ERROR: string,
    HARDWARE_ERROR_DOOR_OPENED: string,
    HARDWARE_ERROR_OVER_TEMPERATURE: string,
    HARDWARE_ERROR_BOTTOM_OPENED: string,
    USER_OPERATION_ROTARY_PAUSE: string,
    RESOURCE_BUSY: string,
    DEVICE_ERROR: string,
    NO_RESPONSE: string,
    SUBSYSTEM_ERROR: string,
    HARDWARE_FAILURE: string,
    MAINBOARD_OFFLINE: string,
    bug_report: string,
    processing: string,
    savingPreview: string,
    hour: string,
    minute: string,
    second: string,
    left: string,
    temperature: string,
    forceStop: string,
    upload: string,
    download: string,
    relocate: string,
    cancel: string,
    prepareRelocate: string,
    extensionNotSupported: string,
    fileExistContinue: string,
    confirmGToF: string,
    confirmFileDelete: string,
    ask_reconnect: string,
    task: {
      EXTRUDER: string,
      PRINT: string,
      LASER: string,
      DRAW: string,
      CUT: string,
      VINYL: string,
      BEAMBOX: string,
      'N/A': string,
    },
  },
  alert: {
    caption: string,
    duplicated_preset_name: string,
    info: string,
    warning: string,
    error: string,
    oops: string,
    retry: string,
    abort: string,
    confirm: string,
    cancel: string,
    close: string,
    ok: string,
    ok2: string,
    yes: string,
    no: string,
    stop: string,
    save: string,
    dont_save: string,
  },
  caption: {
    connectionTimeout: string,
  },
  message: {
    connecting: string,
    connectingMachine: string,
    tryingToConenctMachine: string,
    connected: string,
    authenticating: string,
    enteringRawMode: string,
    endingRawMode: string,
    enteringLineCheckMode: string,
    endingLineCheckMode: string,
    exitingRotaryMode: string,
    turningOffFan: string,
    turningOffAirPump: string,
    gettingLaserSpeed: string,
    settingLaserSpeed: string,
    retrievingCameraOffset: string,
    connectingCamera: string,
    homing: string,
    connectionTimeout: string,
    device_not_found: {
      caption: string,
      message: string,
    },
    device_busy: {
      caption: string,
      message: string,
    },
    device_is_used: string,
    monitor_too_old: {
      caption: string,
      content: string,
    },
    unknown_error: string,
    unknown_device: string,
    unsupport_osx_version: string,
    unsupport_win_version: string,
    need_password: string,
    unavailableWorkarea: string,
    please_enter_dpi: string,
    auth_error: string,
    usb_unplugged: string,
    uploading_fcode: string,
    cant_connect_to_device: string,
    unable_to_find_machine: string,
    disconnected: string,
    unable_to_start: string,
    camera: {
      camera_cable_unstable: string,
      fail_to_transmit_image: string,
      ws_closed_unexpectly: string,
      continue_preview: string,
      abort_preview: string,
    },
  },
  machine_status: {
    '-10': string,
    '-2': string,
    '-1': string,
    0: string,
    1: string,
    2: string,
    4: string,
    6: string,
    16: string,
    18: string,
    32: string,
    36: string,
    38: string,
    48: string,
    50: string,
    64: string,
    66: string,
    68: string,
    128: string,
    UNKNOWN: string,
  },
  camera_calibration: {
    update_firmware_msg1: string,
    update_firmware_msg2: string,
    camera_calibration: string,
    back: string,
    next: string,
    skip: string,
    cancel: string,
    finish: string,
    do_engraving: string,
    start_engrave: string,
    ask_for_readjust: string,
    please_goto_beambox_first: string,
    please_place_paper: string,
    please_refocus: {
      beambox: string,
      beamo: string,
      beamo_af: string,
    },
    without_af: string,
    with_af: string,
    dx: string,
    dy: string,
    rotation_angle: string,
    x_ratio: string,
    y_ratio: string,
    show_last_config: string,
    use_last_config: string,
    taking_picture: string,
    analyze_result_fail: string,
    drawing_calibration_image: string,
    calibrate_done: string,
    hint_red_square: string,
    hint_adjust_parameters: string,
  },
  diode_calibration: {
    update_firmware_msg1: string,
    update_firmware_msg2: string,
    diode_calibration: string,
    back: string,
    next: string,
    skip: string,
    cancel: string,
    finish: string,
    do_engraving: string,
    start_engrave: string,
    ask_for_readjust: string,
    please_do_camera_calibration_and_focus: {
      beambox: string,
      beamo: string,
    },
    please_place_paper: string,
    dx: string,
    dy: string,
    drawing_calibration_image: string,
    taking_picture: string,
    calibrate_done: string,
    hint_red_square: string,
    hint_adjust_parameters: string,
  },
  input_machine_password: {
    require_password: string,
    connect: string,
    password: string,
  },
  tutorial: {
    skip: string,
    welcome: string,
    suggest_calibrate_camera_first: string,
    camera_calibration_failed: string,
    ask_retry_calibration: string,
    skipped_camera_calibration: string,
    needNewUserTutorial: string,
    needNewInterfaceTutorial: string,
    next: string,
    look_for_machine: string,
    unable_to_find_machine: string,
    skip_tutorial: string,
    set_connection: string,
    retry: string,
    newUser: {
      draw_a_circle: string,
      drag_to_draw: string,
      infill: string,
      switch_to_layer_panel: string,
      set_preset_wood_engraving: string,
      set_preset_wood_cut: string,
      add_new_layer: string,
      draw_a_rect: string,
      switch_to_preview_mode: string,
      preview_the_platform: string,
      end_preview_mode: string,
      put_wood: string,
      adjust_focus: string,
      close_cover: string,
      send_the_file: string,
      end_alert: string,
      please_select_wood_engraving: string,
      please_select_wood_cutting: string,
    },
    newInterface: {
      camera_preview: string,
      select_image_text: string,
      basic_shapes: string,
      pen_tool: string,
      add_new_layer: string,
      rename_by_double_click: string,
      drag_to_sort: string,
      layer_controls: string,
      switch_between_layer_panel_and_object_panel: string,
      align_controls: string,
      group_controls: string,
      shape_operation: string,
      flip: string,
      object_actions: string,
      end_alert: string,
    },
    gesture: {
      pan: string,
      zoom: string,
      click: string,
      drag: string,
      hold: string,
    },
    links: {
      adjust_focus_bm: string,
      adjust_focus_bb: string,
    },
    tutorial_complete: string,
  },
}
