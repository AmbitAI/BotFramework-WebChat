import * as React from 'react';
import { Chat } from './Chat';

const MinimiseIcon = () => (
  <svg viewBox='0 0 20 2'>
    <rect className='minimize-icon' x={0} height={2} width={20} />
  </svg>
);

interface State {
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
  avatar: string,
  webchatSecret: string,
  botName: string,
  headerText: string,
  user: User,
  bot: Bot
}

const ChatIcon = ({ onClick }) => (
  <div onClick={onClick} className='webchat-icon-wrapper'>
    <svg viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  </div>
);

export class ChatWindow extends React.Component<ChatWindowProps, State> {
  constructor(props: ChatWindowProps) {
    super(props);
    this.state = {
      isMinimised: false
    };
  }
  toggleMinimised = () => {
    this.setState({
      isMinimised: !this.state.isMinimised
    });
  }
  render() {
    const { isMinimised } = this.state;
    const { botName, headerText, avatar, webchatSecret, user, bot } = this.props;

    const customHeaderToolbox = (
      <div 
        style={{width: 20, height: 20, cursor: 'pointer'}} 
        onClick={this.toggleMinimised}>
        <MinimiseIcon />
      </div>
    );

    return (
      <div className='widget-container'>
        <div className='conversation-container'>
          {!isMinimised &&
            <Chat 
              bot={bot}
              directLine={{ secret: webchatSecret }}
              user={user}
              avatar={avatar}
              customHeaderToolbox={customHeaderToolbox}
              headerText={headerText}       
            />        
          }
        </div>
        {isMinimised &&
          <div>
            <ChatIcon onClick={this.toggleMinimised} />
          </div>
        }
      </div>
    );
  }
}