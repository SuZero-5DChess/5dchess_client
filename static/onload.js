window.onload = function() 
{
    setup_canvas();

    document.getElementById('text-window').style.visibility = 'hidden';
    document.getElementById('toggle-text').addEventListener('click', () => {
        const textWindow = document.getElementById('text-window');
        const toggleButton = document.getElementById('toggle-text');
        
        if (textWindow.style.visibility === 'hidden') {
            textWindow.style.visibility = 'visible';
            toggleButton.classList.remove('toggle-text-inactive');
            toggleButton.classList.add('toggle-text-active');
        } else {
            textWindow.style.visibility = 'hidden';
            toggleButton.classList.remove('toggle-text-active');
            toggleButton.classList.add('toggle-text-inactive');
        }
    });
    document.getElementById('screenshot').addEventListener('click', () => {
        let canvasImage = document.getElementById('display').toDataURL('image/png');
        // this can be used to download any image from webpage to local disk
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            let a = document.createElement('a');
            a.href = window.URL.createObjectURL(xhr.response);
            function getTimestamp() {
                const now = new Date();
                return now.toISOString().replace(/\D/g, '').slice(0, 14);
            }
            a.download = `5dc_${getTimestamp()}.png`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
        };
        xhr.open('GET', canvasImage); // This is to download the canvas Image
        xhr.send();
    });
    document.addEventListener("keydown", function(event) {
        if (event.key === " ") 
        {
            go_to_center();
        } 
        else if (event.key === "Enter") 
        {
            request_submit();
        }
        else if (event.key === "z")
        {
            request_undo();
        }
        else if (event.key === "y")
        {
            request_redo();
        }
    });
      
    request_data();
}