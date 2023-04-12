let inputField = document.querySelector('.search')
let container = document.querySelector('.container')
let list = document.querySelector('.repositories')

inputField.addEventListener('input', debounce(typeKeyword, 300))

async function typeKeyword() {
    let keyword = inputField.value
    if (container.querySelector('.error')) {
        container.querySelector('.error').remove()
    }
    if (keyword === '') {
        return clearSearchResults()
    }
    await searchRep(keyword)

        .then(repositories => {
            if (!repositories.items.length) {
                clearSearchResults()
                inputField.insertAdjacentHTML("afterend", '<span class="error">Такого репозитория нет</span>')
            } else {
                repositories.items.forEach((rep => showRepoList(rep)))
            }
            return list;
        })

        .then(listOfReps => {
            let arrOfReps = Array.from(listOfReps.children)
            arrOfReps.forEach(rep => rep.addEventListener('click', () => {
                return searchRep(rep.textContent)
                    .then(result => {
                        let repository = result.items.filter(item => item.name === rep.textContent)
                        addRepo(repository[0])
                        inputField.value = ''
                        clearSearchResults()
                        }
                    )
            }))
        })
        .catch(() => alert('Произошла ошибка, пожалуйста, перезагрузите страницу'))
}

async function searchRep(keyword) {
    let url = `https://api.github.com/search/repositories?q=${keyword}in:name&sort=stars&order=desc&per_page=5`
    let response = await fetch(url)
    clearSearchResults()
    return await response.json()
}

function debounce(fn, delay) {
    let timer
    return function (...args) {
        clearTimeout(timer)
        const cb = () => fn.apply(this, args)
        timer = setTimeout(cb, delay)
    }
}

function showRepoList(repository) {
    const item = document.createElement('li')
    item.classList.add('repositories__item')
    item.textContent = repository.name
    list.append(item)
}

function clearSearchResults() {
    let itemList = document.querySelectorAll('.repositories__item')
    itemList.forEach(item => item.remove())
}

function addRepo(rep) {
    let fragment = document.createDocumentFragment()
    let card = document.createElement('li')
    card.classList.add('card')
    let infoOfCard = document.createElement('div')
    infoOfCard.classList.add('card__info')
    let nameField = document.createElement('div')
    let ownerField = document.createElement('div')
    let starsField = document.createElement('div')
    let deleteImg = document.createElement('img')
    deleteImg.classList.add('card__delete')
    deleteImg.src = 'close.svg'
    nameField.textContent = `Name: ${rep.name}`
    ownerField.textContent = `Author: ${rep.owner.login}`
    starsField.textContent = `Stars: ${rep.watchers}`
    infoOfCard.append(nameField)
    infoOfCard.append(ownerField)
    infoOfCard.append(starsField)
    card.append(infoOfCard)
    card.append(deleteImg)
    fragment.append(card)
    container.append(fragment)
    deleteImg.addEventListener('click', () => deleteImg.closest('.card').remove())
}