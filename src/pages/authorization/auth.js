import { navigate } from '../general/general.js'

async function sendRequestLogin(page, email, password) {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/account/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
            const data = await response.json();
            const token = data.token;

            localStorage.setItem('token', token);
            navigate(page);
        }

        else if (response.status === 400) {
            const errorData = await response.json();
            const errorElement = document.getElementById("error");
            errorElement.textContent = errorData.message;
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function login(page) {
    const formData = new FormData(document.querySelector('.form-auth'));

    const email = formData.get('email');
    const password = formData.get('password');

    sendRequestLogin(page, email, password);
}
