import React from "react";

const Letters = ({letters}) => {
  return (
    <div className="letter-wrapper">
      <div className="letter-buttons">
          {letters.map(letter => {
            if(letter.letter !== undefined){
              return(
                <React.Fragment key={letter.id}>
                  <button className={"wordleButton"} id={letter.status === "FOUND" ? "FOUND" : letter.status === "CONTAINS" ? "CONTAINS" : letter.status === "BAD" ? "BAD" : ""}  key={letter.id}>{letter.letter}</button>
                  {letter.letter == "p" ? <pre></pre> : null}
                  {letter.letter == "l" ? <pre></pre> : null}
                </React.Fragment>
              );
            }
        })}
      </div>
    </div>
  );
}
 
export default Letters;