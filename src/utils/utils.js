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