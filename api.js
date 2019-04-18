var express = require('express');
var app = express();
const request = require("request-promise");
const cheerio = require('cheerio');
var bodyParser = require('body-parser');
var cors = require('cors');
var S = require('string');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

var aux = 0;
var aux2 = 0;
var bool = true;
var jsonFaltas = [];

app.use(cors());

app.use(bodyParser.urlencoded());

app.post('/api/getcookie', function(req, res){

  // res.send(req.body.ra);


  
  getCookie(req.body.ra, req.body.senha)
    .then(function (response){
      res.send(response);
    });

});

async function getCookie(ra, senha){

  var options = {
    method: 'POST',
    uri: 'https://aluno.unicesumar.edu.br/lyceump/aonline/middle_logon.asp',
    form: {
      txtnumero_matricula: ra, 
      txtsenha_tac: senha 
    }
  };

  var aux;

  await request(options)
    .then(function (parsedBody) {
      // aux = parsedBody;
    }).catch(function (err){
      // console.log(err['response']['headers']['set-cookie']);
      aux = err['response']['headers']['set-cookie'];
    });

  return aux;
}


app.listen(process.env.PORT || 3000, function(){
  console.log('Servidor rodando!');
});

async function getInfo(ra, senha){

  var cookie = await getCookie(ra, senha);

  var options = await setCookie(cookie);

  var jsonNotas = getJsonNotas(options);

  var jsonFaltas = getJsonFaltas(cookie);

  var json = setJson(await jsonNotas, await jsonFaltas);

  return await json;

}




function setCookie(cookie){
  request.cookie(cookie[0]);

  var headers = {
    'Content-Type': 'application/json',
    'Cookie': cookie
  }
  
  var options = {
    url: 'https://aluno.unicesumar.edu.br/lyceump/aonline/notas_freq.asp',
    method: 'GET',
    headers: headers
  }

  return options;
}

async function getJsonNotas(options){
  var json;
  await request(options)
    .then(function(res){
      var notas;
      var x = 0;

      if(res.length < 1000){
        console.log('Erro no GET das notas!');
        json = 'ERROR';
        return;
      }

      $ = cheerio.load(res);

      $('.tr01 .font01 ').each(function(i, elem){
        switch(x){
          case 1:
            notas += "{ \"Disciplina\": \"" + $(this).text() + "\", ";
            break;
          case 2:
            notas += "\"Bim1\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 3:
            notas += "\"Bim2\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 4:
            notas += "\"S1B1\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 5: 
            notas += "\"S1B2\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 6: 
            notas += "\"Bim3\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 7: 
            notas += "\"Bim4\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 8: 
            notas += "\"S2B3\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 9: 
            notas += "\"S2B4\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + "}, ";
            break;
        }
        x++;
        if(x==10){
          x = 0;
        }
      });
      $('.tr01a .font01 ').each(function(i, elem){
        switch(x){
          case 1:
            notas += "{ \"Disciplina\": \"" + $(this).text() + "\", ";
            break;
          case 2:
            notas += "\"Bim1\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 3:
            notas += "\"Bim2\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 4:
            notas += "\"S1B1\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 5: 
            notas += "\"S1B2\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 6: 
            notas += "\"Bim3\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 7: 
            notas += "\"Bim4\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 8: 
            notas += "\"S2B3\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + ", ";
            break;
          case 9: 
            notas += "\"S2B4\": " + ($(this).text()=='-' ? "\"" + $(this).text() + "\"" : $(this).text()) + "}, ";
            break;
        }
        x++;
        if(x==10){
          x = 0;
        }
      });
      notas = notas.replace('undefined','');
      notas = notas.substr(0,(notas.length -2));
      notas = "{ \"Notas\": [" + notas + "] } ";
      json = JSON.parse(notas);
    }).catch(function(err){
      console.log('Catch no request do GET das notas!');
      json = 'ERROR';
    });

    return json;
  }
  
async function getJsonFaltas(cookie){
  var json;
  
    
  var headers = {
    'Content-Type': 'application/json',
    'Cookie': cookie
  }
  
  var options = {
    url: 'https://aluno.unicesumar.edu.br/lyceump/aonline/ti_selecao_disciplina_frequencia.asp',
    method: 'GET',
    headers: headers
  }

  var a = await request(options)
    .then(function (res){
      var a = [];
      $ = cheerio.load(res);
      $(' dt ').each(function (i,elem){
        a[i] = $(this).html();
      });
      return a;
    });


  a.forEach(function(elem){
    var linkF = 'https://aluno.unicesumar.edu.br/lyceump/aonline/' + S(elem).between("\"","\"").s;
    options.url = linkF;

    jsonFaltas[aux] = {};

    jsonFaltas[aux].Materia = entities.decode(S(elem).between(">","<").s);

    aux++;

    setJsonFaltas(options);
  });

  console.log(jsonFaltas);

}

async function setJsonFaltas(options){
  await request(options)
    .then(async function (res){

      $ = cheerio.load(res);

      await $(' #desc-frequencia .disciplina tbody tr:last-child td ').each(function (i,elem){

        if(bool){
          jsonFaltas[aux2].FaltasPermitidas = $(this).html();
          bool = false;
          console.log(aux2);
        }else{
          jsonFaltas[aux2].FaltasComputadas = $(this).html();
          bool = true;
          aux2++;
          console.log(aux2);
        }


      });
      
    });
    
}