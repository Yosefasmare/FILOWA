import React, { useState, useEffect } from "react";

const Timer = ({seconds,setSeconds,minutes,setMinutes,hours,setHours,running}) => {
 // New state to track if the timer is running

  let timer;

  useEffect(() => {
    // If running, start the timer
    if (running) {
      timer = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 59) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 59) {
                setHours((prevHours) => prevHours + 1);
                return 0;
              } else {
                return prevMinutes + 1;
              }
            });
            return 0;
          }
          return prevSeconds + 1;
        });
      }, 1000);
    } else {
      // If not running, clear the interval to stop the timer
      clearInterval(timer);
    }

    // Cleanup the interval on component unmount or when running state changes
    return () => clearInterval(timer);
  }, [running]);



  // Formatting the time to show as "hh:mm:ss"
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
   <span className="text-white font-bold">
    {formattedTime}
   </span>
  );
};

export default Timer;
