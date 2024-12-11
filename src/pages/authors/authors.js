import { requestGetAuthors } from "./author/author.js";
import { formatDateTime } from "../../utils/utils.js";
import { navigate } from "../general/general.js";
import { getPosts } from "../main/post/post.js";
import { updatePagination } from "../main/main.js";
import { showPosts } from "../main/main.js";

export async function showAuthors() {
    let authors = await requestGetAuthors();
    authors = authors.sort((a, b) => a.fullName.toLowerCase() > b.fullName.toLowerCase() ? 1 : -1);

    let sortedAuthors = authors.map((element) => element);

    sortedAuthors.sort((a, b) => {
        if (b.posts !== a.posts) {
            return b.posts - a.posts;
        }
        return b.likes - a.likes;
    });

    const topAuthors = sortedAuthors.slice(0, 3);

    const authorsContainer = document.getElementById('container-authors');
    authors.forEach(author => {
        (topAuthors.includes(author)) ? authorsContainer.appendChild(getAuthorHtml(author, topAuthors)) : authorsContainer.appendChild(getAuthorHtml(author));
    });
}

function getAuthorHtml(author, topAuthors = []) {
    const divAuthor = document.createElement('div');
    divAuthor.classList.add('author');

    divAuthor.addEventListener('click', async () => {
        await navigate('main');

        const waitForForm = () =>
            new Promise((resolve) => {
                const observer = new MutationObserver((mutationsList, observer) => {
                    const form = document.querySelector('#form-filters');
                    if (form) {
                        observer.disconnect();
                        resolve(form);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            });

        const form = document.querySelector('#form-filters') || (await waitForForm());

        const input = form.querySelector('[name="input-search-by-name"]');
        if (input) {
            input.value = author.fullName;
        }
        const currentPageData = await getPosts(1);
        updatePagination(currentPageData);
        await showPosts(currentPageData);

    });


    const containerAuthorCrown = document.createElement('div');
    containerAuthorCrown.classList.add('author-crown');
    const imgAuthor = document.createElement('img');
    if (author.gender === 'Female') {
        imgAuthor.src = '/src/drawable/icon-women.png';
        imgAuthor.id = 'icon-women';
    }
    else {
        imgAuthor.src = '/src/drawable/icon-men.png';
        imgAuthor.id = 'icon-man';
    }
    containerAuthorCrown.appendChild(imgAuthor);

    if (topAuthors.includes(author)) {
        const crown = document.createElement('img');
        crown.id = 'icon-crown';
        if (topAuthors[0] == author) {
            crown.src = '/src/drawable/icon-crown-gold.png';
        }
        else if (topAuthors[1] == author) {
            crown.src = '/src/drawable/icon-crown-light-grey.png';
        }
        else {
            crown.src = '/src/drawable/icon-crown-grey.png';
        }
        containerAuthorCrown.appendChild(crown);

    }
    divAuthor.appendChild(containerAuthorCrown);

    const divMainInfo = document.createElement('div');
    divMainInfo.classList.add('main-info-author');

    const containerNameCreateTime = document.createElement('div');
    containerNameCreateTime.classList.add('name-createtime');

    const name = document.createElement('p');
    name.classList.add('text-name');
    name.textContent = author.fullName;

    const createTime = document.createElement('p');
    createTime.classList.add('text-cursive')
    createTime.textContent = 'Создан: ' + formatDateTime(author.created).slice(0, 10);

    containerNameCreateTime.appendChild(name);
    containerNameCreateTime.appendChild(createTime);

    const containerBirthday = document.createElement('div');
    containerBirthday.classList.add('birthday');

    const labelForBirth = document.createElement('p');
    labelForBirth.classList.add('label-birth')
    labelForBirth.textContent = 'Дата рождения: ';

    const textBirthday = document.createElement('p');
    textBirthday.classList.add('text-birthday');
    textBirthday.textContent = formatDateTime(author.birthDate);

    containerBirthday.appendChild(labelForBirth);
    containerBirthday.appendChild(textBirthday);

    divMainInfo.appendChild(containerNameCreateTime);
    divMainInfo.appendChild(containerBirthday);

    divAuthor.appendChild(divMainInfo);

    const containerCount = document.createElement('div');
    containerCount.classList.add('container-count-posts-likes');

    const divPosts = document.createElement('div');
    divPosts.classList.add('count');
    const textCountPosts = document.createElement('p');
    textCountPosts.classList.add('text-count')
    textCountPosts.textContent = 'Постов: ' + author.posts;
    divPosts.appendChild(textCountPosts);

    const divLikes = document.createElement('div');
    divLikes.classList.add('count');
    const textCountLikes = document.createElement('p');
    textCountLikes.classList.add('text-count');
    textCountLikes.textContent = 'Лайков: ' + author.likes;
    divLikes.appendChild(textCountLikes);

    containerCount.appendChild(divPosts);
    containerCount.appendChild(divLikes);

    divAuthor.appendChild(containerCount);
    return divAuthor;
}