import { getGameAssets } from "@/lib/get-assets.js";

export function convertGameDataImageURLs(originalDatas = []) {
  const datas = originalDatas;
  for (const semester of datas || []) {
    for (const chapter of semester?.gameItem || []) {
      for (const section of chapter?.Section || []) {
        for (const game of section?.Games || []) {
          game.Img = getGameAssets(game.id, game.Img);
        }
      }
    }
  }
  return datas;
}



