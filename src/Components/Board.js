import React from "react";
export const freezeLine = (id) => {
  var lines = document.getElementsByClassName("line" + id);
  for(var i = 0; i < lines.length; i++){
    lines[i].querySelector("input").setAttribute("disabled", "true");
  }
}

const Board = ({inputs}) => {
  let ci = 1;
  let li = 1;
  let id = 0;
  let delay = 1;
  return (
    <div className="board">
      <ul> 
        {inputs.map(field => {
          id++;
          ci++;
          if(ci == 6){
            ci = 1;
            if(li != 5)
              li++;
          }
          
          return(
            <React.Fragment key={id}>
              <li className={"line" + field.line}>
                <input id={field.status === "FOUND" ? "BOARD_FOUND" : field.status === "CONTAINS" ? "BOARD_CONTAINS" : field.status === "BAD" ? "BOARD_BAD" : ""} aria-label={field.line + ":" + field.column} maxLength={1} type="text" className={"wordleLetterInput"} defaultValue={field.val}  disabled={field.frozen ? true : false} onChange={(e) => { 
                    let value = e.target.value;
                    if(value.match(/[^a-zA-Z]/)){
                      value = value.replace(/[^a-zA-Z]/, '');
                      e.target.value = value.toLowerCase();
                    }
                    else{
                      value = value.replace(/[^a-zA-Z]/, '');
                      e.target.value = value.toLowerCase();
                    }
                }}></input>
              </li>
              {li != field.line ? <br></br> : <></>}
          </React.Fragment>);
        })}
      </ul>
    </div>
  );
}
 
export default Board;