export async function getTags() {
    return getRequestTags();
}

async function getRequestTags() {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/tag', {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
    }
    catch(error) { alert(`Error: ${error.message || "Unknown error"}`); } 
}