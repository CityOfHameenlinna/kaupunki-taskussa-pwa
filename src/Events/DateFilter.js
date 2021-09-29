import React, { useEffect, useState } from "react";
import DatePicker, { utils } from "react-modern-calendar-datepicker";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

const myCustomLocale = {
  // months list by order
  months: [
    "Tammikuu",
    "Helmikuu",
    "Maaliskuu",
    "Huhtikuu",
    "Toukokuu",
    "Kesäkuu",
    "Heinäkuu",
    "Elokuu",
    "Syyskuu",
    "Lokakuu",
    "Marraskuu",
    "Joulukuu",
  ],

  // week days by order
  weekDays: [
    {
      name: "Maanantai",
      short: "M",
    },
    {
      name: "Tiistai",
      short: "T",
    },
    {
      name: "Keskiviikko",
      short: "K",
    },
    {
      name: "Torstai",
      short: "T",
    },
    {
      name: "Perjantai",
      short: "P",
    },
    {
      name: "Lauantai",
      short: "L",
      isWeekend: true,
    },
    {
      name: "Sunnuntai", // used for accessibility
      short: "S", // displayed at the top of days' rows
      isWeekend: true, // is it a formal weekend or not?
    },
  ],

  // just play around with this number between 0 and 6
  weekStartingIndex: 6,

  // return a { year: number, month: number, day: number } object
  getToday(gregorainTodayObject) {
    return gregorainTodayObject;
  },

  // return a native JavaScript date here
  toNativeDate(date) {
    return new Date(date.year, date.month - 1, date.day);
  },

  // return a number for date's month length
  getMonthLength(date) {
    return new Date(date.year, date.month, 0).getDate();
  },

  // return a transformed digit to your locale
  transformDigit(digit) {
    return digit;
  },

  // texts in the date picker
  nextMonth: "Next Month",
  previousMonth: "Previous Month",
  openMonthSelector: "Open Month Selector",
  openYearSelector: "Open Year Selector",
  closeMonthSelector: "Close Month Selector",
  closeYearSelector: "Close Year Selector",
  defaultPlaceholder: "Select...",

  // for input range value
  from: "from",
  to: "to",

  // used for input value when multi dates are selected
  digitSeparator: ",",

  // if your provide -2 for example, year will be 2 digited
  yearLetterSkip: 0,

  // is your language rtl or ltr?
  isRtl: false,
};

const DateFilter = (props) => {
  const [selectedStartDay, setSelectedStartDay] = useState(null);
  const [selectedEndDay, setSelectedEndDay] = useState(null);

  useEffect(() => {
    let start = myCustomLocale.getToday(props.startDateFromState);
    let end = myCustomLocale.getToday(props.endDateFromState);

    setSelectedStartDay(start);
    setSelectedEndDay(end);
  }, [props.startDateFromState, props.endDateFromState]);

  return (
    <>
      <DatePicker
        value={selectedStartDay}
        onChange={(selectedStartDay) => {
          props.handleStart(selectedStartDay);
          setSelectedStartDay;
        }}
        inputPlaceholder="Valitse aloituspäivä"
        locale={myCustomLocale}
        shouldHighlightWeekends
        minimumDate={utils().getToday()}
      />
      <DatePicker
        value={selectedEndDay}
        onChange={(selectedEndDay) => {
          props.handleEnd(selectedEndDay);
          setSelectedEndDay;
        }}
        inputPlaceholder="Valitse lopetuspäivä"
        locale={myCustomLocale}
        shouldHighlightWeekends
        minimumDate={selectedStartDay}
      />
    </>
  );
};

export default DateFilter;
