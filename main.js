const { Console } = require('console');
const csv = require('csv-parser');
const fs = require('fs');
const readlineSync = require('readline-sync');

(async () => {
    const result = [];
    
    var i = 0
    const csvFileAsObject = await new Promise((resolve) => {
        
        fs.createReadStream('./file_hackaton1.csv')
            .pipe(csv({

               
                    mapHeaders: ({ header, index }) => {
                        var modifica = header.replace("/", "_")
                        
                        return modifica
                    } 

            }))
            .on('data', (data) => result.push(data))
            .on('end', () => {
                resolve(result);  
            });
           
    });
    
    const services = [-1] 
    const custoService = []
    const operation = [-1] 
    const custoOperation = []
    const cobranca = [-1]
    const tipoCobranca = []
    const region = [-1]
    const custoRegion = []
    var custoComImposto = 0
    var custoSemImposto = 0
    var custoSemana = [0,0,0,0]  //index = 0 é referente ao custo da semana 1...
   
    for (var i = 0; i<13532; i++) {
        for (var x = 0; x < services.length; x++){
            if (services[x] == -1) {
                services[x] = result[i].lineItem_ProductCode
                custoService[result[i].lineItem_ProductCode] = {
                    custo:0,
                    custoSemana1:0,
                    custoSemana2:0,
                    custoSemana3:0,
                    custoSemana4:0
                }
                services.push(-1)
            }

            if (services[x] == result[i].lineItem_ProductCode) {
                break;
            }
        }    

        for (var x = 0; x < cobranca.length; x++){
            
            if (cobranca[x] == -1) {
                cobranca[x] = result[i].lineItem_LineItemType
                tipoCobranca[result[i].lineItem_LineItemType] = {
                    qt: 0
                }
                cobranca.push(-1)
            }

            if (cobranca[x] == result[i].lineItem_LineItemType) {
                break;
            }
        }  

        for (var x = 0; x < operation.length; x++){
            if (operation[x] == -1) {     
                operation[x] = result[i].lineItem_Operation
                custoOperation[operation[x]] = {
                    custo:0
                }
                operation.push(-1)
            }

            if (operation[x]==result[i].lineItem_Operation) {
                break;
            }
        }   
       
        for (var x = 0; x < region.length; x++){
            
            if (region[x] == -1) {
                region[x] = result[i].product_region
                custoRegion[result[i].product_region] = {
                    custo: 0
                }
                region.push(-1)
            }

            if (region[x] == result[i].product_region) {
                break;
            }
        }  
    }
  
    for(var j = 0; j < 13532; j++) {   
        
/*-Calcula o custo total, custo do serviço, custo da operação, custo regiao -------- ------------*/
        var converte = Number(result[j].lineItem_UnblendedCost) 
        custoService[result[j].lineItem_ProductCode].custo += converte  
        custoRegion[result[j].product_region].custo +=  converte
        custoOperation[result[j].lineItem_Operation].custo += converte      
        custoComImposto += converte
        var converte2 = Number(result[j].lineItem_BlendedCost)
        custoSemImposto += converte2
       
/*-Calcula a quantidade do tipo da cobrança ----------------------------------------------- */     
        tipoCobranca[result[j].lineItem_LineItemType].qt += 1

/*-Custo o custo por Semana ---------------------------------------------------------------------*/
        var start = result[j].lineItem_UsageStartDate
        var finale = result[j].lineItem_UsageEndDate
        var di = start.substring(8,10);
        var df = finale.substring(8,10);
        var hi = start.substring(11,13);
        hi = parseInt(hi,10)
        di = parseInt(di,10)
        df = parseInt(df,10)
        
        if ((di < 8) || (di == 8 && hi < 12)) {                              /*Range da semana 1 */
            custoService[result[j].lineItem_ProductCode].custoSemana1 += converte
            custoSemana [0] += converte
        } else if((di < 15) || (di == 15 && hi < 12)) {                      /*Range da semana 2 */
            custoService[result[j].lineItem_ProductCode].custoSemana2 += converte
            custoSemana [1] += converte
        } else if((di < 22) || (di == 22 && hi < 12)) {                      /*Range da semana 3 */
            custoService[result[j].lineItem_ProductCode].custoSemana3 += converte
            custoSemana [2] += converte
        } else {                                                             /*Range da semana 4 */
            custoService[result[j].lineItem_ProductCode].custoSemana4 += converte
            custoSemana [3] += converte
        }
    }
   
    const imposto = (custoComImposto - custoSemImposto)

    console.log("Bem vindo a central de controle de gastos do iFrut \r\n")
    console.log("1) Aperte 't' para listar seu gasto total")
    console.log("2) Aperte 's' para listar o custo ordenado por serviço")
    console.log("3) Aperte 'o' para listar o custo ordenado por operação")
    console.log("4) Aperte 'c' para listar a quantidade e o tipo de cobrança utilizada")
    console.log("5) Aperte 'r' para listar o custo ordenado por região")
    console.log("6) Aperte 'w' para listar o custo por semana")
    console.log("7) Aperte 'ws' para listar o custo do serviço na semana")
    console.log("8) Aperte 'f' para encerrar o programa \r\n")
    
    var loop = true
    while(loop) {

    var input = readlineSync.question("Digite a funcionalidade: ")
    console.log("\r\n")

    var ServiceOrdenadoPorCusto = [];
    for(var i = 0; i < services.length-1; i++ ) {
        ServiceOrdenadoPorCusto[i] = -1
    }
    
/* -------------------------PRIORIDADE (SERVIÇOS COM CUSTOS IGUAIS)---------------------------*/
    for(var i = 0; i < services.length-1; i++ ) {
        var countEqual = 0;
        var count = 0;
        var custo1 = custoService[services[i]].custo.toFixed(2)
        for(var j = 0; j < services.length-1; j++ ) {
            if (services[i]!=services[j]) {
            var custo2 = custoService[services[j]].custo.toFixed(2)
            if (custo1 <= custo2) {
                count++
                if (custo1 == custo2) {
                    count--
                    countEqual++
                }
            }
            }
        }
        countEqual++
    if (countEqual != 1) {    //Só ordeno quem tiver os custos iguais.            
        var auxcountEqual = countEqual
        for(var w = 0; w < auxcountEqual; w++ ) {
            var aux = ServiceOrdenadoPorCusto[countEqual+count]
            if (aux == -1) {
                ServiceOrdenadoPorCusto[countEqual+count] = services[i]   
                countEqual = 0;
                break
            }
            countEqual--  
        }
    }
    }

/* -----------------------(ORDEM DOS SERVIÇOS COM CUSTOS DIFERENTES)------------------------*/
    for(var i = 0; i < services.length-1; i++ ) {
        var selector = 0;
        for(var j = 0; j < services.length; j++ ) {
            if (services[i] == ServiceOrdenadoPorCusto[j] ) {
                selector = 1;
                break
            }
        }

        if(selector != 1) {
        var custo1 = custoService[services[i]].custo.toFixed(2)
        var count = 0;

        for(var j = 0; j < services.length-1; j++ ) {
            if ( (services[i] != services[j])) {
                var custo2 = custoService[services[j]].custo.toFixed(2)
                if (custo1 < custo2 ) {
                    count++;             
                }                          
            }  
        }
        ServiceOrdenadoPorCusto[count] = services[i]  
        }                        
}

    switch (input) {
        case 't':
            var custo = (custoComImposto).toFixed(2)
            console.log(`Seu custo, no mês de JUN-JUL, foi de: $${custo}`)
          break;
        case 's':      
               
    
        console.log("Custo ordenado por serviço\r\n")
        for(var i = 0; i < services.length-1; i++ ) {
            var custo = custoService[ServiceOrdenadoPorCusto[i]].custo.toFixed(2)
            var porcento = (custo/custoComImposto).toFixed(2)      
                console.log(`${i+1}) ${ServiceOrdenadoPorCusto[i]}: $${custo} (${porcento*100 }%)`)
        }                 
            break

        case 'o':
            var OperationOrdenadoPorCusto = [];
            for(var i = 0; i < operation.length-1; i++ ) {
                OperationOrdenadoPorCusto[i] = -1
            }
            
/* -------------------------PRIORIDADE (OPERACAO COM CUSTOS IGUAIS)---------------------------*/
            for(var i = 0; i < operation.length-1; i++ ) {
                var countEqual = 0;
                var count = 0;
                var custo1 = custoOperation[operation[i]].custo.toFixed(2)
                for(var j = 0; j < operation.length-1; j++ ) {
                    if (operation[i]!=operation[j]) {
                    var custo2 = custoOperation[operation[j]].custo.toFixed(2)
                    if (custo1 <= custo2) {
                        count++
                        if (custo1 == custo2) {
                            count--
                            countEqual++
                        }
                    }
                    }
                }
                countEqual++
            if (countEqual != 1) {    //Só ordeno quem tiver os custos iguais.           
                var auxcountEqual = countEqual
                for(var w = 0; w <= auxcountEqual; w++ ) {
                    var aux = OperationOrdenadoPorCusto[countEqual+count]
                    if (aux == -1) {
                        OperationOrdenadoPorCusto[countEqual+count] = operation[i]   
                        countEqual = 0;
                        break
                    }
                    countEqual--  
                }
            }
            }

/* ---------------------------(ORDEM DOS SERVIÇOS COM CUSTOS DIFERENTES)------------------------*/
            for(var i = 0; i < operation.length-1; i++ ) {
                var selector = 0;
                for(var j = 0; j < operation.length; j++ ) {
                    if (operation[i] == OperationOrdenadoPorCusto[j] ) {
                        selector = 1;
                        break
                    }
                }

                if(selector != 1) {
                var custo1 = custoOperation[operation[i]].custo.toFixed(2)
                var count = 0;

                for(var j = 0; j < operation.length-1; j++ ) {
                    if ( (operation[i] != operation[j])) {
                        var custo2 = custoOperation[operation[j]].custo.toFixed(2)
                        if (custo1 < custo2 ) {
                            count++;             
                        }                          
                    }  
                }
                OperationOrdenadoPorCusto[count] = operation[i]  
                }
                                   
        }
        
        console.log("Custo ordenado por operação \r\n")
        for(var i = 0; i < operation.length-1; i++ ) {
            var custo = custoOperation[OperationOrdenadoPorCusto[i]].custo.toFixed(2)
            var porcento = (custo/custoComImposto).toFixed(2) 
            if (OperationOrdenadoPorCusto[i] == '') {
                OperationOrdenadoPorCusto[i] = "Não definida"
            }       
                console.log(`${i+1}) ${OperationOrdenadoPorCusto[i]}: $${custo} (${porcento*100}%)`)
        }                  
          break;    
        case 'c':
            console.log("Quantidade de cobranças por tipo \r\n")
            for(var i =0; i<cobranca.length-1; i++) {
                var qt =  tipoCobranca[cobranca[i]].qt
                console.log(`${i+1}) ${cobranca[i]}: ${qt}`)
            }
            
            break
        case 'r':
/* ------------------------- PRIORIDADE (REGIÕES COM CUSTOS IGUAIS) ---------------------------*/
            var RegionOrdenadoPorCusto = []
            for(var i = 0; i < region.length-1; i++ ) {
                RegionOrdenadoPorCusto [i] = -1
            }
            for(var i = 0; i < region.length-1; i++ ) {
                var countEqual = 0;
                var count = 0;
                var custo1 = custoRegion[region[i]].custo.toFixed(2)
                for(var j = 0; j < region.length-1; j++ ) {
                    if (region[i]!=region[j]) {
                    var custo2 = custoRegion[region[j]].custo.toFixed(2)
                    if (custo1 <= custo2) {
                        count++
                        if (custo1 == custo2) {
                            count--
                            countEqual++
                        }
                    }
                    }
                }
                countEqual++
            if (countEqual != 1) {    //Só ordeno quem tiver os custos iguais.            
                var auxcountEqual = countEqual
                for(var w = 0; w < auxcountEqual; w++ ) {
                    var aux = RegionOrdenadoPorCusto[countEqual+count]
                    if (aux == -1) {
                        RegionOrdenadoPorCusto[countEqual+count] = region[i]   
                        countEqual = 0;
                        break
                    }
                    countEqual--  
                }
            }
            }
              
           
/* -----------------------(ORDEM DAS REGIÕES COM CUSTOS DIFERENTES)------------------------*/
            for(var i = 0; i < region.length-1; i++ ) {
                var selector = 0;
                for(var j = 0; j < region.length; j++ ) {
                    if (region[i] == RegionOrdenadoPorCusto[j] ) {
                        selector = 1;
                        break
                    }
                }

                if(selector != 1) {
                var custo1 = custoRegion[region[i]].custo.toFixed(2)
                var count = 0;

                for(var j = 0; j < region.length-1; j++ ) {
                   
                    if ( (region[i] != region[j])) {
                        if (region[i] == '') {
                            custo1 = Number(custo1)  //Bug!!
                        }
                        var custo2 = Number(custoRegion[region[j]].custo.toFixed(2))
                 
                        if (custo1 < custo2 ) {
                            count++;             
                        }                          
                    }  
                }
              
                RegionOrdenadoPorCusto[count] = region[i]  
                }                        
        }    

        console.log("Custo ordenado por região\r\n")
        for(var i = 0; i < region.length-1; i++ ) {
            var custo = custoRegion[RegionOrdenadoPorCusto[i]].custo.toFixed(2)
            var porcento = (custo/custoComImposto).toFixed(2)   
            if (RegionOrdenadoPorCusto[i] == '') {
                RegionOrdenadoPorCusto[i] = "Não definida"
            }     
            console.log(`${i+1}) ${RegionOrdenadoPorCusto[i]}: $${custo} (${porcento*100}%)`)
        }    
            break
        case 'w':
            console.log( "Custo na semana\r\n")
            for(var i = 0; i < custoSemana.length; i++ ) {
                if (i == 0) {
                    console.log(`Custo da Semana ${i+1}: $${custoSemana[0].toFixed(2)}`)
                }else {
                    if (custoSemana[i-1] > custoSemana[i]) { //Houve Redução.
                        var n = custoSemana[i-1] - custoSemana[i]
                        var d = custoSemana[i-1]     
                        var q = (n/d).toFixed(2)*100 
                        console.log(`Custo da Semana ${i+1}: $${custoSemana[i].toFixed(2)} - Redução de ${q}%`)
                    }else {  //Houve Aumento
                        var n =  custoSemana[i] - custoSemana[i-1] 
                        var d = custoSemana[i-1]     
                        var q = (n/d).toFixed(2)*100
                        console.log(`Custo da Semana ${i+1}: $${custoSemana[i].toFixed(2)} - Aumento de ${q}%`)
                    }               
                }
            }
            break
        case 'ws':
            
            for(var i = 0; i < services.length-1; i++ ) {
            var  anterior = 0;
              console.log(`${i+1}) ${ServiceOrdenadoPorCusto[i]}:`)
              for(var j = 0; j < 4; j++ ) {
                  if (j == 0) {
                    anterior = custoService[ServiceOrdenadoPorCusto[i]].custoSemana1.toFixed(2)
                    console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana1.toFixed(2)}`)
                  }else {
                      var CustoSemanaAtual = 0
                      if (j == 1) CustoSemanaAtual = custoService[ServiceOrdenadoPorCusto[i]].custoSemana2.toFixed(2)
                      if (j == 2) CustoSemanaAtual = custoService[ServiceOrdenadoPorCusto[i]].custoSemana3.toFixed(2)
                      if (j == 3) CustoSemanaAtual = custoService[ServiceOrdenadoPorCusto[i]].custoSemana4.toFixed(2)

                    if (anterior > CustoSemanaAtual) {     //Houve Redução.
                        var n = anterior - CustoSemanaAtual
                        var d = anterior     
                        var q = (n/d).toFixed(2)

                        if (j == 1) {      // Semana 2
                            anterior = custoService[ServiceOrdenadoPorCusto[i]].custoSemana2.toFixed(2)
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana2.toFixed(2)} - Redução de ${q*100}%`)
                        }else if (j == 2) {  //Semana 3
                            anterior = custoService[ServiceOrdenadoPorCusto[i]].custoSemana3.toFixed(2)
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana3.toFixed(2)} - Redução de ${q*100}%`)
                        }else {     //Semana 4
                            anterior = custoService[ServiceOrdenadoPorCusto[i]].custoSemana4.toFixed(2)
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana4.toFixed(2)} - Redução de ${q*100}%`)
                        } 
                        
                    } else if (anterior == CustoSemanaAtual) {     //Não houve aumento

                        if (j == 1) {  // Semana 2
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana2.toFixed(2)} - Sem aumento ou redução`)
                        }else if (j == 2) {  //Semana 3
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana3.toFixed(2)} - Sem aumento ou redução`)
                        }else {     //Semana 4
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana4.toFixed(2)} - Sem aumento ou redução`)
                        } 

                    }else {  //Houve Aumento
                        var n = CustoSemanaAtual - anterior 
                        var d = anterior    
                        var q = (n/d).toFixed(2)

                        if (j == 1) {  // Semana 2
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana2.toFixed(2)} - Aumento de ${q*100}%`)
                        }else if (j == 2) {  //Semana 3
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana3.toFixed(2)} - Aumento de ${q*100}%`)
                        }else {     //Semana 4
                            console.log(`Custo da Semana ${j+1}: $${custoService[ServiceOrdenadoPorCusto[i]].custoSemana4.toFixed(2)} - Aumento de ${q*100}%`)
                        } 

                       
                    } 

                  }

              }
            
            }
            break  
        case "f": 
        console.log("Programa Encerrado")
        loop = false
            break     
        default: console.log("Funcionalidade inexistente")         
      }

    }

})()


