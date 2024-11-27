import { navigate } from '../general/general.js'
import { handleError } from '../../utils/utils.js';

export async function sendRequestEditProfile(data) {
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch('https://blog.kreosoft.space/api/account/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(data)
        })

        if (response.ok) {
            alert('Профиль отредактирован');
        }

        else if (response.status === 400) {
            const errorData = await response.json();
            console.log(errorData);
            const errorElement = document.getElementById("error");
            errorElement.textContent = errorData.message;
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function getResponseProfile(token) {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/account/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
            const profile = await response.json();
            return profile;
        }
        else {
            handleError(response);
            return null;
        }
    }

    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function showProfile(profile) {
    const fullName = document.getElementById('fullName');
    const birthDate = document.getElementById('birthDate');
    const gender = document.getElementById('gender');
    const email = document.getElementById('email');
    const phoneNumber = document.getElementById('phoneNumber');

    if (fullName) fullName.value = profile.fullName || '';
    if (birthDate) birthDate.value = profile.birthDate.split("T")[0] || '';
    if (gender) gender.value = profile.gender || '';
    if (email) email.value = profile.email || '';
    if (phoneNumber) phoneNumber.value = profile.phoneNumber || '';
}


export async function edit() {
    const fullName = document.getElementById('fullName').value;
    const birthDate = document.getElementById('birthDate').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    const data = {
        email,
        fullName,
        birthDate,
        gender,
        phoneNumber,
    };

    await sendRequestEditProfile(data);
}

export async function logout() {
    const currentToken = localStorage.getItem('token');
    await fetch('https://blog.kreosoft.space/api/account/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    localStorage.removeItem('token');
}