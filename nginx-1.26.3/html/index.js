




// Example of making a pane child of a specific div
const pane = document.getElementById('specific-div')
pane.id = 'my-pane';
pane.style.width = '200px';
pane.style.height = '100px';
pane.style.backgroundColor = 'lightblue';
pane.innerText = 'Hello, I am a pane!';
document.getElementById('specific-div').appendChild(pane);


// example of fetching data from an API and logging it to the console
async function load() {
    try {
        const response = await fetch('http://ws-wh-ww:3000/test/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

load();