const image_input = document.querySelector('#img');
var upload_image = "";

image_input.addEventListener("change", function() {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        upload_image = reader.result;
        document.querySelector('#display_image').style.backgroundImage= `url(${upload_image})`;
        reader.readAsDataURL(this.files[0]);
    })
});

function openPostActionsPopup () {
    document.getElementById("actions").style.display = "block";
}

function closeActionPopup () {
    document.getElementById("actions").style.display = "none";
}