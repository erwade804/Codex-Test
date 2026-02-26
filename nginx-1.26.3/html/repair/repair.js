

function highlightNoteSection() {
    const noteSection = document.getElementById("Note-Copy");
    if (noteSection) {
        setTimeout(() => {
            noteSection.classList.add("note-fade");
            console.log("got here");
        }, 1000); // Fades out after 1 second
    }
}