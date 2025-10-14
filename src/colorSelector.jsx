import React, {useState, useEffect, useMemo} from "react";
import ParticlesBackground from "./particlesBackground";

function SelectColor(){
    const [color0, setColor0] = useState("#ff6a00");
    const [color1, setColor1] = useState("#ebf587");
    const [color2, setColor2] = useState("#a5662f");
    const [color_in_text, setColor] = useState("");
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
            if (timer === 0) {
                const sound = new Audio("src/assets/alarm_sound/lo-fi-alarm-clock-243766.mp3");
                sound.play().catch((err) => console.error("Can not play sound", err));
                const stopTimeout = setTimeout(() => {
                sound.pause();
                sound.currentTime = 0;
                }, 20000);

             return () => clearTimeout(stopTimeout); 
            }
         
            const countDown = setInterval(() => {
                setTimer((prev)=> prev -1);
            }, 1000);
            return() => {
                clearInterval(countDown);
            }
        }, [timer]);

    async function getPalette(color){

        try{
            let rgb;
            if (isHex(color)){
                rgb = hexToRgb(color)
            }else if (isHsl(color)){
                rgb = hslToRgb(color)
            }else if (isHsla(color)){
                rgb = hslaToRgb(color)
            }
            else if(isRgb(color)){
                rgb = color
                .match(/\d+/g)
                .map(Number)
            }else{
                throw new Error("Unsupported color format. Use HEX, RGB, or HSL.")
            }
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
    
    function isHex(color){
        return /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color);
    }
    function isRgb(color){
        return /^rgb\(\s*([0-9]{1,3}\s*,\s*){2}[0-9]{1,3}\s*\)$/.test(color);
    }
    function isHsl(color){
        return /^hsl\(\s*([0-9]{1,3}\s*,\s*){2}[0-9]{1,3}%\s*\)$/.test(color);
    }
    function isHsla(color){
        return /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|0?\.\d+|1(\.0)?)\s*\)$/i.test(color);
    }

    function hslaToRgb(hsla) {
        // Extract numbers: "hsla(200, 50%, 50%, 0.5)" -> [200, 50, 50, 0.5]
        let [h, s, l, a] = hsla.match(/[\d.]+/g).map(Number);

        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        let m = l - c / 2;

        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255),
        ];
        }


    function hexToRgb(hex){
        if (!hex.startsWith("#")) hex = "#" + hex;
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    }
    function hslToRgb(hsl){
        // Extract numbers from string: "hsl(120, 100%, 50%)" -> [120, 100, 50]
        let [h, s, l] = hsl.match(/\d+/g).map(Number);

        // Convert percentages to fractions
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s; // chroma
        let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        let m = l - c / 2;

        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        // Convert to [0,255] range and round
        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        ];
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

    function resetTimer(){
        setTimer(0);
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
    

    
    return( 
        <div style={{position: "relative"}}>
            <ParticlesBackground/>
            <div className="main-container" >

                    <div className="clock-container">
                        <div className="clock" >
                            <span>{formatTime()}</span><br />
                        </div>
                                <div className="timer">
                                    <span>{formatCountDown(timer)}</span> <br/>
                                    <button className="timerMenu">Set Timer</button>
                                    <div className="breakTimer">
                                        <input 
                                            type="number" 
                                            placeholder="Hours" 
                                            value ={hour}
                                            onChange={(e) => setTimerHour(Number(e.target.value))}/> <br/>
                                        <input type="number" 
                                            placeholder="Minutes" 
                                            value ={min}
                                            onChange={(e) => setTimerMin(Number(e.target.value))}/><br />
                                        <input type="number" 
                                            placeholder="Seconds" 
                                            value ={sec}
                                            onChange={(e) => setTimerSec(Number(e.target.value))}/><br />
                                            <button onClick={startTimer}>Start Timer</button> <br />
                                            <button className="stop" onClick ={resetTimer}>Reset Timer</button>
                                
                            </div>
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
                    
                    <div className="text-color-selection">
                        
                    <div className="color-in-text"> 
                            <input type="text" 
                                value={color_in_text} id="hex_color" 
                                placeholder="Insert color code" 
                                onChange={(e) => setColor(e.target.value)}/>
                            <button onClick={() => setColor0(color_in_text)}>submit</button>
                        </div>
                    </div>
                    
                    
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
             </div>
    </div>
)
};
export default SelectColor