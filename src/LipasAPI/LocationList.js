import React from "react";
import { Card, CardTitle, Icon } from "react-materialize";
import { Link, useRouteMatch } from "react-router-dom";
import lipasStyles from "../css/LipasAPI/LipasAPI.module.scss";

const locationList = (props) => {
    let match = useRouteMatch()
    if (props.locations == null) {
        return null
    }
    console.log(props);
    let locationArray = props.locations;
    let msg = props.noDataMsg;
    function getInfo(location,msg){
        console.log("Get INfo");
        console.log(location);
        if(location.properties===null || typeof(location.properties)==="undefined" ||  typeof(location.properties.infoFi)==="undefined")
        {
            console.log("Item info NOT AVAILABLE: " + msg);
            return msg;
        }
        else
        {
            console.log("Item info:");
            console.log(location.properties.infoFi);
            return location.properties.infoFi;
        }
    }
    
    return (
        <>
            {locationArray.map((location) => {
                let url = null;
                let placeNameFormatted = location.name.toLowerCase().replace(/ /g, "+")
                if (location.location.coordinates) {
                    if (location.location.coordinates.wgs84) {
                        url = `https://www.google.com/maps/search/?api=1&query=${location.location.coordinates.wgs84.lat},${location.location.coordinates.wgs84.lon}`;
                    }
                }
                return (
                    <article key={location.sportsPlaceId}>
                        <Card
                            className={lipasStyles.Card}
                            header={
                                <CardTitle image="" className={lipasStyles.CardTitle}>
                                {location.name}
                                </CardTitle>
                            }
                        >
                            <div>
                                <p>
                                    {getInfo(location,msg)}
                                </p>
                                <p>
                                    {url != null && <a target="_blank" href={url} ><Icon tiny>location_on</Icon> {location.location.address}</a>}{" "}
                                    {location.www && <a target="_blank" href={location.www}><Icon tiny>link</Icon> www</a>}
                                    {url == null && !location.www && <a target="_blank" href={`https://www.google.fi/search?q=${placeNameFormatted}`}><Icon tiny>link</Icon>Paikalle ei ole annettu muuta tietoa. Hae Googlella tästä.</a> }
                                </p>
                            </div>
                        </Card>
                    </article>
                );
            })}

        </>
    )

}

export default locationList
