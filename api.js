var express = require('express');
var app = express();
const request = require("request-promise");
const cheerio = require('cheerio');
var bodyParser = require('body-parser');


app.use(bodyParser.json());

app.post('/api', function(req, res){

  getInfo(req.body.ra, req.body.senha)
    .then(function (response){
      res.send(response);
    });

});

app.listen(process.env.PORT || 3000, function(){
  console.log('Servidor rodando! oh yaeh');
});

async function getInfo(ra, senha){

  console.log(ra+senha);
  var cookie = await getCookie(ra, senha);

  var options = await setCookie(cookie);

  var jsonNotas = await getJsonNotas(options);

  return jsonNotas;

}

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
      
    })
    .catch(function (err) {
      aux = err;
    });


  return aux['response']['headers']['set-cookie'];
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

      $('.tr01 .font01').each(function(i, elem){
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
      $('.tr01a .font01').each(function(i, elem){
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