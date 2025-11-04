export function DownloadCSV (csv_array,GameName="") {
    // 獲取當前日期
    const today = new Date();

    // 獲取月份和日期，並確保它們為兩位數
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份是從 0 開始的
    const day = String(today.getDate()).padStart(2, '0');

    // 組合成 mmdd 格式
    const mmdd = month + day;

    const arrayToCSV = (arr) => {
        return arr.map(row => row.join(',')).join('\n');
    };

    let csvString = arrayToCSV(csv_array);
    csvString=  '\ufeff'+csvString; // 添加 BOM

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${GameName}_${mmdd}.csv`;

    document.body.appendChild(a);
    a.click();
}

export function MadeCsvFile(id,name,grade,subject,recoders,totaltime,questionRecord,header=["編號","正確答案","學生作答答案","是否正確","作答秒數(單題)","總耗時時間(秒)"]){
    const today = new Date();
    const csv_array = [];
    csv_array.push(["學生姓名"])
    csv_array.push(["遊玩日期",today.toLocaleDateString()])
    csv_array.push(["遊戲名稱",name])
    csv_array.push(["科目",subject])
    csv_array.push(["遊戲ID",id])
    csv_array.push(["遊戲所屬年級",grade])
    csv_array.push(["總耗時時間(秒)",totaltime])
    csv_array.push(["遊玩紀錄"])
    let count=1;
    for(const i in recoders){
        csv_array.push(["第"+count+"關"])
        csv_array.push(header)
        for(const j in recoders[i]){
            const temp=[]
            temp.push(j)
            for(const k in recoders[i][j]){
                temp.push(recoders[i][j][k])
            }
            csv_array.push(temp)
        }
        count++;
    }
    console.log(questionRecord)
    csv_array.push(["題目重現代碼",questionRecord])
    return csv_array;
}

export function ArrayTemplate2Record(arr, level, time,totaltime){
    const templatecode ={
        "%%level%%":level, // 關卡
        "%%time%%":time, // 已用時間
        "%%totaltime%%":totaltime // 總耗時時間(秒)
    }
    arr.forEach((element,index) => {
        if(element in templatecode){
            arr[index]=templatecode[element];
        }
    });
    return arr;
}