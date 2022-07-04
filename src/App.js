import {useState, useEffect, useCallback} from 'react';
import Letters from './Components/Letters';
import Board, { freezeLine } from './Components/Board';
import Navbar from './Components/Navbar';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import toast, { Toaster } from 'react-hot-toast';


export const saveBoardProgress = (board) => {
  localStorage.setItem("wordleBoardProgress", JSON.stringify(board));
}

export const boardProgress = (tempboard) => {
  if(localStorage.getItem("wordleBoardProgress") === null)
    saveBoardProgress(tempboard);

  return JSON.parse(localStorage.getItem("wordleBoardProgress"));
}

export const getLineProgress = () => {
  if(localStorage.getItem("wordleLineProgress") === null)
    localStorage.setItem("wordleLineProgress", JSON.stringify(1));

  return JSON.parse(localStorage.getItem("wordleLineProgress"));
}

export const changeLineProgress = (i) => {
  localStorage.setItem("wordleLineProgress", JSON.stringify(i));
}

function App() {
  const [word, setWord] = useState('movie');
  const [letters, setLetters] = useState(null);
  const [letterInputs, setletterInputs] = useState([]);
  const [termsValidation, setTermsValidation] = useState(false);
  const [gameState, setGame] = useState(false);
  let currentLine = getLineProgress();
  let currentCell = 0;

  const getLatestDate = () => {
    if(localStorage.getItem("wordleDate") === null)
      localStorage.setItem("wordleDate", JSON.stringify({}));
    
    return JSON.parse(localStorage.getItem("wordleDate"));
  }

  const setDate = (date) => {
    localStorage.setItem("wordleDate", JSON.stringify(date));
  }

  function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
  }

  let alphabet = ["q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m",
  ];

  const getLetters = () => {
    var Object = [];
    var id = 0;
    if(localStorage.getItem("wordleProgress") === null){
      alphabet.map((letter) => {
        id++;
        const status = "UNKNOWN";
        var newObject = {id, letter, status};
        Object.push(newObject);
      });

      localStorage.setItem("wordleProgress", JSON.stringify(Object));
      return Object;
    }else{
      return JSON.parse(localStorage.getItem("wordleProgress"));
    }
  }

  const getLatestLine = () => {
    let id = 0;
    let lineidv = 1;
    for(var b = 0; b<= letterInputs.length; b++){
      if(!letterInputs[b].frozen){
        lineidv = letterInputs[id].line;
        break;
      }else{
        id++;
      }
    }
    return lineidv;
  }

  const keyDown = useCallback(event => {
    if(currentLine !== 6){
      //currentLine = getLatestLine();
      currentLine = getLineProgress();
      
      let value = event.key;
      value = value.replace(/[^a-zA-Z]/, '');
      console.log(currentCell);
      if(event.key === "Backspace"){
        if(currentCell != 0){
          currentCell--;
          document.querySelectorAll("[aria-label='" + currentLine + ":" + (currentCell +1) + "']")[0].focus();
        }else{
          document.querySelectorAll("[aria-label='" + currentLine + ":" + 1 + "']")[0].focus();
        }
      }else if(event.key === "Enter"){
        if(currentLine != 6){
          var resultWord = "";
          for(var i = 1; i <= 5; i++){
            resultWord += document.querySelectorAll("[aria-label='" + currentLine + ":" + i + "']")[0].value;
          }

          if(resultWord.length == 5){
            fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + resultWord)
              .then(res => {
                if(!res.ok){
                  throw Error('Error while fetching data.');
                }
                return res.json();
              })
              .then(() => {
                console.log(currentCell);
                freezeLine(currentLine);

                var object = letterInputs;
                const searchWord = word;
  
                for(var i = 1; i <= 5; i++){
                  var index = object.findIndex((obj) => obj.line === currentLine && obj.column === i);
                  object[index].val = document.querySelectorAll("[aria-label='" + currentLine + ":" + i + "']")[0].value;
                  object[index].frozen = true;
                } 
  
                let bi = 1;
                for(var c = 0; c < searchWord.length; c++){
                  var index = object.findIndex((obj) => obj.line === currentLine && obj.column === bi);
  
                  if(searchWord.charAt(c) === document.querySelectorAll("[aria-label='" + currentLine + ":" + bi + "']")[0].value){
                    object[index].status = "FOUND";
                  }else if(searchWord.includes(document.querySelectorAll("[aria-label='" + currentLine + ":" + bi + "']")[0].value)){
                    object[index].status = "CONTAINS";
                  }
  
                  if(object[index].status !== "FOUND" && object[index].status !== "CONTAINS"){
                    object[index].status = "BAD";
                  }
                  bi++;
                } 
  
                if(word === resultWord){
                  for(var i = 1; i <= 5; i++){
                    freezeLine(i);
                  }
                  toast('Good job! The word was ' + resultWord, {
                    icon: '👏',
                  });
                  localStorage.setItem("wordleGameState", JSON.stringify(true));
                  setGame(JSON.parse(localStorage.getItem("wordleGameState")));         
                }else{
                  if(currentLine === 5){
                     toast('Oh.. Well, try again tomorrow!', {
                       icon: '😖',
                     });
                     localStorage.setItem("wordleGameState", JSON.stringify(false));
                  }
                }

                setletterInputs(object);
                saveBoardProgress(letterInputs);

                checkWord(resultWord);
              
                currentLine++;
                changeLineProgress(currentLine);
                currentCell = 0;

              })
              .catch(err => {
                toast('Word not in dictionary', {
                  icon: '🙄',
                });
              })
          }else{
            toast('Wrong word length', {
              icon: '🥶',
            });
          }
        }
      }
      else{
        if(currentCell != 5){
          currentCell++;
          document.querySelectorAll("[aria-label='" + currentLine + ":" + currentCell+ "']")[0].focus();
        }
      }
    }else{
      toast('Try again tomorrow!', {
        icon: '🧐',
      });
    }
  }, [termsValidation]);

  useEffect(() => {
    setGame(JSON.parse(localStorage.getItem("wordleGameState")));
    if(gameState == true){
      var object = letterInputs;
      for(var c = 0; c < letterInputs.length; c++){
        object[c].frozen = true;
      }
      setletterInputs(object);
    }
  }, [gameState])

  useEffect(() => {
    //https://random-word-api.herokuapp.com/word?length=5&number=30 <= words api
    const words = ["movie", "beach", "print", "pride", "stone", "adult", "allow", "alert", "angry", "alone", "alive", "album", "baker", "blood", "group", "dance", "grass", "hotel", "house", "human", "image", "party", "photo", "plane", "pilot", "mouse", "royal", "reach", "route", "react", "sleep", "slide", "basic", "slide", "small", "shelf", "storm", "study", "table", "wheel", "while", "wrong", "write", "young"];

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    var object = {today};
    if(JSON.stringify(object) !== JSON.stringify(getLatestDate())){
      var item = words[Math.floor(Math.random()*words.length)];
      localStorage.removeItem("wordleBoardProgress");
      localStorage.removeItem("wordleProgress");
      setWord(item);
      changeLineProgress(1);

      loadInitFields();

      setLetters(getLetters());
      
      localStorage.setItem("wordleGameState", JSON.stringify(false));
      setDate(object);
    }

    setLetters(getLetters());
    document.addEventListener("keydown", keyDown)
    return() => document.removeEventListener("keydown", keyDown);
  }, [keyDown]);


  const loadInitFields = useCallback(async () => {
    const Object2 = [];

    for(var b = 1; b <= 5; b++){
      for(var c = 1; c <= 5; c++){
        const newObject = {"pos": `${b}:${c}`, "val": "", "line": b, "column": c, "frozen": false, "status": "UNKNOWN"};
        Object2.push(newObject);
      }
    }

    setletterInputs(boardProgress(Object2));
  }, [])

  useEffect(() => {
    loadInitFields();
  }, [loadInitFields])

  useEffect(() => {
    if (!letters) {
      setTermsValidation(true);
    } else {
      setTermsValidation(false);
    }

    if(!termsValidation){
      
    }
  }, [termsValidation])
  

   const changeLetter = (letter, status) => {
      var object = letters;
      var index = object.findIndex((obj) => obj.letter === letter);
      object[index].status = status;

      setLetters(([...letters, object]));
   }

  const checkWord = (myWord) => {
    if(myWord.length === 5 && !isEmptyOrSpaces(myWord)){
      for(var i = 0; i<myWord.length; i++){
        if(myWord.charAt(i) === word.charAt(i)){
          changeLetter(myWord.charAt(i).toLowerCase(), "FOUND");
        }
        else if(word.includes(myWord.charAt(i))){
          var index = letters.findIndex((obj) => obj.letter === myWord.charAt(i));
          if(letters[index].status !== "FOUND"){
            changeLetter(myWord.charAt(i).toLowerCase(), "CONTAINS");
          }
        }
        else{
          changeLetter(myWord.charAt(i).toLowerCase(), "BAD");
        }
      }
      localStorage.setItem("wordleProgress", JSON.stringify(letters));
    }
  }

  const { width, height } = useWindowSize()
  return (
    <div className="App">
      {gameState == true && <Confetti
        width={width}
        height={height}
        ></Confetti>}
      <Toaster></Toaster>
      <Navbar></Navbar>
      {letterInputs && <Board inputs={letterInputs}></Board>}

      {letters && <Letters letters={letters}></Letters>}
    </div>
  );
}

export default App;
