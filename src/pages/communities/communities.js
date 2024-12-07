import { getCommunityList } from "./community/community.js";
import { getRoleInCommunity } from "./community/community.js";
import { requestSubscribe } from "./community/community.js";
import { requestUnsubscribe } from "./community/community.js";

export async function showCommunities() {
    const allCommunities = await getCommunityList();

    const communitiesContainer = document.getElementsByClassName('communities')[0];
    const currentToken = localStorage.getItem('token');
    allCommunities.forEach(async community => {
        let role = null;
        if (currentToken) {
            role = await getRoleInCommunity(community.id);
        }
        else {
            role = 'Unauthorized';
        }
        communitiesContainer.appendChild(getConcreteCommunityHtml(community, role));
    });
}

function getConcreteCommunityHtml(community, role) {    
    const communityContainer = document.createElement('a');
    communityContainer.classList.add('item-community');

    const nameCommunity = document.createElement('h3');
    nameCommunity.textContent = community.name;

    communityContainer.appendChild(nameCommunity);

    switch (role) {
        case 'Subscriber' :
        case null:
            const button = document.createElement('button');
            button.classList.add('button');
            button.id = community.id;

            if (role == 'Subscriber') {
                button.innerHTML = 'Отписаться';
                button.style.background = '#dc3545';
            }
            else {
                button.innerHTML = 'Подписаться';
            }
            
            communityContainer.appendChild(button);

            button.addEventListener('click', async function(e) {
                if (button.style.background === '#dc3545' || button.style.background == 'rgb(220, 53, 69)') {
                    await requestUnsubscribe(button.id);
                    button.style.background = '#0b6ffd';
                    button.innerHTML = 'Подписаться';
                }
                else {
                    await requestSubscribe(button.id);
                    button.style.background = '#dc3545';
                    button.innerHTML = 'Отписаться';
                }
            });
            break;

        case 'Administrator': 
        case 'Unauthorized':
            break;
    }


    return communityContainer;
}