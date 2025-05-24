import {api} from "./api";

// Secure a vote
export const secure_vote = async (candidate) => {
  try {
    const response = await api.post("/securevote", { candidate });
    return response.data;
  } catch (error) {
    console.error(
      "Error securing vote:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Cast a vote
export const cast_vote = async (candidate) => {
  try {
    const response = await api.patch("/castedvotes", { candidate });
    return response.data;
  } catch (error) {
    console.error("Error casting vote:", error.response?.data || error.message);
    throw error;
  }
};
