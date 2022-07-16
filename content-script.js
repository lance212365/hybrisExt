

const EXT_ID = chrome.runtime.id;


const saveCSV = ()=>{
    const defaultName = "hybrisExport"
    var filename = prompt("Save CSV File Name",defaultName);
    if(!filename){
        return;
    }
    if(filename === defaultName){
        filename = defaultName + new Date().getTime();
    }
    var result = document.querySelector('#queryResultTable').innerText.split('\n').map((x,i)=>{
        if(i===0){return x.replaceAll("\t",",");}
        let row = x.split('\t').map((y,n)=>{
           if(y.includes(',')){
               return `"${y}"`
           } 
           return y;
        })
        return row.join(",");
    }).join("\n");
   
    var file = new Blob([result],{type:'text/plain;charset=UTF-8',encoding:'utf-8'})

    
    var a = document.createElement("a"),
            url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename+".csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
    
}

const saveCSVExecute = ()=>{
    const defaultName = "hybrisExport"
    var filename = prompt("Save CSV File Name",defaultName);
    if(!filename){
        return;
    }
    if(filename === defaultName){
        filename = defaultName + new Date().getTime();
    }
    let callback = (data)=>{
        let result = processResult(data)

        var file = new Blob([result],{type:'text/plain;charset=UTF-8',encoding:'utf-8'})

    
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename+".csv";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
    abstractFsqSearch(callback);
}
const saveExcelExecute = async()=>{
    const defaultName = "hybrisExport"
    var filename = prompt("Save Excel File Name",defaultName);
    if(!filename){
        return;
    }
    if(filename === defaultName){
        filename = defaultName + new Date().getTime();
    }
    let callback = async(data)=>{
        let result = [data.headers].concat(data.resultList)
        console.log(result);
        var excelB64 = (await chrome.runtime.sendMessage(EXT_ID, {type:"excel",data:result})).data;
        const base64Response = await fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelB64}`);
        var excelBlob = await base64Response.blob();
        var file = new Blob([excelBlob])

    
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename+".xlsx";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
        
    }
    abstractFsqSearch(callback);

    
}


const saveExcel = async()=>{
    const defaultName = "hybrisExport"
    var filename = prompt("Save Excel File Name",defaultName);
    if(!filename){
        return;
    }
    if(filename === defaultName){
        filename = defaultName + new Date().getTime();
    }
    var result = document.querySelector('#queryResultTable').innerText
                .split("\n").map((x)=>{return x.split('\t')})
                
   
    var excelB64 = (await chrome.runtime.sendMessage(EXT_ID, {type:"excel",data:result})).data;
    const base64Response = await fetch(`data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelB64}`);
    var excelBlob = await base64Response.blob();
    var file = new Blob([excelBlob])

    
    var a = document.createElement("a"),
            url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename+".xlsx";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
    
}

const init = async()=>{
    chrome.runtime.sendMessage(EXT_ID,{type:"read_html",htmlname:"hybrisEXTOverlay.html"},(res)=>{
        console.log(res);
        if(!res){console.log(chrome.runtime.lastError);
        return ;}
        let html = res["data"]

        document.body.insertAdjacentHTML("afterbegin",html);
        var saveQueryButton = document.querySelector("#saveQuerySubmit");
        saveQueryButton.onclick = saveQueryAsJSON
        document.querySelector(".closeMessageBox").onclick = ()=>{
            document.querySelector("#hybrisEXTOverlay").style["display"] = 'none';
        }
    })

    
    
}

const saveQueryAsJSON = async()=>{
    let queryName = document.getElementById("saveQueryName").value;
    let queryText = document.getElementById("saveQueryText").value;
    console.log({"name":queryName,"query":queryText})
    let queryArray = await chrome.storage.sync.get(["savedQuery"]) || [];
    if(queryArray.filter((x)=>{x['name'] === queryName})){
        alert("Query Exist");
        return;
    }
    queryArray.push({"name":queryName,"query":queryText})
    await chrome.storage.sync.set({"savedQuery":queryArray})
    alert("Query Saved")
    
    document.querySelector("#hybrisEXTOverlay").style["display"] = 'none';
}
const showOverlaySaveLoad = async()=>{
    let hybrisEXTOverlay = document.getElementById("hybrisEXTOverlay");
    hybrisEXTOverlay["style"]["display"] = "flex";

}
const processResult = (data)=>{
    
    let headers = data.headers.join(',')
    let rows = data.resultList.map((x)=>{return x.join(',')}).join('\n')
    let result = [headers,rows].join('\n')
    return result
}

init() ;
var exportCsvButton = document.createElement("button");
exportCsvButton.setAttribute("class", "extButtonExport");
exportCsvButton.setAttribute("style", "float:right");
exportCsvButton.setAttribute("id", "extButtonExport1");
exportCsvButton.innerText = "Export CSV";
exportCsvButton.onclick = saveCSV
document.querySelector('#tabsNoSidebar').parentElement.prepend(exportCsvButton);

var exportExcelButton = document.createElement("button");
exportExcelButton.setAttribute("class", "extButtonExport");
exportExcelButton.setAttribute("style", "float:right");
exportExcelButton.setAttribute("id", "extButtonExport2");
exportExcelButton.innerText = "Export Excel";
exportExcelButton.onclick = saveExcel
document.querySelector('#tabsNoSidebar').parentElement.prepend(exportExcelButton);


var saveLoadButton = document.createElement("button");
saveLoadButton.setAttribute("class", "extButtonExport");
saveLoadButton.setAttribute("style", "float:right");
saveLoadButton.setAttribute("id", "extButtonExport3");
saveLoadButton.innerText = "Load/Save Query";
saveLoadButton.onclick = showOverlaySaveLoad
document.querySelector('#tabsNoSidebar').parentElement.prepend(saveLoadButton);


var clipboardResultButton = '<button id="buttonSubmitCopyResult" class="buttonSubmit" style="float: right;">Execute And Copy Result</button>'
var CSVResultButton = '<button id="buttonSubmitCSV" class="buttonSubmit" style="float: right;">Execute And Export CSV</button>'
var ExcelesultButton = '<button id="buttonSubmitExcel" class="buttonSubmit" style="float: right;">Execute And Export XLSX</button>'

const abstractFsqSearch = (callback)=>{
    if(callback == null){
        callback = (data)=>{console.log(data)}
    }
    var url = '/hac/console/flexsearch/execute'
    var fsq = document.querySelector("#flexibleSearchQueryWrapper div.CodeMirror-sizer").innerText.replace(/(\r\n|\n|\r)/gm, "").trim();
    var sql = document.querySelector("#sqlQueryWrapper div.CodeMirror-sizer").innerText.replace(/(\r\n|\n|\r)/gm, "");
    var csrf = document.querySelector("meta[name='_csrf']").content;
    if(fsq.length>0){
        sql = ""
    }
    var dataObject = {
        flexibleSearchQuery :fsq,
        sqlQuery :sql,
        maxCount : document.querySelector("#maxCount1").value,
        user : document.querySelector("#user1").value,
        locale : document.querySelector("#locale1").value,
        commit: false
    };
    var  headers = {
        'Accept' : 'application/json',
        'X-CSRF-TOKEN' : document.querySelector("meta[name='_csrf']").content
    }
    console.log(dataObject);
    $.ajax({
        url : url,
        type : 'POST',
        data : dataObject,
        headers : headers,
        success : callback
    })
}
$("#buttonSubmit1").before(clipboardResultButton);
$("#buttonSubmit1").before(ExcelesultButton);
$("#buttonSubmit1").before(CSVResultButton);
$("#buttonSubmitCSV").on('click',saveCSVExecute)
$("#buttonSubmitExcel").on('click',saveExcelExecute)
$("#buttonSubmitCopyResult").on("click",function (){
    let action = async(data)=>{
        if(data.resultList && data.headers){
            let result = processResult(data)
            await navigator.clipboard.writeText(result)
            alert("Copied")
        }
    }
    abstractFsqSearch(action);
})


//setInterval(abstractFsqSearch,5000)