import request from "../util/request";

export const uploadImg = async (data: Blob) => {
  return request.post("https://seal-plugin.dev.16163.com/img-upload", data, {
    headers: {
      accept: "application/json",
      "content-type": data.type,
      token: "s4wBOQMjvktihEqy",
    },
    withCredentials: true,
  });
};
