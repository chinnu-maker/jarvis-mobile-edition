// ================================
// J.A.R.V.I.S MOBILE EDITION
// MEMORY + VISION + VOICE
// ================================


// ---------- API KEY ----------
let API_KEY = localStorage.getItem("jarvis_key");

if (!API_KEY) {
    API_KEY = prompt("Enter your Gemini API Key:");

    if (API_KEY) {
        localStorage.setItem("jarvis_key", API_KEY);
    }
}


// ---------- MODELS ----------
const MODELS = [
    "gemini-3.6-flash",
    "gemini-flash-latest"
];


// ---------- ELEMENTS ----------
const chat = document.getElementById("chat");
const msg = document.getElementById("msg");
const send = document.getElementById("send");

const micBtn = document.getElementById("mic-btn");
const clearBtn = document.getElementById("clear-btn");

const camBtn = document.getElementById("cam-btn");
const imgInput = document.getElementById("img-input");


// ---------- MEMORY ----------
let MEMORY =
    JSON.parse(localStorage.getItem("jarvis_memory") || "[]");


// ---------- SHOW OLD MEMORY ----------
MEMORY.forEach(m => {

    if (m.role === "user") {
        add(m.text, "user");
    }

    if (m.role === "model") {
        add(m.text, "bot");
    }

});


// ---------- SAVE MEMORY ----------
function saveMemory() {

    localStorage.setItem(
        "jarvis_memory",
        JSON.stringify(MEMORY)
    );

}


// ---------- GEMINI TEXT ----------
async function callGemini(prompt) {

    const contents = MEMORY
        .slice(-12)
        .map(m => ({
            role: m.role,
            parts: [
                {
                    text: m.text
                }
            ]
        }));


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

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        contents: contents
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data?.error?.message ||
                    "Gemini API error"
                );
            }


            const text =
                data?.candidates?.[0]?.content?.parts?.[0]?.text;


            if (text) {
                return text;
            }


            throw new Error(
                "No response received from Gemini"
            );

        }

        catch (error) {

            lastError = error;

        }

    }


    throw lastError ||
        new Error("Gemini request failed");

}


// ---------- ASK JARVIS ----------
async function askGemini(text) {

    add(text, "user");


    try {

        const reply =
            await callGemini(text);


        add(reply, "bot");


        MEMORY.push({
            role: "user",
            text: text
        });


        MEMORY.push({
            role: "model",
            text: reply
        });


        saveMemory();


        speak(reply);

    }

    catch (error) {

        console.error(error);

        add(
            "Sorry, I couldn't connect to my AI core. " +
            error.message,
            "bot"
        );

    }

}


// ---------- SEND BUTTON ----------
send.addEventListener("click", () => {

    const text =
        msg.value.trim();


    if (!text) return;


    msg.value = "";


    askGemini(text);

});


// ---------- ENTER KEY ----------
msg.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        e.preventDefault();

        send.click();

    }

});


// =================================
// CAMERA / VISION
// =================================

camBtn.addEventListener("click", () => {

    imgInput.click();

});


imgInput.addEventListener("change", async () => {

    const file =
        imgInput.files[0];


    if (!file) return;


    add(
        "📷 Image captured. Analyzing...",
        "user"
    );


    try {

        const base64 =
            await fileToBase64(file);


        const result =
            await askVision(base64, file.type);


        add(result, "bot");


        speak(result);

    }

    catch (error) {

        console.error(error);

        add(
            "Vision error: " +
            error.message,
            "bot"
        );

    }


    imgInput.value = "";

});


// ---------- FILE TO BASE64 ----------
function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();


        reader.onload = () => {

            const result =
                reader.result;


            const base64 =
                result.split(",")[1];


            resolve(base64);

        };


        reader.onerror = reject;


        reader.readAsDataURL(file);

    });

}


// ---------- VISION REQUEST ----------
async function askVision(base64, mimeType) {

    const prompt =
        `You are J.A.R.V.I.S.

Analyze this image carefully.

Describe what you can see clearly.

If there is text in the image,
read the important text.

Reply naturally in Telugu or English
depending on the user's language.

Keep the answer useful and concise.`;


    let lastError = null;


    for (const model of MODELS) {

        try {

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        contents: [

                            {
                                role: "user",

                                parts: [

                                    {
                                        text: prompt
                                    },

                                    {
                                        inline_data: {
                                            mime_type:
                                                mimeType,
                                            data:
                                                base64
                                        }
                                    }

                                ]

                            }

                        ]

                    })

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data?.error?.message ||
                    "Vision API error"
                );

            }


            const text =
                data?.candidates?.[0]
                    ?.content
                    ?.parts?.[0]
                    ?.text;


            if (text) {

                return text;

            }


            throw new Error(
                "No vision response received"
            );

        }

        catch (error) {

            lastError = error;

        }

    }


    throw lastError ||
        new Error("Vision request failed");

}


// =================================
// CLEAR MEMORY
// =================================

clearBtn.addEventListener("click", () => {

    const confirmClear =
        confirm(
            "Clear all J.A.R.V.I.S memory?"
        );


    if (!confirmClear) return;


    MEMORY = [];


    localStorage.removeItem(
        "jarvis_memory"
    );


    chat.innerHTML = "";


    add(
        "Memory cleared successfully.",
        "bot"
    );

});


// =================================
// VOICE RECOGNITION
// =================================

let recognition = null;


if (
    "webkitSpeechRecognition" in window ||
    "SpeechRecognition" in window
) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    recognition =
        new SpeechRecognition();


    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = () => {

        micBtn.innerText = "🔴";

    };


    recognition.onend = () => {

        micBtn.innerText = "🎤";

    };


    recognition.onerror = error => {

        console.error(
            "Speech error:",
            error
        );

        micBtn.innerText = "🎤";

    };


    recognition.onresult = event => {

        const text =
            event.results[0][0].transcript;


        msg.value = text;


        send.click();

    };


    micBtn.addEventListener(
        "click",
        () => {

            recognition.start();

        }
    );

}

else {

    micBtn.addEventListener(
        "click",
        () => {

            alert(
                "Voice recognition is not supported in this browser."
            );

        }
    );

}


// =================================
// TEXT TO SPEECH
// =================================

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }


    speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang = "en-IN";

    speech.rate = 1;

    speech.pitch = 1;


    speechSynthesis.speak(speech);

}


// =================================
// ADD MESSAGE TO CHAT
// =================================

function add(t, w) {

    const d =
        document.createElement("div");


    d.className =
        "msg " + w;


    d.innerText = t;


    chat.appendChild(d);


    chat.scrollTop =
        chat.scrollHeight;

}
