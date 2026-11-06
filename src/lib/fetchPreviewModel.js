const connections = new Map();
let nextRequestId = 0;

function connectPreview(origin) {
  const frame = document.createElement("iframe");
  const pending = new Map();
  let ready = false;

  frame.hidden = true;
  frame.title = "Kết nối backend StackBlitz";
  frame.src = origin + "/preview-connect";

  function send(request) {
    frame.contentWindow.postMessage({
      type: "photo-sharing:request",
      id: request.id,
      path: request.path,
    }, origin);
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== origin || event.source !== frame.contentWindow) {
      return;
    }

    if (event.data?.type === "photo-sharing:ready") {
      ready = true;
      pending.forEach(send);
    } else if (event.data?.type === "photo-sharing:response") {
      pending.get(event.data.id)?.complete(event.data);
    }
  });

  document.body.appendChild(frame);

  return function request(path, signal) {
    return new Promise((resolve, reject) => {
      const abortError = () => new DOMException("Yêu cầu đã bị hủy.", "AbortError");

      if (signal?.aborted) {
        reject(abortError());
        return;
      }

      const id = nextRequestId++;

      function cleanUp() {
        clearTimeout(timeout);
        pending.delete(id);
        signal?.removeEventListener("abort", abort);
      }

      function abort() {
        cleanUp();
        reject(abortError());
      }

      const timeout = setTimeout(() => {
        cleanUp();
        reject(new Error("Không kết nối được backend. Kiểm tra URL Preview và giữ dự án backend đang mở."));
      }, 15000);

      const message = {
        id,
        path,
        complete({ status, body }) {
          cleanUp();
          resolve(new Response(JSON.stringify(body), {
            status,
            headers: { "Content-Type": "application/json" },
          }));
        },
      };

      pending.set(id, message);
      signal?.addEventListener("abort", abort, { once: true });

      if (ready) {
        send(message);
      }
    });
  };
}

export default function fetchPreviewModel(origin, path, signal) {
  if (!connections.has(origin)) {
    connections.set(origin, connectPreview(origin));
  }

  return connections.get(origin)(path, signal);
}
