/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import cx from 'classnames';

import { hideMenu } from './actions';
import AbstractMenu from './AbstractMenu';
import {
  callIfExists, cssClasses, hasOwnProp, store,
} from './helpers';
import listener from './globalEventListener';

// interface Props {
//   title: Node
//   attributes?: any,
//   className?: string,
//   disabled?: boolean,
//   hoverDelay?: number,
//   rtl?: boolean,
//   selected?: boolean,
//   onMouseMove?: (e: Event) => void,
//   onMouseOut?: (e: Event) => void,
//   forceOpen?: boolean,
//   forceClose?: () => void,
//   parentKeyNavigationHandler?: (e?: Event) => void,
// }

export default class SubMenu extends AbstractMenu {
  static defaultProps = {
    disabled: false,
    hoverDelay: 500,
    attributes: {},
    className: '',
    rtl: false,
    selected: false,
    onMouseMove: () => null,
    onMouseOut: () => null,
    forceOpen: false,
    forceClose: () => null,
    parentKeyNavigationHandler: () => null,
  };

  private listenId: string;

  private isVisibilityChange: boolean;

  private menu: HTMLElement;

  private subMenu: HTMLElement;

  private opentimer: NodeJS.Timeout;

  private closetimer: NodeJS.Timeout;

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      visible: false,
    };
  }

  componentDidMount() {
    this.listenId = listener.register(() => { }, this.hideSubMenu);
  }

  getSubMenuType = () => SubMenu;

  shouldComponentUpdate(nextProps, nextState) {
    this.isVisibilityChange = (this.state.visible !== nextState.visible
      || this.props.forceOpen !== nextProps.forceOpen)
      && !(this.state.visible && nextProps.forceOpen)
      && !(this.props.forceOpen && nextState.visible);
    return true;
  }

  componentDidUpdate() {
    if (!this.isVisibilityChange) return;
    if (this.props.forceOpen || this.state.visible) {
      const wrapper = window.requestAnimationFrame || setTimeout;
      wrapper(() => {
        this.subMenu.classList.add(cssClasses.menuVisible);
        const styles = this.props.rtl ? this.getRTLMenuPosition() : this.getMenuPosition();

        this.subMenu.style.removeProperty('top');
        this.subMenu.style.removeProperty('bottom');
        this.subMenu.style.removeProperty('left');
        this.subMenu.style.removeProperty('right');

        if (hasOwnProp(styles, 'top')) this.subMenu.style.top = styles.top;
        if (hasOwnProp(styles, 'left')) this.subMenu.style.left = styles.left;
        if (hasOwnProp(styles, 'bottom')) this.subMenu.style.bottom = styles.bottom;
        if (hasOwnProp(styles, 'right')) this.subMenu.style.right = styles.right;

        this.registerHandlers();
        this.setState({ selectedItem: null });
      });
    } else {
      const cleanup = () => {
        this.subMenu.style.removeProperty('bottom');
        this.subMenu.style.removeProperty('right');
        this.subMenu.style.top = '0';
        this.subMenu.style.left = '100%';
        this.unregisterHandlers();
      };
      this.subMenu.classList.remove(cssClasses.menuVisible);
      cleanup();
    }
  }

  componentWillUnmount() {
    if (this.listenId) {
      listener.unregister(this.listenId);
    }

    if (this.opentimer) clearTimeout(this.opentimer);

    if (this.closetimer) clearTimeout(this.closetimer);

    this.unregisterHandlers(true);
  }

  getMenuPosition = () => {
    const { innerWidth, innerHeight } = window;
    const rect = this.subMenu.getBoundingClientRect();
    const position: { [key: string]: string } = {};

    if (rect.bottom > innerHeight) {
      position.bottom = '0';
    } else {
      position.top = '0';
    }

    if (rect.right < innerWidth) {
      position.left = '100%';
    } else {
      position.right = '100%';
    }

    return position;
  };

  getRTLMenuPosition = () => {
    const { innerHeight } = window;
    const rect = this.subMenu.getBoundingClientRect();
    const position: { [key: string]: string } = {};

    if (rect.bottom > innerHeight) {
      position.bottom = '0';
    } else {
      position.top = '0';
    }

    if (rect.left < 0) {
      position.left = '100%';
    } else {
      position.right = '100%';
    }

    return position;
  };

  hideMenu = (e) => {
    e.preventDefault();
    this.hideSubMenu(e);
  };

  hideSubMenu = (e) => {
    // avoid closing submenus of a different menu tree
    if (e.detail && e.detail.id && this.menu && e.detail.id !== this.menu.id) {
      return;
    }

    if (this.props.forceOpen) {
      this.props.forceClose();
    }
    this.setState({ visible: false, selectedItem: null });
    this.unregisterHandlers();
  };

  handleClick = (event) => {
    event.preventDefault();

    if (this.props.disabled) return;

    callIfExists(
      this.props.onClick,
      event,
      { ...this.props.data, ...store.data },
      store.target,
    );

    if (!this.props.onClick || this.props.preventCloseOnClick) return;

    hideMenu();
  };

  handleMouseEnter = () => {
    if (this.closetimer) clearTimeout(this.closetimer);

    if (this.props.disabled || this.state.visible) return;

    this.opentimer = setTimeout(() => this.setState({
      visible: true,
      selectedItem: null,
    }), this.props.hoverDelay);
  };

  handleMouseLeave = () => {
    if (this.opentimer) clearTimeout(this.opentimer);

    if (!this.state.visible) return;

    this.closetimer = setTimeout(() => this.setState({
      visible: false,
      selectedItem: null,
    }), this.props.hoverDelay);
  };

  menuRef = (c) => {
    this.menu = c;
  };

  subMenuRef = (c) => {
    this.subMenu = c;
  };

  registerHandlers = () => {
    document.removeEventListener('keydown', this.props.parentKeyNavigationHandler);
    document.addEventListener('keydown', this.handleKeyNavigation);
  };

  unregisterHandlers = (dismounting?) => {
    document.removeEventListener('keydown', this.handleKeyNavigation);
    if (!dismounting) {
      document.addEventListener('keydown', this.props.parentKeyNavigationHandler);
    }
  };

  render() {
    const {
      children, attributes, disabled, title, selected,
    } = this.props;
    const { visible } = this.state;
    const menuProps = {
      ref: this.menuRef,
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      className: cx(cssClasses.subMenu, attributes.listClassName),
    };
    const menuItemProps = {
      className: cx(cssClasses.menuItem, attributes.className, {
        [cx(cssClasses.menuItemDisabled, attributes.disabledClassName)]: disabled,
        [cx(cssClasses.menuItemActive, attributes.visibleClassName)]: visible,
        [cx(cssClasses.menuItemSelected, attributes.selectedClassName)]: selected,
      }),
      onMouseMove: this.props.onMouseMove,
      onMouseOut: this.props.onMouseOut,
      onClick: this.handleClick,
    };
    const subMenuProps = {
      ref: this.subMenuRef,
      className: cx(cssClasses.menu, this.props.className),
    };

    return (
      <nav {...menuProps} role="menuitem" tabIndex={-1} aria-haspopup="true" style={{ position: 'relative' }}>
        <div {...attributes} {...menuItemProps}>
          {title}
        </div>
        <nav
          {...subMenuProps}
          role="menu"
          tabIndex={-1}
          style={{
            position: 'absolute',
            top: 0,
            left: '100%',
            whiteSpace: 'nowrap',
          }}
        >
          {this.renderChildren(children)}
        </nav>
      </nav>
    );
  }
}
