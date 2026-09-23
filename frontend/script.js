// ===== CAMERA + GALLERY VISION =====

const cameraBtn = document.getElementById("camera-btn");
const galleryBtn = document.getElementById("gallery-btn");

const cameraInput = document.getElementById("camera-input");
const galleryInput = document.getElementById("gallery-input");


// CAMERA
if (cameraBtn && cameraInput) {

    cameraBtn.onclick = () => {
        cameraInput.click();
    };

    cameraInput.onchange = () => {

        const file = cameraInput.files[0];

        if (!file) return;

        analyzeSelectedImage(file);

        // Reset so same photo can be selected again
        cameraInput.value = "";
    };
}


// GALLERY
if (galleryBtn && galleryInput) {

    galleryBtn.onclick = () => {
        galleryInput.click();
    };

    galleryInput.onchange = () => {

        const file = galleryInput.files[0];

        if (!file) return;

        analyzeSelectedImage(file);

        // Reset so same photo can be selected again
        galleryInput.value = "";
    };
}


// IMAGE PROCESSING
function analyzeSelectedImage(file) {

    if (!file.type.startsWith("image/")) {
        add("J.A.R.V.I.S: Please select an image.", "ai");
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {

        const base64 = reader.result.split(",")[1];

        const question =
            input.value.trim() ||
            "Analyze this image and tell me what you see.";

        add("YOU: [IMAGE] " + question, "user");

        input.value = "";

        askVision(
            base64,
            file.type,
            question
        );
    };

    reader.readAsDataURL(file);
}
