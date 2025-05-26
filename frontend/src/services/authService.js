import { api, api_auth } from "./api";

// Key authentication
export const auth_session = async (activated_key_hash) => {
  try {
    const response = await api.get("/activatepollingstation", {
      headers: { Authorization: activated_key_hash },
    });

    return response.status;
  } catch (error) {
    console.error("Error during authentication session:", error);
    throw error;
  }
};

// Face authentication
export const face_auth = async (reference, queryId) => {
  try {
    const formData = new FormData();
    formData.append("reference", reference);
    formData.append("queryId", queryId);

    const response = await api_auth.post("/facematch", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error during face authentication:", error);
    throw error;
  }
};

//Fingerprint authentication
export const fingerprint_auth = async (reference, queryId) => {
  try {
    const formData = new FormData();
    formData.append("reference", reference);
    formData.append("queryId", queryId);

    const response = await api_auth.post("/fingerprintmatch", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error during fingerprint authentication:", error);
    throw error;
  }
};

// ID authentication
export const id_auth = async (queryId) => {
  try {
    const response = await api_auth.post("/checkid", { queryId });
    return response.data;
  } catch (error) {
    console.error("Error during ID authentication:", error);
    throw error;
  }
};
