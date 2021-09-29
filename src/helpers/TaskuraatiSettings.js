const fetch = require("node-fetch");
const readline = require("readline");
const { url } = require("inspector");

//Colors for console output
let color = {
    byNum: (mess, fgNum, bgNum) => {
        mess = mess || "";
        fgNum = fgNum === undefined ? 31 : fgNum;
        bgNum = bgNum === undefined ? 47 : bgNum;
        return (
            "\u001b[" +
            fgNum +
            "m" +
            "\u001b[" +
            bgNum +
            "m" +
            mess +
            "\u001b[39m\u001b[49m"
        );
    },
    //removing fgNum from end because not want to use foreground color, using 40 instead
    // black: (mess, fgNum) => color.byNum(mess, 30, fgNum),
    black: (mess, fgNum) => color.byNum(mess, 30, 40),
    red: (mess, fgNum) => color.byNum(mess, 31, 40),
    green: (mess, fgNum) => color.byNum(mess, 32, 40),
    yellow: (mess, fgNum) => color.byNum(mess, 33, 40),
    blue: (mess, fgNum) => color.byNum(mess, 34, 40),
    magenta: (mess, fgNum) => color.byNum(mess, 35, 40),
    cyan: (mess, fgNum) => color.byNum(mess, 36, 40),
    white: (mess, fgNum) => color.byNum(mess, 37, 40),
};

// Setting for Library module
module.exports.setSettings = async function setUp(variables) {
    // Set default values to settings.json ?
    console.log(color.magenta("Set up Library:"));
    //#region CommonSettings
    variables["proxyURL"] = "";
    let includeProxy = await awaitAnswer(
        "Step:1 " +
        color.yellow(
            "Do you have proxy for fetching the content? (y/n)\n"
        )
    );
    if (includeProxy === "y" || includeProxy === "Y") {
        let addProxyUrl = "";
        let pass = false;
        do {
            addProxyUrl = await awaitAnswer(
                "Step:1 " +
                color.yellow(
                    "Add the url of your proxy (e.g. https://proxy.fi/) \n"
                )
            );

            addProxyUrl = addProxyUrl.trim();

            let statusCode = "";
            console.log(
                color.blue(
                    "Checking connection to " + addProxyUrl + " \nthis may take some time..."
                )
            );
            await fetch(addProxyUrl)
                .then(function (response) {
                    console.log(response.status);
                    statusCode = response.status;
                })
                .catch((error) => {
                    console.log(color.red("ERROR OCCURRED!"));
                    console.log(error);
                });
            if (statusCode === 200) {
                pass = true;
                console.log(color.green("Status OK"));
                variables["proxyURL"] = addProxyUrl;
                //console.log(feedUrl);
                console.log(
                    color.green(addProxyUrl + " response status is 200, url has been added.")
                );
            } else {
                console.error(
                    color.red(
                        "\n ***ERROR! CAN'T Connect to " + addProxyUrl + " check url! *** \n"
                    )
                );
            }
        } while (!pass);

    }

    let addUrl = "";
    pass = false;
    do {
        addUrl = await awaitAnswer(
            "Step:2 " +
            color.yellow(
                "Add the url of your survey (e.g. https://kysely.fi/) \n"
            )
        );

        addUrl = addUrl.trim();
        //url = addUrl;

        let statusCode = "";
        console.log(
            color.blue(
                "Checking connection to " + addUrl + " \nthis may take some time..."
            )
        );
        await fetch(addUrl)
            .then(function (response) {
                console.log(response.status);
                statusCode = response.status;
            })
            .catch((error) => {
                console.log(color.red("ERROR OCCURRED!"));
                console.log(error);
            });
        if (statusCode === 200) {
            pass = true;
            console.log(color.green("Status OK"));

            let urlToSave;
            if (addUrl.toLowerCase().includes("https://")) {
                let url = new URL(addUrl);
                urlToSave = url.host + ":443" + url.pathname
            }

            if (addUrl.toLowerCase().includes("http://")) {
                urlToSave = addUrl.substring(7,)
            }

            if (urlToSave.slice(-1) != "/") {
                urlToSave = urlToSave + "/";
            }

            variables["surveyURL"] = urlToSave;
            
            //console.log(feedUrl);
            console.log(
                color.green(addUrl + " response status is 200, url has been added.")
            );
        } else {
            console.error(
                color.red(
                    "\n ***ERROR! CAN'T Connect to " + addUrl + " check url! *** \n"
                )
            );
        }
    } while (!pass);

    console.log(color.blue("Survey settings done!"));
    return variables;

    //#endregion
};

async function awaitAnswer(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
}
