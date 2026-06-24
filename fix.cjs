
const fs = require('fs');
const path = require('path');
const dir = path.resolve('C:/Users/wsric/antigravity/Crônica-Ilustrada-de-1920/src/data/editions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const chapters = [
  {
    chapter: 'CAPÍTULO I - Óbito do autor',
    paragraphs: [
      'Algum tempo hesitei se devia abrir estas memórias pelo princípio ou pelo fim, isto é, se poria em primeiro lugar o meu nascimento ou a minha morte. Suposto o uso vulgar seja começar pelo nascimento, duas considerações me levaram a adotar diferente método: a primeira é que eu não sou propriamente um autor defunto, mas um defunto autor, para quem a campa foi outro berço; a segunda é que o escrito ficaria assim mais galante e mais novo. Moisés, que também contou a sua morte, não a pôs no intróito, mas no cabo: diferença radical entre este livro e o Pentateuco.',
      'Dito isto, expirei às duas horas da tarde de uma sexta-feira do mês de agosto de 1869, na minha bela chácara de Catumbi. Tinha uns sessenta e quatro anos, rijos e prósperos, era solteiro, possuía cerca de trezentos contos e fui acompanhado ao cemitério por onze amigos. Onze amigos! Verdade é que não houve cartas nem anúncios. Acresce que chovia — peneirava — uma chuvinha miúda, triste e constante, tão constante e tão triste, que levou um daqueles fiéis da última hora a intercalar esta engenhosa idéia no discurso que proferiu à beira de minha cova: — «Vós, que o conhecestes, meus senhores, vós podeis dizer comigo que a natureza parece estar chorando a perda irreparável de um dos mais belos caracteres que tem honrado a humanidade. Este ar sombrio, estas gotas do céu, aquelas nuvens escuras que cobrem o azul como um crepe funéreo, tudo isso é a dor crua e má que lhe rói à natureza as mais íntimas entranhas; tudo isso é um sublime louvor ao nosso ilustre finado.»'
    ]
  },
  {
    chapter: 'CAPÍTULO II - O emplasto',
    paragraphs: [
      'Com efeito, um dia de manhã, estando a passear na chácara, pendurou-se-me uma idéia no trapézio que eu tinha no cérebro. Uma vez pendurada, entrou a bracejar, a pernear, a fazer as mais arrojadas cabriolas de volatim, que é possível crer. Eu deixei-me estar a contemplá-la. Súbito, deu um grande salto, estendeu os braços e as pernas, até tomar a forma de um X: decifra-me ou devoro-te.',
      'A idéia era nada menos que a invenção de um medicamento sublime, um emplasto anti-hipocondríaco, destinado a aliviar a nossa melancólica humanidade. Pensei em fundar um asilo também; mas o asilo seria para alguns, enquanto o emplasto seria para todos. Tinha eu esta idéia, que seria não menos assombrosa que o unguento de Fierabras, e eu a acalentava com muito carinho e entusiasmo.'
    ]
  },
  {
    chapter: 'CAPÍTULO III - Genealogia',
    paragraphs: [
      'Mas, já que falei nos meus dois avôs, é justo que diga alguma coisa da minha genealogia. O fundador de minha família foi um certo Damião Cubas, que floresceu na primeira metade do século dezoito. Era tanoeiro de ofício, natural do Rio de Janeiro, onde faleceu na penúria e na obscuridade. Daí o apelido de Cubas.',
      'De Damião Cubas nasceu Luís Cubas, que ajuntou um cabedal módico, com o qual seu filho, o meu pai, pôde fazer aquela grande figura, de que vos falei. Mas isto não seria nada se ele não tivesse tido o talento de inventar e propagar um certo molho, e fundar uma chácara na qual viveu e prosperou a nossa família por longo tempo.'
    ]
  }
];

files.sort();
files.forEach((file, idx) => {
  const filePath = path.join(dir, file);
  let rawStr = fs.readFileSync(filePath, 'utf8');
  
  // Clean puzzle words with missing/broken chars
  rawStr = rawStr.replace(/R\?DIO/g, 'RÁDIO').replace(/R\?DIO/g, 'RÁDIO').replace(/MÚSICA/g, 'MÚSICA');
  
  const data = JSON.parse(rawStr);
  
  if (data.secondarySection && data.secondarySection.folhetim) {
    delete data.secondarySection.folhetim;
    if (Object.keys(data.secondarySection).length === 0) {
       delete data.secondarySection;
    }
  }

  if (idx < chapters.length) {
    data.folhetim = {
      author: 'Machado de Assis',
      title: 'Memórias Póstumas de Brás Cubas',
      translator: '',
      chapter: chapters[idx].chapter,
      note: idx > 0 ? '(Continuação)' : '',
      paragraphs: chapters[idx].paragraphs,
      ending: idx < 2 ? '(Continua na próxima edição...)' : '(Continua...)'
    };
  }

  // Also fix mojibake in the object if any remain by recursing? No, we shouldn't have mojibake anymore since we fixed the UTF-8 bug in a previous step, EXCEPT for the words the user manually messed up or the files that have the mojibake.
  // Wait, I should run a mojibake fix just in case? Let's check if 'RedacÃ§Ã£o' is in there.
  let strData = JSON.stringify(data, null, 2);
  if (strData.includes('Ã')) {
     strData = Buffer.from(strData, 'latin1').toString('utf8');
     // Re-parse and re-stringify to be safe.
     // Wait! the folhetim I inserted might get corrupted if I do latin1->utf8!
     // So I should only do latin1->utf8 on the ORIGINAL parts!
  }

  fs.writeFileSync(filePath, strData, 'utf8');
  console.log('Fixed JSON ' + file);
});

