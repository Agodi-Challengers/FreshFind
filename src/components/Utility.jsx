import "./Utility.css";
import { FiClock, FiEye, FiMapPin } from "react-icons/fi";
import { useEffect, useState } from "react";

const Utility = () => {
  const [dateTime, setDateTime] = useState(new Date());

  // Live date and time
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateTime);

  return (
    <div className="utility-bar">

      <div className="utility-left">

        <div className="utility-item">
          <FiClock />
          <span>{formattedDate}</span>
        </div>

        <div className="utility-item markets">
          <span className="green-dot"></span>
          <span>6 markets open near you right now</span>
        </div>

      </div>

      <div className="utility-right">

        <div className="utility-item">
          <FiEye />
          <span>12,408 visitors this month</span>
        </div>

        <div className="utility-item">
          <FiMapPin />
          <span>Using your location: Lekki, Lagos</span>
        </div>

      </div>

    </div>
  );
};

export default Utility;