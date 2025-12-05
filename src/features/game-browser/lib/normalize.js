import { getGameAssets } from "@/lib/get-assets.js";
import axios from "axios";
import { HIDDEN_GAMES } from "../config.js";

/**
 * 檢查遊戲檔案是否存在
 * @param {string} gameId - 遊戲 ID
 * @param {string} grade - 年級
 * @returns {Promise<boolean>} - 檔案是否存在
 */
async function checkGameFileExists(gameId, grade) {
  try {
    const url = `./Grade${grade}/${gameId}.json`;
    // 使用 HEAD 請求檢查檔案是否存在,不下載整個檔案
    await axios.head(url);
    return true;
  } catch (error) {
    // 檔案不存在或其他錯誤
    return false;
  }
}

/**
 * 過濾掉不存在的遊戲,並移除空的 Section 和 Chapter
 * @param {Array} datas - 原始資料
 * @param {string} grade - 年級
 * @returns {Promise<Array>} - 過濾後的資料
 */
async function filterNonExistentGames(datas, grade) {
  const filteredDatas = [];

  for (const semester of datas || []) {
    const filteredChapters = [];

    for (const chapter of semester?.gameItem || []) {
      const filteredSections = [];

      for (const section of chapter?.Section || []) {
        // 平行檢查所有遊戲檔案是否存在
        const gameChecks = await Promise.all(
          (section?.Games || []).map(async (game) => {
            // 如果遊戲在隱藏清單中，或被標記為隱藏，直接視為不存在
            if (HIDDEN_GAMES.includes(game.id) || game.hidden) {
              return { game, exists: false };
            }
            const exists = await checkGameFileExists(game.id, grade);
            return { game, exists };
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
