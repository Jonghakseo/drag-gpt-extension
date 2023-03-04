export class ChromeMessenger {
  static async sendMessageAsync(message: Message) {
    return new Promise<Message>((resolve, reject) => {
      try {
        this.sendMessage({
          message,
          callback: (response) => {
            resolve(response);
            return true;
          },
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  static sendMessage({
    message,
    callback,
  }: {
    message: Message;
    callback?: (message: Message) => void;
  }) {
    chrome.runtime.sendMessage(message, (response) => callback?.(response));
  }
}
