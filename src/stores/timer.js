import { defineStore } from 'pinia';

export const useTimerStore = defineStore('Timer', {
    state: () => ({
      timers: [], // 用於存放多個計時器
    }),
    actions: {
      // 創建計時器
      createTimer(name) {
        // 如果名稱已存在，返回 undefined
        if (this.timers.some(timer => timer.name === name)) {
          console.error(`Timer name "${name}" already exists!`);
          return undefined;
        }
        // 新增計時器
        this.timers.push({
          name,
          sec: 0,
          status: 'pause', // 初始狀態為暫停
          intervalId: null, // 儲存 setInterval 的 ID
        });
        return true;
      },
  
      // 啟動計時器
      timerStart(name) {
        const timer = this.timers.find(timer => timer.name === name);
        if (!timer || timer.status === 'running') return 'fail';
  
        timer.status = 'running';
        timer.intervalId = setInterval(() => {
          timer.sec++;
        }, 1000);
        return 'success start';
      },
  
      // 停止計時器
      timerStop(name) {
        const timer = this.timers.find(timer => timer.name === name);
        if (!timer || timer.status === 'pause') return 'fail';
  
        clearInterval(timer.intervalId);
        timer.intervalId = null;
        timer.status = 'pause';
        return 'success stop';
      },
  
      // 重設計時器
      timerReset(name) {
        const timer = this.timers.find(timer => timer.name === name);
        if (!timer) return undefined;
  
        timer.sec = 0;
        return true;
      },
  
      // 銷毀計時器
      clockDestroy(name) {
        const timerIndex = this.timers.findIndex(timer => timer.name === name);
        if (timerIndex === -1) return undefined;
  
        // 如果計時器正在運行，先停止
        if (this.timers[timerIndex].status === 'running') {
          clearInterval(this.timers[timerIndex].intervalId);
        }
  
        this.timers.splice(timerIndex, 1); // 刪除計時器
        return true;
      },
  
      //重置所有計時器
      resetAllTimers() {
        this.timers.forEach(timer => {
          if (timer.status === 'running') {
            clearInterval(timer.intervalId);
          }
          timer.sec = 0;
          timer.status = 'pause';
          timer.intervalId = null;
        });
      },
    },
    getters: {
      // 獲取計時器時間
      getTime: (state) => (name) => {
        const timer = state.timers.find(timer => timer.name === name);
        return timer ? timer.sec : undefined;
      },
  
      // 獲取所有計時器
      getAllTimers: (state) => state.timers,
    },
  });
  