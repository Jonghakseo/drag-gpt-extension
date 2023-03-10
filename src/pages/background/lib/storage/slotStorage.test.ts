import { SlotStorage } from "@pages/background/lib/storage/slotStorage";

describe("SlotStorage test", () => {
  describe("getAllSlots", () => {
    test("슬롯 데이터가 있는 경우 정상적으로 반환한다.", async () => {
      // given
      const savedSlots: Slot[] = [];
      jest
        .spyOn(SlotStorage.storage, "load")
        .mockImplementationOnce(() => Promise.resolve(savedSlots));

      // when
      const slots = await SlotStorage.getAllSlots();

      // then
      expect(slots).toEqual(savedSlots);
    });
    test("슬롯 데이터가 배열이 아닌 경우 빈 배열을 반환한다.", async () => {
      // given
      jest
        .spyOn(SlotStorage.storage, "load")
        .mockImplementationOnce(() => Promise.resolve("this is not array"));

      // when
      const slots = await SlotStorage.getAllSlots();

      // then
      expect(slots).toEqual([]);
    });
    test("슬롯 데이터를 가져오는 과정에서 에러가 날 경우 빈 배열을 반환한다.", async () => {
      // given
      jest
        .spyOn(SlotStorage.storage, "load")
        .mockImplementationOnce(() => Promise.reject(Error("unknown")));

      // when
      const slots = await SlotStorage.getAllSlots();

      // then
      expect(slots).toEqual([]);
    });
  });

  test("setAllSlots", async () => {
    // given
    const slots: Slot[] = [];
    jest
      .spyOn(SlotStorage.storage, "save")
      .mockImplementationOnce(() => Promise.resolve());

    // when
    const savedSlots = await SlotStorage.setAllSlots(slots);

    // then
    expect(savedSlots).toEqual(slots);
  });

  describe("getSelectedSlot", () => {
    test("선택된 슬롯이 없으면 에러가 발생한다", async () => {
      // given
      const savedSlots: Slot[] = [
        { type: "ChatGPT", id: "id", name: "name", isSelected: false },
      ];
      jest
        .spyOn(SlotStorage, "getAllSlots")
        .mockImplementation(() => Promise.resolve(savedSlots));

      // when
      const getSelectedSlot = async () => await SlotStorage.getSelectedSlot();

      // then
      await expect(getSelectedSlot()).rejects.toThrowError(
        "Check selected slot."
      );
    });
    test("선택된 슬롯이 있으면 가져온다", async () => {
      // given
      const savedSelectedSlot: Slot = {
        type: "ChatGPT",
        id: "id",
        name: "name",
        isSelected: true,
      };
      const savedSlots: Slot[] = [savedSelectedSlot];
      jest
        .spyOn(SlotStorage, "getAllSlots")
        .mockImplementation(() => Promise.resolve(savedSlots));

      // when
      const selectedSlot = await SlotStorage.getSelectedSlot();

      // then
      expect(selectedSlot).toEqual(savedSelectedSlot);
    });
  });

  describe("addSlot", () => {
    test("슬롯들이 비어있는 경우 > 선택되지 않은 새 슬롯을 넣으면 선택되어 반환된다.", async () => {
      // given
      const savedSlots: Slot[] = [];
      const slot: Slot = {
        type: "ChatGPT",
        id: "id",
        name: "name",
        isSelected: false,
      };
      jest
        .spyOn(SlotStorage, "getAllSlots")
        .mockImplementation(() => Promise.resolve(savedSlots));
      jest
        .spyOn(SlotStorage.storage, "save")
        .mockImplementation(() => Promise.resolve());

      // when
      const [addedSlot] = await SlotStorage.addSlot(slot);

      // then
      expect(addedSlot).toEqual({ ...slot, isSelected: true });
    });
    test("슬롯들이 비어있지 않은 경우 > 슬롯이 추가되어 반환된다.", async () => {
      // given
      const savedSlots: Slot[] = [
        {
          type: "ChatGPT",
          id: "id1",
          name: "name",
          isSelected: false,
        },
      ];
      const slot: Slot = {
        type: "ChatGPT",
        id: "id2",
        name: "name",
        isSelected: false,
      };
      jest
        .spyOn(SlotStorage, "getAllSlots")
        .mockImplementation(() => Promise.resolve(savedSlots));
      jest
        .spyOn(SlotStorage.storage, "save")
        .mockImplementation(() => Promise.resolve());

      // when
      const addedSlots = await SlotStorage.addSlot(slot);

      // then
      expect(addedSlots).toEqual(savedSlots.concat(slot));
    });
  });
  test("updateSlot", async () => {
    // given
    const slot: Slot = {
      type: "ChatGPT",
      id: "id",
      name: "name",
      isSelected: false,
    };
    const savedSlots: Slot[] = [slot];
    const updatedSlot = { ...slot, name: "updated" };
    jest
      .spyOn(SlotStorage, "getAllSlots")
      .mockImplementation(() => Promise.resolve(savedSlots));
    jest
      .spyOn(SlotStorage.storage, "save")
      .mockImplementation(() => Promise.resolve());

    // when
    const updatedSlots = await SlotStorage.updateSlot(updatedSlot);

    // then
    expect(updatedSlots).toEqual([updatedSlot]);
  });

  test("deleteSlot", async () => {
    // given
    const slotId = "slotId";
    const slot: Slot = {
      type: "ChatGPT",
      id: slotId,
      name: "name",
      isSelected: false,
    };
    const savedSots: Slot[] = [slot];
    jest
      .spyOn(SlotStorage, "getAllSlots")
      .mockImplementation(() => Promise.resolve(savedSots));
    jest
      .spyOn(SlotStorage.storage, "save")
      .mockImplementation(() => Promise.resolve());

    // when
    const deletedSlots = await SlotStorage.deleteSlot(slotId);

    // then
    expect(deletedSlots.find(({ id }) => id === slotId)).toBe(undefined);
  });
});
