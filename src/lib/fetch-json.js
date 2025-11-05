import axios from "axios";
const tool = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export default async function (url) {
  try {
    const res = await tool.get(url);
    return res;
  } catch (error) {
    console.log("error");
    if (error.response && error.response.status === 404) {
      // 檔案不存在
      throw new Error(`找不到檔案：${url}`);
    }
    // 其他錯誤
    throw error;
  }
}
