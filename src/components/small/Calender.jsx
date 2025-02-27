import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarCom = () => {
  const [events, setEvents] = useState([
    
    {
      start: moment().toDate(),
      end: moment().add(1, "days").toDate(),
      title: "Hello K",
    },
    {
      start: moment().toDate(),
      end: moment().add(1, "days").toDate(),
      title: "Hello",
    },
    {
      start: moment().toDate(),
      end: moment().add(1, "days").toDate(),
      title: "Hello",
    },
  ]);

  return (
    <div className="App">
      <Calendar
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="month"
        events={events}
        style={{ height: "100vh" }}
      />
    </div>
  );
};

export default CalendarCom;
