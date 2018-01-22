import * as React from 'react';
import { ChatActions, ChatState, FormatState } from './Store';
import { User } from 'botframework-directlinejs';
import { sendMessage, sendFiles, classList } from './Chat';
import { Dispatch, connect } from 'react-redux';
import { Strings } from './Strings';
import { Speech } from './SpeechModule'

export interface OpenPersistentMenuData {
    screenHeight: number,
    isFirstScreen: boolean
}

export interface PeristentMenuItem {
    title: string,
    onClick: () => void
}

interface ShellContainerProps {
    inputText: string,
    strings: Strings,
    listening: boolean,
    onChangeText: (inputText: string) => void
    sendMessage: (inputText: string) => void,
    sendFiles: (files: FileList) => void,
    stopListening: () => void,
    startListening: () => void,
    showUpload?: boolean,
    shellHeightChanged: (height: number) => void,
    shellHeight: number,
    shellPlaceholderText?: string,
    persistentMenuItems: Array<PeristentMenuItem>,
    isPersistentMenuOpen: boolean,
    persistentMenuHeight: number,
    persistentMenuIsOnFirstScreen: boolean,
    openPersistenceMenuScreen: (data: OpenPersistentMenuData) => void,
    closePersistentMenu: () => void
}

export interface ChatShellProps {
    message: string,
    persistentMenuItems: Array<PeristentMenuItem>,
    onSendFiles: (files: any) => void,
    showUpload: boolean,
    onSendMessage: (message: string) => void,
    onChangeMessage: (message: string) => void,
    onHeightChange: (message: number) => void,
    height: number,
    shellPlaceholderText?: string,
    isPersistentMenuOpen: boolean,
    persistentMenuHeight: number,
    persistentMenuIsOnFirstScreen: boolean,
    openPersistenceMenuScreen: (data: OpenPersistentMenuData) => void,
    closePersistentMenu: () => void
}

export interface PersistentMenuProps {
    persistentMenuItems: Array<PeristentMenuItem>,
    persistentMenuHeight: number,
    persistentMenuIsOnFirstScreen: boolean,
    openPersistenceMenuScreen: (data: OpenPersistentMenuData) => void
}

export interface ChatShellState {
    initialHeight: number
}

export interface PersistentMenuState {
    isOnFirstScreen: boolean
}

const getFirstScreenHeight = (persistentMenuItems: Array<PeristentMenuItem>) => {
    if(persistentMenuItems.length >= 3) {
        return 3 * MENU_ITEM_HEIGHT;    
    }
    
    return persistentMenuItems.length * MENU_ITEM_HEIGHT;
};

const getSecondScreenHeight = (persistentMenuItems: Array<PeristentMenuItem>) => {
    return (persistentMenuItems.slice(3, 5).length + 1)  * MENU_ITEM_HEIGHT;
};

const AttachIcon = () => (
    <svg
      viewBox="0 0 24 24"
      style={{ transform: 'rotate(45deg)', fill: '#A0A0A0', cursor: 'pointer' }}
    >
      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
    </svg>
);
  
const ChevronLeftIcon = () => (
    <svg
      viewBox="0 0 24 24"
    >
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
);
  
const ChevronRightIcon = () => (
    <svg
      viewBox="0 0 24 24"
    >
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
);
  
const SendIcon = (props: any) => (
    <svg
      onClick={props.onClick}
      style={{ fill: 'rgb(27, 173, 248)' }}
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);
  
const MenuIcon = (props: any) => (
    <svg
      onClick={props.onClick}
      style={{ fill: 'rgb(27, 173, 248)' }}
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
    >
      <g transform="translate(-825.000000, -531.000000)">
        <g transform="translate(825.000000, 531.000000)">
          <path d="M12,24 C5.372583,24 0,18.627417 0,12 C0,5.372583 5.372583,0 12,0 C18.627417,0 24,5.372583 24,12 C24,18.627417 18.627417,24 12,24 Z M4.8,11.2 L4.8,12.8 L19.2,12.8 L19.2,11.2 L4.8,11.2 Z M4.8,15.2 L4.8,16.8 L19.2,16.8 L19.2,15.2 L4.8,15.2 Z M4.8,7.2 L4.8,8.8 L19.2,8.8 L19.2,7.2 L4.8,7.2 Z" />
        </g>
      </g>
    </svg>
);

const MENU_ITEM_HEIGHT = 40;
  
// persistent menu can have upto 5 items
class PersistentMenu extends React.Component<PersistentMenuProps, PersistentMenuState> {
    onFirstScreenMoreClick = () => {
        const screenHeight = getSecondScreenHeight(this.props.persistentMenuItems);
        this.props.openPersistenceMenuScreen({
            screenHeight,
            isFirstScreen: false
        });
    }
    onSecondScreenMoreClick = () => {
        const screenHeight = getFirstScreenHeight(this.props.persistentMenuItems);
        this.props.openPersistenceMenuScreen({
            screenHeight,
            isFirstScreen: true
        });
    }
    render() {
        const { 
            persistentMenuItems, 
            persistentMenuHeight, 
            openPersistenceMenuScreen
        } = this.props;

        const isOnFirstScreen = this.props.persistentMenuIsOnFirstScreen;
        
        const showFirstScreenMore = persistentMenuItems.length > 3;

        const firstScreenItemsToTake = showFirstScreenMore ? 2 : 3
        const firstScreenItems = persistentMenuItems.slice(0, firstScreenItemsToTake);
        
        const secondScreenItems = persistentMenuItems.slice(3, 5);

        const persistMenuItemStyles = {
            height: MENU_ITEM_HEIGHT
        };

        const firstScreenStyles = {
            opacity: isOnFirstScreen ? 1 : 0,
            transform: isOnFirstScreen ? 'translateX(0px)' : 'translateX(-40px)',
        };
  
        const secondScreenStyles = {
            opacity: isOnFirstScreen ? 0 : 1,
            pointerEvents: isOnFirstScreen ? 'none' : 'all',
            transform: isOnFirstScreen ? `translateX(${400}px)` : 'translateX(0px)',
            transition: 'transform 350ms ease-in-out, opacity 150ms ease-in-out'
        };
  
        return (
            <div style={{background: '#fff', height: persistentMenuHeight, position: 'relative', overflow: 'hidden'}}>
                <div 
                    className='persistentMenuScreen persistentMenuScreenOne' 
                    style={firstScreenStyles}>
                {firstScreenItems.map((item, index) =>
                    <div 
                        className='persistentMenuItem'
                        key={index} 
                        onClick={item.onClick}
                        style={persistMenuItemStyles}>
                        {item.title}
                    </div>
                )}
                {showFirstScreenMore &&
                    <div 
                        className='persistentMenuItem'
                        onClick={this.onFirstScreenMoreClick}
                        style={{...persistMenuItemStyles, justifyContent: 'space-between'}}>
                        <span>More!</span> 
                        <div style={{height: 20, width: 20}}>
                            <ChevronRightIcon />
                        </div>
                    </div>
                }
            </div>
            <div
                className='persistentMenuScreen persistentMenuScreenTwo' 
                style={secondScreenStyles}>
                <div 
                    className='persistentMenuItem'
                    onClick={this.onSecondScreenMoreClick}
                    style={{...persistMenuItemStyles, justifyContent: 'space-between', background: '#EDEDED'}}>
                    <div style={{height: 20, width: 20}}>
                    <ChevronLeftIcon />
                    </div>
                    <strong style={{marginRight: '50%'}}>More</strong>
                </div>
                {secondScreenItems.map((item, index) =>
                    <div 
                        className='persistentMenuItem'
                        key={index} 
                        onClick={item.onClick}
                        style={persistMenuItemStyles}>
                        {item.title}
                    </div>
                )}
            </div>        
        </div>
      );
    }
}
  
export interface ExpandingTextareaProps {
    onChange: (e: any) => void,
    onResize: (e: any) => void,
    innerRef: (ref: any) => void,
    onFocus: (e: any) => void,
    value: string,
    onKeyDown: (e: any) => void,
    style: any,
    placeholder: string
}

class ExpandingTextarea extends React.Component<ExpandingTextareaProps> {
    private el: HTMLTextAreaElement;
    static defaultProps = {
        onFocus: () => {}
    };
    componentDidMount() {
        this.adjustTextareaHeight();
    }
    handleChange = (e: any) => {
        this.props.onChange(e);
        this.adjustTextareaHeight()
    }
    adjustTextareaHeight() {
        this.el.style.height = '0px';
        this.el.style.height = `${this.el.scrollHeight}px`;

        this.props.onResize(
            this.el.scrollHeight
        );
    }
    setRef = (ref: any) => {
        this.el = ref;
        if(this.props.innerRef) {
            this.props.innerRef(ref);
        }
    }
    render() {
        const { 
            onFocus, 
            value,
            onKeyDown,
            style,
            placeholder
        } = this.props
        return (
            <textarea
                onFocus={onFocus}
                value={value}
                onKeyDown={onKeyDown}
                style={style}
                placeholder={placeholder}
                ref={this.setRef}
                onChange={this.handleChange}
            />
        );
    }
}
  
const textAreaWrapperPadding = 10;
 
class ChatShell extends React.Component<ChatShellProps, ChatShellState> {
    static defaultProps = {
        shellPlaceholderText: 'Type a message...'
    }
    private fileInput: HTMLInputElement;
    private textarea: HTMLTextAreaElement;
    constructor(props: ChatShellProps) {
        super(props);
        this.state = {
            initialHeight: props.height
        };
    }
    onResize = (textAreaHeight: number) => {
        const height = Math.max(
            this.state.initialHeight,
            textAreaHeight + textAreaWrapperPadding
        );
  
        this.props.onHeightChange(height);
    }
    onChange = (e: any) => {
        this.props.onChangeMessage(
            e.target.value
        );
    }
    sendIconClick = () => {
        this.sendMessage();
    }
    sendMessage = () => {
        this.props.onSendMessage(
            this.props.message
        );
    }
    textAreaKeydown = (e: any) => {
        if(e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
    
            this.textarea.style.height = '17px';
    
            this.props.onHeightChange(this.state.initialHeight);
        }
    }
    persistentMenuIconClick = () => {
        const screenHeight = getFirstScreenHeight(this.props.persistentMenuItems);
        this.props.openPersistenceMenuScreen({
            screenHeight,
            isFirstScreen: true
        });
    }
    handleTextAreaFocus = () => {
        this.props.closePersistentMenu();
    }
    textWrapperClick = () => {
        setTimeout(() => {
            this.textarea.focus();
        });
    }
    onChangeFile = (files: any) => {
        this.props.onSendFiles(this.fileInput.files);
        this.fileInput.value = null;
    }
    render() {
        const { 
            height, 
            persistentMenuItems, 
            message,
            showUpload,
            shellPlaceholderText,
            isPersistentMenuOpen,
            persistentMenuHeight,
            persistentMenuIsOnFirstScreen,
            openPersistenceMenuScreen,
            closePersistentMenu
        } = this.props;

        const outerWrapperStyles = {
            border: '1px solid #eee',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8
        };

        const inputRowWrapperStyles = {
            height
        };

        // we don't want the text area full height because we want the placeholder vertically center aligned
        const textAreaStyles = {
            outline: 'none',
            border: 'none',
            flex: 1,
            resize: 'none',
            marginLeft: 10
        };

        const rightIconBaseStyles = {
            cursor: 'pointer', 
            height: 20, 
            width: 20, 
            marginLeft: 6, 
            marginRight: 15
        };
    
        return (
            <div style={outerWrapperStyles}>
                <div className='ambitShellInputRow' style={inputRowWrapperStyles}>
                    {showUpload &&
                        <div 
                            style={{cursor: 'pointer', height: 20, width: 20, marginLeft: 10}}>
                            <input 
                                id="ambit-shell-upload-input" 
                                type="file" 
                                style={{display: 'none'}}
                                ref={input => this.fileInput = input} 
                                multiple 
                                onChange={this.onChangeFile} />
                            <label htmlFor="ambit-shell-upload-input">
                                <AttachIcon />  
                            </label>
                        </div>          
                    }
                    <div 
                        className='ambitShellTextAreaWrapper'
                        onMouseDown={this.textWrapperClick}>
                        <ExpandingTextarea               
                            innerRef={ref => this.textarea = ref}
                            value={message}
                            onFocus={this.handleTextAreaFocus}
                            onKeyDown={this.textAreaKeydown}
                            style={textAreaStyles}
                            placeholder={shellPlaceholderText}
                            onResize={this.onResize}
                            onChange={this.onChange} />
                    </div>
                    {!isPersistentMenuOpen && message.length === 0 && persistentMenuItems.length > 0 &&
                        <div 
                            onClick={this.persistentMenuIconClick} 
                            style={rightIconBaseStyles}>
                            <MenuIcon />
                        </div>
                    }
                    {message.length > 0 &&
                        <div onClick={this.sendIconClick} style={rightIconBaseStyles}>
                            <SendIcon />
                        </div>
                    }
                </div>
                {isPersistentMenuOpen && 
                    <PersistentMenu
                        openPersistenceMenuScreen={openPersistenceMenuScreen}
                        persistentMenuHeight={persistentMenuHeight}
                        persistentMenuIsOnFirstScreen={persistentMenuIsOnFirstScreen}
                        persistentMenuItems={persistentMenuItems} />
                }        
            </div>
        );
    }
}

class ShellContainer extends React.Component<ShellContainerProps, {}> {

    render() {
        const { 
            showUpload,
            inputText,
            sendMessage,
            onChangeText,
            sendFiles,
            shellHeightChanged,
            shellHeight,
            shellPlaceholderText,
            persistentMenuItems,
            persistentMenuHeight,
            persistentMenuIsOnFirstScreen,
            openPersistenceMenuScreen,
            isPersistentMenuOpen,
            closePersistentMenu
        } = this.props;

        return (
            <div style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
                <ChatShell 
                    closePersistentMenu={closePersistentMenu}
                    isPersistentMenuOpen={isPersistentMenuOpen}
                    openPersistenceMenuScreen={openPersistenceMenuScreen}
                    persistentMenuHeight={persistentMenuHeight}
                    persistentMenuIsOnFirstScreen={persistentMenuIsOnFirstScreen}
                    shellPlaceholderText={shellPlaceholderText}
                    onSendFiles={sendFiles}
                    showUpload={showUpload}
                    message={inputText}
                    onSendMessage={sendMessage}
                    onChangeMessage={onChangeText}
                    persistentMenuItems={persistentMenuItems}
                    onHeightChange={shellHeightChanged}
                    height={shellHeight} />
            </div>
        );
    }
}

export const AmbitShell = connect(
    (state: ChatState) => ({
        // passed down to ShellContainer
        inputText: state.shell.input,
        strings: state.format.strings,
        // only used to create helper functions below
        locale: state.format.locale,
        user: state.connection.user,
        listening : state.shell.listening,
        shellHeight: state.shell.height,
        persistentMenuHeight: state.shell.persistentMenuHeight,
        persistentMenuIsOnFirstScreen: state.shell.persistentMenuIsOnFirstScreen,
        isPersistentMenuOpen: state.shell.isPersistentMenuOpen
    }), {
        // passed down to ShellContainer
        onChangeText: (input: string) => ({ type: 'Update_Input', input, source: "text" } as ChatActions),
        stopListening:  () => ({ type: 'Listening_Stop' }),
        startListening:  () => ({ type: 'Listening_Starting' }),
        shellHeightChanged: (height) => ({ type: 'Shell_Height_Changed', height }),
        openPersistenceMenuScreen: (data: OpenPersistentMenuData) => ({ 
            type: 'Open_Persistent_Menu_Screen', 
            ...data
        }),
        closePersistentMenu: () => ({type: 'Close_Persistent_Menu'}),
        // only used to create helper functions below
        sendMessage,
        sendFiles
    }, (stateProps: any, dispatchProps: any, ownProps: any) => ({
        persistentMenuItems: ownProps.persistentMenuItems,
        // from stateProps
        isPersistentMenuOpen: stateProps.isPersistentMenuOpen,
        shellHeight: stateProps.shellHeight,
        inputText: stateProps.inputText,
        strings: stateProps.strings,
        listening : stateProps.listening,
        // from dispatchProps
        onChangeText: dispatchProps.onChangeText,
        // helper functions
        closePersistentMenu: () => dispatchProps.closePersistentMenu(),
        shellHeightChanged: (height: number) => dispatchProps.shellHeightChanged(height),
        sendMessage: (text: string) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
        sendFiles: (files: FileList) => dispatchProps.sendFiles(files, stateProps.user, stateProps.locale),
        startListening: () => dispatchProps.startListening(),
        stopListening: () => dispatchProps.stopListening(),
        openPersistenceMenuScreen: (data: OpenPersistentMenuData) => dispatchProps.openPersistenceMenuScreen(data),
        showUpload: ownProps.showUpload,
        shellPlaceholderText: ownProps.shellPlaceholderText,
        persistentMenuHeight: stateProps.persistentMenuHeight,
        persistentMenuIsOnFirstScreen: stateProps.persistentMenuIsOnFirstScreen
    })
)(ShellContainer);