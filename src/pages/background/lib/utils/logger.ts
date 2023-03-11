const Logger = {
  receive: (message: Message) => {
    console.log(
      "Message Receive:",
      `${message.type}\ninput: ${
        message.input ? JSON.stringify(message.input) : "none"
      }`
    );
  },
  send: (message: { type: any; data?: any }) => {
    console.log(
      "Message Sending:",
      `${message.type}\ndata: ${
        message.data ? JSON.stringify(message.data) : "none"
      }`
    );
  },
  warn: console.warn,
  error: console.error,
};

export default Logger;
