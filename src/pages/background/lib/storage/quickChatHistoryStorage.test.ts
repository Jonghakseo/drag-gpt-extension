import { QuickChatHistoryStorage } from "@pages/background/lib/storage/quickChatHistoryStorage";

describe("QuickChatHistoryStorage test", () => {
  describe("getChatHistories", () => {
    test("채팅 데이터가 있는 경우 정상적으로 반환한다.", async () => {
      // given
      const savedChats: Chat[] = [];
      jest
        .spyOn(QuickChatHistoryStorage.storage, "load")
        .mockImplementationOnce(() => Promise.resolve(savedChats));

      // when
      const chats = await QuickChatHistoryStorage.getChatHistories();

      // then
      expect(chats).toEqual(savedChats);
    });
    test("채팅 데이터가 배열이 아닌 경우 빈 배열을 반환한다.", async () => {
      // given
      jest
        .spyOn(QuickChatHistoryStorage.storage, "load")
        .mockImplementationOnce(() => Promise.resolve("this is not array"));

      // when
      const chats = await QuickChatHistoryStorage.getChatHistories();

      // then
      expect(chats).toEqual([]);
    });
    test("채팅 데이터를 가져오는 과정에서 에러가 날 경우 빈 배열을 반환한다.", async () => {
      // given
      jest
        .spyOn(QuickChatHistoryStorage.storage, "load")
        .mockImplementationOnce(() => Promise.reject(Error("unknown")));

      // when
      const chats = await QuickChatHistoryStorage.getChatHistories();

      // then
      expect(chats).toEqual([]);
    });
  });
  test("resetChatHistories", async () => {
    // given
    const storageSaveFunction = jest
      .spyOn(QuickChatHistoryStorage.storage, "save")
      .mockImplementationOnce(() => Promise.resolve());

    // when
    await QuickChatHistoryStorage.resetChatHistories();

    // then
    expect(storageSaveFunction).toBeCalledWith("QUICK_CHAT_HISTORY", []);
  });
  test("pushChatHistories", async () => {
    // given
    const chat: Chat = {
      role: "user",
      content: "content",
    };
    jest
      .spyOn(QuickChatHistoryStorage, "getChatHistories")
      .mockImplementationOnce(() => Promise.resolve([]));
    const storageSaveFunction = jest
      .spyOn(QuickChatHistoryStorage.storage, "save")
      .mockImplementationOnce(() => Promise.resolve());

    // when
    await QuickChatHistoryStorage.pushChatHistories(chat);

    // then
    expect(storageSaveFunction).toBeCalledWith("QUICK_CHAT_HISTORY", [chat]);
  });
});
