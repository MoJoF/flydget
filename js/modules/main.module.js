(function () {
    let receiveElement, summ, spents_table

    // Вычисление доходов и расходов
    const calculate = (money, spents) => {
        receiveElement = `${money} Р`
        summ = `${money - (spents.reduce((prev, next) => prev + next.summ, 0))} Р`
    }

    // Обновление страницы
    const refreshTable = (spents) => {
        spents_table.innerHTML = ""
        const fragment = new DocumentFragment()
        spents.forEach(spent => {
            const { title, summ, category, date } = spent
            const row = document.createElement('tr')

            const tdID = document.createElement('td')
            tdID.className = "small_text"
            tdID.textContent = title

            const tdTitle = document.createElement('td')
            tdTitle.className = "small_text"
            tdTitle.textContent = title

            const tdSumm = document.createElement('td')
            tdSumm.className = "small_text"
            tdSumm.textContent = summ

            const tdCategory = document.createElement('td')
            tdCategory.className = "small_text"
            tdCategory.textContent = category

            const tdDate = document.createElement('td')
            tdDate.className = "small_text"
            tdDate.textContent = date

            const tdButton = document.createElement('td')
            const delBtn = document.createElement('button')
            delBtn.className = 'delete'
            delBtn.textContent = 'Удалить'
            delBtn.addEventListener('click', function () {
                spents = spents.filter(s => s !== spent)
                R.emit('state:change', { money, spents })
            })
            tdButton.appendChild(delBtn)

            row.appendChild(tdID)
            row.appendChild(tdTitle)
            row.appendChild(tdSumm)
            row.appendChild(tdCategory)
            row.appendChild(tdDate)
            row.appendChild(tdButton)

            fragment.appendChild(row)
        });
        spents_table.appendChild(fragment)
    }

    R.on('state:change', (state) => {
        const { money, spents } = state
        calculate(money, spents)
        refreshTable(spents)
    })

    R.when('dom-loaded', () => {
        receiveElement = document.querySelector('#receive_summ')
        summ = document.querySelector('#summ')
        spents_table = document.querySelector('#spents_table')

        const add_spent = document.querySelector('button.dash__add_spent')
        add_spent.onclick = () => {
            R.emit('page:change', { title: 'add-receive' })
        }

        R.emit('state:change', { money, spents })
    })

    R.on('page:change', (page) => {
        const currentPage = document.querySelector('.dashboard-page')
        if (page.title === 'dashboard-page') currentPage.style.display = 'flex'
        else currentPage.style.display = 'none'
    })
})()