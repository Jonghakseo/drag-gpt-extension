import { ApiKeyStorage } from "@pages/background/lib/storage/apiKeyStorage";

describe("ApiKeyStorage test", () => {
  test("getApiKey test", async () => {
    // given
    const MOCK_API_KEY = "KEY";
    jest
      .spyOn(ApiKeyStorage.storage, "load")
      .mockImplementationOnce(() => Promise.resolve(MOCK_API_KEY));

    // when
    const apiKey = await ApiKeyStorage.getApiKey();

    // then
    expect(apiKey).toEqual(MOCK_API_KEY);
  });
  test("setApiKey test", async () => {
    // given
    const MOCK_API_KEY = "KEY";
    const mockSave = jest
      .spyOn(ApiKeyStorage.storage, "save")
      .mockImplementationOnce(() => Promise.resolve());

    // when
    await ApiKeyStorage.setApiKey(MOCK_API_KEY);

    // then
    expect(mockSave).toBeCalled();
  });
});
