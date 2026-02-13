import { defineAsyncComponent } from "vue";
const templateLoaders = {
  LinkGame: () => import("@/features/game-templates/link-game/LinkGame.vue"),
  CompareGame: () =>
    import("@/features/game-templates/compare-game/CompareGame.vue"),
  TrueFalseGame: () =>
    import("@/features/game-templates/true-false-game/TrueFalseGame.vue"),
  SelectGame: () =>
    import("@/features/game-templates/select-game/SelectGame.vue"),
  ClassifyGame: () =>
    import("@/features/game-templates/classify-game/ClassifyGame.vue"),
  SortGame: () => import("@/features/game-templates/sort-game/SortGame.vue"),
  FindTheItemGame: () =>
    import("@/features/game-templates/find-the-item-game/FindTheItemGame.vue"),
  AutoNumberingGame: () =>
    import(
      "@/features/game-templates/auto-numbering-game/AutoNumberingGame.vue"
    ),
  NumberingGame: () =>
    import("@/features/game-templates/numbering-game/NumberingGame.vue"),
  FillinBlank: () =>
    import("@/features/game-templates/fillin-blank/FillinBlank.vue"),
  PairingGame: () =>
    import("@/features/game-templates/pairing-game/PairingGame.vue"),
  NumberLock: () =>
    import("@/features/game-templates/number-lock/NumberLock.vue"),
  RacingCar: () => import("@/features/game-templates/racing-car/RacingCar.vue"),
  WhackaMole: () =>
    import("@/features/game-templates/whacka-mole/WhackaMole.vue"),
  MazeGame: () => import("@/features/game-templates/maze-game/MazeGame.vue"),
  SelectGameMulti: () =>
    import("@/features/game-templates/select-game-multi/SelectGameMulti.vue"),
  NumberSearchGame: () =>
    import("@/features/game-templates/number-search-game/NumberSearchGame.vue"),
  TrackGame: () => import("@/features/game-templates/track-game/TrackGame.vue"),
  CopyItem: () => import("@/features/game-templates/copy-item/CopyItem.vue"),
  AirplaneGame: () =>
    import("@/features/game-templates/airplane-game/AirplaneGame.vue"),
  ComponentTesters: () =>
    import("@/features/game-templates/component-testers/componentTesters.vue"),
  BalloonShooting: () =>
    import("@/features/game-templates/balloon-shooting/BalloonShooting.vue"),
  LinkToImage: () =>
    import("@/features/game-templates/linkto-image/LinktoImage.vue"),
  LinkToTable: () =>
    import("@/features/game-templates/linkto-table/LinkToTable.vue"),
  WordProblemWithCalculator: () =>
    import(
      "@/features/game-templates/word-problem-with-calculator/WordProblemWithCalculator.vue"
    ),
  MoneyDrag: () => import("@/features/game-templates/money-drag/MoneyDrag.vue"),
  MultiplyBoard: () =>
    import("@/features/game-templates/multiply-board/MultiplyBoard.vue"),
  FractionArithmetic: () =>
    import(
      "@/features/game-templates/fraction-arithmetic/FractionArithmetic.vue"
    ),
  FindPattern: () =>
    import("@/features/game-templates/find-pattern/FindPattern.vue"),
  OneDimensionalForm: () =>
    import(
      "@/features/game-templates/one-dimensional-form/OneDimensionalForm.vue"
    ),
};

export const templateComponents = Object.fromEntries(
  Object.entries(templateLoaders).map(([name, loader]) => [
    name,
    defineAsyncComponent(loader),
  ])
);

export default templateComponents;
