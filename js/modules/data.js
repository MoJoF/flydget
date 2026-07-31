var money = 0
var spents = [
    { id: 1, title: "Продукты", summ: 120, category: "База", date: new Date().toLocaleString() }
]

const saveData = localStorage.getItem('data')
if (saveData) {
    const parsed = JSON.parse(saveData)
    money = parsed.money
    spents = parsed.spents
}