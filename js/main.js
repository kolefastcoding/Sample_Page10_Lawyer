// Load Google Fonts
window.addEventListener("load", init);

function init() {
    loadFonts();
}

function loadFonts() {
    window.WebFontConfig = {
        custom: {
            families: [
                "Barlow:n1,n2,n3,n4,n5,n6,n7,n8,n9"
            ],
            urls: [
                "https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            ]
        }
    };

    const script = document.createElement("script");

    script.src =
        "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js";

    script.async = true;

    document.head.appendChild(script);
}