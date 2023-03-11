// Do what you need to set up your test

jest.mock("@src/chrome/i18n", () => {
  const t = (key: string) => key;
  return {
    t,
  };
});
