import * as React from 'react';
import { ChatActions, ChatState, FormatState } from './Store';
import { User } from 'botframework-directlinejs';
import { Dispatch, connect } from 'react-redux';
import { Strings } from './Strings';
import { sendMessage, MenuAction } from './Chat';

interface Props {
    dispatchAction: (action: ChatActions) => void,
    sendMessage: (inputText: string) => void,
    actions?: Array<MenuAction>,
    title: string,
    headerText?: string,
    customHeaderToolbox?: React.ReactNode
}

interface State {
    menuOpen: boolean
}

class HeaderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
      super(props);
      this.state = {
          menuOpen: false
      }
  }

  private dispatchActions(actions: Array<any>) {
      this.setState({menuOpen: !this.state.menuOpen});
      return actions.map(action => {
        if (action.type === 'Send_Message') {
            this.props.sendMessage(action.text);
        } else {
            this.props.dispatchAction(action);
        }
      });
  }

  render() {
    const menuClass = this.state.menuOpen ? 'wc-menu wc-visible' : 'wc-menu wc-hidden';
    const menuIcon: JSX.Element = this.props.actions && this.props.actions.length ?
      <label className="wc-send" onClick={ () => this.setState({menuOpen: !this.state.menuOpen}) } >
        <svg fill="#FFFFFF" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </label>
      : <span/>
    const menu: JSX.Element = this.props.actions && this.props.actions.length ?
      <div className={menuClass}>
        {this.props.actions.map(action => (
          <span key={action.label} className='wc-send' onClick={ () => this.dispatchActions(action.actions) }>{action.label}</span>
        ))}
      </div>
      : <span/>

    const title = this.props.headerText ? this.props.headerText : this.props.title;
    return (
      <div className="wc-header">
        <span>{ title }</span>
        {menuIcon}
        {menu}
        {this.props.customHeaderToolbox}
      </div>
    )
  }
}

export const Header = connect(
    (state: ChatState) => ({
        // only used to create helper functions below
        locale: state.format.locale,
        user: state.connection.user,
        title: state.format.strings.title
    }), {
        // passed down to ShellContainer
        dispatchAction: action => (action as ChatActions),
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): Props => ({
        
        // from dispatchProps
        sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
        dispatchAction: dispatchProps.dispatchAction,
        title: stateProps.title,
        actions: ownProps.actions,
        headerText: ownProps.headerText,
        customHeaderToolbox: ownProps.customHeaderToolbox
    })
)(HeaderContainer);