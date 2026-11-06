import fetchPreviewModel from "./fetchPreviewModel";

const localApiUrl = "http://127.0.0.1:3001";
const apiStorageKey = "photo-sharing-api-url";

function apiBaseUrl() {
  const apiParam = new URLSearchParams(window.location.search).get("api");
  if (apiParam) {
    let backend;
    try {
      backend = new URL(apiParam);
    } catch {
      throw new Error("Địa chỉ backend không hợp lệ.");
    }

    if (backend.protocol !== "https:" && backend.protocol !== "http:") {
      throw new Error("Địa chỉ backend phải bắt đầu bằng http:// hoặc https://.");
    }

    window.sessionStorage.setItem(apiStorageKey, backend.origin);
    return backend.origin;
  }

  const configured = window.sessionStorage.getItem(apiStorageKey)
    || process.env.REACT_APP_API_URL;

  if (configured) {
    return configured.trim().replace(/\/+$/, "");
  }

  if (["127.0.0.1", "localhost"].includes(window.location.hostname)) {
    return localApiUrl;
  }

  throw new Error("Mở backend, sau đó thêm ?api=URL_BACKEND vào URL của frontend.");
}

async function fetchModel(url, signal) {
  const base = apiBaseUrl();
  const backend = new URL(base);
  const isStackBlitzPreview = [".webcontainer.io", ".webcontainer-api.io", ".stackblitz.io"]
    .some((suffix) => backend.hostname.endsWith(suffix));
  const response = isStackBlitzPreview
    ? await fetchPreviewModel(backend.origin, url, signal)
    : await fetch(base + url, { signal });

  if (response.status === 404) {
    throw new Error("Không tìm thấy dữ liệu.");
  }

  if (!response.ok) {
    throw new Error("Không tải được dữ liệu (HTTP " + response.status + ").");
  }

  if (!response.headers.get("Content-Type")?.includes("application/json")) {
    throw new Error("Backend không trả JSON. Hãy kiểm tra URL API và đường dẫn /user/list.");
  }

  return response.json();
}

export default fetchModel;

