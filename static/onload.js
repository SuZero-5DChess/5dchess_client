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
    request_data();
}