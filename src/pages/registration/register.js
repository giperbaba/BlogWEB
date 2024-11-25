import { navigate } from '../general/general.js'

async function sendRequestRegister(page, data) {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/account/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })

        if (response.ok) {
            const data = await response.json();
            const token = data.token;

            localStorage.setItem('token', token);
            navigate(page);
        }
        else { showError(response); }
    }
    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); } 
}

export async function register(page) {
    const formData = new FormData(document.querySelector('.form-register'));

    const fullName = formData.get('fullName');
    const password = formData.get('password');
    const email = formData.get('email');
    const birthDate = new Date(formData.get('birthDate')).toISOString();
    const gender = formData.get('gender');
    const phoneNumber = formData.get('phoneNumber');

    sendRequestRegister(page, {
        fullName,
        password,
        email,
        birthDate,
        gender,
        phoneNumber
    });
}

async function showError(response) {
    if (response.status === 400) {
        const errorData = await response.json();
        const errorElement = document.getElementById("error");
        console.log(errorData);

        if (errorData.title) {
            errorElement.textContent = errorData.title;
        }
        else {
            errorElement.textContent = errorData.DuplicateUserName[0];
        }
    }
}