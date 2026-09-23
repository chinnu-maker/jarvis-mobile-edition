// ==========================================
// J.A.R.V.I.S MOBILE EDITION
// MEMORY + PERMANENT MEMORY
// VISION + VOICE
// 15 TOOLS + GEMINI BRAIN
// ==========================================


// ==========================================
// API KEY
// ==========================================

let API_KEY = localStorage.getItem("jarvis_key");

if (!API_KEY) {

    API_KEY = prompt("Enter your Gemini API Key:");

    if (API_KEY) {
        localStorage.setItem("jarvis_key", API_KEY);
    }
}


// ==========================================
// GEMINI MODELS
// ==========================================

const MODELS = [
    "gemini-3.6-flash",
    "gemini-flash-latest"
];


// ==========================================
// ELEMENTS
// ==========================================

const chat = document.getElementById("chat");
const msg = document.getElementById("msg");
const send = document.getElementById("send");

const micBtn = document.getElementById("mic-btn");
const clearBtn = document.getElementById("clear-btn");

const camBtn = document.getElementById("cam-btn");
const imgInput = document.getElementById("img-input");


// ==========================================
// NORMAL MEMORY
// ==========================================

let MEMORY =
    JSON.parse(
        localStorage.getItem("jarvis_memory") || "[]"
    );


// ==========================================
// PERMANENT MEMORY
// ==========================================

let PERMANENT_MEMORY =
    JSON.parse(
        localStorage.getItem(
            "jarvis_permanent_memory"
        ) || "[]"
    );


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
// LOAD OLD MEMORY
// ==========================================

MEMORY.forEach(m => {

    if (m.role === "user") {
        add(m.text, "user");
    }

    if (m.role === "model") {
        add(m.text, "bot");
    }

});


// ==========================================
// 15 TOOLS
// ==========================================

async function handleTools(text) {

    const t = text.toLowerCase().trim();


    // ======================================
    // 1. TIME
    // ======================================

    if (
        /\btime\b/.test(t) ||
        t.includes("what time") ||
        t.includes("current time") ||
        t.includes("సమయం") ||
        t.includes("టైమ్")
    ) {

        return "The time is " +
            new Date().toLocaleTimeString(
                "en-IN",
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            ) +
            ", Boss.";

    }


    // ======================================
    // 2. DATE
    // ======================================

    if (
        /\bdate\b/.test(t) ||
        t.includes("today's date") ||
        t.includes("today date") ||
        t.includes("తేదీ")
    ) {

        return "Today is " +
            new Date().toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ) +
            ", Boss.";

    }


    // ======================================
    // 3. WEATHER
    // ======================================

    if (
        t.includes("weather") ||
        t.includes("temperature") ||
        t.includes("వాతావరణం") ||
        t.includes("టెంపరేచర్")
    ) {

        return new Promise(resolve => {

            if (!navigator.geolocation) {

                resolve(
                    "Geolocation is not supported on this device, Boss."
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


                        if (
                            data &&
                            data.current_weather
                        ) {

                            resolve(
                                `It is ${data.current_weather.temperature} degrees Celsius right now, Boss.`
                            );

                        }

                        else {

                            resolve(
                                "I couldn't get the current weather, Boss."
                            );

                        }

                    }

                    catch (error) {

                        resolve(
                            "Weather service error, Boss."
                        );

                    }

                },

                () => {

                    resolve(
                        "I need location permission to check the weather, Boss."
                    );

                }

            );

        });

    }


    // ======================================
    // 4. TIMER
    // ======================================

    const timerMatch =
        t.match(
            /(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b/i
        );


    if (
        timerMatch &&
        (
            t.includes("timer") ||
            t.includes("set a timer") ||
            t.includes("start timer") ||
            t.includes("టైమర్")
        )
    ) {

        const amount =
            parseInt(timerMatch[1]);

        const unit =
            timerMatch[2].toLowerCase();


        let factor = 60000;

        if (
            /second|sec/.test(unit)
        ) {

            factor = 1000;

        }

        else if (
            /hour|hr/.test(unit)
        ) {

            factor = 3600000;

        }


        const duration =
            amount * factor;


        setTimeout(
            () => {

                speak(
                    `Boss, your ${amount} ${unit} timer is finished.`
                );

                add(
                    `⏰ Timer finished: ${amount} ${unit}.`,
                    "bot"
                );

            },
            duration
        );


        return `Timer set for ${amount} ${unit}, Boss.`;

    }


    // ======================================
    // 5. TRANSLATE
    // ======================================

    if (
        t.startsWith("translate ")
    ) {

        const q =
            text
                .replace(
                    /^translate\s*/i,
                    ""
                )
                .trim();


        if (!q) {

            return "Tell me what you want me to translate, Boss.";

        }


        try {

            const response =
                await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|te`
                );


            const data =
                await response.json();


            return (
                "In Telugu: " +
                (
                    data?.responseData?.translatedText ||
                    "Translation unavailable."
                )
            );

        }

        catch (error) {

            return "Translate error, Boss.";

        }

    }


    // ======================================
    // 6. YOUTUBE SEARCH
    // ======================================

    if (
        t.includes("youtube") ||
        t.startsWith("play ")
    ) {

        let q =
            text
                .replace(
                    /^(play|search|youtube)\s*/i,
                    ""
                )
                .replace(
                    /\bon youtube\b/i,
                    ""
                )
                .replace(
                    /\byoutube\b/i,
                    ""
                )
                .trim();


        if (!q) {

            window.open(
                "https://www.youtube.com/",
                "_blank"
            );

            return "Opening YouTube, Boss.";

        }


        window.open(
            "https://www.youtube.com/results?search_query=" +
            encodeURIComponent(q),
            "_blank"
        );


        return `Searching YouTube for ${q}, Boss.`;

    }


    // ======================================
    // 7. GOOGLE SEARCH
    // ======================================

    if (
        t.startsWith("search google for ") ||
        t.startsWith("google search ") ||
        t.startsWith("search for ")
    ) {

        let q =
            text
                .replace(
                    /^search google for\s*/i,
                    ""
                )
                .replace(
                    /^google search\s*/i,
                    ""
                )
                .replace(
                    /^search for\s*/i,
                    ""
                )
                .trim();


        if (q) {

            window.open(
                "https://www.google.com/search?q=" +
                encodeURIComponent(q),
                "_blank"
            );

            return `Searching Google for ${q}, Boss.`;

        }

    }


    // ======================================
    // 8. GOOGLE
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
    // 9. GMAIL
    // ======================================

    if (
        t.includes("open gmail") ||
        t === "gmail"
    ) {

        window.open(
            "https://mail.google.com/",
            "_blank"
        );

        return "Opening Gmail, Boss.";

    }


    // ======================================
    // 10. WHATSAPP
    // ======================================

    if (
        t.includes("open whatsapp") ||
        t === "whatsapp"
    ) {

        window.open(
            "https://web.whatsapp.com/",
            "_blank"
        );

        return "Opening WhatsApp, Boss.";

    }


    // ======================================
    // 11. INSTAGRAM
    // ======================================

    if (
        t.includes("open instagram") ||
        t === "instagram"
    ) {

        window.open(
            "https://www.instagram.com/",
            "_blank"
        );

        return "Opening Instagram, Boss.";

    }


    // ======================================
    // 12. GOOGLE MAPS
    // ======================================

    if (
        t.startsWith("navigate to ") ||
        t.startsWith("go to ") ||
        t.startsWith("open maps")
    ) {

        let place =
            text
                .replace(
                    /^navigate to\s*/i,
                    ""
                )
                .replace(
                    /^go to\s*/i,
                    ""
                )
                .replace(
                    /^open maps\s*/i,
                    ""
                )
                .trim();


        if (!place) {

            window.open(
                "https://maps.google.com/",
                "_blank"
            );

            return "Opening Google Maps, Boss.";

        }


        window.open(
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(place),
            "_blank"
        );


        return `Opening directions for ${place}, Boss.`;

    }


    // ======================================
    // 13. CALCULATOR
    // ======================================

    if (
        t.startsWith("calculate ") ||
        t.startsWith("calc ")
    ) {

        let expression =
            text
                .replace(
                    /^calculate\s*/i,
                    ""
                )
                .replace(
                    /^calc\s*/i,
                    ""
                )
                .trim();


        // Only allow mathematical characters
        if (
            /^[0-9+\-*/().%\s]+$/.test(
                expression
            )
        ) {

            try {

                const result =
                    Function(
                        `"use strict"; return (${expression})`
                    )();

                return `${expression} = ${result}, Boss.`;

            }

            catch {

                return "I couldn't calculate that expression, Boss.";

            }

        }

    }


    // ======================================
    // 14. BATTERY
    // ======================================

    if (
        t.includes("battery") ||
        t.includes("battery level")
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


                return `Battery is at ${level} percent, Boss, ${charging}.`;

            }

            catch {

                return "I couldn't read the battery status, Boss.";

            }

        }


        return "Battery information is not available in this browser, Boss.";

    }


    // ======================================
    // 15. CURRENT LOCATION / MAPS
    // ======================================

    if (
        t.includes("my location") ||
        t.includes("where am i") ||
        t.includes("my current location")
    ) {

        return new Promise(resolve => {

            if (!navigator.geolocation) {

                resolve(
                    "Location is not supported on this device, Boss."
                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    const lat =
                        position.coords.latitude;

                    const lon =
                        position.coords.longitude;


                    window.open(
                        `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
                        "_blank"
                    );


                    resolve(
                        "I opened your current location in Google Maps, Boss."
                    );

                },

                () => {

                    resolve(
                        "I need location permission to find your location, Boss."
                    );

                }

            );

        });

    }


    // ======================================
    // NO TOOL MATCH
    // ======================================

    return null;

}


// ==========================================
// GEMINI TEXT BRAIN
// ==========================================

async function callGemini(prompt) {

    const permanentContext =
        PERMANENT_MEMORY.length > 0
            ? `

IMPORTANT PERMANENT MEMORY:

${PERMANENT_MEMORY.join("\n")}

Use these memories whenever relevant.
Do not mention the memory system unless necessary.
`
            : "";


    const contents =
        MEMORY
            .slice(-12)
            .map(m => ({

                role: m.role,

                parts: [
                    {
                        text: m.text
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

You can communicate naturally in
English and Telugu.

Be concise, helpful and natural.

Do not pretend to have abilities that you do not have.

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


    for (const model of MODELS) {

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

                        body: JSON.stringify({

                            contents: contents

                        })

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data?.error?.message ||
                    "Gemini API error"
                );

            }


            const text =
                data
                    ?.candidates?.[0]
                    ?.content?.parts?.[0]
                    ?.text;


            if (text) {

                return text;

            }


            throw new Error(
                "No response received from Gemini"
            );

        }

        catch (error) {

            console.error(
                model,
                error
            );

            lastError = error;

        }

    }


    throw (
        lastError ||
        new Error("Gemini request failed")
    );

}


// ==========================================
// ASK JARVIS
// ==========================================

async function askGemini(text) {

    add(text, "user");


    try {

        const lowerText =
            text.toLowerCase();


        // ==================================
        // PERMANENT MEMORY
        // ==================================

        const isPermanentMemory =
            lowerText.startsWith(
                "remember permanently"
            ) ||
            lowerText.startsWith(
                "remember this permanently"
            );


        if (isPermanentMemory) {

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
        // TRY TOOLS FIRST
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
                                
