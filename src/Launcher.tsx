import * as React from 'react';

const ChatIcon = ({ onClick }) => (
  <div onClick={onClick} className='webchat-icon-wrapper'>
    <svg viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  </div>
);

export interface ChatWindowProps {
  tooltipText: string,
  onLaunch: () => void
}

interface State {
  showTooltip: boolean
}

export class Launcher extends React.Component<ChatWindowProps, State> {
  private tooltipCloseTimeoutId: number;
  constructor(props: ChatWindowProps) {
    super(props);
    this.state = {
      showTooltip: false
    };
  }
  componentWillUnmount() {
    this.clearScheduleTooltipTimeout();
  }
  chatIconMouseEnter = () => {
    this.clearScheduleTooltipTimeout();
    this.setState({
      showTooltip: true
    });
  }
  chatIconMouseLeave = () => {
    this.scheduleTooltipClose();
  }
  launchWebchat = () => {
    this.props.onLaunch();
  }
  closeToolTip = () => {
    this.setState({
      showTooltip: false
    });
  }
  clearScheduleTooltipTimeout = () => {
    clearTimeout(this.tooltipCloseTimeoutId);
  }
  scheduleTooltipClose = () => {
    this.tooltipCloseTimeoutId = window.setTimeout(() => {
      this.closeToolTip();
    }, 500);
  }
  tooltipMouseEnter = () => {
    this.clearScheduleTooltipTimeout();
  }
  tooltipMouseLeave = () => {
    this.scheduleTooltipClose();
  }
  render() {
    const { showTooltip } = this.state;
    const { tooltipText } = this.props;
    return (
      <div className='webchat-launcher'>
        {showTooltip &&
          <div 
            onClick={this.launchWebchat}
            onMouseEnter={this.tooltipMouseEnter} 
            onMouseLeave={this.tooltipMouseLeave}
            className='webchat-launcher-tooltip-wrapper'>
            <div className="webchat-launcher-tooltip">
              <span>{tooltipText}</span>
            </div>
          </div>
        }
        <div
          onMouseEnter={this.chatIconMouseEnter} 
          onMouseLeave={this.chatIconMouseLeave}>
          <ChatIcon onClick={this.launchWebchat} />
        </div>
      </div>
    );
  }
}