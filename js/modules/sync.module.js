(function() {
    R.on('state:change', (state) => {
        const { money, spents } = state
        localStorage.setItem('data', JSON.stringify({ money, spents }))
    })
})()