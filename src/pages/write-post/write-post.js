import { getCommunityList } from "../communities/community/community.js";
import { requestSearchAddress } from "../address/address.js";

import { handleError } from "../../utils/utils.js";

let lastGuidAddress = null;
let addressHistory = [];

async function sendRequestCreateUserPost(data) {
    const currentToken = localStorage.getItem('token');
    const response = await fetch('https://blog.kreosoft.space/api/post', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const data = await response.json();
        alert('Пост отправлен');
        return data;
    }
    else {
        if (response.status === 400) {
            const errorData = await response.json();
            console.log(errorData);
            const errorElement = document.getElementById("error");

            const errorDataList = errorData.errors;
            let errorMessages = '';

            Object.entries(errorDataList).forEach(([key, messages]) => {
                messages.forEach(message => {
                    errorMessages += `${message}\n`;
                });
            });

            errorElement.textContent = errorMessages;
        }
        handleError(response);
    }
}

export async function createPost() {
    const formData = new FormData(document.querySelector('.form-write-new-post'));

    const title = formData.get('post-name');
    const description = formData.get('post-text');
    const readingTime = formData.get('post-read-time');
    const image = formData.get('post-picture-link') || null;
    const tags = formData.getAll('select-search-tag');

    const addressId = lastGuidAddress;

    const success = await sendRequestCreateUserPost({
        title,
        description,
        readingTime,
        image,
        addressId,
        tags
    });

    if (success) {
        const form = document.querySelector('.form-write-new-post');
        form.reset();
    }
}

export async function pushGroups() {
    try {
        const groups = await getCommunityList();
        const select = document.getElementById('post-group');

        select.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = null;
        defaultOption.textContent = 'Без группы';
        select.appendChild(defaultOption);

        if (groups && Array.isArray(groups)) {
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name;
                select.appendChild(option);
            });
        }
    }

    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); }
}

function createAddressField(options) {
    const containerField = document.createElement('div');
    containerField.classList.add('input-item');

    const label = document.createElement('label');
    label.textContent = options[0].objectLevelText;

    const select = document.createElement('select');
    select.classList.add('address-select');

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.setAttribute('guid', options[0].objectGuid)
    defaultOption.textContent = 'Не выбран';
    select.appendChild(defaultOption);

    options.forEach(option => {
        const optionHtml = document.createElement('option');
        optionHtml.value = option.objectId;
        optionHtml.setAttribute('guid', option.objectGuid);
        optionHtml.textContent = option.text;
        select.appendChild(optionHtml);
    });

    containerField.appendChild(label);
    containerField.appendChild(select);

    return containerField;
}


export async function createSearchAddressFields() {
    const addressContainer = document.getElementById('container-address');

    const initialField = createAddressField(await requestSearchAddress());
    addressContainer.appendChild(initialField);

    $(initialField.querySelector('select')).select2({
        ajax: {
            url: 'https://blog.kreosoft.space/api/address/search',
            dataType: 'json',
            delay: 250,
            data: (params) => ({
                parentObjectId: 0,
                query: params.term
            }),
            processResults: (data) => ({
                results: data.map((item) => ({
                    id: item.objectId,
                    text: item.text,
                    guid: item.objectGuid,
                    objectLevel: item.objectLevel
                }))
            }),
            cache: true,
        },
        minimumInputLength: 1,
        placeholder: 'Не выбран',
        allowClear: true
    });

    $(addressContainer).on('select2:select', async function (e) {
        //e - {type: 'select2:select', params: {…data}, target …} e.target - select, params.data - выбранный объект, 
        const target = e.target;
        const selectedLevel = e.params.data.objectLevel;
        const selectedId = e.params.data.id;
        lastGuidAddress = e.params.data.guid;
        addressHistory.push(lastGuidAddress);

        if (selectedId) {
            let sibling = target.parentElement.nextSibling;
            while (sibling) {
                sibling.remove();
                sibling = target.parentElement.nextSibling;
            }

            if (selectedLevel === 'Building') {
                return;
            }

            const nextField = createAddressField(await requestSearchAddress(selectedId));
            addressContainer.appendChild(nextField);

            $(nextField.querySelector('select')).select2({
                ajax: {
                    url: 'https://blog.kreosoft.space/api/address/search',
                    dataType: 'json',
                    delay: 250,
                    data: (params) => ({
                        parentObjectId: selectedId,
                        query: params.term
                    }),
                    processResults: (data) => ({
                        results: data.map((item) => ({
                            id: item.objectId,
                            text: item.text,
                            guid: item.objectGuid,
                            objectLevel: item.objectLevel,
                        }))
                    }),
                    cache: true,
                },
                minimumInputLength: 1,
                placeholder: 'Не выбран',
                allowClear: true
            });
        }
    });

    $(addressContainer).on('select2:clear', '.address-select', function (e) {
        if (addressHistory.length > 0) {
            addressHistory.pop();
            lastGuidAddress = addressHistory[addressHistory.length - 1] || null;
        }

        const target = e.target;
        let sibling = target.parentElement.nextSibling;

        while (sibling) {
            sibling.remove();
            sibling = target.parentElement.nextSibling;
        }
    });
}