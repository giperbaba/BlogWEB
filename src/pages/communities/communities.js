import { getCommunityList } from "./community/community.js";
import { getRoleInCommunity } from "./community/community.js";
import { requestSubscribe } from "./community/community.js";
import { requestUnsubscribe } from "./community/community.js";
import { navigate } from "../general/general.js";

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
    nameCommunity.id = 'name-community';
    nameCommunity.textContent = community.name;
    nameCommunity.addEventListener('click', function(e) {
        navigate('community', null, community.id)
    });

    communityContainer.appendChild(nameCommunity);
    
    let button = null;
    switch (role) {
        case 'Subscriber' :
        case null:
        case 'Administrator': 
            button = document.createElement('button');
            button.classList.add('button');
            button.id = community.id;

            if (role == 'Subscriber' || role == 'Administrator') {
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

        case 'Unauthorized':
            button = document.createElement('button');
            button.classList.add('button');
            button.id = community.id;

            button.innerHTML = 'Подписаться';
            
            communityContainer.appendChild(button);

            button.addEventListener('click', async function(e) {
                alert('Please, authorize to subcribe');
            });
            break;
    }


    return communityContainer;
}