import React from "react";
import { Card, CardTitle, Icon } from "react-materialize";
import eventListStyles from "../css/events/Events.module.scss";

const ICS = require("ics");
const FileSaver = require("file-saver");

const createICS = (eventDetails) => {
  ICS.createEvent(eventDetails, (error, value) => {
    if (error) {
      console.error(error);
      return;
    }
    let blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "tapahtuma.ics");
  });
};

const eventList = (props) => {
  if (!props.data) {
    return null;
  }
  const data = [...props.data.data];

  const nextPage = props.data.meta.next;

  const eventCount = props.data.meta.count;

  const dateFormatter = (date) => {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const dateF = new Intl.DateTimeFormat("fi-FI", options).format(
      new Date(date)
    );
    return dateF;
  };

  return (
    <>
      {data.map((event) => {
        const startDatetime = new Date(event.start_time);
        const endDatetime = new Date(event.end_time);
        const eventICal = {
          start: [
            startDatetime.getFullYear(),
            startDatetime.getMonth() + 1,
            startDatetime.getDate(),
            startDatetime.getHours(),
            startDatetime.getMinutes(),
          ],
          startInputType: "utc",
          end: [
            endDatetime.getFullYear(),
            endDatetime.getMonth() + 1,
            endDatetime.getDate(),
            endDatetime.getHours(),
            endDatetime.getMinutes(),
          ],
          endInputType: "utc",
          title: event.name.fi,
          description: event.short_description_fi,
        };

        let url = `https://www.google.com/maps/search/?api=1&query=${event.location.street_address.fi},${event.location.address_locality.fi}`;

        return (
          <article key={event.id}>
            <Card
              className={eventListStyles.Card}
              // header={<CardTitle image={event.images[0].url} />}
              header={
                <CardTitle image="" className={eventListStyles.CardTitle}>
                  {!!event.info_url ? (
                    !!event.info_url.fi && (
                      <a href={event.info_url.fi}>{event.name.fi}</a>
                    )
                  ) : (
                    <a
                      href={`https://www.hameenlinna.fi/tapahtumat/#/tapahtuma/${event.id
                        }/${event.name.fi
                          .toLowerCase()
                          .replace(/ /g, "-")
                          .replace(/ä/g, "a")
                          .replace(/0/g, "o")
                          .trim()}`}
                    >
                      {event.name.fi}
                    </a>
                  )}
                </CardTitle>
              }
            >
              <div>
                <Icon tiny>date_range</Icon>
                {dateFormatter(event.start_time)} -{" "}
                {dateFormatter(event.end_time)} - <Icon tiny>location_on</Icon>
                <a href={url} target="_blank">
                  {event.location.name.fi}
                </a>
                {" "}
                <Icon tiny>event</Icon>
                <a
                  className={eventListStyles.CalendarCursor}
                  onClick={() => createICS(eventICal)}
                >
                  Kalenterimerkintä
                </a>
              </div>
            </Card>
          </article>
        );
      })}
      {eventCount == 0 && <h6>Ei tapahtumia hakuehdoilla</h6>}
    </>
  );
};

export default eventList;
