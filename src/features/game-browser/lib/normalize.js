import { getGameAssets } from "@/lib/get-assets.js";
import { HIDDEN_GAMES } from "../config.js";

/**
 * 過濾掉不存在的遊戲,並移除空的 Section 和 Chapter
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
        // 平行檢查所有遊戲
        const gameChecks = await Promise.all(
          (section?.Games || []).map(async (game) => {
            // 如果遊戲在隱藏清單中，或被標記為隱藏，直接視為不存在
            if (HIDDEN_GAMES.includes(game.id) || game.hidden) {
              return { game, exists: false };
            }
            return { game, exists: true };
          })
        );

        // 只保留存在的遊戲
        const existingGames = gameChecks
          .filter((check) => check.exists)
          .map((check) => check.game);

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
  originalDatas = []
) {
  // 先過濾掉不存在的遊戲
  const filteredDatas = await filterNonExistentGames(originalDatas);

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
