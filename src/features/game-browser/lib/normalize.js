import { getGameAssets } from "@/lib/get-assets.js";

/**
 * 過濾掉狀態不是 ready 的遊戲,並移除空的 Section 和 Chapter
 * @param {Array} datas - 原始資料
 * @param {string} grade - 年級
 * @returns {Promise<Array>} - 過濾後的資料
 */
async function filterNonExistentGames(datas) {
  const filteredDatas = [];

  for (const semester of datas || []) {
    const filteredChapters = [];

    for (const chapter of semester?.gameItem || []) {
      const filteredSections = [];

      for (const section of chapter?.Section || []) {
        // 只保留 status 為 ready 的遊戲
        const existingGames = (section?.Games || []).filter(
          (game) => game.status === "ready"
        );

        // 如果這個 Section 有遊戲,才加入
        if (existingGames.length > 0) {
          filteredSections.push({
            ...section,
            Games: existingGames,
          });
        }
      }

      // 如果這個 Chapter 有 Section,才加入
      if (filteredSections.length > 0) {
        filteredChapters.push({
          ...chapter,
          Section: filteredSections,
        });
      }
    }

    // 保留 semester 結構
    filteredDatas.push({
      ...semester,
      gameItem: filteredChapters,
    });
  }

  return filteredDatas;
}

export async function convertGameDataImageURLs(
  originalDatas = [],
  grade = "0"
) {
  // 先過濾掉不存在的遊戲
  const filteredDatas = await filterNonExistentGames(originalDatas, grade);

  // 再轉換圖片 URL
  for (const semester of filteredDatas || []) {
    for (const chapter of semester?.gameItem || []) {
      for (const section of chapter?.Section || []) {
        for (const game of section?.Games || []) {
          game.Img = getGameAssets(game.id, game.Img);
        }
      }
    }
  }
  return filteredDatas;
}
