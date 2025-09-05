import React, {useState, useEffect} from "react"


function SelectColor(){
    const [color0, setColor0] = useState("#ff6a00");
    const [color1, setColor1] = useState("#ebf587");
    const [color2, setColor2] = useState("#a5662f");
    const [copied, setCopied] = useState(null);
    const [time, setTime] = useState(new Date());
    const [hour, setTimerHour] = useState("");
    const [min, setTimerMin] = useState("");
    const [sec, setTimerSec] = useState("");
    const [timer, setTimer] = useState (0);
    const [palette, setPalette] = useState([]);

        useEffect(() => {
            const intervalID = setInterval(()=>{
                setTime(new Date());
            }, 1000);

            return() => {
                clearInterval(intervalID);
            }
    
        }, [])
        useEffect(() => {
            const endingTime = localStorage.getItem("endTime")
            if(endingTime){
                const remaining = Math.floor((endingTime - Date.now()) / 1000)
                if (remaining > 0){
                    setTimer(remaining);
                }
                else{
                    localStorage.removeItem("endTime");
                }
            }
        }, [])

        useEffect(() => {
            if (timer == 0) {
                playAlarm();
                return;
            }
            const countDown = setInterval(() => {
                setTimer((prev)=> prev -1);
            }, 1000);
            return() => {
                clearInterval(countDown);
            }
        }, [timer])

    async function getPalette(color){

        try{
            const rgb = hexToRgb(color);
            const suggestion = await fetch("http://colormind.io/api/", {
                    method: "POST",
                    body: JSON.stringify({
                    model: "default",
                    input: [rgb, "N", "N", "N", "N"] 
                })
              });
              const data = await suggestion.json();
              setPalette(data.result);
            } catch (err) {
              console.error("Error fetching palette", err);
            }
    }
    
    function hexToRgb(hex){
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    }
    function rgbToHex(r, g, b) {
        const toHex = (n) => {
          const hex = n.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      }
      
        

    function playAlarm(){
        const sound = new Audio("src/assets/alarm_sound/lo-fi-alarm-clock-243766.mp3");
        sound.play().catch((err) => console.error("Can not play sound", err));

    }

    function formatTime(){
        let hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const meridiem = hours > 12 ? "PM" : "AM";

        hours = hours % 12 || 12;
        return `${formatNumbers(hours)}:${formatNumbers(minutes)}:${formatNumbers(seconds)} ${meridiem}`;

    }

    function formatCountDown(seconds){
        const hrs = Math.floor(seconds / 3600);
        const min = Math.floor((seconds % 3600)/ 60);
        const sec = Math.floor(seconds % 60);
        return `${formatNumbers(hrs)}:${formatNumbers(min)}:${formatNumbers(sec)}`;
        
    }

    function formatNumbers(number){
        return (number < 10 ? "0":"") + number;

    }

    function convertToSec(hours, minutes, seconds){
        const totalSeconds = ((hours*3600)+(minutes*60) + Number(seconds));
        const endTime = Date.now() + totalSeconds * 1000;
        localStorage.setItem("endTime", endTime);
        return(totalSeconds);
    }
    function startTimer(){
        setTimer(convertToSec(hour, min, sec));

        setTimeout(()=>{
            setTimerHour("");
            setTimerMin("");
            setTimerSec("");
        }, 1000)
    }

    

    function handelCopy(value){
        navigator.clipboard.writeText(value)
        .then(() => {
            setCopied(value);
            setTimeout(() => setCopied(null), 1000);
        })
        .catch(err => console.error("Copy failed", err));
    }
    
    function handelColorChange0(event){
        setColor0(event.target.value);
    }
    function handelColorChange1(event){
        setColor1(event.target.value);
    }
    function handelColorChange2(event){
        setColor2(event.target.value);
    }

    
    return( <div className="main-container" >

        <div className="clock-container">
            <div className="clock" >
                <span>{formatTime()}</span><br />
                <div className="timer">
                    <label>Time left to take a break</label><br />
                    <span>{formatCountDown(timer)}</span></div>
            </div>
        </div>


        <h2>Color Matcher</h2>
        <div className="dis-container"> 
            <div className="color dis0" 
            onClick={() => handelCopy(color0)} 
            style={{backgroundColor: color0}}>

                <p>{copied === color0 ? "Copied!" : color0}</p>
            </div>


            <div className="color dis1" 
            onClick={() => handelCopy(color1)} 
            style={{backgroundColor: color1}}>
                <p>{copied === color1 ? "Copied!" : color1}</p>
            </div>

            <div className="color dis2" 
            onClick={() => handelCopy(color2)} 
            style={{backgroundColor: color2}}>
                <p>{copied === color2 ? "Copied!" : color2}</p>
            </div>
        </div>
       <div className="input-container">
        <label>color 1</label>
        <input type="color" value={color0} onChange={handelColorChange0}/><br/>
        <label>color 2</label>
        <input type="color" value={color1} onChange={handelColorChange1}/><br/>
        <label>color 3</label>
        <input type="color" value={color2} onChange={handelColorChange2}/><br />
        <div className="palette-button"><button onClick={() => getPalette(color0)}>Generate palette</button></div>
        
        </div>

        <div className ="palette-board">
            {palette.map((rgb, i) => { 
                const hex = `#${rgb.map(x => Math.round(x).toString(16).padStart(2, "0"))
                    .join("")}`;
                return(
                <div
                key={i}   // Have to have a key to prevent the console error
                style={{
                    backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                    width: "80px",
                    height: "80px",
                    margin: "5px",
                    borderRadius: "8px"
                }} 
                onClick={() => handelCopy(hex)}
                >
                    <p style={{
                        display: "flex",
                        justifyContent: "center",
                        alignSelf: "center",
                        padding: "10px"
                        }}>
                        {copied === hex ? "Copied!" : hex}
                    </p>
                </div> 
                );
        })}
        </div>
        <div className="breakTimer">
            <p>Set Timer</p>
            <input 
                type="number" 
                placeholder="Hours" 
                value ={hour}
                onChange={(e) => setTimerHour(Number(e.target.value))}/>
                <br/>
            <input type="number" 
                placeholder="Minutes" 
                value ={min}
                onChange={(e) => setTimerMin(Number(e.target.value))}/><br />
            <input type="number" 
                placeholder="Seconds" 
                value ={sec}
                onChange={(e) => setTimerSec(Number(e.target.value))}/><br />
                <button onClick={startTimer}>Start Timer</button> <br />
        </div>
        
    </div>)
}
export default SelectColor