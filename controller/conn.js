 var mongoClient = require('mongodb').MongoClient;
 var url="mongodb+srv://VaishakS4:intresting@cluster0.6fcs1.mongodb.net/test";
 mongoClient.connect(url,function(err,db){

    if(err) throw err;

    var dbs=db.db("BuzzTalk");
    dbs.createCollection("users",function(err,result){
        if(err) throw err;
        var doc={}
        db.close();
        
    });
  

 });
