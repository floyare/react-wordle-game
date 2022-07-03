const Letters = ({letters}) => {
  return (
    <div className="letter-wrapper">
      <div className="letter-buttons">
          {letters.map(letter => {
            if(letter.letter !== undefined){
              return(
                <button className={"wordleButton"} id={letter.status === "FOUND" ? "FOUND" : letter.status === "CONTAINS" ? "CONTAINS" : letter.status === "BAD" ? "BAD" : ""}  key={letter.id}>{letter.letter}</button>
              );
            }
        })}
      </div>
    </div>
  );
}
 
export default Letters;