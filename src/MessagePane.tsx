import * as React from 'react';
import { Activity, CardAction, User, Message } from 'ambit-directlinejs';
import { ChatActions, ChatState } from './Store';
import { connect } from 'react-redux';
import { HScroll } from './HScroll';
import { konsole, classList, doCardAction, IDoCardAction, sendMessage } from './Chat';
import * as request from 'superagent';

export interface MessagePaneProps {
    activityWithSuggestedActions: Message,
    activityWithQuickReplies: Message,

    takeSuggestedAction: (message: Message) => any,

    takeQuickReply: (message: Message) => any,

    children: React.ReactNode,
    setFocus: () => void,

    doCardAction: IDoCardAction
}

const MessagePaneView = (props: MessagePaneProps) =>
    <div className={ classList('wc-message-pane', (props.activityWithSuggestedActions || props.activityWithQuickReplies) && 'show-actions' ) }>
        { props.children }
        <div className="wc-suggested-actions">
            <QuickReplies { ... props }/>
            <SuggestedActions { ... props }/>
        </div>
    </div>;

class QuickReplies extends React.Component<MessagePaneProps, {}> {
    constructor(props: MessagePaneProps) {
        super(props);
    }

    actionClick(e: React.MouseEvent<HTMLButtonElement>, cardAction: CardAction) {

        //"stale" actions may be displayed (see shouldComponentUpdate), do not respond to click events if there aren't actual actions
        if (!this.props.activityWithQuickReplies) return;
        
        this.props.takeQuickReply(this.props.activityWithQuickReplies);
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(location => {
                this.props.doCardAction('postBack', `latlng=${location.coords.latitude},${location.coords.longitude}`);
            });
        } else {
            request
            .get('https://ipinfo.io/json')
            .end((err: any, res: any) => {
                if (err) {
                    console.log('Loading ip geolocation failed', err);
                } else {
                    this.props.doCardAction('postBack', `latlng=${res.body.loc}`);
                }
            });
        }
        this.props.setFocus();
        e.stopPropagation();
    }

    render() {
        if (!this.props.activityWithQuickReplies) return null;
        
        return (
            <HScroll
                prevSvgPathData="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" 
                nextSvgPathData="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"
                scrollUnit="page"
            >
                <ul>{ this.props.activityWithQuickReplies.channelData.quick_replies.map((action: any, index: number) =>
                    <li key={ index }>
                    { action.content_type === 'location' && (
                        <button type="button" onClick={ e => this.actionClick(e, action) } title="Send Location">
                            Send Location
                        </button>
                    )
                    }
                    </li>
                ) }</ul>
            </HScroll>
        );
    }

}

class SuggestedActions extends React.Component<MessagePaneProps, {}> {
    constructor(props: MessagePaneProps) {
        super(props);
    }

    actionClick(e: React.MouseEvent<HTMLButtonElement>, cardAction: CardAction) {

        //"stale" actions may be displayed (see shouldComponentUpdate), do not respond to click events if there aren't actual actions
        if (!this.props.activityWithSuggestedActions) return;
        
        this.props.takeSuggestedAction(this.props.activityWithSuggestedActions);
        this.props.doCardAction(cardAction.type, cardAction.value);
        this.props.setFocus();
        e.stopPropagation();
    }

    shouldComponentUpdate(nextProps: MessagePaneProps) {
        //update only when there are actions. We want the old actions to remain displayed as it animates down.
        return !!nextProps.activityWithSuggestedActions;
    }

    render() {
        if (!this.props.activityWithSuggestedActions) return null;

        return (
            <HScroll
                prevSvgPathData="M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z" 
                nextSvgPathData="M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"
                scrollUnit="page"
            >
                <ul>{ this.props.activityWithSuggestedActions.suggestedActions.actions.map((action, index) =>
                    <li key={ index }>
                        <button type="button" onClick={ e => this.actionClick(e, action) } title={ action.title }>
                            { action.title }
                        </button>
                    </li>
                ) }</ul>
            </HScroll>
        );
    }

}

function activityWithSuggestedActions(activities: Activity[]) {
    if (!activities || activities.length === 0)
        return;
    const lastActivity = activities[activities.length - 1];
    if (lastActivity.type === 'message'
        && lastActivity.suggestedActions
        && lastActivity.suggestedActions.actions.length > 0
    )
        return lastActivity;
}

function activityWithQuickReplies(activities: Activity[]) {
    if (!activities || activities.length === 0)
        return;
    const lastActivity = activities[activities.length - 1];
    if (lastActivity.type === 'message'
        && lastActivity.channelData
        && lastActivity.channelData.quick_replies
    )
        return lastActivity;
}

export const MessagePane = connect(
    (state: ChatState) => ({
        // passed down to MessagePaneView
        activityWithSuggestedActions: activityWithSuggestedActions(state.history.activities),
        activityWithQuickReplies: activityWithQuickReplies(state.history.activities),
        // only used to create helper functions below 
        botConnection: state.connection.botConnection,
        user: state.connection.user,
        locale: state.format.locale
    }), {
        takeSuggestedAction: (message: Message) => ({ type: 'Take_SuggestedAction', message } as ChatActions),
        takeQuickReply: (message: Message) => ({ type: 'Take_QuickReply', message } as ChatActions),
        // only used to create helper functions below 
        sendMessage
    }, (stateProps: any, dispatchProps: any, ownProps: any): MessagePaneProps => ({
        // from stateProps
        activityWithSuggestedActions: stateProps.activityWithSuggestedActions,
        activityWithQuickReplies: stateProps.activityWithQuickReplies,
        // from dispatchProps
        takeSuggestedAction: dispatchProps.takeSuggestedAction,
        takeQuickReply: dispatchProps.takeQuickReply,
        // from ownProps
        children: ownProps.children,
        setFocus: ownProps.setFocus,
        // helper functions
        doCardAction: doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage)
    })
)(MessagePaneView);
