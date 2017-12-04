import * as React from 'react';
import { Chat } from './Chat';
import { Launcher } from './Launcher';
import { DirectLineOptions } from 'botframework-directlinejs';

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
  directLine: DirectLineOptions
}

export class ChatWindow extends React.Component<ChatWindowProps, State> {
  constructor(props: ChatWindowProps) {
    super(props);
    this.state = {
      isMinimised: !props.initiallyOpen
    };
  }
  toggleMinimised = () => {
    this.setState({
      isMinimised: !this.state.isMinimised
    });
  }
  render() {
    const { isMinimised } = this.state;
    const { headerText, avatar, directLine, user, bot, tooltipText, tooltipImage } = this.props;

    const customHeaderToolbox = (
      <div 
        style={{width: 20, height: 20, cursor: 'pointer'}} 
        onClick={this.toggleMinimised}>
        <MinimiseIcon />
      </div>
    );

    const conversationContainerStyles = isMinimised ? {visibility: 'hidden'} : {};
    return (
      <div className='widget-container'>
        <div className='conversation-container' style={conversationContainerStyles}>   
          <Chat 
            bot={bot}
            directLine={directLine}
            user={user}
            avatar={avatar}
            customHeaderToolbox={customHeaderToolbox}
            headerText={headerText}       
          />
        </div>
        {isMinimised &&
          <Launcher 
            tooltipImage={tooltipImage}
            tooltipText={tooltipText}
            onLaunch={this.toggleMinimised} />
        }
      </div>
    );
  }
}