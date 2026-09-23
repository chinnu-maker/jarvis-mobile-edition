alert("JARVIS JS LOADED");
// ==========================================
// J.A.R.V.I.S MOBILE EDITION
// GEMINI + MEMORY + VISION + VOICE
// TOOLS
// ==========================================


document.addEventListener("DOMContentLoaded", () => {


// ==========================================
// ELEMENTS
// ==========================================

const chat =
    document.getElementById("chat");

const msg =
    document.getElementById("msg");

const send =
    document.getElementById("send");

const micBtn =
    document.getElementById("mic-btn");

const clearBtn =
    document.getElementById("clear-btn");

const camBtn =
    document.getElementById("cam-btn");

const imgInput =
    document.getElementById("img-input");


// ==========================================
// CHECK ELEMENTS
// ==========================================

console.log("JARVIS JS LOADED");

console.log({
    chat,
    msg,
    send,
    micBtn,
    clearBtn,
    camBtn,
    imgInput
});


if (
    !chat ||
    !msg ||
    !send ||
    !micBtn ||
    !clearBtn ||
    !camBtn ||
    !imgInput
) {

    console.error(
        "JARVIS HTML elements missing."
    );

    return;

}


// ==========================================
// API KEY
// ==========================================

let API_KEY =
    localStorage.getItem("jarvis_key");


if (!API_KEY) {

    API_KEY =
        prompt("Enter your Gemini API Key:");

    if (API_KEY) {

        localStorage.setItem(
            "jarvis_key",
            API_KEY
        );

    }

}


// ==========================================
// MODELS
// ==========================================

const MODELS = [

    "gemini-3.6-flash",

    "gemini-flash-latest"

];


// ==========================================
// NORMAL MEMORY
// ==========================================

let MEMORY = [];

try {

    MEMORY =
        JSON.parse(
            localStorage.getItem(
                "jarvis_memory"
            ) || "[]"
        );

}
catch {

    MEMORY = [];

}


// ==========================================
// PERMANENT MEMORY
// ==========================================

let PERMANENT_MEMORY = [];

try {

    PERMANENT_MEMORY =
        JSON.parse(
            localStorage.getItem(
                "jarvis_permanent_memory"
            ) || "[]"
        );

}
catch {

    PERMANENT_MEMORY = [];

}


// ==========================================
// SAVE MEMORY
// ==========================================

function saveMemory() {

    localStorage.setItem(
        "jarvis_memory",
        JSON.stringify(MEMORY)
    );

}


function savePermanentMemory() {

    localStorage.setItem(
        "jarvis_permanent_memory",
        JSON.stringify(PERMANENT_MEMORY)
    );

}


// ==========================================
// ADD MESSAGE
// ==========================================

function add(text, type) {

    const div =
        document.createElement("div");

    div.className =
        "msg " + type;

    div.innerText =
        text;

    chat.appendChild(div);

    chat.scrollTop =
        chat.scrollHeight;

}


// ==========================================
// LOAD MEMORY
// ==========================================

MEMORY.forEach(item => {

    if (
        item.role === "user"
    ) {

        add(
            item.text,
            "user"
        );

    }

    else if (
        item.role === "model"
    ) {

        add(
            item.text,
            "bot"
        );

    }

});


// ==========================================
// TEXT TO SPEECH
// ==========================================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(
            text
        );

    speech.lang = "en-IN";

    speech.rate = 1;

    speech.pitch = 1;

    speechSynthesis.speak(
        speech
    );

}


// ==========================================
// TOOL HANDLER
// ==========================================

async function handleTools(text) {

    const t =
        text.toLowerCase().trim();


    // ======================================
    // TIME
    // ======================================

    if (
        t.includes("time") ||
        t.includes("what time")
    ) {

        return (
            "The time is " +
            new Date().toLocaleTimeString(
                "en-IN",
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            ) +
            ", Boss."
        );

    }


    // ======================================
    // DATE
    // ======================================

    if (
        t.includes("date") ||
        t.includes("today")
    ) {

        return (
            "Today is " +
            new Date().toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ) +
            ", Boss."
        );

    }


    // ======================================
    // WEATHER
    // ======================================

    if (
        t.includes("weather") ||
        t.includes("temperature")
    ) {

        return new Promise(resolve => {

            if (
                !navigator.geolocation
            ) {

                resolve(
                    "Location is not supported, Boss."
                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                async position => {

                    try {

                        const lat =
                            position.coords.latitude;

                        const lon =
                            position.coords.longitude;


                        const response =
                            await fetch(
                                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
                            );


                        const data =
                            await response.json();


                        const temperature =
                            data
                                ?.current_weather
                                ?.temperature;


                        if (
                            temperature !== undefined
                        ) {

                            resolve(
                                `It is ${temperature} degrees Celsius right now, Boss.`
                            );

                        }

                        else {

                            resolve(
                                "Weather information is unavailable, Boss."
                            );

                        }

                    }
                    catch {

                        resolve(
                            "Weather service error, Boss."
                        );

                    }

                },

                () => {

                    resolve(
                        "Please allow location permission for weather, Boss."
                    );

                }

            );

        });

    }


    // ======================================
    // TIMER
    // ======================================

    const timerMatch =
        t.match(
            /(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/
        );


    if (
        timerMatch &&
        t.includes("timer")
    ) {

        const amount =
            parseInt(
                timerMatch[1]
            );

        const unit =
            timerMatch[2];


        let multiplier =
            60000;


        if (
            unit.includes("second") ||
            unit.includes("sec")
        ) {

            multiplier =
                1000;

        }

        else if (
            unit.includes("hour") ||
            unit.includes("hr")
        ) {

            multiplier =
                3600000;

        }


        const duration =
            amount * multiplier;


        setTimeout(() => {

            const message =
                `Boss, your ${amount} ${unit} timer is finished.`;

            add(
                message,
                "bot"
            );

            speak(message);

        }, duration);


        return (
            `Timer set for ${amount} ${unit}, Boss.`
        );

    }


    // ======================================
    // YOUTUBE
    // ======================================

    if (
        t.includes("youtube")
    ) {

        let query =
            text
                .replace(
                    /search youtube for/i,
                    ""
                )
                .replace(
                    /youtube search/i,
                    ""
                )
                .replace(
                    /youtube/i,
                    ""
                )
                .trim();


        if (!query) {

            window.open(
                "https://www.youtube.com/",
                "_blank"
            );

            return "Opening YouTube, Boss.";

        }


        window.open(
            "https://www.youtube.com/results?search_query=" +
            encodeURIComponent(query),
            "_blank"
        );


        return (
            `Searching YouTube for ${query}, Boss.`
        );

    }


    // ======================================
    // GOOGLE SEARCH
    // ======================================

    if (
        t.startsWith(
            "search google for"
        ) ||
        t.startsWith(
            "google search"
        )
    ) {

        const query =
            text
                .replace(
                    /search google for/i,
                    ""
                )
                .replace(
                    /google search/i,
                    ""
                )
                .trim();


        if (query) {

            window.open(
                "https://www.google.com/search?q=" +
                encodeURIComponent(query),
                "_blank"
            );


            return (
                `Searching Google for ${query}, Boss.`
            );

        }

    }


    // ======================================
    // OPEN GOOGLE
    // ======================================

    if (
        t === "open google" ||
        t === "google"
    ) {

        window.open(
            "https://www.google.com/",
            "_blank"
        );

        return "Opening Google, Boss.";

    }


    // ======================================
    // GMAIL
    // ======================================

    if (
        t === "gmail" ||
        t.includes("open gmail")
    ) {

        window.open(
            "https://mail.google.com/",
            "_blank"
        );

        return "Opening Gmail, Boss.";

    }


    // ======================================
    // WHATSAPP
    // ======================================

    if (
        t === "whatsapp" ||
        t.includes("open whatsapp")
    ) {

        window.open(
            "https://web.whatsapp.com/",
            "_blank"
        );

        return "Opening WhatsApp, Boss.";

    }


    // ======================================
    // INSTAGRAM
    // ======================================

    if (
        t === "instagram" ||
        t.includes("open instagram")
    ) {

        window.open(
            "https://www.instagram.com/",
            "_blank"
        );

        return "Opening Instagram, Boss.";

    }


    // ======================================
    // MAPS
    // ======================================

    if (
        t.startsWith("navigate to") ||
        t.startsWith("go to")
    ) {

        const place =
            text
                .replace(
                    /^navigate to/i,
                    ""
                )
                .replace(
                    /^go to/i,
                    ""
                )
                .trim();


        if (place) {

            window.open(
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(place),
                "_blank"
            );


            return (
                `Opening ${place} in Google Maps, Boss.`
            );

        }

    }


    // ======================================
    // CALCULATOR
    // ======================================

    if (
        t.startsWith("calculate")
    ) {

        const expression =
            text
                .replace(
                    /^calculate/i,
                    ""
                )
                .trim();


        if (
            /^[0-9+\-*/().%\s]+$/
                .test(expression)
        ) {

            try {

                const result =
                    Function(
                        `"use strict"; return (${expression})`
                    )();


                return (
                    `${expression} equals ${result}, Boss.`
                );

            }
            catch {

                return (
                    "I couldn't calculate that, Boss."
                );

            }

        }

    }


    // ======================================
    // BATTERY
    // ======================================

    if (
        t.includes("battery")
    ) {

        if (
            navigator.getBattery
        ) {

            try {

                const battery =
                    await navigator.getBattery();


                const level =
                    Math.round(
                        battery.level * 100
                    );


                const charging =
                    battery.charging
                        ? "and it is charging"
                        : "and it is not charging";


                return (
                    `Battery is ${level} percent ${charging}, Boss.`
                );

            }
            catch {

                return (
                    "I couldn't read the battery level, Boss."
                );

            }

        }


        return (
            "Battery information isn't available in this browser, Boss."
        );

    }


    // ======================================
    // TRANSLATE
    // ======================================

    if (
        t.startsWith("translate")
    ) {

        const query =
            text
                .replace(
                    /^translate/i,
                    ""
                )
                .trim();


        if (!query) {

            return (
                "Tell me what you want translated, Boss."
            );

        }


        try {

            const response =
                await fetch(
                    "https://api.mymemory.translated.net/get?q=" +
                    encodeURIComponent(query) +
                    "&langpair=en|te"
                );


            const data =
                await response.json();


            return (
                "In Telugu: " +
                (
                    data
                        ?.responseData
                        ?.translatedText ||
                    "Translation unavailable."
                )
            );

        }
        catch {

            return (
                "Translation service error, Boss."
            );

        }

    }


    return null;

}


// ==========================================
// GEMINI
// ==========================================

async function callGemini(prompt) {

    if (!API_KEY) {

        throw new Error(
            "Gemini API key is missing."
        );

    }


    const permanentContext =
        PERMANENT_MEMORY.length
            ? `

IMPORTANT PERMANENT MEMORY:

${PERMANENT_MEMORY.join("\n")}

Use these memories when relevant.
`
            : "";


    const contents =
        MEMORY
            .slice(-12)
            .map(item => ({

                role: item.role,

                parts: [
                    {
                        text: item.text
                    }
                ]

            }));


    contents.unshift({

        role: "user",

        parts: [

            {
                text:
                    `You are J.A.R.V.I.S,
a helpful personal AI assistant.

Speak naturally in English or Telugu.

Be concise and helpful.

${permanentContext}`
            }

        ]

    });


    contents.push({

        role: "user",

        parts: [

            {
                text: prompt
            }

        ]

    });


    let lastError = null;


    for (
        const model of MODELS
    ) {

        try {

            const response =
                await fetch(

                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({
                                contents
                            })

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data
                        ?.error
                        ?.message ||
                    "Gemini API error"
                );

            }


            const answer =
                data
                    ?.candidates?.[0]
                    ?.content
                    ?.parts?.[0]
                    ?.text;


            if (answer) {

                return answer;

            }


            throw new Error(
                "Gemini returned no answer."
            );

        }
        catch (error) {

            console.error(
                model,
                error
            );

            lastError =
                error;

        }

    }


    throw (
        lastError ||
        new Error(
            "Gemini request failed."
        )
    );

}


// ==========================================
// ASK JARVIS
// ==========================================

async function askJarvis(text) {

    add(
        text,
        "user"
    );


    try {

        // ==================================
        // PERMANENT MEMORY
        // ==================================

        const lower =
            text.toLowerCase();


        if (
            lower.startsWith(
                "remember permanently"
            ) ||
            lower.startsWith(
                "remember this permanently"
            )
        ) {

            const memoryText =
                text
                    .replace(
                        /^remember this permanently[:\s]*/i,
                        ""
                    )
                    .replace(
                        /^remember permanently[:\s]*/i,
                        ""
                    )
                    .trim();


            if (memoryText) {

                PERMANENT_MEMORY.push(
                    memoryText
                );

                savePermanentMemory();

            }

        }


        // ==================================
        // TOOLS FIRST
        // ==================================

        const toolResult =
            await handleTools(text);


        if (toolResult) {

            add(
                toolResult,
                "bot"
            );


            MEMORY.push({
                role: "user",
                text: text
            });


            MEMORY.push({
                role: "model",
                text: toolResult
            });


            saveMemory();

            speak(toolResult);

            return;

        }


        // ===========
