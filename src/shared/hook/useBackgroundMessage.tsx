import { GetDataType, sendMessageToBackgroundAsync } from "@src/chrome/message";

type WrappedPromise = ReturnType<typeof wrapPromise>;

const wrappedPromiseRecord: Map<string, WrappedPromise> = new Map();

export default function useBackgroundMessage<M extends Message>(message: M) {
  const messageKey = JSON.stringify(message);
  const wrappedPromise = wrappedPromiseRecord.get(messageKey);
  if (!wrappedPromise) {
    wrappedPromiseRecord.set(
      messageKey,
      wrapPromise(sendMessageToBackgroundAsync(message))
    );
  }
  return {
    data: wrappedPromiseRecord.get(messageKey)!.read() as GetDataType<
      M["type"]
    >,
    refetch: () => {
      wrappedPromiseRecord.delete(messageKey);
    },
  };
}

function wrapPromise<R>(promise: Promise<R>) {
  let status = "pending"; // 최초의 상태
  let result: R;
  const suspender = promise.then(
    (r) => {
      status = "success";
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    }
  );

  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    },
  };
}
