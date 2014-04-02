var Converter=require("csvtojson").core.Converter;
var csvConverter=new Converter(false); // The parameter false will turn off final result construction. It can avoid huge memory consumption while parsing. The trade off is final result will not be populated to end_parsed event.

var readStream=require("fs").createReadStream("studenti-rd.csv"); 

var writeStream=require("fs").createWriteStream("studenti-rd.json");

var started=false;
csvConverter.on("record_parsed",function(rowJSON){
   if (started){
      writeStream.write(",\n");
   }
   writeStream.write(JSON.stringify(rowJSON));  //write parsed JSON object one by one.
   if (started==false){
      started=true;
   }
});

writeStream.write("[\n"); //write array symbol

csvConverter.on("end_parsed",function(){
   writeStream.write("\n]"); //end array symbol
});

csvConverter.from(readStream);
