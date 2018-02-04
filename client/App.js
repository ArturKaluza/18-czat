import React, { Component } from 'react';
import io from 'socket.io-client';
import styles from './App.css';

import MessageForm from './MessageForm';
import MessageList from './MessageList';
import UsersList from './UsersList';
import UserForm from './UserForm';

const socket = io('/');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {users: [], messages: [], text: '', name: '' }; 
  }

  render() {
    return this.state.name.trim() !== '' ? this.renderLayout() : this.renderUserForm();
  }

  renderLayout() {
    return (
       <div className={styles.App}>
         <div className={styles.AppHeader}>
           <div className={styles.AppTitle}>
             ChatApp
           </div>
           <div className={styles.AppRoom}>
              <div>User name:
                <span> {this.state.name}</span>
              </div>
            <div>App room</div> 
           </div>
         </div>
         <div className={styles.AppBody}>
           <UsersList
             users={this.state.users}
           />
           <div className={styles.MessageWrapper}>
             <MessageList
               messages={this.state.messages}
             />
             <MessageForm
               onMessageSubmit={message => this.handleMessageSubmit(message)}
               name={this.state.name}
             />
           </div>
         </div>
       </div>
    );
  }

  renderUserForm() {
    return (<UserForm onUserSubmit={name => this.handleUserSubmit(name)} />)
 }

 componentDidMount() {
  socket.on('message', message => this.messageReceive(message));
  socket.on('update', ({users}) => this.chatUpdate(users));
}

messageReceive(message) {
  const messages = [message, ...this.state.messages];
  this.setState({messages});
}

chatUpdate(users) {
  this.setState({users});
}

handleMessageSubmit(message) {
  const messages = [message, ...this.state.messages];
  this.setState({messages});
  socket.emit('message', message);
}

handleUserSubmit(name) {
  this.setState({name});
  socket.emit('join', name);
  // informacja o dołączeniu nowego urzytkownika
  const message = {
    from : name,
    text : ' joins the chat'
  };
  socket.emit('message', message);
}

};

export default App;