import api from "./api";

const getWildlifeMapData = async () => {
  const response = await api.get("/map");
  return response.data;
};

export default {
  getWildlifeMapData,
};