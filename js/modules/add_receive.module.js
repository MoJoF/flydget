(function(){
    R.when('dom-loaded', () => {

    })

    R.on('page:change', (page) => {
        const currentPage = document.querySelector('.add-receive')
        if (page.title === 'add-receive') currentPage.style.display = 'flex'
        else currentPage.style.display = 'none'
    })
})()