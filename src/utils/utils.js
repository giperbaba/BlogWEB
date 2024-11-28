export function formatDateTime(isoString) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear(); // Год
    const hours = String(date.getHours()).padStart(2, '0'); 
    const minutes = String(date.getMinutes()).padStart(2, '0'); 

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function getTruncateDescription(description, maxLength) {
    if (description.length > maxLength) {
        let truncatedDesc = description.slice(0, maxLength);
        
        const lastPunctuationIndex = Math.max(
            truncatedDesc.lastIndexOf('.'),
            truncatedDesc.lastIndexOf('!'),
            truncatedDesc.lastIndexOf('?')
        );

        if (lastPunctuationIndex !== -1) {
            truncatedDesc = truncatedDesc.slice(0, lastPunctuationIndex + 1);
        }


        return truncatedDesc + '...';
    } 
    else {
        return description;
    }
}


export async function handleError(response) {
    let errorMessage = `Unexpected error: ${response.status}`;
    
    try {
        const responseText = await response.text();
        errorMessage += ` - ${responseText}`;
    } 
    catch {
        errorMessage += ' (No additional error details provided)';
    }

    switch (response.status) {
        case 400:
            alert("Bad Request: Please, check data.");
            break;
        case 401:
            alert("Unauthorized: Please, authorize.");
            break;
        case 403:
            alert("Forbidden: You do not have permission to perform this action.");
            break;
        case 404:
            alert("Not Found: Resource could not be found.");
            break;
        case 500:
            alert("Internal Server Error: Please, try again later.");
            break;
        default:
            alert(errorMessage);
            break;
    }

    return null; 
}