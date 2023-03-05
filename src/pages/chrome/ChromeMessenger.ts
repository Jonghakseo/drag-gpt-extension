export class ChromeMessenger {
  static async sendMessageAsync(message: Message) {
    return new Promise<ResponseMessage["data"]>((resolve, reject) => {
      try {
        this.sendMessage({
          message,
          handleSuccess: (response) => {
            resolve(response);
            return true;
          },
          handleError: (error) => {
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  static sendMessage({
    message,
    handleSuccess,
    handleError,
  }: {
    message: Message;
    handleSuccess?: (data: ResponseMessage["data"]) => void;
    handleError?: (error: Error) => void;
  }) {
    chrome.runtime.sendMessage(message, (_response) => {
      const response = _response as Message;
      switch (response.type) {
        case "Error":
          handleError?.(response.data);
          break;
        case "Response":
          handleSuccess?.(response.data);
          break;
        default:
          throw Error("unknown message");
      }
    });
  }
}
