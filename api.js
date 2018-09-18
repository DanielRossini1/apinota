var express = require('express');
var app = express();
const request = require("request");
const cheerio = require('cheerio');
var bodyParser = require('body-parser');

var cookie;
var headers;
var options;
var notas;
var x = 0;

app.use(bodyParser.json());

app.post('/api', function(req, res){

  req.body.ra = parseInt(req.body.ra);

  res.setHeader('Access-Control-Allow-Origin', '*');

  console.log('Enviando JSON...');

  request.post('https://aluno.unicesumar.edu.br/lyceump/aonline/middle_logon.asp', { form: { txtnumero_matricula: req.body.ra, txtsenha_tac: req.body.senha } }, function (error, response, body) {
    cookie = response.headers['set-cookie'];
    
    request.cookie(cookie[0]);
    headers = {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
    
    options = {
      url: 'https://aluno.unicesumar.edu.br/lyceump/aonline/notas_freq.asp',
      method: 'GET',
      headers: headers
    }
    
    request(options, function(error, response, body){
      $ = cheerio.load(response.body);
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
  
      // console.log(notas);
      notas = notas.replace('undefined','');
      notas = notas.substr(0,(notas.length -2));
      notas = "{ \"Notas\": [" + notas + "] } ";
      var json = JSON.parse(notas);
      res.send(json);
    });
    
  });

  console.log('JSON Enviado!');
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Servidor rodando!");
});


