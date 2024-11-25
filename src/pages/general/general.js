import { login } from '../authorization/auth.js'
import { register } from '../registration/register.js'

import { edit } from '../profile/profile.js'
import { logout } from '../profile/profile.js'
import { getResponseProfile } from '../profile/profile.js'
import { showProfile } from '../profile/profile.js'

import { pushTags } from '../main/main.js'
import { generatePostOptions } from '../main/main.js'

import { getPosts } from '../main/post/post.js'


export function navigate(page) {
    const pages = {
        authorization: '/src/pages/authorization/authorization.html',
        registration: '/src/pages/registration/registration.html',
        profile: '/src/pages/profile/profile.html',
        main: '/src/pages/main/main.html'
    };

    const url = pages[page];

    const protectedPages = ['profile'];
    const token = localStorage.getItem('token');

    if (protectedPages.includes(page) && !token) {
        alert('Время сеанса истекло');
        return navigate('authorization');
    }

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Page not found");
            return response.text();
        })
        .then(html => {
            document.getElementById('main').innerHTML = html;

            history.pushState({ page: page }, page, `#${page}`);

            if (page === 'profile') {
                const token = localStorage.getItem('token');
                if (token) {
                    getResponseProfile(token)
                        .then(profile => {
                            showProfile(profile);
                            editHeaderProfilePage(profile)
                        })
                        .catch(error => console.error(error));
                }
            }

            if (page === 'authorization') {
                editHeaderMailForButtonEnter();
            }

            if (page === 'main') {
                generatePostOptions();
                pushTags();
            }

        })
        .catch(error => {
            console.log(error);
        });
}

window.addEventListener('popstate', (event) => {
    if (event.state) {
        navigate(event.state.page);
    }
});

if (window.location.hash) {
    const page = window.location.hash.slice(1);
    navigate(page);
}

document.querySelectorAll('.nav-text').forEach(item => {
    item.addEventListener('click', function (event) {
        event.preventDefault();
        const page = item.getAttribute('data-page');
        navigate(page);
    });
});

document.getElementById('main').addEventListener('click', async function (event) {
    //event.preventDefault(); влияет на вход в аккаунт и на работоспособность checkbox
    
    const target = event.target;

    if (!target) return;

    const page = target.getAttribute('data-page');

    switch (target.id) {
        case 'button-page-register':
            navigate(page);
            break;

        case 'button-enter':
            const formAuth = document.querySelector('.form-auth');
            if (formAuth && formAuth.checkValidity()) {
                event.preventDefault();
                login(page);
            }
            else {
                formAuth?.reportValidity();
            }
            break;

        case 'button-register':
            const formRegister = document.querySelector('.form-register');
            if (formRegister && formRegister.checkValidity()) {
                event.preventDefault();
                register(page);
            }
            else {
                formRegister?.reportValidity();
            }
            break;

        case 'button-save-edit':
            const formEdit = document.querySelector('.form-profile');
            if (formEdit && formEdit.checkValidity()) {
                edit();
            }
            else {
                formEdit?.reportValidity();
            }
            break;

        case 'button-apply-filters':
            let currentPageData = await getPosts();
            let currentPage = currentPageData.pagination.current;
            let countPages = currentPageData.pagination.count;

            console.log(currentPage);
            
            const firstButtonPage = document.getElementById('first-button-page');
            const secondButtonPage = document.getElementById('second-button-page');
            const thirdButtonPage = document.getElementById('third-button-page');
            
            firstButtonPage.textContent = currentPage;
            
            firstButtonPage.style.backgroundColor = '#0b6ffd';
            firstButtonPage.style.color = 'white';

            if (countPages >= currentPage + 1) {
                secondButtonPage.textContent = currentPage + 1;
            }
            else if (countPages >= currentPage + 2) {
                thirdButtonPage.textContent = currentPage + 2;
            }
            else if (countPages < currentPage + 1) {
                secondButtonPage.style.visibility = 'hidden';
            }
            else {
                secondButtonPage.style.visibility = 'hidden';
                thirdButtonPage.style.visibility = 'hidden';
            }
            break;


        default:
            break;
    }

    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        phoneInput.addEventListener('input', handlePhoneInput);
    }
});

/*document.getElementById('main').addEventListener('change', async function (event) {
    //event.preventDefault();
    
    const target = event.target;

    if (!target) return;
    switch (target.id) {
    
        case 'posts-count':
            console.log(document.getElementById('posts-count').value)
            await getPosts();
            break;

        default:
            break;
    }
});*/

function handlePhoneInput(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');

    if (value.startsWith('7') || value.startsWith('8')) {
        value = value.slice(1);
    }

    value = value.slice(0, 10);

    input.value = `+7 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 8)}-${value.slice(8, 10)}`;
}

function editHeaderProfilePage(profile) {
    const buttonEnter = document.getElementById("nav-enter");
    const menuDropdown = document.getElementById("dropdown-menu");
    const menuUserMailText = document.getElementById("nav-mail");
    const buttonWritePost = document.getElementById("button-write-post");

    buttonWritePost.style.display = "inline";
    buttonEnter.style.display = "none";
    menuDropdown.style.display = "block";
    menuUserMailText.textContent = `${profile.email} ▼`;

    menuDropdown.removeEventListener('click', openDropdownMenu);
    menuDropdown.addEventListener('click', openDropdownMenu);

    setupLogoutHandler();
    setupProfileHandler();
}

function editHeaderMailForButtonEnter() {
    const buttonEnter = document.getElementById("nav-enter");
    const menuDropdown = document.getElementById("dropdown-menu");
    const buttonWritePost = document.getElementById("button-write-post");

    buttonWritePost.style.display = "none";
    buttonEnter.style.display = "inline";
    menuDropdown.style.display = "none";
}

function openDropdownMenu(event) {
    event.preventDefault();
    const dropdownContent = document.getElementById("dropdown-content");
    dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'flex' : 'none';
}

function handleProfile(event) {
    event.preventDefault();
        navigate('profile');
}

function handleLogout(event) {
    event.preventDefault();
    logout();
    navigate('authorization');
}

function setupProfileHandler() {
    const buttonDropdownProfile = document.getElementById("button-profile");

    buttonDropdownProfile.removeEventListener('click', handleProfile);
    buttonDropdownProfile.addEventListener('click', handleProfile);
}

function setupLogoutHandler() {
    const buttonDropdownLogout = document.getElementById("button-logout");

    buttonDropdownLogout.removeEventListener('click', handleLogout);
    buttonDropdownLogout.addEventListener('click', handleLogout);
}

async function updatePagination() {
    const currentPageData = await getPosts();
    const currentPage = currentPageData.pagination.current;
    const countPages = currentPageData.pagination.count;

    const firstButtonPage = document.getElementById('first-button-page');
    const secondButtonPage = document.getElementById('second-button-page');
    const thirdButtonPage = document.getElementById('third-button-page');
    const buttonPrevPage = document.getElementById('button-prev-page-posts');
    const buttonNextPage = document.getElementById('button-next-page-right');

    firstButtonPage.textContent = currentPage;

    if (countPages >= currentPage + 1) {
        secondButtonPage.textContent = currentPage + 1;
        secondButtonPage.style.visibility = 'visible';
    } else {
        secondButtonPage.style.visibility = 'hidden';
    }

    if (countPages >= currentPage + 2) {
        thirdButtonPage.textContent = currentPage + 2;
        thirdButtonPage.style.visibility = 'visible';
    } else {
        thirdButtonPage.style.visibility = 'hidden';
    }

    if (countPages <= 1) {
        firstButtonPage.style.visibility = 'visible';
        secondButtonPage.style.visibility = 'hidden';
        thirdButtonPage.style.visibility = 'hidden';
    }

    buttonPrevPage.style.visibility = currentPage > 1 ? 'visible' : 'hidden';
    buttonNextPage.style.visibility = currentPage < countPages ? 'visible' : 'hidden';

    firstButtonPage.style.backgroundColor = '#0b6ffd';
    firstButtonPage.style.color = 'white';
}