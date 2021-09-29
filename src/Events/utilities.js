// Filter events to only events that are today
export const filterEventsForToday = (eventsData) => {
  const today = new Date();
  let events = null;

  if (eventsData != null) {
    events = eventsData.filter((event) => {
      let start_date = new Date(event.start_time);
      let end_date = new Date(event.end_time);

      if (
        start_date.getDate() == today.getDate() &&
        start_date.getMonth() == today.getMonth() &&
        start_date.getFullYear() == today.getFullYear() &&
        end_date.getDate() == today.getDate() &&
        end_date.getMonth() == today.getMonth() &&
        end_date.getFullYear() == today.getFullYear()
      ) {
        return event;
      }
    });
  }
  return events;
};

// Sort received events and return the sorted list.
// Order is: Events today with 1 day, events today with multiple days, events not today
export const sortEventsByDay = (data) => {
  let today = [];
  let todayMD = [];
  let future = [];
  let events = [];

  data.forEach((item) => {
    let startDate = new Date(item.start_time);
    let endDate = new Date(item.end_time);

    if (item.multi_day) {
      if (Date.now() >= startDate && Date.now() <= endDate) {
        todayMD.push(item);
      } else {
        future.push(item);
      }
    } else if (isToday(startDate)) {
      today.push(item);
    } else {
      future.push(item);
    }
  });

  return (events = events.concat(today, todayMD, future));
};

// Check if received date is today
function isToday(date) {
  const today = new Date();
  return (
    date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
  );
}
