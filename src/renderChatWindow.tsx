import * as React from 'react'; 
import * as ReactDOM from 'react-dom'; 
import { ChatWindow } from './ChatWindow'; 
 
export const renderChatWindow = (props: any, container: HTMLElement, onMount?: any) => { 
    ReactDOM.render(
      <ChatWindow 
        {...props} 
        onMount={onMount} />
    , container); 
} 