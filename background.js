import * as XLSX from './xlsx.mjs';



const readFile =  async(name)=>{
    let url = chrome.runtime.getURL(name);
    let html = await fetch(url,{ method: 'GET'});
    html = await html.text();
    return html;
    
}


chrome.runtime.onMessage.addListener(
    (request,response,sendResponse)=>{
        if(request.type == "read_html")
        {
            readFile(request.htmlname).then((res)=>{
                console.log(res);
                sendResponse({data:res})
            })
            return true;
        }
        if(request.type == "excel"){
            
            console.log(request.data.length)
            let data = request.data;
            let workbook = XLSX.utils.book_new();
            let worksheet = XLSX.utils.aoa_to_sheet(data);
            console.log(data[1]);
            worksheet["!cols"] = "0".repeat(data[0].length).split("").map((x,i)=>{
                let reducer = data.reduce((w,r)=>Math.max(w,r[i].length),10);
                return {wch :reducer}
            });
            console.log(worksheet);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet");
            console.log(workbook.Sheets["Sheet"])
            let response = XLSX.write(workbook,{type:'base64',bookType:'xlsx'});
            console.log(response);
             sendResponse({data: response});
             return true;
        }
    }
);