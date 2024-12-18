# 使用官方 Node.js 18 基礎映像
FROM node:18

# 設定工作目錄
WORKDIR /app

# 複製依賴清單，並安裝項目依賴
COPY package*.json ./
RUN npm install

# 複製應用程式代碼
COPY . .

# 預設執行打包指令
CMD ["npm", "run", "build"]
