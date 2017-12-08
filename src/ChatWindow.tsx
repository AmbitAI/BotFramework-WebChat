import * as React from 'react';
import { Chat } from './Chat';
import { Launcher } from './Launcher';
import { DirectLineOptions } from 'botframework-directlinejs';
import { sendMessage, MenuAction } from './Chat';

const MinimiseIcon = () => (
  <svg viewBox='0 0 20 2'>
    <rect className='minimize-icon' x={0} height={2} width={20} />
  </svg>
);

export interface State {
  isMinimised: boolean
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
  onMount?: any
}

export class ChatWindow extends React.Component<ChatWindowProps, State> {
  private chatRef: any;
  constructor(props: ChatWindowProps) {
    super(props);
    this.state = {
      isMinimised: !props.initiallyOpen
    };
  }
  componentDidMount() {
    if(this.props.onMount) {
      this.props.onMount({
        sendMessage: this.sendMessage,
        open: this.open,
        close: this.close
      });
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
  }
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
  render() {
    const { isMinimised } = this.state;
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
      disableUpload
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
      <div className='widget-container'>
        <div className={conversationContainerClassName}>   
          <Chat 
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
          />
        </div>
        {isMinimised &&
          <Launcher 
            tooltipImage={tooltipImage}
            tooltipText={tooltipText}
            onLaunch={this.open} />
        }
      </div>
    );
  }
}