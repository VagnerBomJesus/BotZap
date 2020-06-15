import jimp from 'jimp';
import path from 'path';

import moment from "moment";

import wa from '@open-wa/wa-automate';
//node --experimental-modules src/index.mjs cmd
//automat
moment.locale("pt-pt");

function pegarLinkDeImagemAleatorio() {
    return `https://picsum.photos/400/400?random=${Math.random()}`;
  }
  
  async function pegarDimensoesDaImagem(imagem) {
    const largura = await imagem.getWidth();

    
    const altura = await imagem.getHeight();
  
    return { largura, altura };
  }
  

  async function pegarDimensoesDeTexto({ font, texto }) {
    const largura = await jimp.measureText(font, texto);
    const altura = await jimp.measureTextHeight(font, texto, largura);
  
    return { largura, altura };
  }
  
  function pegarPosicaoCentralDeDimensao({ dimensaoImagem, dimensaoTexto }) {
    return dimensaoImagem / 2 - dimensaoTexto / 2;
  }
  
  (async function () {
    var date = new Date();
    var hour = date.getHours();
    var text_date = "";
    if(date>=0 && date<=12){
      text_date = "BOM DIA ";
    }else if(date>12 && date <= 18){
      text_date = "BOA TARDE";
    }else{
      text_date = "BOA NOITE";
    }

    var semana = date.getDay();
    console.log(semana);
    var texto_week = "";
    if(semana == 0){
      texto_week = "Que você tenha um ótimo";
    }else{
      texto_week = "Que você tenha uma ótima";
    }

    const link = pegarLinkDeImagemAleatorio();
    const imagem = await jimp.read(link);
    const dimensoesDaImagem = await pegarDimensoesDaImagem(imagem);
    const font78 = await jimp.loadFont(path.resolve("src/fonts/font78.fnt"));
    const dimensoesDaFont78 = await pegarDimensoesDeTexto({
      font: font78,
      texto: text_date,
    });
    const font28 = await jimp.loadFont(path.resolve("src/fonts/font28.fnt"));
    let dimensoesDaFont28 = await pegarDimensoesDeTexto({
      font: font28,
      texto: texto_week,
    });
  
    let imagemComTexto = await imagem.print(
      font78,
      pegarPosicaoCentralDeDimensao({
        dimensaoImagem: dimensoesDaImagem.largura,
        dimensaoTexto: dimensoesDaFont78.largura,
      }),
      0,
      text_date
    );
  
    imagemComTexto = await imagemComTexto.print(
      font28,
      pegarPosicaoCentralDeDimensao({
        dimensaoImagem: dimensoesDaImagem.largura,
        dimensaoTexto: dimensoesDaFont28.largura,
      }),
      dimensoesDaImagem.altura - dimensoesDaFont28.altura - 60,
      texto_week
    );
  
    dimensoesDaFont28 = await pegarDimensoesDeTexto({font: font28, texto: moment().format("dddd")});
  
    imagemComTexto = await imagemComTexto.print(
      font28,
      pegarPosicaoCentralDeDimensao({
        dimensaoImagem: dimensoesDaImagem.largura,
        dimensaoTexto: dimensoesDaFont28.largura,
      }),
      dimensoesDaImagem.altura - dimensoesDaFont28.altura - 30,
      moment().format("dddd").toUpperCase()
    );
  
    const imagemBase64 = await imagemComTexto.getBase64Async(jimp.MIME_JPEG);
    
    const cliente = await wa.create();
  
    const grupos = await cliente.getAllChats();
   
   const familiares = grupos;//.filter(grupo => grupo.formattedTitle.indexOf("Eng. Informática", "Cubico Zap","Novo Assunto") !== -1);
  //const familiares = ["Novo Assunto","Cubico Zap"];
  var convidados = ["Cubico Zap "];//
    for(let index = 0; index < familiares.length; index++){
        console.log("|"+familiares[index].formattedTitle.toString()+"|");
        if( convidados.includes(familiares[index].formattedTitle.toString()) ){
          await cliente.sendFile(familiares[index].id._serialized, imagemBase64, 'bomdia.jpeg', "ENVIADO DO ROBÔ DO VAGNER BOM JESUS");
        }
       
      }
  
    
  
  })();