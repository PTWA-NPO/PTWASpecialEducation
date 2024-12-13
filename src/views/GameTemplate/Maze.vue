<template>
  <div ref="container">
    <h2>{{ GameData.Question }}</h2>
    <v-stage
      :config="configKonva"
      @touchstart="touchStart"
      @touchend="touchEnd"
    >
      <v-layer v-if="isBgImage">
        <v-image :config="configBgImage" />
      </v-layer>

      <v-layer v-if="!isBgImage">
        <v-rect :config="configBg" />
        <v-rect
          v-for="(block, index) in configBounds"
          :key="index"
          :config="block"
          :fill="'blue'"
          :stroke-enabled="false"
        />
        <v-rect
          v-for="(block, index) in configSafeArea"
          :key="index"
          :config="block"
          :fill="'green'"
          :stroke-enabled="false"
        />
      </v-layer>
      <v-layer>
        <v-text
          v-for="(option, index) in configOption"
          :key="index"
          :config="option"
        />
      </v-layer>
      <v-layer>
        <v-shape :config="configPlayer" />
        <v-circle :config="configGhost_1" />
        <v-circle :config="configGhost_2" />
      </v-layer>
      <v-layer>
        <joystick
          v-if="joystickVisible"
          :radius="laneWidth * 1.5"
          :position="touchPosition"
          @move="moveByJoystick"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { getSystemAssets, getGameStaticAssets } from "@/utilitys/get_assets.js";
import { defineAsyncComponent } from "vue";
import fetchJson from "@/utilitys/fetch-json";

export default {
  components: {
    joystick: defineAsyncComponent(() =>
      import("@/components/touchscreenJoystick.vue")
    ),
  },

  props: {
    GameData: {
      type: Object,
      required: true,
    },
    GameConfig: {
      type: Object,
      required: true,
    },
    ID: {
      type: String,
      required: true,
    },
  },
  emits: ["play-effect", "add-record", "next-question"],
  data() {
    return {
      isBgImage: false,
      configKonva: {},
      configBg: {
        fill: "black",
        strokeEnabled: false,
      },
      configBgImage: {},

      configOption: [],
      optionMap: [0, 0, 0, 0],

      configBounds: [],
      configSafeArea: [],

      configPlayer: {
        fill: "yellow",
        stroke: "yellow",
      },
      configGhost_1: {
        fill: "red",
        stroke: "red",
      },
      configGhost_2: {
        fill: "red",
        stroke: "red",
      },
      entityInfo: {
        player: {
          tag: "player",
          collision: {
            left: false,
            right: false,
            up: false,
            down: false,
          },
          xyGrid: {
            x: 0,
            y: 0,
          },
          movement: "idle",
          startDegrees: 0,
          endDegrees: 0,
          animation: "open",
        },
        ghost_1: {
          tag: "ghost",
          collision: {
            left: false,
            right: false,
            up: false,
            down: false,
          },
          xyGrid: {
            x: 0,
            y: 0,
          },
          movement: "right",
          randomRouteCD: true,
        },
        ghost_2: {
          tag: "ghost",
          collision: {
            left: false,
            right: false,
            up: false,
            down: false,
          },
          xyGrid: {
            x: 0,
            y: 0,
          },
          movement: "left",
          randomRouteCD: true,
        },
      },

      touchPosition: {
        x: 0,
        y: 0,
      },
      joystickVisible: false,

      map: {},
    };
  },
  async mounted() {
    this.map = await fetchJson(getGameStaticAssets("Maze", "map.json"));
    this.map = this.map.data.map;
    this.fitCanvasInScreen();
    this.generateMap();
    this.getOptionPosition();
    this.bootGame();
  },

  methods: {
    fitCanvasInScreen() {
      this.gameWidth = this.$refs.container.clientWidth * 0.8;
      this.configKonva.width = this.gameWidth;
      this.configKonva.height = this.gameWidth * 0.5;
    },
    generateMap() {
      this.randomMapId = Math.floor(Math.random() * this.map.length);
      this.laneWidth = this.gameWidth * 0.05;
      const mapBG = new window.Image();
      mapBG.src = getSystemAssets(
        "Dev02_Maze",
        "map_" + this.randomMapId + ".png"
      );
      if (mapBG.src.includes("undefined")) {
        this.isBgImage = false;
      } else this.isBgImage = true;
      if (this.isBgImage) {
        this.configBgImage.image = mapBG;
        this.configBgImage.width = this.laneWidth * 20;
        this.configBgImage.height = this.laneWidth * 10;
      } else {
        this.configBg.width = this.laneWidth * 20;
        this.configBg.height = this.laneWidth * 10;
        for (var i = 0; i < 20; ++i) {
          for (var j = 0; j < 10; ++j) {
            let block = {
              x: i * this.laneWidth,
              y: j * this.laneWidth,
              width: this.laneWidth,
              height: this.laneWidth,
            };
            if (this.map[this.randomMapId][j][i] == 1) {
              this.configBounds.push(block);
            } else if (this.map[this.randomMapId][j][i] != 0) {
              this.configSafeArea.push(block);
            }
          }
        }
      }
    },

    getOptionPosition() {
      for (var i = 0; i < 20; ++i) {
        for (var j = 0; j < 10; ++j) {
          switch (this.map[this.randomMapId][j][i]) {
            case 2:
              if (this.optionMap[0] == 0) this.optionMap[0] = { x: i, y: j };
              break;
            case 3:
              if (this.optionMap[1] == 0) this.optionMap[1] = { x: i, y: j };
              break;
            case 4:
              if (this.optionMap[2] == 0) this.optionMap[2] = { x: i, y: j };
              break;
            case 5:
              if (this.optionMap[3] == 0) this.optionMap[3] = { x: i, y: j };
              break;
          }
        }
      }
    },

    printOptions() {
      for (var i = 0; i < 4; ++i) {
        let option = {
          stroke: "black",
          text: this.GameData.Options[i],
          x: this.optionMap[i].x * this.laneWidth + 0.1 * this.laneWidth,
          y: this.optionMap[i].y * this.laneWidth + 0.1 * this.laneWidth,
          fontSize: this.laneWidth * 0.8,
        };
        this.configOption.push(option);
      }
    },

    initializeEnemyPosition() {
      for (var i = 0; i < 10; ++i) {
        for (var j = 0; j < 20; ++j) {
          if (j >= 8 && j <= 11) continue;
          if (this.map[this.randomMapId][i][j] == 0) {
            this.configGhost_1.x = this.laneWidth * (j + 0.5);
            this.configGhost_1.y = this.laneWidth * (i + 0.5);
            break;
          }
        }
      }
      for (var i = 9; i > -1; --i) {
        for (var j = 19; j > -1; --j) {
          if (j >= 8 && j <= 11) continue;
          if (this.map[this.randomMapId][i][j] == 0) {
            this.configGhost_2.x = this.laneWidth * (j + 0.5);
            this.configGhost_2.y = this.laneWidth * (i + 0.5);
            break;
          }
        }
      }
    },
    initializePlayerPosition() {
      var possiblePosition = [];
      for (var i = 4; i < 6; ++i) {
        for (var j = 9; j < 11; ++j) {
          if (this.map[this.randomMapId][i][j] == 0) {
            possiblePosition.push({ x: j, y: i });
          }
        }
      }
      if (possiblePosition.length > 0) {
        var randomPosition = Math.floor(
          Math.random() * possiblePosition.length
        );
        this.configPlayer.x =
          this.laneWidth * (possiblePosition[randomPosition].x + 0.5);
        this.configPlayer.y =
          this.laneWidth * (possiblePosition[randomPosition].y + 0.5);
        return 0;
      }
      for (var i = 3; i < 7; ++i) {
        for (var j = 8; j < 12; ++j) {
          if (this.map[this.randomMapId][i][j] == 0) {
            possiblePosition.push({ x: j, y: i });
          }
        }
      }
      if (possiblePosition.length > 0) {
        var randomPosition = Math.floor(
          Math.random() * possiblePosition.length
        );
        this.configPlayer.x =
          this.laneWidth * (possiblePosition[randomPosition].x + 0.5);
        this.configPlayer.y =
          this.laneWidth * (possiblePosition[randomPosition].y + 0.5);
        return 0;
      }
    },
    playerSceneFunc(context, shape) {
      context.beginPath();
      context.moveTo(0, 0);
      context.arc(
        0,
        0,
        shape.getAttr("radius"),
        shape.getAttr("startRadians"),
        shape.getAttr("endRadians")
      );
      context.lineTo(0, 0);
      context.fillStrokeShape(shape);
      context.closePath();
    },
    initializeEntityConfig() {
      this.configPlayer.radius = this.laneWidth * 0.35;
      this.configPlayer.sceneFunc = this.playerSceneFunc;
      this.configGhost_1.radius = this.laneWidth * 0.35;
      this.configGhost_2.radius = this.laneWidth * 0.35;
    },
    bootGame() {
      this.printOptions();
      this.initializeEntityConfig();
      this.initializeEnemyPosition();
      this.initializePlayerPosition();
      window.addEventListener("keydown", this.keyDown);
      window.addEventListener("keyup", this.keyUp);
      this.game = window.setInterval(this.update, 20);
    },

    keyDown(e) {
      //W = 38/87; A = 37/65; S = 40/83; D = 39/68
      //console.log(e.keyCode);
      switch (e.keyCode) {
        case 37:
        case 65:
          this.entityInfo.player.movement = "left";
          break;
        case 39:
        case 68:
          this.entityInfo.player.movement = "right";
          break;
        case 38:
        case 87:
          this.entityInfo.player.movement = "up";
          break;
        case 40:
        case 83:
          this.entityInfo.player.movement = "down";
          break;
      }
    },
    keyUp(e) {
      //W = 38/87; A = 37/65; S = 40/83; D = 39/68
      //console.log(e.keyCode);
      switch (e.keyCode) {
        case 37:
        case 65:
        case 39:
        case 68:
        case 38:
        case 87:
        case 40:
        case 83:
          this.entityInfo.player.movement = "idle";
          break;
      }
    },
    update() {
      this.movePlayer();
      this.moveGhost({
        config: this.configGhost_1,
        entity: this.entityInfo.ghost_1,
      });
      this.moveGhost({
        config: this.configGhost_2,
        entity: this.entityInfo.ghost_2,
      });
      this.playerAnimation(this.entityInfo.player);
    },

    mapInxyGrid(config) {
      return {
        x: config.x / this.laneWidth - 0.5,
        y: config.y / this.laneWidth - 0.5,
      };
    },
    checkCollision(entity) {
      entity.collision = {
        left: false,
        right: false,
        up: false,
        down: false,
      };
      var margin = 0.1;
      var roundedX = Math.round(entity.xyGrid.x);
      var roundedY = Math.round(entity.xyGrid.y);

      if (entity.xyGrid.x <= 0) entity.collision.left = true;
      else if (entity.movement == "left" && entity.xyGrid.x <= roundedX) {
        if (this.map[this.randomMapId][roundedY][roundedX - 1] == 1)
          entity.collision.left = true;
        if (
          this.map[this.randomMapId][roundedY][roundedX - 1] != 0 &&
          entity.tag == "ghost"
        )
          entity.collision.left = true;
      }

      if (entity.xyGrid.x >= 19) entity.collision.right = true;
      else if (
        entity.movement == "right" &&
        entity.xyGrid.x % 1 <= margin &&
        entity.xyGrid.x >= roundedX
      ) {
        if (this.map[this.randomMapId][roundedY][roundedX + 1] == 1)
          entity.collision.right = true;
        if (
          this.map[this.randomMapId][roundedY][roundedX + 1] != 0 &&
          entity.tag == "ghost"
        )
          entity.collision.right = true;
      }
      if (entity.xyGrid.y <= 0) entity.collision.up = true;
      else if (entity.movement == "up" && entity.xyGrid.y <= roundedY) {
        if (this.map[this.randomMapId][roundedY - 1][roundedX] == 1)
          entity.collision.up = true;
        if (
          this.map[this.randomMapId][roundedY - 1][roundedX] != 0 &&
          entity.tag == "ghost"
        )
          entity.collision.up = true;
      }
      if (entity.xyGrid.y >= 9) entity.collision.down = true;
      else if (
        entity.movement == "down" &&
        entity.xyGrid.y % 1 <= margin &&
        entity.xyGrid.y >= roundedY
      ) {
        if (this.map[this.randomMapId][roundedY + 1][roundedX] == 1)
          entity.collision.down = true;
        if (
          this.map[this.randomMapId][roundedY + 1][roundedX] != 0 &&
          entity.tag == "ghost"
        )
          entity.collision.down = true;
      }
    },

    ghostCollision(entity) {
      var possibleDirection = [];
      var roundedX = Math.round(entity.xyGrid.x);
      var roundedY = Math.round(entity.xyGrid.y);
      var cd = 300;
      switch (entity.movement) {
        case "left":
          if (roundedY > 0) {
            if (this.map[this.randomMapId][roundedY - 1][roundedX] == 0)
              possibleDirection.push("up");
          }
          if (roundedY < 9) {
            if (this.map[this.randomMapId][roundedY + 1][roundedX] == 0)
              possibleDirection.push("down");
          }

          break;
        case "right":
          if (roundedY > 0) {
            if (this.map[this.randomMapId][roundedY - 1][roundedX] == 0)
              possibleDirection.push("up");
          }
          if (roundedY < 9) {
            if (this.map[this.randomMapId][roundedY + 1][roundedX] == 0)
              possibleDirection.push("down");
          }

          break;
        case "up":
          if (roundedX > 0) {
            if (this.map[this.randomMapId][roundedY][roundedX - 1] == 0)
              possibleDirection.push("left");
          }
          if (roundedX < 19) {
            if (this.map[this.randomMapId][roundedY][roundedX + 1] == 0)
              possibleDirection.push("right");
          }

          break;
        case "down":
          if (roundedX > 0) {
            if (this.map[this.randomMapId][roundedY][roundedX - 1] == 0)
              possibleDirection.push("left");
          }
          if (roundedX < 19) {
            if (this.map[this.randomMapId][roundedY][roundedX + 1] == 0)
              possibleDirection.push("right");
          }

          break;
      }
      if (possibleDirection.length == 0) {
        switch (entity.movement) {
          case "left":
            possibleDirection.push("right");
            break;
          case "right":
            possibleDirection.push("left");
            break;
          case "up":
            possibleDirection.push("down");
            break;
          case "down":
            possibleDirection.push("up");
            break;
        }
      }
      entity.randomRouteCD = false;
      setTimeout(() => {
        entity.randomRouteCD = true;
      }, cd);
      entity.movement =
        possibleDirection[Math.floor(Math.random(possibleDirection.length))];
    },

    ghostRandomRoute(entity) {
      var margin = 0.1;
      var cd = 300;
      var possibleDirection = [entity.movement];
      var roundedX = Math.round(entity.xyGrid.x);
      var roundedY = Math.round(entity.xyGrid.y);
      if (roundedX <= 0 || roundedX >= 19 || roundedY <= 0 || roundedY >= 9)
        return 0;
      switch (entity.movement) {
        case "left":
          if (
            entity.xyGrid.x % 1 >= 1 - margin &&
            entity.xyGrid.x <= roundedX
          ) {
            if (this.map[this.randomMapId][roundedY - 1][roundedX] == 0)
              possibleDirection.push("up");
            if (this.map[this.randomMapId][roundedY + 1][roundedX] == 0)
              possibleDirection.push("down");
          }
          break;
        case "right":
          if (entity.xyGrid.x % 1 <= margin && entity.xyGrid.x >= roundedX) {
            if (this.map[this.randomMapId][roundedY - 1][roundedX] == 0)
              possibleDirection.push("up");
            if (this.map[this.randomMapId][roundedY + 1][roundedX] == 0)
              possibleDirection.push("down");
          }
          break;
        case "up":
          if (
            entity.xyGrid.y % 1 >= 1 - margin &&
            entity.xyGrid.y <= roundedY
          ) {
            if (this.map[this.randomMapId][roundedY][roundedX - 1] == 0)
              possibleDirection.push("left");
            if (this.map[this.randomMapId][roundedY][roundedX + 1] == 0)
              possibleDirection.push("right");
          }
          break;
        case "down":
          if (entity.xyGrid.y % 1 <= margin && entity.xyGrid.y >= roundedY) {
            if (this.map[this.randomMapId][roundedY][roundedX - 1] == 0)
              possibleDirection.push("left");
            if (this.map[this.randomMapId][roundedY][roundedX + 1] == 0)
              possibleDirection.push("right");
          }
          break;
      }

      var newDirection =
        possibleDirection[Math.floor(Math.random() * possibleDirection.length)];
      if (newDirection != entity.movement) {
        entity.randomRouteCD = false;
        setTimeout(() => {
          entity.randomRouteCD = true;
        }, cd);
      }

      entity.movement = newDirection;
    },

    movePlayer() {
      this.entityInfo.player.xyGrid = this.mapInxyGrid(this.configPlayer);
      this.checkCollision(this.entityInfo.player);
      if (
        this.entityInfo.player.movement == "left" &&
        !this.entityInfo.player.collision.left
      ) {
        this.configPlayer.x -= Math.round(this.laneWidth * 0.1);
        this.configPlayer.y = Math.round(
          (Math.round(this.entityInfo.player.xyGrid.y) + 0.5) * this.laneWidth
        );
      }

      if (
        this.entityInfo.player.movement == "right" &&
        !this.entityInfo.player.collision.right
      ) {
        this.configPlayer.x += Math.round(this.laneWidth * 0.1);
        this.configPlayer.y = Math.round(
          (Math.round(this.entityInfo.player.xyGrid.y) + 0.5) * this.laneWidth
        );
      }

      if (
        this.entityInfo.player.movement == "up" &&
        !this.entityInfo.player.collision.up
      ) {
        this.configPlayer.y -= Math.round(this.laneWidth * 0.1);
        this.configPlayer.x = Math.round(
          (Math.round(this.entityInfo.player.xyGrid.x) + 0.5) * this.laneWidth
        );
      }

      if (
        this.entityInfo.player.movement == "down" &&
        !this.entityInfo.player.collision.down
      ) {
        this.configPlayer.y += Math.round(this.laneWidth * 0.1);
        this.configPlayer.x = Math.round(
          (Math.round(this.entityInfo.player.xyGrid.x) + 0.5) * this.laneWidth
        );
      }
      this.playerCollisionWithGhost();
      this.playerEnterSafeZone();
    },
    moveGhost({ config, entity }) {
      entity.xyGrid = this.mapInxyGrid(config);
      this.checkCollision(entity);
      if (entity.collision[entity.movement]) this.ghostCollision(entity);
      else if (entity.randomRouteCD) this.ghostRandomRoute(entity);
      switch (entity.movement) {
        case "left":
          config.x -= this.laneWidth * 0.05;
          config.y = Math.round(
            (Math.round(entity.xyGrid.y) + 0.5) * this.laneWidth
          );
          break;
        case "right":
          config.x += this.laneWidth * 0.05;
          config.y = Math.round(
            (Math.round(entity.xyGrid.y) + 0.5) * this.laneWidth
          );
          break;
        case "up":
          config.y -= this.laneWidth * 0.05;
          config.x = Math.round(
            (Math.round(entity.xyGrid.x) + 0.5) * this.laneWidth
          );
          break;
        case "down":
          config.y += this.laneWidth * 0.05;
          config.x = Math.round(
            (Math.round(entity.xyGrid.x) + 0.5) * this.laneWidth
          );
          break;
      }
    },
    playerCollisionWithGhost() {
      if (
        this.entitiesDistance(this.configPlayer, this.configGhost_1) <=
          this.configPlayer.radius * 2 ||
        this.entitiesDistance(this.configPlayer, this.configGhost_2) <=
          this.configPlayer.radius * 2
      ) {
        this.initializeEnemyPosition();
        this.initializePlayerPosition();
        this.$emit("play-effect", "WrongSound");
        this.$emit("add-record", [
          this.GameData.Options[this.GameData.Answer],
          "與敵人碰撞",
          "錯誤",
        ]);
      }
    },
    playerEnterSafeZone() {
      if (
        this.map[this.randomMapId][Math.round(this.entityInfo.player.xyGrid.y)][
          Math.round(this.entityInfo.player.xyGrid.x)
        ] != 0 &&
        this.map[this.randomMapId][Math.round(this.entityInfo.player.xyGrid.y)][
          Math.round(this.entityInfo.player.xyGrid.x)
        ] != 1
      ) {
        if (
          this.GameData.Answer + 2 ==
          this.map[this.randomMapId][
            Math.round(this.entityInfo.player.xyGrid.y)
          ][Math.round(this.entityInfo.player.xyGrid.x)]
        ) {
          this.$emit("play-effect", "CorrectSound");
          this.$emit("add-record", [
            this.GameData.Options[this.GameData.Answer],
            this.GameData.Options[
              this.map[this.randomMapId][
                Math.round(this.entityInfo.player.xyGrid.y)
              ][Math.round(this.entityInfo.player.xyGrid.x)] - 2
            ],
            "正確",
          ]);
          this.$emit("next-question");
        } else {
          this.initializeEnemyPosition();
          this.initializePlayerPosition();
          this.$emit("play-effect", "WrongSound");
          this.$emit("add-record", [
            this.GameData.Options[this.GameData.Answer],
            this.GameData.Options[
              this.map[this.randomMapId][
                Math.round(this.entityInfo.player.xyGrid.y)
              ][Math.round(this.entityInfo.player.xyGrid.x)] - 2
            ],
            "錯誤",
          ]);
        }
      }
    },
    entitiesDistance(config_1, config_2) {
      return (
        ((config_1.x - config_2.x) ** 2 + (config_1.y - config_2.y) ** 2) **
        (1 / 2)
      );
    },

    touchStart(e) {
      this.touchPosition = e.target.getStage().getPointerPosition();
      this.joystickVisible = true;
    },
    touchEnd() {
      this.joystickVisible = false;
    },
    moveByJoystick(direction) {
      this.entityInfo.player.movement = direction;
    },

    playerAnimation(entity) {
      if (entity.animation == "open") {
        entity.startDegrees += 3;
        entity.endDegrees -= 3;
        if (entity.startDegrees >= 45) {
          entity.animation = "close";
        }
      } else if (entity.animation == "close") {
        entity.startDegrees -= 3;
        entity.endDegrees += 3;
        if (entity.startDegrees <= 3) {
          entity.animation = "open";
        }
      }
      switch (entity.movement) {
        case "idle":
          this.configPlayer.startRadians = 0;
          this.configPlayer.endRadians = 10;
          break;
        case "left":
          this.configPlayer.startRadians =
            ((entity.startDegrees + 180) * Math.PI) / 180;
          this.configPlayer.endRadians =
            ((entity.endDegrees + 180) * Math.PI) / 180;
          break;
        case "right":
          this.configPlayer.startRadians =
            (entity.startDegrees * Math.PI) / 180;
          this.configPlayer.endRadians = (entity.endDegrees * Math.PI) / 180;
          break;
        case "up":
          this.configPlayer.startRadians =
            ((entity.startDegrees + 270) * Math.PI) / 180;
          this.configPlayer.endRadians =
            ((entity.endDegrees + 270) * Math.PI) / 180;
          break;
        case "down":
          this.configPlayer.startRadians =
            ((entity.startDegrees + 90) * Math.PI) / 180;
          this.configPlayer.endRadians =
            ((entity.endDegrees + 90) * Math.PI) / 180;
          break;
      }
    },
  },
};
</script>
