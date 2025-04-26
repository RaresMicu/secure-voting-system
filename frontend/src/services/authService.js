import api from "./api";

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
