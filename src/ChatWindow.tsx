import * as React from 'react';
import {Chat, sendUserData} from './Chat';
import { Launcher } from './Launcher';
import { DirectLineOptions } from 'ambit-directlinejs';
import { sendMessage, MenuAction } from './Chat';
import { PeristentMenuItem } from './AmbitShell';

const MinimiseIcon = () => (
  <svg viewBox='0 0 20 2'>
    <rect className='minimize-icon' x={0} height={2} width={20} />
  </svg>
);

export interface State {
  isMinimised: boolean,
  showGetStartedButton: boolean
}

export interface User {
  id: string,
  name: string
}

export interface Bot {
  id: string,
  name: string
}

export interface ChatWindowProps {
  tooltipImage: string,
  tooltipText: string,
  initiallyOpen: boolean,
  avatar: string,
  headerText: string,
  user: User,
  bot?: Bot,
  directLine: DirectLineOptions,
  customHeaderElement?: React.ReactNode,
  menuActions?: Array<MenuAction>,
  disableUpload?: boolean,
  onMount?: any,
  shellPlaceholderText?: string,
  persistentMenuItems: Array<PeristentMenuItem>,
  getStartedMessage: string,
  onMinimisedChanged?: (isMinimised: boolean) => void
}

export interface ChatWindowDefaultProps {
  persistentMenuItems: Array<PeristentMenuItem>
}

export class ChatWindow extends React.Component<ChatWindowProps, State> {
  public static defaultProps: ChatWindowDefaultProps = {
    persistentMenuItems: []
  };

  private chatRef: any;

  constructor(props: ChatWindowProps) {
    super(props);
    this.state = {
      isMinimised: !props.initiallyOpen,
      showGetStartedButton: Boolean(props.getStartedMessage)
    };
  }

  componentDidMount() {
    if (this.props.onMount) {
      this.props.onMount({
        sendMessage: this.sendMessage,
        open: this.open,
        close: this.close,
        sendUserData: this.sendUserData
      });
    }
  }

  componentDidUpdate(prevProps: ChatWindowProps, prevState: State) {
    const { isMinimised } = this.state;
    if(this.props.onMinimisedChanged && prevState.isMinimised !== isMinimised) {
      this.props.onMinimisedChanged(isMinimised);
    }
  }

  sendMessage = (message: string) => {
    const { dispatch, getState } = this.chatRef.store;
    const state = getState();

    const locale = state.format.locale;
    const user = state.connection.user;

    dispatch(
      sendMessage(message, user, locale)
    );
  };

  sendUserData = (data: any) => {
      const { dispatch, getState } = this.chatRef.store;
      const state = getState();

      const user = state.connection.user;

      dispatch(sendUserData(data, user));
  };

  setRef = (ref: any) => { 
    this.chatRef = ref; 
  }
  open = () => {
    this.setState({
      isMinimised: false
    });
  }
  close = () => {
    this.setState({
      isMinimised: true
    });
  }
  handleGetStartedButtonClick = () => {
    this.setState({showGetStartedButton: false});
    this.sendMessage(this.props.getStartedMessage);
  }
  render() {
    const { isMinimised, showGetStartedButton } = this.state;
    const { 
      headerText, 
      avatar, 
      directLine, 
      user, 
      bot, 
      tooltipText, 
      tooltipImage, 
      customHeaderElement, 
      menuActions,
      disableUpload,
      shellPlaceholderText,
      persistentMenuItems
    } = this.props;
    
    const customHeaderToolbox = (
      <div className='chat-window-custom-elements'>
        {customHeaderElement}
        <div 
          className='chat-window-custom-elements-minimise'
          onMouseDown={this.close}
          onTouchStart={this.close}>
          <MinimiseIcon />
        </div>
      </div>
    );

    const conversationContainerClassName = isMinimised ? 'conversation-container conversation-container-minimised' : 'conversation-container';

    return (
      <div>
        <div className='widget-container'>
          <div className={conversationContainerClassName}>   
            <Chat 
              persistentMenuItems={persistentMenuItems}
              shellPlaceholderText={shellPlaceholderText}
              sendTyping={true}
              disableUpload={disableUpload}
              customHeaderToolbox={customHeaderToolbox}
              menuActions={menuActions}
              ref={this.setRef}
              bot={bot}
              directLine={directLine}
              user={user}
              avatar={avatar}
              headerText={headerText}       
              showGetStartedButton={showGetStartedButton}
              onGetStartedButtonClick={this.handleGetStartedButtonClick}
            />
          </div>
          {isMinimised &&
            <Launcher
              tooltipImage={tooltipImage}
              tooltipText={tooltipText}
              onLaunch={this.open} />
          }
        </div>
      </div>
    );
  }
}