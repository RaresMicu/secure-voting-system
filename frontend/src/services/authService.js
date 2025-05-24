import { api, api_auth } from "./api";

// Secure a vote
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
